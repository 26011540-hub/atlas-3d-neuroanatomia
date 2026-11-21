# Reforma do cerebelo, Fase 4: vasos, seios e tentório junto ao cerebelo novo (20/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-4/`. Código em
`src/js/14-cerebelo-sereno5-vasos.js`.

## O problema

O cerebelo real (Sereno) é maior e tem outra forma que o cerebelo antigo do atlas. Por isso os vasos e as pregas da
dura, desenhados em volta do cerebelo antigo, atravessavam o novo. Vértices dentro da superfície cerebelar, antes
da correção:

| Item | Dentro | Item | Dentro |
| --- | --- | --- | --- |
| Veias cerebelares superiores | 772 de 784 | Seio transverso | 496 de 902 |
| Veias cerebelares inferiores | 416 de 434 | Seio sigmoide | 213 de 726 |
| Veias superior e inferior do verme | 248 de 328 cada | Seio reto | 204 de 363 |
| PICA (esquema e TopBrain) | 3.714 | Seio occipital | 82 de 400 |
| SCA | 2.073 | Tentório | 27 de 116 |
| AICA | 1.225 | Foice do cerebelo | 3 de 6 |
| Artéria vertebral (TopBrain) | 1.203 | | |

## A correção

Cada malha é conferida contra a superfície lisa do Sereno, usando colunas de 0,8 mm nos três eixos:

- **Empurrão para fora:** o vértice que está dentro sai pelo caminho mais curto, com uma folga de 0,6 mm (0,3 mm nas
  pregas da dura).
- **Tubo inteiro:** o empurrão se espalha pelos vizinhos na malha, para o tubo se mover inteiro em vez de achatar.
- **Repetição:** a conferência se repete até não sobrar nada dentro.
- **Origens preservadas:** quando a vertebral é empurrada, o começo da PICA vai junto (peso que cai a zero em 8 mm).
  Por isso SCA e AICA continuam saindo da basilar e a PICA da vertebral.

Isso vale para o esquema e para o TopBrain. Roda sozinho 2,5 s depois de o atlas abrir.

## Resultado

- **Colisão:** 0 vértice dentro do cerebelo, em todos os 17 itens (vertebral, basilar, SCA, AICA, PICA, veias do
  verme, veias cerebelares superiores e inferiores, seios reto, transverso, sigmoide e occipital, confluência, veia
  occipital interna, tentório e foice do cerebelo).
- **Origens:** distância ao tronco de origem de 0,00 cm (SCA à basilar), 0,01 cm (AICA à basilar) e 0,00 cm (PICA à
  vertebral).
- **Seleção e esmaecimento** iguais aos da Fase 1: passar o mouse realça; o clique isola, com o resto a 15% e sem cor.
  Os vasos também ganham rótulos no painel do Cerebelo e somem quando ficam atrás do cerebelo.
- **No painel do Cerebelo**, as camadas de artérias, veias e dura mostram só a circulação posterior, os seios da fossa
  posterior (com os petrosos e a jugular) e as pregas da dura do cerebelo. Fora do painel, tudo continua como antes.
- **Regressão da Fase 0** (20 ciclos de selecionar e desselecionar, agora com vasos e seios): **0 de 1.253 malhas
  mudaram**.

## Limites e decisões a confirmar

- **Trajetos encostados no cerebelo:** onde o vaso estava muito dentro, ele agora encosta na superfície pelo lado
  mais próximo. Os trajetos ficam plausíveis, mas não foram redesenhados um a um pelo Machado (cap. 8) nem pelo
  Prometheus. Se algum ramo ficou estranho numa vista, eu redesenho esse ramo.
- **Seio transverso:** fica na margem posterossuperior dos hemisférios, sobre a superfície. Anatomicamente corre na
  margem fixa do tentório, junto ao osso occipital; como o atlas não tem crânio, a posição é aproximada.
- **TopBrain:** as artérias continuam cerca de 20% maiores que o resto do atlas (limite já anotado na reestruturação).
- **Vertebral do esquema:** foi conferida e corrigida junto com a do TopBrain.
