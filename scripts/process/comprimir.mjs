// Último passo da pipeline: GLB de data/processed/ -> models/ com compressão meshopt e níveis de detalhe.
// Usa o gltfpack (meshoptimizer). Cada arquivo gerado precisa de uma entrada em data/sources.yaml
// (o gerador de créditos falha se faltar).
// Uso: node scripts/process/comprimir.mjs data/processed/cerebelo_sereno_medio.glb [proporcao_lod=0.5]
// Estado: escrito na Fase 0; testado só quando houver GLB processado (Fase 1). Requer: npm i -D gltfpack (em scripts/).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..', '..');
const [entrada, prop = '0.5'] = process.argv.slice(2);
if (!entrada) { console.error('uso: node scripts/process/comprimir.mjs <arquivo.glb> [proporcao_lod]'); process.exit(1); }
const nome = path.basename(entrada, '.glb');
const saida = path.join(RAIZ, 'models', nome + '.glb');
fs.mkdirSync(path.dirname(saida), { recursive: true });
const cli = path.join(RAIZ, 'scripts', 'node_modules', 'gltfpack', 'cli.js');   // chamado pelo próprio node: sem shell (o caminho tem espaços)
// -cc: compressão meshopt; -si: simplificação (LOD) na proporção pedida; -kn: mantém os nomes dos nós (ids das estruturas)
execFileSync(process.execPath, [cli, '-i', path.resolve(entrada), '-o', saida, '-cc', '-si', prop, '-kn'], { stdio: 'inherit' });
console.log(saida, (fs.statSync(saida).size / 1048576).toFixed(2), 'MB');
