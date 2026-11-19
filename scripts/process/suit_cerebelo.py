"""Fase 1: lóbulos do cerebelo do atlas SUIT (Diedrichsen et al. 2009) na malha real do Sereno.

1. Lê atl-Anatom_space-MNISym_dseg.nii (MNI ICBM152 2009c simétrico; rótulos 1-28 lóbulos, 29-34 núcleos).
2. Tira a superfície do cerebelo inteiro do atlas (todos os rótulos) por marching cubes.
3. Registro de semelhança (rotação, translação e uma escala; ICP com Umeyama) dessa superfície à envoltória do
   cerebelo do Sereno (nível estudo), levada de volta ao espaço de superfície do FreeSurfer. O início é a identidade
   (MNI e FreeSurfer são os dois RAS), o que impede espelhar esquerda e direita.
   Resultado: a transformação MNI (mm) -> Mímir (cm) do cerebelo, gravada em data/processed/suit_registro.json.
4. Cada vértice das malhas do Sereno (folhas e estudo) recebe o rótulo do voxel de lóbulo mais próximo. O rótulo vai
   no canal vermelho da cor do vértice (COLOR_0 = índice/255), que o gltfpack preserva; o app lê e converte em lóbulo.
5. Núcleos (denteado, interpósito, fastigial): uma malha por rótulo, em data/processed/cerebelo_suit_nucleos.glb.

Uso: python scripts/process/suit_cerebelo.py   (depois: node scripts/process/comprimir.mjs <glb> 1)
"""
import json

import numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes

from comum import PROCESSADO, RAIZ, ler_volume
from sereno_cerebelo import fs_para_mimir_matriz, icp

DSEG = RAIZ / "data" / "raw" / "diedrichsen2009" / "atl-Anatom_space-MNISym_dseg.nii"
NUCLEOS = {29: "suit_denteado_e", 30: "suit_denteado_d", 31: "suit_interposito_e", 32: "suit_interposito_d",
           33: "suit_fastigial_e", 34: "suit_fastigial_d"}


def aplicar(M, p):
    return p @ M[:3, :3].T + M[:3, 3]


def superficie(mascara, afim, sigma=1.0):
    campo = ndimage.gaussian_filter(np.pad(mascara, 3).astype(np.float32), sigma)
    v, f, _, _ = marching_cubes(campo, level=min(0.5, 0.5 * float(campo.max())))   # núcleos pequenos (fastigial) ficam abaixo de 0,5 depois da gaussiana
    v = aplicar(afim, v - 3)
    return v, f[:, ::-1].copy()          # normais para fora (o marching cubes aponta para o lado de valor maior)


def ler_glb(caminho):
    import trimesh
    cena = trimesh.load(str(caminho), force="scene", process=False)
    g = list(cena.geometry.values())[0]
    return np.asarray(g.vertices, dtype=np.float64), np.asarray(g.faces)


def gravar_glb(destino, nomes_malhas):
    import trimesh
    cena = trimesh.Scene()
    for nome, v, f, cores in nomes_malhas:
        m = trimesh.Trimesh(v, f, process=False)
        if cores is not None:
            m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=cores)
        cena.add_geometry(m, node_name=nome, geom_name=nome)
    cena.export(str(destino), file_type="glb")


def main():
    vol, afim = ler_volume(DSEG)
    vol = np.rint(vol).astype(np.int16)
    print("SUIT:", vol.shape, "voxel", np.round(np.abs(np.diag(afim)[:3]), 2), "rótulos", np.unique(vol)[1:].tolist())

    # 2-3: superfície do cerebelo do atlas -> envoltória do Sereno (no espaço do FreeSurfer, mm)
    vs, _ = superficie(vol > 0, afim, 1.2)
    Mfs = fs_para_mimir_matriz()
    ve, _ = ler_glb(PROCESSADO / "cerebelo_sereno_estudo.glb")            # cm do Mímir
    alvo = aplicar(np.linalg.inv(Mfs), ve)                                 # mm do FreeSurfer
    rng = np.random.default_rng(0)
    src = vs[rng.choice(len(vs), min(40_000, len(vs)), replace=False)]
    alv = alvo[rng.choice(len(alvo), min(40_000, len(alvo)), replace=False)]
    s0 = np.sqrt((alv - alv.mean(0)).var(0).sum() / (src - src.mean(0)).var(0).sum())
    M0 = np.eye(4); M0[:3, :3] *= s0; M0[:3, 3] = alv.mean(0) - s0 * src.mean(0)
    Mreg, erro, p95 = icp(src, alv, M0, iters=60)
    escala = float(np.cbrt(np.linalg.det(Mreg[:3, :3])))
    R = Mreg[:3, :3] / escala
    giro = float(np.degrees(np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))))
    print(f"registro MNI -> Sereno: escala {escala:.3f}, giro {giro:.1f} graus, erro médio {erro:.2f} mm (p95 {p95:.2f})")
    Mmni = Mfs @ Mreg                                                      # MNI (mm) -> Mímir (cm)

    # 4: rótulo de lóbulo por vértice, pelo voxel de lóbulo mais próximo
    ijk = np.argwhere((vol >= 1) & (vol <= 28))
    centros = aplicar(Mmni, aplicar(afim, ijk.astype(np.float64)))
    rot = vol[tuple(ijk.T)]
    arvore = cKDTree(centros)
    resumo = {}
    for nivel in ("folhas", "estudo"):
        arq = PROCESSADO / f"cerebelo_sereno_{nivel}.glb"
        v, f = ler_glb(arq)
        d, idx = arvore.query(v)
        lab = rot[idx].astype(np.uint8)
        cores = np.zeros((len(v), 4), np.uint8); cores[:, 0] = lab; cores[:, 3] = 255
        gravar_glb(arq, [("cerebelo_sereno", v, f, cores)])
        resumo[nivel] = {"distancia_media_cm": float(d.mean()), "distancia_p95_cm": float(np.percentile(d, 95)),
                         "vertices_por_rotulo": {int(k): int(c) for k, c in zip(*np.unique(lab, return_counts=True))}}
        print(f"  {nivel}: {len(v)} vértices rotulados; distância ao voxel {d.mean() * 10:.2f} mm (p95 {np.percentile(d, 95) * 10:.2f})")

    # 5: núcleos
    malhas = []
    for r, nome in NUCLEOS.items():
        v, f = superficie(vol == r, afim, 0.6)
        malhas.append((nome, aplicar(Mmni, v), f, None))
        print(f"  núcleo {nome}: {len(f)} triângulos")
    gravar_glb(PROCESSADO / "cerebelo_suit_nucleos.glb", malhas)

    (PROCESSADO / "suit_registro.json").write_text(json.dumps({
        "fonte": str(DSEG.relative_to(RAIZ)), "matriz_registro_mm": Mreg.tolist(), "escala": escala, "giro_graus": giro,
        "erro_medio_mm": erro, "erro_p95_mm": p95, "matriz_mni_para_mimir": Mmni.tolist(), "rotulos": resumo}, indent=1),
        encoding="utf-8")


if __name__ == "__main__":
    main()
