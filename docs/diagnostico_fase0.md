# Fase 0: diagnóstico e infraestrutura (17/11/2026)

Prompt: `PROMPT_MIMIR.md` (reestruturação com fontes abertas). Nada do visual do atlas foi mudado nesta fase,
exceto a aba Créditos, que agora é gerada do manifesto.

## 1. Como o atlas é hoje

**Stack.** Página única em HTML + JavaScript puro, sem framework. three.js r128 e GLTFLoader r128 por CDN (cdnjs e jsDelivr).
A fonte fica em `src/` (`cabeca.html`, `estilo.css`, `corpo.html`, `js/NN-*.js` em ordem numérica, `fim.html`);
`node scripts/embutir_glb.mjs` junta tudo, confere a sintaxe e grava `atlas-3d-neuroanatomia.html` (cerca de 4,8 MB).
Ferramentas em Node (não havia Python): `scripts/converter_brainder.mjs` (meshoptimizer), gerador do gabarito e,
agora, `scripts/gerar_creditos.mjs`.

**Como os modelos são carregados.** Um único GLB (`dados_brainder/cortex.glb`) vai embutido em base64 dentro do HTML,
junto com `marcos.json`. Todo o resto (240 itens) é geometria criada pelo código no navegador (tubos, fitas,
elipsoides deformados) e as faces dos cortes são calculadas na hora (interseção malha × plano).

**Espaço de coordenadas.** Próprio do Mímir, em cm: X = esquerda, Y = superior, Z = anterior. Vem das coordenadas de
superfície do FreeSurfer do indivíduo do Brain for Blender, com X = -x/10, giro de -10° em X e deslocamentos
(Y +1,6; Z +0,9; X -0,1). Só o hemisfério esquerdo é convertido; o direito é o espelho (modelo simétrico e idealizado).
**Não é o MNI ICBM152.**

**Estruturas e origem** (347 itens com malha própria; detalhe em `data/sources.yaml`):

| Grupo | Itens | Origem | Licença |
|---|---|---|---|
| Córtex por região Desikan-Killiany (giros, ínsula, parede medial) | 33 | Brain for Blender, A. M. Winkler | CC BY-SA 3.0 |
| Malhas subcorticais: núcleos da base, tálamo, amígdala, hipocampo, ventrículos, tronco, cerebelo | 18 | Brain for Blender | CC BY-SA 3.0 |
| Derivados das malhas acima (lóbulos e fissuras do cerebelo, regiões da superfície do tronco, partes do ventrículo e do hipocampo) | 56 | Brain for Blender + divisão anatômica do Mímir | CC BY-SA 3.0 |
| Esquemas desenhados no código (vasos, nervos, núcleos, vias, corpo caloso, cápsulas, fórnice, diencéfalo, hipófise, límbico, sulcos, meninges, medula) | 240 | Mímir (autoria própria), pelo Machado | do autor |

**Nenhum modelo tem origem desconhecida.** Mas o Brain for Blender não está na lista de fontes autorizadas do prompt:
ver decisão 2.

## 2. O que foi criado nesta fase

| Arquivo | Para que serve | Estado |
|---|---|---|
| `data/sources.yaml` | Manifesto: 21 fontes (as 16 do prompt + Brain for Blender, Mímir, Unicamp, Machado, Prometheus) e 7 assets do atlas atual | Pronto. 16 textos de crédito e DOIs foram escritos de memória e estão marcados `credito_conferido: false`, para conferir na página de cada fonte ao baixar |
| `scripts/gerar_creditos.mjs` | Gera `CREDITS.md` e a aba Créditos do app; falha se um asset apontar para fonte inexistente, se faltar crédito ou se houver arquivo de modelo sem entrada | Pronto e testado |
| `CREDITS.md` | Créditos gerados, com selos NC e SA | Gerado |
| `scripts/download_sources.py` | Baixa de novo os dados brutos para `data/raw/` (fora do git), confere sha256, registra a data | Escrito, **não executado** (sem Python) |
| `scripts/process/comum.py` | Volume → marching cubes → transformação → suavização (Taubin) → decimação (quádrica) → GLB | Escrito, **não executado** |
| `scripts/process/sereno_cerebelo.py` | Lê `rh.pial` do cerebmap20, aplica a escala real (0,19/0,50 = 0,38) e gera 3 níveis de detalhe | Escrito, **não executado** |
| `scripts/process/comprimir.mjs` | gltfpack: compressão meshopt e LOD para `models/` | Escrito, testa na Fase 1 |
| `scripts/requirements.txt` | Dependências Python | Pronto |
| `docs/design/preview.html` | Proposta do sistema de design (paleta por sistema, materiais, contorno, rótulos) | Pronto, não aplicado ao app |
| `.gitignore` | `data/raw/`, `data/processed/` fora do git | Feito |

## 3. Verificação dos links das fontes (17/11/2026)

Todos responderam, com estas exceções:

- **Sereno 2020:** a pasta `https://mri.sdsu.edu/sereno/cereb/data` só tem `cerebmap20.tgz` (539 MB, 4,6 milhões de vértices).
  As pastas `updates/vermis-labels/` e `updates/dentate-nucleus/` **não existem (erro 404)**, e o README não menciona
  rótulos do vérmis nem do núcleo denteado. Ver decisão 5.
- **Lüsebrink 2021:** o DOI 10.25673/79458 leva ao repositório de Halle, que respondeu erro 500; o OpenNeuro (ds003563) responde.
- **FIPAT:** `fipat.library.dal.ca` não respondeu (tempo esgotado). Tentar de novo.
- **Julich-Brain:** não testado; no EBRAINS cada mapa tem seu DOI, a escolher na Fase 1.

## 4. Decisões que dependem de você

1. **Instalar o Python.** A pipeline pedida (nibabel, scikit-image, trimesh, pymeshlab) precisa de Python 3.10+.
   Proposta: `winget install Python.Python.3.12` e depois `python -m pip install -r scripts/requirements.txt`
   (cerca de 1 GB com as bibliotecas). A máquina tem 16 GB de RAM e 155 GB livres, o que basta para o cerebmap20
   (o próprio README recomenda 16 GB).
2. **Córtex do Brain for Blender.** Tem origem e licença conhecidas (CC BY-SA 3.0), mas não está na lista autorizada.
   Opções: (a) manter até ser substituído por uma superfície em MNI (CerebrA/ICBM152 ou superfícies do BigBrain);
   (b) substituir já na Fase 1. Recomendo (a): trocar o córtex muda o atlas inteiro, e as estruturas esquemáticas
   estão encaixadas nele.
3. **Espaço de referência.** O prompt pede tudo em MNI ICBM152 2009c; o atlas hoje usa um espaço próprio e é
   simétrico (espelhado). Recomendo: na Fase 1, calcular uma transformação afim MNI → espaço do Mímir (pela
   máscara do cérebro do ICBM152 contra a malha atual) e registrar no manifesto; os assets novos entram em MNI e são
   levados ao atlas por ela. A migração completa para MNI (e o fim do espelhamento) fica para quando o córtex for trocado.
4. **Licença do projeto.** O `LICENSE` diz que o atlas inteiro é CC BY-SA 3.0. Isso não combina com as fontes NC
   (Sereno, Julich-Brain, BigBrain, Visible Korean, rótulos do CerebrA), que não podem ser redistribuídas para uso
   comercial. Proposta: (a) cada asset fica sob a licença da sua fonte, marcado no manifesto; (b) o código do Mímir
   ganha uma licença própria (por exemplo MIT); (c) seus textos e esquemas, uma licença sua (por exemplo
   CC BY-NC-SA 4.0); (d) os modelos saem do HTML único e passam a arquivos separados em `models/`, carregados sob
   demanda, para cada asset continuar separável (licença, créditos e níveis de detalhe). Isso não é aconselhamento
   jurídico: para o TCC, vale confirmar com a orientação.
5. **Rótulos do vérmis e do núcleo denteado (Sereno).** Não estão publicados nos endereços do prompt. Opções:
   (a) pedir ao Prof. Sereno os arquivos (você já está em contato); (b) núcleo denteado pelo Julich-Brain (NC-SA)
   e divisão do vérmis como rótulo próprio do Mímir sobre a superfície do Sereno, como o próprio prompt prevê.
6. **Nome nos créditos.** O atlas usa "Gustavo de Castro"; o prompt usa "Gustavo de Castro Moreira". Qual vai nos créditos, no README e no LICENSE?
7. **Permissão do Sereno.** Guardar o e-mail de 17/11/2026 em PDF fora do repositório (ele é a base da licença desse asset).
