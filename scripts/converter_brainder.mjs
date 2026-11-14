// Converte as malhas "Brain for Blender" (Anderson M. Winkler, brainder.org, CC BY-SA 3.0)
// em um unico GLB para o atlas 3D.
//
// Entrada (pasta ../dados_brainder, arquivos OBJ ja extraidos):
//   pial_Full_obj, inflated_Full_obj, pial_DK_obj, subcortical_obj
// Saida:
//   ../dados_brainder/cortex.glb   um mesh por regiao Desikan-Killiany e por hemisferio
//   ../dados_brainder/marcos.json  centroides, bordas entre regioes e referencia subcortical
//
// Uso: node converter_brainder.mjs [triangulos_por_hemisferio=150000]
//
// Sistema de eixos do atlas (cm): X = esquerda (+) / direita (-), Y = superior, Z = anterior.
// FreeSurfer (mm, RAS): x = direita, y = anterior, z = superior.
//   X = -x/10,  Y = z/10 + OY,  Z = y/10 + OZ   (rotacao propria, nao espelha)

import fs from 'node:fs';
import path from 'node:path';
import { MeshoptSimplifier } from 'meshoptimizer';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DADOS = path.join(RAIZ, 'dados_brainder');
const ALVO_TRI = +(process.argv[2] || 150000);
// O cerebro do Brainder vem inclinado (polo frontal ~10 graus abaixo da horizontal em relacao a um
// alinhamento tipo AC-PC). GIRO_X corrige a inclinacao; OY e OZ recolocam o talamo onde o atlas ja o tinha.
const GIRO_X = -10 * Math.PI / 180;
const OY = 1.6, OZ = 0.9;          // deslocamento (cm) aplicado depois do giro
// MODELO IDEALIZADO E SIMETRICO: so o lado ESQUERDO e convertido; o atlas espelha tudo em x = 0.
// O plano mediano deste cerebro fica ~1 mm a esquerda da origem do FreeSurfer: OX recentra.
const OX = -0.1;                   // cm
const X_MED = OX * 10;             // plano mediano em mm do FreeSurfer (x = -1): esquerda e x < X_MED
const FOLGA_MED = 0.3;             // mm: o cortex nao passa deste limite, para os dois lados nao se atravessarem
const PASSO = 0.01;                // mm por unidade int16
const ESCALA_INFLADA = 0.68;       // a inflada do FreeSurfer e maior que a pial; reduz para caber na cena
const FOLGA_INFLADA = 4;           // mm entre a inflada e o plano mediano

// regiao DK -> id usado no atlas
const MAPA = {
  superiorfrontal: 'gfs', rostralmiddlefrontal: 'gfm', caudalmiddlefrontal: 'gfm',
  parsopercularis: 'gfi_op', parstriangularis: 'gfi_tr', parsorbitalis: 'gfi_or',
  precentral: 'gpre', postcentral: 'gpos', paracentral: 'gpara',
  superiorparietal: 'gps', supramarginal: 'gsm', inferiorparietal: 'gang',
  superiortemporal: 'gts', middletemporal: 'gtm', inferiortemporal: 'gti', temporalpole: 'gpt',
  fusiform: 'gfus', lingual: 'gling', cuneus: 'gcun', precuneus: 'gprec',
  lateraloccipital: 'gocc', lateralorbitofrontal: 'gor', medialorbitofrontal: 'greto',
  rostralanteriorcingulate: 'gcing', caudalanteriorcingulate: 'gcing', posteriorcingulate: 'gcing', isthmuscingulate: 'gcing',
  parahippocampal: 'gparahip', entorhinal: 'gparahip',
  insula: 'ginsula', transversetemporal: 'gtt', pericalcarine: 'gcalc', frontalpole: 'gpolof', bankssts: 'gbsts',
  unknown: 'dien_wall'
};

/* ---------- leitura ---------- */
function lerOBJ(arq) {
  const txt = fs.readFileSync(arq, 'latin1');
  const v = [], f = [], chaves = [];
  let i = 0;
  const n = txt.length;
  while (i < n) {
    let j = txt.indexOf('\n', i); if (j < 0) j = n;
    const c0 = txt.charCodeAt(i), c1 = txt.charCodeAt(i + 1);
    if (c0 === 118 && c1 === 32) {             // "v "
      const s = txt.slice(i + 2, j).trim();
      const p = s.split(/\s+/);
      v.push(+p[0], +p[1], +p[2]); chaves.push(p[0] + ' ' + p[1] + ' ' + p[2]);
    } else if (c0 === 102 && c1 === 32) {      // "f "
      const p = txt.slice(i + 2, j).trim().split(/\s+/);
      f.push(parseInt(p[0]) - 1, parseInt(p[1]) - 1, parseInt(p[2]) - 1);
    }
    i = j + 1;
  }
  return { V: new Float32Array(v), F: new Uint32Array(f), chaves };
}

/* ---------- geometria ---------- */
function normais(V, F) {
  const N = new Float32Array(V.length);
  for (let t = 0; t < F.length; t += 3) {
    const a = F[t] * 3, b = F[t + 1] * 3, c = F[t + 2] * 3;
    const ux = V[b] - V[a], uy = V[b + 1] - V[a + 1], uz = V[b + 2] - V[a + 2];
    const vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { N[k] += nx; N[k + 1] += ny; N[k + 2] += nz; }
  }
  for (let k = 0; k < N.length; k += 3) {
    const L = Math.hypot(N[k], N[k + 1], N[k + 2]) || 1;
    N[k] /= L; N[k + 1] /= L; N[k + 2] /= L;
  }
  return N;
}
function adjacencia(nv, F) {
  const grau = new Uint32Array(nv + 1);
  const pares = new Set();
  const arestas = [];
  const add = (a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b), k = lo * nv + hi; if (!pares.has(k)) { pares.add(k); arestas.push(lo, hi); grau[lo]++; grau[hi]++; } };
  for (let t = 0; t < F.length; t += 3) { add(F[t], F[t + 1]); add(F[t + 1], F[t + 2]); add(F[t + 2], F[t]); }
  const ini = new Uint32Array(nv + 1);
  for (let i = 0; i < nv; i++) ini[i + 1] = ini[i] + grau[i];
  const pos = ini.slice(), viz = new Uint32Array(ini[nv]);
  for (let e = 0; e < arestas.length; e += 2) { const a = arestas[e], b = arestas[e + 1]; viz[pos[a]++] = b; viz[pos[b]++] = a; }
  return { ini, viz, arestas: Uint32Array.from(arestas) };
}
// profundidade de sulco aproximada: deslocamento do vertice em relacao a malha muito suavizada, ao longo da normal dela
function profundidade(V, F, adj, iter) {
  const nv = V.length / 3;
  let S = Float32Array.from(V), T = new Float32Array(V.length);
  for (let it = 0; it < iter; it++) {
    for (let i = 0; i < nv; i++) {
      let x = 0, y = 0, z = 0; const a = adj.ini[i], b = adj.ini[i + 1];
      for (let k = a; k < b; k++) { const j = adj.viz[k] * 3; x += S[j]; y += S[j + 1]; z += S[j + 2]; }
      const m = b - a || 1;
      T[i * 3] = 0.5 * S[i * 3] + 0.5 * x / m; T[i * 3 + 1] = 0.5 * S[i * 3 + 1] + 0.5 * y / m; T[i * 3 + 2] = 0.5 * S[i * 3 + 2] + 0.5 * z / m;
    }
    const tmp = S; S = T; T = tmp;
  }
  const NS = normais(S, F), d = new Float32Array(nv);
  for (let i = 0; i < nv; i++) d[i] = (V[i * 3] - S[i * 3]) * NS[i * 3] + (V[i * 3 + 1] - S[i * 3 + 1]) * NS[i * 3 + 1] + (V[i * 3 + 2] - S[i * 3 + 2]) * NS[i * 3 + 2];
  return d;
}
const percentil = (arr, p) => { const s = Float32Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// FreeSurfer (mm) -> atlas (cm)
const CG = Math.cos(GIRO_X), SG = Math.sin(GIRO_X);
const paraAtlas = (x, y, z) => { const Y = z / 10, Z = y / 10; return [-x / 10 + OX, Y * CG - Z * SG + OY, Y * SG + Z * CG + OZ]; };
const r2 = x => Math.round(x * 100) / 100;

/* ---------- escritor de GLB ---------- */
class GLB {
  constructor() { this.partes = []; this.tam = 0; this.views = []; this.acc = []; this.meshes = []; this.nodes = []; }
  view(buf, target) {
    const b = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
    const pad = (4 - (this.tam % 4)) % 4;
    if (pad) { this.partes.push(Buffer.alloc(pad)); this.tam += pad; }
    this.views.push({ buffer: 0, byteOffset: this.tam, byteLength: b.length, ...(target ? { target } : {}) });
    this.partes.push(b); this.tam += b.length;
    return this.views.length - 1;
  }
  accessor(arr, type, opts = {}) {
    const ct = arr instanceof Int16Array ? 5122 : arr instanceof Int8Array ? 5120 : arr instanceof Uint8Array ? 5121 : arr instanceof Uint16Array ? 5123 : arr instanceof Uint32Array ? 5125 : 5126;
    const nc = { SCALAR: 1, VEC3: 3 }[type];
    const a = { bufferView: this.view(arr, opts.target), componentType: ct, count: arr.length / nc, type };
    if (opts.normalized) a.normalized = true;
    if (opts.minmax) {
      const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < arr.length; i += 3) for (let k = 0; k < 3; k++) { if (arr[i + k] < mn[k]) mn[k] = arr[i + k]; if (arr[i + k] > mx[k]) mx[k] = arr[i + k]; }
      a.min = mn; a.max = mx;
    }
    this.acc.push(a); return this.acc.length - 1;
  }
  salvar(arq, raiz) {
    const json = {
      asset: { version: '2.0', generator: 'converter_brainder.mjs', copyright: 'Brain for Blender, Anderson M. Winkler (brainder.org), CC BY-SA 3.0' },
      extensionsUsed: ['KHR_mesh_quantization'], extensionsRequired: ['KHR_mesh_quantization'],
      scene: 0, scenes: [{ nodes: [this.nodes.length] }],
      nodes: this.nodes.concat([{ name: 'cortex', children: this.nodes.map((_, i) => i), ...raiz }]),
      meshes: this.meshes, accessors: this.acc, bufferViews: this.views, buffers: [{ byteLength: 0 }]
    };
    const padB = (4 - (this.tam % 4)) % 4; if (padB) { this.partes.push(Buffer.alloc(padB)); this.tam += padB; }
    json.buffers[0].byteLength = this.tam;
    let js = Buffer.from(JSON.stringify(json), 'utf8');
    const padJ = (4 - (js.length % 4)) % 4; if (padJ) js = Buffer.concat([js, Buffer.alloc(padJ, 0x20)]);
    const total = 12 + 8 + js.length + 8 + this.tam;
    const head = Buffer.alloc(12); head.writeUInt32LE(0x46546C67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(total, 8);
    const hj = Buffer.alloc(8); hj.writeUInt32LE(js.length, 0); hj.writeUInt32LE(0x4E4F534A, 4);
    const hb = Buffer.alloc(8); hb.writeUInt32LE(this.tam, 0); hb.writeUInt32LE(0x004E4942, 4);
    fs.writeFileSync(arq, Buffer.concat([head, hj, js, hb, ...this.partes]));
    return total;
  }
}

/* ---------- principal ---------- */
await MeshoptSimplifier.ready;
MeshoptSimplifier.useExperimentalFeatures = true;

// silhueta sagital do corpo caloso (para separar o corte do corpo caloso do resto da parede medial)
const ccCel = new Set();
const SUB = path.join(DADOS, 'subcortical_obj', 'subcortical_obj');
for (const a of fs.readdirSync(SUB).filter(a => a.startsWith('CC_'))) {
  const o = lerOBJ(path.join(SUB, a));
  for (let i = 0; i < o.V.length; i += 3) ccCel.add(Math.round(o.V[i + 1]) + ',' + Math.round(o.V[i + 2]));
}
const noCC = (y, z) => { const a = Math.round(y), b = Math.round(z); return ccCel.has(a + ',' + b); };

const glb = new GLB();
const marcos = { eixos: 'X esquerda(+), Y superior, Z anterior; cm', oy: OY, oz: OZ, hemis: {}, subcortical: {} };

for (const hemi of ['lh']) {
  console.log('==', hemi);
  const pial = lerOBJ(path.join(DADOS, 'pial_Full_obj', 'pial_Full_obj', hemi + '.pial.obj'));
  const infl = lerOBJ(path.join(DADOS, 'inflated_Full_obj', 'inflated_Full_obj', hemi + '.inflated.obj'));
  // achata contra o plano mediano o pouco de cortex que o atravessa
  for (let i = 0; i < pial.V.length; i += 3) if (pial.V[i] > X_MED - FOLGA_MED) pial.V[i] = X_MED - FOLGA_MED;
  const nv0 = pial.V.length / 3;
  if (infl.V.length !== pial.V.length || infl.F.length !== pial.F.length) throw new Error('pial e inflada com topologias diferentes');

  // rotulos DK por vertice
  const indice = new Map(); pial.chaves.forEach((k, i) => { if (!indice.has(k)) indice.set(k, i); });
  const dir = path.join(DADOS, 'pial_DK_obj', 'pial_DK_obj');
  const nomes = fs.readdirSync(dir).filter(a => a.startsWith(hemi + '.pial.DK.')).map(a => a.slice((hemi + '.pial.DK.').length, -4)).sort();
  const rot0 = new Int16Array(nv0).fill(-1);
  let falhas = 0;
  nomes.forEach((nome, r) => {
    const o = lerOBJ(path.join(dir, hemi + '.pial.DK.' + nome + '.obj'));
    for (const k of o.chaves) { const i = indice.get(k); if (i === undefined) falhas++; else if (rot0[i] < 0) rot0[i] = r; }
  });
  const iUnk = nomes.indexOf('unknown');
  let semRot = 0; for (let i = 0; i < nv0; i++) if (rot0[i] < 0) { rot0[i] = iUnk; semRot++; }
  console.log('  regioes DK:', nomes.length, '| vertices sem correspondencia:', falhas, '| sem rotulo:', semRot);

  // decimacao, travando os vertices de borda entre regioes
  const trava = new Uint8Array(nv0);
  for (let t = 0; t < pial.F.length; t += 3) {
    const a = pial.F[t], b = pial.F[t + 1], c = pial.F[t + 2];
    if (rot0[a] !== rot0[b] || rot0[b] !== rot0[c]) { trava[a] = trava[b] = trava[c] = 1; }
  }
  const attr = new Float32Array(nv0);
  const [Fd] = MeshoptSimplifier.simplifyWithAttributes(pial.F, pial.V, 3, attr, 1, [0], trava, ALVO_TRI * 3, 1.0, []);
  // compacta
  const novo = new Int32Array(nv0).fill(-1); let nv = 0;
  for (const i of Fd) if (novo[i] < 0) novo[i] = nv++;
  const V = new Float32Array(nv * 3), VI = new Float32Array(nv * 3), rot = new Int16Array(nv);
  for (let i = 0; i < nv0; i++) { const j = novo[i]; if (j < 0) continue; for (let k = 0; k < 3; k++) { V[j * 3 + k] = pial.V[i * 3 + k]; VI[j * 3 + k] = infl.V[i * 3 + k]; } rot[j] = rot0[i]; }
  const F = Uint32Array.from(Fd, i => novo[i]);
  console.log('  triangulos:', pial.F.length / 3, '->', F.length / 3, '| vertices:', nv0, '->', nv);

  // inflada: centraliza, reduz e afasta do plano mediano
  const bb = (A) => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < A.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], A[i + k]); mx[k] = Math.max(mx[k], A[i + k]); } return { mn, mx }; };
  const bp = bb(V), bi = bb(VI);
  const ci = [0, 1, 2].map(k => (bi.mn[k] + bi.mx[k]) / 2), cp = [0, 1, 2].map(k => (bp.mn[k] + bp.mx[k]) / 2);
  const meiaLarg = (bi.mx[0] - bi.mn[0]) / 2 * ESCALA_INFLADA;
  const alvo = [(hemi === 'lh' ? -1 : 1) * (meiaLarg + FOLGA_INFLADA), cp[1], cp[2]];
  for (let i = 0; i < VI.length; i += 3) for (let k = 0; k < 3; k++) VI[i + k] = (VI[i + k] - ci[k]) * ESCALA_INFLADA + alvo[k];

  const N = normais(V, F), NI = normais(VI, F);
  const adj = adjacencia(nv, F);

  // tom de cinza por profundidade de sulco
  const d = profundidade(V, F, adj, 300);
  const p10 = percentil(d, 0.10), p80 = percentil(d, 0.80);
  const cinza = new Uint8Array(nv);
  for (let i = 0; i < nv; i++) cinza[i] = Math.round(255 * (0.40 + 0.60 * sstep(p10, p80, d[i])));
  console.log('  profundidade (mm): p10', p10.toFixed(1), 'p80', p80.toFixed(1));

  // regiao de cada triangulo (maioria dos vertices) e divisoes extras
  const sinalMedial = hemi === 'lh' ? 1 : -1;       // em coordenadas FreeSurfer, medial = +x no hemisferio esquerdo
  const grupos = new Map();                         // chave "id|dk" -> lista de triangulos
  for (let t = 0; t < F.length; t += 3) {
    const a = F[t], b = F[t + 1], c = F[t + 2];
    const r = (rot[a] === rot[b] || rot[a] === rot[c]) ? rot[a] : (rot[b] === rot[c] ? rot[b] : rot[a]);
    const dk = nomes[r]; let id = MAPA[dk]; let sub = dk;
    if (!id) throw new Error('regiao DK sem mapeamento: ' + dk);
    if (dk === 'superiorfrontal') {
      const nx = (NI[a * 3] + NI[b * 3] + NI[c * 3]) / 3 * sinalMedial;
      if (nx > 0.25) { id = 'gfsm'; sub = 'superiorfrontal_medial'; } else sub = 'superiorfrontal_lateral';
    } else if (dk === 'unknown') {
      const y = (V[a * 3 + 1] + V[b * 3 + 1] + V[c * 3 + 1]) / 3, z = (V[a * 3 + 2] + V[b * 3 + 2] + V[c * 3 + 2]) / 3;
      if (noCC(y, z)) { id = 'cc_cut'; sub = 'corpuscallosum_corte'; }
    }
    const k = id + '|' + sub;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(a, b, c);
  }

  // um mesh por grupo
  const q16 = (x) => Math.max(-32767, Math.min(32767, Math.round(x / PASSO)));
  for (const [k, tris] of [...grupos.entries()].sort()) {
    const [id, dk] = k.split('|');
    const loc = new Map(), ordem = [];
    const idx = tris.map(i => { let j = loc.get(i); if (j === undefined) { j = ordem.length; loc.set(i, j); ordem.push(i); } return j; });
    const n = ordem.length;
    const P = new Int16Array(n * 3), PI = new Int16Array(n * 3), Nn = new Int8Array(n * 3), NIn = new Int8Array(n * 3), C = new Uint8Array(n * 3);
    ordem.forEach((i, j) => {
      // eixos do atlas: X = -x, Y = z, Z = y
      P[j * 3] = q16(-V[i * 3]); P[j * 3 + 1] = q16(V[i * 3 + 2]); P[j * 3 + 2] = q16(V[i * 3 + 1]);
      PI[j * 3] = q16(-VI[i * 3]); PI[j * 3 + 1] = q16(VI[i * 3 + 2]); PI[j * 3 + 2] = q16(VI[i * 3 + 1]);
      Nn[j * 3] = Math.round(-N[i * 3] * 127); Nn[j * 3 + 1] = Math.round(N[i * 3 + 2] * 127); Nn[j * 3 + 2] = Math.round(N[i * 3 + 1] * 127);
      NIn[j * 3] = Math.round(-NI[i * 3] * 127); NIn[j * 3 + 1] = Math.round(NI[i * 3 + 2] * 127); NIn[j * 3 + 2] = Math.round(NI[i * 3 + 1] * 127);
      // a superficie de corte medial nao e cortex: tom uniforme, sem sombreamento de sulco
      C[j * 3] = C[j * 3 + 1] = C[j * 3 + 2] = (id === 'cc_cut' || id === 'dien_wall') ? 235 : cinza[i];
    });
    const I = n < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx);
    const prim = {
      attributes: {
        POSITION: glb.accessor(P, 'VEC3', { target: 34962, minmax: true }),
        NORMAL: glb.accessor(Nn, 'VEC3', { target: 34962, normalized: true }),
        COLOR_0: glb.accessor(C, 'VEC3', { target: 34962, normalized: true }),
        _INFLATED: glb.accessor(PI, 'VEC3', { target: 34962 }),
        _INFLATED_N: glb.accessor(NIn, 'VEC3', { target: 34962, normalized: true })
      },
      indices: glb.accessor(I, 'SCALAR', { target: 34963 }), mode: 4
    };
    const nome = hemi + '-' + id + '-' + dk;
    glb.meshes.push({ name: nome, primitives: [prim] });
    glb.nodes.push({ name: nome, mesh: glb.meshes.length - 1, extras: { lado: hemi === 'lh' ? 1 : -1, id, dk } });
  }
  console.log('  meshes:', grupos.size);

  // marcos: centroides por regiao DK e bordas entre pares de regioes (pontos espacados ~2,5 mm, sem ordem)
  const cen = {}, cont = {};
  for (let i = 0; i < nv; i++) { const nm = nomes[rot[i]]; (cen[nm] = cen[nm] || [0, 0, 0]); cen[nm][0] += V[i * 3]; cen[nm][1] += V[i * 3 + 1]; cen[nm][2] += V[i * 3 + 2]; cont[nm] = (cont[nm] || 0) + 1; }
  const centroides = {}; for (const nm in cen) centroides[nm] = paraAtlas(cen[nm][0] / cont[nm], cen[nm][1] / cont[nm], cen[nm][2] / cont[nm]).map(r2);
  const bruto = {};
  for (let e = 0; e < adj.arestas.length; e += 2) {
    const a = adj.arestas[e], b = adj.arestas[e + 1]; if (rot[a] === rot[b]) continue;
    const k = [nomes[rot[a]], nomes[rot[b]]].sort().join('|');
    (bruto[k] = bruto[k] || []).push([(V[a * 3] + V[b * 3]) / 2, (V[a * 3 + 1] + V[b * 3 + 1]) / 2, (V[a * 3 + 2] + V[b * 3 + 2]) / 2]);
  }
  const bordas = {};
  for (const k in bruto) {
    if (bruto[k].length < 12) continue;
    const sel = [];
    for (const p of bruto[k]) { if (!sel.some(q => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 2.5)) sel.push(p); }
    bordas[k] = sel.map(p => paraAtlas(p[0], p[1], p[2]).map(r2));
  }
  const cmn = [1e9, 1e9, 1e9], cmx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < V.length; i += 3) { const p = paraAtlas(V[i], V[i + 1], V[i + 2]); for (let k = 0; k < 3; k++) { cmn[k] = Math.min(cmn[k], p[k]); cmx[k] = Math.max(cmx[k], p[k]); } }
  marcos.hemis[hemi] = { lado: hemi === 'lh' ? 1 : -1, caixa: { min: cmn.map(r2), max: cmx.map(r2) }, centroides, bordas };
}

/* ---------- malhas subcorticais (FreeSurfer aseg, do mesmo cerebro) ---------- */
// estrutura aseg -> [id do atlas, triangulos alvo]. O aseg nao separa os segmentos do palido, as partes do
// tronco nem o vermis: essas divisoes sao feitas aqui por criterio geometrico e avisadas no painel do atlas.
const SUBMAPA = {
  'Caudate': ['caudado', 5000], 'Putamen': ['putame', 5000], 'Pallidum': ['gpe', 4000], 'Thalamus-Proper': ['talamo', 6000],
  'Accumbens-area': ['accumbens', 1500], 'Amygdala': ['amigdala', 3000], 'Hippocampus': ['hipocampo', 5000],
  'Cerebellum-Cortex': ['cerebelo', 14000], 'Brain-Stem': ['ponte', 10000],
  'Lateral-Ventricle': ['vlat', 9000], 'Inf-Lat-Vent': ['vlat', 1500], '3rd-Ventricle': ['v3', 3000], '4th-Ventricle': ['v4', 3000]
};
const q16s = (x) => Math.max(-32767, Math.min(32767, Math.round(x / PASSO)));
const centroide = (V) => { const c = [0, 0, 0]; for (let i = 0; i < V.length; i += 3) { c[0] += V[i]; c[1] += V[i + 1]; c[2] += V[i + 2]; } return c.map(x => x / (V.length / 3)); };
function gravarSub(nome, id, lado, V, N, tris) {
  const loc = new Map(), ordem = [];
  const idx = Array.from(tris, i => { let j = loc.get(i); if (j === undefined) { j = ordem.length; loc.set(i, j); ordem.push(i); } return j; });
  const n = ordem.length, P = new Int16Array(n * 3), Nn = new Int8Array(n * 3);
  ordem.forEach((i, j) => {
    P[j * 3] = q16s(-V[i * 3]); P[j * 3 + 1] = q16s(V[i * 3 + 2]); P[j * 3 + 2] = q16s(V[i * 3 + 1]);
    Nn[j * 3] = Math.round(-N[i * 3] * 127); Nn[j * 3 + 1] = Math.round(N[i * 3 + 2] * 127); Nn[j * 3 + 2] = Math.round(N[i * 3 + 1] * 127);
  });
  const I = n < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx);
  glb.meshes.push({ name: nome, primitives: [{ attributes: { POSITION: glb.accessor(P, 'VEC3', { target: 34962, minmax: true }), NORMAL: glb.accessor(Nn, 'VEC3', { target: 34962, normalized: true }) }, indices: glb.accessor(I, 'SCALAR', { target: 34963 }), mode: 4 }] });
  glb.nodes.push({ name: nome, mesh: glb.meshes.length - 1, extras: { tipo: 'sub', lado, id, meio: lado === 0 } });
}
let nSub = 0;
for (const arq of fs.readdirSync(SUB).filter(a => a.endsWith('.obj'))) {
  const base = arq.slice(0, -4), lado = base.startsWith('Left-') ? 1 : base.startsWith('Right-') ? -1 : 0;
  if (lado < 0) continue;                                  // o lado direito e gerado por espelhamento no atlas
  const chave = base.replace(/^(Left|Right)-/, ''); if (!SUBMAPA[chave]) continue;
  const [id, alvo] = SUBMAPA[chave];
  const o = lerOBJ(path.join(SUB, arq));
  // fica so a metade esquerda; o que cruza o plano mediano e cortado e encostado nele
  { const fk = []; for (let k = 0; k < o.F.length; k += 3) { const x = (o.V[o.F[k] * 3] + o.V[o.F[k + 1] * 3] + o.V[o.F[k + 2] * 3]) / 3; if (x <= X_MED) fk.push(o.F[k], o.F[k + 1], o.F[k + 2]); } o.F = Uint32Array.from(fk); }
  const trava = new Uint8Array(o.V.length / 3);
  for (let i = 0; i < o.V.length; i += 3) if (o.V[i] > X_MED) { o.V[i] = X_MED; trava[i / 3] = 1; }
  let F = o.F;
  if (F.length / 3 > alvo) F = MeshoptSimplifier.simplifyWithAttributes(o.F, o.V, 3, new Float32Array(o.V.length / 3), 1, [0], trava, (lado === 0 ? alvo / 2 : alvo) * 3, 0.02, [])[0];
  const N = normais(o.V, F);
  const L = lado > 0 ? 'E' : lado < 0 ? 'D' : 'M';
  if (chave === 'Pallidum') {
    // o aseg nao separa os segmentos do palido: divisao aproximada por um plano perpendicular ao eixo
    // palido -> putame (segmento interno = 42% mais medial). Aviso no painel do atlas.
    const cp = centroide(o.V), cq = centroide(lerOBJ(path.join(SUB, arq.replace('Pallidum', 'Putamen'))).V);   // centroides antes do corte bastam para o eixo
    let d = [cq[0] - cp[0], cq[1] - cp[1], cq[2] - cp[2]]; const dl = Math.hypot(...d); d = d.map(x => x / dl);
    const t = []; let mn = 1e9, mx = -1e9;
    for (let k = 0; k < F.length; k += 3) { let s = 0; for (const v of [F[k], F[k + 1], F[k + 2]]) s += (o.V[v * 3] * d[0] + o.V[v * 3 + 1] * d[1] + o.V[v * 3 + 2] * d[2]) / 3; t.push(s); mn = Math.min(mn, s); mx = Math.max(mx, s); }
    const lim = mn + 0.42 * (mx - mn), ext = [], int = [];
    t.forEach((s, k) => (s < lim ? int : ext).push(F[k * 3], F[k * 3 + 1], F[k * 3 + 2]));
    gravarSub('sub' + L + '-gpe-' + chave, 'gpe', lado, o.V, N, ext); gravarSub('sub' + L + '-gpi-' + chave, 'gpi', lado, o.V, N, int); nSub += 2;
  } else if (chave === 'Cerebellum-Cortex') {
    // vermis: faixa mediana de 9 mm para cada lado (limite aproximado; o aseg nao o separa dos hemisferios)
    const hem = [], ver = [];
    for (let k = 0; k < F.length; k += 3) { const x = (o.V[F[k] * 3] + o.V[F[k + 1] * 3] + o.V[F[k + 2] * 3]) / 3; (x > X_MED - 9 ? ver : hem).push(F[k], F[k + 1], F[k + 2]); }
    gravarSub('sub' + L + '-cerebelo-' + chave, 'cerebelo', lado, o.V, N, hem); gravarSub('subM-vermis-' + chave, 'vermis', 0, o.V, N, ver); nSub += 2;
  } else if (chave === 'Brain-Stem') {
    // ponte = saliencia ventral do tronco; limites = onde a saliencia comeca e termina no perfil ventral mediano.
    // eixo do tronco (para baixo e para tras) e direcao ventral, no plano sagital do atlas
    const AX = [-0.913, -0.408], VE = [-0.408, 0.913], B = 0.2, prof = [];
    const sv = (i) => { const p = paraAtlas(o.V[i * 3], o.V[i * 3 + 1], o.V[i * 3 + 2]); return [p[1] * AX[0] + p[2] * AX[1], p[1] * VE[0] + p[2] * VE[1], p[0]]; };
    let s0 = 1e9; for (let i = 0; i < o.V.length / 3; i++) s0 = Math.min(s0, sv(i)[0]);
    for (let i = 0; i < o.V.length / 3; i++) { const q = sv(i); if (Math.abs(q[2]) > 0.6) continue; const b = Math.floor((q[0] - s0) / B); if (prof[b] === undefined || q[1] > prof[b]) prof[b] = q[1]; }
    for (let b = 0; b < prof.length; b++) if (prof[b] === undefined) prof[b] = prof[b - 1];
    const liso = prof.map((v, b) => (prof[Math.max(0, b - 1)] + v + prof[Math.min(prof.length - 1, b + 1)]) / 3);
    let im = 0; liso.forEach((v, b) => { if (v > liso[im]) im = b; });
    // a malha e suavizada e nao tem os sulcos marcados: o limite e o "joelho" do perfil (maior curvatura
    // concava) acima e abaixo do ventre da ponte
    const d2 = b => liso[b + 1] - 2 * liso[b] + liso[b - 1];
    let a = 1, z = liso.length - 2;
    for (let b = 1; b < im; b++) if (d2(b) > d2(a)) a = b;
    for (let b = liso.length - 2; b > im; b--) if (d2(b) > d2(z)) z = b;
    const sSup = s0 + (a + 0.5) * B, sInf = s0 + (z + 0.5) * B;
    const pt = (s, v) => [r2(s * AX[0] + v * VE[0]), r2(s * AX[1] + v * VE[1])];
    marcos.tronco = { perfil: liso.map((v, b) => pt(s0 + (b + 0.5) * B, v)), iSup: a, iPonte: im, iInf: z };
    console.log('  tronco: sulco pontino superior em', pt(sSup, liso[a]), '| ventre da ponte', pt(s0 + (im + 0.5) * B, liso[im]), '| sulco bulbopontino', pt(sInf, liso[z]));
    const parts = { mesenc: [], ponte: [], bulbo: [] };
    for (let k = 0; k < F.length; k += 3) { const s = (sv(F[k])[0] + sv(F[k + 1])[0] + sv(F[k + 2])[0]) / 3; (s < sSup ? parts.mesenc : s < sInf ? parts.ponte : parts.bulbo).push(F[k], F[k + 1], F[k + 2]); }
    for (const pid in parts) { gravarSub('subM-' + pid + '-' + chave, pid, 0, o.V, N, parts[pid]); nSub++; }
  } else { gravarSub('sub' + L + '-' + id + '-' + chave, id, lado, o.V, N, F); nSub++; }
  console.log('  sub', base.padEnd(26), o.F.length / 3, '->', F.length / 3, 'triangulos');
}
console.log('malhas subcorticais:', nSub);

// referencia subcortical: centroide, caixa e eixo principal de cada estrutura (coordenadas do atlas)
for (const a of fs.readdirSync(SUB).filter(a => a.endsWith('.obj') && !a.startsWith('Right-'))) {
  const o = lerOBJ(path.join(SUB, a)); const n = o.V.length / 3;
  const P = []; for (let i = 0; i < o.V.length; i += 3) P.push(paraAtlas(o.V[i], o.V[i + 1], o.V[i + 2]));
  const c = [0, 1, 2].map(k => P.reduce((s, p) => s + p[k], 0) / n);
  const mn = [0, 1, 2].map(k => Math.min(...P.map(p => p[k]))), mx = [0, 1, 2].map(k => Math.max(...P.map(p => p[k])));
  // fatias ao longo de Z (antero-posterior): centro e meia-largura em X e Y, para ajustar tubos
  const NF = 8, fat = [];
  for (let f = 0; f < NF; f++) {
    const z0 = mn[2] + (mx[2] - mn[2]) * f / NF, z1 = mn[2] + (mx[2] - mn[2]) * (f + 1) / NF;
    const Q = P.filter(p => p[2] >= z0 && p[2] <= z1); if (Q.length < 5) continue;
    const m = [0, 1, 2].map(k => Q.reduce((s, p) => s + p[k], 0) / Q.length);
    fat.push([...m.map(r2), r2((Math.max(...Q.map(p => p[0])) - Math.min(...Q.map(p => p[0]))) / 2), r2((Math.max(...Q.map(p => p[1])) - Math.min(...Q.map(p => p[1]))) / 2)]);
  }
  marcos.subcortical[a.slice(0, -4)] = { centro: c.map(r2), min: mn.map(r2), max: mx.map(r2), fatias: fat };
}

const total = glb.salvar(path.join(DADOS, 'cortex.glb'), { scale: [PASSO / 10, PASSO / 10, PASSO / 10], translation: [OX, OY, OZ], rotation: [Math.sin(GIRO_X / 2), 0, 0, Math.cos(GIRO_X / 2)] });
fs.writeFileSync(path.join(DADOS, 'marcos.json'), JSON.stringify(marcos));
console.log('cortex.glb:', (total / 1048576).toFixed(2), 'MB | marcos.json:', (fs.statSync(path.join(DADOS, 'marcos.json')).size / 1024).toFixed(0), 'KB');
