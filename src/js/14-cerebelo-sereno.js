/* ===== CEREBELO REAL: cerebmap20 (Sereno et al. 2020) =====
   Superfície do córtex cerebelar, vérmis: Sereno MI, Diedrichsen J, Tachrount M, Testa-Silva G, d'Arceuil H, De Zeeuw C.
   PNAS 2020;117:19538–19543 (cerebmap20). Utilizado com permissão do autor (comunicação pessoal, 17 nov. 2026).
   Processamento: scripts/process/sereno_cerebelo.py (escala real, registro ao cerebelo do atlas, níveis de detalhe) e
   scripts/process/comprimir.mjs (meshopt). Os arquivos ficam em models/ e são carregados só quando o modo é escolhido.
   Lobos e lóbulos: atlas SUIT (Diedrichsen et al. 2009, CC BY), registrado à malha do Sereno por
   scripts/process/suit_cerebelo.py; o índice do lóbulo vem no canal vermelho da cor de cada vértice (COLOR_0).
   Correspondência SUIT (Schmahmann/Larsell) -> nomes do Machado: tabela CBS_SUIT, a revisar (REVISAR.md).
   Nos lóbulos I-IV o SUIT não separa verme e hemisfério nem língula, central e cúlmen: ali entra a classificação
   do atlas (CB.classifica), autoria própria. */
M('cb_sereno', 'Córtex cerebelar (Sereno 2020)', 'stem', '#c9a26b', 'Superfície real do córtex cerebelar de um cerebelo humano examinado em ressonância de altíssima resolução, com as folhas. Desdobrado, o córtex cerebelar tem quase 80% da área do córtex cerebral (Sereno et al., 2020). Clique num ponto para ver o lóbulo.', 'Artérias cerebelares superior, inferior anterior e inferior posterior.', '');
REF(['cb_sereno'], 'Sereno MI et al., PNAS 2020;117:19538–19543 (cerebmap20), com permissão do autor. Lóbulos: atlas SUIT, Diedrichsen J et al., NeuroImage 2009 (CC BY); nomes: Machado, cap. 5, p. 47-49.');
NOTA('cb_sereno', 'Malha real (cerebmap20) registrada ao cerebelo do atlas por semelhança (rotação, translação e escala). Lóbulos do atlas probabilístico SUIT (20 cerebelos), levados à malha pelo voxel mais próximo: as bordas seguem a anatomia média, não exatamente as fissuras deste cerebelo.');
// SUIT (índice do atl-Anatom) -> [lóbulo do verme, lóbulo do hemisfério, lobo]. Pares: esquerdo, verme, direito.
const CBS_SUIT = {};
[[[1, 2], null, 'cb_asa', 'cb_ant'], [[3, 4], 'cb_culmen', 'cb_quadant', 'cb_ant'], [[5, 7], null, 'cb_quadpost', 'cb_post'], [[6], 'cb_declive', null, 'cb_post'],
 [[8, 10], null, 'cb_semisup', 'cb_post'], [[9], 'cb_folium', null, 'cb_post'], [[11, 13], null, 'cb_semiinf', 'cb_post'], [[12], 'cb_tuber', null, 'cb_post'],
 [[14, 16], null, 'cb_semiinf', 'cb_post'], [[15], 'cb_tuber', null, 'cb_post'], [[17, 19, 20, 22], null, 'cb_biventre', 'cb_post'], [[18, 21], 'cb_piramide', null, 'cb_post'],
 [[23, 25], null, 'cb_tonsila', 'cb_post'], [[24], 'cb_uvula', null, 'cb_post'], [[26, 28], null, 'cb_floculo', 'cb_fn'], [[27], 'cb_nodulo', null, 'cb_fn']]
  .forEach(([ix, ve, he, lobo]) => ix.forEach(i => CBS_SUIT[i] = { ve, he, lobo }));
const CBS_VERME_ANT = ['cb_lingula', 'cb_central', 'cb_culmen'], CBS_HEMI_ANT = ['cb_asa', 'cb_quadant'];
function cbsLobulo(suit, x, y, z) {
  const r = CB.classifica(x, y, z), t = CBS_SUIT[suit];
  if (!t) return r;                                                                     // sem rótulo: classificação do atlas
  const verme = CB_VERME_SET.has(r.L);   // faixa do verme: pela distância à linha média (CB.classifica); no SUIT o verme é estreito demais
  if (suit <= 4) {                                                                      // lobo anterior: o SUIT não separa verme e hemisfério
    if (verme) return { L: CBS_VERME_ANT.includes(r.L) ? r.L : (suit <= 2 ? 'cb_central' : 'cb_culmen'), lobo: 'cb_ant' };
    return { L: CBS_HEMI_ANT.includes(r.L) ? r.L : t.he, lobo: 'cb_ant' };
  }
  const L = t.ve || t.he;
  return { L: verme ? (CBS_HEMI_VERME[L] || L) : (CBS_VERME_HEMI[L] || L), lobo: t.lobo };
}
// cada lóbulo do hemisfério e o lóbulo do verme que fica na mesma faixa (Machado, fig. 5.6)
const CBS_HEMI_VERME = { cb_asa: 'cb_central', cb_quadant: 'cb_culmen', cb_quadpost: 'cb_declive', cb_semisup: 'cb_folium', cb_semiinf: 'cb_tuber', cb_biventre: 'cb_piramide', cb_tonsila: 'cb_uvula', cb_floculo: 'cb_nodulo' };
const CBS_VERME_HEMI = Object.fromEntries(Object.entries(CBS_HEMI_VERME).map(([h, v]) => [v, h]));
// cores do modo Lobos e lóbulos: uma família por lobo (anterior em amarelos e laranjas, posterior do vermelho ao azul,
// floculonodular em verdes); o verme no mesmo tom do lóbulo vizinho, mais claro, para se destacar como faixa
const CBS_LOBULO_COR = {
  cb_asa: '#e9b23c', cb_quadant: '#dd8a2e', cb_lingula: '#fff0a0', cb_central: '#ffd86b', cb_culmen: '#ffb45c',
  cb_quadpost: '#cf5548', cb_semisup: '#b14f93', cb_semiinf: '#7563c2', cb_biventre: '#3f84cc', cb_tonsila: '#2fa7b5',
  cb_declive: '#ff9b8f', cb_folium: '#f29ce0', cb_tuber: '#b8aaff', cb_piramide: '#94c6ff', cb_uvula: '#8ae6ec',
  cb_floculo: '#5aa84c', cb_nodulo: '#b4ec98' };
const CB_VERME_SET = new Set(['cb_lingula', 'cb_central', 'cb_culmen', 'cb_declive', 'cb_folium', 'cb_tuber', 'cb_piramide', 'cb_uvula', 'cb_nodulo']);
M('interposito', 'Núcleo interpósito', 'stem', '#6e8a3b', 'Zona intermédia do cerebelo, entre o denteado e o fastigial. Reúne o núcleo emboliforme (interpósito anterior) e os globosos (interpósito posterior), que o atlas SUIT não separa. Recebe da parte intermédia do córtex e projeta ao núcleo rubro.', 'Cerebelares.', '');
REF(['interposito'], 'Forma: atlas SUIT, Diedrichsen J et al., NeuroImage 2009 e 2011 (CC BY). Texto: Machado, cap. 22, p. 208-209.');
NOTA('interposito', 'Nos modos do cerebelo real, os núcleos vêm do atlas SUIT (compartimento mais provável em 23 pessoas): o emboliforme e os globosos aparecem juntos como interpósito. No modo Atlas continuam os esquemas do Mímir.');
const CBS = { modo: 'atlas', malhas: {}, carregando: null, nucleos: null };
const CBS_ARQ = { folhas: 'models/cerebelo_sereno_folhas.glb', estudo: 'models/cerebelo_sereno_estudo.glb' };
const CBS_LOBO_COR = { cb_ant: '#eba052', cb_post: '#c47a9c', cb_fn: '#6fb35f' };   // três tons bem distintos: os lobos se leem de longe; os lóbulos variam em volta deles
let cbsLoader = null;
const cbsNivel = modo => modo === 'estudo' ? 'estudo' : 'folhas';   // Folhas e Lobos usam a malha com as folhas; Estudo, a envoltória lisa
// GLB quantizado do gltfpack -> geometria em ponto flutuante já no espaço do atlas
function cbsGeo(malha) {
  const src = malha.geometry, pa = src.attributes.position, P = new Float32Array(pa.count * 3);
  for (let i = 0; i < pa.count; i++) { P[i * 3] = pa.getX(i); P[i * 3 + 1] = pa.getY(i); P[i * 3 + 2] = pa.getZ(i); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(src.index ? new THREE.BufferAttribute(Uint32Array.from(src.index.array), 1) : null);
  geo.applyMatrix4(malha.matrixWorld); geo.computeVertexNormals(); return geo;
}
// núcleos do SUIT: denteado, interpósito e fastigial, de cada lado (nome do nó -> item do atlas)
const CBS_NUC = { suit_denteado_e: ['denteado', 1], suit_denteado_d: ['denteado', -1], suit_interposito_e: ['interposito', 1], suit_interposito_d: ['interposito', -1], suit_fastigial_e: ['fastigial', 1], suit_fastigial_d: ['fastigial', -1] };
function cbsCarregarNucleos() {
  if (CBS.nucleos) return CBS.nucleos;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  CBS.nucleos = new Promise(ok => cbsLoader.load('models/cerebelo_suit_nucleos.glb', g => {
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => { const q = o.isMesh && (CBS_NUC[o.name] || CBS_NUC[o.parent && o.parent.name]); if (!q) return;
      const m = new THREE.Mesh(cbsGeo(o), stdMat(META[q[0]].color, { roughness: 0.55 })); m.userData.suit = true; register(q[0], m, q[1]); });
    ok(); applyVisibility(); applyAppearance();
  }, undefined, e => { console.warn('núcleos do SUIT', e); ok(); }));
  return CBS.nucleos;
}
function cbsCarregar(nivel) {
  if (CBS.malhas[nivel]) return Promise.resolve(CBS.malhas[nivel]);
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  return new Promise((ok, falha) => cbsLoader.load(CBS_ARQ[nivel], g => {
    let malha = null; g.scene.traverse(o => { if (o.isMesh && !malha) malha = o; });
    if (!malha) return falha(new Error('GLB sem malha'));
    g.scene.updateMatrixWorld(true);
    // o gltfpack quantiza as posições (inteiros de 16 bits com escala no nó): passa tudo para ponto flutuante antes de aplicar a matriz
    const src = malha.geometry, pa = src.attributes.position, geo = cbsGeo(malha);
    // índice do lóbulo SUIT no canal vermelho: em inteiros (uint8/uint16) o r128 devolve o valor cru; em float, de 0 a 1
    const ca = src.attributes.color, suit = new Uint8Array(pa.count), escala = ca && ca.array instanceof Float32Array ? 255 : (ca && ca.array instanceof Uint16Array ? 1 / 257 : 1);
    if (ca) for (let i = 0; i < pa.count; i++) suit[i] = Math.round(ca.getX(i) * escala);
    geo.userData.suit = suit;
    cbsCores(geo);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.82, metalness: 0 }));
    m.userData.cbsNivel = nivel; register('cb_sereno', m, 0); m.userData.base = META.cb_sereno.color;
    CBS.malhas[nivel] = m; ok(m);
  }, undefined, falha));
}
// cores por vértice: dois jogos, guardados para trocar de modo sem recalcular (cor única com sombra das folhas; lobos e lóbulos com as fissuras)
function cbsCores(geo) {
  const p = geo.attributes.position, n = p.count, idx = geo.index ? geo.index.array : null, k = new Int8Array(n), lob = new Array(n);
  const simples = new Float32Array(n * 3), lobos = new Float32Array(n * 3), c = new THREE.Color();
  const suit = geo.userData.suit;
  for (let i = 0; i < n; i++) lob[i] = cbsLobulo(suit ? suit[i] : 0, p.getX(i), p.getY(i), p.getZ(i));
  // bordas: entre lóbulos (clara) e entre lobos (escura): as fissuras prima e posterolateral
  const borda = new Uint8Array(n);
  if (idx) for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], d = idx[t + 2]; if (lob[a].L !== lob[b].L || lob[b].L !== lob[d].L) { const v = (lob[a].lobo !== lob[b].lobo || lob[b].lobo !== lob[d].lobo) ? 2 : 1; borda[a] = Math.max(borda[a], v); borda[b] = Math.max(borda[b], v); borda[d] = Math.max(borda[d], v); } }
  const base = new THREE.Color(META.cb_sereno.color);
  for (let i = 0; i < n; i++) {
    simples[i * 3] = base.r; simples[i * 3 + 1] = base.g; simples[i * 3 + 2] = base.b;
    const r = lob[i]; c.set(CBS_LOBULO_COR[r.L] || CBS_LOBO_COR[r.lobo] || '#c9a26b');
    if (borda[i] === 2) c.multiplyScalar(0.45);   // só as fissuras entre lobos (prima e posterolateral) ganham linha; entre lóbulos basta a troca de cor
    lobos[i * 3] = c.r; lobos[i * 3 + 1] = c.g; lobos[i * 3 + 2] = c.b;
  }
  geo.userData.cores = { simples, lobos }; geo.userData.lobulo = lob.map(q => q.L); geo.userData.lobo = lob.map(q => q.lobo);
  geo.setAttribute('color', new THREE.BufferAttribute(simples.slice(), 3));
}
// cores do modo, com o lóbulo ou o lobo selecionado aceso em amarelo
function cbsAplicarCores(m, lobos) {
  const g = m.geometry, cor = g.userData.cores, A = g.attributes.color.array, sel = state.sel; A.set(lobos ? cor.lobos : cor.simples);
  if (sel && (/^cb_/.test(sel) && sel !== 'cb_sereno')) { const L = g.userData.lobulo, Lo = g.userData.lobo;
    for (let i = 0; i < L.length; i++) if (L[i] === sel || Lo[i] === sel) { A[i * 3] = A[i * 3] * 0.45 + 0.55; A[i * 3 + 1] = A[i * 3 + 1] * 0.45 + 0.5; A[i * 3 + 2] *= 0.35; } }
  g.attributes.color.needsUpdate = true; m.userData.corSel = sel;
}
const _apCbs = applyAppearance;
applyAppearance = function () { _apCbs(); if (CBS.modo !== 'atlas') { const nivel = cbsNivel(CBS.modo), m = CBS.malhas[nivel]; if (m && m.userData.corSel !== state.sel) cbsAplicarCores(m, CBS.modo === 'lobos'); } };
function setCerebeloModo(modo) {
  CBS.modo = modo;
  document.querySelectorAll('[data-cbm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cbm === modo ? 'true' : 'false'));
  if (modo === 'atlas') { applyVisibility(); applyAppearance(); return; }
  const nivel = cbsNivel(modo), st = document.getElementById('cbsStatus');
  if (st) st.textContent = CBS.malhas[nivel] ? '' : 'Carregando o cerebelo real…';
  cbsCarregarNucleos();
  cbsCarregar(nivel).then(m => { if (st) st.textContent = ''; cbsAplicarCores(m, modo === 'lobos'); if (!state.groupOn.stem) { state.groupOn.stem = true; syncLayerUI(); } applyVisibility(); applyAppearance(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar ' + CBS_ARQ[nivel] + '.'; console.warn(e); CBS.modo = 'atlas'; setCerebeloModo('atlas'); });
}
// visibilidade: com o cerebelo real, o do atlas (lóbulos e fissuras) some; só o nível escolhido aparece
const _visCbs = applyVisibility;
applyVisibility = function () {
  _visCbs();
  const real = CBS.modo !== 'atlas', nivel = cbsNivel(CBS.modo);
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.id === 'cb_sereno') { m.visible = real && u.cbsNivel === nivel && m.visible; return; }
    if (u.suit) { m.visible = real && m.visible; return; }                                           // núcleos do SUIT só com o cerebelo real
    if (real && /^(denteado|emboliforme|globoso|fastigial)$/.test(u.id)) { m.visible = false; return; }  // e os esquemas saem
    if (real && (u.pai === 'cerebelo' || u.pai === 'vermis' || /^cb_|^f_(pre|pri|pos|hor)/.test(u.id))) m.visible = false;
  });
};
// clique no cerebelo real: o lóbulo do ponto
const _pickCbs = pick;
pick = function (e) {
  if (CBS.modo !== 'atlas' && !(state.quiz && !state.quiz.revealed) && !state.bisturi) {
    const h = rayAt(e);
    if (h && h.id === 'cb_sereno' && h.point) {   // lóbulo do vértice do triângulo atingido (o mesmo da cor)
      const hit = ray.intersectObject(h.mesh, false)[0], L = hit && hit.face ? h.mesh.geometry.userData.lobulo[hit.face.a] : null;
      select(L && META[L] ? L : 'cb_sereno', { focus: false }); return; }
  }
  return _pickCbs(e);
};
BOL_FORA.cb_sereno = 1;   // os cortes continuam calculados com o cerebelo do atlas (a malha real tem centenas de milhares de triângulos)
document.querySelectorAll('[data-cbm]').forEach(b => b.addEventListener('click', () => setCerebeloModo(b.dataset.cbm)));
