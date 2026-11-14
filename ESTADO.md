# Estado do projeto: Atlas 3D de Neuroanatomia

Nota de passagem para quem continuar o trabalho (atualizada em 14/11/2026). Leia isto antes de mexer.

## O que é
Atlas 3D em arquivo único (`atlas-3d-neuroanatomia.html`, three.js r128 + GLTFLoader r128 via CDN) para estudo de Medicina (UEPG), com base em Ângelo Machado, Neuroanatomia Funcional, 4ª ed. O roteiro do trabalho está em `prompts-claude-code-atlas-neuroanatomia.md` (Prompt A feito; Prompt B em andamento, por fases aprovadas uma a uma).

## Como editar e gerar
- **Nunca edite `atlas-3d-neuroanatomia.html` direto.** A fonte é `scripts/atlas.modelo.html` (cerca de 1.400 linhas, sem os dados pesados).
- Gerar o atlas: `node scripts/embutir_glb.mjs` (junta modelo + `dados_brainder/cortex.glb` em base64 + `dados_brainder/marcos.json`).
- Refazer as malhas: `node scripts/converter_brainder.mjs 150000` (só é preciso se mudar a conversão).
- Ver no navegador: servidor em `.claude/launch.json` (nome `atlas`, porta 8765). Abrir `http://localhost:8765/#debug` expõe `window.atlasDebug` (state, ITEMS, select, setView, camGoal etc.) para testes.
- Não há Python na máquina: os scripts são Node. Detalhes da conversão em `scripts/LEIAME.md`.
- Em comandos de shell longos (heredoc acima de ~7 KB) o comando é truncado: gravar arquivos com a ferramenta de escrita.

## Convenções do código
- Eixos (cm): X = esquerda (+), Y = superior, Z = anterior. Plano mediano em x = 0.
- **Modelo simétrico:** só o lado esquerdo é convertido; o direito é espelho (`ESPELHO` em `addCortex`). `side = +1` é esquerdo, `-1` direito, `0` mediano.
- `META[id]` guarda `name, grp, color, f, i, c, nota, conf, ref`. Auxiliares, nesta ordem no arquivo: `M()` cria, `NOTA()` nota sobre a malha, `REF()` fonte conferida, `TXT()` reescreve campos, `CONF()` marca "a confirmar" (texto vazio remove a marca).
- Geometria esquemática: `ell()` e `tube()`; `tube` aceita lista (espelhada) ou função `sx => pontos`.
- Apoio na malha real: `ENV[sx]` (`radial`, `med`, `inf`, `topo`), `surf`, `medP`, `infP`, `CONT.pt(grau, folga)` (contorno sagital), `S(sx, u)` (sulco lateral), `cen`/`bd` (centroides e bordas da parcelação, de `marcos.json`), `MARCOS.tronco` (perfil ventral do tronco).
- Nervos e núcleos (grupo `nc`): `NC()` cria nervo (campos extras `nuc`, `orig`, `forame`), `NU()` cria núcleo (campo `col`, cor pela coluna em `COLF`). Geometria no referencial do tronco: `B(i, lat, prof)` (índice no perfil ventral, afastamento lateral, profundidade ventral para dorsal), `F(i)` (profundidade do assoalho do aqueduto e do IV ventrículo, da malha), `latT(i, prof)` (superfície lateral), `colN()` (coluna de núcleo). Com a camada ligada, tronco e cerebelo ficam translúcidos (`TRANSL`).
- Vias (grupo `vias`): `via(id, pontos, r)` desenha o tubo no sentido da condução e guarda a curva em `VIAC` para as setas (`stepSetas`). Pontos de lesão em `LES[via]` (`nome`, `p`, `txt`, `campo` opcional para o SVG do campo visual); viram esferas registradas no item da via com `userData.les`. `state.lesao` liga os pontos; `state.les` guarda o ponto escolhido. `BE(i, lat, prof)` estende o referencial do tronco abaixo do bulbo (coto da medula). `cItem(id, sx)` dá o centroide de uma malha real.
- Estudo (Fase 6): teste com `state.qmodo` (`est`, `art` usa `OCLUSAO`/`ART_Q`, `les` usa `LES_Q`, montado de `LES`); `limparVista()` zera os modos a cada pergunta e `mostrarResposta()` mostra território ou ponto. Rótulos HTML em `#rotulos` (`stepRotulos`, a cada quadro, com corte de sobreposição); `state.ocultar` + `REVELADO` escondem nomes nos rótulos, na dica e no painel. Vista `base` liga `state.vistaBase`, que filtra artérias e veias por `BASE_FICA`. Aba Créditos em `#credP`.
- Aparência central em `applyAppearance()`; visibilidade em `applyVisibility()`.

## Fases do Prompt B
| Fase | Estado |
|---|---|
| 1. Simetria e aviso de modelo idealizado | Feita |
| 2. Ventrículos e fluxo do líquor (cap. 8) | Feita |
| 3. Vascularização: artérias, territórios, modo AVC, polígono de Willis, venoso (cap. 8 e 18) | Feita, com pendências abaixo |
| 4. Nervos cranianos: 12 pares, 18 núcleos em 6 colunas funcionais (cap. 5, 10, 17, 19) | Feita, com pendências abaixo |
| 5. Grandes vias e modo Lesão (cap. 21, 22, 24, 27, 29, 30) | Feita: 11 vias com 34 pontos de lesão. Trajeto autonômico descendente do hipotálamo não desenhado (livro não descreve) |
| 6. Modos de estudo (teste ampliado, ocultar rótulos, vista base do crânio), Créditos | Feita |

## Remodelagem com o kit do Anatomy Learning (pedida em 14/11/2026)
O kit (dados extraídos do app Anatomy Learning) fica fora do projeto: o próprio kit proíbe publicar o material, e o atlas é público. Ele serve só como lista de conferência do que falta e como referência visual. Tudo o que entra é desenhado sobre a malha e escrito a partir do Machado.
| Etapa | Estado |
|---|---|
| 1. Cerebelo: lobos, 17 lóbulos, 8 fissuras, folhas, pedúnculos, corte sagital | Feita |
| 2. Tronco encefálico detalhado (faces anterior, lateral e posterior, assoalho do IV ventrículo) | Feita |
| 3. Vascularização completa (artérias centrais, veias profundas e da fossa posterior, seios que faltam) | Feita (27 itens novos; os que o Machado não descreve estão marcados) |
| 4. Prosencéfalo e envoltórios (sulcos, unco, partes do corpo caloso, ventrículos por partes, foice, tentório, medula cervical) | Feita |
| 5. Ramos dos nervos cranianos (V1-V3, VII, IX, X, gânglios, seio cavernoso) | Feita |
| 6. Interface nova (lições guiadas, pinos numerados, legenda por tecido, PT/Latim/EN, quiz de clicar) | Feita. A remodelagem está completa |

Interface (etapa 6) no código: palco sempre escuro (CSS `.stage`, luz com `escuro = true`). Aba Lições (`#licP`): dados em `LICOES` (tópicos com lições: vista `v`, alvo `a`, distância `d`, `th`/`ph`, grupos `g`, itens `i`, texto `x`); `abrirLicao`, `passo`, `renderLicao`, `sairLicao`; `state.licao` apaga o resto (op 0,13) e mostra sulcos da lição. Pinos: `stepRotulos` desenha colunas laterais com linhas no SVG `#pinos`; âncora em `ancoraDe` (vértice mais próximo do centro). Idioma: `state.lingua`, `NOMES[id] = [latim, inglês]`, `nomeL`. Legenda por tecido `legenda()` no laço. Teste modo `clique`: `pick` chama `responderClique`.

Ramos dos nervos no código: textos em `RAMOS`; geometria no bloco "RAMOS DOS NERVOS CRANIANOS E GÂNGLIOS" (antes do prosencéfalo). As divisões do V viraram itens (`n_oft`, `n_max`, `n_mand`, `g_trig`) com pai `nc5`; ramos do VII com pai `nc7`. Botão `#cavernoso` usa `state.realce` (itens que não esmaecem); `select()` limpa `state.realce`.

Prosencéfalo no código: textos em `SULCOS` e logo depois; geometria no bloco "PROSENCÉFALO E ENVOLTÓRIOS" (antes dos pontos de lesão das vias, porque usa `TAL` e `cItem`). Sulcos em `SUL_DEF` (face 0 lateral, 1 medial, 2 inferior); têm `userData.sulco` (só aparecem com `state.sulcos` ou selecionados) e `fis`. Corpo caloso em 4 partes (`CCC`, `CCR`), pai `cc`. Ventrículo lateral dividido por malha (`porGeo`), pai `vlat`. Grupo novo `men` (pregas da dura-máter), desligado por padrão; `laminaSag()` faz lâmina no plano mediano.

Vasos novos no código: textos em `NOVOS_VASOS`; geometria no bloco "VASCULARIZAÇÃO AMPLIADA" (antes dos braços dos colículos). `CB.HP` (superfície do cerebelo) e `CB.sag(t, folga)` (contorno sagital do verme) apoiam as veias do cerebelo; `Bd()` estende o referencial do tronco abaixo do bulbo. Os ramos temporais e a polar frontal têm `userData.pai` (a_temp, a_fbm). `ventral(i, d)` só aceita nível inteiro.

Tronco no código: bloco logo antes de "NÚCLEOS DA BASE, LÍMBICO, DIENCÉFALO". Junta mesenc, ponte e bulbo numa malha (soldando as emendas), refina, gruda a borda mediana em x = 0 (a metade original tinha fresta), suaviza e mede cada ponto no referencial do tronco (`nivel`, `prof`, distância lateral). O assoalho do IV ventrículo é a parte dorsal colada à malha do v4. Cada acidente vira item (lista `TE_ITENS`); `userData.pai` é a parte (mesenc, ponte, bulbo). Sulcos têm `userData.fis` (acendem em amarelo). `nuvem()` ignora geometria repetida.

Cerebelo no código: bloco `CB` logo depois do córtex. Tira as malhas lisas `cerebelo` e `vermis`, refina (`refina`, arestas < 0,5 mm; 0,75 mm em tela de toque), suaviza (`taubin`), classifica cada vértice pelo ângulo em torno do fastígio (`classifica`, tabela `FIS`) e cava fissuras e folhas. Cada lóbulo e fissura vira item (`cb_*`, `f_*`); `userData.pai` (cerebelo ou vermis) e `userData.lobo` (cb_ant, cb_post, cb_fn) fazem o item-pai acender o conjunto. O corte sagital (`arbvida`) é uma textura de canvas, visível só com um hemisfério oculto (`userData.corte`). Pedúnculos `pcs`, `pcm`, `pci` ficam depois de `TRANSL`.

## Publicação
- GitHub: https://github.com/26011540-hub/atlas-3d-neuroanatomia (público, ramo main). Para atualizar: gerar o atlas, depois git add, commit e push. O gh está em C:Program FilesGitHub CLIgh.exe, já com login.
- GitHub Pages: https://26011540-hub.github.io/atlas-3d-neuroanatomia/ (o index.html redireciona para o atlas; cada push republica em cerca de 1 minuto).
- Ficam fora do Git (.gitignore): PDFs dos livros, downloads brutos do Brainder, kit do Anatomy Learning, prompts.

## Pendências conhecidas
- Lista completa do que não foi conferido no livro: `REVISAR.md`.
- Seios occipital e intercavernosos foram criados, mas não vistos na tela; o occipital pode atravessar a malha do cerebelo.
- No modo AVC o território escurece nos dois hemisférios (geometria compartilhada pelo espelho).
- Testados na Fase 6: tema escuro e largura de celular (375 px, sem rolagem horizontal). Não testados: abrir por duplo clique, "reduzir movimento".
- O link publicado (https://claude.ai/artifact/SaNrUDfKhnjXazJUvLkXeM) foi atualizado em 14/11/2026 com a remodelagem completa (versão 3); qualquer pessoa com o link vê as atualizações. Para republicar, a página precisa ir sem as três primeiras linhas (`<!doctype html>`, charset, viewport).
- AVC de tronco e cerebelares depende da leitura do cap. 19.
- Fase 4: a p. 95 do Machado (Tabela 10.1) saiu em branco na digitalização; forames do trigêmeo ficaram "a confirmar". Fibras intra-axiais do troclear não desenhadas (cap. 16).
- No Machado extraído, caps. 21 a 24: p. 197 = m199, p. 207 = m208, p. 224 = m225.
- No Machado extraído, caps. 27 a 30: p. 249 = m249, p. 268 = m267, p. 280 = m279, p. 286 = m285.
- No Machado extraído, a imagem da página N varia: p. 43 = m050, p. 96 = m100, p. 151 = m153, p. 177 = m179. Páginas em branco: m051, m099.

## Bibliografia na pasta
- `Neuro _261112_230548.pdf`: Machado, 4ª ed., volume único, **escaneado, sem texto pesquisável** e grande demais para o leitor de PDF. Para ler: `node scripts/extrair_paginas_pdf.cjs "<pdf>" "<pasta de saída>" m` extrai as 345 páginas como JPEG, e cada uma é lida como imagem. A página impressa N fica perto da imagem N+2 (ex.: p. 75 = m080, p. 162 = m164, p. 168 = m170); confirmar sempre pelo número no rodapé. Sumário em m010.
- `Diagnóstico_Topográfico_de_NeurologiaDUUS_5ªEd...pdf`: Duus (o "Das" do prompt). Escaneado; ainda não foi aberto (o extrator acima não achou imagens JPEG nele e falta `pdftoppm`).
- `Neuroanatomia Funcional II  Guia de Estudo...pdf`: tem texto pesquisável (`pdftotext` funciona); cobre caps. 17 a 20 e 24 a 30.
- Netter, Rhoton e Dângelo não estão na pasta.

## Preferências do usuário
- Idioma: português. Quer o modelo o mais realista possível, mas idealizado e simétrico.
- Não inventar anatomia: o que não estiver no Machado vai como "a confirmar" e para o `REVISAR.md`. Citar capítulo e página.
- Trabalhar uma fase por vez, testar no navegador com capturas e mostrar antes de seguir. Capturas ficam em `capturas/faseN-.../`.
- Crédito obrigatório: Brain for Blender, Anderson M. Winkler (brainder.org), CC BY-SA 3.0.
