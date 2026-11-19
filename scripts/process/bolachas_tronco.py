"""Fase 2: bolachas do tronco nos 8 níveis clássicos, com o T1 de 250 µm do Lüsebrink (já em MNI) de fundo.

Eixo do tronco: a linha do aqueduto e do IV ventrículo do MASSP (de y -29, z -8 a y -46, z -46 em MNI), cerca de 24
graus da vertical; os cortes são perpendiculares a ele, como nos cortes clássicos do tronco. A posição de cada nível
vem dos marcos do MASSP (colículos, largura máxima do IV ventrículo = recessos laterais, fim do IV ventrículo = óbex)
e é uma escolha do Mímir, a conferir (REVISAR.md).

Saída em models/bolachas_tronco/: <nivel>.webp (T1, 0,1 mm por pixel), <nivel>_rotulos.png (índice do MASSP por
pixel, para o app desenhar contornos e responder ao clique) e bolachas_tronco.json (plano de cada nível em MNI e no
Mímir, tamanho e rótulos). Prévia com contornos: capturas/reestruturacao-fase-2/bolachas-tronco.png.

Uso: python -I scripts/process/bolachas_tronco.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import nibabel as nib
from PIL import Image
from scipy.ndimage import map_coordinates
from skimage.segmentation import find_boundaries

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ

SAIDA = RAIZ / "models" / "bolachas_tronco"
O, H = np.array([-30.0, -70.0, -80.0]), 0.25                                # origem RAS e voxel do recorte
LADO_MM, PX_MM = 50.0, 0.1                                                   # janela quadrada de 46 mm, 0,1 mm por pixel
EIXO = np.array([0.0, 17.0, 38.0]) / np.hypot(17, 38)                        # do bulbo para o mesencéfalo, em MNI
LINHA = lambda z: np.array([0.0, -29.0 + (z + 8.0) * 17.0 / 38.0, z])       # aqueduto / IV ventrículo
NIVEIS = [  # id, nome, ponto em MNI, deslocamento anterior do centro da janela (mm)
    ("colsup", "Mesencéfalo, nível do colículo superior", np.array([0.0, -31.3, -5.4]), 9),
    ("colinf", "Mesencéfalo, nível do colículo inferior", np.array([0.0, -35.6, -11.8]), 9),
    ("ponte_alta", "Ponte, parte alta (istmo)", LINHA(-20), 9),
    ("ponte_media", "Ponte, parte média", LINHA(-28), 9),
    ("ponte_baixa", "Ponte, parte baixa", LINHA(-36), 8),
    ("bulbo_oliva", "Bulbo, nível da oliva", LINHA(-44), 7),
    ("dec_lemnisco", "Bulbo, decussação dos lemniscos", LINHA(-51), 5),
    ("dec_piramide", "Bulbo, decussação das pirâmides", LINHA(-57), 4),
]
NOMES = {}
for l in (RAIZ / "data" / "raw" / "massp2" / "massp_2p0-label-list.txt").read_text(encoding="utf-8").splitlines():
    p = [q.strip() for q in l.replace(":", " : ", 1).split(":")] if l[:1].isdigit() else None
    if p and len(p) >= 4:
        NOMES[int(p[0])] = {"nome": p[1], "sigla": p[2], "lado": p[3]}


def amostrar(vol, centro, u, v, ordem):
    n = int(round(LADO_MM / PX_MM))
    s = (np.arange(n) - (n - 1) / 2) * PX_MM
    U, V = np.meshgrid(s, s[::-1])                                           # linha 0 = em cima (dorsal)
    pts = centro + U[..., None] * u + V[..., None] * v                         # RAS
    ijk = (pts - O) / H
    return map_coordinates(vol, ijk.reshape(-1, 3).T, order=ordem, mode="constant", cval=0).reshape(n, n)


def main():
    t1 = np.asarray(nib.load(str(PROCESSADO / "lusebrink_tronco_mni_250um.nii.gz")).dataobj).astype(np.float32)
    rot = np.asarray(nib.load(str(PROCESSADO / "massp_tronco_mni_250um.nii.gz")).dataobj).astype(np.float32)
    Mm = np.array(json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"])
    SAIDA.mkdir(parents=True, exist_ok=True)
    p1, p99 = np.percentile(t1[t1 > 0], [0.5, 99.8])
    # eixos do plano: u = direita do paciente na esquerda da tela, v = dorsal para cima (como os cortes do modelo)
    u = np.array([-1.0, 0.0, 0.0])
    v = np.cross(EIXO, [1.0, 0.0, 0.0]); v /= np.linalg.norm(v)
    if v[1] > 0: v = -v                                                      # dorsal (posterior) em cima, como os cortes do modelo
    meta, previas = [], []
    for nid, nome, ponto, frente in NIVEIS:
        centro = ponto - frente * v                                              # o centro fica à frente do IV ventrículo
        img = amostrar(t1, centro, u, v, 3)
        lab = np.rint(amostrar(rot, centro, u, v, 0)).astype(np.uint8)
        g = np.clip((img - p1) / (p99 - p1), 0, 1)
        Image.fromarray((g * 255).astype(np.uint8)).save(SAIDA / f"{nid}.webp", quality=88, method=6)
        Image.fromarray(lab).save(SAIDA / f"{nid}_rotulos.png", optimize=True)
        presentes = sorted(int(x) for x in np.unique(lab) if x)
        rgb = np.repeat((g * 255).astype(np.uint8)[..., None], 3, -1)
        for k in presentes:
            rgb[find_boundaries(lab == k, mode="inner")] = (255, 200, 0)
        previas.append(rgb[::2, ::2])
        a = lambda p: (Mm[:3, :3] @ p + Mm[:3, 3]).tolist()
        meta.append({"id": nid, "nome": nome, "centro_mni": centro.tolist(), "u_mni": u.tolist(), "v_mni": v.tolist(),
                     "centro_mimir": a(centro), "u_mimir": (Mm[:3, :3] @ u).tolist(), "v_mimir": (Mm[:3, :3] @ v).tolist(),
                     "lado_mm": LADO_MM, "px_mm": PX_MM, "rotulos": presentes})
        print(f"{nid:13s} centro MNI {np.round(centro, 1)}  rótulos {[NOMES.get(k, {}).get('sigla', k) for k in presentes]}")
    (SAIDA / "bolachas_tronco.json").write_text(json.dumps({
        "fonte_fundo": "lusebrink2021 (T1 250 µm, registro afim ao MNI2009b)", "fonte_rotulos": "massp2", "niveis": meta,
        "rotulos_massp": {str(k): v for k, v in NOMES.items()}}, indent=1, ensure_ascii=False), encoding="utf-8")
    linhas = [np.hstack(previas[i:i + 4]) for i in (0, 4)]
    cap = RAIZ / "capturas" / "reestruturacao-fase-2"; cap.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.vstack(linhas)).save(cap / "bolachas-tronco.png")
    tam = sum(f.stat().st_size for f in SAIDA.iterdir())
    print(f"models/bolachas_tronco: {tam / 1024:.0f} kB")


if __name__ == "__main__":
    main()
