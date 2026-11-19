/* ===== GRANDES VIAS DO ATLAS HCP1065 =====
   Yeh FC, Nat Commun 2022;13:4933 (atlas HCP1065, CC BY-SA 4.0; dados do Human Connectome Project). Superfícies dos
   feixes de fibras (média de 1065 pessoas), feitas por scripts/process/hcp_vias.py e levadas ao atlas pela afim do MNI.
   Modo "HCP1065": os feixes reais aparecem; os esquemas das mesmas vias (corticospinal, corticonuclear, lemnisco
   medial, vias óptica e auditiva) ficam transparentes, como complemento onde a tratografia não chega (decussação das
   pirâmides, medula, relés). Cores: vias descendentes em tons quentes, ascendentes em tons frios. */
const HCP_ITENS = {
  hcp_corticopontino: ['Tratos corticopontinos (frontopontino, parietopontino e occipitopontino)', '#e0702c', 'Fibras do córtex frontal, parietal e occipital que descem pela cápsula interna e pela base do pedúnculo cerebral até os núcleos da ponte; dali a via segue ao cerebelo pelo pedúnculo cerebelar médio.'],
  hcp_reticular: ['Trato reticular (reticulospinal)', '#d65fa0', 'Fibras descendentes da formação reticular do tronco encefálico.'],
  hcp_dentatorubrotalamico: ['Trato dentatorrubrotalâmico', '#c9a26b', 'Fibras do núcleo denteado que saem pelo pedúnculo cerebelar superior, cruzam na decussação dos pedúnculos e vão ao núcleo rubro e ao tálamo do lado oposto (há também um contingente que não cruza).'],
  hcp_pcs: ['Pedúnculo cerebelar superior (fibras)', '#d9b27a', 'Feixe de fibras que liga o cerebelo ao mesencéfalo; principal via eferente do cerebelo.'],
  hcp_pcm: ['Pedúnculo cerebelar médio (fibras pontocerebelares)', '#b8742a', 'Fibras dos núcleos da ponte que cruzam a linha média e entram no cerebelo do lado oposto.'],
  hcp_pci: ['Pedúnculo cerebelar inferior (fibras)', '#e3c08a', 'Feixe que liga o bulbo ao cerebelo, com fibras aferentes (espinocerebelar posterior, olivocerebelares).'],
  hcp_rad_talamica_ant: ['Radiação talâmica anterior', '#5aa9e6', 'Fibras entre o tálamo e o córtex do lobo frontal, pela perna anterior da cápsula interna.'],
  hcp_rad_talamica_sup: ['Radiação talâmica superior', '#3f8fe0', 'Fibras entre o tálamo e o córtex dos giros pré e pós-central, pela perna posterior da cápsula interna.'],
  hcp_rad_talamica_post: ['Radiação talâmica posterior', '#7fb6ef', 'Fibras entre o tálamo e o córtex parietal e occipital.'],
  hcp_cc_forceps_menor: ['Corpo caloso: fórceps menor (joelho)', '#efe8d6', 'Fibras do joelho do corpo caloso que unem os lobos frontais.'],
  hcp_cc_corpo: ['Corpo caloso: fibras do tronco', '#e6dcc4', 'Fibras do tronco do corpo caloso que unem as áreas homólogas dos dois hemisférios.'],
  hcp_cc_forceps_maior: ['Corpo caloso: fórceps maior (esplênio)', '#f3ecdc', 'Fibras do esplênio do corpo caloso que unem os lobos occipitais.'],
  hcp_cc_tapete: ['Corpo caloso: tapete', '#d9cfb6', 'Fibras do corpo caloso que formam o teto e a parede lateral do corno posterior e inferior do ventrículo lateral.'],
  hcp_com_anterior: ['Comissura anterior (fibras)', '#c7b98f', 'Fibras que cruzam a linha média na comissura anterior, unindo partes dos lobos temporais e as vias olfatórias.'],
  hcp_fornix: ['Fórnice (fibras)', '#b48ad6', 'Feixe de fibras do hipocampo ao corpo mamilar e à área septal.'],
  hcp_cingulo: ['Cíngulo', '#9b7ccf', 'Feixe de associação dentro do giro do cíngulo, do lobo frontal ao giro para-hipocampal.'],
  hcp_fls: ['Fascículo longitudinal superior', '#4fae6a', 'Feixe de associação longo que liga os lobos frontal, parietal e occipital.'],
  hcp_arqueado: ['Fascículo arqueado', '#2f8f5b', 'Feixe de associação que contorna o sulco lateral e liga a área de Broca à área de Wernicke.'],
  hcp_fli: ['Fascículo longitudinal inferior', '#7bbf5a', 'Feixe de associação entre o lobo occipital e o lobo temporal.'],
  hcp_flmedio: ['Fascículo longitudinal médio', '#98c96f', 'Feixe de associação no giro temporal superior.'],
  hcp_ffoi: ['Fascículo fronto-occipital inferior', '#5fb8a0', 'Feixe de associação do lobo frontal ao occipital, passando pela cápsula extrema.'],
  hcp_uncinado: ['Fascículo uncinado', '#3fa38c', 'Feixe de associação em forma de gancho entre o lobo frontal (orbital) e o polo temporal.'],
  hcp_capsula_extrema: ['Cápsula extrema (fibras)', '#6fb0a0', 'Fibras de associação entre o claustro e o córtex da ínsula.'],
  hcp_fpm: ['Feixe prosencefálico medial', '#e0608c', 'Feixe que atravessa o hipotálamo lateral, ligando a área septal, o hipotálamo e o tegmento do mesencéfalo.'],
  hcp_corticoestriatal: ['Fibras corticoestriatais', '#6d86d8', 'Fibras do córtex para o corpo estriado (caudado e putâmen).'],
  hcp_alcas_nb: ['Alça e fascículo lenticular, alça e fascículo subtalâmico', '#3d63c9', 'Fibras do globo pálido para o tálamo (alça e fascículo lenticular) e entre o pálido e o núcleo subtalâmico.'],
};
Object.entries(HCP_ITENS).forEach(([id, [nome, cor, f]]) => M(id, nome, 'vias', cor, f, '', ''));
REF(Object.keys(HCP_ITENS), 'Feixe: atlas HCP1065, Yeh FC, Nat Commun 2022 (CC BY-SA 4.0), dados do Human Connectome Project. Texto: a conferir no Machado (REVISAR.md).');
// cor dos feixes reais das vias que já existem no atlas: descendentes quentes, ascendentes frias
const HCP_COR = { v_cs: '#d23c3c', v_cn: '#f08a6a', v_lm: '#3f8fe0', v_opt: '#7fb6ef', v_aud: '#22a6b8' };
const HCP_ESQ = Object.keys(HCP_COR);
const HCP = { modo: 'esquema', carga: null };
function hcpCarregar() {
  if (HCP.carga) return HCP.carga;
  // fibras como linhas (models/hcp_fibras.bin: int16 x, y, z em 1/escala cm; hcp_fibras.json: fibras de cada item e lado)
  HCP.carga = Promise.all([fetch('models/hcp_fibras.json').then(r => r.json()), fetch('models/hcp_fibras.bin').then(r => r.arrayBuffer())]).then(([ix, buf]) => {
    const Q = new Int16Array(buf), k = 1 / ix.escala;
    let semente = 7; const sorteio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    ix.grupos.forEach(g => {
      if (!META[g.item]) return;
      let n = 0; g.fibras.forEach(([, c]) => n += (c - 1) * 2);
      const P = new Float32Array(n * 3), C = new Float32Array(n * 3); let w = 0;
      g.fibras.forEach(([a, c]) => {
        const tom = 0.72 + 0.45 * sorteio();                      // cada fibra num tom: dá volume ao feixe sem custo de geometria
        for (let i = a; i < a + c - 1; i++) for (const j of [i, i + 1]) { P[w] = Q[j * 3] * k; P[w + 1] = Q[j * 3 + 1] * k; P[w + 2] = Q[j * 3 + 2] * k; C[w] = C[w + 1] = C[w + 2] = tom; w += 3; }
      });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
      geo.computeBoundingSphere();
      const mat = new THREE.LineBasicMaterial({ color: HCP_COR[g.item] || META[g.item].color, vertexColors: true, transparent: true, opacity: 0.9 });
      mat.emissive = new THREE.Color(0); mat.emissiveIntensity = 0;   // a aparência do atlas mexe no brilho de todo material
      const m = new THREE.LineSegments(geo, mat);
      m.userData.hcp = true; m.userData.semBolacha = true;
      register(g.item, m, g.lado === 'r' ? -1 : (g.lado === 'l' ? 1 : 0)); m.userData.base = HCP_COR[g.item] || META[g.item].color;
    });
  });
  if (typeof ray !== 'undefined' && ray.params && ray.params.Line) ray.params.Line.threshold = 0.06;   // clique a menos de 0,6 mm da fibra
  return HCP.carga;
}
function setViasModo(modo) {
  HCP.modo = modo;
  document.querySelectorAll('[data-hcp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.hcp === modo ? 'true' : 'false'));
  const st = document.getElementById('hcpStatus');
  if (modo === 'esquema') { if (st) st.textContent = ''; applyVisibility(); applyAppearance(); return; }
  if (st) st.textContent = 'Carregando as vias do HCP1065…';
  hcpCarregar().then(() => { if (st) st.textContent = ''; if (!state.groupOn.vias) { state.groupOn.vias = true; syncLayerUI(); } applyVisibility(); applyAppearance(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar models/hcp_vias.glb.'; console.warn(e); setViasModo('esquema'); });
}
const _visHcp = applyVisibility;
applyVisibility = function () {
  _visHcp();
  const real = HCP.modo === 'hcp';
  ALLMESH.forEach(m => { if (m.userData.hcp) m.visible = real && m.visible; });
};
const _apHcp = applyAppearance;
applyAppearance = function () {
  _apHcp();
  if (HCP.modo !== 'hcp') return;
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.hcp) { if (HCP_COR[u.id] && !state.territ) m.material.color.set(HCP_COR[u.id]); return; }
    if (HCP_ESQ.includes(u.id)) { m.material.opacity = Math.min(m.material.opacity, 0.3); m.material.depthWrite = false; }   // o esquema fica como complemento
  });
};
Object.keys(HCP_ITENS).forEach(id => BOL_FORA[id] = 1);
document.querySelectorAll('[data-hcp]').forEach(b => b.addEventListener('click', () => setViasModo(b.dataset.hcp)));
// ---- filtros por tipo de fibra e legenda ----
const HCP_TIPOS = [
  ['projecao', 'Projeção', '#d23c3c', ['v_cs', 'v_cn', 'hcp_corticopontino', 'hcp_reticular', 'v_lm', 'v_opt', 'v_aud', 'hcp_rad_talamica_ant', 'hcp_rad_talamica_sup', 'hcp_rad_talamica_post']],
  ['comissura', 'Comissuras', '#e6dcc4', ['hcp_cc_forceps_menor', 'hcp_cc_corpo', 'hcp_cc_forceps_maior', 'hcp_cc_tapete', 'hcp_com_anterior']],
  ['associacao', 'Associação', '#4fae6a', ['hcp_fls', 'hcp_arqueado', 'hcp_fli', 'hcp_flmedio', 'hcp_ffoi', 'hcp_uncinado', 'hcp_capsula_extrema']],
  ['limbico', 'Límbicas', '#9b7ccf', ['hcp_fornix', 'hcp_cingulo', 'hcp_fpm']],
  ['cerebelo', 'Cerebelares', '#c9a26b', ['hcp_pcs', 'hcp_pcm', 'hcp_pci', 'hcp_dentatorubrotalamico']],
  ['nb', 'Núcleos da base', '#3d63c9', ['hcp_corticoestriatal', 'hcp_alcas_nb']],
];
const HCP_TIPO_DE = {}; HCP_TIPOS.forEach(([t, , , ids]) => ids.forEach(id => HCP_TIPO_DE[id] = t));
HCP.tipos = new Set(HCP_TIPOS.map(t => t[0]));
(function () {
  const seg = document.getElementById('hcpSeg'); if (!seg) return;
  const linha = document.createElement('div'); linha.id = 'hcpTipos'; linha.className = 'hcptipos'; linha.hidden = true;
  linha.innerHTML = HCP_TIPOS.map(([t, nome, cor]) => `<button type="button" data-hcpt="${t}" aria-pressed="true"><i style="background:${cor}"></i>${nome}</button>`).join('');
  seg.closest('.row').after(linha);
  linha.querySelectorAll('[data-hcpt]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.hcpt; HCP.tipos.has(t) ? HCP.tipos.delete(t) : HCP.tipos.add(t);
    b.setAttribute('aria-pressed', HCP.tipos.has(t) ? 'true' : 'false'); applyVisibility(); applyAppearance(); marca();
  }));
})();
const _svmHcp = setViasModo;
setViasModo = function (modo) { _svmHcp(modo); const l = document.getElementById('hcpTipos'); if (l) l.hidden = modo !== 'hcp'; };
const _visHcp2 = applyVisibility;
applyVisibility = function () {
  _visHcp2();
  if (HCP.modo !== 'hcp') return;
  ALLMESH.forEach(m => { if (m.userData.hcp && m.visible && !HCP.tipos.has(HCP_TIPO_DE[m.userData.id])) m.visible = false; });
};
// ---- modo via: ao escolher uma via, o trajeto inteiro aparece com os relés acesos (o resto fica apagado) ----
const HCP_RELES = {
  v_cs: ['gpre', 'capsint', 'pedunc', 'baseponte', 'piramide', 'decpir'],
  v_cn: ['gpre', 'capsint', 'pedunc', 'nu7', 'nu12', 'numot5', 'nuamb'],
  hcp_corticopontino: ['capsint', 'pedunc', 'baseponte', 'nupont', 'hcp_pcm'],
  v_lm: ['nugrac', 'nucun', 'talamo', 'gpos'],
  v_opt: ['quiasma', 'cgl', 'gcalc'],
  v_aud: ['colinf', 'cgm', 'gtt'],
  hcp_dentatorubrotalamico: ['denteado', 'rubro', 'talamo', 'hcp_pcs'],
  hcp_pcm: ['nupont', 'baseponte'],
  hcp_rad_talamica_ant: ['talamo', 'capsint'], hcp_rad_talamica_sup: ['talamo', 'capsint', 'gpre', 'gpos'], hcp_rad_talamica_post: ['talamo'],
  hcp_fornix: ['hipo_corpo', 'mamilar', 'septo'],
  hcp_cingulo: ['gcing'],
};
const _selHcp = select;
select = function (id, opt) {
  _selHcp(id, opt);
  if (HCP.modo !== 'hcp') { if (HCP.isoAuto) { HCP.isoAuto = false; state.isolate = false; const c = document.getElementById('iso'); if (c) c.checked = false; applyAppearance(); } return; }
  const reles = HCP_RELES[id];
  if (reles) {
    state.realce = Object.fromEntries(reles.filter(r => META[r]).map(r => [r, 1]));
    if (!state.isolate) { HCP.isoAuto = true; state.isolate = true; const c = document.getElementById('iso'); if (c) c.checked = true; }
    applyAppearance(); marca();
  } else if (HCP.isoAuto) { HCP.isoAuto = false; state.isolate = false; const c = document.getElementById('iso'); if (c) c.checked = false; applyAppearance(); }
};
