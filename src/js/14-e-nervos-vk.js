/* ===== PARES CRANIANOS DO VISIBLE KOREAN =====
   Kim CY, Park JS. Visible Korean male head dataset, Zenodo 2026, doi:10.5281/zenodo.22759852 (CC BY-NC 4.0: uso não
   comercial). Nervos, gânglios, núcleos de III, IV e VI, orelha interna e ossos da base do crânio de uma cabeça real,
   levados ao espaço do atlas por scripts/process/vk_nervos.py (afim pelas estruturas do encéfalo, erro médio 3 mm).
   Modos: "Esquema" (os nervos desenhados do Mímir), "Só nervos" e "Nervo + núcleo + forame" (Visible Korean).
   Forames: contato do nervo com o osso, calculado pelo Mímir; nomes pelo Machado (a conferir). */
M('vk_coclea', 'Cóclea', 'nc', '#f3d27a', 'Parte do labirinto da orelha interna em forma de caracol, com o órgão espiral (de Corti), receptor da audição. Suas fibras formam a parte coclear do nervo vestibulococlear (VIII).', '', '');
M('vk_labirinto', 'Labirinto vestibular (ductos semicirculares, sáculo e utrículo)', 'nc', '#9ad6c8', 'Receptores do equilíbrio: os três ductos semicirculares (anterior, posterior e lateral) e o sáculo e o utrículo. Suas fibras formam a parte vestibular do nervo vestibulococlear (VIII).', '', '');
M('vk_meato_int', 'Meato acústico interno', 'nc', '#c9b48f', 'Canal no osso temporal (parte petrosa) por onde passam o nervo facial (VII), o vestibulococlear (VIII) e a artéria do labirinto.', '', '');
M('vk_ossiculos', 'Ossículos da audição (martelo, bigorna e estribo)', 'nc', '#efe6d0', 'Cadeia de ossículos da orelha média que leva a vibração da membrana timpânica à janela do vestíbulo.', '', '');
[['osso_esfenoide', 'Osso esfenoide'], ['osso_temporal', 'Osso temporal'], ['osso_occipital', 'Osso occipital'], ['osso_etmoide', 'Osso etmoide'], ['osso_frontal', 'Osso frontal']]
  .forEach(([id, nome]) => M(id, nome, 'nc', '#e9dfc6', 'Osso da base do crânio (Visible Korean), mostrado transparente para ver por onde os nervos cranianos saem do crânio.', '', ''));
const VK_NOVOS = ['vk_coclea', 'vk_labirinto', 'vk_meato_int', 'vk_ossiculos', 'osso_esfenoide', 'osso_temporal', 'osso_occipital', 'osso_etmoide', 'osso_frontal'];
REF(VK_NOVOS, 'Forma: Visible Korean male head dataset, Kim CY e Park JS, 2026 (CC BY-NC 4.0, uso não comercial).');
// uma cor por par craniano; os ramos e gânglios ficam com a cor do nervo de origem
const VK_COR_NERVO = { nc1: '#f2c94c', nc2: '#f2994a', nc3: '#eb5757', nc4: '#bb6bd9', nc5: '#2f80ed', nc6: '#56ccf2', nc7: '#27ae60', nc8: '#7fd8a6', nc9: '#e67ec0', nc10: '#d97a2b', nc11: '#a1887f', nc12: '#00bfa5' };
const VK_RAMO = { quiasma: 'nc2', g_trig: 'nc5', n_oft: 'nc5', n_v1ramos: 'nc5', n_max: 'nc5', n_infraorb: 'nc5', n_mand: 'nc5', n_alvinf: 'nc5', n_lingual: 'nc5',
  g_genic: 'nc7', n_petmaior: 'nc7', n_corda: 'nc7', n7_ramos: 'nc7', nu3: 'nc3', nuew: 'nc3', nu4: 'nc4', nu6: 'nc6' };
const VK_NUCLEOS = ['nu3', 'nuew', 'nu4', 'nu6'];
const VK = { modo: 'esquema', carga: null, ids: new Set(), forames: [] };
const vkCor = id => VK_COR_NERVO[id] || VK_COR_NERVO[VK_RAMO[id]] || (META[id] ? META[id].color : '#ffffff');
function vkCarregar() {
  if (VK.carga) return VK.carga;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  const glb = url => new Promise((ok, falha) => cbsLoader.load(url, ok, undefined, falha));
  VK.carga = Promise.all([glb('models/vk_nervos.glb'), glb('models/vk_cranio_base.glb'), fetch('models/vk_forames.json').then(r => r.json())]).then(([gn, go, fj]) => {
    [[gn, false], [go, true]].forEach(([g, osso]) => {
      g.scene.updateMatrixWorld(true);
      g.scene.traverse(o => {
        if (!o.isMesh) return;
        const nome = o.name.includes('__') || META[o.name] ? o.name : ((o.parent && o.parent.name) || ''), id = nome.split('__')[0];
        if (!META[id]) return;
        const mat = osso ? new THREE.MeshStandardMaterial({ color: '#e9dfc6', roughness: 0.7, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })
          : stdMat(vkCor(id), { roughness: 0.45 });
        const m = new THREE.Mesh(cbsGeo(o), mat); m.userData.vk = osso ? 'osso' : (VK_NUCLEOS.includes(id) ? 'nucleo' : 'nervo');
        if (osso) { m.renderOrder = 3; m.userData.op0 = 0.22; }   // a aparência do atlas usa op0 como opacidade de base
        register(id, m, 0); m.userData.base = osso ? '#e9dfc6' : vkCor(id); VK.ids.add(id);
      });
    });
    // marcadores dos forames: um anel por forame e lado, item próprio para o clique e o rótulo
    const anel = new THREE.TorusGeometry(0.14, 0.035, 10, 28);
    fj.forames.forEach(f => {
      const id = 'forame_' + f.forame.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '_');
      if (!META[id]) { M(id, f.forame, 'nc', '#ffd23f', 'Abertura da base do crânio por onde passam: ' + f.nervos.map(n => META[n] ? META[n].name : n).join('; ') + '. Posição: primeiro contato do nervo de referência com o osso no Visible Korean (calculado pelo Mímir).', '', ''); REF([id], 'Posição: Visible Korean (CC BY-NC 4.0) e cálculo do Mímir; nome e nervos: Machado (a conferir, REVISAR.md).'); }
      const m = new THREE.Mesh(anel, stdMat('#ffd23f', { roughness: 0.35, emissive: '#5a4300' }));
      m.position.set(f.posicao[0], f.posicao[1], f.posicao[2]); m.lookAt(0, -2.5, 0); m.userData.vk = 'forame';
      register(id, m, f.lado === 'd' ? -1 : 1); m.userData.base = '#ffd23f'; VK.ids.add(id); VK.forames.push(id);
    });
  });
  return VK.carga;
}
function setNervosModo(modo) {
  VK.modo = modo;
  document.querySelectorAll('[data-vkn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.vkn === modo ? 'true' : 'false'));
  const st = document.getElementById('vkStatus');
  if (modo === 'esquema') { if (st) st.textContent = ''; applyVisibility(); applyAppearance(); return; }
  if (st) st.textContent = 'Carregando os nervos do Visible Korean…';
  vkCarregar().then(() => { if (st) st.textContent = ''; if (!state.groupOn.nc) { state.groupOn.nc = true; syncLayerUI(); } applyVisibility(); applyAppearance(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar os modelos do Visible Korean.'; console.warn(e); setNervosModo('esquema'); });
}
const _visVk = applyVisibility;
applyVisibility = function () {
  _visVk();
  const real = VK.modo !== 'esquema', completo = VK.modo === 'completo';
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.vk) { m.visible = real && m.visible && (u.vk === 'nervo' || completo); return; }
    if (real && VK.ids.has(u.id) && !VK_NOVOS.includes(u.id)) m.visible = false;          // o esquema do mesmo nervo ou núcleo sai
  });
};
// cor por par craniano: a aparência do atlas pinta pela cor do item (o amarelo dos nervos); aqui volta a cor do par
const _apVk = applyAppearance;
applyAppearance = function () {
  _apVk();
  if (VK.modo === 'esquema' || state.territ) return;
  ALLMESH.forEach(m => { const u = m.userData; if (u.vk === 'nervo' || u.vk === 'nucleo') m.material.color.set(vkCor(u.id)); });
};
BOL_FORA.vk_coclea = BOL_FORA.vk_labirinto = BOL_FORA.vk_meato_int = BOL_FORA.vk_ossiculos = 1;
['osso_esfenoide', 'osso_temporal', 'osso_occipital', 'osso_etmoide', 'osso_frontal'].forEach(id => BOL_FORA[id] = 1);
document.querySelectorAll('[data-vkn]').forEach(b => b.addEventListener('click', () => setNervosModo(b.dataset.vkn)));
