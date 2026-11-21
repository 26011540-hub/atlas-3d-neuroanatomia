# Reforma do cerebelo, Fase 3: corte sagital mediano (20/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-3/`. Código em
`src/js/14-cerebelo-sereno4-sagital.js`.

## O que entrou

O botão **"Corte sagital"** fica no painel do Cerebelo, linha "Vista". Ele faz o corte pelo plano 2 da fig. 5.5a do
Duus, a 0,5 mm da linha média, e mostra o lado esquerdo visto pela face medial. A face cortada é calculada a partir
das próprias malhas, não desenhada à mão:

- **Cerebelo e árvore da vida:** o córtex aparece em cinzento e a substância branca em branco. Os dois vêm do mesmo
  cerebelo do Sereno (superfícies pial e branca). As lâminas brancas que entram nas folhas são dados reais.
- **Tronco:**
  - O mesencéfalo, a ponte, o bulbo e a medula saem das malhas do atlas.
  - O aqueduto, o IV ventrículo e o véu medular superior também.
  - Como o tronco já modelado é cortado no mesmo plano, o IV ventrículo casa com ele por construção.
  - O teto do IV ventrículo forma a "tenda" que entra no cerebelo, com o fastígio.
- **Realista:** cinzento e branco.
- **Esquemático:** o córtex de cada lóbulo do verme fica na cor do lóbulo (a mesma paleta da Fase 1) e as fissuras
  aparecem como linhas escuras entre lóbulos vizinhos. As posições e proporções são as do cerebelo real, então não
  há leque desenhado.
- **Leque antigo:** o esquema em leque (`CB.corte`) continua só no modo Atlas.
- **Clique e passagem do mouse no corte:**
  - O clique pega a estrutura do pixel: lóbulo, corpo medular, ponte, bulbo, IV ventrículo, aqueduto etc.
  - O vão entre as folhas deixa o clique passar.
  - A estrutura escolhida acende no próprio corte e o resto fica cinza.
  - O duplo clique abre a ficha.
- **Itens novos:** "Teto do mesencéfalo (lâmina quadrigêmea)" e "Tela corioide do IV ventrículo", com rótulo e
  ficha.

## Critério de aceite

Na vista do corte há **24 estruturas com rótulo** (`1-sagital-realista.png`):

| Grupo | Estruturas |
| --- | --- |
| Lóbulos do verme | lóbulo central, cúlmen, declive, túber, pirâmide, úvula, nódulo |
| Fissuras | pré-culminar, prima, pós-clival, pré-piramidal, pós-piramidal, posterolateral |
| Cerebelo | corpo medular |
| Tronco | mesencéfalo, teto do mesencéfalo, aqueduto, ponte, bulbo, medula |
| IV ventrículo | véu medular superior, IV ventrículo, tela corioide, abertura mediana |

A comparação lado a lado com a figura do Machado ainda depende das imagens em `referencias/cerebelo/`, que continua
vazia.

Regressão da Fase 0: 20 ciclos de selecionar e desselecionar com o corte ligado: **0 de 1.255 malhas mudaram**.
Ao desligar o corte, nenhuma malha fica com plano de recorte e o hemisfério direito volta.

## Limites e decisões a confirmar

- **Língula e fólium não aparecem no corte:** perto da linha média o SUIT não rotula esses lóbulos. A língula cai no
  lóbulo central e o fólium entre o declive e o túber. Pelo mesmo motivo não há rótulo das fissuras pré-central e
  horizontal no plano mediano. Corrigir isso exige rótulos do verme feitos à mão sobre o Sereno, e quero sua
  orientação antes de inventar limites.
- **Canal central do bulbo:** o atlas não tem malha dele (o item "Canal central da medula" existe sem geometria).
  Fica para quando houver uma malha.
- **Plexo corioide do IV ventrículo:** a malha do atlas não cruza o plano mediano, então ele só aparece como rótulo e
  em 3D atrás do corte.
- **Partes do tronco:** os limites entre mesencéfalo, ponte e bulbo no corte são os da malha do atlas, os mesmos do
  modo Tronco e medula. A ponte do atlas sobe bastante no dorso e merece conferência com a figura.
- **Encontro do cerebelo do Sereno com o tronco do atlas:** junto aos pedúnculos o Sereno é fechado por uma
  superfície lisa (onde foi separado do tronco). No corte, o tronco e o IV ventrículo são desenhados por cima, para o
  limite anterior ser o do tronco do atlas.
