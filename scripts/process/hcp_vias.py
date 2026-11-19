"""Fase 4: grandes vias do atlas HCP1065 (Yeh 2022, CC BY-SA 4.0) como superfícies dos feixes no espaço do Mímir.

1. Decodifica human.tt.gz (formato tt do DSI Studio: arquivo MAT v4 com "track", "cluster" e "trans_to_mni").
   Cada fibra: uint32 n (coordenadas), três int32 do primeiro ponto e n-3 deltas int8, tudo em 1/32 de voxel.
2. Agrupa os tratos de human.txt nos itens do atlas (tabela ITENS). Por item: reamostra as fibras a 0,5 mm,
   rasteriza numa grade de 0,5 mm em MNI, dilata 0,75 mm, gaussiana, marching cubes: a superfície do feixe.
3. MNI -> Mímir pela afim de mni_para_mimir.py (o HCP1065 está no ICBM 2009a; o MASSP no 2009b: mesmo sistema de
   coordenadas do MNI, com diferenças pequenas entre as versões do molde).

Saída: data/processed/hcp_vias.glb (um nó por item e lado). Depois: node scripts/process/comprimir.mjs <glb> 1
Uso: python -I scripts/process/hcp_vias.py
"""
import gzip
import io
import json
import sys
from pathlib import Path

import numpy as np
import scipy.io as sio
from scipy import ndimage
from skimage.measure import marching_cubes

sys.path.insert(0, str(Path(__file__).parent))
from comum import Malha, PROCESSADO, RAIZ, decimar, suavizar
from suit_cerebelo import aplicar, gravar_glb

RAW = RAIZ / "data" / "raw" / "hcp1065"
GRADE, DILATA, FACES_MAX = 0.5, 0.75, 8000
L, R = "L", "R"
ITENS = {
    "v_cs": ["ProjectionBrainstem_CorticospinalTract{}"],
    "v_cn": ["ProjectionBrainstem_CorticobulbarTract{}"],
    "v_lm": ["ProjectionBrainstem_MedialLemniscus{}"],
    "v_opt": ["ProjectionBasalGanglia_OpticRadiation{}"],
    "v_aud": ["ProjectionBasalGanglia_AcousticRadiation{}"],
    "hcp_corticopontino": ["ProjectionBrainstem_CorticopontineTract{}_Frontal", "ProjectionBrainstem_CorticopontineTract{}_Parietal", "ProjectionBrainstem_CorticopontineTract{}_Occipital"],
    "hcp_reticular": ["ProjectionBrainstem_ReticularTract{}"],
    "hcp_dentatorubrotalamico": ["ProjectionBrainstem_DentatorubrothalamicTract-lr", "ProjectionBrainstem_DentatorubrothalamicTract-rl", "ProjectionBrainstem_NonDecussatingDentatorubrothalamicTract{}"],
    "hcp_pcs": ["Cerebellum_SuperiorCerebellarPeduncle"], "hcp_pcm": ["Cerebellum_MiddleCerebellarPeduncle"], "hcp_pci": ["Cerebellum_InferiorCerebellarPeduncle{}"],
    "hcp_rad_talamica_ant": ["ProjectionBasalGanglia_ThalamicRadiation{}_Anterior"], "hcp_rad_talamica_sup": ["ProjectionBasalGanglia_ThalamicRadiation{}_Superior"],
    "hcp_rad_talamica_post": ["ProjectionBasalGanglia_ThalamicRadiation{}_Posterior"],
    "hcp_cc_forceps_menor": ["Commissure_CorpusCallosum_ForcepsMinor"], "hcp_cc_corpo": ["Commissure_CorpusCallosum_Body"],
    "hcp_cc_forceps_maior": ["Commissure_CorpusCallosum_ForcepsMajor"], "hcp_cc_tapete": ["Commissure_CorpusCallosum_Tapetum"],
    "hcp_com_anterior": ["Commissure_AnteriorCommissure_Frontal", "Commissure_AnteriorCommissure_Temporal", "Commissure_AnteriorCommissure_Occipital"],
    "hcp_fornix": ["ProjectionBasalGanglia_Fornix{}"],
    "hcp_cingulo": ["Association_Cingulum{}_FrontalParahippocampal", "Association_Cingulum{}_FrontalParietal", "Association_Cingulum{}_ParahippocampalParietal",
                    "Association_Cingulum{}_Parahippocampal", "Association_Cingulum{}_Parolfactory"],
    "hcp_fls": ["Association_Cingulum{}_SuperiorLongitudinalFasciculus1", "Association_SuperiorLongitudinalFasciculus{}_2", "Association_SuperiorLongitudinalFasciculus{}_3"],
    "hcp_arqueado": ["Association_ArcuateFasciculus{}"], "hcp_fli": ["Association_InferiorLongitudinalFasciculus{}"],
    "hcp_flmedio": ["Association_MiddleLongitudinalFasciculus{}"], "hcp_ffoi": ["Association_InferiorFrontoOccipitalFasciculus{}"],
    "hcp_uncinado": ["Association_UncinateFasciculus{}"], "hcp_capsula_extrema": ["Association_ExtremeCapsule{}"],
    "hcp_fpm": ["ProjectionBrainstem_MedialForebrainBundle{}"],
    "hcp_corticoestriatal": ["ProjectionBasalGanglia_CorticostriatalTract{}_Anterior", "ProjectionBasalGanglia_CorticostriatalTract{}_Posterior", "ProjectionBasalGanglia_CorticostriatalTract{}_Superior"],
    "hcp_alcas_nb": ["ProjectionBasalGanglia_AnsaLenticularis{}", "ProjectionBasalGanglia_FasciculusLenticularis{}", "ProjectionBasalGanglia_AnsaSubthalamica{}", "ProjectionBasalGanglia_FasciculusSubthalamicus{}"],
}


def ler_tratos():
    m = sio.loadmat(io.BytesIO(gzip.open(RAW / "human.tt.gz").read()))
    buf, clu = m["track"].ravel().tobytes(), m["cluster"].ravel()
    T = m["trans_to_mni"].ravel().reshape(4, 4)
    nomes = [l.strip() for l in (RAW / "human.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
    fibras, p = [], 0
    while p < len(buf):
        n = int(np.frombuffer(buf[p:p + 4], "<u4")[0]); p += 4
        x0 = np.frombuffer(buf[p:p + 12], "<i4").astype(float); p += 12
        d = np.frombuffer(buf[p:p + n - 3], "i1").astype(float).reshape(-1, 3); p += n - 3
        fibras.append(aplicar(T, np.vstack([x0, x0 + np.cumsum(d, 0)]) / 32.0))
    por_nome = {}
    for f, c in zip(fibras, clu):
        por_nome.setdefault(nomes[c], []).append(f)
    return por_nome


def reamostrar(f, passo):
    s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(f, axis=0), axis=1))]
    t = np.arange(0, s[-1] + 1e-6, passo)
    return np.c_[np.interp(t, s, f[:, 0]), np.interp(t, s, f[:, 1]), np.interp(t, s, f[:, 2])]


def superficie_feixe(fibras):
    pts = np.vstack([reamostrar(f, GRADE * 0.8) for f in fibras])
    o = pts.min(0) - 4
    ij = np.floor((pts - o) / GRADE).astype(int)
    occ = np.zeros(ij.max(0) + 9, bool); occ[tuple(ij.T)] = True
    sol = ndimage.distance_transform_edt(~occ) <= DILATA / GRADE
    campo = ndimage.gaussian_filter(sol.astype(np.float32), 0.8)
    v, f, _, _ = marching_cubes(campo, level=0.5)
    return v * GRADE + o, f[:, ::-1].copy()


def main():
    por_nome = ler_tratos()
    M = np.array(json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"])
    malhas, resumo, faltam = [], {}, []
    for item, modelos in ITENS.items():
        lados = [L, R] if any("{}" in m for m in modelos) else [None]
        for lado in lados:
            nomes = [m.format(lado) if lado else m for m in modelos]
            # tratos sem lado no nome (os dois dentatorrubrotalâmicos cruzados, a CCM, o PCS) entram só uma vez
            if lado == R: nomes = [n for n in nomes if n not in [m for m in modelos if "{}" not in m]]
            fib = [f for n in nomes for f in por_nome.get(n, [])]
            faltam += [n for n in nomes if n not in por_nome]
            if not fib: continue
            v, f = superficie_feixe(fib)
            m = Malha(item, aplicar(M, v), f, "Mímir (cm)", []); suavizar(m, 8)
            if len(m.faces) > FACES_MAX: decimar(m, FACES_MAX)
            no = f"{item}__{(lado or 'm').lower()}"
            malhas.append((no, m.vertices, m.faces, None)); resumo[no] = [len(fib), len(m.faces)]
            print(f"  {no:32s} {len(fib):4d} fibras  {len(m.faces):5d} triângulos")
    gravar_glb(PROCESSADO / "hcp_vias.glb", malhas)
    (PROCESSADO / "hcp_vias.json").write_text(json.dumps({"itens": resumo, "faltando": faltam}, indent=1), encoding="utf-8")
    print("faltando:", faltam)


if __name__ == "__main__":
    main()
