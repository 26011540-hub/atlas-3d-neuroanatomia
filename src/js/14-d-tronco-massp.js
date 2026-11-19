/* ===== NÚCLEOS DO TRONCO DO MASSP 2.0 =====
   Bazin PL, Forstmann BU, Alkemade A, Miletic S. MASSP 2.0 Lifespan Probabilistic Atlas, 2024 (CC BY 4.0):
   compartimento mais provável em 97 pessoas de 18 a 80 anos, levado do MNI2009b ao espaço do atlas por
   scripts/process/mni_para_mimir.py (afim pelas estruturas subcorticais) e scripts/process/massp_nucleos.py.
   Modo "MASSP": as malhas reais substituem os esquemas do Mímir dos mesmos núcleos; os núcleos novos
   (área tegmentar ventral, substância cinzenta periaquedutal, pedunculopontino, habenular lateral, rafe) só existem nele.
   Os núcleos dos nervos cranianos continuam sendo esquemas do Mímir (o MASSP não os tem). */
M('massp_atv', 'Área tegmentar ventral', 'stem', '#e0b33c', 'Grupo de neurônios dopaminérgicos no tegmento do mesencéfalo, medial à substância negra. É a origem das vias dopaminérgicas mesolímbica e mesocortical.', '', '');
M('massp_scp', 'Substância cinzenta periaquedutal', 'stem', '#7fb6d8', 'Substância cinzenta que envolve o aqueduto do mesencéfalo. Participa da modulação da dor (via descendente analgésica) e de respostas de defesa.', '', '');
M('massp_ppn', 'Núcleo pedunculopontino', 'stem', '#a77fd6', 'Núcleo do tegmento na transição entre o mesencéfalo e a ponte, junto ao pedúnculo cerebelar superior. Tem neurônios colinérgicos e participa do controle da marcha e do sono.', '', '');
M('massp_habl', 'Núcleo habenular lateral', 'dien', '#e5a3b3', 'Núcleo do epitálamo, no trígono das habênulas. Recebe pela estria medular e projeta ao mesencéfalo pelo fascículo retroflexo.', '', '');
M('massp_rafe_d', 'Núcleo dorsal da rafe', 'stem', '#f2f2f2', 'Núcleo serotoninérgico na linha média do tegmento do mesencéfalo, abaixo do aqueduto.', '', '');
M('massp_rafe_m', 'Núcleo mediano da rafe', 'stem', '#f0a0d8', 'Núcleo serotoninérgico na linha média da parte alta da ponte, ventral ao dorsal da rafe.', '', '');
const MASSP_IDS = ['snegra', 'rubro', 'subtal', 'colinf', 'colsup', 'cgl', 'cgm', 'massp_atv', 'massp_scp', 'massp_ppn', 'massp_habl', 'massp_rafe_d', 'massp_rafe_m'];
REF(MASSP_IDS.filter(id => /^massp_/.test(id)), 'Forma e posição: MASSP 2.0, Bazin PL et al., 2024, doi:10.21942/uva.27291579.v2 (CC BY 4.0). Texto: a confirmar no Machado (REVISAR.md).');
MASSP_IDS.filter(id => /^massp_/.test(id)).forEach(id => NOTA(id, 'Só no modo MASSP dos núcleos do tronco (média de 97 pessoas, posição levada ao atlas por uma afim com erro de 3 a 5 mm no tronco).'));
const MSP = { modo: 'esquema', carga: null };
function msCarregar() {
  if (MSP.carga) return MSP.carga;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  MSP.carga = new Promise((ok, falha) => cbsLoader.load('models/massp_nucleos.glb', g => {
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      const nome = o.name.includes('__') ? o.name : (o.parent && o.parent.name) || '', id = nome.split('__')[0], lado = nome.split('__')[1];
      if (!META[id]) return;
      const m = new THREE.Mesh(cbsGeo(o), stdMat(META[id].color, { roughness: 0.55 }));
      m.userData.massp = true; register(id, m, lado === 'd' ? -1 : (lado === 'e' ? 1 : 0));
    });
    ok();
  }, undefined, falha));
  return MSP.carga;
}
function setTroncoNucleos(modo) {
  MSP.modo = modo;
  document.querySelectorAll('[data-msp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.msp === modo ? 'true' : 'false'));
  const st = document.getElementById('mspStatus');
  if (modo === 'esquema') { if (st) st.textContent = ''; applyVisibility(); applyAppearance(); return; }
  if (st) st.textContent = 'Carregando os núcleos do MASSP…';
  msCarregar().then(() => { if (st) st.textContent = ''; if (!state.groupOn.stem) { state.groupOn.stem = true; syncLayerUI(); } applyVisibility(); applyAppearance(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar models/massp_nucleos.glb.'; console.warn(e); setTroncoNucleos('esquema'); });
}
const _visMsp = applyVisibility;
applyVisibility = function () {
  _visMsp();
  const real = MSP.modo === 'massp';
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.massp) { m.visible = real && m.visible; return; }
    if (real && MASSP_IDS.includes(u.id)) m.visible = false;                 // os esquemas dos mesmos núcleos saem
  });
};
BOL_FORA.massp_atv = BOL_FORA.massp_scp = BOL_FORA.massp_ppn = BOL_FORA.massp_habl = BOL_FORA.massp_rafe_d = BOL_FORA.massp_rafe_m = 1;
document.querySelectorAll('[data-msp]').forEach(b => b.addEventListener('click', () => setTroncoNucleos(b.dataset.msp)));
