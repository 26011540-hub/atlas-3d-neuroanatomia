/* ===== CORTE SAGITAL MEDIANO (reforma do cerebelo, Fase 3) =====
   Plano 2 da fig. 5.5a do Duus (Machado, cap. 5, figura do corte sagital do verme). O plano x = 0 recorta o cerebelo,
   o tronco e o IV ventrículo; a face cortada é desenhada numa textura a partir da interseção de cada malha com o plano:
   - cerebelo: córtex (superfície pial do Sereno) em cinzento e corpo medular (superfície branca do Sereno) em branco:
     a árvore da vida sai dos dados, não de desenho;
   - tronco (mesencéfalo, ponte, bulbo, medula), aqueduto, IV ventrículo, véu medular superior: as malhas do atlas
     cortadas no mesmo plano, então o IV ventrículo casa com o tronco por construção.
   Realista: cinzento e branco. Esquemático: o córtex de cada lóbulo do verme na cor do lóbulo (lóbulo do vértice
   do Sereno mais próximo, rotulado pelo SUIT) e as fissuras como linhas escuras entre lóbulos de postos vizinhos.
   O "leque" antigo (CB.corte) continua no modo Atlas. */
M('teto_mes', 'Teto do mesencéfalo (lâmina quadrigêmea)', 'stem', '#e8c08a', 'Parte dorsal do mesencéfalo, atrás do aqueduto cerebral: os colículos superiores e inferiores (lâmina quadrigêmea ou do teto).', '', '');
M('tela_v4', 'Tela corioide do IV ventrículo', 'vent', '#d8587f', 'Pia-máter e epêndima que fecham a parte caudal do teto do IV ventrículo, abaixo do nódulo; dela pende o plexo corioide e nela se abre a abertura mediana.', 'Artéria cerebelar inferior posterior.', '');
REF(['teto_mes', 'tela_v4'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 5, p. 43-46.');
NOTA('tela_v4', 'Só rótulo no corte sagital: a tela não tem malha própria no atlas; o rótulo fica entre o nódulo e a abertura mediana.');
const CBSG = { on: false, tex: null, mesh: null, ids: [], pix: null, W: 0, H: 0, box: null, anc: [] };
const CBSG_X = 0.05;   // meio milímetro ao lado da linha média (as malhas do atlas são metades abertas exatamente em x = 0)
const CBSG_PLANO = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);   // fica o lado esquerdo (x >= 0)
const CBSG_TRONCO = [['medula', '#dcc39d'], ['bulbo', '#c99a72'], ['ponte', '#c98a55'], ['mesenc', '#e2b27c']];
const CBSG_CAV = [['v4', '#8fd0e6'], ['aqueduto', '#8fd0e6']];
const CBSG_VIZ = ['mesenc', 'teto_mes', 'aqueduto', 'veusup', 'v4', 'tela_v4', 'plexo', 'abmed', 'ponte', 'bulbo', 'medula'];

// interseção de uma malha com o plano x = CBSG_X: segmentos [z1, y1, z2, y2] (sem encadear: o preenchimento é por varredura)
function cbsgSecao(m) {
  m.updateMatrixWorld(true);
  const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count, W = new Float32Array(p.count * 3), v = new THREE.Vector3(), out = [];
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); W[i * 3] = v.x; W[i * 3 + 1] = v.y; W[i * 3 + 2] = v.z; }
  const pto = (a, b) => { const xa = W[a * 3] - CBSG_X, xb = W[b * 3] - CBSG_X, t = xa / (xa - xb); return [W[a * 3 + 2] + (W[b * 3 + 2] - W[a * 3 + 2]) * t, W[a * 3 + 1] + (W[b * 3 + 1] - W[a * 3 + 1]) * t]; };
  for (let t = 0; t < n; t += 3) {
    const q = [ix ? ix[t] : t, ix ? ix[t + 1] : t + 1, ix ? ix[t + 2] : t + 2], cr = [];
    for (let e = 0; e < 3; e++) { const a = q[e], b = q[(e + 1) % 3]; if ((W[a * 3] > CBSG_X) !== (W[b * 3] > CBSG_X)) cr.push(pto(a, b)); }
    if (cr.length === 2) out.push([cr[0][0], cr[0][1], cr[1][0], cr[1][1]]);
  }
  return out;
}
// malhas do atlas que são metades abertas na linha média: o contorno mediano é a borda da abertura (arestas de um triângulo
// só, com x perto de 0), soldando as peças pela posição. Devolve segmentos com o id da peça de cada um.
function cbsgBorda(itens) {
  const usa = new Map(), pos = new Map(), v = new THREE.Vector3(), chave = () => v.x.toFixed(4) + ',' + v.y.toFixed(4) + ',' + v.z.toFixed(4);
  itens.forEach(id => {
    const vistos = new Set();
    cbsgMalhas(id).forEach(m => {
      if (vistos.has(m.geometry.uuid)) return; m.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(m); if (b.max.x + b.min.x < 0) return; vistos.add(m.geometry.uuid);   // só a metade esquerda
      const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count, K = new Array(p.count);
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); const k = chave(); K[i] = k; if (!pos.has(k)) pos.set(k, [v.x, v.y, v.z]); }
      for (let t = 0; t < n; t += 3) for (let e = 0; e < 3; e++) { const a = K[ix ? ix[t + e] : t + e], c = K[ix ? ix[t + (e + 1) % 3] : t + (e + 1) % 3]; if (a === c) continue; const k = a < c ? a + '|' + c : c + '|' + a, u = usa.get(k); if (u) u.n++; else usa.set(k, { n: 1, id, a, c }); }
    });
  });
  const out = [];
  usa.forEach(u => { if (u.n !== 1) return; const A = pos.get(u.a), C = pos.get(u.c); if (Math.abs(A[0]) > 0.15 || Math.abs(C[0]) > 0.15) return; const sg = [A[2], A[1], C[2], C[1]]; sg.id = u.id; out.push(sg); });
  return out;
}
// paridade por projeção: cada triângulo do lado x > plano projetado em (z, y) inverte os pixels que cobre; ímpar = a
// reta do pixel para o lado cruza a parede uma vez = o pixel está dentro. Vale para metades abertas na linha média.
function cbsgParidade(ids, W, H, px) {
  const M = new Uint8Array(W * H), v = new THREE.Vector3();
  ids.forEach(id => { const vistos = new Set(); cbsgMalhas(id).forEach(m => {
    if (vistos.has(m.geometry.uuid + m.matrixWorld.elements[0])) return; m.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(m); if (b.max.x < CBSG_X) return; vistos.add(m.geometry.uuid + m.matrixWorld.elements[0]);
    const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count, X = new Float32Array(p.count), Q = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); X[i] = v.x; const [a, c] = px([v.z, v.y]); Q[i * 2] = a; Q[i * 2 + 1] = c; }
    for (let t = 0; t < n; t += 3) {
      const i0 = ix ? ix[t] : t, i1 = ix ? ix[t + 1] : t + 1, i2 = ix ? ix[t + 2] : t + 2; if ((X[i0] + X[i1] + X[i2]) / 3 <= CBSG_X) continue;
      const ax = Q[i0 * 2], ay = Q[i0 * 2 + 1], bx = Q[i1 * 2], by = Q[i1 * 2 + 1], cx = Q[i2 * 2], cy = Q[i2 * 2 + 1], ar = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); if (Math.abs(ar) < 1e-9) continue;
      const x0 = Math.max(0, Math.ceil(Math.min(ax, bx, cx) - 0.5)), x1 = Math.min(W - 1, Math.floor(Math.max(ax, bx, cx) - 0.5)), y0 = Math.max(0, Math.ceil(Math.min(ay, by, cy) - 0.5)), y1 = Math.min(H - 1, Math.floor(Math.max(ay, by, cy) - 0.5));
      for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) { const X0 = xx + 0.5, Y0 = yy + 0.5, w0 = ((bx - X0) * (cy - Y0) - (by - Y0) * (cx - X0)) / ar, w1 = ((cx - X0) * (ay - Y0) - (cy - Y0) * (ax - X0)) / ar, w2 = 1 - w0 - w1; if (w0 >= 0 && w1 >= 0 && w2 > 0) M[yy * W + xx] ^= 1; }
    }
  }); });
  return M;
}
// varredura par-ímpar: cada linha de pixels cruza os segmentos; entre pares de cruzamentos fica dentro
function cbsgVarre(segs, W, H, px) {
  const linhas = Array.from({ length: H }, () => []), M = new Uint8Array(W * H);
  segs.forEach(sg => { const [x1, y1] = px([sg[0], sg[1]]), [x2, y2] = px([sg[2], sg[3]]); if (y1 === y2) return; const a = Math.max(0, Math.ceil(Math.min(y1, y2) - 0.5)), b = Math.min(H - 1, Math.floor(Math.max(y1, y2) - 0.5)); for (let r = a; r <= b; r++) { const yc = r + 0.5; if ((yc >= Math.min(y1, y2)) && (yc < Math.max(y1, y2))) linhas[r].push(x1 + (x2 - x1) * (yc - y1) / (y2 - y1)); } });
  linhas.forEach((L, r) => { if (L.length < 2) return; L.sort((p, q) => p - q); for (let i = 0; i + 1 < L.length; i += 2) { const a = Math.max(0, Math.ceil(L[i] - 0.5)), b = Math.min(W - 1, Math.floor(L[i + 1] - 0.5)); for (let x = a; x <= b; x++) M[r * W + x] = 1; } });
  return M;
}
function cbsgMalhas(id) { return (ITEMS[id] ? ITEMS[id].meshes : []).filter(m => !m.userData.cbiSag && !m.userData.secao && !m.userData.suit && m.geometry && m.geometry.attributes.position); }

// monta a textura do corte (e o mapa de ids por pixel, para clique e rótulos)
function cbsgMontar() {
  const cort = CBS.malhas.folhas || CBS.malhas.leve; if (!cort || !CBI.branca) return false;
  const fontes = { cortex: [cbsgSecao(cort)], branca: [cbsgSecao(CBI.branca)] };
  fontes.veusup = cbsgMalhas('veusup').map(cbsgSecao).filter(L => L.length);
  const box = { z0: 1e9, z1: -1e9, y0: 1e9, y1: -1e9 };
  Object.values(fontes).forEach(LL => LL.forEach(L => L.forEach(sg => { box.z0 = Math.min(box.z0, sg[0], sg[2]); box.z1 = Math.max(box.z1, sg[0], sg[2]); box.y0 = Math.min(box.y0, sg[1], sg[3]); box.y1 = Math.max(box.y1, sg[1], sg[3]); })));
  CBSG_TRONCO.concat(CBSG_CAV).forEach(([id]) => cbsgMalhas(id).forEach(m => { const b = new THREE.Box3().setFromObject(m); box.z0 = Math.min(box.z0, b.min.z); box.z1 = Math.max(box.z1, b.max.z); box.y0 = Math.min(box.y0, b.min.y); box.y1 = Math.max(box.y1, b.max.y); }));
  box.y0 = Math.max(box.y0, -8.5); const mg = 0.2; box.z0 -= mg; box.z1 += mg; box.y0 -= mg; box.y1 += mg;
  const esc = 1400 / Math.max(box.z1 - box.z0, box.y1 - box.y0), W = Math.ceil((box.z1 - box.z0) * esc), H = Math.ceil((box.y1 - box.y0) * esc);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  const px = ([z, y]) => [(z - box.z0) * esc, (box.y1 - y) * esc];
  const ids = ['', 'cb_cortex', 'cb_cbm'].concat(CBSG_TRONCO.map(q => q[0]), CBSG_CAV.map(q => q[0]), ['veusup']);
  const pix = new Uint8Array(W * H), poe = (LL, id) => { const k = ids.indexOf(id); LL.forEach(L => { const M = cbsgVarre(L, W, H, px); for (let i = 0; i < M.length; i++) if (M[i]) pix[i] = k; }); };
  poe(fontes.cortex, 'cb_cortex'); poe(fontes.branca, 'cb_cbm');
  // tronco e cavidades: paridade por projeção, parte a parte (a de cima na lista prevalece)
  CBSG_TRONCO.forEach(([id]) => { const k = ids.indexOf(id), M = cbsgParidade([id], W, H, px); for (let i = 0; i < M.length; i++) if (M[i]) pix[i] = k; });
  CBSG_CAV.forEach(([id]) => { const k = ids.indexOf(id), M = cbsgParidade([id], W, H, px); for (let i = 0; i < M.length; i++) if (M[i]) pix[i] = k; });

  { const k = ids.indexOf('veusup'), r = Math.max(1, Math.round(esc * 0.015)); fontes.veusup.forEach(L => L.forEach(sg => { const [x1, y1] = px([sg[0], sg[1]]), [x2, y2] = px([sg[2], sg[3]]), n = Math.ceil(Math.hypot(x2 - x1, y2 - y1)) + 1; for (let i = 0; i <= n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n); for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) { const xx = x + a, yy = y + b; if (xx >= 0 && yy >= 0 && xx < W && yy < H) pix[yy * W + xx] = k; } } })); }   // véu: lâmina fina, desenhada como traço
  // córtex: o lóbulo do vértice do Sereno mais próximo da linha média (grade de 1 mm)
  const L = cort.geometry.userData.lobulo, P = cort.geometry.attributes.position.array, grade = new Map(), G = 0.1;
  for (let i = 0; i < L.length; i++) { if (Math.abs(P[i * 3]) > 0.3 || !CBS_RANK[L[i]]) continue; const k = Math.floor(P[i * 3 + 2] / G) + ',' + Math.floor(P[i * 3 + 1] / G); (grade.get(k) || grade.set(k, []).get(k)).push(i); }
  const lobIds = Object.keys(CBS_RANK), lob = new Uint8Array(W * H);
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    const q = yy * W + xx; if (pix[q] !== 1) continue;
    const z = box.z0 + (xx + 0.5) / esc, y = box.y1 - (yy + 0.5) / esc, gz = Math.floor(z / G), gy = Math.floor(y / G); let best = -1, bd = 1e9;
    for (let r = 1; r <= 4 && best < 0; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) { const l = grade.get((gz + a) + ',' + (gy + b)); if (l) l.forEach(i => { const d = (P[i * 3 + 2] - z) ** 2 + (P[i * 3 + 1] - y) ** 2; if (d < bd) { bd = d; best = i; } }); }
    lob[q] = best >= 0 ? lobIds.indexOf(L[best]) + 1 : 0;
  }
  Object.assign(CBSG, { W, H, box, esc, pix, lob, ids, lobIds, cv, ctx });
  cbsgPintar();
  // malha do corte
  if (CBSG.mesh) { scene.remove(CBSG.mesh); }
  const geo = new THREE.PlaneGeometry(W / esc, H / esc); geo.rotateY(-Math.PI / 2);
  CBSG.tex = new THREE.CanvasTexture(cv); CBSG.tex.anisotropy = 4;
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: CBSG.tex, emissiveMap: CBSG.tex, color: '#000000', emissive: '#ffffff', transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1, metalness: 0 }));   // sem luz: as cores da textura, como numa figura
  mesh.position.set(-0.002, (box.y0 + box.y1) / 2, (box.z0 + box.z1) / 2);
  if (!CBSG.mesh) { mesh.userData.cbiSag = true; mesh.userData.semBolacha = true; register('arbvida', mesh, 0); }
  else { const it = ITEMS.arbvida.meshes, i = it.indexOf(CBSG.mesh), j = ALLMESH.indexOf(CBSG.mesh); CBSG.mesh.parent && CBSG.mesh.parent.remove(CBSG.mesh); mesh.userData = CBSG.mesh.userData; it[i] = mesh; ALLMESH[j] = mesh; grpObj[META.arbvida.grp].add(mesh); }
  CBSG.mesh = mesh; cbsgAncoras();
  return true;
}
// pinta a textura a partir dos mapas (Realista ou Esquemático); o mapa de ids fica intacto
function cbsgPintar() {
  const { W, H, pix, lob, ids, lobIds, ctx } = CBSG, img = ctx.createImageData(W, H), D = img.data, c = new THREE.Color(), esq = state.tema === 'esquematico';
  const corId = {}; CBSG_TRONCO.concat(CBSG_CAV).forEach(([id, cor]) => corId[id] = cor); corId.cb_cortex = '#8f877f'; corId.cb_cbm = '#f4efe6'; corId.veusup = '#f1e4d4';
  const rgb = ids.map(id => { c.set(corId[id] || '#000000'); return [c.r * 255, c.g * 255, c.b * 255]; });
  const rgbL = lobIds.map(id => { c.set(CBS_LOBULO_COR[id]); return [c.r * 255, c.g * 255, c.b * 255]; });
  const rk = q => CBS_RANK[lobIds[lob[q] - 1]] || 0, sel = state.sel, idDe = q => pix[q] === 1 ? (lob[q] ? lobIds[lob[q] - 1] : 'cb_cortex') : ids[pix[q]];
  const noCorte = !!sel && (ids.indexOf(sel) > 0 || lobIds.indexOf(sel) >= 0 || sel === 'vermis' || sel === 'cb_ant' || sel === 'cb_post' || sel === 'cb_fn');
  const daSel = q => { const id = idDe(q); return id === sel || (sel === 'vermis' && pix[q] === 1) || (/^cb_(ant|post|fn)$/.test(sel) && pix[q] === 1 && lob[q] && ({ 1: 'cb_ant', 2: 'cb_ant', 3: 'cb_ant', 9: 'cb_fn' }[rk(q)] || 'cb_post') === sel); };
  for (let q = 0; q < W * H; q++) {
    const k = pix[q]; if (!k) continue; let col = rgb[k];
    if (k === 1 && esq && lob[q]) {
      col = rgbL[lob[q] - 1];
      const x = q % W, r0 = rk(q);   // fissura: vizinho de posto diferente (linha escura dentro do cinzento)
      for (const d of [1, -1, W, -W, 2, -2, 2 * W, -2 * W]) { const o = q + d; if (o >= 0 && o < W * H && pix[o] === 1 && lob[o] && rk(o) !== r0 && Math.abs((o % W) - x) <= 2) { col = [45, 25, 18]; break; } }
    }
    if (noCorte) { if (daSel(q)) col = [col[0] * 0.45 + 140, col[1] * 0.45 + 128, col[2] * 0.3 + 20]; else { const y = col[0] * 0.3 + col[1] * 0.59 + col[2] * 0.11, g = 60 + y * 0.45; col = [col[0] * 0.2 + g * 0.8, col[1] * 0.2 + g * 0.8, col[2] * 0.2 + g * 0.8]; } }   // escolhido acende; o resto fica cinza
    D[q * 4] = col[0]; D[q * 4 + 1] = col[1]; D[q * 4 + 2] = col[2]; D[q * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); if (CBSG.tex) CBSG.tex.needsUpdate = true; CBSG.pintadoEsq = esq; CBSG.pintadoSel = sel; marca();
}
const cbsgPara3D = (xx, yy) => new THREE.Vector3(-0.03, CBSG.box.y1 - (yy + 0.5) / CBSG.esc, CBSG.box.z0 + (xx + 0.5) / CBSG.esc);
// âncoras: o pixel de cada região mais perto do seu centro; fissuras: o ponto do limite mais longe do corpo medular (a boca da fissura)
function cbsgAncoras() {
  const { W, H, pix, lob, lobIds } = CBSG, soma = {}, add = (id, x, y) => { const s = soma[id] || (soma[id] = { n: 0, x: 0, y: 0, pts: [] }); s.n++; s.x += x; s.y += y; if (s.n % 7 === 1) s.pts.push([x, y]); };
  let bx = 0, by = 0, bn = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const q = y * W + x, k = pix[q]; if (!k) continue; if (k === 1 && lob[q]) add(lobIds[lob[q] - 1], x, y); else if (k > 1) add(CBSG.ids[k], x, y); if (k === 2) { bx += x; by += y; bn++; } }
  const anc = [];
  Object.entries(soma).forEach(([id, s]) => { if (s.n < 25 || (lobIds.indexOf(id) >= 0 && !CB_VERME_SET.has(id))) return; const cx = s.x / s.n, cy = s.y / s.n; let b = s.pts[0], bd = 1e9; s.pts.forEach(p => { const d = (p[0] - cx) ** 2 + (p[1] - cy) ** 2; if (d < bd) { bd = d; b = p; } }); anc.push({ id, p: cbsgPara3D(b[0], b[1]) }); });
  bx /= bn || 1; by /= bn || 1;
  const rk = q => CBS_RANK[lobIds[lob[q] - 1]] || 0;
  CBT_FIS.forEach(([fid, k]) => {
    let b = null, bd = -1;
    for (let y = 1; y < H - 1; y += 2) for (let x = 1; x < W - 1; x += 2) { const q = y * W + x; if (pix[q] !== 1 || !lob[q]) continue; const r = rk(q); if (r !== k) continue; const o = [q + 2, q - 2, q + 2 * W, q - 2 * W].find(o => pix[o] === 1 && lob[o] && rk(o) === k + 1); if (o === undefined) continue; const d = (x - bx) ** 2 + (y - by) ** 2; if (d > bd) { bd = d; b = [x, y]; } }
    if (b) anc.push({ id: fid, p: cbsgPara3D(b[0], b[1]), fis: true });
  });
  // teto do mesencéfalo: a parte do mesencéfalo atrás (dorsal) do aqueduto; tela corioide: entre o nódulo e a abertura mediana
  const aq = anc.find(a => a.id === 'aqueduto'), me = soma.mesenc;
  if (aq && me) { let b = null, bd = 1e9; me.pts.forEach(p => { const v = cbsgPara3D(p[0], p[1]); if (v.z < aq.p.z - 0.15 && Math.abs(v.y - aq.p.y) < 0.6) { const d = Math.abs(v.z - (aq.p.z - 0.35)); if (d < bd) { bd = d; b = v; } } }); if (b) anc.push({ id: 'teto_mes', p: b }); }
  const no = anc.find(a => a.id === 'cb_nodulo'), am = ITEMS.abmed && ITEMS.abmed.meshes[0] ? new THREE.Box3().setFromObject(ITEMS.abmed.meshes[0]).getCenter(new THREE.Vector3()) : null;
  if (no && am) anc.push({ id: 'tela_v4', p: new THREE.Vector3(-0.03, (no.p.y + am.y) / 2, (no.p.z + am.z) / 2) });
  if (am) anc.push({ id: 'abmed', p: new THREE.Vector3(-0.03, am.y, am.z) });
  if (ITEMS.plexo) { const pl = ITEMS.plexo.meshes.filter(m => m.userData.side !== -1).map(m => new THREE.Box3().setFromObject(m)).find(b => b.max.y < -2); if (pl) { const c = pl.getCenter(new THREE.Vector3()); anc.push({ id: 'plexo', p: new THREE.Vector3(-0.03, c.y, c.z) }); } }
  CBSG.anc = anc;
}
// pixel do corte com tecido (os vãos entre as folhas são transparentes: o raio passa)
function cbsgPixel(uv) { if (!uv || !CBSG.pix) return 0; const x = Math.min(CBSG.W - 1, Math.floor(uv.x * CBSG.W)), y = Math.min(CBSG.H - 1, Math.floor((1 - uv.y) * CBSG.H)); return CBSG.pix[y * CBSG.W + x]; }
// clique e passagem do mouse no corte: o id do pixel
const _loboCbsg = loboDoCorte;
loboDoCorte = function (h) {
  if (h && h.mesh && h.mesh.userData.cbiSag && h.uv && CBSG.pix) {
    const x = Math.min(CBSG.W - 1, Math.floor(h.uv.x * CBSG.W)), y = Math.min(CBSG.H - 1, Math.floor((1 - h.uv.y) * CBSG.H)), q = y * CBSG.W + x, k = CBSG.pix[q];
    if (k === 1) return CBSG.lob[q] ? CBSG.lobIds[CBSG.lob[q] - 1] : 'vermis';
    return k ? CBSG.ids[k] : null;
  }
  return _loboCbsg(h);
};

/* --- ligar e desligar --- */
function setSagital(on) {
  CBSG.on = !!on; document.getElementById('cbSag').setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) {
    if (CBI.corte) setCorteH(false);
    CBI.verBranca = true; cbiCarregarBranca();
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = ['cereb', 'ped', 'stem', 'vent'].indexOf(k) >= 0); syncLayerUI();
    state.hideR = true; state.hideL = false; syncHemiUI(); state.sel = null;
    const c = cbtCentro(); camGoal.theta = -Math.PI / 2; camGoal.phi = Math.PI / 2 - 0.05; camGoal.target.set(0, c.y + 0.3, c.z + 1.3); camGoal.dist = 21;
    CBT.vista = 'sagital'; document.querySelectorAll('[data-cbv]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    const tenta = () => { if (!CBSG.on) return; if (!CBSG.pix || CBSG.cort !== (CBS.malhas.folhas || CBS.malhas.leve)) { if (cbsgMontar()) CBSG.cort = CBS.malhas.folhas || CBS.malhas.leve; else return setTimeout(tenta, 300); } cbsgAplicar(); };
    tenta();
  } else { CBI.verBranca = false; state.hideR = false; syncHemiUI(); cbsgAplicar(); }
}
function cbsgAplicar() {
  ALLMESH.forEach(m => { if (m.userData.cbiSag || m.userData.cortex) return; const g = META[m.userData.id] && META[m.userData.id].grp; if (['cereb', 'ped', 'stem', 'vent', 'nc', 'art', 'ven'].indexOf(g) < 0) return; const quer = CBSG.on ? [CBSG_PLANO] : (CBI.corte && (g === 'cereb' || g === 'ped') ? [CBI_PLANO] : null); if (m.material.clippingPlanes !== quer && JSON.stringify(m.material.clippingPlanes) !== JSON.stringify(quer)) { m.material.clippingPlanes = quer; m.material.needsUpdate = true; } });
  applyVisibility(); applyAppearance(); marca();
}
const _visCbsg = applyVisibility;
applyVisibility = function () {
  _visCbsg();
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.cbiSag) { m.visible = CBSG.on && !!state.groupOn.cereb; return; }
    if (CBSG.on && u.corte) m.visible = false;                                                             // o leque antigo sai
    if (CBSG.on && META[u.id] && META[u.id].grp === 'vent' && ['v4', 'aqueduto', 'plexo', 'abmed', 'teto_v4'].indexOf(u.id) < 0) m.visible = false;
    if (CBSG.on && u.id === 'plexo') { if (u.plexoV4 === undefined) u.plexoV4 = new THREE.Box3().setFromObject(m).max.y < -2; if (!u.plexoV4) m.visible = false; }   // só o plexo do IV ventrículo
  });
  if (CBSG.on && CBSG.pix && CBSG.pintadoEsq !== (state.tema === 'esquematico')) cbsgPintar();
};
// o corte é uma textura só: não esmaece com o isolamento (a parte escolhida acende dentro dele)
const _apCbsg = applyAppearance;
applyAppearance = function () {
  _apCbsg();
  if (!CBSG.mesh) return;
  const m = CBSG.mesh.material; m.opacity = 1; m.transparent = false; m.depthWrite = true; m.color.set('#000000'); m.emissive.set('#ffffff'); m.emissiveIntensity = 1;
  if (CBSG.on && CBSG.pix && CBSG.pintadoSel !== state.sel) cbsgPintar();
};
// rótulos do corte: lóbulos do verme, fissuras e vizinhos, todos no plano (sem filtro de face)
const _rotCbsg = stepRotulos;
stepRotulos = function () {
  if (!CBSG.on || !CBT.painel) return _rotCbsg();
  const salva = CBT.anc, salvaF = CBT.fisMalhas; CBT.anc = []; CBT.fisMalhas = [];
  _rotCbsg(); CBT.anc = salva; CBT.fisMalhas = salvaF;
  if (CBT.cbRotEl.hidden || CBT.rot === 'nenhum') return;
  const w = canvas.clientWidth, h = canvas.clientHeight, caixas = [], usados = new Set(), _p = new THREE.Vector3();
  CBT.cbRotEl.querySelectorAll('.cbrot').forEach(e => { if (!e.dataset.sag) e.hidden = true; });
  const lista = CBSG.anc.slice().sort((a, b) => (b.id === state.sel) - (a.id === state.sel) || (CB_VERME_SET.has(b.id) ? 2 : (b.fis ? 1 : 0)) - (CB_VERME_SET.has(a.id) ? 2 : (a.fis ? 1 : 0)));
  lista.forEach(a => {
    if (!META[a.id]) return; _p.copy(a.p).project(camera); if (_p.z > 1 || Math.abs(_p.x) > 0.98 || Math.abs(_p.y) > 0.98) return;
    const x = (_p.x + 1) / 2 * w, txt = nomeVisivel(a.id) ? nomeL(a.id) : '?', lw = (txt.length * 6.3 + 14) / 2, lh = 9; let y = (1 - _p.y) / 2 * h;
    const livre = yy => !caixas.some(b => Math.abs(b[0] - x) < b[2] + lw && Math.abs(b[1] - yy) < b[3] + lh);
    const dy = [0, -18, 18, -36, 36].find(d => livre(y + d)); if (dy === undefined) return; y += dy; caixas.push([x, y, lw, lh]);   // esbarrou: desliza um pouco para cima ou para baixo
    const chave = 'sag|' + a.id; usados.add(chave); let el = CBT_ROT[chave];
    if (!el) { el = CBT_ROT[chave] = document.createElement('button'); el.type = 'button'; el.className = 'rot cbrot'; el.dataset.sag = '1'; el.dataset.id = a.id; CBT.cbRotEl.appendChild(el); el.addEventListener('click', ev => { ev.stopPropagation(); if (state.ocultar && !REVELADO[a.id]) REVELADO[a.id] = true; select(a.id, { focus: false }); }); }
    if (el.textContent !== txt) el.textContent = txt; el.classList.toggle('fis', !!a.fis); el.classList.toggle('on', state.sel === a.id);
    el.hidden = false; el.style.left = x + 'px'; el.style.top = y + 'px';
  });
  Object.keys(CBT_ROT).forEach(k => { if (/^sag\|/.test(k) && !usados.has(k)) CBT_ROT[k].hidden = true; });
};
// fora do corte, os rótulos do corte somem
const _rotCbsg2 = stepRotulos; stepRotulos = function () { _rotCbsg2(); if (!CBSG.on) Object.keys(CBT_ROT).forEach(k => { if (/^sag\|/.test(k)) CBT_ROT[k].hidden = true; }); };
document.getElementById('cbSag').addEventListener('click', () => setSagital(!CBSG.on));
document.querySelectorAll('[data-cbv]').forEach(b => b.addEventListener('click', () => { if (CBSG.on) { CBSG.on = false; setSagital(false); cbtVista(b.dataset.cbv); } }, true));
const _corteHSag = setCorteH; setCorteH = function (on) { if (on && CBSG.on) setSagital(false); _corteHSag(on); };
const _cbPainelSag = setCbPainel; setCbPainel = function (on) { if (!on && CBSG.on) setSagital(false); _cbPainelSag(on); };
if (/debug/.test(location.hash)) window.cbsgDebug = { CBSG, setSagital, cbsgMontar, cbsgPintar };
