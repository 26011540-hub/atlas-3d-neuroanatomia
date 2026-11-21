# Reforma do cerebelo, Fase 5: conexões e síndromes (21/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-5/`. Código em
`src/js/14-cerebelo-sereno6-vias.js`.

## Vias cerebelares

O botão **"Vias cerebelares"** fica no painel do Cerebelo, linha "Conexões". As vias são tubos do sistema de vias do
atlas (camada Grandes vias): aferentes em azul e eferentes em vermelho, como na fig. 5.5b do Duus, com setas
animadas no sentido da condução. Cada uma passa pelo seu pedúnculo, seguindo o eixo do próprio tubo do pedúnculo do
atlas:

| Pedúnculo | Vias |
| --- | --- |
| Inferior | Trato espinocerebelar posterior (da medula do mesmo lado ao espinocerebelo)<br>Fibras olivocerebelares (do olivar inferior do lado oposto, cruzando no bulbo, para todo o córtex)<br>Fibras vestibulocerebelares (dos núcleos vestibulares ao nódulo e ao flóculo) |
| Médio | Fibras pontocerebelares (dos núcleos pontinos do lado oposto, cruzando na base da ponte, à parte lateral do hemisfério) |
| Superior | Trato espinocerebelar anterior (aferente; cruzado na medula)<br>Fibras dentatorrubrais (do denteado ao núcleo rubro do lado oposto, cruzando na decussação dos pedúnculos cerebelares superiores)<br>Fibras dentatotalâmicas (do denteado ao núcleo ventral lateral do tálamo do lado oposto) |

Como as vias ficam à vista:

- **Cerebelo esquerdo:** é o lado desenhado. As vias terminam ou começam nos lóbulos do cerebelo real e nos núcleos
  das fases anteriores.
- **Ao ligar:**
  - o córtex cerebelar fica a 75% de transparência, o tronco a 70% e os pedúnculos translúcidos;
  - o tálamo aparece translúcido, como destino;
  - a câmera vai para uma vista lateral, um pouco de trás.
- **Legenda:** lista as vias agrupadas por pedúnculo. Cada nome é um botão que seleciona a via, e a ficha mostra o
  texto e as referências.
- **Fora do painel:** as vias também entram na camada Grandes vias, integradas ao sistema que já existia.

## Modo Lesão

O botão **"Lesão"** pinta o cerebelo por função. Clicar numa divisão funcional do cerebelo real acende a divisão em
vermelho, apaga o resto e mostra a síndrome (Duus, p. 188-191):

| Divisão | Sinais | Observação |
| --- | --- | --- |
| Vestibulocerebelo (lobo floculonodular) | desequilíbrio, ataxia de tronco, nistagmo | tumores do teto do IV ventrículo |
| Espinocerebelo (verme e zona paravermiana) | ataxia de marcha e de postura | — |
| Cerebrocerebelo (parte lateral) | dismetria, disdiadococinesia, tremor de intenção, disartria | os sinais dos membros aparecem do mesmo lado da lesão |

A divisão de cada ponto é a mesma das cores funcionais da Fase 1.

## Créditos

- **Duus:** entrou em `data/sources.yaml` como referência de modelagem e de texto (Baehr e Frotscher, *Diagnóstico
  Topográfico em Neurologia*, 5ª ed., cap. 5), ao lado do Machado.
- **Sereno:** o crédito foi corrigido para o que é usado de fato, as superfícies pial e branca. O pacote não tem núcleo
  denteado.
- `CREDITS.md` e a aba Créditos foram regenerados.

## Desempenho

O teste de oclusão dos rótulos, que roda quando a câmera para, deixou de lançar raios contra a malha lisa (cerca de
160 mil triângulos). Agora ele anda ao longo do raio sobre a grade de "dentro do cerebelo" da Fase 4. Selecionar
uma estrutura leva de 20 a 180 ms.

## Critério de regressão

20 ciclos de selecionar e desselecionar (vias, lóbulos, pedúnculos, núcleos, artérias): **0 de 1.262 malhas
mudaram**, em 0,8 s.

## Limites e decisões a confirmar

- **Trajetos esquemáticos:** só o cerebelo esquerdo foi desenhado. A ordem das estações segue o Duus e o Machado; a
  forma exata dos trajetos é do Mímir.
- **Trato espinocerebelar anterior:** desenhado cruzando na medula, como no texto do Machado (cap. 22). O novo
  cruzamento dentro do cerebelo é só citado no texto.
- **Fibras olivocerebelares:** dois ramos, um para o hemisfério anterior e outro para o semilunar inferior, que
  representam a projeção para todo o córtex.
- **Síndromes:** os sinais listados são os do roteiro. Se quiser outros do Duus (por exemplo, hipotonia ou rebote),
  me diga.
