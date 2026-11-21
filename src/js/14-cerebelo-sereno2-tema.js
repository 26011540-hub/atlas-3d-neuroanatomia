/* ===== CEREBELO: TEMA, FISSURAS, VISTAS, RÓTULOS E FICHA (reforma do cerebelo, Fase 1) =====
   - Tema do atlas: Realista (superfície do Sereno, cor única) ou Esquemático (cores chapadas, luz mais difusa), com
     "Colorir por" Lóbulos, Lobos ou Funcional (Duus, fig. 5.1) e "dividir ao meio" na vista superior.
   - Fissuras como curvas 3D: o contorno entre os lóbulos de cada lado da fissura, tirado da superfície lisa do
     Sereno (nível "estudo"), suavizado e posto sobre as folhas. Prima, horizontal e posterolateral mais grossas.
   - Teto do IV ventrículo: a parede dorsal da malha real do IV ventrículo.
   - Vistas prontas (dorsal, superior, ventral com os pedúnculos cortados, anterior), rótulos só da face à vista,
     passar o mouse realça, duplo clique abre a ficha (nome do Machado, sinônimos do Duus, Larsell, lobo, função).
   Nada daqui substitui o que já existia: os modos Atlas, Folhas, Estudo e Lobos continuam no painel. */
const CBT = { painel: false, vista: null, fis: true, rot: 'vista', antes: null, fisMalhas: [], anc: {}, ancNivel: null };
const CBS_RANK = { cb_lingula: 1, cb_central: 2, cb_asa: 2, cb_culmen: 3, cb_quadant: 3, cb_declive: 4, cb_quadpost: 4, cb_folium: 5, cb_semisup: 5, cb_tuber: 6, cb_semiinf: 6, cb_piramide: 7, cb_biventre: 7, cb_uvula: 8, cb_tonsila: 8, cb_nodulo: 9, cb_floculo: 9 };
// fissura -> separa os lóbulos de posto <= k dos de posto > k (de rostral para caudal, Larsell)
const CBT_FIS = [['f_precent', 1], ['f_preculm', 2], ['f_prima', 3], ['f_posclival', 4], ['f_horiz', 5], ['f_prepir', 6], ['f_pospir', 7], ['f_postlat', 8]];
const CBT_FIS_FORTE = { f_prima: 1, f_horiz: 1, f_postlat: 1 };
const CBT_FUNCAO = {
  vestibulocerebelo: 'Equilíbrio e movimentos dos olhos (conexões com os núcleos vestibulares).',
  espinocerebelo: 'Postura, tônus e marcha; coordenação dos membros durante o movimento (recebe a propriocepção da medula).',
  cerebrocerebelo: 'Planejamento e coordenação dos movimentos finos e delicados dos membros (circuito com o córtex cerebral).' };
const CBT_ZONA_LEG = { funcional: [['#4caf50', 'Vestibulocerebelo (lobo floculonodular)', 'equilíbrio'], ['#e4572e', 'Espinocerebelo: verme', 'postura e marcha'], ['#f3a35c', 'Espinocerebelo: zona paravermiana', 'postura e marcha'], ['#4f7fd8', 'Cerebrocerebelo: parte lateral', 'movimentos finos']],
  lobos: [['#f0a33c', 'Lobo anterior'], ['#d65f7a', 'Lobo posterior'], ['#5cb85c', 'Lobo floculonodular']],
  lobulos: [['#f0a33c', 'Lobo anterior: amarelos e laranjas'], ['#d65f7a', 'Lobo posterior: do vermelho ao azul'], ['#5cb85c', 'Lobo floculonodular: verdes'], ['#6b5a50', 'Verme: um tom mais escuro que o hemisfério']] };

/* --- estruturas extras --- */
M('teto_v4', 'Teto do IV ventrículo', 'vent', '#e2cdb8', 'Parede dorsal do IV ventrículo, voltada para o cerebelo. Na metade cranial é formado pelo véu medular superior, entre os pedúnculos cerebelares superiores; na metade caudal, pelo nódulo, pelo véu medular inferior e pela tela corioide, onde fica a abertura mediana.', 'Plexo corioide do IV ventrículo: artéria cerebelar inferior posterior.', '');
REF(['teto_v4'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 5, p. 46. Forma: parede dorsal da malha real do IV ventrículo.');
NOTA('teto_v4', 'Superfície tirada da malha real do IV ventrículo (as faces voltadas para o dorso). O véu medular inferior e a tela corioide não são separados aqui.');
(function () {
  const m = ITEMS.v4 && ITEMS.v4.meshes[0]; if (!m) return;
  m.updateMatrixWorld(true);
  const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count, Mw = m.matrixWorld;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), u = new THREE.Vector3(), w = new THREE.Vector3(), out = [];
  const DORSO = new THREE.Vector3(0, 0.408, -0.913);   // direção dorsal no plano sagital (a mesma do bloco CB)
  for (let t = 0; t < n; t += 3) {
    a.fromBufferAttribute(p, ix ? ix[t] : t).applyMatrix4(Mw); b.fromBufferAttribute(p, ix ? ix[t + 1] : t + 1).applyMatrix4(Mw); c.fromBufferAttribute(p, ix ? ix[t + 2] : t + 2).applyMatrix4(Mw);
    u.subVectors(b, a); w.subVectors(c, a); u.cross(w).normalize();
    if (u.dot(DORSO) > 0.3) { [a, b, c].forEach(q => out.push(q.x + u.x * 0.012, q.y + u.y * 0.012, q.z + u.z * 0.012)); }
  }
  if (!out.length) return;
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, stdMat('#e2cdb8', { roughness: 0.75 })); mesh.userData.semBolacha = true; register('teto_v4', mesh, 0);
})();
// Magendie e Luschka: os epônimos entram como sinônimos (a busca acha) e o véu medular superior vai com os pedúnculos
if (META.abmed) META.abmed.sin = ['forame de Magendie'];
if (META.ablat) META.ablat.sin = ['forames de Luschka'];
if (META.veusup && ITEMS.veusup) { META.veusup.grp = 'ped'; ITEMS.veusup.meshes.forEach(q => grpObj.ped.add(q)); }
const CBT_TETO = { teto_v4: 1, veusup: 1, abmed: 1, ablat: 1 };

/* --- fissuras como curvas, a partir da superfície lisa do Sereno --- */
function cbtFissuras(geo) {
  const L = geo.userData.lobulo, P = geo.attributes.position.array, Nn = geo.attributes.normal.array, I = geo.index.array, n = L.length;
  const rank = new Uint8Array(n); for (let i = 0; i < n; i++) rank[i] = CBS_RANK[L[i]] || 0;
  const res = {};
  CBT_FIS.forEach(([id, k]) => {
    const nos = new Map(), lado = i => rank[i] > k ? 1 : 0;
    const no = (u, v) => { const key = u < v ? u * n + v : v * n + u; let q = nos.get(key); if (!q) { q = { key, p: [(P[u * 3] + P[v * 3]) / 2, (P[u * 3 + 1] + P[v * 3 + 1]) / 2, (P[u * 3 + 2] + P[v * 3 + 2]) / 2], nr: [Nn[u * 3] + Nn[v * 3], Nn[u * 3 + 1] + Nn[v * 3 + 1], Nn[u * 3 + 2] + Nn[v * 3 + 2]], viz: [] }; nos.set(key, q); } return q; };
    for (let t = 0; t < I.length; t += 3) {
      const v = [I[t], I[t + 1], I[t + 2]]; if (!rank[v[0]] || !rank[v[1]] || !rank[v[2]]) continue;
      const s = v.map(lado); if (s[0] === s[1] && s[1] === s[2]) continue;
      const cr = []; for (let e = 0; e < 3; e++) { const x = v[e], y = v[(e + 1) % 3]; if (s[e] !== s[(e + 1) % 3]) cr.push(no(x, y)); }
      if (cr.length === 2) { cr[0].viz.push(cr[1]); cr[1].viz.push(cr[0]); }
    }
    // cadeias: começa nas pontas (grau 1), depois nos laços
    const visto = new Set(), cadeias = [];
    const anda = ini => { const c = [ini]; visto.add(ini); let at = ini; for (;;) { const nx = at.viz.find(q => !visto.has(q)); if (!nx) break; visto.add(nx); c.push(nx); at = nx; } return c; };
    nos.forEach(q => { if (q.viz.length === 1 && !visto.has(q)) cadeias.push({ c: anda(q), fechada: false }); });
    nos.forEach(q => { if (!visto.has(q)) { const c = anda(q); cadeias.push({ c, fechada: c.length > 3 && c[c.length - 1].viz.includes(c[0]) }); } });
    res[id] = cadeias.map(({ c, fechada }) => {
      let pts = c.map(q => new THREE.Vector3(q.p[0], q.p[1], q.p[2])); const nrs = c.map(q => new THREE.Vector3(q.nr[0], q.nr[1], q.nr[2]).normalize());
      let len = 0; for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]);
      return { pts, nrs, fechada, len };
    }).filter(q => q.len > 1.2 && q.pts.length > 6);
  });
  return res;
}
function cbtSuaviza(pts, fechada, it) {
  let A = pts.map(p => p.clone());
  for (let r = 0; r < it; r++) A = A.map((p, i) => { const a = A[fechada ? (i - 1 + A.length) % A.length : Math.max(0, i - 1)], b = A[fechada ? (i + 1) % A.length : Math.min(A.length - 1, i + 1)]; return (!fechada && (i === 0 || i === A.length - 1)) ? p : p.clone().multiplyScalar(0.5).addScaledVector(a, 0.25).addScaledVector(b, 0.25); });
  return A;
}
function cbtMontarFissuras() {
  if (CBT.fisMalhas.length || CBT.montando) return; CBT.montando = true;
  cbsCarregar('estudo').then(m => {
    const fis = cbtFissuras(m.geometry);
    Object.keys(fis).forEach(id => fis[id].forEach((q, j) => {
      const suave = cbtSuaviza(q.pts, q.fechada, 14).map((p, i) => p.addScaledVector(q.nrs[i], 0.06));
      const curva = new THREE.CatmullRomCurve3(suave, q.fechada), forte = !!CBT_FIS_FORTE[id];
      const geo = new THREE.TubeGeometry(curva, Math.max(16, Math.round(q.len / 0.06)), forte ? 0.055 : 0.032, 6, q.fechada);
      const mesh = new THREE.Mesh(geo, stdMat(META[id].color, { roughness: 0.6, transparent: false }));
      mesh.userData.cbsFis = true; mesh.userData.fis = true; mesh.userData.semBolacha = true; mesh.userData.cbtLen = q.len; mesh.userData.cbtMeio = curva.getPointAt(0.5); mesh.userData.cbtNr = q.nrs[Math.floor(q.nrs.length / 2)];
      register(id, mesh, 0); CBT.fisMalhas.push(mesh);
    }));
    CBT.montando = false; applyVisibility(); applyAppearance(); marca();
  }).catch(e => { CBT.montando = false; console.warn('fissuras do cerebelo', e); });
}
// visibilidade: fissuras do Sereno só com o cerebelo real e a opção ligada; vista ventral sem o tronco e com os cortes dos pedúnculos
const _visCbt = applyVisibility;
applyVisibility = function () {
  _visCbt();
  const real = CBS.modo !== 'atlas', ventral = CBT.painel && (CBT.vista === 'ventral' || CBT.vista === 'anterior');
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.cbsFis) { m.visible = real && CBT.fis && !state.troncoIso && !state.removidos.has(u.id + '|0') && !!state.groupOn.cereb; return; }
    if (u.id === 'teto_v4') { m.visible = m.visible && (ventral || state.sel === 'teto_v4'); return; }
    if (ventral) {
      if (u.tuboPed) m.visible = false;
      if (u.cortePed) m.visible = !!state.groupOn.ped;
      if (META[u.id] && META[u.id].grp === 'vent' && !CBT_TETO[u.id]) m.visible = false;
    }
  });
};

/* --- tema: Realista ou Esquemático; Colorir por --- */
state.tema = 'realista';
function setTema(t, semCerebelo) {
  state.tema = t; const esq = t === 'esquematico';
  luzAmb.intensity = esq ? 0.82 : 0.5; luzPrin.intensity = esq ? 0.6 : 0.85;   // esquemático: luz mais difusa, cores chapadas
  document.body.classList.toggle('tema-esq', esq);
  document.querySelectorAll('[data-tema]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tema === t ? 'true' : 'false'));
  if (!semCerebelo && CBS.modo !== 'atlas') setCerebeloModo(esq ? 'lobos' : 'folhas');
  cbtLegenda(); marca();
}
function setColorir(c) {
  CBS.colorir = c;
  if (c === 'dividida') { camera.updateMatrixWorld(); const r = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0); CBS.ladoFunc = r.x > 0 ? -1 : 1; }   // metade esquerda da tela: zonas funcionais
  document.querySelectorAll('[data-cbcor]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cbcor === c ? 'true' : 'false'));
  const bd = document.getElementById('cbDiv'); if (bd) bd.setAttribute('aria-pressed', c === 'dividida' ? 'true' : 'false');
  if (state.tema !== 'esquematico' || CBS.modo !== 'lobos') setTema('esquematico'); else { applyAppearance(); cbtLegenda(); marca(); }
}
function cbtLegenda() {
  const el = document.getElementById('cbLeg'); if (!el) return;
  const esq = state.tema === 'esquematico' && CBS.modo === 'lobos';
  const L = !esq ? [] : (CBS.colorir === 'dividida' ? CBT_ZONA_LEG.funcional.concat(CBT_ZONA_LEG.lobulos.slice(0, 3)) : CBT_ZONA_LEG[CBS.colorir] || []);
  const lado = CBS.colorir === 'dividida' ? '<div class="lin muted">Metade esquerda da tela: zonas funcionais; metade direita: lóbulos.</div>' : '';
  el.innerHTML = L.map(q => '<div class="lin"><i style="background:' + q[0] + '"></i>' + esc(q[1]) + (q[2] ? ' <span class="muted">(' + esc(q[2]) + ')</span>' : '') + '</div>').join('') + lado + (esq && (CBS.colorir === 'funcional' || CBS.colorir === 'dividida') ? '<div class="lin muted">Largura da zona paravermiana: aproximação.</div>' : '');
  el.hidden = !L.length;
}

/* --- vistas prontas do cerebelo --- */
function cbtCentro() {
  const m = CBS.malhas.folhas || CBS.malhas.leve || CBS.malhas.estudo;
  const box = new THREE.Box3(); if (m) box.setFromObject(m); else (ITEMS.cerebelo ? ITEMS.cerebelo.meshes : []).forEach(q => box.expandByObject(q));
  return box.isEmpty() ? new THREE.Vector3(0, -3.2, -4.6) : box.getCenter(new THREE.Vector3());
}
const CBT_VISTAS = {   // [theta, phi, distância, grupos]: Machado fig. 5.6 (dorsal), Duus fig. 5.1 (superior), Machado 5.4 e Duus 5.2 (ventral)
  dorsal: [Math.PI, Math.PI / 2 - 0.3, 23, ['cereb', 'ped', 'stem']],
  superior: [Math.PI, 0.1, 23, ['cereb', 'ped', 'stem']],
  ventral: [0, Math.PI / 2 + 0.85, 21, ['cereb', 'ped', 'vent']],
  anterior: [0, Math.PI / 2 - 0.05, 21, ['cereb', 'ped', 'vent']] };
function cbtVista(v) {
  const q = CBT_VISTAS[v]; if (!q) return;
  CBT.vista = v; state.licao = null; if (typeof renderLicao === 'function') renderLicao();
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = q[3].indexOf(k) >= 0); syncLayerUI();
  state.hideL = state.hideR = false; syncHemiUI();
  const c = cbtCentro(); camGoal.target.copy(c); camGoal.dist = q[2]; camGoal.theta = q[0]; camGoal.phi = q[1];
  if (v !== 'superior' && CBS.colorir === 'dividida') { setColorir('lobulos'); document.getElementById('cbDiv').setAttribute('aria-pressed', 'false'); }
  document.querySelectorAll('[data-cbv]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cbv === v ? 'true' : 'false'));
  applyVisibility(); applyAppearance(); marca();
}
function cbtDividir() {
  if (CBT.vista !== 'superior') { cbtVista('superior'); cam.theta = camGoal.theta; cam.phi = camGoal.phi; cam.dist = camGoal.dist; cam.target.copy(camGoal.target); placeCamera(); }
  setColorir(CBS.colorir === 'dividida' ? 'lobulos' : 'dividida');
  document.getElementById('cbDiv').setAttribute('aria-pressed', CBS.colorir === 'dividida' ? 'true' : 'false');
}
function setCbPainel(on) {
  if (on === CBT.painel) return;
  CBT.painel = on;
  document.getElementById('cbBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  document.getElementById('cbpainel').hidden = !on; document.getElementById('grpVistas').hidden = on;
  if (on) {
    if (state.bol && state.bol.on) setBolachas(false); if (state.troncoIso) setTroncoIso(false);
    document.getElementById('modoExplorar').setAttribute('aria-pressed', 'false');
    CBT.antes = { g: Object.assign({}, state.groupOn), iso: state.isolate };
    state.isolate = true; state.sel = null;
    if (CBS.modo === 'atlas') setCerebeloModo(state.tema === 'esquematico' ? 'lobos' : 'folhas');
    cbtMontarFissuras(); cbtVista('dorsal');
  } else {
    CBT.vista = null; document.getElementById('modoExplorar').setAttribute('aria-pressed', 'true');
    if (CBT.antes) { Object.assign(state.groupOn, CBT.antes.g); state.isolate = CBT.antes.iso; syncLayerUI(); }
    setView('lateral'); applyVisibility(); applyAppearance();
  }
  CBT.cbRotEl.hidden = !on; renderInfo(); markList(); marca();
}

/* --- interação: o raio guarda a face (para o lóbulo sob o cursor); passar o mouse realça --- */
rayAt = function (e) {
  const r = canvas.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const list = ALLMESH.filter(m => m.visible && m.parent && m.parent.visible && m.material.opacity > 0.3);
  const hit = ray.intersectObjects(list, false).find(q => !(q.object.material.clippingPlanes || []).some(pl => pl.distanceToPoint(q.point) < 0) && !(q.object.userData.cbiSag && !cbsgPixel(q.uv)));   // o raio ignora o plano de recorte: descarta o que foi cortado
  const h = hit ? { id: hit.object.userData.id, mesh: hit.object, point: hit.point, face: hit.face, uv: hit.uv } : null;
  CBT.ultimo = { h, t: performance.now() }; return h;
};
function cbtIdDoPonto(h) {
  if (!h) return null;
  if (h.id === 'cb_sereno' && h.face) { const L = h.mesh.geometry.userData.lobulo; const q = L && L[h.face.a]; return q && META[q] ? q : h.id; }
  if (h.id === 'arbvida') return loboDoCorte(h);
  return h.id;
}
const cbtRealcavel = id => !!id && !!META[id] && (META[id].grp === 'cereb' || META[id].grp === 'ped' || !!CBT_TETO[id]);
const _hovCbt = hover;
hover = function (e) {
  const antes = CBT.ultimo && CBT.ultimo.t; _hovCbt(e);
  if (!CBT.ultimo || CBT.ultimo.t === antes || (state.quiz && !state.quiz.revealed)) return;
  const id = cbtIdDoPonto(CBT.ultimo.h);
  if (id && id !== (CBT.ultimo.h && CBT.ultimo.h.id) && !state.bisturi && nomeVisivel(id)) tip.textContent = nomeL(id);   // no cerebelo real: o nome do lóbulo, não o da malha
  const novo = cbtRealcavel(id) && id !== 'cb_sereno' ? id : null;
  if (novo !== (state.cbHover || null)) { state.cbHover = novo; applyAppearance(); marca(); }
};
canvas.addEventListener('pointerleave', () => { if (state.cbHover) { state.cbHover = null; applyAppearance(); marca(); } });
// isolamento no cerebelo: o resto fica a 15% e sem cor (não some); o que está sob o mouse acende de leve
const _apCbt = applyAppearance;
applyAppearance = function () {
  _apCbt();
  const sel = state.sel, cbSel = state.isolate && !!sel && (cbtRealcavel(sel) || cbsParte(sel));
  const hv = state.cbHover;
  ALLMESH.forEach(m => {
    const u = m.userData, mat = m.material; if (u.cortex || !mat || !mat.color) return;
    if (cbSel && u.id !== sel && u.pai !== sel && u.lobo !== sel && mat.opacity <= 0.101 && !u.les) {
      mat.opacity = 0.15; const y = mat.color.r * 0.3 + mat.color.g * 0.59 + mat.color.b * 0.11, g = 0.35 + y * 0.4; mat.color.lerp(tmpC.setRGB(g, g, g), 0.8);
    }
    if (u.cortePed) { const sobre = CBT.painel && (CBT.vista === 'ventral' || CBT.vista === 'anterior'); mat.depthTest = !sobre; m.renderOrder = sobre ? 30 : 0; if (sobre && !cbSel) { mat.color.set('#f3e6d3'); mat.emissive.set('#5a4636'); mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 0.25); } }   // cortes dos pedúnculos: a superfície real os cobre; na vista ventral são desenhados por cima, como marcação
    if (hv && u.id === hv && hv !== sel && mat.emissive) { mat.emissive.set(META[hv].color); mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 0.28); }
  });
};

/* --- duplo clique: ficha da estrutura --- */
function cbtFicha(id) {
  const el = document.getElementById('cbficha'), m = META[id]; if (!el || !m) return;
  const r = REG_CB[id] || {}, lin = (k, v) => v ? '<div class="lin"><span class="k">' + k + '</span> ' + esc(String(v)) + '</div>' : '';
  const div = r.divisaoFuncional || '', fun = Object.keys(CBT_FUNCAO).filter(k => div.indexOf(k) >= 0).map(k => CBT_FUNCAO[k]).join(' ');
  const ver = r.hemisferio || r.verme, par = ver && META[ver] ? META[ver].name : '';
  el.innerHTML = '<div class="lin cab"><b>' + esc(m.name) + '</b><button type="button" class="x" aria-label="Fechar a ficha">×</button></div>' +
    lin('Sinônimos:', (r.sinonimos || m.sin || []).join('; ')) + lin('Larsell:', r.larsell) + lin('Lobo:', r.lobo) + lin('Zona:', r.zona) +
    lin('Divisão funcional:', div) + lin('Função:', fun) + lin('Aferências:', r.aferencias) + lin('Eferências:', r.eferencias) + lin('Sai pelo:', r.pedunculo) + lin(r.hemisferio ? 'No hemisfério:' : (r.verme ? 'No verme:' : ''), par) +
    (r.separa ? lin('Separa:', r.separa.map(q => META[q] ? META[q].name : q).join(' e ')) : '') + (m.f ? '<div class="lin desc">' + esc(m.f) + '</div>' : '') +
    (/a confirmar/i.test(r.nota || '') ? lin('Nota:', r.nota) : '');
  el.hidden = false; el.querySelector('.x').addEventListener('click', () => { el.hidden = true; });
}
canvas.addEventListener('dblclick', e => { if (state.quiz && !state.quiz.revealed) return; const id = cbtIdDoPonto(rayAt(e)); if (id && META[id]) { if (state.sel !== id) select(id, { focus: false }); cbtFicha(id); } });

/* --- rótulos do cerebelo: só os da face à vista (ou todos), presos na superfície, nunca espelhados nem cortados --- */
CBT.cbRotEl = document.createElement('div'); CBT.cbRotEl.className = 'rotulos cbrotulos'; CBT.cbRotEl.hidden = true; stageEl.appendChild(CBT.cbRotEl);
const CBT_ROT = {};
// âncoras dos rótulos: por lóbulo e lado, um candidato para cada direção (dorsal, ventral, superior, inferior, lateral,
// anterior), tirado da superfície lisa (normais estáveis); em cada quadro vale o candidato que mais olha para a câmera
const CBT_DIR = [[0, 0, -1], [0, 0, 1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]].map(q => new THREE.Vector3(q[0], q[1], q[2]));
function cbtAncoras(m) {
  const g = m.geometry, L = g.userData.lobulo, P = g.attributes.position.array, N = g.attributes.normal.array, grupos = {};
  for (let i = 0; i < L.length; i++) { if (!L[i]) continue; const lado = CB_VERME_SET.has(L[i]) ? 0 : (P[i * 3] > 0 ? 1 : -1), k = L[i] + '|' + lado; (grupos[k] || (grupos[k] = { id: L[i], lado, ix: [] })).ix.push(i); }
  const out = [], v = new THREE.Vector3(), q = new THREE.Vector3();
  Object.values(grupos).forEach(G => {
    if (G.ix.length < 20) return; const cand = [];
    CBT_DIR.forEach(D => {
      const sub = G.ix.filter(i => N[i * 3] * D.x + N[i * 3 + 1] * D.y + N[i * 3 + 2] * D.z > 0.55); if (sub.length < 12) return;
      const c = new THREE.Vector3(); sub.forEach(i => c.x += P[i * 3]) ; sub.forEach(i => { c.y += P[i * 3 + 1]; c.z += P[i * 3 + 2]; }); c.multiplyScalar(1 / sub.length);
      let best = -1, bd = 1e9; sub.forEach(i => { v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).sub(c); v.addScaledVector(D, -v.dot(D)); const d = v.lengthSq(); if (d < bd) { bd = d; best = i; } });   // centro visto daquela direção (sem a profundidade)
      const nr = new THREE.Vector3(); sub.forEach(i => { nr.x += N[i * 3]; nr.y += N[i * 3 + 1]; nr.z += N[i * 3 + 2]; }); nr.normalize();
      cand.push({ p: new THREE.Vector3(P[best * 3], P[best * 3 + 1], P[best * 3 + 2]).addScaledVector(nr, 0.08), n: nr, peso: sub.length });
    });
    const maior = Math.max(0, ...cand.map(c => c.peso)), bons = cand.filter(c => c.peso >= Math.max(60, maior * 0.08));   // retalhos pequenos (vértices soltos do SUIT) não recebem rótulo
    if (bons.length) out.push({ id: G.id, lado: G.lado, cand: bons, p: bons[0].p, n: bons[0].n });
  });
  return out;
}
const _rotCbt = stepRotulos, _pr = new THREE.Vector3(), _vc = new THREE.Vector3();
// oclusão: quando a câmera para, um raio da câmera até cada âncora na superfície lisa; o que fica atrás de outra parte some
const _rcO = new THREE.Raycaster();
function cbtOclusao() {
  const m = CBS.malhas.estudo; CBT.ocl = new Set(); if (!m) return;
  const lista = [];
  CBT.anc.forEach(a => a.cand.forEach(c => lista.push(c)));
  CBT.fisMalhas.forEach(f => lista.push(f.userData));
  lista.forEach(c => {
    const p = c.p || c.cbtMeio, dir = p.clone().sub(camera.position), d = dir.length(); dir.normalize();
    _rcO.set(camera.position, dir); _rcO.far = d - 0.25; const h = _rcO.intersectObject(m, false); if (h.length) CBT.ocl.add(c);
  });
  marca();
}
stepRotulos = function () {
  _rotCbt();
  const on = CBT.painel && CBT.rot !== 'nenhum' && !(state.quiz && !state.quiz.revealed);
  CBT.cbRotEl.hidden = !on; if (!on) { return; }
  Object.keys(ROT).forEach(id => { const g = META[id] && META[id].grp; if (g === 'cereb' || g === 'ped' || CBT_TETO[id]) ROT[id].hidden = true; });   // os rótulos gerais do cerebelo saem
  const m = CBS.modo === 'atlas' ? null : (CBS.malhas.estudo || CBS.malhas[cbsNivel(CBS.modo)]), nivel = m && m.userData.cbsNivel;
  if (m && CBT.ancNivel !== nivel) { CBT.anc = cbtAncoras(m); CBT.ancNivel = nivel; }
  const ch = camera.position.toArray().map(q => q.toFixed(2)).join(',') + CBT.ancNivel;
  if (ch !== CBT.oclChave) { CBT.oclChave = ch; clearTimeout(CBT.oclT); CBT.oclT = setTimeout(cbtOclusao, 180); }
  const tapado = c => CBT.rot !== 'todos' && CBT.ocl && CBT.ocl.has(c);
  const lista = [];
  if (m) CBT.anc.forEach(a => {   // o candidato que mais olha para a câmera (sem filtro em Mostrar todos: o de maior área)
    let b = null, bd = -2; a.cand.forEach(c => { if (tapado(c)) return; const d = CBT.rot === 'todos' ? c.peso / 1e6 : _vc.copy(camera.position).sub(c.p).normalize().dot(c.n); if (d > bd) { bd = d; b = c; } });
    if (b) lista.push({ id: a.id, p: b.p, n: CBT.rot === 'todos' ? null : b.n, pri: 2 });
  });
  CBT.fisMalhas.filter(f => f.visible).forEach(f => { if (f.userData.cbtLen > 2.5 && !tapado(f.userData)) lista.push({ id: f.userData.id, p: f.userData.cbtMeio, n: f.userData.cbtNr, pri: CBT_FIS_FORTE[f.userData.id] ? 3 : 1, fis: true }); });
  const extras = CBT.rot === 'todos' ? ['teto_v4', 'veusup', 'abmed', 'ablat', 'pcs', 'pcm', 'pci', 'denteado', 'interposito', 'fastigial'] : ((CBT.vista === 'ventral' || CBT.vista === 'anterior') ? ['teto_v4', 'veusup', 'abmed', 'ablat', 'pcs', 'pcm', 'pci'] : []);
  if (typeof CBI !== 'undefined' && (CBI.corte || CBI.t.cortex >= 40)) extras.push(...(CBI.interp ? ['denteado', 'interposito', 'fastigial'] : ['denteado', 'emboliforme', 'globoso', 'fastigial']));   // núcleos à vista: corte ou córtex transparente   // núcleos (por dentro) só em Mostrar todos
  if (state.sel && extras.indexOf(state.sel) < 0 && ITEMS[state.sel] && !CBS_RANK[state.sel] && !/^f_/.test(state.sel)) extras.push(state.sel);
  extras.forEach(id => { const it = id === 'interposito' && CBI.nuc === 'formas' ? { meshes: ITEMS.emboliforme.meshes } : ITEMS[id]; if (!it) return; it.meshes.filter(q => q.visible && q.parent && q.parent.visible).slice(0, 2).forEach(q => { const b = new THREE.Box3().setFromObject(q); lista.push({ id, p: b.getCenter(new THREE.Vector3()), n: null, pri: 1 }); }); });
  const w = canvas.clientWidth, h = canvas.clientHeight, caixas = [], usados = new Set();
  lista.sort((a, b) => (b.id === state.sel) - (a.id === state.sel) || b.pri - a.pri);
  lista.forEach(a => {
    if (!state.groupOn[META[a.id] ? META[a.id].grp : 'cereb'] && !(a.id === 'teto_v4')) return;
    if (a.pri === 2 && typeof CBI !== 'undefined' && (CBI.corte || CBI.t.cortex >= 40)) return;   // por dentro: os rótulos dos lóbulos saem para os núcleos aparecerem
    if (CBT.rot === 'vista' && a.n) { _vc.copy(camera.position).sub(a.p).normalize(); if (_vc.dot(a.n) < 0.4) return; }
    _pr.copy(a.p).project(camera); if (_pr.z > 1 || Math.abs(_pr.x) > 0.98 || Math.abs(_pr.y) > 0.98) return;
    const x = (_pr.x + 1) / 2 * w, y = (1 - _pr.y) / 2 * h, txt = nomeVisivel(a.id) ? nomeL(a.id) : '?', lw = (txt.length * 6.6 + 18) / 2, lh = 10;
    if (caixas.some(b => Math.abs(b[0] - x) < b[2] + lw && Math.abs(b[1] - y) < b[3] + lh)) return;
    caixas.push([x, y, lw, lh]);
    const chave = a.id + '|' + (a.p.x > 0.3 ? 'd' : (a.p.x < -0.3 ? 'e' : 'm')); usados.add(chave);
    let el = CBT_ROT[chave];
    if (!el) { el = CBT_ROT[chave] = document.createElement('button'); el.type = 'button'; el.className = 'rot cbrot'; CBT.cbRotEl.appendChild(el); el.addEventListener('click', ev => { ev.stopPropagation(); const id = el.dataset.id; if (state.ocultar && !REVELADO[id]) REVELADO[id] = true; select(id, { focus: false }); }); }
    el.dataset.id = a.id; if (el.textContent !== txt) el.textContent = txt;
    el.classList.toggle('fis', !!a.fis); el.classList.toggle('on', state.sel === a.id);
    el.hidden = false; el.style.left = x + 'px'; el.style.top = y + 'px';
  });
  Object.keys(CBT_ROT).forEach(k => { if (!usados.has(k)) CBT_ROT[k].hidden = true; });
};
// troca de nível de detalhe: as âncoras dos rótulos são recalculadas
const _visCbt2 = applyVisibility; applyVisibility = function () { _visCbt2(); if (CBS.malhas.estudo && CBT.ancNivel !== 'estudo') CBT.ancNivel = null; };

/* --- painel --- */
document.querySelectorAll('[data-tema]').forEach(b => b.addEventListener('click', () => setTema(b.dataset.tema)));
document.querySelectorAll('[data-cbcor]').forEach(b => b.addEventListener('click', () => setColorir(b.dataset.cbcor)));
document.querySelectorAll('[data-cbv]').forEach(b => b.addEventListener('click', () => cbtVista(b.dataset.cbv)));
document.querySelectorAll('[data-cbrot]').forEach(b => b.addEventListener('click', () => { CBT.rot = b.dataset.cbrot; document.querySelectorAll('[data-cbrot]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); marca(); }));
document.getElementById('cbDiv').addEventListener('click', cbtDividir);
document.getElementById('cbMais').addEventListener('click', e => { const p = document.getElementById('cbpainel'), min = !p.classList.contains('min'); p.classList.toggle('min', min); e.currentTarget.textContent = min ? 'Opções ▸' : 'Opções ▾'; e.currentTarget.setAttribute('aria-expanded', min ? 'false' : 'true'); });
document.getElementById('cbFis').addEventListener('click', e => { CBT.fis = !CBT.fis; e.currentTarget.setAttribute('aria-pressed', CBT.fis ? 'true' : 'false'); if (CBT.fis) cbtMontarFissuras(); applyVisibility(); marca(); });
document.getElementById('cbBtn').addEventListener('click', () => setCbPainel(true));
document.getElementById('cbSair').addEventListener('click', () => setCbPainel(false));
['modoExplorar', 'tiBtn', 'bolBtn'].forEach(k => document.getElementById(k).addEventListener('click', () => { if (CBT.painel) setCbPainel(false); }, true));
// o modo do cerebelo escolhido nos botões Atlas/Folhas/Estudo/Lobos acompanha o tema
const _cbmTema = setCerebeloModo;
setCerebeloModo = function (modo, inicial) { _cbmTema(modo, inicial); if (modo === 'lobos' && state.tema !== 'esquematico') setTema('esquematico', true); else if ((modo === 'folhas' || modo === 'estudo') && state.tema === 'esquematico') setTema('realista', true); cbtLegenda(); };
if (/debug/.test(location.hash)) window.cbtDebug = { CBT, cbtVista, setTema, setColorir, cbtFicha, setCbPainel, cbtMontarFissuras };
