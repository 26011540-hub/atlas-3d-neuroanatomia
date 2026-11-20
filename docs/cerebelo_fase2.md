# Reforma do cerebelo, Fase 2: interior, núcleos e corpo medular (20/11/2026)

Roteiro: `mimir-cerebelo-prompt.md` (do autor). Capturas em `capturas/cerebelo-fase-2/`. Código novo em
`src/js/14-cerebelo-sereno3-interno.js`; formas dos núcleos em `src/js/05-nucleos-limbico-diencefalo.js`; corpo
medular por `scripts/process/sereno_corpo_medular.py` -> `models/cerebelo_sereno_branca.glb`.

## O que entrou (no painel do botão Cerebelo)

- **Transparência em três controles** (0 a 100%): córtex cerebelar, corpo medular e tronco. Com o córtex a partir de
  30%, o atlas mostra a superfície lisa do Sereno no lugar das folhas. As folhas empilhariam dezenas de camadas
  translúcidas e o cerebelo ficaria leitoso. O material transparente não escreve profundidade e é desenhado
  depois dos núcleos, que ficam opacos e aparecem por dentro. As fissuras acompanham o córtex.
- **Núcleos com forma** (Duus, p. 184; Prometheus, p. 240), agora também no cerebelo real:
  - **Fastigial:** o mais medial, junto ao teto do IV ventrículo.
  - **Globosos:** 3 massas arredondadas em fila. Antes eram 2.
  - **Emboliforme:** em cunha, mais grosso na frente, junto ao hilo do denteado. Antes era uma placa.
  - **Denteado:** lâmina pregueada em bolsa, com o hilo voltado medial e anteriormente.

  Cada um tem cor própria e contrastante (fastigial vermelho, globosos laranja, emboliforme verde-azulado, denteado
  roxo). Botão **SUIT** mostra o atlas probabilístico no lugar das formas.
- **Agrupar interpósito:** emboliforme e globosos ficam com uma cor só e, ao clicar em qualquer um, a seleção vai
  para "Núcleo interpósito".
- **Ficha dos núcleos** (duplo clique), com aferências, eferências e o pedúnculo de saída:
  - fastigial: núcleos vestibulares e formação reticular (trato fastigiobulbar, fascículo uncinado), pelo pedúnculo
    inferior;
  - globoso e emboliforme: núcleo rubro contralateral;
  - denteado: pedúnculo superior, núcleo rubro e tálamo VL contralaterais, córtex motor (áreas 4 e 6).

  Os textos estão em `data/registro_cerebelo.json` e seguem o roteiro.
- **Corpo medular real.** A superfície branca (`rh.white`) do mesmo cerebelo do Sereno, com a mesma transformação do
  córtex. As lâminas brancas que entram nas folhas são dados, não desenho. O botão "Destacar corpo medular" o
  mostra com o córtex a 70%.
- **Corte horizontal pelo denteado** (Duus, fig. 5.5a, plano 1). Plano de recorte com a face cortada preenchida:
  - córtex cinzento e substância branca com os ramos, pela tampa feita com o stencil;
  - núcleos em secção, calculados pela interseção de cada malha com o plano;
  - o denteado aparece como a linha ondulada da fig. 5.5b, aberta no hilo;
  - emboliforme, globosos e fastigial aparecem como áreas preenchidas.

  O tronco sai da vista. Esta Fase 2 implementa o sistema de recorte; o corte sagital da Fase 3 vai usá-lo.

## Critério de aceite

Com o córtex a 70% de transparência (e o tronco a 85%), na vista superior: fastigial junto à linha média →
globosos → emboliforme → denteado lateral (`3-aceite-transparencia-70-superior.png`). No corte horizontal, a mesma
ordem em secção (`1-corte-horizontal.png` e `2-corte-horizontal-perto.png`).

Regressão da Fase 0: 20 ciclos de selecionar e desselecionar (inclui emboliforme, globoso, fastigial e corpo
medular): **0 de 1.253 malhas mudaram**. Modo Atlas: núcleos e lóbulos continuam.

## Licenças

- **SUIT (núcleos probabilísticos):** CC BY, conforme o README da coleção cerebellar_atlases do Diedrichsen Lab
  (já em `data/sources.yaml` desde a reestruturação). Fica só como opção; as formas padrão são do Mímir.
- **Corpo medular:** cerebmap20 (Sereno 2020), com a mesma permissão do autor usada para o córtex. Uso não
  comercial e educacional.

## Limites e decisões a confirmar

- **Denteado do Sereno: não existe no pacote.** O `cerebmap20.tgz` só tem o córtex (pial e branca) e volumes sem
  rótulo de núcleo; a pasta "updates/dentate-nucleus" do site dá 404 desde 17/11. O denteado continua sendo a
  forma do Mímir (bolsa pregueada), posta no lugar do denteado do SUIT. Para usar o do Sereno seria preciso pedir o
  arquivo ao autor. O crédito em `sources.yaml` cita "núcleo denteado" e pode ser corrigido.
- **Posição dos núcleos:** as formas ficam num mesmo nível horizontal, como nos cortes do Machado e do Duus. No
  SUIT, o interpósito e o fastigial ficam de 0,5 a 0,8 cm acima do denteado.
- **Plano do corte:** horizontal no espaço do atlas, em y = -2,97 cm. O plano 1 do Duus segue o eixo do tronco e pode
  ser levemente oblíquo.
- **Manchas amarelas no corte:** são o fundo de sulcos entre o córtex e a substância branca, vistos através do plano.
