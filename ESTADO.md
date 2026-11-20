# Estado do projeto: Mímir: Atlas 3D de Neuroanatomia

Nota de passagem para quem continuar o trabalho (atualizada em 14/11/2026). Leia isto antes de mexer.

## O que é
Atlas 3D em arquivo único (`atlas-3d-neuroanatomia.html`, three.js r128 + GLTFLoader r128 via CDN) para estudo de Medicina (UEPG), com base em Ângelo Machado, Neuroanatomia Funcional, 4ª ed. O roteiro do trabalho está em `prompts-claude-code-atlas-neuroanatomia.md` (Prompt A feito; Prompt B em andamento, por fases aprovadas uma a uma).

## Como editar e gerar
- **Nunca edite `atlas-3d-neuroanatomia.html` direto.** A fonte é `src/` (partes) (cerca de 1.400 linhas, sem os dados pesados).
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

## Remodelagem 2 (Prometheus, plano em ~/.claude/plans/squishy-knitting-steele.md)
| Etapa | Estado |
|---|---|
| A. Fluidez e base visual | Feita: desenho sob demanda (`sujo`/`marca()`, `frame()`), carga de 7,0 s para 2,4 s, materiais por tecido em `register`, destaque de seleção sem estourar, geradores `blob`, `fita`, `vaso`; cerebelo liso (refino 0,085, folhas só no sombreado) |
| B. Cerebelo (separar, árvore da vida com lóbulos e lobos, núcleos reais) + Bisturi | Feita: `CB.corte(sel)` redesenha o corte (lóbulos com cor e nome, faixa do lobo, 3 níveis de lâminas), clique no corte abre o lóbulo (`loboDoCorte`); núcleos com forma do Prometheus p. 240 (denteado em bolsa pregueada); `state.separado`/`stepSep`/`SEP_MESH` afasta o cerebelo e mostra cortes dos pedúnculos (`cortePed`); bisturi `state.removidos` (chave id|lado), `renderBisturi`; fissuras com refino extra (`refina` com `deve`) |
| C. Tronco isolado, pares com ramo de 2 cm ou inteiros | Feita: `state.troncoIso` (`setTroncoIso`, painel `#tipainel`, `TI_VISTA` perpendicular ao eixo do tronco, cores `TI_COR`, fora `TI_FORA`); `state.nervos` sem/curto/inteiro (`setNervos`, `aplicaNervos` corta os tubos em 2 cm com drawRange; fibras intra-axiais marcadas `intra`); pedúnculos cerebrais em `fita`, colículos em `blob`, corte da medula com o H |
| D. Límbico, núcleos da base, diencéfalo, hipófise, vias | Feita: cápsulas interna, externa e extrema e claustro como lâminas tiradas do envoltório real do putame/pálido (`envX` com fechamento de furos, `laminaEnv`; externa/claustro/extrema a 1/2,5/4 mm do putame); fórnice, comissuras, lâmina terminal, tratos e nervo óptico em `fita`; núcleos e corpos em `blob`; hipófise com `adeno`, `neurohip` e haste; septo em duas lâminas; vias com leque cortical (`leque`) |
| E. Vasos completos | Feita: carótida interna em 4 partes (`partes()`, pai `aci`: cervical, petrosa, cavernosa, cerebral; Prometheus p. 246); vertebral com parte transversária e alça sobre o atlas; `ondula()` dá sinuosidade suave a artérias e veias (não aos seios, `SEIOS`); `galhos()` (opção `galhos`: lat/med/inf/cbs/cbi) divide os ramos corticais e veias superficiais até a periferia; cerebelares continuam sobre o cerebelo; novos: seio marginal, emissárias, oftálmica superior, occipital interna; Trolard, Labbé, basal e petrosos confirmados no Prometheus p. 254-259 |
| F. Revisão e publicação | Feita: 27 lições e teste sem erros, tema escuro e celular conferidos, lição nova da carótida interna, seio cavernoso translúcido (sifão visível); carga 2,7 s, 1,66 milhão de triângulos, 1.297 malhas; enviado ao GitHub e link do Claude republicado |

Prometheus: `Atlas de Anatomia  PrometheusPDF_261114_205537.pdf`, 352 p., texto pesquisável; neuroanatomia a partir da p. 178 do PDF (impressa N ≈ PDF N+12). Só referência visual e segunda fonte; figuras não entram no atlas.

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

## Remodelagem 3 (Unicamp como gabarito e modelo; bolachas em 3D)
Plano aprovado: 0 organizar, otimizar e design; 1 gabarito (12 cortes coronais da Unicamp x Notas x Machado); 2 giros, sulcos e límbico completos; 3 bolachas em 3D; 4 tronco e medula em fatias; 5 revisão e publicação.

Unicamp (anatpat.unicamp.br: atlas de cortes coronais e séries axial, sagital, superfície e medula): direitos dos autores, vedado uso comercial e reprodução em bloco. Usar como gabarito e modelo de forma e posição; nunca copiar fotos ou desenhos; botão "ver a peça real na Unicamp" por nível. Notas do Gustavo (Notas_261115_110255.pdf): só leitura, nada publicado.

| Fase | Estado |
|---|---|
| 0. Organizar, otimizar, design | Feita: fonte dividida em `src/` (16 partes JS em ordem; o build confere a sintaxe e gerou HTML idêntico ao anterior); acidentes da medula retirados (cilindro com ponta lisa); `refina` do cerebelo reexamina só os triângulos novos (carga de 2,8 s para 1,8 s, mesma geometria); barra do palco em três grupos (Modo: Explorar ou Tronco e medula; Vista; Ferramentas), vistas rolam de lado no celular |
| 1. Gabarito | Feita: `GABARITO.md` e `gabarito/unicamp-coronal.json` (gerados por `gabarito/montar_gabarito.cjs`): 12 cortes, 171 estruturas da Unicamp, 136 já no Mímir, 32 faltam, 10 sem a parte; transcrição das Notas em `notas/notas-rotulos.json` (21 p., 377 rótulos, 15 dúvidas; pasta fora do Git); `FONTES.md` com licenças; dúvidas no REVISAR |
| 2. Giros, sulcos e límbico | Feita: `src/js/10-sistema-limbico.js`: lobos frontal, parietal, temporal, occipital e límbico (`LOBO_DK`, pintados por lobo em `applyAppearance`), istmo do cíngulo, fissura longitudinal, giro subcaloso, hipocampo dividido em pé e corpo, álveo, subículo, fascículos do cíngulo e mamilotalâmico, estria terminal, substância inominada e Meynert, trígono e comissura das habênulas; lições "Lobos do cérebro" e "Sistema límbico" (29 lições); gabarito: 150 de 171 |
| 3. Bolachas em 3D | Feita: `src/js/14-bolachas.js` (+ `01-gabarito.js`, gerado do gabarito). 12 planos `BOL_Z` calibrados pelas estruturas-chave de cada corte da Unicamp; face calculada por interseção malha × plano e preenchimento par-ímpar por linha (córtex e cerebelo: faixa cinzenta por distância à superfície, rótulo do giro mais próximo; tronco: contornos abertos fechados por `fecha()`; lâminas como traços); "Todas separadas" (cartões com as duas faces e borda) e "Fatia em foco" (malhas cortadas por `renderer.clippingPlanes` + faces por cima); números do gabarito, lista no painel, clique e passagem do mouse, cores "do atlas" e "peça real", teste por bolacha, link para a peça na Unicamp; ~0,25 s por face, preparadas aos poucos |
| 4. Tronco e medula em fatias | Feita: `bolSecao(z, G)` aceita qualquer plano (O, n, u, v); `src/js/10-tronco-interno.js`: `eixoTronco(f)` (eixo suavizado do perfil), núcleo olivar inferior, grácil, cuneiforme, núcleos pontinos, formação reticular, corpo trapezoide, FLM; `src/js/14-cortes-tronco.js`: 7 cortes do tronco (`TC_NIVEIS`, gabarito Unicamp série axial + Machado) no modo Tronco e medula, com o tronco cortado em 3D (plano de recorte) e face calculada, esquema 2D ao lado (clique e passagem do mouse), lista, teste; 3 cortes esquemáticos da medula (C, T, L) desenhados (`tcMedula`). Tronco e cerebelo preenchidos por inundação após `fecha()`; regiões da superfície do tronco viram faixa de borda |
| 5. Revisão e publicação | Feita: créditos na página (Prometheus e Unicamp como gabarito), 29 lições, teste, temas e modos sem erros; enviado ao GitHub e link do Claude republicado. Carga: 1,8 s medida na Fase 0; na revisão o painel do navegador estava escondido e tudo rodou ~2× mais lento por igual (3,4 a 3,9 s) |

## Reestruturação com fontes abertas (PROMPT_MIMIR.md, desde 17/11/2026)
- Fase 0 (diagnóstico e infraestrutura): `docs/diagnostico_fase0.md`. Manifesto `data/sources.yaml`; `node scripts/gerar_creditos.mjs` gera `CREDITS.md` e a aba Créditos (entre `<!--CREDITOS:INICIO-->` e `<!--CREDITOS:FIM-->` em `src/corpo.html`). Python 3.12 em `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` (fora do PATH); bibliotecas em `scripts/requirements.txt`.
- Pipeline: `scripts/download_sources.py` (dados brutos em `data/raw/`, fora do git, com sha256) -> `scripts/process/*.py` (GLB em `data/processed/`, fora do git) -> `node scripts/process/comprimir.mjs <glb> 1` (gltfpack/meshopt em `models/`, que vai para o git).
- Fase 1 (cerebelo real, Sereno 2020): `scripts/process/sereno_cerebelo.py [folhas|estudo]`; `models/cerebelo_sereno_folhas.glb` (700 mil triângulos) e `models/cerebelo_sereno_estudo.glb` (160 mil, suavizado); `src/js/14-cerebelo-sereno.js` com os modos Atlas, Folhas, Estudo e Lobos (botões `data-cbm`). Os GLB de `models/` são carregados por arquivo, sob demanda: abrir o atlas por um servidor (não por `file://`). O meshopt_decoder vem do jsDelivr (three@0.128.0).
- O GLB quantizado do gltfpack precisa virar Float32 antes de `applyMatrix4` (ver `cbsCarregar`).
- Fase 1, lóbulos e núcleos: atlas SUIT (Diedrichsen 2009, CC BY, MNI 2009c simétrico) em `data/raw/diedrichsen2009/`; `scripts/process/suit_cerebelo.py` registra o SUIT à envoltória do Sereno, grava o índice do lóbulo no canal vermelho da cor de cada vértice (COLOR_0) dos dois GLB do Sereno e gera `models/cerebelo_suit_nucleos.glb`. Ordem da pipeline do cerebelo: `sereno_cerebelo.py` -> `suit_cerebelo.py` -> `comprimir.mjs` dos três GLB. O modo Lobos usa a malha com folhas e cores por lóbulo (`CBS_LOBULO_COR`); nos modos reais os núcleos do SUIT substituem os esquemas (item novo `interposito`).
- Fase 2 (tronco): fontes `lusebrink2021` (T1 de 250 µm, 1,64 GB em `data/raw/`), `massp2`, `mni_icbm152_2009b` (só registro). Pipeline: `lusebrink_mni.py` (registro SimpleITK e recorte do tronco a 0,25 mm em MNI; `--so-reamostrar` refaz só o recorte) -> `mni_para_mimir.py` (afim MNI -> Mímir pelas estruturas subcorticais) -> `massp_nucleos.py` + `comprimir.mjs` (`models/massp_nucleos.glb`) -> `bolachas_tronco.py` (`models/bolachas_tronco/`, 8 níveis, WebP + PNG de rótulos + JSON). No app: `14-d-tronco-massp.js` (seletor "Núcleos do tronco: Esquema | MASSP") e `14-cortes-tronco2-rm.js` (botão "Modelo | RM real" no painel dos cortes do tronco e o nível novo "Dec. pirâmides").
- Atenção: arquivos JS que sobrescrevem funções do atlas precisam ter nome que ordene ANTES de `14-interface.js` (ele fecha o escopo principal).
- Fase 3 (pares cranianos): fonte `visible_korean` (CC BY-NC) em `data/raw/visible_korean/` (STL extraídos em `extraido/`) e `halle_cranio` (baixado, ainda não usado). `scripts/process/vk_nervos.py` -> `models/vk_nervos.glb`, `models/vk_cranio_base.glb`, `models/vk_forames.json`. No app: `14-e-nervos-vk.js` (seletor "Pares cranianos: Esquema | Só nervos | Nervo + núcleo + forame"; cor por par em `VK_COR_NERVO`).
- Fase 4 (vias): fonte `hcp1065` (human.tt.gz, 3 MB). `scripts/process/hcp_vias.py` decodifica o formato tt do DSI Studio (e tem a tabela ITENS); `scripts/process/hcp_fibras.py` grava `models/hcp_fibras.bin` + `.json` (fibras em linhas, desenhadas com THREE.LineSegments; `userData.semBolacha` as tira dos cortes). No app: `14-f-vias-hcp.js` (seletor "Grandes vias: Esquema | HCP1065"; ids existentes v_cs, v_cn, v_lm, v_opt, v_aud recebem os feixes reais; itens novos `hcp_*`).
- O atlas abre com o cerebelo real no modo Folhas (`setCerebeloModo('folhas', true)` no fim de `14-cerebelo-sereno.js`); o modelo antigo fica no botão Atlas da linha Cerebelo.
- Desempenho: o cerebelo real tem dois níveis de detalhe com as folhas (`cerebelo_sereno_leve.glb`, 250 mil triângulos, de longe e em telas de toque; `cerebelo_sereno_folhas.glb`, 700 mil, com a câmera a menos de 24 cm); a troca é feita em `placeCamera` (14-cerebelo-sereno.js). O leve carrega primeiro, o detalhado em segundo plano.
- Vias HCP1065: filtros por tipo (`HCP_TIPOS`, linha `#hcpTipos`) e modo via (`HCP_RELES`: ao escolher a via, `state.realce` com os relés e isolamento automático).
- Depuração: com `#debug`, `atlasDebug.select` e `atlasDebug.applyVisibility` são as funções ORIGINAIS (sem os envoltórios dos arquivos 14-*); para testar o comportamento real, clicar nos botões da interface. `cbsDebug` e `tcRmDebug` expõem o estado do cerebelo real e das bolachas da RM.
- Fase 5: fontes `allen_hra3d` (annotation_full + ontologia 16) e `neudorfer2020` (MNI152b 0,25 mm), além do MASSP. `scripts/process/fase5_nucleos.py` -> `models/fase5_nucleos.glb` (91 malhas). No app: `14-g-nucleos-reais.js` (seletor "Núcleos profundos: Esquema | Atlas reais").
- Modo circuito: `14-h-circuitos.js` (linha "Circuitos: Nenhum | Papez | Alça direta | Alça indireta" abaixo de "Núcleos profundos"); carrega os atlas reais se preciso; tabela CIRCUITOS.
- Fase 6: `14-i-territorios-jhu.js` (fonte dos territórios: Esquema | Atlas JHU; `scripts/process/jhu_territorios.py`) e `14-h2-arterias-topbrain.js` (artérias reais do TopBrain; `scripts/process/topbrain_vasos.py`, marcos do polígono em `data/alvos_willis.json`).
- Fase 7 (revisão final, 19/11/2026): `node scripts/gerar_creditos.mjs` confere o manifesto (23 fontes, 23 assets, 34 arquivos de modelo) e gera CREDITS.md e a aba Créditos com selos NC e SA; `node scripts/relatorio_fontes.mjs` gera `docs/fontes_e_licencas.md` (base do capítulo de métodos do TCC). `scripts/embutir_glb.mjs` agora recusa arquivos 14-* que ordenem depois de `14-interface.js`. Teste de fumaça: todos os modos novos ligados em sequência sem erro.
- Pendências gerais: créditos do Allen HRA e do JHU a conferir na página da fonte; nome do autor nos créditos; licença do projeto (decisão 4 do diagnóstico); PROMPT_MIMIR.md fora do git; OpenEar, Julich, BigBrain, BodyParts3D, CerebrA e o crânio de Halle previstos e não usados.
