/* ===== CORTES DO TRONCO NA RM REAL (Lüsebrink 250 µm + MASSP 2.0) =====
   Fundo: T1 de 250 µm do Lüsebrink et al. 2021 (CC0), registrado ao MNI2009b; contornos: MASSP 2.0 (CC BY 4.0).
   Gerado por scripts/process/bolachas_tronco.py em models/bolachas_tronco/. Cortes perpendiculares ao eixo do tronco,
   dorsal em cima (como os cortes do modelo) e direita do paciente à esquerda da tela. */
TC_NIVEIS.splice(TC_NIVEIS.findIndex(q => q.k === 'bf') + 1, 0,
  { k: 'dp', nome: 'Bulbo: decussação das pirâmides', f: 30.5, fonte: 'Machado', gab: ['piramide', 'decpir', 'bulbo', 'fgrac', 'fcun', 'nugrac', 'nucun', 'nusp5', 'vertebral', 'a_espant'].filter(id => META[id]) });
const TC_RM = { cs: 'colsup', ci: 'colinf', ps: 'ponte_alta', pm: 'ponte_media', pi: 'ponte_baixa', ba: 'bulbo_oliva', bf: 'dec_lemnisco', dp: 'dec_piramide' };
// rótulos do MASSP desenhados nos cortes do tronco -> item do atlas
const TC_RM_ID = { 3: 'subtal', 4: 'subtal', 5: 'snegra', 6: 'snegra', 7: 'rubro', 8: 'rubro', 18: 'v4', 23: 'massp_atv', 24: 'massp_atv', 26: 'massp_scp', 27: 'massp_scp',
  28: 'massp_ppn', 29: 'massp_ppn', 32: 'colinf', 33: 'colinf', 34: 'colsup', 35: 'colsup', 58: 'massp_rafe_d', 59: 'massp_rafe_m', 60: 'cgl', 61: 'cgl', 62: 'cgm', 63: 'cgm' };
state.tc.fundo = 'modelo';
const TC_RM_CACHE = {};
function tcRmCarregar(nid) {
  if (TC_RM_CACHE[nid]) return TC_RM_CACHE[nid];
  const img = u => new Promise((ok, falha) => { const i = new Image(); i.onload = () => ok(i); i.onerror = falha; i.src = u; });
  TC_RM_CACHE[nid] = Promise.all([img(`models/bolachas_tronco/${nid}.webp`), img(`models/bolachas_tronco/${nid}_rotulos.png`)]).then(([fundo, rot]) => {
    const n = rot.width, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); g.drawImage(rot, 0, 0);
    const d = g.getImageData(0, 0, n, n).data, lab = new Uint8Array(n * n); for (let i = 0; i < n * n; i++) lab[i] = d[i * 4];
    return { fundo, lab, n };
  });
  return TC_RM_CACHE[nid];
}
function tcRmDesenhar(R, cv) {
  const n = R.n; cv.width = cv.height = n; const g = cv.getContext('2d'); g.drawImage(R.fundo, 0, 0, n, n);
  const im = g.getImageData(0, 0, n, n), D = im.data, L = R.lab, sel = state.sel, cor = new THREE.Color();
  for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
    const i = y * n + x, v = L[i], id = TC_RM_ID[v]; if (!id) continue;
    const borda = L[i - 1] !== v || L[i + 1] !== v || L[i - n] !== v || L[i + n] !== v;
    const aceso = sel && id === sel;
    if (!borda && !aceso) continue;
    cor.set(aceso ? '#ffd23f' : (META[id] ? META[id].color : '#ffffff'));
    const a = borda ? 1 : 0.35, k = i * 4;
    D[k] = D[k] * (1 - a) + cor.r * 255 * a; D[k + 1] = D[k + 1] * (1 - a) + cor.g * 255 * a; D[k + 2] = D[k + 2] * (1 - a) + cor.b * 255 * a;
  }
  g.putImageData(im, 0, 0);
}
function tcRmPicar(ev) {
  const el = document.getElementById('tc2d'), cv = el && el.querySelector('.tcrm canvas'), nid = TC_RM[state.tc.nivel];
  if (!cv || !nid || state.tc.fundo !== 'rm') return null;
  const R = cv._R; if (!R) return null; const r = cv.getBoundingClientRect();
  const x = Math.floor((ev.clientX - r.left) / r.width * R.n), y = Math.floor((ev.clientY - r.top) / r.height * R.n);
  if (x < 0 || y < 0 || x >= R.n || y >= R.n) return null; return TC_RM_ID[R.lab[y * R.n + x]] || null;
}
const _tcR2D = tcRender2D;
tcRender2D = function () {
  _tcR2D();
  const el = document.getElementById('tc2d'); if (!el || el.hidden) return;
  let seg = el.querySelector('.tcfundo'), rm = el.querySelector('.tcrm');
  if (!seg) {
    seg = document.createElement('div'); seg.className = 'seg tcfundo';
    seg.innerHTML = '<button type="button" data-tcf="modelo">Modelo</button><button type="button" data-tcf="rm" title="RM real de 7 T, 250 µm (Lüsebrink et al. 2021), com os núcleos do MASSP 2.0">RM real</button>';
    el.querySelector('.tct').after(seg);
    seg.querySelectorAll('[data-tcf]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); state.tc.fundo = b.dataset.tcf; tcRender2D(); }));
    rm = document.createElement('div'); rm.className = 'tcrm'; rm.appendChild(document.createElement('canvas'));
    el.querySelector('.tcimg').after(rm);
  }
  const nid = TC_RM[state.tc.nivel], usaRm = state.tc.fundo === 'rm' && nid;
  seg.hidden = !nid;
  seg.querySelectorAll('[data-tcf]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tcf === (usaRm ? 'rm' : 'modelo') ? 'true' : 'false'));
  el.querySelector('.tcimg').hidden = !!usaRm; rm.hidden = !usaRm;
  if (!usaRm) return;
  el.querySelector('.tcs').textContent = 'RM real: T1 de 7 T a 250 µm (Lüsebrink et al. 2021, CC0); contornos dos núcleos do MASSP 2.0 (média de 97 pessoas, CC BY 4.0). Dorsal em cima; a direita do paciente fica à esquerda.';
  const cv = rm.querySelector('canvas');
  tcRmCarregar(nid).then(R => { if (TC_RM[state.tc.nivel] !== nid) return; cv._R = R; tcRmDesenhar(R, cv); })
    .catch(() => { el.querySelector('.tcs').textContent = 'Não foi possível carregar models/bolachas_tronco/' + nid + '.webp.'; });
};
// clique e dica sobre a RM real (antes dos manipuladores do modelo)
(function () {
  const el = document.getElementById('tc2d'); if (!el) return;
  el.addEventListener('click', ev => { if (state.tc.fundo !== 'rm' || state.tc.quiz) return; const id = tcRmPicar(ev); if (id) { ev.stopImmediatePropagation(); select(id, { focus: false }); } }, true);
  el.addEventListener('mousemove', ev => { if (state.tc.fundo !== 'rm') return; const id = tcRmPicar(ev); el.querySelector('.tcdica').textContent = id && META[id] ? META[id].name : ''; ev.stopImmediatePropagation(); }, true);
  const ant = document.querySelector('[data-tc="bf"]');
  if (ant && !document.querySelector('[data-tc="dp"]')) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.tc = 'dp'; b.title = 'Bulbo, decussação das pirâmides'; b.textContent = 'Dec. pirâmides';
    b.setAttribute('aria-pressed', 'false'); ant.after(b); b.addEventListener('click', () => setCorteTronco('dp'));
  }
})();
const _apTcRm = applyAppearance;
applyAppearance = function () { _apTcRm(); const el = document.getElementById('tc2d'), cv = el && el.querySelector('.tcrm canvas'); if (cv && cv._R && state.tc.fundo === 'rm' && cv._sel !== state.sel) { cv._sel = state.sel; tcRmDesenhar(cv._R, cv); } };
if (/debug/.test(location.hash)) window.tcRmDebug = { tcRmPicar, TC_RM_ID, TC_RM };
