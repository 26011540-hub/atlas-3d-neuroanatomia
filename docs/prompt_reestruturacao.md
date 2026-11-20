# Prompt para o Claude Code — Mímir: reestruturação do atlas com fontes abertas

> Cole tudo abaixo da linha no Claude Code, aberto na pasta do projeto Mímir.
> Trabalhe uma fase por vez: ao fim de cada fase, pare, mostre o resultado e espere eu aprovar antes da próxima.

---

## Contexto

Você está trabalhando no **Mímir**, um atlas 3D interativo de neuroanatomia que eu (Gustavo de Castro Moreira, estudante de Medicina da UEPG) desenvolvo como projeto de extensão de autoria própria, gratuito e não comercial, e que pode virar meu TCC. Quero melhorar o atlas inteiro: design e precisão anatômica do cerebelo, núcleos, tronco encefálico com cortes ("bolachas"), pares cranianos, vias ascendentes e descendentes, sistema límbico, núcleos da base, grandes vias de substância branca, corpo caloso e vascularização.

O site atlas.cerebrarium.com (NeuroAtlas) serve **só como inspiração de design e de funcionalidades**. **Nunca** baixe, copie ou adapte malhas, texturas, textos, rótulos ou código desse site. Todo dado 3D deve vir das **fontes originais** listadas abaixo.

## Regras obrigatórias (valem para todas as fases)

1. **Proveniência de cada arquivo.** Crie e mantenha `data/sources.yaml`. Cada asset gerado (malha, volume, textura) tem uma entrada com: `id`, `estrutura`, `fonte`, `url_original`, `doi`, `licenca`, `credito_exato`, `comercial_permitido` (true/false), `share_alike` (true/false), `processamento` (o que foi feito: extração de isosuperfície, decimação, suavização, registro para MNI etc.) e `data_download`.
2. **Créditos.** Gere automaticamente `CREDITS.md` e uma página de créditos dentro do app a partir do `sources.yaml`. Use o texto de crédito exato de cada fonte. Nada entra no app sem entrada no manifesto.
3. **Não comercial e share-alike.** Marque visualmente no manifesto e nos créditos os assets NC (não comercial) e SA (mesma licença). Os assets derivados de fontes SA devem ser distribuídos sob a mesma licença da fonte. Meu código e meus textos são separados disso.
4. **Dados brutos fora do git.** Downloads vão para `data/raw/` (no `.gitignore`), com um script `scripts/download_sources.py` que baixa tudo de novo a partir do manifesto e confere checksums quando a fonte fornecer. Os assets processados vão para `public/models/` (ou a pasta equivalente do projeto).
5. **Espaço comum.** Tudo alinhado a um único espaço de referência (MNI ICBM152 2009c, ou o que o projeto já usa — verifique antes). Registre no manifesto a transformação aplicada. Faça uma verificação visual de alinhamento (screenshot ou overlay) a cada estrutura nova.
6. **Nomenclatura.** Nomes das estruturas seguindo a Terminologia Neuroanatomica (FIPAT 2017): latim + português, com os termos em inglês como sinônimo.
7. **Separar o que é meu.** Textos didáticos, rótulos em português, esquemas desenhados por mim e roteiros de estudo ficam marcados no manifesto como `fonte: Mímir (autoria própria)`. Isso precisa ficar explícito para o TCC.
8. **Não invente dados.** Se uma fonte não puder ser baixada (link quebrado, exige login, sem rede), pare, me diga qual é e me proponha a alternativa da lista. Nunca substitua por modelo de origem desconhecida.
9. **Desempenho.** Cada malha com níveis de detalhe (LOD) e compressão (glTF/GLB com meshopt ou Draco). O atlas deve continuar fluido no navegador de um notebook comum.

## Fontes autorizadas

| Fonte | O que usar | Licença | Onde |
|---|---|---|---|
| Sereno et al. 2020, cerebmap20 (+ rótulos do vérmis e núcleo denteado) | Superfície do córtex cerebelar, vérmis, núcleo denteado | **Permissão do autor por e-mail (17/11/2026)**, uso não comercial e educacional | https://mri.sdsu.edu/sereno/cereb/data · .../updates/vermis-labels/ · .../updates/dentate-nucleus/ |
| Lüsebrink et al. 2021 (7 T, OpenNeuro ds003563) | T1 250 µm, T2, TOF 150 µm, QSM — cortes do tronco e base para segmentações | CC0 | openneuro.org (ds003563) · doi 10.25673/79458 |
| CerebrA (Manera 2020) + MNI ICBM152 2009c | Lobos, giros (DKT), cerebelo, vérmis, template | Registro CC0; rótulos Mindboggle CC BY-NC-SA 3.0; template com aviso de copyright MNI | doi 10.12751/g-node.be5e62 · nist.mni.mcgill.ca |
| MASSP 2.0 (Bazin 2025, AHEAD) | Núcleos da base, tálamo, núcleo rubro, substância negra, subtalâmico, colículos, corpos geniculados, habênula, fórnix, comissuras, cápsula interna, ventrículos | CC BY 4.0 | doi 10.21942/uva.27291579 |
| Neudorfer & Germann 2020 | Núcleos do hipotálamo, corpos mamilares, trato mamilotalâmico, zona incerta | CC BY 4.0 | zenodo.org/records/3942115 |
| Allen Human Reference Atlas 3D 2020 | Núcleos talâmicos, regiões hipotalâmicas, pineal | CC BY 4.0 | download.alleninstitute.org/informatics-archive/allen_human_reference_atlas_3d_2020/version_1/ |
| HCP1065 (Yeh 2022) | Tratos de substância branca (corticoespinal, lemnisco medial, fascículos, corpo caloso, radiações) | CC BY-SA 4.0 + agradecimento ao HCP | github.com/data-others/tract · brain.labsolver.org |
| Julich-Brain v3.1 | Núcleos cerebelares (denteado, interpósito, fastigial), córtex citoarquitetônico | CC BY-NC-SA 4.0 | EBRAINS |
| BigBrain 2015 | Volumes histológicos em MNI (cortes com aspecto de lâmina), superfícies pial e branca | CC BY-NC-SA 4.0 | ftp.bigbrainproject.org/bigbrain-ftp/BigBrainRelease.2015/ |
| Visible Korean (cabeça masculina) | Nervos cranianos, gânglios, cortes em cor real | CC BY-NC 4.0 | doi 10.5281/zenodo.22759852 · sites.google.com/ajou.ac.kr/anatomy |
| BodyParts3D | Veias e artérias esquemáticas, estruturas gerais | CC BY 4.0 (verificar página de licença atual) | dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html |
| TopBrain 2025/2026 | Artérias e seios venosos reais (CTA/MRA), polígono de Willis | opendata.swiss: livre com citação; comercial só com permissão | zenodo.org/records/21972006 |
| Territórios arteriais JHU (Liu 2023) | Territórios da ACA, ACM, ACP e vertebrobasilar | CC BY-SA 4.0 | nitrc.org/projects/arterialatlas/ |
| Crânio de Halle (micro-CT) | Ossos do crânio, fossas, forames | CC BY 4.0 | doi 10.5281/zenodo.6108435 |
| OpenEar (Sieber 2019) | Osso temporal, orelha interna, nervo facial no canal | CC BY 4.0 | zenodo.org/records/1473724 |
| FIPAT — Terminologia Neuroanatomica 2017 | Nomes das estruturas | Termos em domínio público | fipat.library.dal.ca |

Crédito do cerebelo (use exatamente este texto):
> Superfície do córtex cerebelar, vérmis e núcleo denteado: Sereno MI, Diedrichsen J, Tachrount M, Testa-Silva G, d'Arceuil H, De Zeeuw C. *PNAS* 2020;117:19538–19543 (cerebmap20, https://mri.sdsu.edu/sereno/cereb/data). Utilizado com permissão do autor (comunicação pessoal, 17 nov. 2026).

## Fase 0 — Diagnóstico e infraestrutura (faça primeiro, sem mudar o visual)

1. Leia o projeto inteiro e me descreva: stack (three.js? framework?), como os modelos são carregados, espaço de coordenadas atual, lista de estruturas que já existem e de onde cada uma veio (se não souber a origem de algum modelo atual, liste como "origem desconhecida — substituir").
2. Crie `data/sources.yaml`, `scripts/download_sources.py`, a pipeline de processamento em `scripts/process/` (Python: nibabel, scikit-image marching cubes, trimesh/pymeshlab para suavização e decimação, exportação para GLB) e o gerador de `CREDITS.md` e da página de créditos.
3. Proponha um **sistema de design** único para o atlas: paleta por sistema (cerebelo, núcleos da base, límbico, tálamo/hipotálamo, tronco, nervos, vias ascendentes, vias descendentes, artérias, veias, ossos, meninges), materiais (fosco para substância cinzenta, levemente acetinado para substância branca, translúcido para estruturas de contexto), espessura de contorno ao destacar e tipografia dos rótulos. Mostre em um arquivo de preview antes de aplicar.

**Pare e me mostre.**

## Fase 1 — Cerebelo (prioridade)

1. Baixe cerebmap20, os rótulos do vérmis e cerebmap20-dentate. Leia as superfícies FreeSurfer com nibabel. Atenção: as superfícies têm prefixo "rh", mas cobrem os dois hemisférios. Aplique a escala real (ver `rescale2actual.tcl` e o README: voxels nativos de 0,19 mm).
2. Registre o cerebelo do Sereno no espaço MNI: alinhamento rígido/afim à máscara do cerebelo do CerebrA (cérebro_dkt, córtex cerebelar + vérmis). Documente a transformação e mostre o overlay.
3. Gere: córtex cerebelar (com as folhas visíveis), vérmis (anterior, intermédio e posterior separados), hemisférios, núcleo denteado. Para os núcleos interpósito e fastigial use Julich-Brain (marcar NC-SA).
4. Lobos e fissuras: fissura primária, fissura horizontal, lobo anterior, posterior e floculonodular. Se não houver rótulo pronto, crie a divisão como rótulo próprio ("Mímir, autoria própria, sobre a superfície de Sereno 2020") e me peça para revisar a anatomia.
5. Pedúnculos cerebelares (superior, médio, inferior): use os tratos do HCP1065 ou crie esquemas próprios, marcando a origem.
6. Visual: modo "folhas" (alta resolução), modo "estudo" (suavizado) e modo "lobos coloridos". Rótulos em latim/português.

**Pare e me mostre screenshots de vários ângulos.**

## Fase 2 — Tronco encefálico e "bolachas"

1. Tronco (mesencéfalo, ponte, bulbo) e marcos de superfície a partir do T1 de 250 µm do Lüsebrink (CC0).
2. Núcleos do tronco com MASSP 2.0 (núcleo rubro, substância negra, colículos, substância cinzenta periaquedutal, núcleos da rafe, área tegmentar ventral). Núcleos de nervos cranianos que não existirem em fonte aberta devem ser esquemas próprios, marcados como tal.
3. **Bolachas:** um visualizador de cortes axiais nos níveis clássicos (colículo superior, colículo inferior, ponte alta, ponte média, ponte baixa, bulbo na oliva, decussação das pirâmides, decussação dos lemniscos), usando o T1 do Lüsebrink como imagem de fundo, com as estruturas do atlas sobrepostas e rotuláveis. Opção de trocar o fundo para BigBrain (aspecto de lâmina histológica, NC-SA).
4. Deixe um espaço para eu integrar meus próprios desenhos dos cortes (feitos à mão) como camada "Mímir — autoria própria".

## Fase 3 — Pares cranianos

1. Do I ao XII, com origem aparente, trajeto e forame de saída, usando Visible Korean (NC) para os nervos e o crânio de Halle para os forames. OpenEar para o VII e o VIII no osso temporal.
2. Cor única por nervo, com modo "só nervos" e modo "nervo + núcleo + forame".

## Fase 4 — Grandes vias (ascendentes e descendentes) e corpo caloso

1. Tratos do HCP1065 (CC BY-SA): corticoespinal, corticonuclear, lemnisco medial, espinotalâmico (se disponível), corpo caloso (com joelho, tronco e esplênio), fórnix, cíngulo, fascículos longitudinais, uncinado, radiação óptica, cápsula interna.
2. Modo "via": ao selecionar uma via, mostrar o trajeto completo, da origem ao destino, com as decussações destacadas e os relés (tálamo, núcleos do tronco) acesos. Onde a tractografia não representar bem (ex.: decussação das pirâmides, coluna dorsal-lemnisco medial), complementar com esquema próprio, marcado como tal.
3. Separar visualmente as vias ascendentes (paleta fria) das descendentes (paleta quente).

## Fase 5 — Núcleos da base, sistema límbico, tálamo e hipotálamo

1. MASSP 2.0: caudado, putâmen, globo pálido externo e interno, núcleo accumbens, subtalâmico, substância negra, claustro, amígdala, hipocampo (CA1, CA2/3, giro dentado, subículo), fórnix.
2. Allen HRA 3D: núcleos do tálamo. Neudorfer: núcleos do hipotálamo e corpos mamilares.
3. Modo "circuito": circuito de Papez e alças dos núcleos da base (direta e indireta) como animações ou setas esquemáticas próprias.

## Fase 6 — Vascularização

1. Artérias reais do TopBrain (polígono de Willis, ACA, ACM, ACP, comunicantes, basilar, vertebrais, cerebelares) e seios venosos. Complementar ramos finos com BodyParts3D.
2. Territórios arteriais do JHU como camada de cor sobre o córtex (CC BY-SA).
3. Design: artérias em vermelho com gradiente por calibre, veias e seios em azul, polígono de Willis destacável sozinho, modo "território" ao clicar numa artéria.

## Fase 7 — Revisão final

1. Rode a checagem: todo asset em `public/models/` tem entrada no `sources.yaml`; nenhuma entrada sem crédito; a página de créditos lista tudo; os assets NC e SA estão sinalizados.
2. Gere um relatório `docs/fontes_e_licencas.md` pronto para virar o capítulo de métodos do TCC: tabela de fontes, licenças, processamento aplicado e separação clara entre material de terceiros e autoria própria.
