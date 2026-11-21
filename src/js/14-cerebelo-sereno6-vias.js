/* ===== CONEXÕES E SÍNDROMES DO CEREBELO (reforma do cerebelo, Fase 5) =====
   Vias cerebelares como tubos no sistema de vias do atlas (grupo "vias"): aferentes em azul e eferentes em vermelho,
   como na fig. 5.5b do Duus, cada uma pelo seu pedúnculo (o trajeto dentro do pedúnculo segue o eixo do próprio tubo
   do pedúnculo do atlas). Lado: o cerebelo esquerdo; as vias cruzadas começam ou terminam do lado direito.
   Modo Lesão: com o cerebelo real, clicar numa divisão funcional mostra a síndrome (Duus, p. 188-191). */
const CBVIA_AZ = '#2f6fdb', CBVIA_VM = '#e0362c';
const CBVIA = [
  ['cbv_ecp', 'Trato espinocerebelar posterior', CBVIA_AZ, 'pci', 'Aferente. Do núcleo torácico (dorsal) da medula, do mesmo lado, sobe no funículo lateral e entra no cerebelo pelo pedúnculo cerebelar inferior; termina no córtex do verme e da zona paravermiana (espinocerebelo). Leva a propriocepção inconsciente dos membros inferiores e do tronco.'],
  ['cbv_oc', 'Fibras olivocerebelares', CBVIA_AZ, 'pci', 'Aferente. Do núcleo olivar inferior do lado oposto: cruzam a linha média no bulbo e entram pelo pedúnculo cerebelar inferior; terminam como fibras trepadeiras em todo o córtex cerebelar.'],
  ['cbv_vc', 'Fibras vestibulocerebelares', CBVIA_AZ, 'pci', 'Aferente. Dos núcleos vestibulares (e do nervo vestibular) pela parte medial do pedúnculo cerebelar inferior (corpo justarrestiforme) até o lobo floculonodular (vestibulocerebelo).'],
  ['cbv_pc', 'Fibras pontocerebelares', CBVIA_AZ, 'pcm', 'Aferente. Dos núcleos pontinos do lado oposto: cruzam na base da ponte e formam o pedúnculo cerebelar médio; terminam no córtex da parte lateral dos hemisférios (cerebrocerebelo). Segundo neurônio da via corticopontocerebelar.'],
  ['cbv_eca', 'Trato espinocerebelar anterior', CBVIA_AZ, 'pcs', 'Aferente. Fibras cruzadas na medula sobem pelo funículo lateral do lado oposto até a parte alta da ponte e entram no cerebelo pelo pedúnculo cerebelar superior, terminando no espinocerebelo; muitas cruzam de novo dentro do cerebelo.'],
  ['cbv_dr', 'Fibras dentatorrubrais', CBVIA_VM, 'pcs', 'Eferente. Do núcleo denteado pelo pedúnculo cerebelar superior; cruzam na decussação dos pedúnculos cerebelares superiores, no mesencéfalo, e terminam no núcleo rubro do lado oposto.'],
  ['cbv_dt', 'Fibras dentatotalâmicas', CBVIA_VM, 'pcs', 'Eferente. Do núcleo denteado pelo pedúnculo cerebelar superior; cruzam na decussação e, passando pelo núcleo rubro, chegam ao núcleo ventral lateral do tálamo do lado oposto, que projeta ao córtex motor (áreas 4 e 6).']];
const CBVIA_PED = { pci: 'pedúnculo cerebelar inferior', pcm: 'pedúnculo cerebelar médio', pcs: 'pedúnculo cerebelar superior' };
CBVIA.forEach(([id, nome, cor, ped, f]) => { M(id, nome, 'vias', cor, f, '', ''); META[id].sin = [CBVIA_PED[ped], cor === CBVIA_AZ ? 'via aferente do cerebelo' : 'via eferente do cerebelo']; META[id].cbvia = { ped, aferente: cor === CBVIA_AZ }; });
REF(CBVIA.map(q => q[0]), 'Duus (Baehr e Frotscher, Diagnóstico Topográfico em Neurologia, 5ª ed.), cap. 5, fig. 5.5b; Machado, Neuroanatomia Funcional, 4ª ed., cap. 22, p. 208-212.');
CBVIA.forEach(q => NOTA(q[0], 'Trajeto esquemático do Mímir sobre as malhas: no pedúnculo segue o eixo do tubo do pedúnculo do atlas; no cerebelo, termina no lóbulo do cerebelo real (Sereno) correspondente. Desenhada para o cerebelo esquerdo.'));
const CBLZ = { on: false, div: null, lado: 1, viasOn: false, tAntes: null, montado: false };

/* --- pontos de referência --- */
function cbviaCentro(id, lado) {   // centro das malhas do item do lado pedido (x > 0 esquerdo, x < 0 direito)
  const b = new THREE.Box3(); let n = 0;
  (ITEMS[id] ? ITEMS[id].meshes : []).forEach(m => { if (m.userData.suit || m.userData.secao || m.userData.cbiSag) return; const q = new THREE.Box3().setFromObject(m), c = q.getCenter(new THREE.Vector3()); if (lado && Math.sign(c.x) !== lado && Math.abs(c.x) > 0.15) return; b.union(q); n++; });
  return n ? b.getCenter(new THREE.Vector3()).toArray() : null;
}
function cbviaLobulo(L, lado, ax0, ax1) {   // centro dos vértices de um lóbulo do cerebelo real, numa faixa de |x|
  const m = CBS.malhas.folhas || CBS.malhas.leve || CBS.malhas.estudo; if (!m) return null;
  const Lb = m.geometry.userData.lobulo, P = m.geometry.attributes.position.array; let s = [0, 0, 0], n = 0;
  for (let i = 0; i < Lb.length; i += 3) { if (Lb[i] !== L) continue; const x = P[i * 3]; if (Math.sign(x) !== lado && Math.abs(x) > 0.1) continue; if (Math.abs(x) < (ax0 || 0) || Math.abs(x) > (ax1 || 99)) continue; s[0] += x; s[1] += P[i * 3 + 1]; s[2] += P[i * 3 + 2]; n++; }
  return n ? s.map(v => v / n) : null;
}
// eixo de um pedúnculo (tubo do atlas) do lado pedido, do tronco para o cerebelo
function cbviaEixo(ped, lado) {
  const pts = [], v = new THREE.Vector3();
  ITEMS[ped].meshes.forEach(m => { if (!m.userData.tuboPed) return; m.updateMatrixWorld(true); const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); if (Math.sign(v.x) === lado) pts.push(v.clone()); } });
  if (pts.length < 10) return [];
  const c = pts.reduce((a, q) => a.add(q), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  let d = new THREE.Vector3(1, 0.3, -0.5).normalize();
  for (let it = 0; it < 20; it++) { const nd = new THREE.Vector3(); pts.forEach(q => { const r = q.clone().sub(c); nd.addScaledVector(r, r.dot(d)); }); d = nd.normalize(); }   // eixo principal
  const t = pts.map(q => q.clone().sub(c).dot(d)), t0 = Math.min(...t), t1 = Math.max(...t), nb = 6, bins = Array.from({ length: nb }, () => [new THREE.Vector3(), 0]);
  pts.forEach((q, i) => { const k = Math.min(nb - 1, Math.floor((t[i] - t0) / (t1 - t0 + 1e-6) * nb)); bins[k][0].add(q); bins[k][1]++; });
  let eixo = bins.filter(b => b[1]).map(b => b[0].multiplyScalar(1 / b[1]).toArray());
  const cb = [lado * 2.2, -3.2, -5.2];   // ponta do lado do cerebelo por último
  const dist = q => Math.hypot(q[0] - cb[0], q[1] - cb[1], q[2] - cb[2]);
  if (dist(eixo[0]) < dist(eixo[eixo.length - 1])) eixo.reverse();
  return eixo;
}

/* --- montagem dos tubos (depois que o cerebelo real e os núcleos existem) --- */
function cbviaMontar() {
  if (CBLZ.montado || !(CBS.malhas.folhas || CBS.malhas.leve)) return false;
  const E = 1, D = -1, pci = cbviaEixo('pci', E), pcm = cbviaEixo('pcm', E), pcs = cbviaEixo('pcs', E);
  if (!pci.length || !pcm.length || !pcs.length) return false;
  const oliD = cbviaCentro('nuoliva', D), oliE = cbviaCentro('nuoliva', E), rubD = cbviaCentro('rubro', D), vlD = cbviaCentro('tal_vl', D) || cbviaCentro('talamo', D), pontD = cbviaCentro('nupont', D) || [-0.45, B(14, 0, 0.7)[1], B(14, 0, 0.7)[2]];
  const dent = cbviaCentro('denteado', E) || [1.75, -3.0, -4.75];
  const lob = (L, a, b) => cbviaLobulo(L, E, a, b);
  const culmenPV = lob('cb_culmen', 0, 1.3) || lob('cb_quadant', 1.3, 2.3), quadant = lob('cb_quadant', 1.3, 2.3), quadpost = lob('cb_quadpost', 2, 9), semisup = lob('cb_semisup', 2.3, 9), semiinf = lob('cb_semiinf', 2.3, 9), nod = cbviaLobulo('cb_nodulo', E, 0, 1.3) || NODULO, floc = lob('cb_floculo') || FLOC;
  const dentro = (p, k) => [p[0] * (1 - k), p[1] + (-3.0 - p[1]) * k, p[2] + (-4.6 - p[2]) * k];   // leva o centro do lóbulo um pouco para o corpo medular (as fibras chegam por dentro)
  const t = (id, pts, r) => { pts = pts.filter(Boolean); tube(id, pts, r, r, { mid: true, seg: Math.max(40, pts.length * 14), rad: 8 }); (VIAC[id] = VIAC[id] || []).push(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5)); };
  const ped = (eixo, k0, k1) => eixo.slice(k0, k1);
  // aferentes pelo pedúnculo inferior
  t('cbv_ecp', [BE(34, 0.65, 0.85), B(29, 0.85, 0.95), B(25, 1.0, 1.25)].concat(ped(pci, 0), [dentro(culmenPV, 0.25), culmenPV]), 0.045);
  t('cbv_oc', [oliD, [-0.3, oliD[1] + 0.05, oliD[2] - 0.25], [0.3, oliD[1] + 0.1, oliD[2] - 0.35], oliE ? [oliE[0], oliE[1] + 0.15, oliE[2] - 0.3] : null].concat(ped(pci, 0), [dentro(semiinf, 0.3), semiinf]), 0.04);
  t('cbv_oc', [pci[pci.length - 1], dentro(quadpost, 0.35), quadpost], 0.03);   // ramo para o hemisfério anterior: fibras trepadeiras em todo o córtex
  t('cbv_vc', [NVEST, B(22.5, 1.05, F(22.5) + 0.25)].concat(ped(pci, Math.floor(pci.length / 2)), [dentro(nod, 0.2), nod]), 0.04);
  t('cbv_vc', [pci[pci.length - 1], floc], 0.03);
  // aferente pelo pedúnculo médio (cruzada na base da ponte)
  t('cbv_pc', [pontD, B(14.5, 0, 0.8), B(14, 0.5, 0.75)].concat(ped(pcm, 0), [dentro(semisup, 0.3), semisup]), 0.055);
  // aferente pelo pedúnculo superior (cruzada na medula)
  t('cbv_eca', [BE(34, -0.65, 0.7), BE(31.5, 0, 0.6), BE(30, 0.6, 0.75), B(24, 0.95, 1.05), B(16, 1.05, 1.35), B(10, 0.9, 1.6)].concat(ped(pcs, 0), [dentro(quadant || culmenPV, 0.25), quadant || culmenPV]), 0.04);
  // eferentes pelo pedúnculo superior, cruzando na decussação (mesencéfalo inferior)
  const sup = pcs.slice().reverse(), dec = B(6.5, 0, 1.55);
  t('cbv_dr', [dent].concat(sup, [B(7.5, 0.45, 1.6), dec, B(5.5, -0.4, 1.4), rubD]), 0.05);
  t('cbv_dt', [[dent[0], dent[1] + 0.12, dent[2]]].concat(sup.map(q => [q[0], q[1] + 0.1, q[2]]), [B(7.5, 0.45, 1.75), [dec[0], dec[1] + 0.1, dec[2]], B(5.5, -0.45, 1.6), rubD ? [rubD[0] - 0.1, rubD[1] + 0.25, rubD[2] + 0.05] : null, vlD]), 0.045);
  CBVIA.forEach(([id]) => (ITEMS[id] ? ITEMS[id].meshes : []).forEach(m => { m.userData.semBolacha = true; m.userData.cbvia = true; }));
  // setas animadas no sentido da condução (o sistema de setas do atlas é montado uma vez, na carga)
  if (SETAS.length) { const g = SETAS[0].m.geometry, mat = SETAS[0].m.material; CBVIA.forEach(([id]) => (VIAC[id] || []).forEach(c => { const n = Math.max(1, Math.round(c.getLength() / 1.6)); for (let i = 0; i < n; i++) { const m = new THREE.Mesh(g, mat); m.renderOrder = 4; setaGrp.add(m); SETAS.push({ id, c, m, u: i / n }); } })); }
  CBLZ.montado = true; applyVisibility(); applyAppearance(); marca(); return true;
}

// setas só das vias que estão à vista
const _setasCbvia = stepSetas;
stepSetas = function (dt) { _setasCbvia(dt); if (!setaGrp.visible) return; const vis = {}; SETAS.forEach(q => { if (!q.m.visible) return; if (!(q.id in vis)) vis[q.id] = !!ITEMS[q.id] && ITEMS[q.id].meshes.some(m => m.visible && m.parent && m.parent.visible); if (!vis[q.id]) q.m.visible = false; }); };
/* --- mostrar as vias no painel do cerebelo --- */
function setCbVias(on) {
  CBLZ.viasOn = !!on; document.getElementById('cbVias').setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) {
    const tenta = () => { if (!CBLZ.viasOn) return; if (!cbviaMontar() && !CBLZ.montado) return setTimeout(tenta, 400); state.groupOn.vias = true; state.groupOn.stem = true; state.groupOn.ped = true; state.groupOn.dien = true; syncLayerUI();
      if (CBI.t.cortex < 60) { CBLZ.tAntes = CBI.t.cortex; CBI.t.cortex = 75; const el = document.getElementById('cbTC'); el.value = 75; document.getElementById('cbTCv').textContent = '75%'; }
      if (CBI.t.tronco < 60) { CBLZ.tTronco = CBI.t.tronco; CBI.t.tronco = 70; const el = document.getElementById('cbTT'); el.value = 70; document.getElementById('cbTTv').textContent = '70%'; }
      camGoal.theta = Math.PI / 2 + 0.45; camGoal.phi = Math.PI / 2 - 0.12; camGoal.dist = 14; camGoal.target.set(0.6, -2.8, -3.0);   // vista lateral, um pouco de trás: os três pedúnculos e o cruzamento das vias
      applyVisibility(); applyAppearance(); marca(); };
    tenta();
  } else {
    if (CBLZ.tAntes !== null) { CBI.t.cortex = CBLZ.tAntes; document.getElementById('cbTC').value = CBLZ.tAntes; document.getElementById('cbTCv').textContent = CBLZ.tAntes + '%'; CBLZ.tAntes = null; }
    if (CBLZ.tTronco !== undefined && CBLZ.tTronco !== null) { CBI.t.tronco = CBLZ.tTronco; document.getElementById('cbTT').value = CBLZ.tTronco; document.getElementById('cbTTv').textContent = CBLZ.tTronco + '%'; CBLZ.tTronco = null; }
    applyVisibility(); applyAppearance(); marca();
  }
  cbviaLegenda();
}
// tálamo translúcido nas vias (é só o destino da via dentatotalâmica)
const _apCbvia = applyAppearance;
applyAppearance = function () { _apCbvia(); if (!(CBT.painel && CBLZ.viasOn)) return; ALLMESH.forEach(m => { if (/^(talamo|tal_vl)$/.test(m.userData.id) && state.sel !== m.userData.id) { m.material.opacity = Math.min(m.material.opacity, 0.3); } if ((m.userData.tuboPed || m.userData.id === 'veusup') && !CBVIA.some(q => q[0] === state.sel) && state.sel !== m.userData.id) m.material.opacity = Math.min(m.material.opacity, 0.22); /* pedúnculos translúcidos: as vias passam por dentro */ }); };
const _visCbvia = applyVisibility;
applyVisibility = function () {
  _visCbvia();
  ALLMESH.forEach(m => {
    const u = m.userData, g = META[u.id] && META[u.id].grp;
    if (u.cbvia) m.visible = m.visible && (!CBT.painel || CBLZ.viasOn);
    else if (CBT.painel && CBLZ.viasOn && g === 'vias') m.visible = false;                        // no painel: só as vias do cerebelo
    else if (CBT.painel && CBLZ.viasOn && g === 'dien' && !/^(talamo|tal_vl)$/.test(u.id)) m.visible = false;   // do diencéfalo, só o tálamo (destino da via dentatotalâmica)
  });
};
function cbviaLegenda() {
  const el = document.getElementById('cbViasLeg'); if (!el) return;
  if (!CBLZ.viasOn) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = '<div class="lin"><i style="background:' + CBVIA_AZ + '"></i>Aferentes <i style="background:' + CBVIA_VM + ';margin-left:8px"></i>Eferentes <span class="muted">(Duus, fig. 5.5b)</span></div>' +
    ['pci', 'pcm', 'pcs'].map(p => '<div class="lin"><b>' + CBVIA_PED[p].replace('pedúnculo cerebelar ', 'Pedúnculo ') + ':</b> ' + CBVIA.filter(q => q[3] === p).map(q => '<button type="button" data-cbvia="' + q[0] + '" style="border-color:' + q[2] + '">' + esc(q[1]) + '</button>').join(' ') + '</div>').join('');
  el.querySelectorAll('[data-cbvia]').forEach(b => b.addEventListener('click', () => select(b.dataset.cbvia, { focus: false })));
}
// rótulos das vias (no meio de cada trajeto) no sistema de rótulos do painel
(CBT.ganchos = CBT.ganchos || []).push(lista => { if (!CBLZ.viasOn) return; CBVIA.forEach(([id]) => { const c = VIAC[id] && VIAC[id][0]; if (c && ITEMS[id].meshes.some(m => m.visible)) lista.push({ id, p: c.getPointAt(0.62), n: null, pri: 3 }); }); ['pci', 'pcm', 'pcs'].forEach(p => { const e = CBLZ.montado && cbviaEixo(p, 1); if (e && e.length) lista.push({ id: p, p: new THREE.Vector3(...e[Math.floor(e.length / 2)]), n: null, pri: 3 }); }); });

/* --- modo Lesão: síndrome por divisão funcional (Duus, p. 188-191) --- */
const CBLZ_SIND = {
  vestibulocerebelo: { nome: 'Lesão do vestibulocerebelo (lobo floculonodular)', sinais: ['Desequilíbrio', 'Ataxia de tronco (ao sentar e ficar de pé)', 'Nistagmo'], obs: 'Típica de tumores do teto do IV ventrículo (meduloblastoma na criança), que comprimem o nódulo.' },
  espinocerebelo: { nome: 'Lesão do espinocerebelo (verme e zona paravermiana)', sinais: ['Ataxia de marcha', 'Ataxia de postura (instabilidade ao ficar de pé)'], obs: 'A lesão do lobo anterior (por exemplo, por álcool) atinge sobretudo a marcha e os membros inferiores.' },
  cerebrocerebelo: { nome: 'Lesão do cerebrocerebelo (parte lateral do hemisfério)', sinais: ['Dismetria', 'Disdiadococinesia', 'Tremor de intenção', 'Disartria (fala escandida)'], obs: 'Os sinais dos membros aparecem do mesmo lado da lesão.' } };
const CBLZ_DIV = { vestibulo: 'vestibulocerebelo', verme: 'espinocerebelo', paraverme: 'espinocerebelo', lateral: 'cerebrocerebelo' };
function setLesao(on) {
  CBLZ.on = !!on; CBLZ.div = null; document.getElementById('cbLesao').setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) { if (CBS.modo === 'atlas') setCerebeloModo('lobos'); setColorir('funcional'); document.getElementById('cbficha').innerHTML = '<div class="lin cab"><b>Modo lesão</b><button type="button" class="x" aria-label="Fechar">×</button></div><div class="lin">Clique numa divisão funcional do cerebelo para ver a síndrome.</div>'; document.getElementById('cbficha').hidden = false; document.querySelector('#cbficha .x').addEventListener('click', () => setLesao(false)); }
  else document.getElementById('cbficha').hidden = true;
  applyAppearance(); marca();
}
function cblMostrar(div, lado) {
  CBLZ.div = div; CBLZ.lado = lado; const s = CBLZ_SIND[div], el = document.getElementById('cbficha');
  el.innerHTML = '<div class="lin cab"><b>' + esc(s.nome) + '</b><button type="button" class="x" aria-label="Fechar">×</button></div>' +
    '<div class="lin"><span class="k">Lado:</span> ' + (div === 'vestibulocerebelo' ? 'linha média e flóculos' : (lado > 0 ? 'esquerdo' : 'direito')) + '</div>' +
    '<div class="lin"><span class="k">Sinais:</span></div>' + s.sinais.map(q => '<div class="lin">• ' + esc(q) + '</div>').join('') +
    '<div class="lin desc">' + esc(s.obs) + '</div><div class="lin muted">Duus, Diagnóstico Topográfico em Neurologia, 5ª ed., cap. 5, p. 188-191.</div>';
  el.hidden = false; el.querySelector('.x').addEventListener('click', () => setLesao(false));
  applyAppearance(); marca();
}
// cor: a divisão lesada em vermelho-escuro, o resto apagado
const _corChaveCbl = cbsCorChave; cbsCorChave = function () { return _corChaveCbl() + '|' + (CBLZ.on ? (CBLZ.div || '-') + CBLZ.lado : ''); };
const _aplCbl = cbsAplicarCores;
cbsAplicarCores = function (m, lobos) {
  _aplCbl(m, lobos);
  if (!CBLZ.on || !CBLZ.div) return;
  const g = m.geometry, A = g.attributes.color.array, L = g.userData.lobulo, Lo = g.userData.lobo, X = g.userData.x;
  for (let i = 0; i < L.length; i++) {
    const k = i * 3, z = cbsZona(L[i], Lo[i], Math.abs(X[i])), div = CBLZ_DIV[z], lesado = div === CBLZ.div && (div === 'vestibulocerebelo' || z === 'verme' || Math.sign(X[i]) === CBLZ.lado);
    if (lesado) { A[k] = 0.55 + A[k] * 0.2; A[k + 1] = 0.08 + A[k + 1] * 0.1; A[k + 2] = 0.1 + A[k + 2] * 0.1; }
    else { const y = A[k] * 0.3 + A[k + 1] * 0.59 + A[k + 2] * 0.11, v = 0.3 + y * 0.3; A[k] = A[k] * 0.25 + v * 0.75; A[k + 1] = A[k + 1] * 0.25 + v * 0.75; A[k + 2] = A[k + 2] * 0.25 + v * 0.75; }
  }
  g.attributes.color.needsUpdate = true; m.userData.corModo = cbsCorChave();
};
const _pickCbl = pick;
pick = function (e) {
  if (CBLZ.on && !(state.quiz && !state.quiz.revealed)) {
    const h = rayAt(e);
    if (h && h.id === 'cb_sereno' && h.face) { const g = h.mesh.geometry, i = h.face.a, z = cbsZona(g.userData.lobulo[i], g.userData.lobo[i], Math.abs(g.userData.x[i])); cblMostrar(CBLZ_DIV[z], Math.sign(g.userData.x[i]) || 1); return; }
  }
  return _pickCbl(e);
};
document.getElementById('cbVias').addEventListener('click', () => setCbVias(!CBLZ.viasOn));
document.getElementById('cbLesao').addEventListener('click', () => setLesao(!CBLZ.on));
const _cbPainelCbl = setCbPainel; setCbPainel = function (on) { if (!on) { if (CBLZ.on) setLesao(false); if (CBLZ.viasOn) setCbVias(false); } _cbPainelCbl(on); };
// as vias também ficam disponíveis fora do painel (camada Grandes vias), assim que o cerebelo real carrega
const _cbmVia = setCerebeloModo; setCerebeloModo = function (modo, inicial) { _cbmVia(modo, inicial); setTimeout(() => cbviaMontar(), 1500); };
if (/debug/.test(location.hash)) window.cbviaDebug = { CBLZ, cbviaMontar, setCbVias, setLesao, cblMostrar, cbviaEixo };
