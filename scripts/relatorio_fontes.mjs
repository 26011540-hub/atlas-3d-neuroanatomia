// Fase 7: gera docs/fontes_e_licencas.md a partir de data/sources.yaml (base para o capítulo de métodos do TCC).
// Tabelas: fontes de terceiros (licença, uso comercial, compartilha-igual, DOI, crédito conferido); assets do atlas
// (arquivo, fontes, licença resultante, processamento); separação entre material de terceiros e autoria própria;
// pendências (créditos não conferidos, decisões em aberto). Uso: node scripts/relatorio_fontes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const YAML = require('yaml');

const RAIZ = path.resolve(import.meta.dirname, '..');
const man = YAML.parse(fs.readFileSync(path.join(RAIZ, 'data', 'sources.yaml'), 'utf8'));
const F = Object.fromEntries(man.fontes.map(f => [f.id, f]));
const limpa = s => String(s ?? '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
const sim = b => b === true ? 'sim' : b === false ? 'não' : '?';
const usadas = new Set(man.assets.flatMap(a => [a.fonte].concat(a.fonte_adicional || [])));
const terceiros = man.fontes.filter(f => f.id !== 'mimir' && usadas.has(f.id));
const referencias = man.fontes.filter(f => f.tipo === 'referencia');
const soProcessamento = man.fontes.filter(f => !usadas.has(f.id) && /processamento/.test(f.uso || ''));
const naoUsadas = man.fontes.filter(f => f.id !== 'mimir' && !usadas.has(f.id) && f.tipo !== 'referencia' && !soProcessamento.includes(f));
const licencaAsset = a => [a.fonte].concat(a.fonte_adicional || []).filter(x => x && x !== 'mimir').map(x => F[x]).filter(Boolean);
const tamanho = a => { const p = a.arquivo || a.pasta; if (!p) return ''; const abs = path.join(RAIZ, p); if (!fs.existsSync(abs)) return 'ausente';
  const st = fs.statSync(abs); const b = st.isDirectory() ? fs.readdirSync(abs).reduce((s, n) => s + fs.statSync(path.join(abs, n)).size, 0) : st.size; return (b / 1048576).toFixed(2) + ' MB'; };

let md = `# Fontes, licenças e processamento do Mímir: Atlas 3D de Neuroanatomia

Gerado por \`scripts/relatorio_fontes.mjs\` a partir de \`data/sources.yaml\` em ${new Date().toISOString().slice(0, 10)}. Não editar à mão: editar o manifesto e gerar de novo.

Autor: ${man.projeto ? man.projeto.autor : ''}${man.projeto && man.projeto.instituicao ? ', ' + man.projeto.instituicao : ''}.

## 1. Método de rastreabilidade

Todo arquivo de modelo do atlas (pasta \`models/\` e \`dados_brainder/\`) tem uma entrada no manifesto \`data/sources.yaml\` com a fonte, a licença,
o crédito exato e o processamento aplicado. O gerador de créditos (\`scripts/gerar_creditos.mjs\`) falha se houver arquivo sem entrada,
asset apontando para fonte inexistente ou fonte sem crédito. Os dados brutos são baixados por \`scripts/download_sources.py\`, que grava a data
e o checksum (sha256) de cada arquivo em \`data/raw/registro.json\`; os brutos e os intermediários ficam fora do controle de versão.
O processamento (Python: nibabel, scikit-image, SciPy, trimesh, pymeshlab, SimpleITK; compressão meshopt pelo gltfpack) está em
\`scripts/process/\`, um script por etapa, e cada transformação espacial é registrada no manifesto.

## 2. Fontes de terceiros usadas no atlas

| Fonte | Licença | Uso comercial | Compartilha igual | DOI | Crédito conferido |
|---|---|---|---|---|---|
`;
terceiros.forEach(f => { md += `| ${limpa(f.nome)} | ${limpa(f.licenca)} | ${sim(f.comercial_permitido)} | ${sim(f.share_alike)} | ${f.doi ? limpa(f.doi) : '—'} | ${f.credito_conferido === false ? 'não (a conferir)' : 'sim'} |\n`; });
if (soProcessamento.length) md += `\nUsadas só no processamento (nenhum dado delas vai para o atlas): ${soProcessamento.map(f => limpa(f.nome) + ' (' + limpa(f.licenca) + ')').join('; ')}.\n`;
md += `\n### Créditos exatos\n\n`;
terceiros.forEach(f => { md += `- **${limpa(f.nome)}.** ${limpa(f.credito_exato)}\n`; });

md += `\n## 3. Assets do atlas\n\n| Arquivo | Estrutura | Fontes | Restrições | Tamanho | Processamento |\n|---|---|---|---|---|---|\n`;
man.assets.forEach(a => {
  const fs_ = licencaAsset(a), nc = fs_.some(f => f.comercial_permitido === false), sa = fs_.some(f => f.share_alike === true);
  const restr = [nc ? 'não comercial' : '', sa ? 'compartilha igual' : ''].filter(Boolean).join('; ') || 'nenhuma além da atribuição';
  const nomes = [a.fonte].concat(a.fonte_adicional || []).filter(Boolean).map(x => x === 'mimir' ? 'Mímir (autoria própria)' : (F[x] ? limpa(F[x].nome) : x)).join(' + ');
  md += `| ${a.arquivo || a.pasta || a.id} | ${limpa(a.estrutura)} | ${nomes} | ${restr} | ${tamanho(a)} | ${limpa(a.processamento)} |\n`;
});

const proprio = man.assets.filter(a => a.fonte === 'mimir' && !(a.fonte_adicional || []).length);
md += `\n## 4. Material de terceiros e autoria própria

- **Material de terceiros** (dados de imagem, segmentações, superfícies e tratografia): ${terceiros.length} fontes, listadas na seção 2. Usados conforme a licença de cada um; nenhum arquivo de terceiros é redistribuído sem processamento, salvo os rótulos de territórios arteriais (gravados em formato cru).
- **Autoria própria (Mímir):** os esquemas anatômicos desenhados no código (vasos, nervos, núcleos, vias, cortes), a divisão em lóbulos e regiões, as escolhas de classe e cor, os alinhamentos entre espaços, o cálculo dos forames, os níveis das bolachas e o modo circuito. Assets só de autoria própria: ${proprio.map(a => a.arquivo || a.pasta || a.id).join(', ') || 'nenhum arquivo separado (estão no código)'}.
- **Assets derivados** combinam as duas coisas: a forma vem da fonte de terceiros; o recorte, o alinhamento ao espaço do atlas, a simplificação e a ligação aos itens do atlas são do Mímir.
- **Referências didáticas** (consultadas, não copiadas): ${referencias.map(f => limpa(f.nome)).join('; ') || '—'}. Imagens, textos e figuras desses livros e do gabarito da Unicamp não entram no atlas.

## 5. Restrições de licença que valem para o atlas inteiro

- **Uso não comercial:** ${terceiros.filter(f => f.comercial_permitido === false).map(f => limpa(f.nome)).join('; ')}.
- **Compartilha igual (derivados sob a mesma licença):** ${terceiros.filter(f => f.share_alike === true).map(f => limpa(f.nome)).join('; ')}.
- Enquanto esses assets fizerem parte do atlas, a distribuição do conjunto deve ser não comercial e respeitar o compartilhamento pela mesma licença nos assets derivados dessas fontes. O código do Mímir e os assets de autoria própria podem ter licença própria (decisão 4 de \`docs/diagnostico_fase0.md\`).

## 6. Pendências

`;
const pend = terceiros.filter(f => f.credito_conferido === false);
md += pend.length ? `- Créditos ainda não conferidos na página da fonte: ${pend.map(f => limpa(f.nome)).join('; ')}.\n` : '- Todos os créditos das fontes usadas foram conferidos.\n';
if (naoUsadas.length) md += `- Fontes previstas no manifesto e ainda não usadas: ${naoUsadas.map(f => limpa(f.nome)).join('; ')}.\n`;
md += `- Revisão anatômica dos alinhamentos, das divisões e dos textos novos: ver \`REVISAR.md\`.\n- Nome do autor nos créditos (\`${man.projeto ? man.projeto.autor : ''}\`) a confirmar.\n`;

fs.mkdirSync(path.join(RAIZ, 'docs'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'docs', 'fontes_e_licencas.md'), md);
console.log(`docs/fontes_e_licencas.md: ${terceiros.length} fontes de terceiros, ${man.assets.length} assets, ${pend.length} créditos a conferir`);
