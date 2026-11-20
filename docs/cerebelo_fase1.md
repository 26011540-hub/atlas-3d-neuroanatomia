# Reforma do cerebelo, Fase 1: tema, cores, fissuras, vistas e interação (20/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-1/`. Código novo em
`src/js/14-cerebelo-sereno2-tema.js`; paleta e cores por zona em `src/js/14-cerebelo-sereno.js`.

## O que entrou

- **Botão "Cerebelo"** na barra de modos (ao lado de "Tronco e medula"). Abre um painel com tudo desta fase; "Voltar a
  explorar" devolve as camadas como estavam. "Opções ▾" recolhe o painel e deixa só as vistas.
- **Tema Realista | Esquemático** (vale para o atlas todo): Realista mostra a superfície do Sereno com cor única; Esquemático
  pinta o cerebelo e deixa a luz mais difusa, com cores chapadas, também no resto do atlas. Os botões antigos
  (Atlas, Folhas, Estudo, Lobos) continuam e acompanham o tema.
- **Colorir por:**
  - Lóbulos: uma família de cores por lobo (anterior em amarelos e laranjas, posterior do vermelho ao azul,
    floculonodular em verdes); cada lóbulo do verme um tom mais escuro que o lóbulo do hemisfério da mesma faixa.
  - Lobos: três cores.
  - Funcional (Duus, fig. 5.1): verme e zona paravermiana (espinocerebelo: postura e marcha), parte lateral
    (cerebrocerebelo: movimentos finos), lobo floculonodular (vestibulocerebelo: equilíbrio), com legenda.
- **Fissuras como curvas 3D**: as 8 fissuras saem do contorno entre os lóbulos de cada lado (pela ordem de Larsell),
  tirado da superfície lisa do Sereno e suavizado. Prima, horizontal e posterolateral são mais grossas. Cada curva
  é selecionável e tem rótulo; botão "Fissuras: Mostrar" liga e desliga.
- **Rótulos do cerebelo**: texto da página (nunca espelhado), sem corte (a largura máxima dos rótulos gerais também
  subiu de 180 para 280 px, o que resolve o "Corte sagital do verme: co…"). "Da vista" mostra só os da face voltada
  para a câmera e não tapada por outra parte (teste de raio quando a câmera para); "Mostrar todos"; "Nenhum".
- **Estruturas extras**: teto do IV ventrículo (novo, a parede dorsal da malha real do IV ventrículo); véu medular
  superior (passou para a camada Pedúnculos cerebelares); forame de Magendie e forames de Luschka (já existiam
  como aberturas mediana e laterais; os epônimos entraram como sinônimos e a busca os acha).
- **Vistas prontas**: Dorsal (Machado, fig. 5.6), Superior (Duus, fig. 5.1, anterior para cima), Ventral (Machado,
  fig. 5.4; Duus, fig. 5.2: sem o tronco, com os cortes dos pedúnculos e o teto do IV ventrículo), Anterior.
  "Dividir ao meio" vai para a vista superior e pinta a metade esquerda da tela pelas zonas funcionais e a direita
  pelos lóbulos.
- **Interação**: passar o mouse realça o lóbulo (e mostra o nome do lóbulo, não "córtex cerebelar"); clique isola,
  com o resto a 15% e sem cor, sem sumir (no cerebelo real, que é uma malha só, o resto fica cinza e opaco);
  duplo clique abre a ficha: nome (Machado), sinônimos (Duus e Terminologia Anatômica), Larsell, lobo, zona,
  divisão funcional, função e o lóbulo correspondente do verme ou do hemisfério.

## Capturas

| Arquivo | O que mostra |
| --- | --- |
| `1-realista-dorsal.png` | Tema Realista, vista dorsal, fissuras prima e horizontal em destaque, rótulos da face à vista |
| `2-esquematico-lobulos-dorsal.png` | Esquemático, cores por lóbulo, vista dorsal |
| `3-superior-dividida.png` | Vista superior dividida: zonas funcionais à esquerda, lóbulos à direita |
| `4-ventral-lobulos.png` | Vista ventral: flóculo, nódulo, úvula, tonsilas, cortes dos pedúnculos |
| `5-anterior-funcional.png` | Vista anterior, cores funcionais |
| `6-ficha-e-legenda-funcional.jpg` | Ficha aberta por duplo clique e legenda funcional |

## Comparação com as figuras

A pasta `referencias/cerebelo/` continua vazia: a comparação lado a lado com Machado 5.4 e 5.6 e Duus 5.1 e 5.2
ainda não foi feita. Pelo texto do Machado (cap. 5, p. 47-49), nas vistas dorsal e ventral dá para reconhecer sem os
rótulos: verme e hemisférios; lobo anterior (amarelos) separado do posterior (vermelhos a azuis) pela fissura
prima; fissura horizontal entre os semilunares superior e inferior; lobo floculonodular (verdes) atrás da fissura
posterolateral; tonsilas junto à linha média na face inferior.

## Critério de aceite da Fase 0, repetido

Selecionar e desselecionar 20 vezes (cúlmen, nódulo, verme, tonsila, fissura prima, denteado, pedúnculo médio, lobo
anterior, flóculo, declive, fissura horizontal, teto do IV ventrículo): **0 de 1.251 malhas mudaram**.

## Limites e decisões a confirmar

- **Paraflóculo: não modelado.** No homem o paraflóculo é rudimentar e os livros divergem: há quem chame de
  paraflóculo a tonsila (paraflóculo ventral) e parte do biventre (dorsal), e há quem o descreva como um lóbulo
  acessório pequeno junto ao flóculo. Preciso saber qual o Duus usa e onde ele fica na figura.
- **Largura da zona paravermiana**: aproximação (|x| de 1,3 a 2,3 cm); o Duus não dá medida.
- **Túber e semilunar inferior** (pendente da Fase 0): túber "VIIA (VIIAt) e VIIB"; semilunar inferior
  "Crus II (HVIIA) e HVIIB".
- **Cortes dos pedúnculos na vista ventral**: a superfície real do Sereno cobre os pedúnculos do atlas (registros
  diferentes). Os cortes aparecem desenhados por cima da superfície, como marcação, e não como um corte da malha.
  Cortar a malha de verdade fica para a Fase 3 (corte sagital).
- **Lóbulos pelo atlas SUIT**: as bordas seguem a anatomia média de 20 cerebelos, não exatamente as fissuras deste
  cerebelo; por isso as curvas das fissuras são suavizadas e podem passar meio lóbulo para um lado em alguns pontos.
- **Esquemático no resto do atlas**: por ora muda a luz (cores mais chapadas); não recolore o córtex.
