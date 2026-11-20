/* ===== ESTADO / APARÊNCIA ===== */
const REGIONS = Object.keys(ITEMS).filter(id => ITEMS[id].meshes.some(m => m.userData.cortex));   // regiões com malha cortical
// regiões que só se veem pela face medial, pela face inferior, ou que ficam escondidas no sulco lateral
const MEDIAIS = ['gcing', 'gfsm', 'gpara', 'gprec', 'gcun', 'gling', 'gcalc', 'greto', 'gparahip', 'cc_cut', 'dien_wall'];
const INFERIORES = ['gfus', 'gor'];
const OCULTAS = ['ginsula', 'gtt'];

function selId(id) { return REGION_ALIAS[id] || id; }
const BASE_FICA = { a_espost: 1, a_hipof: 1, centrais_am: 1, sesfpar: 1, plexbas: 1, v_comunpost: 1, v_pontomes: 1, v_amponte: 1, v_alponte: 1, v_ambulbo: 1, v_recesso: 1, v_cerant: 1, v_profmed: 1, aci: 1, acm: 1, aca1: 1, acomA: 1, pcom: 1, acp1: 1, acp: 1, basilar: 1, vertebral: 1, pica: 1, aica: 1, sca: 1, a_oft: 1, coroant: 1, a_pont: 1, a_labir: 1, a_espant: 1, torcula: 1, stransv: 1, ssigm: 1, jugular: 1, scav: 1, spsup: 1, spinf: 1, socc: 1, sinterc: 1, sreto: 1 };
function applyVisibility() {
  marca();
  const viaSel = state.sel && META[state.sel] && META[state.sel].grp === 'vias' ? state.sel : null;
  Object.keys(grpObj).forEach(k => grpObj[k].visible = !!state.groupOn[k] && (!state.inflada || k === 'cortex'));
  ALLMESH.forEach(m => {
    const s = m.userData.side;
    m.visible = !((s === 1 && state.hideL) || (s === -1 && state.hideR)) && !escondeNervo(m) && !(state.troncoIso && (SEP_MESH.indexOf(m) >= 0 || TI_FORA[m.userData.id] || /^nu/.test(m.userData.id) || m.userData.intra)) && !(m.userData.tuboPed && (state.separado || state.troncoIso)) && (!m.userData.cortePed || state.separado || state.troncoIso) && !(state.removidos.has(m.userData.id + '|' + m.userData.side) || state.removidos.has(m.userData.id + '|0')) && !(state.vistaBase && (META[m.userData.id].grp === 'art' || META[m.userData.id].grp === 'ven') && !BASE_FICA[m.userData.id]) && (!m.userData.sulco || state.sulcos || m.userData.id === state.sel || (state.licao && state.licao.set[m.userData.id])) && (!m.userData.corte || state.hideR || state.hideL) && (m.userData.les === undefined || (state.lesao && (!viaSel || m.userData.id === viaSel)));
  });
}
const tmpC = new THREE.Color();
var ultimoCorte = '';
function applyAppearance() {
  marca();
  if (typeof CB !== 'undefined' && CB.corte && (state.sel || '') !== ultimoCorte) { ultimoCorte = state.sel || ''; CB.corte(state.sel); }
  const sel = state.sel, target = sel ? selId(sel) : null;
  const iso = state.isolate && !!sel;
  const selCortex = !!sel && (REGIONS.indexOf(sel) >= 0 || /^s_/.test(sel));   // sulco selecionado: o córtex continua opaco
  const escondida = !!sel && OCULTAS.indexOf(sel) >= 0;
  const oc = oclusao();
  const fantasma = (state.fluxo || (iso && (!selCortex || escondida) && !(oc && oc.cortex))) && !state.inflada;   // córtex quase transparente para mostrar o que está dentro
  ALLMESH.forEach(m => {
    const id = m.userData.id, mat = m.material, isSel = id === target || id === sel || (!!sel && (m.userData.pai === sel || m.userData.lobo === sel));
    if (m.userData.cortex) {
      let op = state.cortexOp;
      if (fantasma && !isSel) op = Math.min(op, 0.1);
      mat.opacity = op; mat.transparent = op < 0.999; mat.depthWrite = true;
      tmpC.set(META[id].color);
      {   // lobos: com um lobo selecionado ou numa lição de lobos, cada lobo ganha uma cor só (o giro para-hipocampal também é do lobo límbico)
        const pl = m.userData.pai && /^lobo_/.test(m.userData.pai) && (sel === m.userData.pai || (state.licao && state.licao.set[m.userData.pai])) ? m.userData.pai : null, lb = pl || m.userData.lobo;
        if (lb && /^lobo_/.test(lb) && (sel === lb || (sel && /^lobo_/.test(sel)) || (state.licao && state.licao.set[lb]))) tmpC.set(META[lb].color);
      }
      if (iso && selCortex && !fantasma && !isSel) { const g = (tmpC.r + tmpC.g + tmpC.b) / 3 * 0.85 + 0.12; tmpC.r = tmpC.r * 0.22 + g * 0.78; tmpC.g = tmpC.g * 0.22 + g * 0.78; tmpC.b = tmpC.b * 0.22 + g * 0.78; }
      if (state.territ) tmpC.set('#ffffff');   // a cor vem do território, pintado por vértice
      mat.color.copy(tmpC);
      mat.emissive.set(isSel ? META[id].color : '#000000'); mat.emissiveIntensity = isSel ? 0.3 : 0;
      return;
    }
    let op = m.userData.op0 || 1;
    if (m.userData.les !== undefined) { const ativo = state.les && state.les.via === id && state.les.k === m.userData.les; mat.color.set(ativo ? '#e0362c' : '#202020'); mat.opacity = 1; mat.depthWrite = true; mat.emissive.set(ativo ? '#e0362c' : '#000000'); mat.emissiveIntensity = ativo ? 0.5 : 0; return; }
    if ((state.groupOn.nc || state.groupOn.vias) && !state.troncoIso && (TRANSL[id] || TRANSL[m.userData.pai]) && !isSel) op = Math.min(op, 0.3);
    if (state.licao && !isSel && !state.licao.set[id] && !state.licao.set[m.userData.pai] && !state.licao.set[m.userData.lobo]) op = Math.min(op, 0.13);   // lição: o que não é da lição fica apagado
    if (iso && !isSel && !(state.realce && (state.realce[id] || state.realce[m.userData.pai]))) op = 0.1;
    const lesado = !!(oc && oc.deep && oc.deep.indexOf(id) >= 0);   // estrutura profunda no território ocluído
    if (lesado) op = 1;
    if (state.troncoIso && (TI_COR[id] || TI_COR[m.userData.pai]) && !lesado && !state.territ) { mat.color.set(TI_COR[id] || META[id].color); if (!TI_COR[id]) mat.color.lerp(new THREE.Color(TI_COR[m.userData.pai]), 0.35); } else
    mat.color.set(lesado ? '#2e2a2a' : (state.territ && (T_PROF[id] || T_PROF[m.userData.pai]) ? TCOL[T_PROF[id] || T_PROF[m.userData.pai]] : META[id].color));
    mat.opacity = op; mat.depthWrite = op > 0.95;
    mat.emissive.setHex(isSel ? parseInt(META[id].color.slice(1), 16) : 0x000000);
    if (isSel) { tmpC.set(META[id].color); const lum = tmpC.r * 0.3 + tmpC.g * 0.59 + tmpC.b * 0.11; mat.emissiveIntensity = lum > 0.72 ? 0.1 : (lum > 0.5 ? 0.25 : 0.45); } else mat.emissiveIntensity = 0;
    if (m.userData.fis && isSel && id === target) { mat.color.set('#ffd23f'); mat.emissive.set('#ffb000'); mat.emissiveIntensity = 0.6; }   // fissura selecionada: acende em amarelo
  });
  pintarCortex();
}

/* ===== TERRITÓRIOS ARTERIAIS E MODO AVC (Machado, cap. 18, p. 164-166) =====
   ACA: três quartos anteriores da face medial (até o sulco parietoccipital), superfície médio-orbitofrontal
        e a parte mais alta da face lateral.
   ACM: maior parte da face lateral, ínsula e parte do lobo temporal.
   ACP: face inferior do lobo temporal e lobo occipital.
   Os limites exatos são aproximados: seguem as regiões da parcelação e uma faixa de 2 cm junto à margem superior. */
const TCOL = { ACA: '#f0942e', ACM: '#e0362c', ACP: '#3f8fe0', ACI: '#9a62d0', VB: '#3aa66a' };
const T_RGB = [[0.8, 0.8, 0.8], [0.94, 0.58, 0.18], [0.88, 0.21, 0.17], [0.25, 0.56, 0.88]];
const T_ACA = ['superiorfrontal_medial', 'paracentral', 'precuneus', 'rostralanteriorcingulate', 'caudalanteriorcingulate', 'posteriorcingulate', 'medialorbitofrontal', 'frontalpole'];
const T_ACP = ['lateraloccipital', 'cuneus', 'pericalcarine', 'lingual', 'fusiform', 'parahippocampal', 'entorhinal', 'isthmuscingulate'];
const T_FAIXA = ['superiorfrontal_lateral', 'rostralmiddlefrontal', 'caudalmiddlefrontal', 'precentral', 'postcentral', 'superiorparietal'];
// estruturas profundas pelo território principal descrito no livro
const T_PROF = { caudado: 'ACM', putame: 'ACM', gpe: 'ACM', capsint: 'ACM', gpi: 'ACI', quiasma: 'ACI', talamo: 'ACP', cgl: 'ACP', pineal: 'ACP', hipocampo: 'ACP', snegra: 'ACP', rubro: 'ACP', cc: 'ACA',
  mesenc: 'VB', ponte: 'VB', bulbo: 'VB', cerebelo: 'VB', vermis: 'VB' };
cortexMeshes.forEach(m => {
  if (!m.userData.dono) return;
  const g = m.geometry, n = g.attributes.position.count, t = new Uint8Array(n), dk = m.userData.dk, p0 = m.userData.p0, n0 = m.userData.n0, v = new THREE.Vector3();
  const corte = m.userData.id === 'cc_cut' || m.userData.id === 'dien_wall';
  const base = corte ? 0 : T_ACA.indexOf(dk) >= 0 ? 1 : T_ACP.indexOf(dk) >= 0 ? 3 : 2, faixa = T_FAIXA.indexOf(dk) >= 0;
  for (let i = 0; i < n; i++) {
    let k = base;
    if (faixa) { v.set(p0[i * 3], p0[i * 3 + 1], p0[i * 3 + 2]).applyMatrix4(m.matrix); if (Math.abs(v.x) < 2.0) k = 1; }
    else if (dk === 'inferiortemporal') { v.set(n0[i * 3], n0[i * 3 + 1], n0[i * 3 + 2]).transformDirection(m.matrix); k = v.y < -0.25 ? 3 : 2; }
    t[i] = k;
  }
  g.userData.terr = t; g.userData.c0 = g.attributes.color.array.slice();
});
// artéria -> território ocluído
const ART_T = { a_polfront: 'ACA', a_frontmed: 'ACA', a_prefront: 'ACM', a_tempant: 'ACM', a_tempmed: 'ACM', a_temppost: 'ACM', aca1: 'ACA', pericalosa: 'ACA', calmarg: 'ACA', a_fbm: 'ACA', acm: 'ACM', acm2: 'ACM', a_cent: 'ACM', a_par: 'ACM', a_ang: 'ACM', a_temp: 'ACM', a_fbl: 'ACM',
  acp: 'ACP', acp1: 'ACP', a_calc: 'ACP', a_parocc: 'ACP', a_dorsalcc: 'ACP', a_tempinf: 'ACP', heubner: 'heubner', lenticulo: 'lenticulo', talamoperf: 'talamoperf' };
const OCLUSAO = {
  ACA: { cortex: 1, deep: [], txt: 'Artéria cerebral anterior: paralisia e diminuição da sensibilidade no membro inferior do lado oposto, por lesão das partes das áreas motora e sensitiva que correspondem à perna (porção alta dos giros pré e pós-central, lóbulo paracentral). O comprometimento do corpo caloso pode ocasionar a síndrome de desconexão calosa.' },
  ACM: { cortex: 2, deep: [], txt: 'Artéria cerebral média: hemiplegia (exceto no membro inferior), hipoanestesia e hemianopsia homônima contralaterais, com desvio conjugado do olhar para o lado da lesão. À esquerda: afasia global e apraxia ideomotora. À direita: aprosódia, heminegligência, apraxias, anosognosia, prosopagnosia e distúrbios visuoespaciais. A lesão do córtex orbitofrontal ocasiona a síndrome de Lúria pré-frontal. O quadro é especialmente grave se a obstrução atingir os ramos profundos (artérias estriadas).' },
  ACP: { cortex: 3, deep: ['talamo', 'hipocampo'], txt: 'Artéria cerebral posterior: praticamente todos os pacientes têm sintomas visuais, com perda de parte do campo visual, hemianopsia homônima ou quadrantopsias; o acometimento calcarino ocasiona cegueira. Lesão das áreas secundárias: hemiacromatopsia e agnosias visuais, como a prosopagnosia. Pode haver queixas sensitivas pelo acometimento talâmico, hemiparesia em geral transitória e, se a lesão se estender ao hipocampo, amnésia anterógrada. À esquerda: afasia sensitiva transcortical, anomia e alexia pura.' },
  heubner: { deep: ['caudado', 'putame', 'capsint'], txt: 'Artéria recorrente de Heubner: paresia da face e do membro superior, pelo acometimento da parte anterior da cápsula interna.' },
  lenticulo: { deep: ['putame', 'caudado', 'gpe', 'capsint'], txt: 'Artérias lenticuloestriadas: hemiplegia contralateral. Os AVE hemorrágicos destas artérias são especialmente graves, porque pela cápsula interna passam quase todas as fibras de projeção do córtex.' },
  talamoperf: { deep: ['talamo'], txt: 'Artérias talamoperfurantes (AVE talâmico): pode haver dores persistentes e demência talâmica.' }
};
function oclusao() { return state.avc && state.sel && OCLUSAO[ART_T[state.sel]] || null; }
let pintado = '';
function pintarCortex() {
  const oc = oclusao(), modo = state.territ ? 'T' : (oc && oc.cortex ? 'O' + oc.cortex : '');
  if (modo === pintado) return; pintado = modo;
  cortexMeshes.forEach(m => {
    if (!m.userData.dono) return;
    const g = m.geometry, col = g.attributes.color, a = col.array, c0 = g.userData.c0, t = g.userData.terr;
    for (let i = 0; i < t.length; i++) {
      const cz = c0[i * 3];
      if (state.territ) { const c = T_RGB[t[i]]; a[i * 3] = cz * c[0]; a[i * 3 + 1] = cz * c[1]; a[i * 3 + 2] = cz * c[2]; }
      else { const f = oc && oc.cortex === t[i] ? 0.25 : 1; a[i * 3] = a[i * 3 + 1] = a[i * 3 + 2] = cz * f; }   // território ocluído escurecido
    }
    col.needsUpdate = true;
  });
}
(function () {
  const ct = document.getElementById('territ'), ca = document.getElementById('avc'), lg = document.getElementById('legenda');
  ct.addEventListener('change', () => { state.territ = ct.checked; lg.hidden = !ct.checked; applyAppearance(); });
  ca.addEventListener('change', () => { state.avc = ca.checked; if (ca.checked && !state.groupOn.art) { state.groupOn.art = true; syncLayerUI(); applyVisibility(); } applyAppearance(); renderInfo(); });
  document.getElementById('willis').addEventListener('click', () => {
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art' || k === 'stem' || k === 'cereb' || k === 'ped'));
    state.cortexOp = 0.12; document.getElementById('op').value = 0.1; document.getElementById('opv').textContent = '12%';
    state.sel = null; syncLayerUI(); setView('inferior'); camGoal.target.set(0, -1.6, -0.3); camGoal.dist = 24;
    applyVisibility(); applyAppearance(); renderInfo(); markList();
  });
})();

/* ===== VISTA INFLADA ===== */
let inflT = 0;
function stepInflada(dt) {
  const alvo = state.inflada ? 1 : 0; if (inflT === alvo) return;
  inflT = alvo > inflT ? Math.min(1, inflT + dt / 0.7) : Math.max(0, inflT - dt / 0.7);
  const t = inflT * inflT * (3 - 2 * inflT);
  cortexMeshes.forEach(m => {
    if (!m.userData.dono) return;   // geometria compartilhada com o lado espelhado
    const u = m.userData, p = m.geometry.attributes.position, n = m.geometry.attributes.normal, a = p.array, b = n.array, p0 = u.p0, p1 = u.p1, n0 = u.n0, n1 = u.n1;
    for (let i = 0; i < a.length; i++) { a[i] = p0[i] + (p1[i] - p0[i]) * t; b[i] = n0[i] + (n1[i] - n0[i]) * t; }
    p.needsUpdate = true; n.needsUpdate = true;
    if (inflT === alvo) { m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); }
  });
}
const hintEl = document.querySelector('.hint'), HINT0 = hintEl.textContent;
function setInflada(on) {
  state.inflada = !!on;
  const b = document.getElementById('btnInfl'); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  hintEl.textContent = on ? 'Vista inflada: o córtex é desdobrado para mostrar o fundo dos sulcos (cinza escuro). Estruturas profundas e vasos ficam ocultos nesta vista.' : HINT0;
  applyVisibility(); applyAppearance();
}
document.getElementById('btnInfl').addEventListener('click', () => setInflada(!state.inflada));

/* ===== CÂMERA (órbita própria) ===== */
const ALVO0 = [0, 0.6, -0.4];
const cam = { theta: Math.PI / 2, phi: Math.PI / 2 - 0.08, dist: 40, target: new THREE.Vector3(ALVO0[0], ALVO0[1], ALVO0[2]) };
const camGoal = { theta: cam.theta, phi: cam.phi, dist: cam.dist, target: cam.target.clone() };
let auto = false;
function placeCamera() {
  const sp = Math.sin(cam.phi);
  camera.position.set(cam.target.x + cam.dist * sp * Math.sin(cam.theta), cam.target.y + cam.dist * Math.cos(cam.phi), cam.target.z + cam.dist * sp * Math.cos(cam.theta));
  camera.lookAt(cam.target);
}
function angDiff(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function stepCamera(dt) {
  const k = 1 - Math.pow(0.0015, dt);
  cam.theta += angDiff(cam.theta, camGoal.theta) * k;
  cam.phi += (camGoal.phi - cam.phi) * k;
  cam.dist += (camGoal.dist - cam.dist) * k;
  cam.target.lerp(camGoal.target, k);
}
// Lateral = hemisfério esquerdo visto de fora (anterior à esquerda da tela). Medial = face medial do esquerdo, com o direito oculto.
const VIEWS = {
  lateral: { theta: Math.PI / 2, phi: Math.PI / 2 - 0.05, hideL: false, hideR: false },
  medial: { theta: -Math.PI / 2, phi: Math.PI / 2 - 0.05, hideL: false, hideR: true },
  superior: { theta: Math.PI / 2, phi: 0.12, hideL: false, hideR: false },
  inferior: { theta: Math.PI / 2, phi: Math.PI - 0.12, hideL: false, hideR: false },
  anterior: { theta: 0, phi: Math.PI / 2 - 0.05, hideL: false, hideR: false },
  posterior: { theta: Math.PI, phi: Math.PI / 2 - 0.05, hideL: false, hideR: false },
  base: { theta: Math.PI / 2, phi: 0.12, hideL: false, hideR: false }
};
function setView(name) {
  const v = VIEWS[name]; if (!v) return;
  camGoal.theta = v.theta; camGoal.phi = v.phi;
  camGoal.target.set(ALVO0[0], ALVO0[1], ALVO0[2]);
  state.vistaBase = name === 'base';
  if (name === 'base') {   // fossas do crânio vistas de cima: sem os hemisférios, com tronco, nervos, artérias da base e seios
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'stem' || k === 'cereb' || k === 'ped' || k === 'nc' || k === 'art' || k === 'ven'));
    state.sel = null; camGoal.target.set(0, -2.6, 0.2); camGoal.dist = 30;
    if (typeof syncLayerUI === 'function') syncLayerUI();
    applyAppearance(); if (typeof renderInfo === 'function') renderInfo();
  }
  state.hideL = v.hideL; state.hideR = v.hideR;
  syncHemiUI(); applyVisibility();
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === name ? 'true' : 'false'));
}
let dragging = null, moved = 0;
const pointers = new Map();
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  dragging = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; moved = 0; auto = false; syncAuto();
});
canvas.addEventListener('pointermove', e => {
  const p = pointers.get(e.pointerId);
  if (!p) { hover(e); return; }
  if (pointers.size === 2) {
    const ids = [...pointers.keys()], a = pointers.get(ids[0]), b = pointers.get(ids[1]);
    const d0 = Math.hypot(a.x - b.x, a.y - b.y);
    p.x = e.clientX; p.y = e.clientY;
    const a2 = pointers.get(ids[0]), b2 = pointers.get(ids[1]);
    const d1 = Math.hypot(a2.x - b2.x, a2.y - b2.y);
    if (d0 > 0) { camGoal.dist = Math.max(8, Math.min(90, camGoal.dist * d0 / d1)); cam.dist = camGoal.dist; }
    moved = 99; return;
  }
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  if (dragging && dragging.pan) {
    const f = cam.dist * 0.0016, r = new THREE.Vector3(), u = new THREE.Vector3();
    r.setFromMatrixColumn(camera.matrix, 0); u.setFromMatrixColumn(camera.matrix, 1);
    camGoal.target.addScaledVector(r, -dx * f).addScaledVector(u, dy * f); cam.target.copy(camGoal.target);
  } else {
    camGoal.theta -= dx * 0.0085; camGoal.phi = Math.max(0.08, Math.min(Math.PI - 0.08, camGoal.phi - dy * 0.0085));
    cam.theta = camGoal.theta; cam.phi = camGoal.phi;
  }
});
function endPtr(e) {
  const had = pointers.has(e.pointerId); pointers.delete(e.pointerId);
  if (had && moved < 5 && pointers.size === 0 && e.type === 'pointerup') pick(e);
  if (pointers.size === 0) dragging = null;
}
canvas.addEventListener('pointerup', endPtr);
canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', e => { e.preventDefault(); camGoal.dist = Math.max(8, Math.min(90, camGoal.dist * Math.exp(e.deltaY * 0.0011))); }, { passive: false });

