/* ===== CEREBELO POR DENTRO (reforma do cerebelo, Fase 2) =====
   - Transparência em três controles: córtex cerebelar, corpo medular e tronco (0 a 100%). Transparente: sem escrita de
     profundidade e desenhado depois dos núcleos (14-i9-transparencia.js), então os núcleos aparecem por dentro.
   - Núcleos profundos: no cerebelo real passam a valer as formas do Mímir (denteado em bolsa pregueada com o hilo
     medial e anterior, emboliforme em cunha, globosos em 2 ou 3 massas, fastigial junto ao teto do IV ventrículo;
     Duus, p. 184; Prometheus, p. 240); o atlas SUIT (probabilístico, CC BY) fica como opção.
   - "Agrupar interpósito": emboliforme e globosos acendem e se escolhem juntos como núcleo interpósito.
   - Corpo medular real: superfície branca (rh.white) do cerebmap20, com a mesma transformação do córtex
     (scripts/process/sereno_corpo_medular.py -> models/cerebelo_sereno_branca.glb).
   - Corte horizontal pelo núcleo denteado (plano 1 da fig. 5.5a do Duus): plano de recorte com a face cortada
     preenchida (tampa por stencil): córtex cinzento, corpo medular branco e os núcleos em secção. */
if (!META.cb_cbm) M('cb_cbm', 'Corpo medular do cerebelo', 'cereb', '#f3eee6', 'Substância branca central do cerebelo. Dela partem as lâminas brancas que entram em cada folha (no corte sagital, a árvore da vida); contém os núcleos centrais e recebe e emite as fibras dos três pedúnculos.', 'Artérias cerebelares.', '');
// nome, sinônimos e grupo vêm do registro (14-i7-registro-cerebelo.js roda depois e os aplica)
REF(['cb_cbm'], 'Superfície branca (rh.white) do cerebmap20: Sereno MI et al., PNAS 2020, com permissão do autor. Texto: Machado, cap. 5, p. 48.');
NOTA('cb_cbm', 'Superfície entre a substância cinzenta e a branca do mesmo cerebelo do córtex real (Sereno 2020), com a mesma transformação: as lâminas brancas das folhas são reais.');
const CBI = { t: { cortex: 0, branca: 0, tronco: 0 }, nuc: 'formas', interp: false, corte: false, branca: null, carregando: false, passes: [] };
const CBI_NUC = ['denteado', 'emboliforme', 'globoso', 'fastigial'];
const CBI_Y = -2.97;   // plano do corte: nível do denteado, do emboliforme, dos globosos e do fastigial no modelo

/* --- corpo medular real (sob demanda) --- */
function cbiCarregarBranca() {
  if (CBI.branca || CBI.carregando) return; CBI.carregando = true;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  cbsLoader.load('models/cerebelo_sereno_branca.glb', g => {
    let malha = null; g.scene.traverse(o => { if (o.isMesh && !malha) malha = o; }); g.scene.updateMatrixWorld(true);
    const m = new THREE.Mesh(cbsGeo(malha), new THREE.MeshStandardMaterial({ color: META.cb_cbm.color, roughness: 0.7, metalness: 0 }));
    m.userData.semBolacha = true; m.userData.cbiBranca = true; register('cb_cbm', m, 0); CBI.branca = m; CBI.carregando = false;
    if (CBI.corte) cbiMontarCorte(); applyVisibility(); applyAppearance(); marca();
  }, undefined, e => { CBI.carregando = false; console.warn('corpo medular', e); });
}
const cbiLiso = () => CBI.t.cortex >= 30 && !CBI.corte && !!CBS.malhas.estudo;
const cbiBrancaPedida = () => CBI.verBranca || CBI.corte || state.sel === 'cb_cbm';   // o corpo medular cobre os núcleos: só aparece quando pedido

/* --- visibilidade: núcleos (formas ou SUIT) e corpo medular --- */
const _visCbi = applyVisibility;
applyVisibility = function () {
  _visCbi();
  const real = CBS.modo !== 'atlas';
  if (real && cbiBrancaPedida()) cbiCarregarBranca();
  ALLMESH.forEach(m => {
    const u = m.userData, ok = !!state.groupOn.cereb && !state.troncoIso && !((u.side === 1 && state.hideL) || (u.side === -1 && state.hideR)) && !state.removidos.has(u.id + '|' + (u.side || 0));
    if (real && CBI_NUC.indexOf(u.id) >= 0 && !u.suit) m.visible = ok && CBI.nuc === 'formas';
    else if (u.suit) m.visible = ok && real && CBI.nuc === 'suit';
    else if (u.cbiBranca) m.visible = ok && real && cbiBrancaPedida();
    if (CBI.corte && META[u.id] && META[u.id].grp === 'stem') m.visible = false;
    if (u.secao) m.visible = CBI.corte && ok;   // no corte horizontal o tronco sai
  });
  // córtex transparente: a superfície lisa (uma camada só) no lugar das folhas, que empilhariam dezenas de camadas translúcidas
  if (real && cbiLiso()) { const vis = Object.values(CBS.malhas).some(q => q.visible); Object.values(CBS.malhas).forEach(q => q.visible = vis && q === CBS.malhas.estudo); }
  cbiSyncPasses();
};

/* --- interpósito agrupado --- */
function setInterp(on) {
  CBI.interp = !!on;
  ['emboliforme', 'globoso'].forEach(id => (ITEMS[id] ? ITEMS[id].meshes : []).forEach(m => { if (on) m.userData.pai = 'interposito'; else if (m.userData.pai === 'interposito') delete m.userData.pai; }));
  if (!on && state.sel === 'interposito' && CBI.nuc === 'formas') state.sel = null;
  document.getElementById('cbInterp').setAttribute('aria-pressed', on ? 'true' : 'false');
  applyAppearance(); renderInfo(); marca();
}
const _selCbi = select;
select = function (id, opt) { if (CBI.interp && (id === 'emboliforme' || id === 'globoso')) id = 'interposito'; return _selCbi(id, opt); };

/* --- aparência: transparência por controle, cor do interpósito agrupado --- */
const _apCbi = applyAppearance;
applyAppearance = function () {
  _apCbi();
  if (cbiLiso()) { const e = CBS.malhas.estudo, k = cbsCorChave(); if (e.userData.corSel !== state.sel || e.userData.corModo !== k) cbsAplicarCores(e, CBS.modo === 'lobos'); }
  const tc = 1 - CBI.t.cortex / 100, tb = 1 - CBI.t.branca / 100, tt = 1 - CBI.t.tronco / 100;
  ALLMESH.forEach(m => {
    const u = m.userData, mat = m.material; if (!mat || u.cortex) return;
    const g = META[u.id] && META[u.id].grp;
    if (tc < 1 && (u.id === 'cb_sereno' || u.cbsFis || (g === 'cereb' && (u.pai === 'cerebelo' || u.pai === 'vermis' || /^cb_/.test(u.id)) && !u.cbiBranca))) mat.opacity = Math.min(mat.opacity, tc);
    if (tb < 1 && u.cbiBranca) mat.opacity = Math.min(mat.opacity, tb);
    if (tt < 1 && g === 'stem') mat.opacity = Math.min(mat.opacity, tt);
    if (CBI.interp && (u.id === 'emboliforme' || u.id === 'globoso') && state.sel !== u.id && mat.opacity > 0.5) mat.color.set(META.interposito.color);
    if (CBI_NUC.indexOf(u.id) >= 0 || u.id === 'interposito') { mat.depthWrite = true; m.renderOrder = 1; }
  });
};

/* --- corte horizontal com tampa (stencil) --- */
const CBI_PLANO = new THREE.Plane(new THREE.Vector3(0, -1, 0), CBI_Y);   // fica o que está abaixo do plano
renderer.localClippingEnabled = true;
function cbiFontes() {   // [malha, cor da tampa] em ordem: córtex, corpo medular, núcleos (os de dentro por último)
  const L = [], nivel = cbsNivel(CBS.modo), c = CBS.malhas[nivel];
  if (c) L.push([c, '#8d8a86']);
  if (CBI.branca) L.push([CBI.branca, '#f3eee6']);
  return L;
}
function cbiLimparCorte() {
  CBI.passes.forEach(p => { scene.remove(p); if (p.userData.capa) p.geometry.dispose(); p.material.dispose(); }); CBI.passes = [];
  (CBI.secoes || []).forEach(m => { m.parent && m.parent.remove(m); const it = ITEMS[m.userData.id]; if (it) it.meshes.splice(it.meshes.indexOf(m), 1); ALLMESH.splice(ALLMESH.indexOf(m), 1); m.geometry.dispose(); m.material.dispose(); }); CBI.secoes = [];
}
// secção de cada núcleo no plano: interseção dos triângulos com o plano, encadeada em contornos; os núcleos fechados viram
// áreas preenchidas, o denteado (lâmina) vira a linha ondulada do corte (Duus, fig. 5.5b)
function cbiSecao(m) {
  m.updateMatrixWorld(true);
  const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count, W = [], v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); W.push(v.x, v.y, v.z); }
  const viz = new Map(), pt = {};
  const ponto = (a, b) => { if (a > b) { const c = a; a = b; b = c; } const ya = W[a * 3 + 1] - CBI_Y, yb = W[b * 3 + 1] - CBI_Y, t = ya / (ya - yb), x = W[a * 3] + (W[b * 3] - W[a * 3]) * t, z = W[a * 3 + 2] + (W[b * 3 + 2] - W[a * 3 + 2]) * t, k = x.toFixed(4) + ',' + z.toFixed(4); if (!pt[k]) pt[k] = [x, z]; return k; };   // chave pela posição: junta as costuras da esfera (vértices duplicados)
  const liga = (a, b) => { (viz.get(a) || viz.set(a, []).get(a)).push(b); (viz.get(b) || viz.set(b, []).get(b)).push(a); };
  for (let t = 0; t < n; t += 3) {
    const q = [ix ? ix[t] : t, ix ? ix[t + 1] : t + 1, ix ? ix[t + 2] : t + 2], cr = [];
    for (let e = 0; e < 3; e++) { const a = q[e], b = q[(e + 1) % 3]; if ((W[a * 3 + 1] > CBI_Y) !== (W[b * 3 + 1] > CBI_Y)) cr.push(ponto(a, b)); }
    if (cr.length === 2 && cr[0] !== cr[1]) liga(cr[0], cr[1]);
  }
  const visto = new Set(), laços = [];
  const anda = k0 => { const c = [k0]; visto.add(k0); let k = k0; for (;;) { const nx = (viz.get(k) || []).find(x => !visto.has(x)); if (!nx) break; visto.add(nx); c.push(nx); k = nx; } return { c, fechado: c.length > 2 && (viz.get(k) || []).includes(k0) }; };
  viz.forEach((l, k) => { if (l.length === 1 && !visto.has(k)) laços.push(anda(k)); });
  viz.forEach((l, k) => { if (!visto.has(k)) laços.push(anda(k)); });
  return laços.map(l => ({ fechado: l.fechado, pts: l.c.map(k => pt[k]) })).filter(l => l.pts.length > 2);
}
function cbiMontarSecoes() {
  CBI.secoes = [];
  CBI_NUC.forEach(id => (ITEMS[id] ? ITEMS[id].meshes : []).forEach(m => {
    if (m.userData.secao || !m.visible) return;
    const lamina = id === 'denteado' && !m.userData.suit;
    cbiSecao(m).forEach(l => {
      let geo;
      if (lamina || !l.fechado) {
        const curva = new THREE.CatmullRomCurve3(l.pts.map(q => new THREE.Vector3(q[0], CBI_Y + 0.012, q[1])), l.fechado && !lamina);
        geo = new THREE.TubeGeometry(curva, Math.max(12, l.pts.length * 2), 0.028, 5, l.fechado && !lamina);
      } else { geo = new THREE.ShapeGeometry(new THREE.Shape(l.pts.map(q => new THREE.Vector2(q[0], q[1])))); geo.rotateX(Math.PI / 2); geo.translate(0, CBI_Y + 0.008, 0); }
      const sm = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: META[id].color, roughness: 0.6, side: THREE.DoubleSide }));
      sm.renderOrder = 90; sm.userData.secao = true; sm.userData.semBolacha = true; register(id, sm, m.userData.side || 0); CBI.secoes.push(sm);
    });
  }));
}
function cbiMontarCorte() {
  cbiLimparCorte();
  const centro = cbtCentro(), ordem0 = 40;
  cbiFontes().forEach(([src, cor], k) => {
    const base = { colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, clippingPlanes: [CBI_PLANO] };
    const tras = new THREE.Mesh(src.geometry, new THREE.MeshBasicMaterial(Object.assign({ side: THREE.BackSide, stencilFail: THREE.IncrementWrapStencilOp, stencilZFail: THREE.IncrementWrapStencilOp, stencilZPass: THREE.IncrementWrapStencilOp }, base)));
    const frente = new THREE.Mesh(src.geometry, new THREE.MeshBasicMaterial(Object.assign({ side: THREE.FrontSide, stencilFail: THREE.DecrementWrapStencilOp, stencilZFail: THREE.DecrementWrapStencilOp, stencilZPass: THREE.DecrementWrapStencilOp }, base)));
    const capa = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp }));
    capa.rotation.x = -Math.PI / 2; capa.position.set(centro.x, CBI_Y, centro.z); capa.userData.capa = true;
    [tras, frente].forEach(p => { p.matrixAutoUpdate = false; p.userData.src = src; });
    tras.renderOrder = ordem0 + k * 3; frente.renderOrder = ordem0 + k * 3 + 1; capa.renderOrder = ordem0 + k * 3 + 2;
    [tras, frente, capa].forEach(p => { p.userData.fonte = src; scene.add(p); CBI.passes.push(p); });
  });
  cbiSyncPasses(); cbiMontarSecoes();
}
function cbiSyncPasses() {
  CBI.passes.forEach(p => { const s = p.userData.fonte; const vis = CBI.corte && s.visible && s.parent && s.parent.visible; p.visible = vis; if (vis && !p.userData.capa) { s.updateMatrixWorld(); p.matrix.copy(s.matrixWorld); p.matrixWorldNeedsUpdate = true; } });
}
// as malhas do cerebelo, do corpo medular e dos núcleos levam o plano de recorte enquanto o corte está ligado
function cbiAplicarPlano() {
  ALLMESH.forEach(m => { const g = META[m.userData.id] && META[m.userData.id].grp; if ((g !== 'cereb' && g !== 'ped') || m.userData.secao) return; const mt = m.material; const quer = CBI.corte ? [CBI_PLANO] : null; if (mt.clippingPlanes !== quer) { mt.clippingPlanes = quer; mt.needsUpdate = true; } if (m.userData.id === 'denteado' && !m.userData.suit) mt.side = THREE.DoubleSide; });
}
function setCorteH(on) {
  CBI.corte = !!on; document.getElementById('cbCorteH').setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) { cbiCarregarBranca(); cbtVista('superior'); state.groupOn.stem = false; syncLayerUI(); cbiMontarCorte(); } else cbiLimparCorte();
  cbiAplicarPlano(); applyVisibility(); applyAppearance(); marca();
}
// troca de nível de detalhe do córtex durante o corte: refaz as passagens com a malha nova
const _pcCbi = placeCamera;
placeCamera = function () { _pcCbi(); if (CBI.corte) { const c = CBS.malhas[cbsNivel(CBS.modo)]; if (CBI.passes.length && CBI.passes[0].userData.fonte !== c) cbiMontarCorte(); else cbiSyncPasses(); } };
// malhas carregadas depois (corpo medular) também recebem o plano
const _visCbi2 = applyVisibility; applyVisibility = function () { _visCbi2(); if (CBI.corte) cbiAplicarPlano(); };

/* --- painel --- */
[['cbTC', 'cortex'], ['cbTB', 'branca'], ['cbTT', 'tronco']].forEach(([id, k]) => {
  const el = document.getElementById(id), out = document.getElementById(id + 'v');
  el.addEventListener('input', () => { CBI.t[k] = +el.value; if (k === 'cortex' && CBI.t.cortex >= 30) cbtMontarFissuras(); out.textContent = el.value + '%'; if (k === 'branca') { CBI.verBranca = true; cbiCarregarBranca(); } applyVisibility(); applyAppearance(); marca(); });
});
document.querySelectorAll('[data-cbnuc]').forEach(b => b.addEventListener('click', () => { CBI.nuc = b.dataset.cbnuc; document.querySelectorAll('[data-cbnuc]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); applyVisibility(); applyAppearance(); marca(); }));
document.getElementById('cbInterp').addEventListener('click', () => setInterp(!CBI.interp));
document.getElementById('cbBranca').addEventListener('click', () => { CBI.verBranca = !CBI.verBranca; document.getElementById('cbBranca').setAttribute('aria-pressed', CBI.verBranca ? 'true' : 'false'); if (!CBI.verBranca) { if (state.sel === 'cb_cbm') select(null); else { applyVisibility(); applyAppearance(); } return; } cbiCarregarBranca(); if (CBI.t.cortex < 60) { CBI.t.cortex = 70; document.getElementById('cbTC').value = 70; document.getElementById('cbTCv').textContent = '70%'; } select('cb_cbm', { focus: false }); });
document.getElementById('cbCorteH').addEventListener('click', () => setCorteH(!CBI.corte));
// ao sair do painel do cerebelo, o corte e as transparências voltam ao normal
const _cbPainelCbi = setCbPainel;
setCbPainel = function (on) { if (!on && CBI.corte) setCorteH(false); _cbPainelCbi(on); };
if (/debug/.test(location.hash)) window.cbiDebug = { CBI, setCorteH, setInterp, cbiMontarCorte };
