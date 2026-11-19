"""Funções comuns da pipeline de processamento do Mímir.

Volume (NIfTI/MGZ) -> isosuperfície (marching cubes) -> espaço de referência -> suavização -> decimação -> GLB.
Depois, scripts/process/comprimir.mjs aplica gltfpack (níveis de detalhe e compressão meshopt) e grava em models/.

Estado: escrito na Fase 0 e AINDA NÃO EXECUTADO (o Python não estava instalado).
Requisitos: scripts/requirements.txt.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
PROCESSADO = RAIZ / "data" / "processed"


@dataclass
class Malha:
    nome: str
    vertices: np.ndarray            # (n, 3) em mm, no espaço de referência indicado em `espaco`
    faces: np.ndarray               # (m, 3) int
    espaco: str = "desconhecido"
    historico: list[str] = field(default_factory=list)   # vai para o campo `processamento` do manifesto


def ler_superficie_freesurfer(caminho: Path, nome: str) -> Malha:
    """Superfície binária do FreeSurfer (rh.pial, rh.white...). Coordenadas em mm do 'surface RAS'."""
    import nibabel.freesurfer.io as fsio
    v, f = fsio.read_geometry(str(caminho))
    return Malha(nome, v.astype(np.float64), f.astype(np.int64), "surface RAS (FreeSurfer)", [f"lida de {caminho.name} (nibabel)"])


def ler_volume(caminho: Path):
    import nibabel as nib
    img = nib.load(str(caminho))
    return np.asarray(img.dataobj), img.affine


def isosuperficie(volume: np.ndarray, afim: np.ndarray, nivel: float, nome: str, rotulo: int | None = None) -> Malha:
    """Marching cubes num volume (ou só num rótulo de um volume de rótulos), já levado a mm pelo afim do arquivo."""
    from skimage.measure import marching_cubes
    dados = (volume == rotulo).astype(np.float32) if rotulo is not None else volume.astype(np.float32)
    v, f, _, _ = marching_cubes(dados, level=nivel if rotulo is None else 0.5)
    v = np.c_[v, np.ones(len(v))] @ afim.T
    hist = f"isosuperfície por marching cubes (scikit-image), nível {nivel}" + (f", rótulo {rotulo}" if rotulo is not None else "")
    return Malha(nome, v[:, :3], f.astype(np.int64), "espaço do volume", [hist])


def transformar(m: Malha, matriz: np.ndarray, destino: str, descricao: str) -> Malha:
    """Aplica uma matriz 4x4 (registro rígido/afim, mudança de escala). Registrar sempre no manifesto."""
    v = np.c_[m.vertices, np.ones(len(m.vertices))] @ np.asarray(matriz, dtype=np.float64).T
    m.vertices, m.espaco = v[:, :3], destino
    m.historico.append(f"transformação para {destino}: {descricao}")
    return m


def suavizar(m: Malha, iteracoes: int = 10) -> Malha:
    """Suavização de Taubin (não encolhe a malha)."""
    import trimesh
    t = trimesh.Trimesh(m.vertices, m.faces, process=False)
    trimesh.smoothing.filter_taubin(t, iterations=iteracoes)
    m.vertices = np.asarray(t.vertices)
    m.historico.append(f"suavização de Taubin, {iteracoes} iterações (trimesh)")
    return m


def decimar(m: Malha, alvo_faces: int) -> Malha:
    """Decimação por erro quádrico (pymeshlab), preservando a forma."""
    import pymeshlab
    ms = pymeshlab.MeshSet()
    ms.add_mesh(pymeshlab.Mesh(m.vertices, m.faces))
    ms.meshing_decimation_quadric_edge_collapse(targetfacenum=int(alvo_faces), preservenormal=True, preservetopology=True)
    r = ms.current_mesh()
    antes = len(m.faces)
    m.vertices, m.faces = r.vertex_matrix(), r.face_matrix()
    m.historico.append(f"decimação quádrica {antes} -> {len(m.faces)} triângulos (pymeshlab)")
    return m


def exportar_glb(malhas: list[Malha], destino: Path, mm_para_unidade: float = 0.1) -> Path:
    """Grava um GLB com um nó por malha. O app usa cm: por padrão converte mm -> cm."""
    import trimesh
    cena = trimesh.Scene()
    for m in malhas:
        cena.add_geometry(trimesh.Trimesh(m.vertices * mm_para_unidade, m.faces, process=False), node_name=m.nome, geom_name=m.nome)
    destino.parent.mkdir(parents=True, exist_ok=True)
    cena.export(str(destino), file_type="glb")
    return destino


def resumo_processamento(m: Malha) -> str:
    return "; ".join(m.historico)
