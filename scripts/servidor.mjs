// Servidor estatico minimo para abrir o atlas em http://localhost:8765/
// (faz o papel de "python -m http.server", que nao esta instalado nesta maquina).
// Uso: node servidor.mjs [porta]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const PORTA = +(process.argv[2] || process.env.PORT || 8765);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/atlas-3d-neuroanatomia.html';
  const arq = path.join(RAIZ, path.normalize(p));
  if (!arq.startsWith(RAIZ) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); res.end('nao encontrado'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(arq).pipe(res);
}).listen(PORTA, '127.0.0.1', () => console.log('Atlas em http://localhost:' + PORTA + '/'));
