"""Fase 6: territórios arteriais de Liu et al. 2023 (JHU) para o app pintar o córtex com as bordas reais.

Lê ARTERIAL1_2mm.nii.gz (MNI do FSL, 2 mm; 32 territórios, esquerdo e direito) e grava:
- models/jhu_territorios.bin: rótulos uint8 na ordem x mais rápido, depois y, depois z;
- models/jhu_territorios.json: dimensões, afim voxel -> MNI (mm), afim MNI -> Mímir (de mni_para_mimir.py),
  nomes dos territórios e a classe usada pelo app (ACA, ACM, ACP, ACI, VB).
Uso: python -I scripts/process/jhu_territorios.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ, ler_volume

PASTA = RAIZ / "data" / "raw" / "jhu_arterial" / "extraido" / "Arterial"
# classe do app por território (o atlas pinta 5 classes: ACA, ACM, ACP, ACI = corioidea anterior, VB = vertebrobasilar)
CLASSE = {"anterior_cerebral": "ACA", "medial_lenticulostriate": "ACM", "lateral_lenticulostriate": "ACM", "middle_cerebral": "ACM",
          "posterior_cerebral": "ACP", "posterior_choroidal": "ACP", "anteior_choroidal": "ACI", "anterior_choroidal": "ACI",
          "basilar": "VB", "superior_cerebellar": "VB", "inferior_cerebellar": "VB", "lateral_ventricle": None}


def main():
    vol, af = ler_volume(PASTA / "ARTERIAL1" / "ARTERIAL1_2mm.nii.gz")
    vol = np.rint(vol).astype(np.uint8)
    nomes = {}
    import re
    for m in re.finditer(r'<label index="(\d+)"[^>]*>([^<]*)</label>', (PASTA / "ARTERIAL1.xml").read_text(encoding="latin1")):
        k, n = int(m.group(1)), m.group(2).strip()
        if k == 0: continue
        cls = next((c for chave, c in CLASSE.items() if chave in n), None)
        nomes[k] = {"nome": n, "classe": cls}
    (RAIZ / "models" / "jhu_territorios.bin").write_bytes(np.ascontiguousarray(vol.transpose(2, 1, 0)).tobytes())
    M = json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"]
    (RAIZ / "models" / "jhu_territorios.json").write_text(json.dumps({
        "fonte": "jhu_arterial (ARTERIAL1, 2 mm)", "dim": list(vol.shape), "vox_para_mni": af.tolist(), "mni_para_mimir": M,
        "rotulos": nomes}, ensure_ascii=False), encoding="utf-8")
    print(vol.shape, len(nomes), "territórios;", sum(1 for v in nomes.values() if v["classe"]), "com classe")


if __name__ == "__main__":
    main()
