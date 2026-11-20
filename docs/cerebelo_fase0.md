# Reforma do cerebelo, Fase 0: diagnóstico e arquitetura (20/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-0/`.

## 1. Como o atlas funciona

- **Stack:** página única em HTML e JavaScript puro, sem framework; three.js r128 (WebGL) com GLTFLoader e o
  decodificador meshopt. A fonte fica em `src/` e `node scripts/embutir_glb.mjs` monta `atlas-3d-neuroanatomia.html`.
- **Malhas:** o córtex (Brain for Blender) vai embutido no HTML; os esquemas do Mímir são gerados pelo código; os
  modelos reais (cerebelo do Sereno, núcleos do SUIT e do MASSP, nervos, vias, artérias) são arquivos em `models/`,
  carregados só quando o modo é escolhido.
- **Seleção e destaque:** cada malha é registrada num item (`register`), e `applyAppearance` recalcula cor,
  opacidade e brilho de todas a cada mudança. Com o isolamento ligado, o que não é a estrutura escolhida (nem um
  relé dela) fica a 10% de opacidade. Cada malha tem material próprio (nenhum material é compartilhado).
- **Rótulos:** pinos em HTML (não são objetos 3D) ancorados no ponto da estrutura mais perto do seu centro.
  Como são texto da página, não ficam espelhados; o "Declive" invertido e o texto cortado que o roteiro cita
  serão vistos na Fase 1, com os prints.

## 2. Por que o cerebelo parecia menos liso que o córtex

Os materiais são equivalentes: o mesmo tipo (MeshStandardMaterial), rugosidade parecida (0,78 a 0,82), sem
sombreamento plano em nenhum, normais calculadas por vértice. A diferença vem da malha:

- **Cerebelo do modelo antigo (botão Atlas):** a malha lisa do Brain for Blender foi cortada em lóbulos, cada
  lóbulo é uma malha separada com normais próprias (aparecem emendas nas bordas) e as folhas são um relevo
  entalhado por código, que dá um aspecto mais duro.
- **Cerebelo real (Sereno):** 700 mil triângulos com as folhas de verdade; o relevo fino é anatômico.
- **E havia um erro de cor:** a aparência geral pintava o material do cerebelo real de castanho, e esse castanho
  multiplicava a cor de cada vértice: as cores dos lóbulos saíam escuras e "sujas". Corrigido: o material fica
  branco e a cor vem só dos vértices.

## 3. A causa do "quando seleciono, partes somem ou ficam desconfiguradas"

O cerebelo real é **uma única malha** com todos os lóbulos. Ao escolher um lóbulo (por exemplo o cúlmen), o atlas
tratava a malha inteira como "não escolhida" e a deixava a **10% de opacidade**; além disso, o material não
entrava no modo transparente (`transparent=false` com opacidade 0,1 e `depthWrite=false`), e o three.js desenhava
as folhas fora de ordem: o aspecto "picotado".

Das suspeitas do roteiro: material compartilhado, não (cada malha tem o seu); normais ausentes ou invertidas,
não; seleção que esconde com `visible=false`, não; transparência sem `depthWrite=false` e sem ordem de desenho,
**sim**, e a malha única tratada como não escolhida, **sim** (causa principal).

**Correções:**
- Com uma parte do cerebelo escolhida (lóbulo, lobo, verme, fissura), a malha real fica opaca; a parte acende em
  amarelo e o resto fica cinza e apagado pela cor dos vértices, sem sumir (`src/js/14-cerebelo-sereno.js`).
- Transparência coerente no atlas inteiro: material com opacidade abaixo de 100% passa a ser transparente, sem
  escrever profundidade e desenhado depois das malhas opacas (`src/js/14-i9-transparencia.js`).

## 4. Cerebelo, tronco e pedúnculos separados

Três camadas independentes no painel: **Tronco encefálico**, **Cerebelo** (lóbulos, lobos, fissuras, verme,
hemisférios, corpo medular, árvore da vida, núcleos e o cerebelo real) e **Pedúnculos cerebelares** (superior,
médio e inferior, como estrutura de ligação, selecionáveis à parte). Onde o atlas ligava o tronco (lições, vistas,
modos), liga os três, para nada que já funcionava mudar.

## 5. Registro das estruturas

`data/registro_cerebelo.json`: 43 estruturas (verme, hemisférios, 3 lobos, 17 lóbulos, 8 fissuras, núcleos,
corpo medular, corte sagital, cerebelo real e 3 pedúnculos), cada uma com `id`, `nome` (Machado), `sinonimos`
(Duus e Terminologia Anatômica), `grupo`, `lobo`, `larsell`, `zona`, `divisaoFuncional` e `cor`; os lóbulos do
verme apontam para o lóbulo do hemisfério correspondente e vice-versa. O build embute o registro e
`src/js/14-i7-registro-cerebelo.js` aplica nomes, cores e grupos; os sinônimos entram na busca (por exemplo,
"primária" acha a fissura prima). As cores ainda são as atuais: a paleta nova é da Fase 1.

**A confirmar com o autor:** o roteiro põe o túber como VIIB e o semilunar inferior como Crus II; pela divisão de
Larsell e de Schmahmann o túber é VIIAt e VIIB, e o lóbulo grácil (HVIIB) não é nomeado no Machado. No registro
ficou: túber "VIIA (VIIAt) e VIIB"; semilunar inferior "Crus II (HVIIA) e HVIIB".

## 6. Critério de aceite

Selecionar e desselecionar estruturas do cerebelo 20 vezes seguidas (cúlmen, nódulo, verme, tonsila, fissura
prima, denteado, pedúnculo médio, lobo anterior, flóculo, declive), nos modos Folhas, Lobos e Atlas:
**0 de 1.237 malhas mudaram** (geometria, visibilidade, opacidade e transparência iguais antes e depois).

## 7. Pendente para as próximas fases

- As imagens de referência (`referencias/cerebelo/`: Machado, Duus e os prints dos problemas) ainda não foram
  colocadas na pasta; a comparação com as figuras começa quando elas estiverem lá. A pasta está fora do git.
- Fase 1: modos Realista e Esquemático (como tema do atlas), "Colorir por" (lóbulos, lobos, funcional), paleta
  nova (verme mais escuro que o hemisfério), fissuras como curvas, rótulos, estruturas extras e vistas prontas.
