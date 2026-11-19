#!/usr/bin/env python3
"""Baixa de novo os dados brutos do Mímir a partir de data/sources.yaml.

Cada fonte pode ter uma lista `downloads` com: arquivo, url e, quando a fonte fornecer, sha256.
Os arquivos vão para data/raw/<id_da_fonte>/ (fora do git). Arquivos já baixados e com checksum
correto são pulados. Ao final grava data/raw/registro.json com a data de cada download.

Uso:
  python scripts/download_sources.py --listar
  python scripts/download_sources.py                 # todas as fontes com downloads
  python scripts/download_sources.py --fonte sereno2020

Estado: escrito na Fase 0 e AINDA NÃO EXECUTADO (o Python não estava instalado na máquina).
Requisitos: Python 3.10+ e PyYAML (pip install -r scripts/requirements.txt).
"""
import argparse
import datetime as dt
import hashlib
import json
import sys
import urllib.request
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "data" / "sources.yaml"
RAW = RAIZ / "data" / "raw"
AGENTE = "Mimir-atlas-downloader/1.0 (uso educacional)"   # sem dados pessoais no cabeçalho


def sha256(caminho: Path) -> str:
    h = hashlib.sha256()
    with caminho.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def baixar(url: str, destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    parcial = destino.with_suffix(destino.suffix + ".parcial")
    inicio = parcial.stat().st_size if parcial.exists() else 0
    req = urllib.request.Request(url, headers={"User-Agent": AGENTE, **({"Range": f"bytes={inicio}-"} if inicio else {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        if inicio and r.status != 206:      # o servidor não aceitou continuar: recomeça
            inicio = 0
        total = int(r.headers.get("Content-Length") or 0) + inicio
        with parcial.open("ab" if inicio else "wb") as f:
            baixado = inicio
            while True:
                bloco = r.read(1 << 20)
                if not bloco:
                    break
                f.write(bloco)
                baixado += len(bloco)
                if total:
                    print(f"\r  {baixado / 1e6:8.1f} / {total / 1e6:.1f} MB", end="", flush=True)
    print()
    parcial.replace(destino)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fonte", help="baixar só esta fonte (id do manifesto)")
    ap.add_argument("--listar", action="store_true", help="só listar o que seria baixado")
    a = ap.parse_args()

    man = yaml.safe_load(MANIFESTO.read_text(encoding="utf-8"))
    alvo = [f for f in man["fontes"] if f.get("downloads") and (not a.fonte or f["id"] == a.fonte)]
    if a.fonte and not alvo:
        print(f"fonte '{a.fonte}' sem downloads no manifesto", file=sys.stderr)
        return 1

    registro_arq = RAW / "registro.json"
    registro = json.loads(registro_arq.read_text(encoding="utf-8")) if registro_arq.exists() else {}
    falhas = []
    for f in alvo:
        for d in f["downloads"]:
            destino = RAW / f["id"] / d["arquivo"]
            print(f"[{f['id']}] {d['arquivo']}  <-  {d['url']}")
            if a.listar:
                continue
            esperado = d.get("sha256")
            if destino.exists() and (not esperado or sha256(destino) == esperado):
                print("  já baixado")
                continue
            try:
                baixar(d["url"], destino)
            except Exception as e:  # link quebrado, exige login, sem rede: não substituir por outra coisa
                falhas.append(f"{f['id']}/{d['arquivo']}: {e}")
                print(f"  FALHOU: {e}")
                continue
            if esperado and sha256(destino) != esperado:
                falhas.append(f"{f['id']}/{d['arquivo']}: checksum diferente do manifesto")
                print("  CHECKSUM DIFERENTE")
                continue
            registro[f"{f['id']}/{d['arquivo']}"] = {"url": d["url"], "data_download": dt.date.today().isoformat(), "sha256": sha256(destino)}
    if not a.listar:
        RAW.mkdir(parents=True, exist_ok=True)
        registro_arq.write_text(json.dumps(registro, indent=1, ensure_ascii=False), encoding="utf-8")
    if falhas:
        print("\nNão baixados (avisar o autor; não substituir por outra fonte):", *falhas, sep="\n  ")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
