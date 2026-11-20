/* ===== MODO CIRCUITO (Fase 5): Papez e alças direta e indireta dos núcleos da base =====
   Esquema próprio do Mímir sobre as estruturas reais (MASSP, Allen, Neudorfer) quando carregadas, ou sobre os esquemas.
   O trajeto passa pelo centro de cada estação (no hemisfério esquerdo); fórnice e giro do cíngulo entram como vários
   pontos ao longo do seu comprimento. Um tubo fino mostra a alça, setas e pulsos de luz mostram o sentido da condução,
   as estações ficam acesas e o resto apagado. Estações pelo Machado (cap. 25 a 27; texto de v_papez e v_nb). */
const CIRCUITOS = {
  papez: { nome: 'Circuito de Papez', via: 'v_papez', cor: '#d65fa0', fechado: true,
    passos: [['subiculo'], ['fornice', 4, 'posterior'], ['mamilar'], ['f_mamtal'], ['tal_anterior'], ['gcing', 4, 'anterior'], ['gparahip'], ['hip_ca1']],
    texto: 'Hipocampo → fórnice → corpo mamilar → trato mamilotalâmico → núcleos anteriores do tálamo → giro do cíngulo → giro para-hipocampal → hipocampo' },
  direta: { nome: 'Alça direta dos núcleos da base', via: 'v_nb', cor: '#2fa37a', fechado: true,
    passos: [['gpre'], ['putame'], ['gpi'], ['tal_vl'], ['tal_va'], ['gpre']],
    texto: 'Córtex motor → putâmen → globo pálido interno → tálamo (VA e VL) → córtex motor. Facilita o movimento.' },
  indireta: { nome: 'Alça indireta dos núcleos da base', via: 'v_nb', cor: '#d23c3c', fechado: true,
    passos: [['gpre'], ['putame'], ['gpe'], ['subtal'], ['gpi'], ['tal_vl'], ['gpre']],
    texto: 'Córtex motor → putâmen → globo pálido externo → núcleo subtalâmico → globo pálido interno → tálamo (VA e VL) → córtex motor. Freia o movimento.' },
};
const CIR = { ativo: null, grupo: null, pulsos: [], curva: null, t: 0, ultimo: 0 };
// pontos de uma estação no hemisfério esquerdo (x > 0): o centro, ou n pontos ao longo do eixo anteroposterior
function cirPontos(id, n, comeco) {
  const it = ITEMS[id]; if (!it) return [];
  const real = it.meshes.filter(m => m.userData.f5 || m.userData.massp), lista = real.length ? real : it.meshes.filter(m => !m.userData.hcp && !m.userData.vk);
  const P = [], v = new THREE.Vector3();
  lista.forEach(m => { m.updateMatrixWorld(); const p = m.geometry.attributes.position, passo = Math.max(1, Math.floor(p.count / 1500)); for (let i = 0; i < p.count; i += passo) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); if (v.x > 0.02) P.push(v.clone()); } });
  if (!P.length) return [];
  // giros do córtex: só a parte de cima (o centro do giro pré-central fica baixo, perto do sulco lateral)
  if (lista.some(m => m.userData.cortex) && id === 'gpre') { const ys = P.map(q => q.y).sort((x, y) => x - y), corte = ys[Math.floor(ys.length * 0.7)]; P.splice(0, P.length, ...P.filter(q => q.y >= corte)); }
  if (!n) { const c = new THREE.Vector3(); P.forEach(q => c.add(q)); return [c.divideScalar(P.length)]; }
  let z0 = Infinity, z1 = -Infinity; P.forEach(q => { z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); });
  const faixas = Array.from({ length: n }, () => [new THREE.Vector3(), 0]);
  P.forEach(q => { const k = Math.min(n - 1, Math.floor((q.z - z0) / (z1 - z0 + 1e-6) * n)); faixas[k][0].add(q); faixas[k][1]++; });
  const out = faixas.filter(f => f[1]).map(f => f[0].divideScalar(f[1]));
  return comeco === 'anterior' ? out.reverse() : out;                       // posterior = do z menor para o maior
}
function cirLimpar() {
  if (CIR.grupo) { scene.remove(CIR.grupo); CIR.grupo.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  CIR.grupo = null; CIR.pulsos = []; CIR.curva = null;
}
function setCircuito(nome) {
  cirLimpar(); CIR.ativo = CIRCUITOS[nome] ? nome : null;
  document.querySelectorAll('[data-cir]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cir === (CIR.ativo || '') ? 'true' : 'false'));
  const st = document.getElementById('cirTexto');
  if (!CIR.ativo) { if (st) st.textContent = ''; state.realce = null; applyAppearance(); marca(); return; }
  const C = CIRCUITOS[nome];
  const montar = () => {
    const pts = []; C.passos.forEach(([id, n, comeco]) => cirPontos(id, n, comeco).forEach(p => pts.push(p)));
    // sem pontos inválidos nem repetidos (duas estações quase no mesmo lugar quebram a curva centrípeta)
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; if (!isFinite(p.x + p.y + p.z) || (i > 0 && p.distanceTo(pts[i - 1]) < 0.03)) pts.splice(i, 1); }
    if (pts.length < 3) { if (st) st.textContent = 'Faltam estruturas para desenhar este circuito.'; return; }
    if (C.fechado && pts[0].distanceTo(pts[pts.length - 1]) < 0.05) pts.pop();
    const curva = new THREE.CatmullRomCurve3(pts, C.fechado, 'centripetal', 0.5); CIR.curva = curva;
    const g = new THREE.Group(), cor = new THREE.Color(C.cor);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 400, 0.05, 8, C.fechado), new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.35, roughness: 0.4, transparent: true, opacity: 0.85 })));
    const cone = new THREE.ConeGeometry(0.11, 0.3, 14), matSeta = new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.5, roughness: 0.35 });
    for (let k = 0; k < 10; k++) { const t = (k + 0.5) / 10, s = new THREE.Mesh(cone, matSeta); s.position.copy(curva.getPointAt(t)); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curva.getTangentAt(t)); g.add(s); }
    const bola = new THREE.SphereGeometry(0.075, 14, 10), matPulso = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(bola, matPulso); p.userData.fase = k / 5; g.add(p); CIR.pulsos.push(p); }
    // o circuito fica sempre à frente das estruturas (como num esquema): sem teste de profundidade, desenhado por último
    g.traverse(o => { if (o.material) { o.material.depthTest = false; o.material.depthWrite = false; o.material.transparent = true; } o.renderOrder = 20; });
    CIR.grupo = g; scene.add(g);
    if (st) st.textContent = C.texto;
    select(C.via, { focus: false });
    state.realce = Object.fromEntries(C.passos.map(p => [p[0], 1]).concat([[C.via, 1]]));
    if (!state.isolate) { state.isolate = true; const c = document.getElementById('iso'); if (c) c.checked = true; }
    applyAppearance(); marca(); CIR.ultimo = performance.now(); requestAnimationFrame(cirAnimar);
  };
  // as estações do tálamo (VA, VL) e do hipocampo só existem nos atlas reais: carrega-os antes
  if (typeof setNucleosReais === 'function' && F5.modo !== 'real') { setNucleosReais('real'); f5Carregar().then(() => setTimeout(montar, 50)); } else montar();
}
function cirAnimar(t) {
  if (!CIR.ativo || !CIR.curva) return;
  const dt = Math.min(0.05, (t - CIR.ultimo) / 1000); CIR.ultimo = t; CIR.t = (CIR.t + dt * 0.07) % 1;   // uma volta em cerca de 14 s
  try { CIR.pulsos.forEach(p => p.position.copy(CIR.curva.getPointAt((CIR.t + p.userData.fase) % 1))); } catch (e) { console.warn('circuito', e); return; }
  marca(); requestAnimationFrame(cirAnimar);
}
// desfaz o circuito quando o usuário escolhe outra estrutura
const _selCir = select;
select = function (id, opt) { _selCir(id, opt); if (CIR.ativo && id !== CIRCUITOS[CIR.ativo].via) { const r = state.realce; setCircuito(null); state.realce = r; } };
(function () {
  const seg = document.getElementById('f5Seg'); if (!seg) return;
  const linha = document.createElement('div'); linha.className = 'row'; linha.style.cssText = 'gap:8px;margin:2px 0 6px;flex-wrap:wrap';
  linha.innerHTML = '<span class="lbl">Circuitos</span><span class="seg" id="cirSeg"><button type="button" data-cir="" aria-pressed="true">Nenhum</button>' +
    Object.entries(CIRCUITOS).map(([k, c]) => `<button type="button" data-cir="${k}" aria-pressed="false" title="${c.nome}">${k === 'papez' ? 'Papez' : k === 'direta' ? 'Alça direta' : 'Alça indireta'}</button>`).join('') +
    '</span><span class="muted" id="cirTexto" style="font-size:12px;flex-basis:100%"></span>';
  seg.closest('.row').after(linha);
  linha.querySelectorAll('[data-cir]').forEach(b => b.addEventListener('click', () => setCircuito(b.dataset.cir || null)));
})();
// durante o circuito: só as estações e o tubo; o esquema antigo da mesma via sai e o resto quase some
const _apCir = applyAppearance;
applyAppearance = function () {
  _apCir();
  if (!CIR.ativo) return;
  const C = CIRCUITOS[CIR.ativo], R = state.realce || {};
  ALLMESH.forEach(m => {
    const u = m.userData, mat = m.material;
    if (u.id === C.via && !u.hcp) { mat.opacity = 0; mat.depthWrite = false; return; }
    if (!R[u.id] && !R[u.pai]) { mat.opacity = Math.min(mat.opacity, u.cortex ? 0.05 : 0.04); mat.depthWrite = false; }
  });
};
if (/debug/.test(location.hash)) window.cirDebug = { CIR, cirPontos };
