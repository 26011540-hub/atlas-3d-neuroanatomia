// Monta ../atlas-3d-neuroanatomia.html a partir das partes em ../src/
// (cabeca.html, estilo.css, corpo.html, js/*.js em ordem numérica, fim.html),
// confere a sintaxe do JavaScript e embute dados_brainder/cortex.glb (base64) e dados_brainder/marcos.json.
// Uso: node scripts/embutir_glb.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const RAIZ = path.resolve(import.meta.dirname, '..');
const SRC = path.join(RAIZ, 'src');
const ler = f => fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\r\n/g, '\n');
// 14-interface.js fecha o escopo principal do atlas: um arquivo 14-* que ordene depois dele ficaria fora do escopo e quebraria a carga
const lista = fs.readdirSync(path.join(SRC, 'js')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
const depois = lista.filter(f => f > '14-interface.js' && f < '15');
if (depois.length) { console.error('erro: estes arquivos ordenam depois de 14-interface.js e ficariam fora do escopo principal:', depois.join(', ')); process.exit(1); }
const js = lista.map(f => ler('js/' + f)).join('');

// sintaxe: falha aqui, antes de gerar um atlas quebrado
const tmp = path.join(os.tmpdir(), 'mimir-chk.js');
fs.writeFileSync(tmp, js);
try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); }
catch (e) { console.error(String(e.stderr || e.message)); process.exit(1); }

const modelo = ler('cabeca.html') + '<style>\n' + ler('estilo.css') + '</style>\n' + ler('corpo.html') + '<script>\n' + js + '</script>\n' + ler('fim.html');
const glb = fs.readFileSync(path.join(RAIZ, 'dados_brainder', 'cortex.glb')).toString('base64');
const marcos = fs.readFileSync(path.join(RAIZ, 'dados_brainder', 'marcos.json'), 'utf8').replace(/</g, '\\u003c');
for (const m of ['/*@@MARCOS@@*/', '/*@@GLB@@*/']) if (!modelo.includes(m)) throw new Error('marcador ausente no modelo: ' + m);
const html = modelo.replace('/*@@MARCOS@@*/', () => marcos).replace('/*@@GLB@@*/', () => glb);
const saida = path.join(RAIZ, 'atlas-3d-neuroanatomia.html');
fs.writeFileSync(saida, html);
console.log(saida, (html.length / 1048576).toFixed(2), 'MB');
