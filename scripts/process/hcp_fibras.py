"""Fase 4 (refeita): fibras do HCP1065 como linhas, para o app desenhar a tratografia como ela é mostrada nos atlas.

A primeira versão (hcp_vias.py) fazia a superfície em volta de cada feixe; perto do córtex os feixes se abrem em
centenas de pontas e a superfície ficava parecendo giros e sulcos deformados. Aqui vão as próprias fibras:
por item e lado, até MAX_FIBRAS fibras (sorteadas com semente fixa, para cobrir o feixe todo), reamostradas a
PASSO_MM, levadas ao Mímir pela afim de mni_para_mimir.py e quantizadas em int16 (1/2000 cm, 5 µm).

Saída: models/hcp_fibras.bin (int16 x, y, z) e models/hcp_fibras.json (item, lado, início e número de pontos de cada
fibra). Uso: python -I scripts/process/hcp_fibras.py
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ
from hcp_vias import ITENS, L, R, ler_tratos, reamostrar
from suit_cerebelo import aplicar

MAX_FIBRAS, PASSO_MM, ESCALA = 160, 2.0, 2000.0


def main():
    por_nome = ler_tratos()
    M = np.array(json.loads((PROCESSADO / "mni_para_mimir.json").read_text(encoding="utf-8"))["matriz_4x4"])
    rng = np.random.default_rng(0)
    pontos, indice, resumo = [], [], {}
    total = 0
    for item, modelos in ITENS.items():
        lados = [L, R] if any("{}" in m for m in modelos) else [None]
        sem_lado = [m for m in modelos if "{}" not in m]
        for lado in lados:
            nomes = [m.format(lado) if lado else m for m in modelos]
            if lado == R: nomes = [n for n in nomes if n not in sem_lado]
            fib = [f for n in nomes for f in por_nome.get(n, [])]
            if not fib: continue
            if len(fib) > MAX_FIBRAS: fib = [fib[i] for i in sorted(rng.choice(len(fib), MAX_FIBRAS, replace=False))]
            fibras = []
            for f in fib:
                p = aplicar(M, reamostrar(f, PASSO_MM))
                if len(p) < 2: continue
                fibras.append([total, len(p)]); pontos.append(p); total += len(p)
            no = f"{item}__{(lado or 'm').lower()}"
            indice.append({"no": no, "item": item, "lado": (lado or "m").lower(), "fibras": fibras})
            resumo[no] = len(fibras)
    P = np.rint(np.vstack(pontos) * ESCALA).astype("<i2")
    (RAIZ / "models" / "hcp_fibras.bin").write_bytes(P.tobytes())
    (RAIZ / "models" / "hcp_fibras.json").write_text(json.dumps({"escala": ESCALA, "pontos": int(total), "grupos": indice}, separators=(",", ":")), encoding="utf-8")
    print(f"{total} pontos, {sum(resumo.values())} fibras, {P.nbytes / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
