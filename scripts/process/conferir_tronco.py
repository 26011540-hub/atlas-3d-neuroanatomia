"""Conferência visual do registro do Lüsebrink ao MNI: cortes axiais e sagital mediano do recorte do tronco,
com os contornos dos núcleos do MASSP 2.0 por cima. Grava em capturas/reestruturacao-fase-2/.

Uso: python -I scripts/process/conferir_tronco.py
"""
import sys
from pathlib import Path

import numpy as np
import nibabel as nib
from skimage import io
from skimage.segmentation import find_boundaries

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ

SAIDA = RAIZ / "capturas" / "reestruturacao-fase-2"
# rótulo do MASSP -> cor (núcleos do tronco e vizinhos)
CORES = {5: (230, 60, 60), 6: (230, 60, 60), 7: (255, 140, 0), 8: (255, 140, 0), 23: (255, 230, 0), 24: (255, 230, 0),
         26: (0, 200, 255), 27: (0, 200, 255), 28: (180, 90, 255), 29: (180, 90, 255), 32: (0, 230, 120), 33: (0, 230, 120),
         34: (60, 160, 255), 35: (60, 160, 255), 58: (255, 255, 255), 59: (255, 120, 220), 18: (120, 255, 255),
         3: (255, 0, 160), 4: (255, 0, 160), 60: (200, 200, 90), 61: (200, 200, 90), 62: (90, 200, 200), 63: (90, 200, 200)}


def corte(t1, rot, eixo, i):
    a = np.take(t1, i, axis=eixo).astype(np.float32); r = np.take(rot, i, axis=eixo)
    v = a[a > 0]; p = np.percentile(v, [1, 99.7]) if v.size else (0, 1)
    g = np.clip((a - p[0]) / (p[1] - p[0] + 1e-6), 0, 1)
    rgb = np.repeat((g * 255)[..., None], 3, -1).astype(np.uint8)
    for lab, cor in CORES.items():
        b = find_boundaries(r == lab, mode="inner")
        rgb[b] = cor
    return np.rot90(rgb)                                                       # anterior em cima, direita do paciente à esquerda da tela


def main():
    t1 = np.asarray(nib.load(str(PROCESSADO / "lusebrink_tronco_mni_250um.nii.gz")).dataobj)
    rot = np.asarray(nib.load(str(PROCESSADO / "massp_tronco_mni_250um.nii.gz")).dataobj).astype(np.int16)
    print("recorte:", t1.shape, "rótulos presentes:", sorted(set(np.unique(rot).tolist()) & set(CORES)))
    SAIDA.mkdir(parents=True, exist_ok=True)
    nz = t1.shape[2]
    imgs = []
    for frac in (0.92, 0.80, 0.68, 0.56, 0.44, 0.32):                          # de cima (mesencéfalo) para baixo (bulbo)
        k = int(frac * (nz - 1)); imgs.append(corte(t1, rot, 2, k))
    h = max(i.shape[0] for i in imgs)
    painel = np.hstack([np.pad(i, ((0, h - i.shape[0]), (0, 4), (0, 0))) for i in imgs])
    io.imsave(str(SAIDA / "conferencia-registro-axiais.png"), painel)
    sag = corte(t1, rot, 0, t1.shape[0] // 2)
    io.imsave(str(SAIDA / "conferencia-registro-sagital.png"), np.rot90(sag, -1))
    print("ok")


if __name__ == "__main__":
    main()
