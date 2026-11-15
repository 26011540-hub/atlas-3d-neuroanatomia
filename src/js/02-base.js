/* ===== UTILITÁRIOS ===== */
const clamp01 = x => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lin = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const desl = (a, dx, dy, dz) => [a[0] + dx, a[1] + dy, a[2] + dz];
const media = g => [0, 1, 2].map(k => g.reduce((t, p) => t + p[k], 0) / g.length);

/* ===== CENA ===== */
const canvas = document.getElementById('gl');
const stageEl = document.getElementById('stage');
const loadEl = document.getElementById('load');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia && matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 300);
scene.add(camera);
// Luz: uma principal rasante (presa à câmera, vinda de cima e da esquerda) desenha o relevo dos sulcos;
// a hemisférica e o preenchimento só evitam sombra chapada.
const luzAmb = new THREE.HemisphereLight(0xffffff, 0x6f7a84, 0.5); scene.add(luzAmb);
const luzPrin = new THREE.DirectionalLight(0xffffff, 0.85); luzPrin.position.set(-0.75, 0.95, 0.7); camera.add(luzPrin);
const luzPre = new THREE.DirectionalLight(0xdfe8ff, 0.2); luzPre.position.set(0.9, -0.5, 0.5); camera.add(luzPre);
var sujo = 3;                         // quantos quadros ainda precisam ser desenhados
function marca() { sujo = 3; }
function aplicarTema() {
  marca();
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const n = parseInt(bg.replace('#', ''), 16) || 0xffffff;
  const lum = ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255;
  const escuro = true || lum < 0.4;   // o palco agora é sempre escuro, nos dois temas
  // no tema escuro o fundo não rebate luz: menos ambiente, mais luz principal, para o sulco continuar escuro
  luzAmb.intensity = escuro ? 0.4 : 0.52; luzAmb.groundColor.setHex(escuro ? 0x3a4650 : 0x7a858f);
  luzPrin.intensity = escuro ? 0.98 : 0.82; luzPre.intensity = escuro ? 0.16 : 0.22;
}
aplicarTema();
if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); (mq.addEventListener ? mq.addEventListener('change', aplicarTema) : mq.addListener(aplicarTema)); }
new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

const grpObj = {};
Object.keys(GROUPS).forEach(k => { grpObj[k] = new THREE.Group(); scene.add(grpObj[k]); });
const ITEMS = {};        // id -> {meta, meshes[]}
const ALLMESH = [];
function itemOf(id) { return ITEMS[id] || (ITEMS[id] = { meta: META[id], meshes: [] }); }
function register(id, mesh, side, grp) {
  const it = itemOf(id), g0 = grp || META[id].grp, mt = mesh.material;
  if (mt && mt.isMeshStandardMaterial && !mesh.userData.cortex) {   // acabamento por tecido: vasos úmidos, nervos acetinados, branca fosca
    if (g0 === 'art' || g0 === 'ven') { mt.roughness = 0.3; mt.metalness = 0.05; }
    else if (g0 === 'nc') { mt.roughness = 0.42; }
    else if (g0 === 'vias') { mt.roughness = 0.5; }
  }
  mesh.userData = Object.assign(mesh.userData || {}, { id, side, base: META[id].color });
  it.meshes.push(mesh); ALLMESH.push(mesh);
  grpObj[grp || META[id].grp].add(mesh);
}
function stdMat(color, extra) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide, transparent: true }, extra || {}));
}

/* ---- primitivas ---- */
// Convenção de lados: side = +1 é o hemisfério ESQUERDO (x > 0), side = -1 o direito, 0 a linha média.
const SPH = new THREE.SphereGeometry(1, 28, 20);
function ell(id, c, r, rot, o) {
  o = o || {};
  const mk = (sx) => {
    const m = new THREE.Mesh(SPH, stdMat(o.color || META[id].color));
    m.scale.set(r[0], r[1], r[2]);
    if (typeof c === 'function') { const p = c(sx); m.position.set(p[0], p[1], p[2]); }
    else m.position.set(c[0] * sx, c[1], c[2]);
    if (rot) m.rotation.set(rot[0], rot[1] * sx, rot[2] * sx);
    register(id, m, o.mid ? 0 : sx);
  };
  if (o.mid) mk(1); else { mk(1); mk(-1); }
}
function tubeGeo(pts, r0, r1, seg, rad) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
  seg = seg || Math.max(16, pts.length * 8); rad = rad || 10;
  const fr = curve.computeFrenetFrames(seg, false);
  const pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, P = curve.getPointAt(u), N = fr.normals[i], Bn = fr.binormals[i];
    const r = typeof r0 === 'function' ? r0(u) : r0 + (r1 - r0) * u;
    for (let j = 0; j <= rad; j++) {
      const a = j / rad * Math.PI * 2, cx = Math.cos(a), sy = Math.sin(a);
      pos.push(P.x + r * (cx * N.x + sy * Bn.x), P.y + r * (cx * N.y + sy * Bn.y), P.z + r * (cx * N.z + sy * Bn.z));
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
    const a = i * (rad + 1) + j, b = a + rad + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// pts: lista de pontos do lado esquerdo (espelhada para o direito) ou função sx -> pontos já no lado certo
/* ---- formas orgânicas (substituem elipsoides e tubos de raio fixo) ---- */
function ruido3(x, y, z) { return 0.5 * Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.cos(y * 1.3 + z * 0.7) + 0.35 * Math.sin(z * 2.1 + x * 0.9 + 0.4) + 0.15 * Math.sin(x * 3.7 - y * 2.9 + z * 3.1); }
// blob: elipsoide deformado suavemente; o.amp (deformação), o.freq, o.seed, o.achata = [eixo, fator] achata um dos lados
function blobGeo(r, o) {
  o = o || {}; const g = new THREE.SphereGeometry(1, o.seg || 40, o.seg2 || 28), p = g.attributes.position, v = new THREE.Vector3();
  const amp = o.amp === undefined ? 0.08 : o.amp, fr = o.freq || 2.2, sd = o.seed || 0;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (o.achata) { const ax = o.achata[0], c = v.getComponent(ax); if (c < 0) v.setComponent(ax, c * o.achata[1]); }
    v.multiplyScalar(1 + amp * ruido3(v.x * fr + sd, v.y * fr + sd * 1.7, v.z * fr + sd * 2.3));
    p.setXYZ(i, v.x * r[0], v.y * r[1], v.z * r[2]);
  }
  g.computeVertexNormals(); return g;
}
function blob(id, c, r, rot, o) {
  o = o || {};
  const g = blobGeo(r, o);
  const mk = sx => {
    const m = new THREE.Mesh(g, stdMat(o.color || META[id].color, { roughness: o.rough || 0.62 }));
    if (typeof c === 'function') { const p = c(sx); m.position.set(p[0], p[1], p[2]); } else m.position.set(c[0] * sx, c[1], c[2]);
    if (rot) m.rotation.set(rot[0], rot[1] * sx, rot[2] * sx);
    if (sx < 0) m.scale.x = -1;
    register(id, m, o.mid ? 0 : sx);
  };
  if (o.mid) mk(1); else { mk(1); mk(-1); }
}
// fita: tubo de seção elíptica que varia ao longo do trajeto (largura w(u), espessura e(u)), pontas arredondadas;
// o lado largo fica perpendicular a o.up (padrão: vertical)
function fitaGeo(pts, w, e, o) {
  o = o || {};
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
  const seg = o.seg || Math.max(24, pts.length * 10), rad = o.rad || 14, up = new THREE.Vector3().fromArray(o.up || [0, 1, 0]).normalize();
  const fr = curve.computeFrenetFrames(seg, false), pos = [], idx = [], T = new THREE.Vector3(), N = new THREE.Vector3(), Bn = new THREE.Vector3();
  const tampa = u => { const k = o.ponta === false ? 1 : Math.min(1, Math.min(u, 1 - u) / 0.04); return Math.sqrt(Math.max(0.02, k)); };
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, P = curve.getPointAt(u); T.copy(curve.getTangentAt(u));
    N.copy(up).addScaledVector(T, -up.dot(T)); if (N.lengthSq() < 1e-4) N.copy(fr.normals[i]); N.normalize(); Bn.crossVectors(T, N).normalize();
    const ww = (typeof w === 'function' ? w(u) : w) * tampa(u), ee = (typeof e === 'function' ? e(u) : e) * tampa(u);
    for (let j = 0; j <= rad; j++) { const a = j / rad * Math.PI * 2, cx = Math.cos(a), sy = Math.sin(a); pos.push(P.x + Bn.x * ww * cx + N.x * ee * sy, P.y + Bn.y * ww * cx + N.y * ee * sy, P.z + Bn.z * ww * cx + N.z * ee * sy); }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function fita(id, pts, w, e, o) {
  o = o || {};
  const mk = sx => {
    const p = typeof pts === 'function' ? pts(sx) : pts.map(q => [q[0] * sx, q[1], q[2]]);
    const m = new THREE.Mesh(fitaGeo(p, w, e, o), stdMat(o.color || META[id].color, { roughness: o.rough || 0.6 }));
    register(id, m, o.mid ? 0 : sx); return m;
  };
  if (o.mid) mk(1); else { mk(1); mk(-1); }
}
// vaso: tubo que afina, com leve tortuosidade determinística e ponta arredondada
function vaso(id, pts, r0, r1, o) {
  o = o || {};
  const tort = o.tort === undefined ? 0.035 : o.tort;
  const torto = p => p.map((q, i) => { if (i === 0 || i === p.length - 1 || !tort) return q; const f = Math.sin(i * 2.3 + q[0] * 1.7) * tort, g = Math.cos(i * 1.9 + q[2] * 1.3) * tort; return [q[0] + f, q[1] + g, q[2] - f * 0.5]; });
  const ff = typeof pts === 'function' ? (sx => torto(pts(sx))) : (sx => torto(pts.map(q => [q[0] * sx, q[1], q[2]])));
  const raio = u => (r0 + (r1 - r0) * Math.pow(u, 0.8)) * (u > 0.97 ? Math.sqrt(Math.max(0.15, (1 - u) / 0.03)) : 1);
  tube(id, ff, raio, 0, Object.assign({ seg: 48, rad: 10 }, o, { mid: o.mid }));
}
// seios da dura-máter são canais rígidos: não ondulam
const SEIOS = new Set(['sss', 'sinf', 'sreto', 'stransv', 'ssigm', 'socc', 'sinterc', 'spsup', 'spinf', 'sesfpar', 'plexbas', 'smarg', 'jugular', 'galeno']);
// leve sinuosidade dos vasos: deslocamento suave ao longo do comprimento, nulo nas pontas (as junções não se soltam)
function ondula(p, a, sd) {
  const s = [0]; for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]));
  const S = s[s.length - 1] || 1;
  return p.map((q, i) => { if (i === 0 || i === p.length - 1) return q; const k = a * Math.sin(Math.PI * s[i] / S), t = s[i] * 2.1 + sd; return [q[0] + k * Math.sin(t), q[1] + k * Math.cos(t * 0.8 + 1.3), q[2] + k * Math.sin(t * 1.3 + 2.1)]; });
}
// ramos terminais: a artéria (ou veia) se divide e afina até a periferia do território, apoiada na superfície
// o.galhos: 'lat' (face lateral), 'med' (face medial), 'inf' (face inferior), 'cbs'/'cbi' (cerebelo, face superior/inferior)
function galhos(id, p, o, sx, r0, r1) {
  const c = new THREE.CatmullRomCurve3(p.map(q => new THREE.Vector3(q[0], q[1], q[2])), false, 'catmullrom', 0.5), tot = c.getLength();
  if (tot < 1.0) return;
  const modo = o.galhos, fr = o.gfr || [0.5, 0.75, 0.96];
  const proj = q => {
    if (modo === 'med') return medP(sx, [q])[0];
    if (modo === 'inf') return infP(sx, [[Math.abs(q[0]), q[2]]])[0];
    if (modo === 'cbs') return cbSup(sx, Math.abs(q[0]), q[2]);
    if (modo === 'cbi') return cbInf(sx, Math.abs(q[0]), q[2]);
    return ENV[sx].radial(q, 0.09);
  };
  fr.forEach((u, k) => {
    const b = c.getPointAt(u), T = c.getTangentAt(u), N = new THREE.Vector3();
    if (modo === 'med') N.set(-sx, 0, 0); else if (modo === 'inf' || modo === 'cbi') N.set(0, -1, 0); else if (modo === 'cbs') N.set(0, 1, 0); else N.copy(b).sub(ENV[sx].C).normalize();
    const S = new THREE.Vector3().crossVectors(T, N); if (S.lengthSq() < 1e-6) return; S.normalize().multiplyScalar(k % 2 ? 1 : -1);
    const L = Math.min(1.4, 0.3 * tot + 0.35) * (u > 0.9 ? 0.75 : 1);
    const at = (a, f) => { const q = b.clone().addScaledVector(S, L * a).addScaledVector(T, L * f); return proj([q.x, q.y, q.z]); };
    const pts = [[b.x, b.y, b.z], at(0.3, 0.25), at(0.62, 0.5), at(0.9, 0.7)];
    const rb = Math.max(0.018, (typeof r0 === 'function' ? r0(u) : r0 + (r1 - r0) * u) * 0.62);
    const m = new THREE.Mesh(tubeGeo(pts, uu => rb + (0.012 - rb) * uu, 0, 20, 6), stdMat(o.color || META[id].color));
    register(id, m, sx);
  });
}
// várias partes de um mesmo vaso numa curva única (sem dobras nas junções); cortes = índices dos pontos de controle
function partes(ids, pts, cortes, raio, pai, o) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
  const L = c.getLengths(600), uDe = j => L[Math.round(j / (pts.length - 1) * 600)] / L[600];
  ids.forEach((id, k) => {
    const u0 = uDe(cortes[k]), u1 = uDe(cortes[k + 1]);
    const sub = lin(u0, u1, 24).map(u => { const v = c.getPointAt(u); return [v.x, v.y, v.z]; });
    tube(id, sub, uu => raio(u0 + (u1 - u0) * uu), 0, Object.assign({ seg: 40, rad: 12, reto: true }, o));
    ITEMS[id].meshes.forEach(m => { m.userData.pai = pai; itemOf(pai).meshes.push(m); });
  });
}
function tube(id, pts, r0, r1, o) {
  o = o || {};
  const mk = (sx) => {
    let p = typeof pts === 'function' ? pts(sx) : pts.map(q => [q[0] * sx, q[1], q[2]]);
    p = p.filter((q, i) => i === 0 || Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1], q[2] - p[i - 1][2]) > 0.02);
    if (p.length < 2) { console.warn('tubo sem pontos suficientes:', id); return; }
    const gv = META[id] && (META[id].grp === 'art' || META[id].grp === 'ven');
    if (gv && !o.mid && !o.reto && !SEIOS.has(id) && p.length > 2) p = ondula(p, o.tort === undefined ? 0.03 : o.tort, id.length * 0.7 + sx);
    const m = new THREE.Mesh(tubeGeo(p, r0, r1 === undefined ? r0 : r1, o.seg, o.rad), stdMat(o.color || META[id].color));
    if (o.sx) m.scale.x = o.sx;
    register(id, m, o.mid ? 0 : sx);
    if (o.galhos && !o.mid) galhos(id, p, o, sx, r0, r1 === undefined ? r0 : r1);
  };
  if (o.mid) mk(1); else { mk(1); mk(-1); }
}

