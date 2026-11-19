"""Transformação afim MNI ICBM152 2009b (mm, RAS) -> espaço do Mímir (cm), pelas estruturas subcorticais.

Fonte: superfícies dos rótulos do MASSP 2.0 (caudado, putâmen, pálido, tálamo, amígdala, accumbens, ventrículos).
Alvo: as mesmas estruturas do atlas (Brain for Blender), como o atlas as mostra: o lado esquerdo levado ao Mímir por
paraAtlas e o direito como espelho do esquerdo (o atlas é simétrico). III e IV ventrículos: a malha inteira e o espelho.
ICP com correspondência por estrutura (cada ponto do MASSP só procura na estrutura correspondente) e ajuste afim
por mínimos quadrados, descartando os 10% piores pares a cada passo.

Grava data/processed/mni_para_mimir.json (matriz 4x4, erro por estrutura). Uso: python -I scripts/process/mni_para_mimir.py
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ, ler_volume
from sereno_cerebelo import fs_para_mimir_matriz, ler_obj
from suit_cerebelo import aplicar, superficie

MASSP = RAIZ / "data" / "raw" / "massp2" / "ahead-massp2_avg-maxlabel_decade-18to80.nii.gz"
OBJ = RAIZ / "dados_brainder" / "subcortical_obj" / "subcortical_obj"
# estrutura: (rótulos do MASSP à esquerda, à direita, arquivo do Brain for Blender do lado esquerdo ou da linha média)
PARES = {"caudado": ([1], [2], "Left-Caudate"), "putame": ([38], [39], "Left-Putamen"), "palido": ([9, 11], [10, 12], "Left-Pallidum"),
         "talamo": ([13], [14], "Left-Thalamus-Proper"), "amigdala": ([19], [20], "Left-Amygdala"), "accumbens": ([40], [41], "Left-Accumbens-area"),
         "ventr_lateral": ([15], [16], "Left-Lateral-Ventricle"), "v3": ([17], None, "3rd-Ventricle"), "v4": ([18], None, "4th-Ventricle")}


def afim_mq(a, b):
    """Afim 4x4 que leva a em b por mínimos quadrados."""
    A = np.c_[a, np.ones(len(a))]
    X, *_ = np.linalg.lstsq(A, b, rcond=None)
    M = np.eye(4); M[:3, :] = X.T
    return M


def main():
    vol, afim = ler_volume(MASSP)
    vol = np.rint(vol).astype(np.int16)
    Mfs = fs_para_mimir_matriz()
    rng = np.random.default_rng(0)
    fontes, alvos = {}, {}
    for nome, (esq, dir_, obj) in PARES.items():
        alvo = aplicar(Mfs, ler_obj(OBJ / f"{obj}.obj"))                     # cm do Mímir
        if dir_ is None:                                                      # linha média: a malha e o espelho
            alvo = np.vstack([alvo, alvo * [-1, 1, 1]])
            v, _ = superficie(np.isin(vol, esq), afim, 0.8); fontes[nome] = v; alvos[nome] = alvo
        else:
            for lado, rots, sinal in (("e", esq, 1), ("d", dir_, -1)):
                v, _ = superficie(np.isin(vol, rots), afim, 0.8)
                fontes[f"{nome}_{lado}"] = v
                alvos[f"{nome}_{lado}"] = alvo * [sinal, 1, 1]               # direito = espelho do esquerdo
    for k in fontes:
        if len(fontes[k]) > 4000: fontes[k] = fontes[k][rng.choice(len(fontes[k]), 4000, replace=False)]
    arvores = {k: cKDTree(a) for k, a in alvos.items()}

    # início: eixos do MNI (RAS) para o Mímir como em paraAtlas, com escala e translação pelos centroides
    S = np.vstack(list(fontes.values())); T = np.vstack(list(alvos.values()))
    M = Mfs.copy(); M[:3, :3] *= 1.0
    c = aplicar(M, S).mean(0); M[:3, 3] += T.mean(0) - c
    for it in range(60):
        pa, pb = [], []
        for k, s in fontes.items():
            q = aplicar(M, s); d, i = arvores[k].query(q); pa.append(s); pb.append(alvos[k][i])
        a, b = np.vstack(pa), np.vstack(pb)
        d = np.linalg.norm(aplicar(M, a) - b, axis=1); ok = d < np.percentile(d, 90)
        M = afim_mq(a[ok], b[ok])
    erros = {}
    for k, s in fontes.items():
        d, _ = arvores[k].query(aplicar(M, s)); erros[k] = round(float(d.mean() * 10), 2)
    todos = np.concatenate([arvores[k].query(aplicar(M, s))[0] for k, s in fontes.items()]) * 10
    esc = np.linalg.svd(M[:3, :3], compute_uv=False)
    print("erro médio por estrutura (mm):", erros)
    print(f"erro médio geral {todos.mean():.2f} mm (p95 {np.percentile(todos, 95):.2f}); escalas (cm por mm) {np.round(esc, 4)}")
    (PROCESSADO / "mni_para_mimir.json").write_text(json.dumps({
        "fonte": "MASSP 2.0 (MNI2009b), rótulos subcorticais", "alvo": "Brain for Blender no espaço do Mímir (esquerdo e espelho)",
        "matriz_4x4": M.tolist(), "erro_medio_mm": float(todos.mean()), "erro_p95_mm": float(np.percentile(todos, 95)),
        "erro_por_estrutura_mm": erros, "escalas_cm_por_mm": esc.tolist()}, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
