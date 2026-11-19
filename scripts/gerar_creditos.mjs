// Gera CREDITS.md e a lista de fontes da aba Créditos do app (src/corpo.html, entre os marcadores)
// a partir de data/sources.yaml, e confere o manifesto:
//   - todo asset aponta para uma fonte existente;
//   - toda fonte usada tem credito_exato;
//   - todo arquivo de modelo (dados_brainder/*.glb|*.json, models/**) tem entrada em assets.
// Uso (na raiz do projeto): node scripts/gerar_creditos.mjs        (falha com código 1 se o manifesto tiver erro)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const YAML = require('yaml');

const RAIZ = path.resolve(import.meta.dirname, '..');
const man = YAML.parse(fs.readFileSync(path.join(RAIZ, 'data', 'sources.yaml'), 'utf8'));
const fontes = Object.fromEntries(man.fontes.map(f => [f.id, f]));
const erros = [], avisos = [];

// ---- conferências
man.assets.forEach(a => {
  [a.fonte].concat(a.fonte_adicional || []).filter(Boolean).forEach(f => { if (!fontes[f]) erros.push(`asset ${a.id}: fonte "${f}" não existe em fontes`); });
});
const usadas = new Set(man.assets.flatMap(a => [a.fonte].concat(a.fonte_adicional || [])).filter(Boolean));
man.fontes.filter(f => f.usado_hoje).forEach(f => usadas.add(f.id));
usadas.forEach(id => { const f = fontes[id]; if (f && !f.credito_exato) erros.push(`fonte ${id}: sem credito_exato`); if (f && f.credito_conferido === false) avisos.push(`fonte ${id}: crédito ainda não conferido na página da fonte`); });
const arquivosNoManifesto = new Set(man.assets.map(a => a.arquivo).filter(Boolean).map(p => p.replace(/\\/g, '/')));
const modelos = [];
const varre = (dir, filtro) => { const abs = path.join(RAIZ, dir); if (!fs.existsSync(abs)) return; fs.readdirSync(abs, { withFileTypes: true }).forEach(e => { const rel = dir + '/' + e.name; if (e.isDirectory()) varre(rel, filtro); else if (filtro(e.name)) modelos.push(rel); }); };
varre('dados_brainder', n => /\.(glb|json)$/i.test(n) && !/node_modules/.test(n));
varre('models', n => /\.(glb|gltf|bin|ktx2|png|jpg|webp|nii|nii\.gz|json)$/i.test(n));
const pastasNoManifesto = man.assets.map(a => a.pasta).filter(Boolean).map(p => p.replace(/\\/g, '/').replace(/\/?$/, '/'));   // asset de pasta: cobre todos os arquivos dela
modelos.forEach(m => { if (!arquivosNoManifesto.has(m) && !pastasNoManifesto.some(p => m.startsWith(p))) erros.push(`arquivo de modelo sem entrada no manifesto: ${m}`); });

// ---- selos de licença
const selos = f => [f.comercial_permitido === false ? 'NC' : null, f.share_alike ? 'SA' : null].filter(Boolean);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = f => f.url_original ? `<a href="${esc(f.url_original)}" target="_blank" rel="noopener">${esc(f.url_original.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : '';

// ---- CREDITS.md
const emUso = man.fontes.filter(f => usadas.has(f.id) && f.tipo !== 'referencia' && f.id !== 'mimir');
const refs = man.fontes.filter(f => usadas.has(f.id) && f.tipo === 'referencia');
const planejadas = man.fontes.filter(f => !usadas.has(f.id));
let md = `# Créditos do Mímir

Gerado automaticamente de \`data/sources.yaml\` por \`scripts/gerar_creditos.mjs\`. Não editar à mão.
Selos: **NC** = uso não comercial; **SA** = derivados sob a mesma licença.

## Autoria própria
${fontes.mimir.credito_exato}

## Dados 3D em uso no atlas
`;
emUso.forEach(f => { md += `- **${f.nome}**${selos(f).length ? ' [' + selos(f).join(', ') + ']' : ''}. ${f.credito_exato} Licença: ${f.licenca}. ${f.url_original || ''}${f.credito_conferido === false ? ' _(crédito a conferir)_' : ''}\n`; });
md += `\n## Referências de texto e gabarito (sem imagens copiadas)\n`;
refs.forEach(f => { md += `- **${f.nome}**. ${f.credito_exato} ${f.url_original || ''}\n`; });
md += `\n## O que vem de cada fonte\n\n| Asset | Estruturas | Fonte | Licença | Processamento |\n|---|---|---|---|---|\n`;
man.assets.forEach(a => { const f = fontes[a.fonte] || {}; md += `| ${a.arquivo || a.pasta || a.id} | ${String(a.estrutura).replace(/\|/g, '/')} | ${f.nome || a.fonte}${[].concat(a.fonte_adicional || []).map(x => ' + ' + (fontes[x] || {}).nome).join('')} | ${a.licenca || f.licenca || ''}${selos(f).length ? ' [' + selos(f).join(', ') + ']' : ''} | ${String(a.processamento || '').replace(/\s+/g, ' ').replace(/\|/g, '/')} |\n`; });
md += `\n## Fontes autorizadas para as próximas fases (ainda não usadas)\n`;
planejadas.forEach(f => { md += `- **${f.nome}**${selos(f).length ? ' [' + selos(f).join(', ') + ']' : ''}: ${f.licenca}. ${f.url_original || ''}\n`; });
fs.writeFileSync(path.join(RAIZ, 'CREDITS.md'), md);

// ---- aba Créditos do app
let html = '<!--CREDITOS:INICIO (gerado por scripts/gerar_creditos.mjs a partir de data/sources.yaml; não editar à mão)-->\n';
html += '        <h3>Dados 3D</h3>\n        <ul>\n';
emUso.forEach(f => { html += `          <li><b>${esc(f.nome)}</b>${selos(f).map(s => ` <span class="selo selo-${s.toLowerCase()}" title="${s === 'NC' ? 'Uso não comercial' : 'Derivados sob a mesma licença'}">${s}</span>`).join('')}. ${esc(f.credito_exato)} ${link(f)}</li>\n`; });
html += '        </ul>\n        <h3>Autoria própria</h3>\n        <ul>\n';
html += `          <li>${esc(fontes.mimir.credito_exato)} Formas aproximadas e itens "a confirmar" ficam listados em REVISAR.md.</li>\n`;
html += '        </ul>\n        <h3>Texto e gabarito</h3>\n        <ul>\n';
refs.forEach(f => { html += `          <li><b>${esc(f.nome)}</b>. ${esc(f.credito_exato)}${f.url_original ? ' ' + link(f) : ''}</li>\n`; });
html += '        </ul>\n        <!--CREDITOS:FIM-->';
const corpoArq = path.join(RAIZ, 'src', 'corpo.html');
let corpo = fs.readFileSync(corpoArq, 'utf8');
const ini = corpo.indexOf('<!--CREDITOS:INICIO'), fim = corpo.indexOf('<!--CREDITOS:FIM-->');
if (ini < 0 || fim < 0) erros.push('src/corpo.html: marcadores <!--CREDITOS:INICIO--> e <!--CREDITOS:FIM--> não encontrados');
else { corpo = corpo.slice(0, ini) + html + corpo.slice(fim + '<!--CREDITOS:FIM-->'.length); fs.writeFileSync(corpoArq, corpo); }

avisos.forEach(a => console.log('aviso:', a));
if (erros.length) { erros.forEach(e => console.error('ERRO:', e)); process.exit(1); }
console.log(`ok: ${man.fontes.length} fontes, ${man.assets.length} assets, ${modelos.length} arquivos de modelo conferidos; CREDITS.md e aba Créditos gerados`);
