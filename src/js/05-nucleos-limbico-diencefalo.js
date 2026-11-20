/* ===== NÚCLEOS DA BASE, LÍMBICO, DIENCÉFALO =====
   Caudado, putame, pálido, accumbens, tálamo, amígdala, hipocampo, ventrículos, tronco e cerebelo são malhas
   reais do mesmo cérebro (Brainder/FreeSurfer aseg), carregadas junto com o córtex. O que segue abaixo são as
   estruturas que essa segmentação não traz, em formas esquemáticas posicionadas em relação a elas. */
// núcleo caudado: cabeça e corpo vêm da malha real; a cauda (que a malha não inclui) é um tubo esquemático no teto do corno temporal
tube('caudado', [[1.88, 2.0, -1.15], [2.45, 1.45, -2.25], [3.0, 0.5, -2.7], [3.4, -0.3, -2.4], [3.6, -0.95, -1.3], [3.3, -1.2, -0.3]], 0.17, 0.09, { seg: 60 });
// cápsulas e claustro: lâminas que acompanham a superfície real do núcleo lentiforme (Prometheus, p. 208)
function envX(ids, maior, cel) {   // envoltório lateral (maior x) ou medial (menor x) das malhas reais do lado esquerdo, em células (y, z)
  const v = new THREE.Vector3(), g = new Map();
  ids.forEach(id => ITEMS[id].meshes.forEach(m => { if (m.userData.side !== 1 || m.matrixAutoUpdate) return; const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); const key = Math.round(v.y / cel) + ',' + Math.round(v.z / cel), c = g.get(key); if (c === undefined || (maior ? v.x > c : v.x < c)) g.set(key, v.x); } }));
  // fecha os furos: célula vazia cercada por células cheias (a malha tem vértices mais espaçados que a grade)
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (let r = 0; r < 3; r++) {
    const novo = new Map();
    g.forEach((x, key) => { const [iy, iz] = key.split(',').map(Number); D8.forEach(d => { const k2 = (iy + d[0]) + ',' + (iz + d[1]); if (g.has(k2) || novo.has(k2)) return; let s = 0, n = 0; D8.forEach(e => { const vv = g.get((iy + d[0] + e[0]) + ',' + (iz + d[1] + e[1])); if (vv !== undefined) { s += vv; n++; } }); if (n >= 5) novo.set(k2, s / n); }); });
    if (!novo.size) break; novo.forEach((x, k) => g.set(k, x));
  }
  return g;
}
function laminaEnv(id, g, cel, xf, filtro, o) {
  o = o || {}; const idx = new Map(), pos = [], cells = [];
  g.forEach((x, key) => { const [iy, iz] = key.split(',').map(Number), y = iy * cel, z = iz * cel; if (filtro && !filtro(y, z)) return; idx.set(key, cells.length); cells.push([iy, iz, xf(x, y, z), y, z]); });
  for (let r = 0; r < 4; r++) cells.forEach(c => { let sx = c[2], n = 1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const j = idx.get((c[0] + d[0]) + ',' + (c[1] + d[1])); if (j !== undefined) { sx += cells[j][2]; n++; } }); c[5] = sx / n; }), cells.forEach(c => { c[2] = c[5]; });
  // borda arredondada: os vértices da borda (células sem algum vizinho) caminham para a média dos vizinhos, sem degraus
  const viz = cells.map(c => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].map(d => idx.get((c[0] + d[0]) + ',' + (c[1] + d[1]))).filter(j => j !== undefined));
  const bordaC = viz.map(v => v.length < 8);
  for (let r = 0; r < 8; r++) { const Y = cells.map(c => c[3]), Z = cells.map(c => c[4]); cells.forEach((c, i) => { if (!bordaC[i]) return; let y = Y[i], z = Z[i]; viz[i].forEach(j => { y += Y[j]; z += Z[j]; }); c[3] = y / (viz[i].length + 1); c[4] = z / (viz[i].length + 1); }); }
  cells.forEach(c => pos.push(c[2], c[3], c[4]));
  const tri = []; cells.forEach((c, i) => { const a = idx.get((c[0] + 1) + ',' + c[1]), b = idx.get(c[0] + ',' + (c[1] + 1)), d = idx.get((c[0] + 1) + ',' + (c[1] + 1)); if (a !== undefined && d !== undefined && b !== undefined) tri.push(i, a, d, i, d, b); });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(tri); geo.computeVertexNormals();
  [1, -1].forEach(sx => { const m = new THREE.Mesh(geo, stdMat(META[id].color, { roughness: 0.85 })); if (sx < 0) m.scale.x = -1; m.userData.op0 = o.op || 0.85; register(id, m, sx); });
}
{
  const CEL = 0.11, ci = cen(1, 'insula'), XI = ci[0] - 0.2, perto = (y, z) => Math.abs(y - ci[1]) < 1.5 && Math.abs(z - ci[2]) < 2.3;
  laminaEnv('capsint', envX(['putame', 'gpe', 'gpi'], false, CEL), CEL, x => x - 0.14, (y, z) => y > -0.6, { op: 0.8 });
  const lat = envX(['putame'], true, CEL);
  laminaEnv('capsext', lat, CEL, x => x + 0.1, perto, { op: 0.55 });
  laminaEnv('claustro', lat, CEL, x => x + 0.25, perto, { op: 0.95 });
  laminaEnv('capsextr', lat, CEL, x => x + 0.4, perto, { op: 0.5 });
}
// corpo caloso: rostro, joelho, tronco e esplênio (linha média da malha de referência)
// corpo caloso por partes (Machado, cap. 7, p. 61): rostro, joelho, tronco, esplênio
const CCP = [[0, 0.5, 2.8], [0, 0.72, 3.5], [0, 1.15, 3.72], [0, 1.6, 3.2], [0, 1.9, 2.0], [0, 2.08, 0.7], [0, 1.95, -0.6], [0, 1.72, -1.6], [0, 1.3, -2.25]];
const CCC = new THREE.CatmullRomCurve3(CCP.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
const CCR = u => 0.13 + 0.12 * smooth(0, 0.1, u) + 0.16 * Math.exp(-Math.pow((u - 0.2) / 0.1, 2)) + 0.27 * smooth(0.82, 0.97, u);
[['cc_rostro', 0, 0.1], ['cc_joelho', 0.1, 0.3], ['cc_tronco', 0.3, 0.8], ['cc_esplenio', 0.8, 1]].forEach(q => {
  const pts = lin(q[1], q[2], 14).map(u => { const v = CCC.getPointAt(u); return [v.x, v.y, v.z]; });
  tube(q[0], pts, uu => CCR(q[1] + (q[2] - q[1]) * uu), 0, { mid: true, sx: 3.0, seg: 40, rad: 14 });
  ITEMS[q[0]].meshes.forEach(m => { m.userData.pai = 'cc'; itemOf('cc').meshes.push(m); });
});
fita('comant', [[-3.0, -1.1, 0.7], [-1.9, -0.55, 1.15], [-1.0, -0.2, 1.32], [0, -0.1, 1.36], [1.0, -0.2, 1.32], [1.9, -0.55, 1.15], [3.0, -1.1, 0.7]], u => 0.07 + 0.07 * (1 - Math.abs(2 * u - 1)), u => 0.06 + 0.05 * (1 - Math.abs(2 * u - 1)), { mid: true });
fita('compost', [[-0.42, -0.12, -1.62], [0, -0.06, -1.6], [0.42, -0.12, -1.62]], 0.09, 0.05, { mid: true, up: [0, 0, 1] });
fita('laminaterm', [[0, -1.25, 1.52], [0, -0.75, 1.46], [0, -0.25, 1.37]], 0.2, 0.02, { mid: true, up: [0, 0, 1], ponta: false });
// límbico
// fórnice: perna (desde a fímbria), corpo (as duas metades lado a lado sob o corpo caloso) e coluna até o corpo mamilar
fita('fornice', [[2.05, 0.05, -2.95], [1.75, 0.75, -2.7], [1.1, 1.4, -2.1], [0.45, 1.68, -1.1], [0.22, 1.7, -0.1], [0.2, 1.5, 0.75], [0.22, 0.9, 1.08], [0.25, 0.2, 1.05], [0.3, -0.5, 0.6], [0.3, -0.95, 0.05]], u => 0.08 + 0.07 * smooth(0.2, 0.38, u) - 0.08 * smooth(0.55, 0.72, u), 0.055, { seg: 120 });
blob('mamilar', [0.3, -1.06, -0.05], [0.22, 0.2, 0.22], null, { amp: 0.05, seed: 21 });
blob('bulbolf', sx => [sx * 1.0, ENV[sx].inf(1.0, 5.9) - 0.2, 5.9], [0.27, 0.16, 0.75], null, { amp: 0.06, achata: [1, 0.6], seed: 23 });
fita('bulbolf', sx => [[sx * 1.0, ENV[sx].inf(1.0, 5.2) - 0.14, 5.2], [sx * 1.15, ENV[sx].inf(1.15, 4.0) - 0.13, 4.0], [sx * 1.35, ENV[sx].inf(1.35, 3.1) - 0.13, 3.1]], 0.1, 0.06, { ponta: false });   // trato olfatório
// diencéfalo
blob('cgl', [2.45, -0.38, -1.75], [0.27, 0.19, 0.3], [0, 0.4, 0], { amp: 0.05, achata: [0, 0.4], seed: 31 });
blob('cgm', [1.88, -0.42, -2.1], [0.22, 0.17, 0.24], null, { amp: 0.05, achata: [0, 0.4], seed: 33 });
blob('hipotal', [0.45, -0.68, 0.6], [0.38, 0.46, 0.85], [0.15, 0, 0], { amp: 0.1, achata: [0, 0.5], seed: 35 });
blob('subtal', [1.2, -0.5, -0.7], [0.38, 0.12, 0.3], [0, 0.5, 0.35], { amp: 0.05, seed: 37 });   // lente biconvexa
blob('pineal', [0, 0.22, -1.88], [0.17, 0.16, 0.3], [-0.35, 0, 0], { mid: true, amp: 0.04, seed: 39 });   // em forma de pinha, voltada para trás
// hipófise: adeno-hipófise (anterior), neuro-hipófise (posterior) e haste (infundíbulo)
blob('adeno', [0, -2.24, 1.47], [0.4, 0.25, 0.26], null, { mid: true, amp: 0.05, seed: 41 });
blob('neurohip', [0, -2.2, 1.14], [0.27, 0.21, 0.17], null, { mid: true, amp: 0.05, seed: 43 });
['adeno', 'neurohip'].forEach(id => ITEMS[id].meshes.forEach(m => { m.userData.pai = 'hipofise'; itemOf('hipofise').meshes.push(m); }));
tube('hipofise', [[0, -1.2, 1.18], [0, -1.6, 1.2], [0, -2.0, 1.17]], u => 0.11 - 0.05 * u, 0, { mid: true, seg: 20, rad: 12 });   // haste da hipófise (infundíbulo)
blob('quiasma', [0, -1.3, 1.5], [0.6, 0.08, 0.27], null, { mid: true, amp: 0.04, seed: 45 });
fita('nc2', sx => [[sx * 0.5, -1.3, 1.75], [sx * 1.0, Math.min(-1.45, ENV[sx].inf(1.0, 2.6) - 0.2), 2.6], [sx * 1.5, Math.min(-1.6, ENV[sx].inf(1.5, 3.6) - 0.25), 3.6]], 0.13, 0.11, { ponta: false });   // nervo óptico
fita('quiasma', [[0.45, -1.3, 1.32], [1.3, -1.2, 0.6], [2.0, -0.9, -0.4], [2.45, -0.5, -1.45]], u => 0.17 - 0.03 * u, 0.065, { ponta: false });     // trato óptico, achatado
// tronco encefálico (eixo inclinado para trás, como na malha de referência)
// pedúnculos cerebrais como faixas achatadas que se abrem para o diencéfalo; colículos como eminências do teto (não esferas)
fita('pedunc', [[0.62, -1.45, -1.05], [1.0, -1.0, -0.8], [1.45, -0.55, -0.45], [1.95, -0.1, -0.1]], u => 0.36 + 0.14 * u, u => 0.24 + 0.04 * u, { up: [0, 0.6, 0.8], ponta: false });
blob('colsup', [0.4, -0.32, -2.42], [0.3, 0.25, 0.27], [0.35, 0, 0], { amp: 0.04, achata: [2, 0.35], seed: 11 });
blob('colinf', [0.38, -0.95, -2.78], [0.27, 0.22, 0.24], [0.5, 0, 0], { amp: 0.04, achata: [2, 0.35], seed: 13 });
blob('snegra', [0.95, -0.95, -1.2], [0.48, 0.36, 0.1], [0.42, 0, 0.5], { amp: 0.06, seed: 47 });   // lâmina entre a base e o tegmento do pedúnculo
blob('rubro', [0.5, -0.6, -1.5], [0.25, 0.25, 0.27], null, { amp: 0.04, seed: 49 });
// cerebelo
// núcleos do cerebelo (Prometheus, p. 240, fig. B; Machado, cap. 22): o denteado é uma lâmina pregueada em forma de bolsa,
// aberta medialmente (hilo); emboliforme em faixa junto ao hilo; globosos em pequenas massas; fastigial junto à linha média
(function () {
  const nt = 96, nf = 40, pos = [], idx = [], hil = 150 * Math.PI / 180, ab = 42 * Math.PI / 180, Rr = [0.5, 0.36, 0.62];
  for (let i = 0; i <= nt; i++) { const th = -Math.PI + 2 * Math.PI * i / nt; for (let j = 0; j <= nf; j++) { const ph = -1.3 + 2.6 * j / nf, rr = 1 + 0.07 * Math.sin(15 * th + 0.8 * Math.sin(3 * ph)) * (0.55 + 0.45 * Math.cos(2 * ph)) + 0.04 * Math.sin(9 * ph + 2 * th); pos.push(Math.cos(ph) * Math.cos(th) * rr * Rr[0], Math.sin(ph) * rr * Rr[1], Math.cos(ph) * Math.sin(th) * rr * Rr[2]); } }
  const angd = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  for (let i = 0; i < nt; i++) { const th = -Math.PI + 2 * Math.PI * (i + 0.5) / nt; if (angd(th, hil) < ab) continue; for (let j = 0; j < nf; j++) { const a = i * (nf + 1) + j, b = a + nf + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  [1, -1].forEach(sx => { const m = new THREE.Mesh(g, stdMat(META.denteado.color, { roughness: 0.55 })); m.position.set(1.75 * sx, -3.0, -4.75); m.rotation.y = -0.35 * sx; if (sx < 0) m.scale.x = -1; register('denteado', m, sx); });
})();
// emboliforme em cunha (Duus, p. 184): mais grosso na frente, junto ao hilo do denteado, afinando para trás
{ const g = blobGeo([0.12, 0.13, 0.32], { amp: 0.06, seed: 2 }), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = 0.3 + 0.7 * (p.getZ(i) / 0.32 + 1) / 2; p.setX(i, p.getX(i) * t); p.setY(i, p.getY(i) * (0.55 + 0.45 * t)); }
  g.computeVertexNormals();
  [1, -1].forEach(sx => { const m = new THREE.Mesh(g, stdMat(META.emboliforme.color, { roughness: 0.6 })); m.position.set(1.18 * sx, -2.95, -4.45); m.rotation.y = 0.35 * sx; if (sx < 0) m.scale.x = -1; register('emboliforme', m, sx); }); }
// globosos: em geral 2 ou 3 massas arredondadas (Duus, p. 184), em fila de frente para trás
blob('globoso', [0.84, -2.97, -4.27], [0.085, 0.085, 0.095], null, { amp: 0.1, seed: 3 });
blob('globoso', [0.8, -3.02, -4.5], [0.08, 0.08, 0.09], null, { amp: 0.1, seed: 5 });
blob('globoso', [0.78, -3.06, -4.72], [0.07, 0.07, 0.08], null, { amp: 0.1, seed: 11 });
blob('fastigial', [0.24, -2.86, -4.45], [0.1, 0.11, 0.2], null, { amp: 0.1, seed: 7 });
// ventrículos
tube('aqueduto', [[0, -0.15, -1.6], [0, -0.6, -2.25], [0, -1.2, -2.65], [0, -1.7, -2.9]], 0.1, 0.1, { mid: true });

