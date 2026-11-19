"""Fase 5: núcleos da base, sistema límbico, tálamo e hipotálamo de atlas abertos, como malhas no espaço do Mímir.

Fontes (todas em MNI 2009b, levadas ao atlas pela afim de mni_para_mimir.py):
- MASSP 2.0 (CC BY 4.0): caudado, putâmen, globo pálido externo e interno, accumbens, amígdala, claustro,
  hipocampo (CA1, CA2-3, giro denteado, subículo, pré-subículo), unco, fórnice, prosencéfalo basal colinérgico.
- Allen Human Reference Atlas 3D 2020 (CC BY 4.0): núcleos do tálamo e zona incerta.
- Neudorfer et al. 2020 (CC BY 4.0): núcleos do hipotálamo, corpos mamilares, trato mamilotalâmico, núcleo do leito
  da estria terminal, banda diagonal.
Por rótulo: gaussiana leve, marching cubes, Taubin; um nó por estrutura e lado ("<id>__<e|d>").

Saída: data/processed/fase5_nucleos.glb e data/processed/fase5_nucleos.json. Depois: comprimir.mjs <glb> 1
Uso: python -I scripts/process/fase5_nucleos.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from comum import Malha, PROCESSADO, RAIZ, ler_volume, suavizar
from suit_cerebelo import aplicar, gravar_glb, superficie

RAW = RAIZ / "data" / "raw"
# id do atlas: (fonte, rótulos esquerdos, rótulos direitos)
MASSP = {"caudado": ([1], [2]), "putame": ([38], [39]), "gpe": ([11], [12]), "gpi": ([9], [10]), "accumbens": ([40], [41]),
         "amigdala": ([19], [20]), "claustro": ([30], [31]), "hip_ca1": ([42], [43]), "hip_ca23": ([44], [45]), "giroden": ([46], [47]),
         "subiculo": ([50], [51]), "presubiculo": ([48], [49]), "unco": ([52], [53]), "prosenc_colinergico": ([56], [57])}
MASSP_MEIO = {"fornice": [25]}
# Allen: um rótulo só para os dois lados (o lado vem do sinal de x)
ALLEN = {"tal_anterior": [10392], "tal_ld": [10396], "tal_md": [10398], "tal_reuniens": [10403], "tal_lp": [10408], "tal_pulvinar": [10409],
         "tal_va": [10417], "tal_vl": [10420], "tal_vpl": [10424], "tal_vpm": [10425], "tal_cm": [10449], "tal_pf": [10450],
         "tal_linha_media": [13045], "zona_incerta": [10463]}
# Neudorfer: rótulo direito, esquerdo
NEUD = {"hip_preoptico": (19, 20), "hip_paraventricular": (21, 22), "hip_periventricular": ([23, 31], [24, 32]), "hip_lateral": (25, 26),
        "hip_ventromedial": (27, 28), "hip_arqueado": (29, 30), "hip_dorsomedial": (37, 38), "hip_supraoptico": (45, 46),
        "hip_supraquiasmatico": (47, 48), "hip_tuberomamilar": (49, 50), "hip_posterior": (51, 52), "hip_anterior": (53, 54),
        "mamilar": (9, 10), "f_mamtal": (7, 8), "nleito_estria": (33, 34), "banda_diagonal": (3, 4), "meynert": (35, 36)}


def lista(x):
    return x if isinstance(x, list) else [x]


def main():
    M = np.array(json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"])
    malhas, resumo = [], {}

    def add(nid, lado, mascara, afim, sigma=0.7):
        if not mascara.any(): return
        # recorta a caixa da estrutura (com margem) antes da gaussiana e do marching cubes: o volume inteiro é lento
        idx = np.argwhere(mascara); a0 = np.maximum(idx.min(0) - 4, 0); a1 = idx.max(0) + 5
        sub = mascara[a0[0]:a1[0], a0[1]:a1[1], a0[2]:a1[2]]
        af2 = afim.copy(); af2[:3, 3] = afim[:3, :3] @ a0 + afim[:3, 3]
        v, f = superficie(sub, af2, sigma)
        m = Malha(nid, aplicar(M, v), f, "Mímir (cm)", []); suavizar(m, 6)
        malhas.append((f"{nid}__{lado}", m.vertices, m.faces, None)); resumo[f"{nid}__{lado}"] = len(m.faces)

    vol, af = ler_volume(RAW / "massp2" / "ahead-massp2_avg-maxlabel_decade-18to80.nii.gz"); vol = np.rint(vol).astype(np.int16)
    for nid, (e, d) in MASSP.items():
        add(nid, "e", np.isin(vol, e), af); add(nid, "d", np.isin(vol, d), af)
    for nid, r in MASSP_MEIO.items():
        add(nid, "m", np.isin(vol, r), af)

    vol, af = ler_volume(RAW / "allen_hra3d" / "annotation_full.nii.gz"); vol = np.asarray(vol).astype(np.int64)
    x = (np.arange(vol.shape[0]) * af[0, 0] + af[0, 3])[:, None, None]          # coordenada x (RAS) de cada fatia
    for nid, r in ALLEN.items():
        mk = np.isin(vol, r)
        add(nid, "e", mk & (x < 0), af); add(nid, "d", mk & (x > 0), af)

    vol, af = ler_volume(RAW / "neudorfer2020" / "MNI152b_atlas_labels_0.25mm.nii.gz"); vol = np.rint(vol).astype(np.int16)
    for nid, (d, e) in NEUD.items():
        add(nid, "e", np.isin(vol, lista(e)), af, 1.0); add(nid, "d", np.isin(vol, lista(d)), af, 1.0)

    gravar_glb(PROCESSADO / "fase5_nucleos.glb", malhas)
    (PROCESSADO / "fase5_nucleos.json").write_text(json.dumps(resumo, indent=1), encoding="utf-8")
    print(len(malhas), "malhas,", sum(resumo.values()), "triângulos")


if __name__ == "__main__":
    main()
