# Atlas 3D de neuroanatomia: como o córtex é gerado

O atlas (`../atlas-3d-neuroanatomia.html`) é um arquivo único. O córtex vem das malhas
**Brain for Blender**, de Anderson M. Winkler (https://brainder.org/brain-for-blender/),
licença **CC BY-SA 3.0**. As malhas foram decimadas e recoloridas; o resultado segue a mesma licença.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `../src/` | **Fonte do atlas. É aqui que se edita.** `cabeca.html`, `estilo.css`, `corpo.html`, `js/NN-*.js` (executados em ordem numérica) e `fim.html` |
| `converter_brainder.mjs` | OBJ do Brainder → `dados_brainder/cortex.glb` e `dados_brainder/marcos.json` |
| `embutir_glb.mjs` | Junta as partes de `../src/`, confere a sintaxe do JavaScript e embute o GLB (base64) e os marcos em `../atlas-3d-neuroanatomia.html` |
| `servidor.mjs` | Servidor local simples (http://localhost:8765/) |
| `../atlas-3d-neuroanatomia.original.html` | Cópia do atlas antes da troca do córtex |
| `../dados_brainder/` | Downloads do Brainder (pial, inflada, Desikan-Killiany, subcortical) |

Os scripts são em Node (a máquina não tinha Python). Única dependência: `meshoptimizer`.

## Refazer do zero

```bash
npm install
node converter_brainder.mjs 150000
node embutir_glb.mjs
node servidor.mjs
```

O número em `converter_brainder.mjs` é a quantidade de triângulos por hemisfério.
Depois de editar qualquer arquivo de `../src/`, basta rodar `node scripts/embutir_glb.mjs` na raiz do projeto.
O atlas final também abre com duplo clique, sem servidor (precisa de internet para o three.js).

## O que a conversão faz

1. Lê `lh/rh.pial.obj` e `lh/rh.inflated.obj` (mesma topologia) e rotula cada vértice pela região
   Desikan-Killiany, casando posições com os OBJ de `pial_DK_obj`.
2. Decima cada hemisfério (de ~289 mil para 150 mil triângulos), travando as bordas entre regiões.
   O simplificador só reaproveita vértices originais, então pial, inflada e rótulo continuam casados.
3. Calcula a profundidade de sulco (distância do vértice a uma versão muito suavizada da malha) e grava
   como cor de vértice em cinza: sulco escuro, giro claro.
4. Divide a região frontal superior em face lateral e medial (pela margem superior do hemisfério) e separa,
   na parede medial, o corte do corpo caloso (pelo contorno das malhas `CC_*.obj`).
5. Grava um GLB com um mesh por região e hemisfério (74 corticais): posição int16
   (`KHR_mesh_quantization`), normal int8, `COLOR_0`, e a malha inflada em `_INFLATED` / `_INFLATED_N`.
6. Acrescenta ao mesmo GLB as malhas subcorticais do mesmo cérebro (`subcortical_obj`): caudado, putame,
   globo pálido, accumbens, tálamo, amígdala, hipocampo, ventrículos, tronco encefálico e córtex cerebelar.
   Três divisões que a segmentação não traz são feitas por geometria e avisadas no painel: segmentos externo
   e interno do pálido, mesencéfalo/ponte/bulbo (onde a saliência ventral da ponte começa e termina) e vérmis
   (faixa mediana de 9 mm para cada lado).
7. Grava `marcos.json`: centroides das regiões, bordas entre pares de regiões (usadas para guiar os vasos
   pelos sulcos) e centro/caixa das malhas subcorticais (referência para posicionar núcleos e ventrículos).

## Modelo idealizado e simétrico

Só o lado **esquerdo** do cérebro do Brainder é convertido (córtex e estruturas subcorticais). O atlas gera o
lado direito espelhando a mesma geometria no plano mediano (x = 0), então os dois lados são idênticos.
O plano mediano foi recentrado em 1 mm (`OX`), o córtex que o atravessava foi achatado contra ele, e as
estruturas medianas (tronco, III e IV ventrículos, vérmis) são a metade esquerda mais o seu espelho.
Vasos e formas esquemáticas são construídos uma vez e espelhados.

## Eixos

- Atlas (cm): X = esquerda (+) / direita (−), Y = superior, Z = anterior.
- FreeSurfer (mm): x = direita, y = anterior, z = superior. Conversão: `X = −x/10, Y = z/10, Z = y/10`,
  seguida de um giro de 10° em torno de X (o cérebro do Brainder vem com o polo frontal inclinado para
  baixo) e de um deslocamento (`OY`, `OZ` no topo do script).
- A vista "Lateral" mostra o hemisfério **esquerdo**; a "Medial" mostra a face medial do esquerdo, com o
  direito oculto.

## Limites conhecidos

- Parte do hemisfério esquerdo de um único indivíduo, com parcelação automática: os limites dos giros são aproximados.
- Continuam esquemáticos (elipsoides e tubos): artérias, veias, cápsula interna, claustro, fórnix, comissuras,
  hipotálamo, hipófise, vias ópticas, corpos geniculados, cauda do caudado e os núcleos pequenos do tronco e
  do cerebelo.
- As divisões do pálido, do tronco e do vérmis são aproximadas (ver item 6).
- A área subcalosa/septal não tem região própria na parcelação e ficou sem malha.
- O GLB não usa alinhamento de 4 bytes nos atributos de vértice (economia de tamanho). O three.js r128 lê
  sem problema; validadores estritos de glTF podem reclamar.

## Gabarito das bolachas

`../gabarito/montar_gabarito.cjs` gera `../GABARITO.md`, `../gabarito/unicamp-coronal.json` e `../src/js/01-gabarito.js` (os ids das estruturas de cada face dos 12 cortes coronais da Unicamp). Rodar `node gabarito/montar_gabarito.cjs` depois de mudar o mapa, e então `node scripts/embutir_glb.mjs`.

## Partes novas da remodelagem 3
- `src/js/10-sistema-limbico.js`: lobos, istmo, giro subcaloso, hipocampo por partes, feixes límbicos, prosencéfalo basal, habênulas.
- `src/js/10-tronco-interno.js`: eixo do tronco e núcleos e feixes internos.
- `src/js/14-bolachas.js`: motor de corte por plano (`bolSecao`) e o modo Bolachas.
- `src/js/14-cortes-tronco.js`: cortes transversais do tronco e esquemas da medula.
