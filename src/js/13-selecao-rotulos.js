/* ===== PICK / HOVER ===== */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function rayAt(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const list = ALLMESH.filter(m => m.visible && m.parent && m.parent.visible && m.material.opacity > 0.3);
  const hits = ray.intersectObjects(list, false);
  if (!hits.length) return null;
  return { id: hits[0].object.userData.id, mesh: hits[0].object, point: hits[0].point };
}
const tip = document.getElementById('tip');
let lastHover = 0;
function hover(e) {
  const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
  if (state.quiz && !state.quiz.revealed) { tip.hidden = true; return; }
  const h = rayAt(e);
  if (!h) { tip.hidden = true; canvas.style.cursor = 'grab'; return; }
  const meta = META[h.id];
  const hid = loboDoCorte(h);
  tip.textContent = state.bisturi ? 'Remover: ' + nomeL(h.id) : (h.mesh.userData.les !== undefined ? 'Lesão: ' + LES[h.id][h.mesh.userData.les].nome : (nomeVisivel(hid) ? nomeL(hid) : '?')); tip.hidden = false; canvas.style.cursor = state.bisturi ? 'crosshair' : 'pointer';
  const r = stageEl.getBoundingClientRect();
  tip.style.left = Math.min(r.width - 20, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px';
}
canvas.addEventListener('pointerleave', () => { tip.hidden = true; });
function loboDoCorte(h) {   // no corte sagital do verme, devolve o lóbulo sob o cursor
  if (!h || h.id !== 'arbvida' || !h.point) return h ? h.id : null;
  const o = sepAtual(), c = CB.classifica(0, h.point.y - o.y, h.point.z - o.z); return c && c.L ? c.L : h.id;
}
function pick(e) {
  const h = rayAt(e);
  if (state.bisturi && h && !(state.quiz && !state.quiz.revealed)) { const k = h.id + '|' + (h.mesh.userData.side || 0); state.removidos.add(k); state.pilhaRem.push(k); if (state.sel === h.id) state.sel = null; applyVisibility(); applyAppearance(); renderBisturi(); renderInfo(); return; }
  if (h && h.id === 'arbvida' && !(state.quiz && !state.quiz.revealed)) h.id = loboDoCorte(h);
  if (state.quiz && !state.quiz.revealed) {
    if (state.quiz.modo === 'clique' && h) { const t = state.quiz.target, u = h.mesh.userData; responderClique(h.id, h.id === t || u.pai === t || u.lobo === t || selId(h.id) === t); }
    return;
  }
  if (!h) { if (!state.quiz) select(null); return; }
  if (h.mesh.userData.les !== undefined) { state.les = { via: h.id, k: h.mesh.userData.les }; select(h.id, { focus: false }); return; }
  if (state.les && state.les.via !== h.id) state.les = null;
  select(h.id);
}

/* ===== SELEÇÃO ===== */
function centerOf(id) {
  let it = ITEMS[id]; if (!it || !it.meshes.length) it = ITEMS[selId(id)];
  if (!it || !it.meshes.length) return null;
  const box = new THREE.Box3(); let any = false;
  it.meshes.forEach(m => { if (m.userData.side !== -1) { box.expandByObject(m); any = true; } });
  if (!any) return null;
  return box.getCenter(new THREE.Vector3());
}
function isMedialOnly(id) { return MEDIAIS.indexOf(id) >= 0; }
// escolhe o lado de onde a região se vê
function enquadrar(id) {
  if (isMedialOnly(id)) { state.hideR = true; state.hideL = false; syncHemiUI(); camGoal.theta = -Math.PI / 2; camGoal.phi = Math.PI / 2 - 0.05; }
  else if (INFERIORES.indexOf(id) >= 0) { camGoal.theta = Math.PI / 2; camGoal.phi = Math.PI - 0.35; }
}
function select(id, opt) {
  opt = opt || {};
  state.sel = id; state.realce = null;
  { const oc = oclusao(); if (oc && oc.deep.length) { oc.deep.forEach(x => { state.groupOn[META[x].grp] = true; }); syncLayerUI(); } }   // modo AVC: mostra as estruturas profundas atingidas
  if (id) {
    const g = META[selId(id)].grp;
    if (!state.groupOn[g]) { state.groupOn[g] = true; syncLayerUI(); }
    if (REGIONS.indexOf(id) >= 0 && !state.groupOn.cortex) { state.groupOn.cortex = true; syncLayerUI(); }
    if (opt.focus !== false) {
      const c = centerOf(id);
      if (c) {
        if (REGIONS.indexOf(id) >= 0) enquadrar(id);
        camGoal.target.copy(c);
        camGoal.dist = Math.min(camGoal.dist, 34);
      }
    }
  }
  applyVisibility(); applyAppearance(); renderInfo(); markList();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

/* ===== RÓTULOS ===== */
const rotEl = document.getElementById('rotulos'), ROT = {}, REVELADO = {};
const centroRot = {};
function centroDe(id) { if (!(id in centroRot)) { const c = centerOf(id); centroRot[id] = c ? c.clone() : null; } return centroRot[id]; }
const _p = new THREE.Vector3(), _dc = new THREE.Vector3(), _dp = new THREE.Vector3();
const SUPERF = { cortex: 1, art: 1, ven: 1 };
function nomeVisivel(id) { return !state.ocultar || REVELADO[id]; }
const CAIXAS = [], pinSvg = document.getElementById('pinos'), PIN = {}, ANC = {};
// ponto da própria estrutura mais próximo do centro dela (âncora do pino)
function ancoraDe(id, esq) {
  const key = id + (esq ? 'E' : 'D'); if (key in ANC) return ANC[key];
  const it = ITEMS[id]; if (!it || !it.meshes.length) return (ANC[key] = null);
  let lista = it.meshes.filter(m => esq ? m.userData.side !== -1 : m.userData.side !== 1); if (!lista.length) lista = it.meshes;
  const box = new THREE.Box3(); lista.forEach(m => { m.updateMatrixWorld(true); box.expandByObject(m); }); const c = box.getCenter(new THREE.Vector3());
  let best = null, bd2 = 1e9; const v = new THREE.Vector3();
  lista.forEach(m => { const p = m.geometry.attributes.position, ix = m.geometry.index, n = ix ? ix.count : p.count, passo = Math.max(1, Math.floor(n / 500)); for (let k = 0; k < n; k += passo) { v.fromBufferAttribute(p, ix ? ix.getX(k) : k).applyMatrix4(m.matrixWorld); const d = v.distanceToSquared(c); if (d < bd2) { bd2 = d; best = v.clone(); } } });
  return (ANC[key] = best);
}
function nomeL(id) { const n = NOMES[id]; if (state.lingua === 'la' && n) return n[0]; if (state.lingua === 'en' && n) return n[1]; return META[id] ? META[id].name : id; }
function stepRotulos() {
  const lic = state.licao, livre = !(state.quiz && !state.quiz.revealed) && !state.inflada;
  const on = (state.rotulos || !!lic) && livre;
  rotEl.hidden = !on; pinSvg.style.display = on && lic ? '' : 'none';
  if (!on) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  CAIXAS.length = 0;
  if (lic) {
    Object.keys(ROT).forEach(k => ROT[k].hidden = true);
    let svg = ''; const esq = !state.hideL, col = [[], []];
    // 1. projeta as âncoras; 2. rótulos em duas colunas (esquerda e direita do palco), na ordem vertical das âncoras
    lic.ids.forEach((id, k) => {
      const a = ancoraDe(id, esq); if (!a) { if (PIN[id]) PIN[id].hidden = true; return; }
      _p.copy(a).project(camera);
      if (_p.z > 1 || Math.abs(_p.x) > 1.05 || Math.abs(_p.y) > 1.05) { if (PIN[id]) PIN[id].hidden = true; return; }
      const ax = (_p.x + 1) / 2 * w, ay = (1 - _p.y) / 2 * h;
      col[ax < w / 2 ? 0 : 1].push({ id, k, ax, ay });
    });
    const topo = 46, base = h - 34, passoY = 25;
    col.forEach((L, lado) => {
      L.sort((p, q) => p.ay - q.ay);
      let y = topo; L.forEach(p => { p.ly = Math.max(y, Math.min(base, p.ay)); y = p.ly + passoY; });
      for (let i = L.length - 1, lim = base; i >= 0; i--) { L[i].ly = Math.min(L[i].ly, lim); lim = L[i].ly - passoY; }
      L.forEach(p => {
        const id = p.id, curto = w < 560, txt = (p.k + 1) + (nomeVisivel(id) && !curto ? ' ' + nomeL(id) : ''), lw = Math.min(200, txt.length * 6.7 + 20) / 2;
        const lx = lado === 0 ? 12 + lw : w - 12 - lw, ex = lado === 0 ? lx + lw : lx - lw;
        svg += '<polyline points="' + p.ax.toFixed(1) + ',' + p.ay.toFixed(1) + ' ' + (ex + (lado === 0 ? 14 : -14)).toFixed(1) + ',' + p.ly.toFixed(1) + ' ' + ex.toFixed(1) + ',' + p.ly.toFixed(1) + '" fill="none" stroke="#00e8f7" stroke-width="1.1" stroke-opacity=".75"/><circle cx="' + p.ax.toFixed(1) + '" cy="' + p.ay.toFixed(1) + '" r="3.2" fill="#00e8f7"/>';
        let el = PIN[id];
        if (!el) { el = PIN[id] = document.createElement('button'); el.type = 'button'; el.className = 'rot pin'; rotEl.appendChild(el); el.addEventListener('click', ev => { ev.stopPropagation(); if (state.ocultar && !REVELADO[id]) REVELADO[id] = true; select(id, { focus: false }); renderLicao(); }); }
        const html = '<b>' + (p.k + 1) + '</b>' + (nomeVisivel(id) && !curto ? esc(nomeL(id)) : '');   // tela estreita: só o número; o nome está na lista do painel
        if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; el.title = nomeVisivel(id) ? META[id].name : 'Clique para revelar'; }
        el.hidden = false; el.style.left = lx + 'px'; el.style.top = p.ly + 'px'; el.classList.toggle('on', state.sel === id);
      });
    });
    Object.keys(PIN).forEach(id => { if (!lic.set[id]) PIN[id].hidden = true; });
    pinSvg.innerHTML = svg;
    return;
  }
  Object.keys(PIN).forEach(id => PIN[id].hidden = true);
  const corteOpaco = state.groupOn.cortex && state.cortexOp > 0.5;
  const ladoCam = camera.position.x - cam.target.x >= 0 ? 1 : -1;
  _dc.copy(camera.position).sub(cam.target);
  const ids = Object.keys(ITEMS).sort((x, y) => (y === state.sel) - (x === state.sel));
  ids.forEach(id => {
    const m = META[id]; if (!m || id === 'cc_cut' || id === 'dien_wall') return;
    let el = ROT[id];
    let ver = !!state.groupOn[m.grp] && ITEMS[id].meshes.some(x => x.visible) && (!corteOpaco || m.grp === 'cortex' || id === state.sel) && !/^s_/.test(id);
    const c = ver ? centroDe(id) : null; if (!c) ver = false;
    if (ver) {
      _p.copy(c);
      let espelha = state.hideL || (ladoCam < 0 && !state.hideR);
      if (m.grp === 'cortex' && corteOpaco) {
        if (OCULTAS.indexOf(id) >= 0) ver = false;
        else if (MEDIAIS.indexOf(id) >= 0) { ver = state.hideR || state.hideL; espelha = state.hideL; }
        else { _dp.copy(_p); if (espelha) _dp.x = -_dp.x; _dp.sub(cam.target); if (_dp.dot(_dc) < 0) ver = false; }
      }
      if (espelha && _p.x > 0.05) _p.x = -_p.x;
      _p.project(camera); if (_p.z > 1 || Math.abs(_p.x) > 1.02 || Math.abs(_p.y) > 1.02) ver = false;
    }
    let x = 0, y = 0, txt = '';
    if (ver) {
      x = (_p.x + 1) / 2 * w; y = (1 - _p.y) / 2 * h; txt = nomeVisivel(id) ? nomeL(id) : '?';
      const lw = Math.min(180, txt.length * 6.6 + 16) / 2, lh = 10;
      if (CAIXAS.some(b => Math.abs(b[0] - x) < b[2] + lw && Math.abs(b[1] - y) < b[3] + lh)) ver = false;
      else CAIXAS.push([x, y, lw, lh]);
    }
    if (!ver) { if (el) el.hidden = true; return; }
    if (!el) {
      el = ROT[id] = document.createElement('button'); el.type = 'button'; el.className = 'rot'; rotEl.appendChild(el);
      el.addEventListener('click', ev => { ev.stopPropagation(); if (state.ocultar && !REVELADO[id]) { REVELADO[id] = true; } select(id, { focus: false }); });
    }
    if (el.textContent !== txt) { el.textContent = txt; el.classList.toggle('oculto', txt === '?'); el.title = txt === '?' ? 'Clique para revelar' : m.name; }
    el.hidden = false; el.style.left = x + 'px'; el.style.top = y + 'px';
  });
}
// legenda por tecido: só o que está ligado
const legEl = document.getElementById('legtec');
function legenda() {
  const L = [['art', '#d8322d', 'Artéria'], ['ven', '#2f5fb8', 'Veia e seio'], ['nc', '#e3c044', 'Nervo'], ['vent', '#6cc3d6', 'Ventrículo e líquor'], ['deep', '#efe6dc', 'Substância branca (corpo caloso)'], ['men', '#b3a28a', 'Dura-máter'], ['vias', '#7a5cd6', 'Grande via']].filter(q => state.groupOn[q[0]] && !state.inflada);
  const html = L.map(q => '<span><i style="background:' + q[1] + '"></i>' + q[2] + '</span>').join('');
  legEl.hidden = !L.length; if (legEl.dataset.h !== html) { legEl.innerHTML = html; legEl.dataset.h = html; }
}

/* ===== LOOP ===== */
function resize() {
  marca();
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w / h < 0.9 ? 52 : 35; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stageEl); resize();
let tPrev = performance.now();
// Desenha só quando algo muda: câmera em movimento, animação (girar, inflar, líquor, setas) ou interação.
let camAnt = '';
function frame(t) {
  const dt = Math.min(0.05, (t - tPrev) / 1000); tPrev = t;
  if (auto) camGoal.theta += dt * 0.5, cam.theta = camGoal.theta;
  stepInflada(dt); stepFluxo(dt); stepSetas(dt); stepSep(dt); stepBol(dt); stepCamera(dt);
  const ch = cam.theta.toFixed(4) + ',' + cam.phi.toFixed(4) + ',' + cam.dist.toFixed(3) + ',' + cam.target.x.toFixed(3) + ',' + cam.target.y.toFixed(3) + ',' + cam.target.z.toFixed(3);
  const mexeu = ch !== camAnt; camAnt = ch;
  const anima = auto || inflT !== (state.inflada ? 1 : 0) || fluxoGrp.visible || setaGrp.visible || (typeof animando === 'function' && animando()) || bolAnimando();
  if (mexeu || anima || sujo > 0) { placeCamera(); renderer.render(scene, camera); stepRotulos(); legenda(); if (sujo > 0) sujo--; }
  requestAnimationFrame(frame);
}
['click', 'input', 'change', 'wheel', 'keydown', 'pointerup'].forEach(ev => document.addEventListener(ev, marca, true));
applyVisibility(); applyAppearance(); placeCamera();
if (/debug/.test(location.hash)) window.atlasDebug = { TEMPOS: () => TEMPOS, META, THREE, scene, camera, cam, camGoal, state, ITEMS, ALLMESH, ENV, CONT, SYLV, MARCOS, cortexMeshes, select, setView, setInflada, applyVisibility, applyAppearance, syncLayerUI: () => syncLayerUI() };

