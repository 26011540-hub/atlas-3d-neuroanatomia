/* ===== TERRITÓRIOS ARTERIAIS DO JHU (Fase 6) =====
   Liu CF et al., Digital 3D Brain MRI Arterial Territories Atlas, Sci Data 2023 (lesões de 1.298 pacientes com AVC).
   models/jhu_territorios.bin/.json (scripts/process/jhu_territorios.py): rótulos em MNI a 2 mm. Cada vértice do córtex
   é levado do espaço do atlas ao MNI (inversa da afim de mni_para_mimir.py) e recebe o território do voxel (ou do
   vizinho rotulado mais próximo, até 6 mm, porque a superfície do atlas não coincide com a do molde).
   Seletor "Fonte dos territórios: Esquema (Machado) | Atlas JHU": troca só as bordas; as cores e a legenda são as mesmas. */
T_RGB[4] = [0.6, 0.38, 0.82]; T_RGB[5] = [0.23, 0.65, 0.42];   // corióidea anterior e vertebrobasilar (só aparecem com o JHU)
const JHU = { fonte: 'esquema', carga: null };
const JHU_CLASSE = { ACA: 1, ACM: 2, ACP: 3, ACI: 4, VB: 5 };
function jhuCarregar() {
  if (JHU.carga) return JHU.carga;
  JHU.carga = Promise.all([fetch('models/jhu_territorios.json').then(r => r.json()), fetch('models/jhu_territorios.bin').then(r => r.arrayBuffer())]).then(([J, buf]) => {
    const L = new Uint8Array(buf), [nx, ny, nz] = J.dim, cls = new Uint8Array(256);
    Object.entries(J.rotulos).forEach(([k, r]) => { cls[+k] = r.classe ? JHU_CLASSE[r.classe] : 0; });
    const M = new THREE.Matrix4(), V = new THREE.Matrix4();
    M.set(...J.mni_para_mimir.flat()); V.set(...J.vox_para_mni.flat());
    const ida = new THREE.Matrix4().copy(V).invert().multiply(new THREE.Matrix4().copy(M).invert());   // Mímir (cm) -> voxel
    // no córtex cerebral não entra a classe vertebrobasilar (5): a vizinhança da face inferior do lobo temporal pegaria o cerebelo
    const at = (i, j, k) => { if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) return 0; const c = cls[L[i + nx * (j + ny * k)]]; return c === 5 ? 0 : c; };
    const v = new THREE.Vector3();
    cortexMeshes.forEach(m => {
      if (!m.userData.dono) return;
      if (m.userData.id === 'cc_cut' || m.userData.id === 'dien_wall') return;   // superfícies de corte (não são córtex): ficam neutras
      const g = m.geometry, p0 = m.userData.p0, n = g.userData.terr.length, t = new Uint8Array(n);
      for (let q = 0; q < n; q++) {
        v.set(p0[q * 3], p0[q * 3 + 1], p0[q * 3 + 2]).applyMatrix4(m.matrix).applyMatrix4(ida);
        const i = Math.round(v.x), j = Math.round(v.y), k = Math.round(v.z); let c = at(i, j, k);
        for (let r = 1; !c && r <= 3; r++)                                     // vizinho rotulado mais próximo
          for (let a = -r; a <= r && !c; a++) for (let b = -r; b <= r && !c; b++) for (let d = -r; d <= r && !c; d++) c = at(i + a, j + b, k + d);
        t[q] = c || g.userData.terr[q];                                        // fora do atlas: fica o território do esquema
      }
      g.userData.terrEsq = g.userData.terr; g.userData.terrJHU = t;
    });
  });
  return JHU.carga;
}
function setFonteTerritorios(fonte) {
  JHU.fonte = fonte;
  document.querySelectorAll('[data-jhu]').forEach(b => b.setAttribute('aria-pressed', b.dataset.jhu === fonte ? 'true' : 'false'));
  const aplicar = () => { cortexMeshes.forEach(m => { const u = m.geometry.userData; if (u.terrJHU) u.terr = fonte === 'jhu' ? u.terrJHU : u.terrEsq; }); pintado = ''; applyAppearance(); marca(); };
  if (fonte === 'jhu') jhuCarregar().then(aplicar).catch(e => { console.warn(e); setFonteTerritorios('esquema'); }); else aplicar();
}
(function () {
  const lg = document.getElementById('legenda'); if (!lg) return;
  const linha = document.createElement('div'); linha.className = 'row'; linha.style.cssText = 'gap:8px;margin:2px 0 6px;flex-wrap:wrap';
  linha.innerHTML = '<span class="lbl">Fonte dos territórios</span><span class="seg"><button type="button" data-jhu="esquema" aria-pressed="false" title="Divisão descrita no Machado (cap. 18)">Esquema</button><button type="button" data-jhu="jhu" aria-pressed="true" title="Atlas de territórios arteriais do JHU (Liu et al. 2023): lesões de 1.298 pacientes com AVC">Atlas JHU</button></span>';
  lg.after(linha);
  linha.querySelectorAll('[data-jhu]').forEach(b => b.addEventListener('click', () => {
    const ct = document.getElementById('territ'); if (ct && !ct.checked && !b.dataset.semLigar) { ct.checked = true; ct.dispatchEvent(new Event('change')); }
    setFonteTerritorios(b.dataset.jhu);
  }));
})();
// os territórios abrem pela fonte real (JHU): carrega em segundo plano; o esquema do Machado continua no botão Esquema
setTimeout(() => setFonteTerritorios('jhu'), 0);
