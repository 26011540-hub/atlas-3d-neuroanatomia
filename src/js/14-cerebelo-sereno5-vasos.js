/* ===== VASOS, SEIOS E TENTÓRIO JUNTO AO CEREBELO REAL (reforma do cerebelo, Fase 4) =====
   O cerebelo do Sereno é maior e de forma diferente do cerebelo antigo do atlas: artérias cerebelares (esquema e
   TopBrain), veias cerebelares, seios e as pregas da dura (tentório e foice do cerebelo) passavam por dentro dele.
   Aqui cada malha desses itens é conferida contra a superfície lisa do Sereno (nível "estudo") e os vértices que
   ficam dentro são empurrados para fora pelo caminho mais curto (eixo x, y ou z), com uma folga. O empurrão se
   espalha pelos vizinhos na malha (o tubo inteiro se desloca, não só a parede que encosta), e a conferência é
   repetida até nada ficar dentro. As origens das artérias não mudam: SCA e AICA saem da basilar e a PICA da
   vertebral (no TopBrain, como na angiografia do paciente; no esquema, como no Machado, cap. 8). */
const CBV = { pronto: false, grades: null, relatorio: {}, ITENS: ['vertebral', 'basilar', 'pica', 'aica', 'sca', 'v_vermsup', 'v_verminf', 'v_cerebsup', 'v_cerebinf', 'sreto', 'torcula', 'stransv', 'ssigm', 'socc', 'v_occint', 'tentorio', 'foicecb'], FOLGA: { art: 0.06, ven: 0.06, men: 0.03 },
  // ramo -> tronco de origem: quando o tronco é empurrado, o começo do ramo vai junto (não se solta da origem)
  ORIGEM: { pica: 'vertebral', aica: 'basilar', sca: 'basilar' }, desl: {} };
// grades de colunas: para cada eixo, os cruzamentos da superfície em cada coluna (passo de 0,8 mm)
function cbvGrades(m) {
  const g = m.geometry, P = g.attributes.position.array, I = g.index.array, box = new THREE.Box3().setFromObject(m), G = 0.08, gr = {};
  [[0, 1, 2], [1, 2, 0], [2, 0, 1]].forEach(([ax, u, v]) => {
    const u0 = box.min.getComponent(u), v0 = box.min.getComponent(v), nu = Math.ceil((box.max.getComponent(u) - u0) / G) + 1, nv = Math.ceil((box.max.getComponent(v) - v0) / G) + 1, col = Array.from({ length: nu * nv }, () => []);
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, us = [P[a + u], P[b + u], P[c + u]], vs = [P[a + v], P[b + v], P[c + v]];
      const ar = (us[1] - us[0]) * (vs[2] - vs[0]) - (vs[1] - vs[0]) * (us[2] - us[0]); if (Math.abs(ar) < 1e-12) continue;
      const i0 = Math.max(0, Math.ceil((Math.min(...us) - u0) / G)), i1 = Math.min(nu - 1, Math.floor((Math.max(...us) - u0) / G)), j0 = Math.max(0, Math.ceil((Math.min(...vs) - v0) / G)), j1 = Math.min(nv - 1, Math.floor((Math.max(...vs) - v0) / G));
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const uu = u0 + i * G, vv = v0 + j * G, w0 = ((us[1] - uu) * (vs[2] - vv) - (vs[1] - vv) * (us[2] - uu)) / ar, w1 = ((us[2] - uu) * (vs[0] - vv) - (vs[2] - vv) * (us[0] - uu)) / ar, w2 = 1 - w0 - w1; if (w0 >= 0 && w1 >= 0 && w2 >= 0) col[i * nv + j].push(w0 * P[a + ax] + w1 * P[b + ax] + w2 * P[c + ax]); }
    }
    col.forEach(c => c.sort((p, q) => p - q));
    gr[ax] = { u, v, u0, v0, nu, nv, G, col };
  });
  return gr;
}
const _cbvP = [0, 0, 0];
// dentro? e, se dentro, o deslocamento mínimo para fora (com folga)
function cbvSaida(x, y, z, folga) {
  _cbvP[0] = x; _cbvP[1] = y; _cbvP[2] = z;
  let melhor = null;
  for (let ax = 0; ax < 3; ax++) {
    const gq = CBV.grades[ax], i = Math.round((_cbvP[gq.u] - gq.u0) / gq.G), j = Math.round((_cbvP[gq.v] - gq.v0) / gq.G);
    if (i < 0 || j < 0 || i >= gq.nu || j >= gq.nv) return null;
    const c = gq.col[i * gq.nv + j], s = _cbvP[ax]; let k = 0; while (k < c.length && c[k] < s) k++;
    if (k % 2 === 0) return null;   // número par de cruzamentos antes: fora (basta um eixo dizer fora)
    const baixo = c[k - 1] - folga - s, cima = c[k] + folga - s;
    [baixo, cima].forEach(d => { if (!melhor || Math.abs(d) < Math.abs(melhor[1])) melhor = [ax, d]; });
  }
  return melhor;
}
// empurra para fora os vértices de uma geometria (todas as instâncias dela), espalhando o empurrão pelos vizinhos
function cbvCorrigir(geo, instancias, folga) {
  const p = geo.attributes.position, n = p.count, v = new THREE.Vector3(), inv = new THREE.Matrix4(), D0 = new Float32Array(n * 3);
  let dentro = 0;
  instancias.forEach(m => {
    m.updateMatrixWorld(true); inv.copy(m.matrixWorld).invert();
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); const s = cbvSaida(v.x, v.y, v.z, folga); if (!s) continue;
      const w = v.clone(); w.setComponent(s[0], w.getComponent(s[0]) + s[1]); w.applyMatrix4(inv).sub(new THREE.Vector3().fromBufferAttribute(p, i));
      if (w.lengthSq() > D0[i * 3] ** 2 + D0[i * 3 + 1] ** 2 + D0[i * 3 + 2] ** 2) { D0[i * 3] = w.x; D0[i * 3 + 1] = w.y; D0[i * 3 + 2] = w.z; }
      dentro++;
    }
  });
  if (!dentro) return 0;
  // vizinhos (soldando vértices repetidos pela posição)
  const chave = new Map(), rep = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = p.getX(i).toFixed(4) + ',' + p.getY(i).toFixed(4) + ',' + p.getZ(i).toFixed(4); if (!chave.has(k)) chave.set(k, i); rep[i] = chave.get(k); }
  const viz = Array.from({ length: n }, () => []), ix = geo.index ? geo.index.array : null, nt = ix ? ix.length : n;
  for (let t = 0; t < nt; t += 3) { const q = [rep[ix ? ix[t] : t], rep[ix ? ix[t + 1] : t + 1], rep[ix ? ix[t + 2] : t + 2]]; for (let e = 0; e < 3; e++) { viz[q[e]].push(q[(e + 1) % 3]); viz[q[(e + 1) % 3]].push(q[e]); } }
  let D = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const r = rep[i]; for (let d = 0; d < 3; d++) if (Math.abs(D0[i * 3 + d]) > Math.abs(D[r * 3 + d])) D[r * 3 + d] = D0[i * 3 + d]; }
  const base = D.slice();
  for (let it = 0; it < 10; it++) {   // espalha: cada vértice fica com a média dos vizinhos, mas nunca menos que o próprio empurrão
    const N = D.slice();
    for (let i = 0; i < n; i++) { if (rep[i] !== i || !viz[i].length) continue; let sx = D[i * 3], sy = D[i * 3 + 1], sz = D[i * 3 + 2]; viz[i].forEach(j => { sx += D[j * 3]; sy += D[j * 3 + 1]; sz += D[j * 3 + 2]; }); const k = viz[i].length + 1; N[i * 3] = sx / k; N[i * 3 + 1] = sy / k; N[i * 3 + 2] = sz / k; const b2 = base[i * 3] ** 2 + base[i * 3 + 1] ** 2 + base[i * 3 + 2] ** 2; if (N[i * 3] ** 2 + N[i * 3 + 1] ** 2 + N[i * 3 + 2] ** 2 < b2) { N[i * 3] = base[i * 3]; N[i * 3 + 1] = base[i * 3 + 1]; N[i * 3 + 2] = base[i * 3 + 2]; } }
    D = N;
  }
  if (instancias.length === 1) { const m = instancias[0], W = [], Dw = [], a = new THREE.Vector3(), b = new THREE.Vector3(); for (let i = 0; i < n; i += 2) { a.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); b.set(p.getX(i) + D[rep[i] * 3], p.getY(i) + D[rep[i] * 3 + 1], p.getZ(i) + D[rep[i] * 3 + 2]).applyMatrix4(m.matrixWorld); W.push(a.x, a.y, a.z); Dw.push(b.x - a.x, b.y - a.y, b.z - a.z); } (CBV.desl[m.userData.id] || (CBV.desl[m.userData.id] = [])).push({ W, Dw }); }
  for (let i = 0; i < n; i++) { const r = rep[i]; p.setXYZ(i, p.getX(i) + D[r * 3], p.getY(i) + D[r * 3 + 1], p.getZ(i) + D[r * 3 + 2]); }
  p.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
  return dentro;
}
// o começo do ramo acompanha o deslocamento do tronco de origem (peso cai a zero em 8 mm)
function cbvAcompanhar(m, pai) {
  const L = CBV.desl[pai]; if (!L || !L.length) return;
  m.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(m.matrixWorld).invert(), p = m.geometry.attributes.position, v = new THREE.Vector3(), R = 0.8;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); let bd = 1e9, bx = 0, by = 0, bz = 0;
    L.forEach(({ W, Dw }) => { for (let k = 0; k < W.length; k += 3) { const d = (W[k] - v.x) ** 2 + (W[k + 1] - v.y) ** 2 + (W[k + 2] - v.z) ** 2; if (d < bd) { bd = d; bx = Dw[k]; by = Dw[k + 1]; bz = Dw[k + 2]; } } });
    const w = Math.max(0, 1 - Math.sqrt(bd) / R); if (w <= 0 || (bx === 0 && by === 0 && bz === 0)) continue;
    v.x += bx * w; v.y += by * w; v.z += bz * w; v.applyMatrix4(inv); p.setXYZ(i, v.x, v.y, v.z);
  }
  p.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
}
function cbvContar(m) {
  const p = m.geometry.attributes.position, v = new THREE.Vector3(); let d = 0; m.updateMatrixWorld(true);
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); if (cbvSaida(v.x, v.y, v.z, 0)) d++; }
  return d;
}
// corrige o que ainda não foi conferido (malhas carregadas depois, como as do TopBrain, entram na próxima passada)
function cbvPassada() {
  if (!CBV.pronto) return;
  const porGeo = new Map();
  CBV.ITENS.forEach(id => (ITEMS[id] ? ITEMS[id].meshes : []).forEach(m => { if (m.userData.cbvOk || !m.geometry || !m.geometry.attributes.position) return; const k = m.geometry.uuid; (porGeo.get(k) || porGeo.set(k, { geo: m.geometry, inst: [], id }).get(k)).inst.push(m); }));
  if (!porGeo.size) return;
  porGeo.forEach(({ geo, inst, id }) => {
    const folga = CBV.FOLGA[META[id].grp] || 0.05, r = CBV.relatorio[id] || (CBV.relatorio[id] = { antes: 0, depois: 0, vertices: 0 });
    if (inst.length === 1 && CBV.ORIGEM[id] && inst[0].userData.tb) cbvAcompanhar(inst[0], CBV.ORIGEM[id]);
    const antes = inst.reduce((s, m) => s + cbvContar(m), 0); r.antes += antes; r.vertices += geo.attributes.position.count * inst.length;
    if (antes) for (let k = 0; k < 4; k++) if (!cbvCorrigir(geo, inst, folga)) break;
    r.depois += inst.reduce((s, m) => s + cbvContar(m), 0);
    inst.forEach(m => { m.userData.cbvOk = true; });
  });
  Object.keys(ANC).forEach(k => delete ANC[k]); Object.keys(centroRot).forEach(k => delete centroRot[k]);
  marca();
}
function cbvIniciar() {
  if (CBV.iniciando) return; CBV.iniciando = true;
  cbsCarregar('estudo').then(m => { CBV.grades = cbvGrades(m); CBV.pronto = true; cbvPassada(); }).catch(e => console.warn('vasos do cerebelo', e));
}
// no painel do cerebelo: só a circulação posterior, os seios da fossa posterior e as pregas da dura do cerebelo
const CBV_PAINEL = new Set(CBV.ITENS.concat(['jugular', 'spsup', 'spinf']));
const _visCbv = applyVisibility;
applyVisibility = function () {
  _visCbv(); if (CBV.pronto) cbvPassada();
  if (CBT.painel) ALLMESH.forEach(m => { const g = META[m.userData.id] && META[m.userData.id].grp; if ((g === 'art' || g === 'ven' || g === 'men') && !CBV_PAINEL.has(m.userData.id)) m.visible = false; });
  CBV.anc = null; CBT.oclChave = null;   // âncoras novas: a oclusão é refeita
};
// âncora de rótulo de um vaso: o vértice visível mais perto do centro das malhas visíveis
function cbvAncora(id) {
  const ms = (ITEMS[id] ? ITEMS[id].meshes : []).filter(m => m.visible && m.parent && m.parent.visible); if (!ms.length) return null;
  const b = new THREE.Box3(); ms.forEach(m => b.expandByObject(m)); const c = b.getCenter(new THREE.Vector3()), v = new THREE.Vector3(); let best = null, bd = 1e9;
  ms.forEach(m => { const p = m.geometry.attributes.position, passo = Math.max(1, Math.floor(p.count / 800)); for (let i = 0; i < p.count; i += passo) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); const d = v.distanceToSquared(c); if (d < bd) { bd = d; best = v.clone(); } } });
  return best;
}
// carrega a superfície lisa e corrige quando o atlas estiver ocioso (não atrasa a abertura)
setTimeout(cbvIniciar, 2500);
if (/debug/.test(location.hash)) window.cbvDebug = { CBV, cbvSaida, cbvContar, cbvPassada };
