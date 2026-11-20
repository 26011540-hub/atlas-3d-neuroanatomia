/* ===== ARTÉRIAS REAIS DO TOPBRAIN (Fase 6) =====
   TopBrain Challenge Data Release (Zenodo 21972006; uso aberto com citação, comercial só com permissão), paciente
   topcow_mr_025 (angio-RM). Malhas de scripts/process/topbrain_vasos.py, alinhadas ao atlas por 7 marcos do polígono
   de Willis. Cada artéria entra no item do atlas que ela representa (acm, aca1, basilar...), então o clique, o modo
   AVC e os territórios funcionam com ela. Cor por calibre: quanto mais grossa, mais escuro o vermelho. */
const TB = { modo: 'esquema', carga: null, ids: new Set(), soWillis: false, info: null };
const TB_FINO = new THREE.Color('#ff9a8c'), TB_GROSSO = new THREE.Color('#a8101c');
const tbCor = raio => TB_FINO.clone().lerp(TB_GROSSO, Math.max(0, Math.min(1, (raio - 0.6) / 0.95)));
function tbCarregar() {
  if (TB.carga) return TB.carga;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  TB.carga = Promise.all([new Promise((ok, falha) => cbsLoader.load('models/topbrain_vasos.glb', ok, undefined, falha)), fetch('models/topbrain_vasos.json').then(r => r.json())]).then(([g, J]) => {
    TB.info = J.nos; g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      const no = o.name.includes('__') ? o.name : ((o.parent && o.parent.name) || ''), info = J.nos[no];
      if (!info || !META[info.item]) return;
      const cor = tbCor(info.raio_mm), m = new THREE.Mesh(cbsGeo(o), stdMat('#' + cor.getHexString(), { roughness: 0.3, metalness: 0.05 }));
      m.userData.tb = true; m.userData.semBolacha = true; m.userData.willis = info.willis; m.userData.tbCor = '#' + cor.getHexString();
      register(info.item, m, info.lado === 'd' ? -1 : (info.lado === 'e' ? 1 : 0)); TB.ids.add(info.item);
    });
  });
  return TB.carga;
}
function setArteriasModo(modo) {
  TB.modo = modo;
  document.querySelectorAll('[data-tb]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tb === modo ? 'true' : 'false'));
  const st = document.getElementById('tbStatus');
  if (modo === 'esquema') { if (st) st.textContent = ''; applyVisibility(); applyAppearance(); marca(); return; }
  if (st) st.textContent = 'Carregando as artérias do TopBrain…';
  tbCarregar().then(() => { if (st) st.textContent = ''; if (!state.groupOn.art) { state.groupOn.art = true; syncLayerUI(); } applyVisibility(); applyAppearance(); marca(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar models/topbrain_vasos.glb.'; console.warn(e); setArteriasModo('esquema'); });
}
const _visTb = applyVisibility;
applyVisibility = function () {
  _visTb();
  const real = TB.modo === 'real';
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.tb) { m.visible = real && m.visible && (!TB.soWillis || u.willis); return; }
    if (real && TB.ids.has(u.id)) m.visible = false;                         // o esquema da mesma artéria sai
  });
};
// a aparência do atlas pinta pela cor do item; aqui volta a cor por calibre (o realce de seleção continua por cima)
const _apTb = applyAppearance;
applyAppearance = function () { _apTb(); if (TB.modo !== 'real' || state.territ) return; ALLMESH.forEach(m => { if (m.userData.tb && !(state.les && state.les.via === m.userData.id)) m.material.color.set(m.userData.tbCor); }); };
(function () {
  const lg = document.getElementById('willis'); if (!lg) return;
  const linha = document.createElement('div'); linha.className = 'row'; linha.style.cssText = 'gap:8px;margin:4px 0 6px;flex-wrap:wrap';
  linha.innerHTML = '<span class="lbl">Artérias</span><span class="seg"><button type="button" data-tb="esquema" aria-pressed="true" title="Artérias desenhadas do Mímir">Esquema</button><button type="button" data-tb="real" aria-pressed="false" title="Artérias reais de uma angio-RM (TopBrain), cor pelo calibre">TopBrain</button></span>' +
    '<button type="button" class="btn" id="tbWillis" aria-pressed="false" title="No modo TopBrain, mostra só o polígono de Willis">Só o polígono</button><span class="muted" id="tbStatus" style="font-size:12px"></span>';
  lg.closest('.btnrow').after(linha);
  linha.querySelectorAll('[data-tb]').forEach(b => b.addEventListener('click', () => setArteriasModo(b.dataset.tb)));
  document.getElementById('tbWillis').addEventListener('click', e => {
    TB.soWillis = !TB.soWillis; e.currentTarget.setAttribute('aria-pressed', TB.soWillis ? 'true' : 'false');
    if (TB.soWillis && TB.modo !== 'real') setArteriasModo('real'); else { applyVisibility(); applyAppearance(); marca(); }
  });
})();
