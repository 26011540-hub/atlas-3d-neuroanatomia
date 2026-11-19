"""Fase 1: córtex cerebelar do cerebmap20 (Sereno et al. 2020) no espaço do Mímir, em níveis de detalhe.

1. Lê surf/rh.pial (FreeSurfer). O prefixo "rh" cobre os dois hemisférios do cerebelo.
2. Escala real: as coordenadas do FreeSurfer estão em 0,50 mm por voxel, mas os voxels nativos são de 0,19 mm
   (README do cerebmap20 e rescale2actual.tcl): fator 0,19/0,50 = 0,38.
3. Registro de semelhança (rotação, translação e uma escala) ao cerebelo que o atlas já usa (Brain for Blender,
   Left/Right-Cerebellum-Cortex, espaço de superfície do FreeSurfer, mm). Como o alvo é liso e o Sereno tem as
   folhas, as correspondências vão do alvo para o ponto mais próximo do Sereno (as cristas das folhas tocam o alvo).
   Início por eixos principais (PCA), testando as 4 orientações de mesmo sentido; depois ICP com Umeyama.
4. Do espaço do FreeSurfer do Brain for Blender para o espaço do Mímir (cm), com a mesma transformação de
   scripts/converter_brainder.mjs (paraAtlas).
5. Níveis de detalhe: "folhas" (alta resolução) e "estudo" (menos triângulos, suavizado). Grava GLB em data/processed/
   e a transformação e as medidas de erro em data/processed/sereno_registro.json.

Uso: python scripts/process/sereno_cerebelo.py
"""
import json
import tarfile
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

from comum import Malha, PROCESSADO, RAIZ, decimar, exportar_glb, ler_superficie_freesurfer, suavizar

ESCALA_REAL = 0.19 / 0.50
LODS = {"folhas": 700_000, "estudo": 160_000}
# nível estudo: envoltória por volume (a suavização direta da pial esfarrapa as folhas, que são dobras profundas)
VOXEL_MM = 0.4                 # lado do voxel, em mm de escala real
FECHAR_MM = 1.6                # fechamento morfológico: fecha os sulcos entre as folhas (até cerca de 3 mm de abertura)
SUAVIZAR_ESTUDO = 15           # iterações de Taubin depois do marching cubes (só tira o degrau dos voxels)
ALVO_OBJ = [RAIZ / "dados_brainder" / "subcortical_obj" / "subcortical_obj" / f"{l}-Cerebellum-Cortex.obj" for l in ("Left", "Right")]
# mesma transformação de scripts/converter_brainder.mjs: FreeSurfer (mm, RAS) -> Mímir (cm; X esquerda, Y superior, Z anterior)
GIRO_X, OY, OZ, OX = np.deg2rad(-10.0), 1.6, 0.9, -0.1


def ler_obj(caminho: Path) -> np.ndarray:
    v = [list(map(float, l.split()[1:4])) for l in caminho.read_text(encoding="latin1").splitlines() if l.startswith("v ")]
    return np.asarray(v)


def fs_para_mimir_matriz() -> np.ndarray:
    """Matriz 4x4 de paraAtlas (mm do FreeSurfer -> cm do Mímir)."""
    c, s = np.cos(GIRO_X), np.sin(GIRO_X)
    eixos = np.array([[-0.1, 0, 0], [0, 0, 0.1], [0, 0.1, 0]])     # X=-x/10, Y=z/10, Z=y/10
    giro = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    M = np.eye(4); M[:3, :3] = giro @ eixos; M[:3, 3] = [OX, OY, OZ]
    return M


def umeyama(src: np.ndarray, dst: np.ndarray):
    """Semelhança (s, R, t) que leva src a dst por mínimos quadrados."""
    ms, md = src.mean(0), dst.mean(0)
    a, b = src - ms, dst - md
    U, S, Vt = np.linalg.svd(b.T @ a / len(src))
    D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt
    s = (S * np.diag(D)).sum() / a.var(0).sum()
    return s, R, md - s * R @ ms


def icp(src: np.ndarray, alvo: np.ndarray, M0: np.ndarray, iters=40):
    """Correspondência do alvo para o src (já transformado por M); devolve M (src -> alvo) e o erro médio."""
    M = M0.copy()
    for _ in range(iters):
        cur = src @ M[:3, :3].T + M[:3, 3]
        d, idx = cKDTree(cur).query(alvo)
        keep = d < np.percentile(d, 90)                         # descarta os 10% piores (pontas, bordas)
        s, R, t = umeyama(src[idx[keep]], alvo[keep])
        M = np.eye(4); M[:3, :3] = s * R; M[:3, 3] = t
    cur = src @ M[:3, :3].T + M[:3, 3]
    d, _ = cKDTree(cur).query(alvo)
    return M, float(np.mean(d)), float(np.percentile(d, 95))


def envoltoria(v: np.ndarray, f: np.ndarray, nome: str, hist: list) -> Malha:
    """Superfície lisa do cerebelo: rasteriza a pial (vértices e centros dos triângulos) numa grade, fecha os sulcos
    entre as folhas (dilatação e erosão pela distância euclidiana), preenche o interior e tira a isosuperfície."""
    from scipy import ndimage
    from skimage.measure import marching_cubes
    pts = np.vstack([v, v[f].mean(1)])
    r = FECHAR_MM / VOXEL_MM
    pad = int(np.ceil(r)) + 3
    o = pts.min(0) - pad * VOXEL_MM
    ij = np.floor((pts - o) / VOXEL_MM).astype(np.int32)
    occ = np.zeros(ij.max(0) + pad + 1, dtype=bool)
    occ[ij[:, 0], ij[:, 1], ij[:, 2]] = True
    dil = ndimage.distance_transform_edt(~occ) <= r
    sol = ndimage.binary_fill_holes(dil)
    clo = ndimage.distance_transform_edt(sol) > r
    clo = ndimage.binary_fill_holes(clo)
    rot, n = ndimage.label(clo)
    if n > 1:                                                   # fica só o maior pedaço
        tam = np.bincount(rot.ravel()); tam[0] = 0; clo = rot == tam.argmax()
    print(f"  envoltória: grade {occ.shape}, {clo.mean() * 100:.1f}% do volume ocupado, {n} componente(s)")
    campo = ndimage.gaussian_filter(clo.astype(np.float32), 1.0)
    vv, ff, _, _ = marching_cubes(campo, level=0.5)
    vv = vv * VOXEL_MM + o
    h = hist + [f"envoltória por volume: voxel {VOXEL_MM} mm, fechamento morfológico de {FECHAR_MM} mm, preenchimento, "
                f"gaussiana de 1 voxel, marching cubes (scikit-image)"]
    # o marching cubes orienta os triângulos para o lado de valor maior (o interior): inverte para a normal apontar para fora
    return Malha(nome, vv, ff[:, ::-1].astype(np.int64).copy(), "cerebmap20, escala real", h)


def main():
    tgz = RAIZ / "data" / "raw" / "sereno2020" / "cerebmap20.tgz"
    pasta = tgz.parent / "cerebmap20"
    if not (pasta / "surf" / "rh.pial").exists():
        with tarfile.open(tgz) as t:
            membros = [m for m in t.getmembers() if "/surf/" in m.name or "/scripts/" in m.name]
            t.extractall(tgz.parent, members=membros, filter="data")
    pial = ler_superficie_freesurfer(pasta / "surf" / "rh.pial", "cerebelo_sereno")
    print("cerebmap20 rh.pial:", len(pial.vertices), "vértices,", len(pial.faces), "triângulos")

    v = pial.vertices * ESCALA_REAL
    alvo = np.vstack([ler_obj(p) for p in ALVO_OBJ])
    rng = np.random.default_rng(0)
    amostra = v[rng.choice(len(v), 60_000, replace=False)]
    alvo_s = alvo[rng.choice(len(alvo), min(30_000, len(alvo)), replace=False)]

    # início: eixos principais, as 4 orientações próprias; escala pela raiz da variância
    def pca(p):
        c = p.mean(0); _, _, Vt = np.linalg.svd(p - c, full_matrices=False); return c, Vt
    cs, Vs = pca(amostra); ct, Vt_ = pca(alvo_s)
    melhor = None
    for sx, sy in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
        F = np.diag([sx, sy, sx * sy])
        R0 = Vt_.T @ F @ Vs
        s0 = np.sqrt((alvo_s - ct).var(0).sum() / (amostra - cs).var(0).sum())
        M0 = np.eye(4); M0[:3, :3] = s0 * R0; M0[:3, 3] = ct - s0 * R0 @ cs
        M, erro, p95 = icp(amostra, alvo_s, M0)
        print(f"  orientação {sx:+d}{sy:+d}: erro médio {erro:.2f} mm (p95 {p95:.2f})")
        if melhor is None or erro < melhor[1]:
            melhor = (M, erro, p95)
    Mreg, erro, p95 = melhor
    escala_reg = float(np.cbrt(np.linalg.det(Mreg[:3, :3])))
    Mfs = fs_para_mimir_matriz()
    Mtot = Mfs @ Mreg                     # (mm do Sereno em escala real) -> cm do Mímir
    # o atlas é simétrico (o hemisfério direito é o esquerdo espelhado, com a linha média em X = 0); o cerebelo do
    # Brain for Blender usado no registro não é: leva o centro do Sereno (entre os extremos laterais) para X = 0
    xs = v[::50] @ Mtot[0, :3] + Mtot[0, 3]
    desvio_x = float((xs.min() + xs.max()) / 2)
    Mtot[0, 3] -= desvio_x
    print(f"  centralização na linha média do atlas: {desvio_x * 10:+.1f} mm em X")

    hist_reg = (f"escala real x{ESCALA_REAL:.2f} (0,19/0,50 mm); registro de semelhança ao cerebelo do Brain for Blender "
                f"(PCA + ICP/Umeyama, escala {escala_reg:.3f}, erro médio {erro:.2f} mm, p95 {p95:.2f} mm); "
                f"FreeSurfer -> espaço do Mímir (scripts/converter_brainder.mjs); centralização na linha média do atlas ({desvio_x * 10:+.1f} mm em X)")
    PROCESSADO.mkdir(parents=True, exist_ok=True)
    (PROCESSADO / "sereno_registro.json").write_text(json.dumps({
        "escala_real": ESCALA_REAL, "matriz_registro_mm": Mreg.tolist(), "escala_registro": escala_reg,
        "erro_medio_mm": erro, "erro_p95_mm": p95, "matriz_fs_para_mimir": Mfs.tolist(), "centralizacao_x_cm": desvio_x, "matriz_total": Mtot.tolist(),
        "alvo": [str(p.relative_to(RAIZ)) for p in ALVO_OBJ]}, indent=1), encoding="utf-8")

    import sys
    niveis = [a for a in sys.argv[1:] if a in LODS] or list(LODS)
    for nivel in niveis:
        alvo_f = LODS[nivel]
        if nivel == "estudo":
            m = envoltoria(v, pial.faces, "cerebelo_sereno", [hist_reg])
            suavizar(m, SUAVIZAR_ESTUDO)
            decimar(m, alvo_f)
        else:
            m = Malha("cerebelo_sereno", v.copy(), pial.faces.copy(), "cerebmap20, escala real", [hist_reg])
            decimar(m, alvo_f)
        m.vertices = m.vertices @ Mtot[:3, :3].T + Mtot[:3, 3]
        m.espaco = "Mímir (cm)"
        destino = exportar_glb([m], PROCESSADO / f"cerebelo_sereno_{nivel}.glb", mm_para_unidade=1.0)
        print(nivel, len(m.faces), "triângulos ->", destino)
        (PROCESSADO / f"cerebelo_sereno_{nivel}.processamento.txt").write_text("; ".join(m.historico), encoding="utf-8")


if __name__ == "__main__":
    main()
