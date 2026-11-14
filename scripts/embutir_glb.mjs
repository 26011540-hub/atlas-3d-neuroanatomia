// Gera ../atlas-3d-neuroanatomia.html a partir de atlas.modelo.html,
// embutindo dados_brainder/cortex.glb (base64) e dados_brainder/marcos.json.
// Uso: node embutir_glb.mjs
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const modelo = fs.readFileSync(path.join(import.meta.dirname, 'atlas.modelo.html'), 'utf8');
const glb = fs.readFileSync(path.join(RAIZ, 'dados_brainder', 'cortex.glb')).toString('base64');
const marcos = fs.readFileSync(path.join(RAIZ, 'dados_brainder', 'marcos.json'), 'utf8').replace(/</g, '\\u003c');
for (const m of ['/*@@MARCOS@@*/', '/*@@GLB@@*/']) if (!modelo.includes(m)) throw new Error('marcador ausente no modelo: ' + m);
const html = modelo.replace('/*@@MARCOS@@*/', () => marcos).replace('/*@@GLB@@*/', () => glb);
const saida = path.join(RAIZ, 'atlas-3d-neuroanatomia.html');
fs.writeFileSync(saida, html);
console.log(saida, (html.length / 1048576).toFixed(2), 'MB');
