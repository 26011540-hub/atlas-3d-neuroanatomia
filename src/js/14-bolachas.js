/* ===== BOLACHAS: cortes coronais em 3D (remodelagem 3, fase 3) =====
   Gabarito e modelo: atlas de cortes coronais da Unicamp (12 cortes, face anterior "a" e posterior "b"); nenhuma imagem copiada.
   A face de cada corte é calculada aqui: a interseção de cada malha com o plano dá segmentos; o interior é preenchido
   linha a linha (par-ímpar); no córtex e no cerebelo, a faixa junto da superfície vira substância cinzenta e o resto, branca.
   Os planos foram escolhidos para passar pelas mesmas estruturas-chave de cada corte da Unicamp (ver GABARITO.md). */
const BOL_Z = [5.2, 3.2, 1.72, 0.85, -1.0, -1.45, -1.75, -2.05, -2.4, -4.0, -5.4, -6.8];   // plano k = face "a" do corte k+1 e face "b" do corte k
const BOL_POLO = [8.4, -9.5];   // polos frontal e occipital (fim das fatias da ponta)
const BOL_X0 = -7.3, BOL_X1 = 7.3, BOL_Y0 = -7.6, BOL_Y1 = 8.5;
const BOL_TOQUE = window.matchMedia && matchMedia('(pointer: coarse)').matches;
const BOL_RES = BOL_TOQUE ? 0.026 : 0.02, BOL_NX = Math.round((BOL_X1 - BOL_X0) / BOL_RES), BOL_NY = Math.round((BOL_Y1 - BOL_Y0) / BOL_RES);
const BOL_CINZA = 0.25, BOL_CINZA_CB = 0.13;   // espessura da faixa cinzenta: córtex cerebral e cerebelar (cm)
// itens-lâmina (superfícies abertas): no corte viram traços, não áreas
const BOL_LAMINA = { septo: 0.05, capsint: 0.12, capsext: 0.05, claustro: 0.06, capsextr: 0.05, foice: 0.05, tentorio: 0.05, foicecb: 0.04, diafragma: 0.04, alveo: 0.03 };
const BOL_FORA = { arbvida: 1 };   // o corte sagital do verme não entra
const BOL_TRONCO = { mesenc: 1, ponte: 1, bulbo: 1 };
M('cbm', 'Centro branco medular do cérebro', 'cortex', '#efe7da', 'Substância branca dos hemisférios, sob o córtex: fibras de projeção (coroa radiada), de associação e comissurais. Também chamado centro semioval.', 'Ramos corticais (fibras longas) e centrais.', '');
M('cb_cbm', 'Corpo medular do cerebelo', 'stem', '#efe4d2', 'Substância branca do cerebelo, sob o córtex cerebelar; no verme, em corte sagital, forma a árvore da vida. Contém os núcleos centrais.', 'Artérias cerebelares.', '');
M('cx_cinza', 'Córtex cerebral (substância cinzenta)', 'cortex', '#a08f86', 'Camada de substância cinzenta, de 2 a 4 mm, que reveste os giros e acompanha o fundo dos sulcos. No corte, é a faixa mais escura por fora da substância branca.', 'Ramos corticais das artérias cerebrais.', '');
REF(['cbm', 'cb_cbm', 'cx_cinza'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7 e cap. 5. Gabarito: Unicamp, cortes coronais.');
const BOL_BRANCAS = /^(cc|cc_|capsint|capsext|capsextr|fornice|fimbria|alveo|comant|compost|f_|estria_t|cbm|cb_cbm|quiasma|nc\d|v_|pedunc|pcs|pcm|pci|veusup|piramide|laminaterm)/;
const bolNome = id => (META[id] ? META[id].name : id);
// um id e os seus "pais" (lobo, item que reúne partes): o lobo frontal está presente se um giro frontal estiver
const BOL_PAIS = {};
function bolPais(id) { let r = BOL_PAIS[id]; if (r) return r; r = [id]; const it = ITEMS[id], m = it && it.meshes.find(q => q.userData.id === id); if (m) { if (m.userData.lobo && META[m.userData.lobo]) r.push(m.userData.lobo); if (m.userData.pai && META[m.userData.pai] && r.indexOf(m.userData.pai) < 0) r.push(m.userData.pai); } return (BOL_PAIS[id] = r); }

// ---- posições do mundo de cada malha, guardadas uma vez
const BOL_W = new Map();
function bolMundo(m) {
  let w = BOL_W.get(m); if (w) return w;
  m.updateMatrixWorld(true);
  const g = m.geometry, p = m.userData.cortex && m.userData.p0 ? m.userData.p0 : g.attributes.position.array, n = p.length / 3, e = m.matrixWorld.elements, P = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2]; P[i * 3] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[i * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[i * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; }
  let zmin = Infinity, zmax = -Infinity; for (let i = 2; i < P.length; i += 3) { if (P[i] < zmin) zmin = P[i]; if (P[i] > zmax) zmax = P[i]; }
  let cx = 0, cy = 0, cz = 0; for (let i = 0; i < P.length; i += 3) { cx += P[i]; cy += P[i + 1]; cz += P[i + 2]; } cx /= n; cy /= n; cz /= n;
  let r2 = 0; for (let i = 0; i < P.length; i += 3) { const d = (P[i] - cx) ** 2 + (P[i + 1] - cy) ** 2 + (P[i + 2] - cz) ** 2; if (d > r2) r2 = d; }
  w = { P, zmin, zmax, c: [cx, cy, cz], r: Math.sqrt(r2) }; BOL_W.set(m, w); return w;
}
// grupo de preenchimento: superfícies divididas em partes são preenchidas juntas
function bolChave(m) {
  const u = m.userData, s = u.side || 0;
  if (u.cortex) return 'CX' + s;
  if (u.pai === 'cerebelo' || u.pai === 'vermis') return 'CB' + u.pai + s;
  if (BOL_TRONCO[u.id] || (u.pai && BOL_TRONCO[u.pai])) return 'TE';
  if (u.pai && ITEMS[u.pai] && !ITEMS[u.pai].meshes.some(q => q.userData.id === u.pai)) return 'U' + u.pai + s;
  return 'M' + m.id;
}
function bolEntra(m) {
  const u = m.userData, id = u.id;
  if (!META[id] || BOL_FORA[id] || u.les !== undefined || u.corte || u.cortePed) return false;
  if (u.pai && BOL_TRONCO[u.pai]) return true;   // regiões da superfície do tronco: fazem parte do contorno do tronco
  if (u.fis || u.sulco && !/^s_/.test(id)) return false;
  if (m.geometry.type === 'CircleGeometry' || m.geometry.type === 'RingGeometry') return false;
  return true;
}

// ---- uma face: segmentos -> preenchimento -> substância cinzenta e branca
const BOL_IDS = [], BOL_IDX = {};
const bolCod = id => { if (BOL_IDX[id] === undefined) { BOL_IDX[id] = BOL_IDS.length; BOL_IDS.push(id); } return BOL_IDX[id]; };
bolCod('');   // 0 = vazio
// plano coronal padrão (as bolachas); outros planos (tronco) passam G
function bolPlanoCoronal(z) { return { O: [0, 0, z], n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], X0: BOL_X0, X1: BOL_X1, Y0: BOL_Y0, Y1: BOL_Y1, RES: BOL_RES }; }
function bolSecao(z, G) {
  G = G || bolPlanoCoronal(z);
  const O = G.O, N = G.n, U = G.u, V = G.v, Ox = O[0], Oy = O[1], Oz = O[2], nx = N[0], ny = N[1], nz = N[2];
  const grupos = new Map(), laminas = [];
  ALLMESH.forEach(m => {
    if (!bolEntra(m) || (G.filtro && !G.filtro(m))) return;
    const w = bolMundo(m); if (Math.abs((w.c[0] - Ox) * nx + (w.c[1] - Oy) * ny + (w.c[2] - Oz) * nz) > w.r) return;
    const P = w.P, I = m.geometry.index.array, own = bolCod(m.userData.id), seg = [];
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, za = (P[a] - Ox) * nx + (P[a + 1] - Oy) * ny + (P[a + 2] - Oz) * nz, zb = (P[b] - Ox) * nx + (P[b + 1] - Oy) * ny + (P[b + 2] - Oz) * nz, zc = (P[c] - Ox) * nx + (P[c + 1] - Oy) * ny + (P[c + 2] - Oz) * nz;
      if ((za > 0 && zb > 0 && zc > 0) || (za <= 0 && zb <= 0 && zc <= 0)) continue;
      const pts = [];
      const ed = (i, j, zi, zj) => { if ((zi > 0) !== (zj > 0)) { const f = zi / (zi - zj), qx = P[i] + (P[j] - P[i]) * f - Ox, qy = P[i + 1] + (P[j + 1] - P[i + 1]) * f - Oy, qz = P[i + 2] + (P[j + 2] - P[i + 2]) * f - Oz; pts.push(qx * U[0] + qy * U[1] + qz * U[2], qx * V[0] + qy * V[1] + qz * V[2]); } };
      ed(a, b, za, zb); ed(b, c, zb, zc); ed(c, a, zc, za);
      if (pts.length === 4) seg.push(pts[0], pts[1], pts[2], pts[3], own);
    }
    if (!seg.length) return;
    const lam = BOL_LAMINA[m.userData.id];
    if (lam !== undefined) { laminas.push({ seg, own, w: lam }); return; }
    const k = bolChave(m); let g = grupos.get(k); if (!g) { g = { k, seg: [], cortex: /^CX/.test(k) ? 1 : (/^CB/.test(k) ? 2 : 0), envelope: k === 'TE' || /^CB/.test(k) }; grupos.set(k, g); }
    for (let i = 0; i < seg.length; i++) g.seg.push(seg[i]);
  });
  const NX = Math.round((G.X1 - G.X0) / G.RES), NY = Math.round((G.Y1 - G.Y0) / G.RES), id = new Uint16Array(NX * NY), tipo = new Uint8Array(NX * NY);   // tipo: 1 cinzenta cerebral, 2 branca cerebral, 3 cinzenta cerebelar, 4 branca cerebelar
  const px = x => (x - G.X0) / G.RES, py = y => (G.Y1 - y) / G.RES;
  // preenche um grupo; devolve a área em pixels (para ordenar: grandes primeiro)
  // tronco: contorno desenhado, inundação por fora e o resto preenchido com a parte mais próxima (robusto a cortes de raspão e a metades abertas)
  function inunda(g) {
    const S = g.seg, borda = new Int32Array(NX * NY), fora = new Uint8Array(NX * NY);
    for (let i = 0; i < S.length; i += 5) { const x1 = px(S[i]), y1 = py(S[i + 1]), x2 = px(S[i + 2]), y2 = py(S[i + 3]), n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2)); for (let k = 0; k <= n; k++) { const cx = x1 + (x2 - x1) * k / n, cy = y1 + (y2 - y1) * k / n; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const c = Math.floor(cx) + dc, rr = Math.floor(cy) + dr; if (c >= 0 && rr >= 0 && c < NX && rr < NY) borda[rr * NX + c] = S[i + 4] + 1; } } }
    const fila = new Int32Array(NX * NY); let h = 0, t = 0;
    for (let c = 0; c < NX; c++) { [c, (NY - 1) * NX + c].forEach(k => { if (!borda[k] && !fora[k]) { fora[k] = 1; fila[t++] = k; } }); }
    for (let rr = 0; rr < NY; rr++) { [rr * NX, rr * NX + NX - 1].forEach(k => { if (!borda[k] && !fora[k]) { fora[k] = 1; fila[t++] = k; } }); }
    while (h < t) { const k = fila[h++], c = k % NX; const viz = [c > 0 ? k - 1 : -1, c < NX - 1 ? k + 1 : -1, k - NX, k + NX]; for (let j = 0; j < 4; j++) { const q = viz[j]; if (q >= 0 && q < NX * NY && !fora[q] && !borda[q]) { fora[q] = 1; fila[t++] = q; } } }
    // dono de cada pixel de dentro: a borda mais próxima (busca em largura a partir da borda)
    const dono = new Int32Array(NX * NY), dist = new Uint16Array(NX * NY); h = 0; t = 0;
    for (let k = 0; k < NX * NY; k++) if (borda[k]) { dono[k] = borda[k]; fila[t++] = k; }
    while (h < t) { const k = fila[h++], c = k % NX; const viz = [c > 0 ? k - 1 : -1, c < NX - 1 ? k + 1 : -1, k - NX, k + NX]; for (let j = 0; j < 4; j++) { const q = viz[j]; if (q >= 0 && q < NX * NY && !fora[q] && !dono[q]) { dono[q] = dono[k]; dist[q] = dist[k] + 1; fila[t++] = q; } } }
    const faixa = Math.max(2, Math.round(0.05 / G.RES)), paiDe = {};
    for (let k = 0; k < NX * NY; k++) { const o = dono[k]; if (!o || fora[k] || dist[k] <= faixa) continue; let p = paiDe[o]; if (p === undefined) { const nm = BOL_IDS[o - 1], it = ITEMS[nm], m = it && it.meshes.find(q => q.userData.id === nm), pai = m && m.userData.pai; p = paiDe[o] = pai && BOL_TRONCO[pai] ? bolCod(pai) + 1 : o; } dono[k] = p; }
    const out = []; let area = 0;
    for (let rr = 0; rr < NY; rr++) { let c = 0; while (c < NX) { const k = rr * NX + c; if (fora[k] || !dono[k]) { c++; continue; } const o = dono[k]; let c1 = c; while (c1 + 1 < NX && !fora[rr * NX + c1 + 1] && dono[rr * NX + c1 + 1] === o) c1++; out.push(rr, c, c1, o - 1); area += c1 - c + 1; c = c1 + 1; } }
    g.spans = out; g.area = area;
  }
  // fecha contornos abertos (a malha do tronco é aberta onde foi separada do diencéfalo): liga as pontas soltas de cada cadeia
  function fecha(S) {
    const q = v => Math.round(v * 2000), chave = (x, y) => q(x) + ',' + q(y), ends = new Map();
    const conta = k => ends.set(k, (ends.get(k) || 0) + 1);
    for (let i = 0; i < S.length; i += 5) { conta(chave(S[i], S[i + 1])); conta(chave(S[i + 2], S[i + 3])); }
    // pontas soltas: aparecem uma vez só; liga-as aos pares, cada uma à mais próxima ainda livre
    const soltas = []; const vistos = new Set();
    for (let i = 0; i < S.length; i += 5) [[S[i], S[i + 1]], [S[i + 2], S[i + 3]]].forEach(p => { const k = chave(p[0], p[1]); if (ends.get(k) === 1 && !vistos.has(k)) { vistos.add(k); soltas.push([p[0], p[1], S[i + 4]]); } });
    const usada = new Uint8Array(soltas.length);
    for (let a = 0; a < soltas.length; a++) { if (usada[a]) continue; let b = -1, bd = Infinity; for (let j = 0; j < soltas.length; j++) if (j !== a && !usada[j]) { const d = Math.hypot(soltas[j][0] - soltas[a][0], soltas[j][1] - soltas[a][1]); if (d < bd) { bd = d; b = j; } } if (b < 0) break; usada[a] = usada[b] = 1; S.push(soltas[a][0], soltas[a][1], soltas[b][0], soltas[b][1], soltas[a][2]); }
  }
  function spans(g) {
    if (g.envelope) { fecha(g.seg); return inunda(g); }   // tronco e cerebelo: contornos abertos e com muitos pedaços
    const S = g.seg, rows = new Map();
    for (let i = 0; i < S.length; i += 5) {
      const y1 = py(S[i + 1]), y2 = py(S[i + 3]); if (y1 === y2) continue;
      const r0 = Math.max(0, Math.ceil(Math.min(y1, y2) - 0.5)), r1 = Math.min(NY - 1, Math.ceil(Math.max(y1, y2) - 0.5) - 1);
      for (let r = r0; r <= r1; r++) { let L = rows.get(r); if (!L) { L = []; rows.set(r, L); } L.push(i); }
    }
    const out = []; let area = 0;
    rows.forEach((L, r) => {
      const yc = r + 0.5, xs = [];
      L.forEach(i => { const x1 = px(S[i]), y1 = py(S[i + 1]), x2 = px(S[i + 2]), y2 = py(S[i + 3]); xs.push([x1 + (yc - y1) * (x2 - x1) / (y2 - y1), S[i + 4]]); });
      xs.sort((p, q) => p[0] - q[0]);
      for (let j = 0; j + 1 < xs.length; j += 2) { const c0 = Math.max(0, Math.ceil(xs[j][0] - 0.5)), c1 = Math.min(NX - 1, Math.floor(xs[j + 1][0] - 0.5)); if (c1 >= c0) { out.push(r, c0, c1, xs[j][1]); area += c1 - c0 + 1; } }
    });
    g.spans = out; g.area = area;
  }
  const lista = [...grupos.values()]; lista.forEach(spans);
  lista.sort((p, q) => (q.cortex ? 1e12 : q.area) - (p.cortex ? 1e12 : p.area));   // córtex e cerebelo primeiro, depois do maior para o menor
  lista.forEach(g => { const O = g.spans; for (let i = 0; i < O.length; i += 4) { const base = O[i] * NX; for (let c = O[i + 1]; c <= O[i + 2]; c++) { id[base + c] = O[i + 3]; tipo[base + c] = g.cortex === 1 ? 2 : (g.cortex === 2 ? 4 : 0); } } });
  // faixa cinzenta: distância até a superfície (chanfro 3-4) e o rótulo da região mais próxima
  { const INF = 1e9, d = new Float32Array(NX * NY).fill(INF), lab = new Uint16Array(NX * NY);
    const semCortex = { [bolCod('cc_cut')]: 1, [bolCod('dien_wall')]: 1 };   // a parede medial cortada não tem córtex
    lista.forEach(g => { if (!g.cortex) return; const S = g.seg; for (let i = 0; i < S.length; i += 5) { if (semCortex[S[i + 4]]) continue; const x1 = px(S[i]), y1 = py(S[i + 1]), x2 = px(S[i + 2]), y2 = py(S[i + 3]), n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))); for (let k = 0; k <= n; k++) { const c = Math.floor(x1 + (x2 - x1) * k / n), r = Math.floor(y1 + (y2 - y1) * k / n); if (c >= 0 && c < NX && r >= 0 && r < NY) { d[r * NX + c] = 0; lab[r * NX + c] = S[i + 4]; } } } });
    for (let r = 0; r < NY; r++) for (let c = 0; c < NX; c++) { const k = r * NX + c; let v = d[k], l = lab[k];
      if (c > 0 && d[k - 1] + 3 < v) { v = d[k - 1] + 3; l = lab[k - 1]; } if (r > 0) { if (d[k - NX] + 3 < v) { v = d[k - NX] + 3; l = lab[k - NX]; } if (c > 0 && d[k - NX - 1] + 4 < v) { v = d[k - NX - 1] + 4; l = lab[k - NX - 1]; } if (c < NX - 1 && d[k - NX + 1] + 4 < v) { v = d[k - NX + 1] + 4; l = lab[k - NX + 1]; } } d[k] = v; lab[k] = l; }
    for (let r = NY - 1; r >= 0; r--) for (let c = NX - 1; c >= 0; c--) { const k = r * NX + c; let v = d[k], l = lab[k];
      if (c < NX - 1 && d[k + 1] + 3 < v) { v = d[k + 1] + 3; l = lab[k + 1]; } if (r < NY - 1) { if (d[k + NX] + 3 < v) { v = d[k + NX] + 3; l = lab[k + NX]; } if (c < NX - 1 && d[k + NX + 1] + 4 < v) { v = d[k + NX + 1] + 4; l = lab[k + NX + 1]; } if (c > 0 && d[k + NX - 1] + 4 < v) { v = d[k + NX - 1] + 4; l = lab[k + NX - 1]; } } d[k] = v; lab[k] = l; }
    const gC = BOL_CINZA / G.RES * 3, gB = BOL_CINZA_CB / G.RES * 3, cbm = bolCod('cbm'), cbb = bolCod('cb_cbm');
    for (let k = 0; k < id.length; k++) {
      if (tipo[k] === 2) { if (d[k] <= gC) { tipo[k] = 1; id[k] = lab[k]; } else id[k] = cbm; }
      else if (tipo[k] === 4) { if (d[k] <= gB) { tipo[k] = 3; id[k] = lab[k]; } else id[k] = cbb; }
    }
  }
  // lâminas: traços com espessura
  laminas.forEach(L => { const S = L.seg, rr = Math.max(1, L.w / G.RES / 2); for (let i = 0; i < S.length; i += 5) { const x1 = px(S[i]), y1 = py(S[i + 1]), x2 = px(S[i + 2]), y2 = py(S[i + 3]), n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))); for (let k = 0; k <= n; k++) { const cx = x1 + (x2 - x1) * k / n, cy = y1 + (y2 - y1) * k / n; for (let r = Math.floor(cy - rr); r <= cy + rr; r++) for (let c = Math.floor(cx - rr); c <= cx + rr; c++) if (c >= 0 && c < NX && r >= 0 && r < NY && (c - cx) * (c - cx) + (r - cy) * (r - cy) <= rr * rr) { id[r * NX + c] = L.own; tipo[r * NX + c] = 0; } } } });
  // estruturas presentes: área e ponto do rótulo (do lado esquerdo do paciente, x > 0, quando houver)
  const acc = {}, NOM = {}, nomes = (v, t) => { const k = v * 8 + t; return NOM[k] || (NOM[k] = bolPais(BOL_IDS[v]).concat(t === 1 ? ['cx_cinza'] : (t === 3 ? ['cerebelo'] : []))); };
  for (let r = 0; r < NY; r += 2) for (let c = 0; c < NX; c += 2) { const v = id[r * NX + c]; if (!v) continue; const L = nomes(v, tipo[r * NX + c]); for (let j = 0; j < L.length; j++) { const nm = L[j], a = acc[nm] || (acc[nm] = { n: 0, sx: 0, sy: 0, nl: 0, lx: 0, ly: 0, bd: Infinity, best: null }); a.n++; a.sx += c; a.sy += r; if (c > NX / 2) { a.nl++; a.lx += c; a.ly += r; } } }
  Object.keys(acc).forEach(nm => { const a = acc[nm], usa = a.nl >= 3; a.usa = usa; a.cx = usa ? a.lx / a.nl : a.sx / a.n; a.cy = usa ? a.ly / a.nl : a.sy / a.n; });
  // pixel da própria estrutura mais perto do centro (formas em C), numa passada só
  for (let r = 0; r < NY; r += 2) for (let c = 0; c < NX; c += 2) { const v = id[r * NX + c]; if (!v) continue; const L = nomes(v, tipo[r * NX + c]); for (let j = 0; j < L.length; j++) { const a = acc[L[j]]; if (a.usa && c <= NX / 2) continue; const dd = (c - a.cx) * (c - a.cx) + (r - a.cy) * (r - a.cy); if (dd < a.bd) { a.bd = dd; a.best = [c, r]; } } }
  const pres = {};
  Object.keys(acc).forEach(nm => { const a = acc[nm]; if (a.n >= 3) pres[nm] = { area: a.n * 4, p: a.best }; });
  return { z, id, tipo, pres, NX, NY, G };
}

// ---- pintura da face
const BOL_REAL = { cinza: '#7f6c62', branca: '#efe8dc', cinzaCb: '#7a675d', vent: '#3a3230', vaso: '#7b302b', nervo: '#e8decd', men: '#bdb3a6' };
function bolCorDe(id, tipo, paleta) {
  if (paleta === 'real') {
    if (tipo === 2 || tipo === 4) return BOL_REAL.branca;
    if (tipo === 1) return BOL_REAL.cinza; if (tipo === 3) return BOL_REAL.cinzaCb;
    const g = META[id] ? META[id].grp : '';
    if (g === 'vent' || /^(vlat|v3|v4|aqueduto)/.test(id)) return id === 'plexo' ? '#6d4140' : BOL_REAL.vent;
    if (g === 'art' || g === 'ven') return BOL_REAL.vaso;
    if (g === 'men') return BOL_REAL.men;
    if (g === 'nc' && !/^nu/.test(id) || g === 'vias' || BOL_BRANCAS.test(id)) return BOL_REAL.nervo;
    if (id === 'snegra') return '#4a3f3b'; if (id === 'rubro') return '#b58a86'; if (id === 'gpe' || id === 'gpi') return '#bfb0a2';
    return BOL_REAL.cinza;
  }
  if (tipo === 2) return '#f1ebe1'; if (tipo === 4) return '#efe4d2';
  return META[id] ? META[id].color : '#999999';
}
const BOL_CACHE = {};   // z -> { sec, canvas, tex }
function bolPintar(S, opts) {
  const NX = S.sec.NX, NY = S.sec.NY, cv = S.canvas || (S.canvas = document.createElement('canvas'));
  cv.width = NX; cv.height = NY; const ctx = cv.getContext('2d'), img = ctx.createImageData(NX, NY), D = img.data, id = S.sec.id, tipo = S.sec.tipo;
  const cache = {}, rgb = (v, t) => { const k = v * 8 + t; let c = cache[k]; if (!c) { tmpC.set(bolCorDe(BOL_IDS[v], t, opts.paleta)); c = cache[k] = [tmpC.r * 255, tmpC.g * 255, tmpC.b * 255]; } return c; };
  // destaque: o próprio item ou qualquer parte dele (lobo, cerebelo, córtex cinzento)
  const casa = (nm, v, t) => !!nm && (BOL_IDS[v] === nm || bolPais(BOL_IDS[v]).indexOf(nm) >= 0 || (nm === 'cx_cinza' && t === 1) || (nm === 'cerebelo' && t === 3));
  const MC = {}, marcado = (nm, v, t) => { if (!nm) return false; const k = nm + '|' + v + '|' + t; let r = MC[k]; if (r === undefined) r = MC[k] = casa(nm, v, t); return r; };
  for (let k = 0; k < id.length; k++) {
    const v = id[k]; if (!v) continue;
    const c = rgb(v, tipo[k]); let r = c[0], g = c[1], b = c[2];
    const borda = (k % NX > 0 && id[k - 1] !== v) || (k >= NX && id[k - NX] !== v);   // contorno entre estruturas
    if (borda) { r *= 0.62; g *= 0.62; b *= 0.62; }
    const eAlvo = marcado(opts.alvo, v, tipo[k]), eSel = !eAlvo && marcado(opts.sel, v, tipo[k]);
    if (eAlvo || eSel) { const t = eAlvo ? 0.55 : 0.4; r = r + (255 - r) * t; g = g + (230 - g) * t; b = b * (1 - t); }
    D[k * 4] = r; D[k * 4 + 1] = g; D[k * 4 + 2] = b; D[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  if (opts.numeros && opts.lista) {   // números do gabarito sobre a peça
    ctx.font = '600 ' + Math.round(NX / 62) + 'px "Source Sans 3", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const R = NX / 95, postos = [];
    opts.lista.forEach((nm, i) => { const p = S.sec.pres[nm]; if (!p || !p.p) return; const x0 = p.p[0], y0 = p.p[1]; let x = x0, y = y0;
      for (let t = 0; t < 8 && postos.some(q => Math.hypot(q[0] - x, q[1] - y) < R * 2.3); t++) { y = y0 + R * 2.4 * Math.ceil((t + 1) / 2) * (t % 2 ? -1 : 1); }
      postos.push([x, y]);
      if (y !== y0) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.lineWidth = R * 0.15; ctx.strokeStyle = 'rgba(8,14,18,.8)'; ctx.stroke(); ctx.beginPath(); ctx.arc(x0, y0, R * 0.25, 0, Math.PI * 2); ctx.fillStyle = 'rgba(8,14,18,.9)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fillStyle = nm === opts.sel ? '#ffd23f' : 'rgba(8,14,18,.86)'; ctx.fill(); ctx.lineWidth = R * 0.18; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.fillStyle = nm === opts.sel ? '#111' : '#fff'; ctx.fillText(String(i + 1), x, y + R * 0.06); });
  }
  if (!S.tex) { S.tex = new THREE.CanvasTexture(cv); S.tex.anisotropy = 4; S.tex.minFilter = THREE.LinearMipmapLinearFilter; if (renderer.outputEncoding) S.tex.encoding = renderer.outputEncoding; }
  S.tex.needsUpdate = true; marca();
}
function bolFace(z) { let S = BOL_CACHE[z]; if (!S) { const t0 = performance.now(); S = BOL_CACHE[z] = { sec: bolSecao(z) }; TEMPOS['face_' + z] = Math.round(performance.now() - t0); } return S; }

// ---- cena das bolachas: fatias separadas (cartões com as duas faces e a borda) e fatia em foco (malhas cortadas de verdade)
const bolGrp = new THREE.Group(); bolGrp.visible = false; scene.add(bolGrp);
const BOL_W2 = BOL_X1 - BOL_X0, BOL_H2 = BOL_Y1 - BOL_Y0, BOL_CX = (BOL_X0 + BOL_X1) / 2, BOL_CY = (BOL_Y0 + BOL_Y1) / 2;
function bolPlano(tex, verso) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(BOL_W2, BOL_H2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.FrontSide }));
  if (verso) { m.rotation.y = Math.PI; const t = tex.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; m.material.map = t; }
  return m;
}
// borda do cartão: quadrados em marcha sobre a máscara da face
function bolBorda(sec, esp) {
  const NX = BOL_NX, NY = BOL_NY, id = sec.id, P = 3, pos = [];
  const cheio = (c, r) => c >= 0 && r >= 0 && c < NX && r < NY && id[r * NX + c] > 0 ? 1 : 0;
  const X = c => BOL_X0 + c * BOL_RES - BOL_CX, Y = r => BOL_Y1 - r * BOL_RES - BOL_CY;
  for (let r = -P; r < NY; r += P) for (let c = -P; c < NX; c += P) {
    const a = cheio(c, r), b = cheio(c + P, r), d = cheio(c + P, r + P), e = cheio(c, r + P), k = a + b * 2 + d * 4 + e * 8; if (k === 0 || k === 15) continue;
    const T = [c + P / 2, r], R = [c + P, r + P / 2], B = [c + P / 2, r + P], L = [c, r + P / 2];
    const segs = { 1: [L, T], 2: [T, R], 3: [L, R], 4: [R, B], 5: [L, T, R, B], 6: [T, B], 7: [L, B], 8: [B, L], 9: [B, T], 10: [T, R, B, L], 11: [B, R], 12: [R, L], 13: [R, T], 14: [T, L] }[k];
    for (let s = 0; s < segs.length; s += 2) { const p = segs[s], q = segs[s + 1], x1 = X(p[0]), y1 = Y(p[1]), x2 = X(q[0]), y2 = Y(q[1]); pos.push(x1, y1, esp, x2, y2, esp, x2, y2, -esp, x1, y1, esp, x2, y2, -esp, x1, y1, -esp); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#cdb6a6', roughness: 0.8, side: THREE.DoubleSide }));
}
const bolCartoes = [];   // um por corte (1 a 12)
const bolFoco = { frente: null, tras: null };
const BOL_ESP = 0.09;
const bolMeio = n => n < 12 ? (BOL_Z[n - 1] + BOL_Z[n]) / 2 : (BOL_Z[11] + BOL_POLO[1]) / 2;
const bolFaces = n => ({ a: BOL_Z[n - 1], b: n < 12 ? BOL_Z[n] : null });
function bolMontarCartao(n) {
  if (bolCartoes[n]) return bolCartoes[n];
  const f = bolFaces(n), A = bolFace(f.a), B = f.b !== null ? bolFace(f.b) : null, opt = bolOpts(n);
  bolPintar(A, opt.a); if (B) bolPintar(B, opt.b);
  const g = new THREE.Group(); g.userData.n = n;
  const fa = bolPlano(A.tex, false); fa.position.set(BOL_CX, BOL_CY, BOL_ESP + 0.002); fa.userData = { bol: n, face: 'a' }; g.add(fa);
  const fb = bolPlano((B || A).tex, true); fb.position.set(BOL_CX, BOL_CY, -BOL_ESP - 0.002); fb.userData = { bol: n, face: B ? 'b' : 'a' };
  if (!B) { fb.material = new THREE.MeshBasicMaterial({ map: fb.material.map, transparent: true, alphaTest: 0.5, color: '#cdb6a6' }); }   // a última fatia só tem a face anterior
  g.add(fb);
  const bd = bolBorda(A.sec, BOL_ESP); bd.position.set(BOL_CX, BOL_CY, 0); bd.userData = { bol: n, face: 'borda' }; g.add(bd);
  bolGrp.add(g); bolCartoes[n] = g; return g;
}

// ---- estado e opções
state.bol = { on: false, n: 3, foco: false, face: 'a', paleta: 'atlas', numeros: true, abre: 0, quiz: null };
function bolLista(n, face) { const c = GAB[n - 1]; if (!c) return []; const f = bolFaces(n), z = face === 'b' ? f.b : f.a; if (z === null) return []; const S = BOL_CACHE[z]; const ids = (face === 'b' ? c.b : c.a).length ? (face === 'b' ? c.b : c.a) : []; return S ? ids.filter(id => S.sec.pres[id] && S.sec.pres[id].p) : ids; }
function bolOpts(n) {
  const B = state.bol, q = B.quiz;
  const o = face => ({ paleta: B.paleta, numeros: B.numeros && !q, lista: bolLista(n, face), sel: n === B.n ? state.sel : null, alvo: q && n === B.n && q.face === face ? q.alvo : undefined });
  return { a: o('a'), b: o('b') };
}
function bolRepintar(n) {
  const f = bolFaces(n), o = bolOpts(n);
  if (BOL_CACHE[f.a] && BOL_CACHE[f.a].tex) bolPintar(BOL_CACHE[f.a], o.a);
  if (f.b !== null && BOL_CACHE[f.b] && BOL_CACHE[f.b].tex) bolPintar(BOL_CACHE[f.b], o.b);
  // as texturas do verso são cópias: refaz a ligação
  const c = bolCartoes[n]; if (c) c.children.forEach(ch => { if (ch.material && ch.material.map && ch.rotation.y) { ch.material.map.image = ch.material.map.image; ch.material.map.needsUpdate = true; } });
  if (bolFoco.tras && bolFoco.tras.material.map) bolFoco.tras.material.map.needsUpdate = true;
  marca();
}
function bolRepintarTudo() { for (let n = 1; n <= 12; n++) if (bolCartoes[n]) bolRepintar(n); }

// fatiar aos poucos, sem travar a página
let bolFila = null;
function bolPreparar(fim) {
  const status = document.getElementById('bolStatus');
  if (bolFila) return; const todos = []; for (let n = 1; n <= 12; n++) todos.push(n);
  const ordem = [state.bol.n].concat(todos.filter(n => n !== state.bol.n));
  bolFila = ordem.slice();
  const passo = () => {
    if (!bolFila.length) { bolFila = null; if (status) status.textContent = ''; bolLayout(); if (fim) fim(); return; }
    const n = bolFila.shift(); bolMontarCartao(n); if (status) status.textContent = 'Fatiando… ' + (12 - bolFila.length) + '/12'; bolLayout(); marca();
    setTimeout(passo, 0);
  };
  passo();
}
function bolLayout() {
  const B = state.bol, G = 3.4 * B.abre;
  for (let n = 1; n <= 12; n++) { const c = bolCartoes[n]; if (!c) continue; c.visible = !B.foco; c.position.z = bolMeio(n) + (6.5 - n) * G; const bd = c.children.find(q => q.userData.face === 'borda'); if (bd) bd.material.color.set(n === B.n ? '#00a9b4' : '#cdb6a6'); }
  bolGrp.visible = B.on;
}
function bolAnimando() { return state.bol.on && Math.abs(state.bol.abre - (state.bol.foco ? 0 : 1)) > 0.002; }
function stepBol(dt) {
  const B = state.bol; if (!B.on) return;
  const alvo = B.foco ? 0 : 1; if (Math.abs(B.abre - alvo) > 0.002) { B.abre += (alvo - B.abre) * (1 - Math.pow(0.002, dt)); bolLayout(); }
}

// fatia em foco: as próprias malhas, cortadas pelos dois planos, com as faces calculadas por cima
const bolPlanos = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];
function bolMontarFoco() {
  const n = state.bol.n, f = bolFaces(n);
  [bolFoco.frente, bolFoco.tras].forEach(m => { if (m) { bolGrp.remove(m); } });
  bolFoco.frente = bolFoco.tras = null;
  if (!state.bol.foco) { renderer.clippingPlanes = []; return; }
  const zf = f.a, zt = f.b !== null ? f.b : BOL_POLO[1];
  bolPlanos[0].constant = zf; bolPlanos[1].constant = -zt; renderer.clippingPlanes = bolPlanos;
  const A = bolFace(f.a); if (!A.tex) bolPintar(A, bolOpts(n).a);
  bolFoco.frente = bolPlano(A.tex, false); bolFoco.frente.position.set(BOL_CX, BOL_CY, zf - 0.004); bolFoco.frente.userData = { bol: n, face: 'a', foco: 1 }; bolGrp.add(bolFoco.frente);
  if (f.b !== null) { const B = bolFace(f.b); if (!B.tex) bolPintar(B, bolOpts(n).b); bolFoco.tras = bolPlano(B.tex, true); bolFoco.tras.position.set(BOL_CX, BOL_CY, zt + 0.004); bolFoco.tras.userData = { bol: n, face: 'b', foco: 1 }; bolGrp.add(bolFoco.tras); }
}
const BOL_GRUPOS_FOCO = ['cortex', 'deep', 'limbic', 'dien', 'vent', 'stem'];
function bolCamera() {
  const B = state.bol;
  if (B.foco) { const f = bolFaces(B.n), zc = f.b !== null ? (f.a + f.b) / 2 : bolMeio(B.n); camGoal.target.set(0, 0.6, zc); camGoal.dist = 30; camGoal.theta = B.face === 'b' ? Math.PI - 0.35 : 0.35; camGoal.phi = Math.PI / 2 - 0.22; }
  else { camGoal.target.set(0, 0.3, 0); camGoal.dist = 74; camGoal.theta = B.face === 'b' ? Math.PI - 1.2 : 1.2; camGoal.phi = 1.25; }
}
function bolAplicar() {
  const B = state.bol;
  bolLayout(); bolMontarFoco();
  if (B.on) { Object.keys(grpObj).forEach(k => grpObj[k].visible = B.foco && !!state.groupOn[k]); }
  renderBolPainel(); marca();
}
// entra e sai do modo
function setBolachas(on) {
  const B = state.bol; if (!!on === B.on) return;
  B.on = !!on; B.quiz = null;
  document.getElementById('bolBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  document.getElementById('bolpainel').hidden = !on;
  if (on) {
    if (state.troncoIso) setTroncoIso(false);
    if (state.separado) setSeparado(false);
    if (state.inflada) setInflada(false);
    if (state.licao) { state.licao = null; }
    state.sel = null; state.hideL = state.hideR = false; syncHemiUI();
    document.getElementById('modoExplorar').setAttribute('aria-pressed', 'false');
    document.getElementById('grpVistas').hidden = true;
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = BOL_GRUPOS_FOCO.indexOf(k) >= 0); syncLayerUI();
    bolCamera(); bolAplicar(); bolPreparar(() => { bolAplicar(); renderInfo(); });
  } else {
    renderer.clippingPlanes = []; bolGrp.visible = false; B.foco = false; bolMontarFoco();
    document.getElementById('modoExplorar').setAttribute('aria-pressed', 'true'); document.getElementById('grpVistas').hidden = false;
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art')); syncLayerUI(); state.sel = null; setView('lateral');
  }
  applyVisibility(); applyAppearance(); renderInfo(); markList();
}
function bolIr(n, opt) {
  const B = state.bol; B.n = Math.max(1, Math.min(12, n)); if (B.n === 12 && B.face === 'b') B.face = 'a';
  B.quiz = null; state.sel = null; bolMontarCartao(B.n); bolRepintarTudo();
  if (opt && opt.foco !== undefined) B.foco = opt.foco;
  bolCamera(); bolAplicar(); applyAppearance(); renderInfo();
}

// ---- painel do modo
function renderBolPainel() {
  const B = state.bol, el = document.getElementById('bolpainel'); if (!el) return;
  const c = GAB[B.n - 1];
  el.querySelector('#bolN').textContent = 'Corte ' + B.n + ' de 12';
  el.querySelector('#bolNivel').textContent = c ? c.nivel : '';
  el.querySelector('#bolRange').value = B.n;
  el.querySelectorAll('[data-bv]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.bv === 'foco') === B.foco ? 'true' : 'false'));
  el.querySelectorAll('[data-bf]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.bf === B.face ? 'true' : 'false'); b.disabled = b.dataset.bf === 'b' && B.n === 12; });
  el.querySelectorAll('[data-bp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.bp === B.paleta ? 'true' : 'false'));
  el.querySelector('#bolNum').setAttribute('aria-pressed', B.numeros ? 'true' : 'false');
  el.querySelector('#bolUni').href = c ? c.url : '#';
  el.querySelector('#bolTeste').textContent = B.quiz ? 'Parar o teste' : 'Testar esta bolacha';
}
// lista numerada do gabarito no painel de informação (quando nada está selecionado)
function renderBolInfo() {
  const B = state.bol, c = GAB[B.n - 1], f = bolFaces(B.n), z = B.face === 'b' ? f.b : f.a, S = z !== null ? BOL_CACHE[z] : null;
  const ids = c ? (B.face === 'b' ? c.b : c.a) : [], nomeFace = B.face === 'b' ? 'face posterior (b)' : 'face anterior (a)';
  let h = '<p class="eyebrow">Bolachas · corte ' + B.n + ' · ' + nomeFace + '</p><h2>' + esc(c ? c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1) : '') + '</h2>';
  if (B.quiz) {
    const q = B.quiz;
    h += '<p><b>Teste:</b> que estrutura está destacada em amarelo na ' + nomeFace + '?</p><div class="bolopc">' + q.ops.map(o => '<button type="button" class="opt" data-bq="' + o + '">' + esc(bolNome(o)) + '</button>').join('') + '</div>';
    h += '<p class="muted">Acertos: ' + q.ok + ' de ' + q.feitas + (q.msg ? ' · ' + q.msg : '') + '</p>';
  } else if (!S) h += '<p class="muted">Calculando o corte…</p>';
  else {
    const lista = bolLista(B.n, B.face), fora = ids.filter(id => lista.indexOf(id) < 0);
    h += '<p class="muted">Os números da peça seguem o gabarito da Unicamp para esta face. Clique numa estrutura (na peça ou na lista) para ver a função, a irrigação e a clínica.</p><ol class="bollista">' + lista.map(id => '<li><button type="button" data-bid="' + id + '">' + esc(bolNome(id)) + '</button></li>').join('') + '</ol>';
    if (fora.length) h += '<p class="muted" style="font-size:12.5px">No gabarito, mas fora deste plano no modelo: ' + fora.map(bolNome).map(esc).join(', ') + '.</p>';
  }
  h += '<p class="muted" style="font-size:12.5px">Gabarito: <a href="' + (c ? c.url : '#') + '" target="_blank" rel="noopener">atlas de cortes coronais, Unicamp ↗</a> (a peça real fica no site deles).</p>';
  infoEl.innerHTML = h;
  infoEl.querySelectorAll('[data-bid]').forEach(b => b.addEventListener('click', () => { select(b.dataset.bid, { focus: false }); }));
  infoEl.querySelectorAll('[data-bq]').forEach(b => b.addEventListener('click', () => bolResponder(b.dataset.bq)));
}
// teste: uma estrutura acesa, quatro opções
function bolNovaPergunta() {
  const B = state.bol, q = B.quiz, lista = bolLista(B.n, B.face); if (lista.length < 2) { B.quiz = null; return; }
  const resto = lista.filter(x => x !== q.alvo), alvo = resto[Math.floor(Math.random() * resto.length)] || lista[0];
  const outras = lista.filter(x => x !== alvo).sort(() => Math.random() - 0.5).slice(0, 3);
  q.alvo = alvo; q.face = B.face; q.ops = outras.concat([alvo]).sort(() => Math.random() - 0.5);
  bolRepintar(B.n); renderInfo();
}
function bolResponder(o) {
  const q = state.bol.quiz; if (!q) return; q.feitas++;
  if (o === q.alvo) { q.ok++; q.msg = 'certo: ' + bolNome(q.alvo); } else q.msg = 'era ' + bolNome(q.alvo);
  bolNovaPergunta();
}
function bolTeste() {
  const B = state.bol;
  if (B.quiz) { B.quiz = null; bolRepintar(B.n); renderInfo(); renderBolPainel(); return; }
  state.sel = null; B.quiz = { ok: 0, feitas: 0, alvo: null, msg: '' }; bolNovaPergunta(); renderBolPainel();
}

// ---- clique e passagem do mouse sobre as faces
function bolRaio(e) {
  const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
  const alvos = []; bolGrp.traverse(o => { if (o.isMesh && o.visible && o.userData.bol && o.userData.face !== 'borda' && (!o.parent || o.parent.visible)) alvos.push(o); });
  const h = ray.intersectObjects(alvos, false)[0]; if (!h) return null;
  const u = h.object.userData, n = u.bol, f = bolFaces(n), z = u.face === 'b' ? f.b : f.a, S = BOL_CACHE[z]; if (!S || !h.uv) return { n, face: u.face };
  const uu = h.object.rotation.y ? 1 - h.uv.x : h.uv.x, c = Math.floor(uu * S.sec.NX), rr = Math.floor((1 - h.uv.y) * S.sec.NY);
  const v = c >= 0 && rr >= 0 && c < S.sec.NX && rr < S.sec.NY ? S.sec.id[rr * S.sec.NX + c] : 0;
  return { n, face: u.face, id: v ? BOL_IDS[v] : null, foco: !!u.foco };
}
const _pickOrig = pick;
pick = function (e) {
  const B = state.bol;
  if (!B.on) return _pickOrig(e);
  const h = bolRaio(e);
  if (!B.foco) { if (h) { B.face = h.face === 'b' ? 'b' : 'a'; bolIr(h.n, { foco: true }); } return; }
  if (h && h.id) { if (B.quiz) return; select(h.id, { focus: false }); return; }
  if (!h) return _pickOrig(e);
};
const _hoverOrig = hover;
hover = function (e) {
  if (!state.bol.on) return _hoverOrig(e);
  const h = bolRaio(e), r = stageEl.getBoundingClientRect();
  if (!h) { if (state.bol.foco) return _hoverOrig(e); tip.hidden = true; return; }
  tip.textContent = !state.bol.foco ? 'Corte ' + h.n + ' (clique para abrir)' : (state.bol.quiz ? '?' : (h.id ? bolNome(h.id) : ''));
  tip.hidden = !tip.textContent; tip.style.left = Math.min(r.width - 20, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px';
};
// visibilidade, aparência e painel de informação levam o modo em conta
const _visOrig = applyVisibility;
applyVisibility = function () { _visOrig(); if (state.bol && state.bol.on) Object.keys(grpObj).forEach(k => grpObj[k].visible = state.bol.foco && !!state.groupOn[k]); };
const _apOrig = applyAppearance;
applyAppearance = function () { _apOrig(); if (state.bol && state.bol.on && bolCartoes[state.bol.n] && !state.bol.quiz) { const s = state.bol._ultSel; if (s !== state.sel) { state.bol._ultSel = state.sel; bolRepintar(state.bol.n); } } };
const _infoOrig = renderInfo;
renderInfo = function () { if (state.bol && state.bol.on && (!state.sel || state.bol.quiz)) return renderBolInfo(); _infoOrig(); if (state.bol && state.bol.on && state.sel && infoEl) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = '← Lista do corte ' + state.bol.n; b.style.marginTop = '8px'; b.addEventListener('click', () => select(null)); infoEl.appendChild(b); } };

// ---- ligações do painel
(function () {
  const $b = s => document.querySelector(s);
  $b('#bolBtn').addEventListener('click', () => setBolachas(true));
  $b('#bolSair').addEventListener('click', () => setBolachas(false));
  $b('#bolAnt').addEventListener('click', () => bolIr(state.bol.n - 1));
  $b('#bolProx').addEventListener('click', () => bolIr(state.bol.n + 1));
  $b('#bolRange').addEventListener('input', e => bolIr(+e.target.value));
  document.querySelectorAll('[data-bv]').forEach(b => b.addEventListener('click', () => { state.bol.foco = b.dataset.bv === 'foco'; bolCamera(); bolAplicar(); }));
  document.querySelectorAll('[data-bf]').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; state.bol.face = b.dataset.bf; if (state.bol.quiz) bolNovaPergunta(); bolCamera(); bolAplicar(); renderInfo(); }));
  document.querySelectorAll('[data-bp]').forEach(b => b.addEventListener('click', () => { state.bol.paleta = b.dataset.bp; bolRepintarTudo(); renderBolPainel(); }));
  $b('#bolNum').addEventListener('click', () => { state.bol.numeros = !state.bol.numeros; bolRepintarTudo(); renderBolPainel(); });
  $b('#bolTeste').addEventListener('click', bolTeste);
  const pn = $b('#bolpainel'), mais = $b('#bolMais'), compacta = on => { pn.classList.toggle('compacto', on); mais.setAttribute('aria-expanded', on ? 'false' : 'true'); mais.textContent = on ? 'Opções ▸' : 'Opções ▾'; marca(); };
  mais.addEventListener('click', () => compacta(!pn.classList.contains('compacto')));
  if (window.matchMedia && matchMedia('(max-width: 600px)').matches) compacta(true);
})();

if (/debug/.test(location.hash)) window.bolDbg = { bolSecao, BOL_IDS, BOL_CACHE, bolEntra, bolChave, bolMundo };
