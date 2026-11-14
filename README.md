# Atlas 3D de Neuroanatomia

Atlas 3D interativo para estudo de neuroanatomia, feito por um estudante de Medicina com base em Ângelo Machado, *Neuroanatomia Funcional*, 4ª ed. Roda no navegador, em um único arquivo HTML, sem instalação.

**Abrir:** baixe `atlas-3d-neuroanatomia.html` e abra com duplo clique (precisa de internet para carregar o three.js).

## O que tem
- Córtex real (malha de um cérebro, parcelação Desikan-Killiany), vista inflada e 19 sulcos selecionáveis.
- Núcleos da base, diencéfalo, sistema límbico e ventrículos (malhas reais), com o ventrículo lateral por partes.
- Tronco encefálico com 32 acidentes de superfície, inclusive o assoalho do IV ventrículo.
- Cerebelo com 3 lobos, 17 lóbulos, 8 fissuras, folhas, pedúnculos e corte sagital do verme.
- Vascularização: polígono de Willis, ramos corticais e centrais, territórios, modo AVC, seios e veias superficiais, profundas e da fossa posterior.
- 12 pares cranianos, núcleos por colunas funcionais, ramos e gânglios, vista do seio cavernoso.
- 11 grandes vias com setas de sentido e modo Lesão (déficits e campo visual).
- Pregas da dura-máter e medula cervical.
- Estudo: 26 lições guiadas com pinos numerados, nomes em português, latim e inglês, teste de identificação (estrutura, clique no modelo, artéria e lesão), rótulos ocultáveis.

Itens que não puderam ser conferidos no livro estão marcados "a confirmar" no painel e listados em [REVISAR.md](REVISAR.md). Modelo idealizado e simétrico: serve para posição e relações, não para medidas.

## Como editar
A fonte é `scripts/atlas.modelo.html`; o arquivo final é gerado com:

```bash
cd scripts && npm install && cd ..
node scripts/embutir_glb.mjs
```

Detalhes da conversão das malhas em [scripts/LEIAME.md](scripts/LEIAME.md); estado do projeto e convenções do código em [ESTADO.md](ESTADO.md).

## Créditos e licença
- Malhas 3D: **Brain for Blender**, de Anderson M. Winkler ([brainder.org](https://brainder.org/brain-for-blender/)), licença [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). As malhas foram decimadas, recoloridas e espelhadas para este atlas.
- Textos: resumos a partir de Ângelo Machado, *Neuroanatomia Funcional*, 4ª ed. (Atheneu), com capítulo e página citados em cada item. O livro não está incluído neste repositório.
- Programas: [three.js](https://threejs.org) r128 (MIT) e [meshoptimizer](https://github.com/zeux/meshoptimizer) (MIT).

Por usar as malhas do Brain for Blender, o atlas é distribuído sob a mesma licença, **CC BY-SA 3.0**.
