"""Fase 6: artérias reais do TopBrain (paciente topcow_mr_025, angio-RM) no espaço do Mímir.

1. Extrai do zip a imagem (imagesTr_topbrain/topcow_mr_025_0000) e os rótulos v1 da angio-RM (42 artérias).
   O paciente 025 tem todos os rótulos do protocolo, menos a artéria calosa mediana (3rd-A2/A3, variante ausente).
2. Registro afim da angio-RM ao molde MNI 2009b (SimpleITK: rígido -> afim, informação mútua), como em lusebrink_mni.py.
3. Cada rótulo: marching cubes no recorte do rótulo, pontos levados do paciente ao MNI (inversa do registro) e do MNI
   ao Mímir (mni_para_mimir.py). Taubin leve; um nó por artéria e lado ("<id do atlas>__<lado>__<sigla>").
4. Calibre: raio médio de cada artéria pela transformada de distância do rótulo (mm), para a cor por calibre no app.

Saída: data/processed/topbrain_vasos.glb e models/topbrain_vasos.json (calibre e sigla de cada nó, pontos do polígono).
Uso: python -I scripts/process/topbrain_vasos.py
"""
import gzip
import json
import sys
import zipfile
from pathlib import Path

import numpy as np
import SimpleITK as sitk
from scipy import ndimage
from skimage.measure import marching_cubes

sys.path.insert(0, str(Path(__file__).parent))
from comum import Malha, PROCESSADO, RAIZ, suavizar
from suit_cerebelo import aplicar, gravar_glb

ZIP = RAIZ / "data" / "raw" / "topbrain" / "TopBrain_Data_Release_Batches1n2nTA36_081726.zip"
P = "TopBrain_Data_Release_Batches1n2nTA36_081726/"
PAC = "025"
MOLDE = RAIZ / "data" / "raw" / "mni_icbm152_2009b" / "tpl-MNI152NLin2009bAsym_res-1_T1w.nii.gz"
EXTR = RAIZ / "data" / "raw" / "topbrain" / "extraido"
# sigla do TopBrain -> item do atlas (o lado vem do prefixo R-/L-)
ITEM = {"BA": "basilar", "P1P2": "acp1", "ICA": "aci_cer", "M1": "acm", "Pcom": "pcom", "Acom": "acomA", "A1A2": "aca1", "A3": "pericalosa",
        "M2": "acm2", "M3": "acm2", "P3P4": "acp", "VA": "vertebral", "SCA": "sca", "AICA": "aica", "PICA": "pica", "AChA": "coroant", "OA": "a_oft"}
WILLIS = {"BA", "P1P2", "ICA", "M1", "Pcom", "Acom", "A1A2"}


def main():
    EXTR.mkdir(parents=True, exist_ok=True)
    z = zipfile.ZipFile(ZIP)
    for nome in (f"imagesTr_topbrain/topcow_mr_{PAC}_0000.nii.gz", f"labelsTr_topbrain_v1_mr/topcow_mr_{PAC}.nii.gz"):
        (EXTR / Path(nome).name).write_bytes(z.read(P + nome))
    rotulos = json.loads(z.read(P + "labelmap_jsons/labels_topbrain_v1_mr.json"))["labels"]
    img = sitk.ReadImage(str(EXTR / f"topcow_mr_{PAC}_0000.nii.gz"), sitk.sitkFloat32)
    lab = sitk.ReadImage(str(EXTR / f"topcow_mr_{PAC}.nii.gz"))
    molde = sitk.ReadImage(str(MOLDE), sitk.sitkFloat32)

    lps_ras = np.diag([-1.0, -1.0, 1.0, 1.0])
    T = lps_ras                                                              # paciente (LPS, mm) -> RAS (mm); os marcos fazem o resto
    L = sitk.GetArrayFromImage(lab).astype(np.int16)                         # (z, y, x)
    D = np.array(lab.GetDirection()).reshape(3, 3); S = np.array(lab.GetSpacing()); O = np.array(lab.GetOrigin())
    para_lps = lambda ijk: (ijk[:, ::-1] * S) @ D.T + O                       # índice (z, y, x) -> LPS
    malhas, info = [], {}
    for sigla_lado, valor in rotulos.items():
        if valor == 0: continue
        lado = "d" if sigla_lado.startswith("R-") else ("e" if sigla_lado.startswith("L-") else "m")
        sigla = sigla_lado[2:] if lado != "m" else sigla_lado
        if sigla not in ITEM: continue
        mk = L == valor
        if mk.sum() < 20: continue
        idx = np.argwhere(mk); a0 = np.maximum(idx.min(0) - 3, 0); a1 = idx.max(0) + 4
        sub = mk[a0[0]:a1[0], a0[1]:a1[1], a0[2]:a1[2]]
        raio = float(ndimage.distance_transform_edt(sub, sampling=S[::-1])[sub].mean() * 1.6)   # raio médio aproximado (mm)
        campo = ndimage.gaussian_filter(np.pad(sub, 2).astype(np.float32), 0.8)
        v, f, _, _ = marching_cubes(campo, level=0.45)
        v = aplicar(T, para_lps(v - 2 + a0))
        m = Malha(sigla_lado, v, f[:, ::-1].copy(), "Mímir (cm)", []); suavizar(m, 6)
        no = f"{ITEM[sigla]}__{lado}__{sigla}"
        malhas.append((no, m.vertices, m.faces, None))
        info[no] = {"sigla": sigla_lado, "item": ITEM[sigla], "lado": lado, "raio_mm": round(raio, 2), "willis": sigla in WILLIS,
                    "centro": np.round(m.vertices.mean(0), 2).tolist(), "faces": len(m.faces)}
        print(f"  {no:28s} raio {raio:.2f} mm  centro {np.round(m.vertices.mean(0), 2)}")
    # marcos do polígono de Willis no paciente (RAS, mm) e no atlas (alvos_willis.json, cm): semelhança por Umeyama
    from sereno_cerebelo import umeyama
    from scipy.spatial import cKDTree
    alvos = json.loads((RAIZ / "data" / "alvos_willis.json").read_text(encoding="utf-8"))
    Vx = {}
    for sigla_lado, valor in rotulos.items():
        if valor: Vx[sigla_lado] = aplicar(lps_ras, para_lps(np.argwhere(L == valor).astype(float)))
    def junta(a, b):                                                          # pontos de a a menos de 2 mm de b
        d, _ = cKDTree(Vx[b]).query(Vx[a]); return Vx[a][d < 2.0].mean(0)
    P1d = Vx["R-P1P2"]; P1e = Vx["L-P1P2"]
    topo_ba = Vx["BA"][Vx["BA"][:, 2] > np.percentile(Vx["BA"][:, 2], 95)].mean(0)
    base_ba = Vx["BA"][Vx["BA"][:, 2] < np.percentile(Vx["BA"][:, 2], 5)].mean(0)
    pac = [topo_ba, base_ba, Vx["Acom"].mean(0), junta("L-ICA", "L-M1"), junta("R-ICA", "R-M1"), junta("L-P1P2", "L-Pcom"), junta("R-P1P2", "R-Pcom")]
    md = lambda k, i: np.array(alvos[k][i])
    atl = [(md("acp1__e", 0) + md("acp1__d", 4)) / 2, md("basilar__m", 0), np.mean(alvos["acomA__m"], 0), md("aci_cer__e", 4), md("aci_cer__d", 4),
           (md("acp1__e", 4) + md("pcom__e", 0)) / 2, (md("acp1__d", 0) + md("pcom__d", 0)) / 2]
    s_, R_, t_ = umeyama(np.array(pac), np.array(atl))
    Mr = np.eye(4); Mr[:3, :3] = s_ * R_; Mr[:3, 3] = t_
    err = np.linalg.norm(aplicar(Mr, np.array(pac)) - np.array(atl), axis=1) * 10
    print("marcos (topo e base da basilar, comunicante anterior, fim das carótidas, junções P1-Pcom): erro em mm", np.round(err, 1), f"escala {s_:.4f} cm/mm")
    malhas = [(no, aplicar(Mr, v), f, c) for no, v, f, c in malhas]
    for no, v, f, _ in malhas: info[no]["centro"] = np.round(v.mean(0), 2).tolist()
    T = Mr @ T
    gravar_glb(PROCESSADO / "topbrain_vasos.glb", malhas)
    (RAIZ / "models" / "topbrain_vasos.json").write_text(json.dumps({"paciente": f"topcow_mr_{PAC}", "nos": info}, ensure_ascii=False, indent=1), encoding="utf-8")
    (PROCESSADO / "topbrain_registro.json").write_text(json.dumps({"paciente_lps_para_mimir": T.tolist()}, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
