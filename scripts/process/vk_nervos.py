"""Fase 3: nervos cranianos, orelha interna e base do crânio do Visible Korean (Kim e Park, 2026; CC BY-NC 4.0).

1. Lê os STL extraídos de "4. Surface models.zip" (data/raw/visible_korean/extraido/). Unidade: mm.
   Eixos do Visible Korean: anterior = -y, superior = +z (conferido pelos centros do lobo frontal, do cúneo e do bulbo);
   direita = -x, supondo coordenadas destras (as estruturas são bilaterais, então um espelho não mudaria a forma).
2. Registro afim Visible Korean -> espaço do Mímir pelas estruturas do encéfalo (tálamo, caudado, putâmen, pálido,
   ventrículos, tronco, cerebelo) contra as mesmas do atlas (Brain for Blender, esquerdo e espelho), como em
   mni_para_mimir.py: cada ponto procura só na estrutura correspondente.
3. Nervos, gânglios, núcleos dos nervos, orelha interna e ossos da base: decimados e levados ao Mímir.
4. Forames: em cada nervo, o primeiro contato com os ossos da base (o ponto de contato mais próximo do tronco, por
   lado) é marcado como forame de saída; o nome do forame vem da tabela FORAMES (Machado; a conferir).

Saída: data/processed/vk_nervos.glb, data/processed/vk_cranio_base.glb, models/vk_forames.json e
data/processed/vk_registro.json. Uso: python -I scripts/process/vk_nervos.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial import cKDTree

sys.path.insert(0, str(Path(__file__).parent))
from comum import Malha, PROCESSADO, RAIZ, decimar
from mni_para_mimir import afim_mq
from sereno_cerebelo import fs_para_mimir_matriz, ler_obj
from suit_cerebelo import aplicar, gravar_glb

VK = RAIZ / "data" / "raw" / "visible_korean" / "extraido"
SNC = VK / "Nervous system" / "Central nervous system"
NC = VK / "Nervous system" / "Peripheral nervous system, cranial nerves"
OBJ = RAIZ / "dados_brainder" / "subcortical_obj" / "subcortical_obj"
VK_PARA_RAS = np.diag([-1.0, -1.0, 1.0])
PARES = [("Cerebrum/Thalamus", ["Left-Thalamus-Proper"]), ("Cerebrum/Caudate nucleus", ["Left-Caudate"]), ("Cerebrum/Putamen", ["Left-Putamen"]),
         ("Cerebrum/Globus pallidus", ["Left-Pallidum"]), ("Cerebrum/Lateral ventricle", ["Left-Lateral-Ventricle"]),
         ("Cerebrum/Third ventricle", ["3rd-Ventricle"]), ("Brainstem/4th ventricle", ["4th-Ventricle"]), ("Cerebellum", ["Left-Cerebellum-Cortex"]),
         ("Brainstem/Midbrain", ["Brain-Stem"]), ("Brainstem/Pons", ["Brain-Stem"]), ("Brainstem/Medulla oblongata", ["Brain-Stem"])]
# arquivo do Visible Korean (sem .stl) -> item do atlas
NERVOS = {"(I) Olfactory nerve": "nc1", "(II) Optic nerve": "nc2", "(II) Optic chiasm": "quiasma", "(II) Optic tract": "quiasma",
          "(III) Oculomotor nerve": "nc3", "(III) Oculomotor nerve sup branch": "nc3", "(III) Oculomotor nerve inf branch": "nc3",
          "(IV) Trochlear nerve": "nc4", "(V) Trigeminal nerve": "nc5", "(V) Trigeminal ganglion": "g_trig", "(V1) Ophthalmic nerve": "n_oft",
          "(V1) Frontal nerve": "n_v1ramos", "(V1) Lacrimal nerve": "n_v1ramos", "(V1) Nasociliary nerve": "n_v1ramos", "(V1) Supraorbital nerve": "n_v1ramos",
          "(V2) Maxillary nerve": "n_max", "(V2) Infraorbital nerve": "n_infraorb", "(V3) Mandibular nerve": "n_mand", "(V3) Inferior alveolar nerve": "n_alvinf",
          "(V3) Mental nerve": "n_alvinf", "(V3) Lingual nerve": "n_lingual", "(VI) Abducens nerve": "nc6", "(VII) Facial nerve": "nc7",
          "(VII) Facial nerve Geniculate ganglion": "g_genic", "(VII) Greater petrosal nerve": "n_petmaior", "(VII) Nerve of pterygoid canal": "n_petmaior",
          "(VII) Chorda tympani": "n_corda", "(VII) Nerve to stapedius": "n7_ramos", "(VII) Posterior auricular nerve": "n7_ramos",
          "(VII) Temporofacial division": "n7_ramos", "(VII) Cervicofacial division": "n7_ramos", "(VII) Temporal branches": "n7_ramos",
          "(VII) Zygomatic branches": "n7_ramos", "(VII) Buccal branch": "n7_ramos", "(VII) Mandibular branch": "n7_ramos", "(VII) Cervical branch": "n7_ramos",
          "(VII) Auricular branch": "n7_ramos", "(VII) Occipital branch": "n7_ramos", "(VII) Nerve to mastication m": "n7_ramos",
          "(VIII) Cochlear nerve": "nc8", "(VIII) Vestibular nerve": "nc8", "(IX) Glossopharyngeal nerve": "nc9", "(X) Vagus nerve": "nc10",
          "(XI) Accessory nerve": "nc11", "(XI) Accessory nerve spinal root": "nc11", "(XII) Hypoglossal nerve": "nc12"}
NUCLEOS = {"Brainstem/Nucleus of oculomotor nerve": "nu3", "Brainstem/Edinger Westphal nucleus": "nuew", "Brainstem/Nucleus of trochlear nerve": "nu4",
           "Brainstem/Nucleus of abducens nerve": "nu6", "Brainstem/Oculomotor nerve fibers": "nc3", "Brainstem/Trochlear nerve fibers": "nc4",
           "Brainstem/Decussation of trochlear nerve fibers": "nc4", "Brainstem/Abducens nerve fibers": "nc6"}
ORELHA = {"Cochlea": "vk_coclea", "Anterior semicircular duct": "vk_labirinto", "Lateral semicircular duct": "vk_labirinto",
          "Posterior semicircular duct": "vk_labirinto", "Saccule": "vk_labirinto", "Utricle": "vk_labirinto", "Internal acoustic meatus": "vk_meato_int",
          "Malleus": "vk_ossiculos", "Incus": "vk_ossiculos", "Stapes": "vk_ossiculos"}
OSSOS = {"Sphenoid bone": "osso_esfenoide", "Temporal bone": "osso_temporal", "Occipital bone": "osso_occipital", "Ethmoid bone": "osso_etmoide",
         "Frontal bone": "osso_frontal"}
# nervo -> forame de saída do crânio (Machado, cap. 11 e 12; Prometheus: a conferir)
FORAMES = {"nc1": "Lâmina cribriforme do etmoide", "nc2": "Canal óptico", "nc3": "Fissura orbital superior", "nc4": "Fissura orbital superior",
           "n_oft": "Fissura orbital superior", "n_max": "Forame redondo", "n_mand": "Forame oval", "nc6": "Fissura orbital superior",
           "nc7": "Meato acústico interno", "nc8": "Meato acústico interno", "nc9": "Forame jugular", "nc10": "Forame jugular",
           "nc11": "Forame jugular", "nc12": "Canal do nervo hipoglosso"}
FACES_MAX = {"nervo": 6000, "orelha": 8000, "osso": 30000}


def ler_stl(caminho):
    m = trimesh.load(str(caminho), force="mesh", process=True)
    return np.asarray(m.vertices, float) @ VK_PARA_RAS.T, np.asarray(m.faces)


def main():
    Mfs = fs_para_mimir_matriz()
    rng = np.random.default_rng(0)
    fontes, alvos = {}, {}
    for vk, objs in PARES:
        v, _ = ler_stl(SNC / f"{vk}.stl")
        alvo = np.vstack([aplicar(Mfs, ler_obj(OBJ / f"{o}.obj")) for o in objs])
        alvo = np.vstack([alvo, alvo * [-1, 1, 1]])                        # o atlas é simétrico: esquerdo e espelho
        fontes[vk] = v[rng.choice(len(v), min(4000, len(v)), replace=False)]; alvos[vk] = alvo
    arv = {k: cKDTree(a) for k, a in alvos.items()}
    S = np.vstack(list(fontes.values())); T = np.vstack(list(alvos.values()))
    M = Mfs.copy(); M[:3, 3] += T.mean(0) - aplicar(M, S).mean(0)
    for _ in range(60):
        pa, pb = [], []
        for k, s in fontes.items():
            _, i = arv[k].query(aplicar(M, s)); pa.append(s); pb.append(alvos[k][i])
        a, b = np.vstack(pa), np.vstack(pb)
        d = np.linalg.norm(aplicar(M, a) - b, axis=1); ok = d < np.percentile(d, 90)
        M = afim_mq(a[ok], b[ok])
    erros = {k: round(float(arv[k].query(aplicar(M, s))[0].mean() * 10), 2) for k, s in fontes.items()}
    todos = np.concatenate([arv[k].query(aplicar(M, s))[0] for k, s in fontes.items()]) * 10
    print("erro por estrutura (mm):", erros); print(f"erro médio {todos.mean():.2f} mm (p95 {np.percentile(todos, 95):.2f})")

    def carregar(caminho, nome, tipo):
        v, f = ler_stl(caminho)
        m = Malha(nome, v, f, "Visible Korean (RAS, mm)", [])
        if len(m.faces) > FACES_MAX[tipo]:
            decimar(m, FACES_MAX[tipo])
        m.vertices = aplicar(M, m.vertices)
        return m

    malhas, faltando, contagem = [], [], {}
    grupos = [(NC, NERVOS, "nervo"), (SNC, NUCLEOS, "nervo"), (VK / "Sense organs" / "Ear", ORELHA, "orelha")]
    nervos_mimir = {}
    for pasta, tabela, tipo in grupos:
        for arq, nid in tabela.items():
            c = pasta / f"{arq}.stl"
            if not c.exists():
                faltando.append(str(c.relative_to(VK))); continue
            m = carregar(c, nid, tipo)
            malhas.append((f"{nid}__{len(malhas)}", m.vertices, m.faces, None)); contagem[nid] = contagem.get(nid, 0) + len(m.faces)
            nervos_mimir.setdefault(nid, []).append(m.vertices)
    gravar_glb(PROCESSADO / "vk_nervos.glb", malhas)
    ossos = []
    for arq, oid in OSSOS.items():
        m = carregar(VK / "Skeletal system, cranium" / f"{arq}.stl", oid, "osso")
        ossos.append((oid, m.vertices, m.faces, None))
    gravar_glb(PROCESSADO / "vk_cranio_base.glb", ossos)

    # forames: primeiro contato de cada nervo com os ossos (menos de 1,5 mm), por lado, mais perto do tronco
    osso_arv = cKDTree(np.vstack([o[1] for o in ossos]))
    tronco = aplicar(M, ler_stl(SNC / "Brainstem" / "Pons.stl")[0]).mean(0)
    # um marcador por forame e lado, posto pelo nervo que passa por ele de forma mais clara (os nervos III, IV e VI tocam o
    # processo clinoide e o clivo antes da fissura orbital superior; por isso ela é marcada pelo V1)
    REFERENCIA = {"Lâmina cribriforme do etmoide": ["nc1"], "Canal óptico": ["nc2"], "Fissura orbital superior": ["n_oft"],
                  "Forame redondo": ["n_max"], "Forame oval": ["n_mand"], "Meato acústico interno": ["nc7", "nc8"],
                  "Forame jugular": ["nc9", "nc10"], "Canal do nervo hipoglosso": ["nc12"]}
    forames = []
    for nome, refs in REFERENCIA.items():
        for lado, sinal in (("e", 1), ("d", -1)):
            pts = []
            for nid in refs:
                if nid not in nervos_mimir: continue
                P = np.vstack(nervos_mimir[nid]); d, _ = osso_arv.query(P)
                Q = P[(d < 0.15) & (P[:, 0] * sinal > 0.2)]
                if not len(Q): continue
                dist = np.linalg.norm(Q - tronco, axis=1); pts.append(Q[dist < dist.min() + 0.3].mean(0))
            if pts:
                forames.append({"forame": nome, "lado": lado, "nervos": [n for n, f in FORAMES.items() if f == nome],
                                "referencia": refs, "posicao": np.round(np.mean(pts, 0), 3).tolist()})
    (RAIZ / "models" / "vk_forames.json").write_text(json.dumps({
        "fonte": "visible_korean (nervos e ossos) + Mímir (contato nervo-osso e nome do forame)", "forames": forames}, indent=1, ensure_ascii=False), encoding="utf-8")
    (PROCESSADO / "vk_registro.json").write_text(json.dumps({
        "vk_para_ras": VK_PARA_RAS.tolist(), "matriz_ras_mm_para_mimir": M.tolist(), "erro_medio_mm": float(todos.mean()),
        "erro_p95_mm": float(np.percentile(todos, 95)), "erro_por_estrutura_mm": erros, "faces": contagem, "faltando": faltando}, indent=1), encoding="utf-8")
    print("faces por item:", contagem); print("forames:", len(forames)); print("faltando:", faltando)


if __name__ == "__main__":
    main()
