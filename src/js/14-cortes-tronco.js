/* ===== CORTES TRANSVERSAIS DO TRONCO E DA MEDULA (remodelagem 3, fase 4) =====
   Tronco: planos perpendiculares ao eixo do tronco do modelo, calculados com o mesmo motor das bolachas (bolSecao com plano G).
   Gabarito: Unicamp, série axial de cerebelo e tronco (figuras 1 a 21); níveis clássicos do Machado.
   Medula: o modelo 3D só tem um cilindro; os três cortes da medula são esquemas desenhados aqui (Machado, cap. 4; Notas, p. 18). */
const TC_GR = { stem: 1, nc: 1, vias: 1, vent: 1 };
const TC_NIVEIS = [
  { k: 'cs', nome: 'Mesencéfalo: colículo superior', f: 0.5, fonte: 'Machado', gab: ['colsup', 'aqueduto', 'rubro', 'snegra', 'pedunc', 'nu3', 'nc3', 'v_lm', 'flm', 'freticular', 'mesenc', 'cerebelo', 'vermis'] },
  { k: 'ci', nome: 'Mesencéfalo: colículo inferior', f: 2.6, fonte: 'Unicamp, figuras 1, 2, 9 e 10', gab: ['colinf', 'aqueduto', 'snegra', 'pedunc', 'fossaip', 'nu4', 'nc3', 'acp', 'mesenc', 'v_lm', 'flm', 'freticular', 'pcs', 'cerebelo', 'vermis'] },
  { k: 'ps', nome: 'Ponte: terço superior', f: 5.5, fonte: 'Unicamp, figuras 3, 11 e 12', gab: ['locus', 'pcs', 'veusup', 'baseponte', 'ponte', 'nupont', 'cb_lingula', 'nc5', 'basilar', 'v4', 'aqueduto', 'cerebelo', 'v_lm', 'flm'] },
  { k: 'pm', nome: 'Ponte: terço médio', f: 13, fonte: 'Unicamp, figuras 4, 5 e 13', gab: ['basilar', 'cb_cbm', 'cerebelo', 'denteado', 'vermis', 'pcm', 'baseponte', 'ponte', 'v4', 'cb_lingula', 'plexo', 'veusup', 'ctrap', 'v_lm', 'locus', 'nc5', 'numot5', 'nusp5', 'nupont', 'pcs'] },
  { k: 'pi', nome: 'Ponte: terço inferior (colículo facial)', f: 20.5, fonte: 'Unicamp, figuras 6, 14, 15 e 16', gab: ['colfac', 'denteado', 'v_cs', 'nupont', 'pcm', 'fossarom', 'ctrap', 'v_lm', 'nc6', 'nc7', 'nc8', 'nu6', 'nu7', 'nuvest', 'ponte', 'baseponte', 'flm'] },
  { k: 'ba', nome: 'Bulbo aberto (nível da oliva)', f: 25, fonte: 'Unicamp, figuras 7, 8, 17, 18 e 19', gab: ['vertebral', 'cerebelo', 'vermis', 'nuoliva', 'oliva', 'piramide', 'plexo', 'v4', 'cb_floculo', 'pci', 'nc9', 'nc12', 'nu12', 'freticular', 'v_lm', 'sulantlat', 'sulpostlat', 'fismedant', 'nusol', 'nudx', 'nuamb', 'nuvest', 'bulbo', 'flm'] },
  { k: 'bf', nome: 'Bulbo fechado (núcleos grácil e cuneiforme)', f: 28, fonte: 'Unicamp, figuras 20 e 21', gab: ['pci', 'v_lm', 'nc12', 'nucun', 'nugrac', 'nu12', 'nuoliva', 'piramide', 'obex', 'fgrac', 'fcun', 'tubgrac', 'tubcun', 'bulbo', 'nuesp5', 'nudx'] },
  { k: 'mc', nome: 'Medula: segmento cervical (intumescência)', medula: 'C' },
  { k: 'mt', nome: 'Medula: segmento torácico', medula: 'T' },
  { k: 'ml', nome: 'Medula: segmento lombar (intumescência)', medula: 'L' }
];
state.tc = { nivel: null };
const TC_CACHE = {};
const tcGrp = new THREE.Group(); tcGrp.visible = false; scene.add(tcGrp);
function tcPlano(N) {
  const e = eixoTronco(N.f), p = 0.9, O = [0, e.V[1] + e.dor[1] * p, e.V[2] + e.dor[2] * p];
  return { O, n: e.cr, u: [1, 0, 0], v: e.dor, X0: -6.5, X1: 6.5, Y0: -1.6, Y1: 6.2, RES: BOL_TOQUE ? 0.02 : 0.014, filtro: m => TC_GR[META[m.userData.id].grp] };
}

// ---- medula: esquema desenhado (estrutura do mesmo formato das faces calculadas, para reaproveitar pintura, clique e teste)
const ME_IDS = [
  ['me_fma', 'Fissura mediana anterior', '#2b2b33', 'Sulco profundo na face anterior da medula; nela penetram ramos da artéria espinal anterior.'],
  ['me_canal', 'Canal central da medula', '#3c6fb4', 'Resto do lúmen do tubo neural, no centro da comissura cinzenta; continua-se com o IV ventrículo.'],
  ['me_cant', 'Coluna (corno) anterior', '#c97b5b', 'Substância cinzenta ventral: neurônios motores (alfa e gama) cujos axônios saem pela raiz anterior para os músculos esqueléticos. Mais volumosa nas intumescências cervical e lombar.'],
  ['me_cpost', 'Coluna (corno) posterior', '#d8a27c', 'Substância cinzenta dorsal: recebe as fibras da raiz posterior; neurônios das vias de dor, temperatura e tato.'],
  ['me_clat', 'Coluna (corno) lateral', '#e3b98a', 'Pequena projeção lateral da substância cinzenta, só de T1 a L2: neurônios pré-ganglionares simpáticos.'],
  ['me_zint', 'Substância cinzenta intermédia e comissura cinzenta', '#d9ab8a', 'Faixa central da substância cinzenta, em volta do canal central, que une os dois lados.'],
  ['me_fant', 'Funículo anterior', '#efe7da', 'Substância branca entre a fissura mediana anterior e o sulco lateral anterior (saída das raízes anteriores).'],
  ['me_flat', 'Funículo lateral', '#ece3d3', 'Substância branca entre os sulcos lateral anterior e lateral posterior.'],
  ['me_fpost', 'Funículo posterior', '#f1eadf', 'Substância branca entre o sulco mediano posterior e o sulco lateral posterior (entrada das raízes posteriores).'],
  ['me_fgr', 'Fascículo grácil', '#7aa6e6', 'Parte medial do funículo posterior. Tato epicrítico, propriocepção consciente e vibração da metade inferior do corpo (membros inferiores).'],
  ['me_fcu', 'Fascículo cuneiforme', '#5f90d8', 'Parte lateral do funículo posterior, só acima de T6. As mesmas modalidades do grácil, da metade superior do corpo (membros superiores).'],
  ['me_csl', 'Trato corticospinal lateral', '#d23c3c', 'Na parte posterior do funículo lateral. Fibras motoras que cruzaram na decussação das pirâmides; motricidade voluntária do mesmo lado do corpo.'],
  ['me_csa', 'Trato corticospinal anterior', '#e06464', 'Junto da fissura mediana anterior; fibras que não cruzaram no bulbo (cruzam no nível do segmento). Só nos segmentos cervicais e torácicos altos.'],
  ['me_stl', 'Trato espinotalâmico lateral', '#2fa37a', 'Na parte anterior do funículo lateral. Dor e temperatura do lado oposto do corpo.'],
  ['me_sta', 'Trato espinotalâmico anterior', '#5cbf95', 'No funículo anterior. Tato protopático e pressão do lado oposto.'],
  ['me_ecp', 'Trato espinocerebelar posterior', '#b8742a', 'Na periferia posterior do funículo lateral. Propriocepção inconsciente do mesmo lado para o cerebelo.'],
  ['me_eca', 'Trato espinocerebelar anterior', '#d39a52', 'Na periferia anterior do funículo lateral. Propriocepção inconsciente para o cerebelo.'],
  ['me_comb', 'Comissura branca', '#f6f1e8', 'Fibras que cruzam a linha média à frente da comissura cinzenta (entre elas as do espinotalâmico).']
];
ME_IDS.forEach(q => { M(q[0], q[1], 'stem', q[2], q[3], 'Artérias espinais anterior e posteriores.', ''); });
REF(ME_IDS.map(q => q[0]), 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 4 (medula, anatomia) e cap. 13 (estrutura da medula); Notas do Gustavo, p. 18.');
CONF(ME_IDS.map(q => q[0]), 'Esquema idealizado: forma e tamanho aproximados de cada segmento. Páginas do Machado a confirmar.');
function tcMedula(seg) {
  const RES = 0.004, X0 = -1.2, X1 = 1.2, Y0 = -1.0, Y1 = 1.0, NX = Math.round((X1 - X0) / RES), NY = Math.round((Y1 - Y0) / RES);
  const id = new Uint16Array(NX * NY), tipo = new Uint8Array(NX * NY);
  const P = { C: { rx: 1.0, ry: 0.68, ant: [0.21, 0.15], post: [0.055, 0.27], lat: false, cun: true, csa: true },
              T: { rx: 0.72, ry: 0.62, ant: [0.1, 0.085], post: [0.04, 0.23], lat: true, cun: true, csa: true },
              L: { rx: 0.86, ry: 0.78, ant: [0.2, 0.18], post: [0.085, 0.26], lat: false, cun: false, csa: false } }[seg];
  const el = (x, y, cx, cy, rx, ry, a) => { const c = Math.cos(a || 0), s = Math.sin(a || 0), dx = x - cx, dy = y - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry; return u * u + v * v <= 1; };
  const C = n => bolCod(n);
  for (let r = 0; r < NY; r++) for (let c = 0; c < NX; c++) {
    const x = X0 + (c + 0.5) * RES, y = Y1 - (r + 0.5) * RES, ax = Math.abs(x), k = r * NX + c;   // y > 0 = posterior (dorsal para cima, como no Machado)
    if (!el(x, y, 0, 0, P.rx, P.ry)) continue;
    let n;
    // substância branca: funículos por setores em volta do centro (ângulo a partir do plano frontal, positivo = posterior)
    const th = Math.atan2(y / P.ry, ax / P.rx) * 180 / Math.PI, rr = Math.hypot(x / P.rx, y / P.ry);
    if (th > 62) n = (P.cun && th < 77) ? 'me_fcu' : 'me_fgr';                  // funículo posterior: grácil medial, cuneiforme lateral
    else if (th < -48) n = (P.csa && th < -76 && rr > 0.55) ? 'me_csa' : (th > -72 && rr > 0.5 ? 'me_sta' : 'me_fant');   // funículo anterior
    else {                                                                         // funículo lateral
      n = 'me_flat';
      if (rr > 0.84) n = th > 8 ? 'me_ecp' : 'me_eca';                             // espinocerebelares na periferia
      else if (rr > 0.48 && th > 10 && th < 55) n = 'me_csl';                      // corticospinal lateral
      else if (rr > 0.48 && th < 2 && th > -42) n = 'me_stl';                      // espinotalâmico lateral
    }
    // substância cinzenta em H: cornos anteriores largos, posteriores finos e inclinados para fora
    const ant = el(ax, y, P.rx * 0.27, -P.ry * 0.34, P.ant[0], P.ant[1], 0.25);
    const post = el(ax, y, P.rx * 0.17, P.ry * 0.42, P.post[0], P.post[1], -0.38) && y > -P.ry * 0.02;
    const inter = ax < P.rx * 0.3 && Math.abs(y + P.ry * 0.03) < P.ry * 0.13, lat = P.lat && el(ax, y, P.rx * 0.36, -P.ry * 0.03, 0.09, 0.06, 0);
    if (ant) n = 'me_cant'; else if (post) n = 'me_cpost'; else if (lat) n = 'me_clat'; else if (inter) n = 'me_zint';
    if (ax < P.rx * 0.16 && y < -P.ry * 0.17 && y > -P.ry * 0.27) n = 'me_comb';
    if (Math.hypot(x, y + P.ry * 0.02) < 0.035) n = 'me_canal';
    if (ax < 0.03 && y < -P.ry * 0.55) n = 'me_fma';
    id[k] = C(n); tipo[k] = 0;
  }
  const acc = {};
  for (let r = 0; r < NY; r += 2) for (let c = 0; c < NX; c += 2) { const v = id[r * NX + c]; if (!v) continue; const nm = BOL_IDS[v], a = acc[nm] || (acc[nm] = { n: 0, sx: 0, sy: 0, best: null, bd: Infinity }); if (c >= NX / 2) { a.n++; a.sx += c; a.sy += r; } }
  Object.keys(acc).forEach(nm => { const a = acc[nm]; a.cx = a.sx / Math.max(1, a.n); a.cy = a.sy / Math.max(1, a.n); });
  for (let r = 0; r < NY; r += 2) for (let c = Math.ceil(NX / 2); c < NX; c += 2) { const v = id[r * NX + c]; if (!v) continue; const a = acc[BOL_IDS[v]]; const d = (c - a.cx) ** 2 + (r - a.cy) ** 2; if (d < a.bd) { a.bd = d; a.best = [c, r]; } }
  const pres = {}; Object.keys(acc).forEach(nm => { if (acc[nm].best) pres[nm] = { area: acc[nm].n * 4, p: acc[nm].best }; });
  if (!pres.me_canal) pres.me_canal = { area: 1, p: [Math.round(NX / 2), Math.round(NY / 2)] };
  return { z: 0, id, tipo, pres, NX, NY, G: { X0, X1, Y0, Y1, RES } };
}
const ME_GAB = { C: ['me_fma', 'me_canal', 'me_cant', 'me_cpost', 'me_zint', 'me_comb', 'me_fant', 'me_flat', 'me_fpost', 'me_fgr', 'me_fcu', 'me_csl', 'me_csa', 'me_stl', 'me_sta', 'me_ecp', 'me_eca'],
  T: ['me_fma', 'me_canal', 'me_cant', 'me_cpost', 'me_clat', 'me_zint', 'me_comb', 'me_fant', 'me_flat', 'me_fpost', 'me_fgr', 'me_fcu', 'me_csl', 'me_csa', 'me_stl', 'me_sta', 'me_ecp', 'me_eca'],
  L: ['me_fma', 'me_canal', 'me_cant', 'me_cpost', 'me_zint', 'me_comb', 'me_fant', 'me_flat', 'me_fpost', 'me_fgr', 'me_csl', 'me_stl', 'me_sta', 'me_ecp', 'me_eca'] };

// ---- face de um nível (calculada uma vez)
function tcFace(N) {
  let S = TC_CACHE[N.k]; if (S) return S;
  S = TC_CACHE[N.k] = { sec: N.medula ? tcMedula(N.medula) : bolSecao(0, tcPlano(N)) };
  return S;
}
function tcLista(N) { const S = tcFace(N), g = N.medula ? ME_GAB[N.medula] : N.gab.filter(id => META[id]); return g.filter(id => S.sec.pres[id] && S.sec.pres[id].p); }
function tcPintar(N) { const S = tcFace(N); bolPintar(S, { paleta: state.bol.paleta, numeros: state.bol.numeros && !state.tc.quiz, lista: tcLista(N), sel: state.sel, alvo: state.tc.quiz ? state.tc.quiz.alvo : undefined }); return S; }

// ---- 3D: o tronco cortado no plano, com a face calculada por cima; a parte cranial ao plano é escondida
let tcCap = null; const tcClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
function tcMontar3D() {
  if (tcCap) { tcGrp.remove(tcCap); tcCap = null; }
  const N = TC_NIVEIS.find(q => q.k === state.tc.nivel);
  if (!N || N.medula) { if (!state.bol.on) renderer.clippingPlanes = []; tcGrp.visible = false; return; }
  const G = tcPlano(N), S = tcPintar(N), n = new THREE.Vector3().fromArray(G.n), u = new THREE.Vector3().fromArray(G.u), v = new THREE.Vector3().fromArray(G.v), O = new THREE.Vector3().fromArray(G.O);
  tcClip.normal.copy(n).multiplyScalar(-1); tcClip.constant = n.dot(O); renderer.clippingPlanes = [tcClip];
  tcCap = new THREE.Mesh(new THREE.PlaneGeometry(G.X1 - G.X0, G.Y1 - G.Y0), new THREE.MeshBasicMaterial({ map: S.tex, transparent: true, alphaTest: 0.5 }));
  const m4 = new THREE.Matrix4().makeBasis(u, v, n); tcCap.quaternion.setFromRotationMatrix(m4);
  tcCap.position.copy(O).addScaledVector(u, (G.X0 + G.X1) / 2).addScaledVector(v, (G.Y0 + G.Y1) / 2).addScaledVector(n, -0.004);
  tcCap.userData = { tc: N.k }; tcGrp.add(tcCap); tcGrp.visible = true;
  // câmera: de cima e de trás do plano, olhando para a face
  const d = n.clone().multiplyScalar(0.86).addScaledVector(v, -0.5).normalize();   // do lado ventral: o dorsal fica para cima na tela
  const dir = new THREE.Vector3(0, 1, 0).cross(d).normalize();   // direita da tela: o corte fica à esquerda, livre do esquema 2D
  camGoal.target.copy(O).addScaledVector(v, 0.9).addScaledVector(dir, 2.4); camGoal.dist = 16; camGoal.phi = Math.acos(Math.max(-1, Math.min(1, d.y))); camGoal.theta = Math.atan2(d.x, d.z);
}
// ---- painel 2D (esquema) ao lado e lista no painel de informação
function tcRender2D() {
  const el = document.getElementById('tc2d'), N = TC_NIVEIS.find(q => q.k === state.tc.nivel);
  if (!el) return; el.hidden = !N; if (!N) return;
  const S = tcPintar(N), box = el.querySelector('.tcimg'), sec = S.sec;
  if (!S.caixa) { const hc = new Float64Array(sec.NX), hr = new Float64Array(sec.NY); let tot = 0; for (let r = 0; r < sec.NY; r += 2) for (let c = 0; c < sec.NX; c += 2) if (sec.id[r * sec.NX + c]) { hc[c]++; hr[r]++; tot++; }
    const corta = (H, q) => { let a = 0, s0 = 0; while (a < H.length - 1 && s0 + H[a] < tot * q) s0 += H[a++]; let b = H.length - 1, s1 = 0; while (b > 0 && s1 + H[b] < tot * q) s1 += H[b--]; return [a, b]; };   // ignora pontas soltas (raízes nervosas distantes)
    let [c0, c1] = corta(hc, 0.004), [r0, r1] = corta(hr, 0.004);
    const mg = Math.round(sec.NX * 0.02); c0 = Math.max(0, c0 - mg); r0 = Math.max(0, r0 - mg); c1 = Math.min(sec.NX - 1, c1 + mg); r1 = Math.min(sec.NY - 1, r1 + mg);
    const w = c1 - c0 + 1, h = r1 - r0 + 1, lado = Math.max(w, h); S.caixa = { c0: c0 - Math.floor((lado - w) / 2), r0: r0 - Math.floor((lado - h) / 2), w: lado, h: lado }; S.vis = document.createElement('canvas'); }
  const cx = S.caixa, vis = S.vis; vis.width = Math.min(900, cx.w); vis.height = Math.round(vis.width * cx.h / cx.w); vis.getContext('2d').drawImage(S.canvas, cx.c0, cx.r0, cx.w, cx.h, 0, 0, vis.width, vis.height);
  if (vis.parentNode !== box) { box.innerHTML = ''; box.appendChild(vis); }
  el.querySelector('.tct').textContent = N.nome;
  el.querySelector('.tcs').textContent = N.medula ? 'Esquema idealizado (Machado; Notas, p. 18). Posterior em cima.' : 'Corte calculado no modelo, perpendicular ao eixo do tronco. Dorsal em cima.';
}
function tcPicar(ev) {
  const N = TC_NIVEIS.find(q => q.k === state.tc.nivel); if (!N) return null;
  const S = tcFace(N); if (!S.vis || !S.caixa) return null; const r = S.vis.getBoundingClientRect(), c = Math.floor(S.caixa.c0 + (ev.clientX - r.left) / r.width * S.caixa.w), rr = Math.floor(S.caixa.r0 + (ev.clientY - r.top) / r.height * S.caixa.h);
  if (c < 0 || rr < 0 || c >= S.sec.NX || rr >= S.sec.NY) return null; const v = S.sec.id[rr * S.sec.NX + c]; return v ? BOL_IDS[v] : null;
}
function renderTcInfo() {
  const N = TC_NIVEIS.find(q => q.k === state.tc.nivel), lista = tcLista(N), q = state.tc.quiz;
  let h = '<p class="eyebrow">Tronco e medula · corte transversal</p><h2>' + esc(N.nome) + '</h2>';
  if (q) {
    h += '<p><b>Teste:</b> que estrutura está destacada em amarelo no corte?</p><div class="bolopc">' + q.ops.map(o => '<button type="button" class="opt" data-tq="' + o + '">' + esc(bolNome(o)) + '</button>').join('') + '</div><p class="muted">Acertos: ' + q.ok + ' de ' + q.feitas + (q.msg ? ' · ' + q.msg : '') + '</p>';
  } else {
    h += '<p class="muted">Os números do corte seguem ' + (N.medula ? 'o esquema clássico da medula' : 'o gabarito (' + esc(N.fonte) + ')') + '. Clique numa estrutura, no desenho ou na lista.</p><ol class="bollista">' + lista.map(id => '<li><button type="button" data-tid="' + id + '">' + esc(bolNome(id)) + '</button></li>').join('') + '</ol>';
    if (!N.medula) { const fora = N.gab.filter(id => META[id] && lista.indexOf(id) < 0); if (fora.length) h += '<p class="muted" style="font-size:12.5px">No gabarito, mas fora deste plano no modelo: ' + fora.map(bolNome).map(esc).join(', ') + '.</p>'; }
    h += '<div class="btnrow"><button class="btn" type="button" id="tcTeste">Testar este corte</button></div>';
  }
  if (!N.medula) h += '<p class="muted" style="font-size:12.5px">Peças reais: <a href="https://anatpat.unicamp.br/bineucerebelotronco.html" target="_blank" rel="noopener">série axial de cerebelo e tronco, Unicamp ↗</a></p>';
  infoEl.innerHTML = h;
  infoEl.querySelectorAll('[data-tid]').forEach(b => b.addEventListener('click', () => select(b.dataset.tid, { focus: false })));
  infoEl.querySelectorAll('[data-tq]').forEach(b => b.addEventListener('click', () => tcResponder(b.dataset.tq)));
  const t = infoEl.querySelector('#tcTeste'); if (t) t.addEventListener('click', () => { state.tc.quiz = { ok: 0, feitas: 0, alvo: null }; tcPergunta(); });
}
function tcPergunta() { const N = TC_NIVEIS.find(q => q.k === state.tc.nivel), L = tcLista(N), q = state.tc.quiz; if (L.length < 2) { state.tc.quiz = null; return; } const resto = L.filter(x => x !== q.alvo), a = resto[Math.floor(Math.random() * resto.length)]; q.alvo = a; q.ops = L.filter(x => x !== a).sort(() => Math.random() - 0.5).slice(0, 3).concat([a]).sort(() => Math.random() - 0.5); tcAtualizar(); }
function tcResponder(o) { const q = state.tc.quiz; if (!q) return; q.feitas++; if (o === q.alvo) { q.ok++; q.msg = 'certo: ' + bolNome(q.alvo); } else q.msg = 'era ' + bolNome(q.alvo); tcPergunta(); }
function tcAtualizar() { const N = TC_NIVEIS.find(q => q.k === state.tc.nivel); if (N) { tcPintar(N); tcRender2D(); } renderInfo(); marca(); }
function setCorteTronco(k) {
  state.tc.nivel = k || null; state.tc.quiz = null; state.sel = null;
  document.querySelectorAll('[data-tc]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.tc || null) === (k || '') || (!k && b.dataset.tc === '') ? 'true' : 'false'));
  tcMontar3D(); tcRender2D(); applyVisibility(); applyAppearance(); renderInfo();
  if (!k && state.troncoIso) vistaTronco('ventral');
  const N = TC_NIVEIS.find(q => q.k === k); if (N && N.medula) { camGoal.target.set(0, -6.2, -3.6); camGoal.dist = 16; }
}
// ---- ligações com o resto do atlas
const _visTc = applyVisibility;
applyVisibility = function () {
  _visTc();
  if (state.tc && state.tc.nivel && state.troncoIso) ALLMESH.forEach(m => { const id = m.userData.id; if ((/^nu/.test(id) || m.userData.intra || id === 'freticular' || id === 'flm' || id === 'ctrap') && grpObj[META[id].grp] && grpObj[META[id].grp].visible) m.visible = !((m.userData.side === 1 && state.hideL) || (m.userData.side === -1 && state.hideR)); });
};
const _apTc = applyAppearance;
applyAppearance = function () { _apTc(); if (state.tc && state.tc.nivel) { const s = state.tc._ultSel; if (s !== state.sel) { state.tc._ultSel = state.sel; tcAtualizar(); } } };
const _infoTc = renderInfo;
renderInfo = function () { if (state.tc && state.tc.nivel && (!state.sel || state.tc.quiz) && infoEl) return renderTcInfo(); _infoTc(); };
const _setTI = setTroncoIso;
setTroncoIso = function (on) { if (!on && state.tc.nivel) { state.tc.nivel = null; tcMontar3D(); tcRender2D(); } _setTI(on); };
const _pickTc = pick;
pick = function (e) {
  if (state.tc.nivel && tcCap) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObject(tcCap, false)[0];
    if (h && h.uv) { const S = tcFace(TC_NIVEIS.find(q => q.k === state.tc.nivel)), c = Math.floor(h.uv.x * S.sec.NX), rr = Math.floor((1 - h.uv.y) * S.sec.NY), v = S.sec.id[rr * S.sec.NX + c]; if (v) { if (!state.tc.quiz) select(BOL_IDS[v], { focus: false }); return; } } }
  return _pickTc(e);
};
(function () {
  const el = document.getElementById('tc2d'); if (!el) return;
  el.addEventListener('click', ev => { if (state.tc.quiz) return; const id = tcPicar(ev); if (id) select(id, { focus: false }); });
  el.addEventListener('mousemove', ev => { const id = tcPicar(ev), t = el.querySelector('.tcdica'); t.textContent = id && !state.tc.quiz ? bolNome(id) : ''; });
  document.querySelectorAll('[data-tc]').forEach(b => b.addEventListener('click', () => setCorteTronco(b.dataset.tc)));
})();
