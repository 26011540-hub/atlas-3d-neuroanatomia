/* ===== CÓRTEX: malha real (Brain for Blender, A. M. Winkler, CC BY-SA 3.0) ===== */
const cortexMeshes = [];
(function addCortex() {
  gltf.scene.updateMatrixWorld(true);
  const ESPELHO = new THREE.Matrix4().makeScale(-1, 1, 1);   // plano sagital mediano em x = 0
  const lista = []; gltf.scene.traverse(o => { if (o.isMesh) lista.push(o); });
  lista.forEach(o => {
    const partes = (o.name || '').split('-');
    const ex = o.userData || {};
    const id = ex.id || partes[1], dk = ex.dk || partes[2];
    const lado = ex.lado !== undefined ? ex.lado : (partes[0] === 'lh' ? 1 : -1);
    if (!META[id]) { console.warn('região sem item no atlas:', o.name); return; }
    const g = o.geometry;
    if (ex.tipo === 'sub' || partes[0].indexOf('sub') === 0) {   // núcleo, ventrículo, tronco ou cerebelo: malha real do mesmo cérebro
      const meio = ex.meio !== undefined ? ex.meio : partes[0] === 'subM';   // estrutura mediana: as duas metades formam um item só
      [1, -1].forEach(sx => {
        const s = new THREE.Mesh(g, stdMat(META[id].color, { roughness: 0.62 }));
        s.matrixAutoUpdate = false; s.matrix.copy(sx > 0 ? o.matrixWorld : ESPELHO.clone().multiply(o.matrixWorld));
        register(id, s, meio ? 0 : sx);
        if (id === 'vlat' || id === 'v3' || id === 'v4') s.userData.op0 = 0.5;   // translúcidos: deixam ver o plexo corioide
      });
      return;
    }
    const p0 = g.attributes.position.array.slice(), n0 = g.attributes.normal.array.slice();
    [1, -1].forEach(sx => {   // a mesma geometria serve aos dois lados; o direito é o esquerdo espelhado
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: META[id].color, vertexColors: true, roughness: 0.82, metalness: 0, side: THREE.DoubleSide }));
      m.matrixAutoUpdate = false; m.matrix.copy(sx > 0 ? o.matrixWorld : ESPELHO.clone().multiply(o.matrixWorld));
      m.renderOrder = 2; m.frustumCulled = false;
      m.userData = { cortex: true, dk, dono: sx > 0, p0, n0, p1: g.attributes._inflated.array, n1: g.attributes._inflated_n.array };
      register(id, m, sx, 'cortex');
      cortexMeshes.push(m);
    });
  });
  grpObj.cortex.updateMatrixWorld(true);
})();

var TEMPOS = { inicio: Math.round(performance.now()) };
function marcaT(n) { TEMPOS[n] = Math.round(performance.now()); }
marcaT('antes_cerebelo');
/* ===== CEREBELO: lobos, lóbulos, fissuras e folhas (Machado, cap. 5, p. 47-49, figuras 5.4 a 5.7) =====
   A malha real do cerebelo (FreeSurfer) é lisa e grosseira. Aqui ela é subdividida, suavizada, dividida em lóbulos
   pelo ângulo em torno do fastígio (como na secção sagital mediana, figura 5.5) e recebe o relevo das fissuras e folhas.
   O lado direito é o esquerdo espelhado, como no resto do modelo. */
const CB = (function () {
  const ESP = new THREE.Matrix4().makeScale(-1, 1, 1), v = new THREE.Vector3(), K = 4194304;
  let F = null;   // fastígio: ápice do teto do IV ventrículo, na malha real
  { const m = ITEMS.v4.meshes[0], p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrix); if (Math.abs(v.x) > 0.3) continue; const sc = v.y * 0.408 - v.z * 0.913; if (!F || sc > F[3]) F = [0, v.y, v.z, sc]; } }
  const EA = [0.913, 0.408], ED = [0.408, -0.913];   // eixo do tronco (para cima) e direção dorsal, no plano sagital (y, z)
  const CURVA = 0.06;   // nas partes laterais os sulcos se curvam para trás, como na figura 5.6
  const ang = (x, y, z) => { const dy = y - F[1], dz = z - (F[2] - CURVA * x * x); let t = Math.atan2(dy * EA[0] + dz * EA[1], dy * ED[0] + dz * ED[1]) * 180 / Math.PI; if (t > 185) t -= 360; return t; };
  // fissuras, de anterior-superior para anterior-inferior passando por trás: [id, ângulo no verme, ângulo no hemisfério, profundidade]
  const FIS = [['f_precent', 165, 175, 0.1], ['f_preculm', 135, 135, 0.12], ['f_prima', 65, 65, 0.24], ['f_posclival', 20, 10, 0.13], ['f_horiz', 0, -35, 0.24], ['f_prepir', -45, -75, 0.13], ['f_pospir', -95, -105, 0.13], ['f_postlat', -140, -150, 0.22]];
  const VERME = ['cb_lingula', 'cb_central', 'cb_culmen', 'cb_declive', 'cb_folium', 'cb_tuber', 'cb_piramide', 'cb_uvula', 'cb_nodulo'];
  const HEMI = ['cb_asa', 'cb_asa', 'cb_quadant', 'cb_quadpost', 'cb_semisup', 'cb_semiinf', 'cb_biventre', 'cb_tonsila', 'cb_floculo'];
  const LOBO = k => k <= 2 ? 'cb_ant' : (k <= 7 ? 'cb_post' : 'cb_fn');
  const FLOC = [2.35, -4.1, -3.0];
  const wH = ax => smooth(0.7, 1.9, ax);
  const fisAng = (ax, i) => { const w = wH(ax); return FIS[i][1] * (1 - w) + FIS[i][2] * w; };
  function classifica(x, y, z) {
    const ax = Math.abs(x), t = ang(x, y, z); let k = 8;
    for (let i = 0; i < 8; i++) if (t > fisAng(ax, i)) { k = i; break; }
    let L, lobo = LOBO(k);
    if (wH(ax) < 0.5) L = VERME[k];
    else if (k >= 7) { if (Math.hypot(ax - FLOC[0], y - FLOC[1], z - FLOC[2]) < 0.8) { L = 'cb_floculo'; lobo = 'cb_fn'; } else { L = ax < 2.5 ? 'cb_tonsila' : 'cb_biventre'; lobo = 'cb_post'; } }
    else L = HEMI[k];
    return { L, lobo, k, t, ax };
  }
  function subdivide(P, I) {
    const mid = new Map(), out = [], Q = Array.from(P);
    const m = (a, b) => { const key = a < b ? a * K + b : b * K + a; let r = mid.get(key); if (r === undefined) { r = Q.length / 3; Q.push((Q[a * 3] + Q[b * 3]) / 2, (Q[a * 3 + 1] + Q[b * 3 + 1]) / 2, (Q[a * 3 + 2] + Q[b * 3 + 2]) / 2); mid.set(key, r); } return r; };
    for (let i = 0; i < I.length; i += 3) { const a = I[i], b = I[i + 1], c = I[i + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
    return [new Float32Array(Q), new Uint32Array(out)];
  }
  // refina só onde precisa: divide as arestas mais longas que L, sem deixar rachaduras entre triângulos vizinhos
  function refina(P, I, L, deve) {
    // uma aresta que não foi dividida numa passada nunca será dividida depois (o critério só depende dos dois vértices),
    // então cada passada só reexamina os triângulos que acabaram de nascer
    const Q = Array.from(P), pronto = []; let T = Array.from(I);
    for (let it = 0; it < 7 && T.length; it++) {
      const mid = new Map(), out = [];
      const md = (a, b) => { const key = a < b ? a * K + b : b * K + a; let r = mid.get(key); if (r === undefined) { const dx = Q[a * 3] - Q[b * 3], dy = Q[a * 3 + 1] - Q[b * 3 + 1], dz = Q[a * 3 + 2] - Q[b * 3 + 2], d = Math.sqrt(dx * dx + dy * dy + dz * dz); if (deve ? !deve(a, b, d, Q) : d <= L) r = -1; else { r = Q.length / 3; Q.push((Q[a * 3] + Q[b * 3]) / 2, (Q[a * 3 + 1] + Q[b * 3 + 1]) / 2, (Q[a * 3 + 2] + Q[b * 3 + 2]) / 2); } mid.set(key, r); } return r; };
      for (let i = 0; i < T.length; i += 3) {
        const a = T[i], b = T[i + 1], c = T[i + 2], m0 = md(a, b), m1 = md(b, c), m2 = md(c, a), n = (m0 >= 0) + (m1 >= 0) + (m2 >= 0);
        if (n === 0) pronto.push(a, b, c);
        else if (n === 3) out.push(a, m0, m2, m0, b, m1, m2, m1, c, m0, m1, m2);
        else if (n === 1) { if (m0 >= 0) out.push(a, m0, c, m0, b, c); else if (m1 >= 0) out.push(b, m1, a, m1, c, a); else out.push(c, m2, b, m2, a, b); }
        else { if (m2 < 0) out.push(m0, b, m1, a, m0, m1, a, m1, c); else if (m0 < 0) out.push(m1, c, m2, b, m1, m2, b, m2, a); else out.push(m2, a, m0, c, m2, m0, c, m0, b); }
      }
      T = out;
    }
    for (let i = 0; i < T.length; i++) pronto.push(T[i]);
    return [new Float32Array(Q), new Uint32Array(pronto)];
  }
  function vizinhos(n, I) {
    const viz = Array.from({ length: n }, () => []), ec = new Map();
    for (let i = 0; i < I.length; i += 3) for (let j = 0; j < 3; j++) { const a = I[i + j], b = I[i + (j + 1) % 3], key = a < b ? a * K + b : b * K + a; ec.set(key, (ec.get(key) || 0) + 1); viz[a].push(b); viz[b].push(a); }
    const borda = new Uint8Array(n); ec.forEach((c, key) => { if (c === 1) { borda[Math.floor(key / K)] = 1; borda[key % K] = 1; } });
    return [viz, borda];
  }
  function taubin(P, viz, borda, it) {
    const n = P.length / 3;
    for (let r = 0; r < it * 2; r++) {
      const lam = r % 2 ? -0.53 : 0.5, T0 = P.slice();
      for (let i = 0; i < n; i++) { if (borda[i]) continue; const vz = viz[i]; let x = 0, y = 0, z = 0; for (let j = 0; j < vz.length; j++) { x += T0[vz[j] * 3]; y += T0[vz[j] * 3 + 1]; z += T0[vz[j] * 3 + 2]; } const c = vz.length; P[i * 3] += lam * (x / c - T0[i * 3]); P[i * 3 + 1] += lam * (y / c - T0[i * 3 + 1]); P[i * 3 + 2] += lam * (z / c - T0[i * 3 + 2]); }
    }
  }
  // processa uma malha (hemisfério ou meio verme), já no sistema do atlas, lado esquerdo
  function processa(src, verme) {
    const g = src.geometry, p = g.attributes.position, n0 = p.count;
    let P = new Float32Array(n0 * 3); for (let i = 0; i < n0; i++) { v.fromBufferAttribute(p, i).applyMatrix4(src.matrix); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z; }
    let I = new Uint32Array(g.index.array);
    let t0 = performance.now(); const soma = (k) => { TEMPOS['cb_' + k] = (TEMPOS['cb_' + k] || 0) + Math.round(performance.now() - t0); t0 = performance.now(); };
    [P, I] = refina(P, I, window.matchMedia && matchMedia('(pointer: coarse)').matches ? 0.11 : 0.085);   // superfície lisa: só as fissuras na geometria
    soma('refina1');
    { const kc = [], kq = (Q, i) => { if (kc[i] === undefined) kc[i] = classifica(Q[i * 3], Q[i * 3 + 1], Q[i * 3 + 2]).k; return kc[i]; };
      [P, I] = refina(P, I, 0, (a, b, d, Q) => d > 0.03 && kq(Q, a) !== kq(Q, b)); }   // afina a malha só onde passa uma fissura: borda limpa
    soma('refina2');
    const n = P.length / 3, [viz, borda] = vizinhos(n, I);
    soma('vizinhos'); taubin(P, viz, borda, 4); soma('taubin');
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(new THREE.BufferAttribute(I, 1)); geo.computeVertexNormals();
    const N = geo.attributes.normal.array, cor = new Float32Array(n * 3), cls = new Array(n);
    for (let i = 0; i < n; i++) {
      const c = cls[i] = classifica(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      const rr = Math.hypot(P[i * 3 + 1] - F[1], P[i * 3 + 2] - F[2]);
      const folha = smooth(1.4, 2.8, rr) * (0.5 + 0.5 * Math.cos(2 * Math.PI * c.t / 2.2));   // folhas: só no sombreado (cor), sem relevo
      let d = 0;
      for (let f = 0; f < 8; f++) { const dt = (c.t - fisAng(c.ax, f)) / 1.5; d += FIS[f][3] * Math.exp(-dt * dt); }   // fissuras
      if (borda[i]) d = 0;
      P[i * 3] -= N[i * 3] * d; P[i * 3 + 1] -= N[i * 3 + 1] * d; P[i * 3 + 2] -= N[i * 3 + 2] * d;
      const sh = Math.max(0.4, Math.min(1, 1.04 - d * 3.2 - folha * 0.16)); cor[i * 3] = cor[i * 3 + 1] = cor[i * 3 + 2] = sh;
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.setAttribute('color', new THREE.BufferAttribute(cor, 3)); soma('classifica');
    // triângulos por lóbulo; os que cruzam uma fissura formam a própria fissura
    const grupos = {};
    for (let i = 0; i < I.length; i += 3) {
      const a = cls[I[i]], b = cls[I[i + 1]], c = cls[I[i + 2]];
      const kmin = Math.min(a.k, b.k, c.k), kmax = Math.max(a.k, b.k, c.k);
      const id = kmax !== kmin ? FIS[kmin][0] : a.L, lobo = kmax !== kmin ? null : a.lobo;
      const gk = id + '|' + (lobo || ''); (grupos[gk] = grupos[gk] || []).push(I[i], I[i + 1], I[i + 2]);
    }
    const pai = verme ? 'vermis' : 'cerebelo', criadas = [];
    Object.keys(grupos).forEach(gk => {
      const [id, lobo] = gk.split('|'), sub = new THREE.BufferGeometry();
      sub.setAttribute('position', geo.attributes.position); sub.setAttribute('normal', geo.attributes.normal); sub.setAttribute('color', geo.attributes.color);
      sub.setIndex(new THREE.BufferAttribute(new Uint32Array(grupos[gk]), 1)); sub.computeBoundingSphere(); sub.computeBoundingBox();
      [1, -1].forEach(sx => {
        const m = new THREE.Mesh(sub, stdMat(META[id].color, { vertexColors: true, roughness: 0.78 }));
        m.matrixAutoUpdate = false; if (sx < 0) m.matrix.copy(ESP);
        register(id, m, sx);
        m.userData.pai = pai; if (lobo) m.userData.lobo = lobo; else m.userData.fis = true;
        itemOf(pai).meshes.push(m); if (lobo) itemOf(lobo).meshes.push(m);
        criadas.push(m);
      });
    });
    return { geo, P, cls };
  }
  // tira as malhas lisas e põe as novas
  const fonte = { cerebelo: ITEMS.cerebelo.meshes[0], vermis: ITEMS.vermis.meshes[0] };
  ['cerebelo', 'vermis'].forEach(id => { ITEMS[id].meshes.forEach(m => { if (m.parent) m.parent.remove(m); const k = ALLMESH.indexOf(m); if (k >= 0) ALLMESH.splice(k, 1); }); ITEMS[id].meshes = []; });
  const HR = processa(fonte.cerebelo, false);
  const VR = processa(fonte.vermis, true);

  // secção sagital do verme: contorno da malha nova e corpo medular desenhado (figura 5.5)
  let SAG = null, CORTE = null;
  (function () {
    const rmax = {};
    const polar = (y, z) => { const dy = y - F[1], dz = z - F[2]; return [Math.atan2(dy * EA[0] + dz * EA[1], dy * ED[0] + dz * ED[1]) * 180 / Math.PI, Math.hypot(dy, dz)]; };
    // em cada ângulo, só os pontos mais próximos do plano mediano (o verme inferior fica a 1-2 mm dele na malha)
    const minx = {}, cada = f => [HR.P, VR.P].forEach(P => { for (let i = 0; i < P.length / 3; i++) { let [t, r] = polar(P[i * 3 + 1], P[i * 3 + 2]); if (t > 185) t -= 360; f(Math.round(t), P[i * 3], r); } });
    cada((b, x) => { if (!(b in minx) || x < minx[b]) minx[b] = x; });
    cada((b, x, r) => { if (minx[b] > 0.3 || x > minx[b] + 0.08) return; if (!rmax[b] || r > rmax[b]) rmax[b] = r; });
    const bins = Object.keys(rmax).map(Number).sort((a, b) => b - a); if (bins.length < 20) return;
    const R = t => { let best = null; bins.forEach(b => { if (best === null || Math.abs(b - t) < Math.abs(best - t)) best = b; }); return rmax[best]; };
    const pt = (t, r) => { const a = t * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return [F[1] + r * (c * ED[0] + sn * EA[0]), F[2] + r * (c * ED[1] + sn * EA[1])]; };   // [y, z]
    const cont = bins.map(b => pt(b, rmax[b] + 0.02));
    let ymin = 1e9, ymax = -1e9, zmin = 1e9, zmax = -1e9; cont.concat([[F[1], F[2]]]).forEach(q => { ymin = Math.min(ymin, q[0]); ymax = Math.max(ymax, q[0]); zmin = Math.min(zmin, q[1]); zmax = Math.max(zmax, q[1]); });
    const W = zmax - zmin, H = ymax - ymin, S = 1024 / Math.max(W, H), cv = document.createElement('canvas'); cv.width = Math.ceil(W * S); cv.height = Math.ceil(H * S);
    const cx = cv.getContext('2d'), C2 = q => [(q[1] - zmin) * S, (ymax - q[0]) * S];
    cx.beginPath(); cx.moveTo.apply(cx, C2([F[1], F[2]])); cont.forEach(q => cx.lineTo.apply(cx, C2(q))); cx.closePath();
    const rm = bins.reduce((t, b) => t + rmax[b], 0) / bins.length, centro = pt(-10, rm * 0.24), BR = '#f3ece4';
    const lim = [Math.max.apply(null, bins)].concat(FIS.map(f => f[1]), [Math.min.apply(null, bins)]);
    const NOMES_L = ['Língula', 'L. central', 'Cúlmen', 'Declive', 'Fólium', 'Túber', 'Pirâmide', 'Úvula', 'Nódulo'];
    const LOBO_COR = k => k <= 2 ? '#e3a86e' : (k <= 7 ? '#cf8e80' : '#9fb26f');
    const clara = (hex, f) => { const c = new THREE.Color(hex); c.lerp(new THREE.Color('#ffffff'), f); return '#' + c.getHexString(); };
    const lam = (a, b, w0, w1) => { const A = C2(a), B = C2(b), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; cx.beginPath(); cx.moveTo(A[0] + nx * w0, A[1] + ny * w0); cx.lineTo(B[0] + nx * w1, B[1] + ny * w1); cx.lineTo(B[0] - nx * w1, B[1] - ny * w1); cx.lineTo(A[0] - nx * w0, A[1] - ny * w0); cx.closePath(); cx.fill(); };
    const setor = (lo, hi, f) => { cx.beginPath(); const c0 = C2([F[1], F[2]]); cx.moveTo(c0[0], c0[1]); for (let t = hi; t >= lo; t -= 0.5) { const c = C2(pt(t, R(t) * f + 0.06)); cx.lineTo(c[0], c[1]); } cx.closePath(); };
    function desenha(sel) {
      cx.clearRect(0, 0, cv.width, cv.height);
      cx.save(); cx.beginPath(); cx.moveTo.apply(cx, C2([F[1], F[2]])); cont.forEach(q => cx.lineTo.apply(cx, C2(q))); cx.closePath(); cx.clip();
      for (let k = 0; k < 9; k++) {   // córtex de cada lóbulo do verme, na cor do lóbulo
        const hi = lim[k], lo = lim[k + 1], id = VERME[k], lob = LOBO(k), on = sel === id || sel === lob || sel === 'vermis';
        cx.fillStyle = on ? clara(META[id].color, 0.25) : META[id].color; setor(lo, hi, 1); cx.fill();
        cx.fillStyle = LOBO_COR(k); setor(lo, hi, 1); cx.save(); cx.clip(); cx.globalAlpha = 0.9; cx.lineWidth = rm * 0.07 * S; cx.strokeStyle = LOBO_COR(k); cx.beginPath(); for (let t = hi; t >= lo; t -= 0.5) { const c = C2(pt(t, R(t) + 0.02)); if (t === hi) cx.moveTo(c[0], c[1]); else cx.lineTo(c[0], c[1]); } cx.stroke(); cx.restore();   // faixa da borda: cor do lobo
      }
      cx.fillStyle = BR; cx.beginPath(); const cc = C2(centro); cx.ellipse(cc[0], cc[1], rm * 0.2 * S, rm * 0.15 * S, 0, 0, Math.PI * 2); cx.fill();
      for (let k = 0; k < 9; k++) {   // corpo medular: lâmina do lóbulo, ramos e um ramúsculo por folha (três níveis)
        const hi = lim[k], lo = lim[k + 1]; if (hi - lo < 2) continue;
        const tc = (hi + lo) / 2, meio = pt(tc, R(tc) * 0.48);
        lam(centro, meio, rm * 0.055 * S, rm * 0.032 * S);
        const ramos = hi - lo > 14 ? [lo + (hi - lo) * 0.28, lo + (hi - lo) * 0.72] : [tc];
        ramos.forEach(tr => {
          const r2 = pt(tr, R(tr) * 0.66); lam(meio, r2, rm * 0.026 * S, rm * 0.016 * S);
          for (let t = Math.max(lo + 1.2, tr - (hi - lo) / 4); t < Math.min(hi - 0.8, tr + (hi - lo) / 4); t += 2.4) { lam(r2, pt(t, R(t) * 0.86), rm * 0.012 * S, rm * 0.004 * S); }
        });
      }
      cx.lineCap = 'round';
      FIS.forEach(f => { const r = R(f[1]), forte = f[0] === 'f_prima' || f[0] === 'f_postlat'; const a = C2(pt(f[1], r * 1.05)), b = C2(pt(f[1], r * (f[3] > 0.2 ? 0.5 : 0.66))); cx.strokeStyle = sel === f[0] ? '#ffd23f' : (forte ? '#3a1a10' : '#6a3a2c'); cx.lineWidth = forte || sel === f[0] ? 5 : 2.4; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); });
      for (let k = 0; k < 9; k++) {   // contorno do lóbulo selecionado
        const id = VERME[k]; if (!(sel === id || sel === LOBO(k))) continue;
        cx.strokeStyle = '#ffd23f'; cx.lineWidth = 4; setor(lim[k + 1], lim[k], 1); cx.stroke();
      }
      cx.restore();
      cx.strokeStyle = '#7a4a3c'; cx.lineWidth = 3; cx.beginPath(); cont.forEach((q, i) => { const c = C2(q); if (i) cx.lineTo(c[0], c[1]); else cx.moveTo(c[0], c[1]); }); cx.stroke();
      cx.font = '600 ' + Math.round(Math.max(15, rm * 0.085 * S)) + 'px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
      for (let k = 0; k < 9; k++) { const hi = lim[k], lo = lim[k + 1], tc = (hi + lo) / 2, c = C2(pt(tc, R(tc) * 0.8)); cx.lineWidth = 5; cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.strokeText(NOMES_L[k], c[0], c[1]); cx.fillStyle = '#2a140c'; cx.fillText(NOMES_L[k], c[0], c[1]); }
      if (tex) tex.needsUpdate = true;
    }
    let tex = null;
    const shp = new THREE.Shape([new THREE.Vector2(F[2], F[1])].concat(cont.map(q => new THREE.Vector2(q[1], q[0]))));
    const sg = new THREE.ShapeGeometry(shp), uv = sg.attributes.uv, ps = sg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (ps.getX(i) - zmin) / W, (ps.getY(i) - ymin) / H);
    tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; desenha(null); CORTE = desenha;
    const m = new THREE.Mesh(sg, stdMat('#ffffff', { map: tex, roughness: 0.85 }));
    m.rotation.y = -Math.PI / 2; m.position.x = 0.004;
    register('arbvida', m, 0); m.userData.corte = true;
    SAG = (t, off) => { const q = pt(t, R(t) + (off || 0)); return [0, q[0], q[1]]; };
  })();
  return { corte: sel => CORTE && CORTE(sel), F, classifica, HP: HR.P, sag: (t, off) => SAG ? SAG(t, off) : [0, F[1], F[2]] };
})();

marcaT('cerebelo');
/* ---- envelopes da malha: servem para apoiar vasos e nervos sobre a superfície real ---- */
const CEL = 0.2, Y0 = -5.6, Z0 = -9.6, NY = 68, NZ = 92, NX = 40;
function mkEnv(sx) {
  const C = new THREE.Vector3(sx * 2.2, 1.0, -0.4);
  const NT = 72, NP = 144, rad = new Float32Array(NT * NP);
  const med = new Float32Array(NY * NZ).fill(99), lat = new Float32Array(NY * NZ).fill(-99);
  const inf = new Float32Array(NX * NZ).fill(99), topo = new Float32Array(NZ).fill(-99);
  const v = new THREE.Vector3();
  cortexMeshes.forEach(m => {
    if (m.userData.side !== sx) return;
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrix);
      const ax = v.x * sx, iy = Math.floor((v.y - Y0) / CEL), iz = Math.floor((v.z - Z0) / CEL), ix = Math.floor((ax + 0.6) / CEL);
      if (iz >= 0 && iz < NZ) {
        if (iy >= 0 && iy < NY) { const k = iy * NZ + iz; if (ax < med[k]) med[k] = ax; if (ax > lat[k]) lat[k] = ax; }
        if (ix >= 0 && ix < NX) { const k = ix * NZ + iz; if (v.y < inf[k]) inf[k] = v.y; }
        if (ax < 1.5 && v.y > topo[iz]) topo[iz] = v.y;
      }
      const dx = (v.x - C.x) * sx, dy = v.y - C.y, dz = v.z - C.z, r = Math.hypot(dx, dy, dz);
      const it = Math.min(NT - 1, Math.floor(Math.acos(dy / r) / Math.PI * NT));
      const ip = Math.floor((Math.atan2(dx, dz) + Math.PI) / (2 * Math.PI) * NP) % NP;
      if (r > rad[it * NP + ip]) rad[it * NP + ip] = r;
    }
  });
  const viz = (arr, n1, n2, i1, i2, pior, melhor) => {
    let b = pior;
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
      const j1 = i1 + a, j2 = i2 + c; if (j1 < 0 || j1 >= n1 || j2 < 0 || j2 >= n2) continue;
      const x = arr[j1 * n2 + j2]; if (Math.abs(x) > 90) continue; b = melhor(b, x);
    }
    return b;
  };
  return {
    C,
    // ponto sobre o invólucro externo (crista dos giros), na direção centro -> P, com folga off
    radial(P, off) {
      const dx = (P[0] - C.x) * sx, dy = P[1] - C.y, dz = P[2] - C.z, r = Math.hypot(dx, dy, dz) || 1;
      const it = Math.min(NT - 1, Math.floor(Math.acos(dy / r) / Math.PI * NT)), ip = Math.floor((Math.atan2(dx, dz) + Math.PI) / (2 * Math.PI) * NP) % NP;
      let R = 0;
      for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const jt = it + a; if (jt < 0 || jt >= NT) continue; R = Math.max(R, rad[jt * NP + (ip + c + NP) % NP]); }
      if (!R) R = r;
      const k = (R + off) / r;
      return [(C.x * sx + dx * k) * sx, C.y + dy * k, C.z + dz * k];
    },
    med(y, z) { const b = viz(med, NY, NZ, Math.floor((y - Y0) / CEL), Math.floor((z - Z0) / CEL), 99, Math.min); return b > 90 ? 0.35 : b; },
    lat(y, z) { return viz(lat, NY, NZ, Math.floor((y - Y0) / CEL), Math.floor((z - Z0) / CEL), -99, Math.max); },
    inf(x, z) { const b = viz(inf, NX, NZ, Math.floor((x + 0.6) / CEL), Math.floor((z - Z0) / CEL), 99, Math.min); return b > 90 ? -1.5 : b; },
    topo(z) { const i = Math.floor((z - Z0) / CEL); let b = -99; for (let a = -1; a <= 1; a++) if (i + a >= 0 && i + a < NZ) b = Math.max(b, topo[i + a]); return b; }
  };
}
const ENV = { 1: mkEnv(1), '-1': mkEnv(-1) };
const surf = (sx, pts, off) => pts.map(p => ENV[sx].radial(p, off === undefined ? 0.09 : off));
const medP = (sx, pts, off) => pts.map(p => [sx * Math.max(0.05, Math.min(0.9, ENV[sx].med(p[1], p[2]) - (off === undefined ? 0.09 : off))), p[1], p[2]]);
const infP = (sx, xz, off) => xz.map(q => [sx * q[0], ENV[sx].inf(q[0], q[1]) - (off === undefined ? 0.1 : off), q[1]]);

// contorno sagital mediano (margem superior dos hemisférios), em ângulo: 0 = anterior, 90 = superior, 180 = posterior
const CONT = (function () {
  const N = 180, R = new Float32Array(N), cy = 0.8, cz = -0.4, v = new THREE.Vector3();
  cortexMeshes.forEach(m => {
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrix); if (Math.abs(v.x) > 0.8) continue;
      const a = Math.atan2(v.y - cy, v.z - cz), k = Math.floor(((a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N) % N, r = Math.hypot(v.y - cy, v.z - cz);
      if (r > R[k]) R[k] = r;
    }
  });
  return {
    pt(grau, off) {
      const a = grau * Math.PI / 180, k = Math.floor(((a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N) % N;
      const r = (R[(k + N - 1) % N] + R[k] * 2 + R[(k + 1) % N]) / 4 + off;
      return [0, cy + Math.sin(a) * r, cz + Math.cos(a) * r];
    }
  };
})();

/* ---- marcos calculados na conversão: centroides e bordas entre regiões Desikan-Killiany ---- */
const MARCOS = JSON.parse(document.getElementById('marcos').textContent);
// modelo simétrico: os marcos do lado direito são os do esquerdo com x trocado de sinal
(function () {
  const e = MARCOS.hemis.lh, esp = p => [-p[0], p[1], p[2]], d = { lado: -1, centroides: {}, bordas: {} };
  Object.keys(e.centroides).forEach(k => d.centroides[k] = esp(e.centroides[k]));
  Object.keys(e.bordas).forEach(k => d.bordas[k] = e.bordas[k].map(esp));
  MARCOS.hemis.rh = d;
})();
const HK = sx => sx > 0 ? 'lh' : 'rh';
const cen = (sx, n) => MARCOS.hemis[HK(sx)].centroides[n].slice();
function bd(sx) {
  let out = [];
  for (let i = 1; i < arguments.length; i++) { const b = MARCOS.hemis[HK(sx)].bordas[arguments[i].split('|').sort().join('|')]; if (b) out = out.concat(b); }
  return out;
}
// ordena uma nuvem de pontos por uma chave e resume em n pontos
function emOrdem(pts, chave, n) {
  const s = pts.slice().sort((a, b) => chave(a) - chave(b)), out = [];
  for (let i = 0; i < n; i++) { const g = s.slice(Math.floor(i * s.length / n), Math.max(Math.floor(i * s.length / n) + 1, Math.floor((i + 1) * s.length / n))); if (g.length) out.push(media(g)); }
  return out;
}
// ordena pontos da face medial pelo ângulo em torno do corpo caloso
const CCY = 1.3, CCZ = 0.6;
function arco(pts, a0, a1, passo) {
  const ang = p => { let a = Math.atan2(p[1] - CCY, p[2] - CCZ) * 180 / Math.PI; if (a < a0 - 5) a += 360; return a; };
  const out = [];
  for (let a = a0; a < a1; a += passo) { const g = pts.filter(p => { const x = ang(p); return x >= a && x < a + passo; }); if (g.length) out.push(media(g)); }
  return out;
}
const fora = (p, d) => { const dy = p[1] - CCY, dz = p[2] - CCZ, L = Math.hypot(dy, dz) || 1; return [p[0], p[1] + dy / L * d, p[2] + dz / L * d]; };

// lábio temporal do sulco lateral: borda superior do giro temporal superior vista de lado, de anterior para posterior
const SYLV = {};
[1, -1].forEach(sx => {
  const E = ENV[sx], melhor = {}, v = new THREE.Vector3();
  cortexMeshes.forEach(m => {
    if (m.userData.side !== sx || m.userData.dk !== 'superiortemporal') return;
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrix);
      if (v.x * sx < E.lat(v.y, v.z) - 0.45) continue;
      const b = Math.floor(v.z / 0.4);
      if (!melhor[b] || v.y > melhor[b][1]) melhor[b] = [v.x, v.y, v.z];
    }
  });
  let L = Object.keys(melhor).map(Number).sort((a, b) => b - a).map(b => melhor[b]);
  L = L.map((p, i) => media(L.slice(Math.max(0, i - 1), i + 2)));
  SYLV[sx] = L;
});
function S(sx, u) { const L = SYLV[sx], f = clamp01(u) * (L.length - 1), i = Math.min(L.length - 2, Math.floor(f)); const p = mix(L[i], L[i + 1], f - i); return [p[0], p[1] + 0.12, p[2]]; }
function sylvPerto(sx, p) { const L = SYLV[sx]; let b = L[0]; L.forEach(q => { if (Math.abs(q[2] - p[2]) < Math.abs(b[2] - p[2])) b = q; }); return [b[0], b[1] + 0.12, b[2]]; }

marcaT('envelopes');
