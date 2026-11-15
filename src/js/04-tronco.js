/* ===== TRONCO ENCEFÁLICO: acidentes da superfície (Machado, cap. 5, p. 43-46, figuras 5.1 e 5.2) =====
   Mesencéfalo, ponte e bulbo da malha real são unidos numa malha só, refinada e suavizada. Cada ponto é medido
   no referencial do tronco (nível ao longo do perfil ventral, distância lateral, profundidade ventral-dorsal) e
   classificado; sulcos são cavados e eminências elevadas. Cada acidente vira um item selecionável. */
(function () {
  const K = 4194304, v = new THREE.Vector3(), PERF = MARCOS.tronco.perfil, SP = PERF.map(q => q[0] * 0.913 + q[1] * 0.408), NP = PERF.length - 1;
  const nivel = (y, z) => { const sv = y * 0.913 + z * 0.408; if (sv >= SP[0]) return -(sv - SP[0]) / (SP[0] - SP[1]); for (let i = 0; i < NP; i++) if (sv <= SP[i] && sv >= SP[i + 1]) return i + (SP[i] - sv) / (SP[i] - SP[i + 1]); return NP + (SP[NP] - sv) / (SP[NP - 1] - SP[NP]); };
  const prof = (i, y, z) => { const a = Math.max(0, Math.min(NP - 1, Math.floor(i))), t = Math.max(0, Math.min(1, i - a)); const py = PERF[a][0] + (PERF[a + 1][0] - PERF[a][0]) * t, pz = PERF[a][1] + (PERF[a + 1][1] - PERF[a][1]) * t; return (y - py) * 0.408 - (z - pz) * 0.913; };
  // 1. junta as três malhas (lado esquerdo), soldando os vértices repetidos nas emendas
  const PARTES = ['mesenc', 'ponte', 'bulbo'], Q = [], T = [], TAG = [], solda = new Map();
  PARTES.forEach((id, pi) => {
    const m = ITEMS[id].meshes[0], g = m.geometry, p = g.attributes.position, map = new Array(p.count);
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); const key = Math.round(v.x * 1e4) + ',' + Math.round(v.y * 1e4) + ',' + Math.round(v.z * 1e4); let r = solda.get(key); if (r === undefined) { r = Q.length / 3; Q.push(v.x, v.y, v.z); solda.set(key, r); } map[k] = r; }
    const I = g.index.array; for (let k = 0; k < I.length; k += 3) { T.push(map[I[k]], map[I[k + 1]], map[I[k + 2]]); TAG.push(pi); }
  });
  PARTES.forEach(id => { ITEMS[id].meshes.forEach(m => { if (m.parent) m.parent.remove(m); const k = ALLMESH.indexOf(m); if (k >= 0) ALLMESH.splice(k, 1); }); ITEMS[id].meshes = []; });
  // 2. refina (arestas longas divididas, sem rachaduras), levando junto a parte de cada triângulo
  let tri = T, tag = TAG;
  const L = window.matchMedia && matchMedia('(pointer: coarse)').matches ? 0.055 : 0.035;
  for (let it = 0; it < 7; it++) {
    const mid = new Map(), out = [], otag = []; let any = false;
    const md = (a, b) => { const key = a < b ? a * K + b : b * K + a; let r = mid.get(key); if (r === undefined) { const d = Math.hypot(Q[a * 3] - Q[b * 3], Q[a * 3 + 1] - Q[b * 3 + 1], Q[a * 3 + 2] - Q[b * 3 + 2]); if (d <= L) r = -1; else { r = Q.length / 3; Q.push((Q[a * 3] + Q[b * 3]) / 2, (Q[a * 3 + 1] + Q[b * 3 + 1]) / 2, (Q[a * 3 + 2] + Q[b * 3 + 2]) / 2); any = true; } mid.set(key, r); } return r; };
    for (let i = 0; i < tri.length; i += 3) {
      const a = tri[i], b = tri[i + 1], c = tri[i + 2], m0 = md(a, b), m1 = md(b, c), m2 = md(c, a), n = (m0 >= 0) + (m1 >= 0) + (m2 >= 0), t0 = tag[i / 3], o0 = out.length;
      if (n === 0) out.push(a, b, c);
      else if (n === 3) out.push(a, m0, m2, m0, b, m1, m2, m1, c, m0, m1, m2);
      else if (n === 1) { if (m0 >= 0) out.push(a, m0, c, m0, b, c); else if (m1 >= 0) out.push(b, m1, a, m1, c, a); else out.push(c, m2, b, m2, a, b); }
      else { if (m2 < 0) out.push(m0, b, m1, a, m0, m1, a, m1, c); else if (m0 < 0) out.push(m1, c, m2, b, m1, m2, b, m2, a); else out.push(m2, a, m0, c, m2, m0, c, m0, b); }
      for (let k = o0; k < out.length; k += 3) otag.push(t0);
    }
    tri = out; tag = otag; if (!any) break;
  }
  const P = new Float32Array(Q), I = new Uint32Array(tri), n = P.length / 3;
  // 3. suaviza (Taubin), com a borda do plano mediano presa
  const viz = Array.from({ length: n }, () => []), ec = new Map();
  for (let i = 0; i < I.length; i += 3) for (let j = 0; j < 3; j++) { const a = I[i + j], b = I[i + (j + 1) % 3], key = a < b ? a * K + b : b * K + a; ec.set(key, (ec.get(key) || 0) + 1); viz[a].push(b); viz[b].push(a); }
  const borda = new Uint8Array(n); ec.forEach((c, key) => { if (c === 1) { borda[Math.floor(key / K)] = 1; borda[key % K] = 1; } });
  for (let i = 0; i < n; i++) if (borda[i] && Math.abs(P[i * 3]) < 0.15) P[i * 3] = 0;   // a borda da metade não cai exatamente no plano mediano: sem isso fica uma fresta entre as metades
  for (let r = 0; r < 6; r++) { const lam = r % 2 ? -0.53 : 0.5, T0 = P.slice(); for (let i = 0; i < n; i++) { if (borda[i]) continue; const vz = viz[i]; let x = 0, y = 0, z = 0; for (let j = 0; j < vz.length; j++) { x += T0[vz[j] * 3]; y += T0[vz[j] * 3 + 1]; z += T0[vz[j] * 3 + 2]; } const c = vz.length; P[i * 3] += lam * (x / c - T0[i * 3]); P[i * 3 + 1] += lam * (y / c - T0[i * 3 + 1]); P[i * 3 + 2] += lam * (z / c - T0[i * 3 + 2]); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(new THREE.BufferAttribute(I, 1)); geo.computeVertexNormals();
  // 4. assoalho do IV ventrículo: pontos da superfície dorsal colados à malha real do ventrículo
  const grade = new Map(), CEL = 0.2, gk = (x, y, z) => Math.floor(x / CEL) + ',' + Math.floor(y / CEL) + ',' + Math.floor(z / CEL);
  { const m = ITEMS.v4.meshes[0], p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); const q = [Math.abs(v.x), v.y, v.z], key = gk(q[0], q[1], q[2]); (grade.get(key) || grade.set(key, []).get(key)).push(q); } }
  const pertoV4 = (x, y, z) => { const cx = Math.floor(x / CEL), cy = Math.floor(y / CEL), cz = Math.floor(z / CEL); let b = 9; for (let a = -1; a <= 1; a++) for (let bb = -1; bb <= 1; bb++) for (let c = -1; c <= 1; c++) { const L2 = grade.get((cx + a) + ',' + (cy + bb) + ',' + (cz + c)); if (L2) L2.forEach(q => { const d = (q[0] - x) ** 2 + (q[1] - y) ** 2 + (q[2] - z) ** 2; if (d < b) b = d; }); } return Math.sqrt(b); };
  const el = (u, w, cu, cw, ru, rw) => ((u - cu) / ru) ** 2 + ((w - cw) / rw) ** 2;
  const sul = (dist, sg, d) => -d * Math.exp(-(dist / sg) * (dist / sg));
  const bossa = (r2, h) => r2 < 1 ? h * (1 - r2) * (1 - r2) : 0;
  const N = geo.attributes.normal.array, lab = new Array(n), desl = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const x = P[k * 3], y = P[k * 3 + 1], z = P[k * 3 + 2], ax = Math.abs(x), i = nivel(y, z), pr = prof(i, y, z);
    const nd = N[k * 3 + 1] * 0.408 - N[k * 3 + 2] * 0.913, ventral = nd < -0.25, dorsal = nd > 0.25;
    let L = null, d = 0;
    const assoalho = dorsal && i > 8 && i < 26.7 && pertoV4(ax, y, z) < 0.22;
    if (ventral && i < 4.6) {   // mesencéfalo, face ventral
      d += ax < 0.36 ? -0.13 * (1 - (ax / 0.36) ** 2) : 0; d += sul(ax - 0.4, 0.04, 0.05);
      L = ax < 0.36 ? 'fossaip' : (ax < 0.45 ? 'sulmedped' : null);
    } else if (ventral && i < 21.7) {   // ponte, face ventral
      d += sul(ax, 0.07, 0.05) + 0.012 * (0.5 + 0.5 * Math.cos(2 * Math.PI * i / 0.55)) * -1 * smooth(0.08, 0.2, ax);
      L = ax < 0.08 ? 'sulbas' : 'baseponte';
    }
    if (ventral && i > 21.3 && i < 22.8 && ax < 1.35) { d += sul((i - 22) * 0.2, 0.05, 0.07); if (Math.abs(i - 22) < 0.35) L = 'sulbp'; }
    if (i >= 22.35 && !dorsal) {   // bulbo, faces ventral e lateral
      if (ventral) {
        if (i < 27.6) d += sul(ax, 0.045, 0.08); else d += -0.025 * (0.5 + 0.5 * Math.cos(2 * Math.PI * ((i - 27.6) * 0.2 + ax * (x > 0 ? 1 : -1) * 0.7) / 0.12));
        d += ax < 0.46 ? 0.045 * Math.sin(Math.PI * ax / 0.46) : 0; d += sul(ax - 0.5, 0.04, 0.05);
        if (!L || L === 'sulbp') { if (Math.abs(i - 22) >= 0.35) L = ax < 0.06 && i < 27.6 ? 'fismedant' : (ax < 0.46 ? (i > 27.6 ? 'decpir' : 'piramide') : (ax < 0.56 ? 'sulantlat' : null)); }
      }
      const ro = el(pr, i, 0.45, 24.2, 0.3, 1.7);
      if (ax > 0.5) { d += bossa(ro, 0.13); if (ro < 1) L = 'oliva'; }
      if (ax > 0.6) { d += sul(pr - 0.85, 0.04, 0.05); if (Math.abs(pr - 0.85) < 0.06 && ro >= 1) L = 'sulpostlat'; }
    }
    if (!ventral && !dorsal && i < 4.6 && ax > 0.8) { d += sul(pr - 0.85, 0.04, 0.04); if (Math.abs(pr - 0.85) < 0.06) L = 'sullatmes'; }
    if (assoalho) {   // assoalho do IV ventrículo
      L = 'fossarom'; d += sul(ax, 0.04, 0.05); if (ax < 0.05) L = 'sulmedfr';
      if (i < 21.3) {
        const rc = el(ax, i, 0.2, 18.6, 0.13, 0.9), rf = el(ax, i, 0.42, 18.6, 0.1, 0.7);
        d += ax < 0.32 ? 0.025 * Math.sin(Math.PI * ax / 0.32) : 0; d += bossa(rc, 0.08); d += sul(ax - 0.37, 0.035, 0.04) - (rf < 1 ? 0.05 * (1 - rf) : 0);
        if (ax >= 0.05) L = rc < 1 ? 'colfac' : (ax < 0.32 ? 'eminmed' : (rf < 1 ? 'fovsup' : (ax < 0.42 ? 'sullim' : (i < 13 && ax < 0.65 ? 'locus' : (i > 17 ? 'areavest' : 'fossarom')))));
      } else if (i < 22.4) { d += 0.015 * Math.max(0, Math.cos(2 * Math.PI * (i - 21.3) / 0.27)); if (ax >= 0.05) L = 'estrias'; }
      else {
        const f = (26.6 - i) / 4.2, rfi = el(ax, i, 0.35, 23.2, 0.1, 0.6);
        d += sul(ax - 0.31, 0.03, 0.035) - (rfi < 1 ? 0.05 * (1 - rfi) : 0);
        if (i > 26.2 && ax < 0.15) L = 'obex';
        else if (ax >= 0.05) L = ax < 0.28 * f + 0.03 ? 'trighipo' : (rfi < 1 ? 'fovinf' : (i > 23.3 && ax < 0.55 * f + 0.1 ? 'trigvago' : (i > 25 && ax < 0.75 * f + 0.25 ? 'areapostrema' : (i < 24.2 && ax > 0.4 ? 'areavest' : 'fossarom'))));
      }
    } else if (dorsal && i > 25.5) {   // bulbo, face dorsal abaixo do óbex
      const rg = el(ax, i, 0.17, 26.7, 0.14, 0.8), rcu = el(ax, i, 0.52, 26.3, 0.16, 0.7);
      d += sul(ax, 0.04, 0.05) + sul(ax - 0.345, 0.03, 0.035) + bossa(rg, 0.07) + bossa(rcu, 0.06);
      L = ax < 0.05 ? 'sulmedpost' : (ax < 0.32 ? (rg < 1 ? 'tubgrac' : 'fgrac') : (ax < 0.37 ? 'sulintpost' : (ax < 0.75 ? (rcu < 1 ? 'tubcun' : 'fcun') : null)));
    }
    lab[k] = L; desl[k] = d;
  }
  // 5. desloca ao longo da normal; no plano mediano só no próprio plano, para as duas metades continuarem coladas
  const cor = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    let nx = N[k * 3], ny = N[k * 3 + 1], nz = N[k * 3 + 2];
    if (borda[k]) { if (Math.abs(P[k * 3]) > 0.02) { desl[k] = 0; } else { nx = 0; const l = Math.hypot(ny, nz) || 1; ny /= l; nz /= l; } }
    const d = desl[k]; P[k * 3] += nx * d; P[k * 3 + 1] += ny * d; P[k * 3 + 2] += nz * d;
    const sh = Math.max(0.5, Math.min(1, 0.96 + d * 3)); cor[k * 3] = cor[k * 3 + 1] = cor[k * 3 + 2] = sh;
  }
  geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  // 6. separa por acidente e por parte (mesencéfalo, ponte, bulbo)
  const grupos = {};
  for (let t = 0; t < I.length; t += 3) {
    const parte = PARTES[tag[t / 3]], ls = [lab[I[t]], lab[I[t + 1]], lab[I[t + 2]]];
    const L = ls[0] && ls[0] === ls[1] ? ls[0] : (ls[1] && ls[1] === ls[2] ? ls[1] : (ls[0] && ls[0] === ls[2] ? ls[0] : ls[0]));
    const key = (L || parte) + '|' + parte; (grupos[key] = grupos[key] || []).push(I[t], I[t + 1], I[t + 2]);
  }
  const ESP = new THREE.Matrix4().makeScale(-1, 1, 1);
  Object.keys(grupos).forEach(key => {
    const [id, parte] = key.split('|'), sub = new THREE.BufferGeometry();
    sub.setAttribute('position', geo.attributes.position); sub.setAttribute('normal', geo.attributes.normal); sub.setAttribute('color', geo.attributes.color);
    sub.setIndex(new THREE.BufferAttribute(new Uint32Array(grupos[key]), 1)); sub.computeBoundingSphere(); sub.computeBoundingBox();
    [1, -1].forEach(sx => {
      const m = new THREE.Mesh(sub, stdMat(META[id].color, { vertexColors: true, roughness: 0.66 }));
      m.matrixAutoUpdate = false; if (sx < 0) m.matrix.copy(ESP);
      register(id, m, 0);
      if (id !== parte) { m.userData.pai = parte; itemOf(parte).meshes.push(m); if (/^(sul|fis)/.test(id) || id === 'obex') m.userData.fis = true; }
    });
  });
})();

marcaT('tronco');
