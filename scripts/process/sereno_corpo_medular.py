"""Reforma do cerebelo, Fase 2: corpo medular do cerebelo (substância branca, com os ramos da árvore da vida).

Fonte: surf/rh.white do cerebmap20 (Sereno et al. 2020), a superfície entre a substância cinzenta e a branca.
Mesma escala real (x0,38) e mesma transformação para o espaço do Mímir que o córtex (data/processed/sereno_registro.json,
matriz_total, gerada por scripts/process/sereno_cerebelo.py): as duas superfícies ficam encaixadas.
Decimação quádrica para ALVO triângulos. Saída: data/processed/cerebelo_sereno_branca.glb (depois comprimir.mjs).

Uso: python scripts/process/sereno_corpo_medular.py
"""
import json
import tarfile

import numpy as np

from comum import Malha, PROCESSADO, RAIZ, decimar, exportar_glb, ler_superficie_freesurfer

ESCALA_REAL = 0.19 / 0.50
ALVO = 300_000


def main():
    tgz = RAIZ / "data" / "raw" / "sereno2020" / "cerebmap20.tgz"
    pasta = tgz.parent / "cerebmap20"
    if not (pasta / "surf" / "rh.white").exists():
        with tarfile.open(tgz) as t:
            membros = [m for m in t.getmembers() if m.name.endswith("surf/rh.white")]
            t.extractall(tgz.parent, members=membros, filter="data")
    reg = json.loads((PROCESSADO / "sereno_registro.json").read_text(encoding="utf-8"))
    Mtot = np.asarray(reg["matriz_total"])
    w = ler_superficie_freesurfer(pasta / "surf" / "rh.white", "cb_corpo_medular")
    print("cerebmap20 rh.white:", len(w.vertices), "vértices,", len(w.faces), "triângulos")
    m = Malha("cb_corpo_medular", w.vertices * ESCALA_REAL, w.faces.copy(), "cerebmap20, escala real",
              [f"rh.white do cerebmap20; escala real x{ESCALA_REAL:.2f}; transformação matriz_total de sereno_registro.json (a mesma do córtex)"])
    decimar(m, ALVO)
    m.vertices = m.vertices @ Mtot[:3, :3].T + Mtot[:3, 3]
    m.espaco = "Mímir (cm)"
    destino = exportar_glb([m], PROCESSADO / "cerebelo_sereno_branca.glb", mm_para_unidade=1.0)
    print(len(m.faces), "triângulos ->", destino)
    (PROCESSADO / "cerebelo_sereno_branca.processamento.txt").write_text("; ".join(m.historico), encoding="utf-8")


if __name__ == "__main__":
    main()
