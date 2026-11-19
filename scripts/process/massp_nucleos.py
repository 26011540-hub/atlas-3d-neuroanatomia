"""Fase 2: núcleos do tronco e vizinhos do MASSP 2.0 (MNI2009b) como malhas no espaço do Mímir.

Para cada rótulo: gaussiana de 0,8 voxel (0,5 mm), marching cubes, MNI -> Mímir pela afim de mni_para_mimir.py,
Taubin leve. Um nó por lado, com o nome "<id do atlas>__<e|d|m>". Grava data/processed/massp_nucleos.glb.
Depois: node scripts/process/comprimir.mjs data/processed/massp_nucleos.glb 1

Uso: python -I scripts/process/massp_nucleos.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from comum import Malha, PROCESSADO, RAIZ, ler_volume, suavizar
from suit_cerebelo import aplicar, gravar_glb, superficie

MASSP = RAIZ / "data" / "raw" / "massp2" / "ahead-massp2_avg-maxlabel_decade-18to80.nii.gz"
# id do atlas: rótulos (esquerdo, direito) ou (linha média,)
NUCLEOS = {"snegra": (5, 6), "rubro": (7, 8), "subtal": (3, 4), "colinf": (32, 33), "colsup": (34, 35), "cgl": (60, 61), "cgm": (62, 63),
           "massp_atv": (23, 24), "massp_scp": (26, 27), "massp_ppn": (28, 29), "massp_habl": (36, 37), "massp_rafe_d": (58,), "massp_rafe_m": (59,)}


def main():
    vol, afim = ler_volume(MASSP)
    vol = np.rint(vol).astype(np.int16)
    M = np.array(json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"])
    malhas, resumo = [], {}
    for nid, rots in NUCLEOS.items():
        lados = ("m",) if len(rots) == 1 else ("e", "d")
        for r, lado in zip(rots, lados):
            v, f = superficie(vol == r, afim, 0.8)
            m = Malha(nid, aplicar(M, v), f, "Mímir (cm)", [])
            suavizar(m, 5)
            malhas.append((f"{nid}__{lado}", m.vertices, m.faces, None))
            resumo[f"{nid}__{lado}"] = len(m.faces)
    gravar_glb(PROCESSADO / "massp_nucleos.glb", malhas)
    print(resumo)


if __name__ == "__main__":
    main()
