/* ===== RAMOS DOS NERVOS CRANIANOS E GÂNGLIOS (Machado, cap. 10 e 17) ===== */
const GG = (id, p, r) => ell(id, p, r || [0.13, 0.11, 0.15], null);
// trigêmeo: ramos além dos forames
const V1F = desl(ORB, 0.1, -0.05, 0), V2F = [2.3, -2.75, 2.7], V3F = [2.75, -3.7, 0.9];
nv('n_v1ramos', [V1F, [1.65, -1.75, 4.3], [1.45, -1.45, 5.3]], 0.045, { seg: 24, rad: 6 });   // frontal
nv('n_v1ramos', [V1F, [2.3, -1.85, 4.2], [2.65, -1.9, 4.9]], 0.035, { seg: 24, rad: 6 });     // lacrimal
nv('n_v1ramos', [V1F, [1.3, -2.2, 4.2], [0.95, -2.3, 5.0]], 0.035, { seg: 24, rad: 6 });      // nasociliar
nv('n_infraorb', [V2F, [2.3, -2.95, 3.9], [2.2, -3.25, 4.9]], 0.05, { seg: 24, rad: 6 });
nv('n_alvinf', [V3F, [2.95, -4.8, 1.0], [3.05, -5.9, 1.6], [2.9, -6.6, 2.6]], 0.05, { seg: 30, rad: 6 });
nv('n_lingual', [V3F, [2.7, -4.6, 1.3], [2.55, -5.5, 2.0], [2.25, -6.1, 2.9]], 0.05, { seg: 30, rad: 6 });
nv('n_auriculo', [V3F, [3.25, -3.95, 0.4], [3.9, -3.85, -0.35], [4.35, -3.05, -0.55]], 0.04, { seg: 30, rad: 6 });
GG('g_otico', [2.5, -3.55, 0.75]);
GG('g_submand', [2.45, -5.95, 2.4]);
// oculomotor: gânglio ciliar perto do ápice da órbita
GG('g_ciliar', [1.75, -2.35, 3.55], [0.1, 0.09, 0.12]);
nv('nc3', [desl(ORB, -0.05, 0.08, 0), [1.75, -2.3, 3.5]], 0.04, { seg: 10, rad: 6 });
// facial: gânglio geniculado, petroso maior até o gânglio pterigopalatino, corda do tímpano até o lingual, ramos terminais
const GEN = [3.9, -3.75, -1.8], PTG = [2.15, -3.15, 2.35], EST = [4.3, -6.4, -1.3];
GG('g_genic', GEN, [0.12, 0.12, 0.12]);
GG('g_pterig', PTG, [0.14, 0.13, 0.15]);
nv('n_petmaior', [GEN, [3.5, -3.45, -0.9], [2.9, -3.2, 0.4], [2.4, -3.15, 1.6], PTG], 0.035, { seg: 40, rad: 6 });
nv('n_corda', [[4.1, -5.6, -2.4], [3.7, -5.35, -1.0], [3.1, -5.0, 0.5], [2.65, -5.0, 1.65]], 0.03, { seg: 40, rad: 6 });
[[4.6, -2.6, 1.6], [4.65, -4.2, 2.6], [4.45, -5.6, 3.0], [4.05, -7.2, 2.4], [3.6, -8.6, 0.8]].forEach(q => nv('n7_ramos', [EST, [4.5, -6.2, -0.2], q], 0.04, { seg: 24, rad: 6 }));
// glossofaríngeo e vago: gânglios junto ao forame jugular; timpânico e petroso menor até o gânglio ótico
GG('g_ix', desl(FJ, -0.12, 0.12, 0.15), [0.1, 0.12, 0.1]);
GG('g_ix', [3.0, -6.2, -1.75], [0.11, 0.14, 0.11]);
GG('g_x', FJ, [0.13, 0.14, 0.13]);
GG('g_x', [3.0, -6.9, -2.1], [0.15, 0.3, 0.15]);
nv('n_timp', [[3.0, -6.2, -1.75], [3.25, -5.1, -1.55], [3.45, -4.35, -1.05], [3.1, -3.85, -0.1], [2.5, -3.55, 0.75]], 0.03, { seg: 40, rad: 6 });
// vínculos: o item do nervo acende os ramos e gânglios
[['nc5', ['g_trig', 'n_oft', 'n_max', 'n_mand', 'n_v1ramos', 'n_infraorb', 'n_alvinf', 'n_lingual', 'n_auriculo']], ['nc7', ['g_genic', 'n_petmaior', 'n_corda', 'n7_ramos']], ['nc9', ['g_ix', 'n_timp']], ['nc10', ['g_x']]].forEach(q => q[1].forEach(id => ITEMS[id].meshes.forEach(m => { m.userData.pai = q[0]; itemOf(q[0]).meshes.push(m); })));

/* ===== PROSENCÉFALO E ENVOLTÓRIOS (Machado, cap. 7 e 8) ===== */
// sulcos: linha sobre a superfície, ao longo das bordas da parcelação
const linhaS = (sx, chave, n, pares) => emOrdem(bd.apply(null, [sx].concat(pares)), chave, n);
const SUL_DEF = {
  s_central: [sx => linhaS(sx, p => p[1], 9, ['postcentral|precentral']), 0],
  s_precentral: [sx => linhaS(sx, p => p[1], 9, ['caudalmiddlefrontal|precentral', 'parsopercularis|precentral', 'precentral|superiorfrontal']), 0],
  s_poscentral: [sx => linhaS(sx, p => p[1], 8, ['postcentral|supramarginal', 'postcentral|superiorparietal']), 0],
  s_fronsup: [sx => linhaS(sx, p => -p[2], 8, ['caudalmiddlefrontal|superiorfrontal', 'rostralmiddlefrontal|superiorfrontal']), 0],
  s_froninf: [sx => linhaS(sx, p => -p[2], 7, ['parstriangularis|rostralmiddlefrontal', 'caudalmiddlefrontal|parsopercularis', 'parsorbitalis|rostralmiddlefrontal']), 0],
  s_tempsup: [sx => linhaS(sx, p => -p[2], 9, ['middletemporal|superiortemporal', 'bankssts|middletemporal']), 0],
  s_tempinf: [sx => linhaS(sx, p => -p[2], 8, ['inferiortemporal|middletemporal']), 0],
  s_intrapar: [sx => linhaS(sx, p => -p[2], 7, ['inferiorparietal|superiorparietal', 'superiorparietal|supramarginal']), 0],
  s_lateral: [sx => lin(0, 1, 10).map(u => { const p = S(sx, u); return [p[0], p[1] - 0.12, p[2]]; }), 0],
  s_occtemp: [sx => linhaS(sx, p => -p[2], 7, ['fusiform|inferiortemporal']), 2],
  s_colateral: [sx => linhaS(sx, p => -p[2], 7, ['fusiform|parahippocampal', 'fusiform|lingual']), 2],
  s_olfat: [sx => linhaS(sx, p => -p[2], 5, ['lateralorbitofrontal|medialorbitofrontal']), 2],
  s_calcarino: [sx => calc(sx), 1],
  s_parocc: [sx => linhaS(sx, p => p[1], 6, ['cuneus|precuneus']), 1],
  s_corpcal: [sx => arcoCaloso(sx, -60, 215), 1],
  s_cingulo: [sx => arcoCingulo(sx), 1],
  s_marginal: [sx => linhaS(sx, p => p[1], 5, ['paracentral|precuneus']), 1],
  s_subpar: [sx => linhaS(sx, p => -p[2], 5, ['posteriorcingulate|precuneus', 'isthmuscingulate|precuneus']), 1],
  s_paracent: [sx => linhaS(sx, p => p[1], 5, ['paracentral|superiorfrontal']), 1]
};
Object.keys(SUL_DEF).forEach(id => {
  const f = SUL_DEF[id][0], face = SUL_DEF[id][1];
  tube(id, sx => { const p = f(sx); return face === 1 ? medP(sx, p, 0.02) : (face === 2 ? p.map(q => [q[0], q[1] - 0.04, q[2]]) : surf(sx, p, 0.025)); }, 0.035, 0.035, { seg: 70, rad: 6 });
  ITEMS[id].meshes.forEach(m => { m.userData.sulco = true; m.userData.fis = true; });
});
// septo pelúcido: lâmina mediana entre o corpo caloso e o fórnice
(function () {
  const top = lin(0.02, 0.62, 24).map(u => CCC.getPointAt(u)), baixo = [[-0.6, 1.62], [-0.1, 1.6], [0.4, 1.53], [0.8, 1.36], [1.05, 1.06], [1.17, 0.72], [1.4, 0.48], [2.0, 0.41], [2.6, 0.43]];
  const shp = new THREE.Shape(top.map(v => new THREE.Vector2(v.z, v.y)).reverse().concat(baixo.map(q => new THREE.Vector2(q[0], q[1]))));
  const g = new THREE.ShapeGeometry(shp, 24);
  [0.03, -0.03].forEach(x => { const m = new THREE.Mesh(g, stdMat(META.septo.color, { roughness: 0.7 })); m.rotation.y = -Math.PI / 2; m.position.x = x; m.userData.op0 = 0.9; register('septo', m, 0); });   // duas lâminas, com a cavidade do septo entre elas
})();
// aderência intertalâmica
ell('aderencia', [0, TAL[1] + 0.05, TAL[2] + 0.25], [0.24, 0.17, 0.26], null, { mid: true });
// hipocampo: fímbria (margem dorsomedial), giro denteado e unco
const HIPO = (function () { const v = new THREE.Vector3(), best = {}, m = ITEMS.hipocampo.meshes.find(q => q.userData.side === 1), p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); const b = Math.round(v.z / 0.3), sc = v.y * 0.8 - v.x * 0.6; if (!best[b] || sc > best[b][3]) best[b] = [v.x, v.y, v.z, sc]; } return Object.keys(best).map(Number).sort((a, b) => b - a).map(b => best[b].slice(0, 3)); })();
tube('fimbria', HIPO.slice(0, -1).map(q => desl(q, -0.02, 0.06, 0)).concat([[2.05, 0.05, -2.95]]), 0.06, 0.08, { seg: 50, rad: 8 });
tube('giroden', HIPO.slice(0, -1).map(q => desl(q, -0.12, -0.12, 0)), 0.05, 0.05, { seg: 50, rad: 8 });
ell('unco', sx => { const c = cen(sx, 'entorhinal'); return [sx * Math.max(1.3, Math.abs(c[0]) - 0.35), c[1] + 0.15, c[2] - 0.15]; }, [0.32, 0.28, 0.38], null);
// ventrículo lateral por partes (malha real: corpo e corno inferior vêm em malhas separadas)
(function () {
  const ms = ITEMS.vlat.meshes.slice(), v = new THREE.Vector3();
  const parte = q => q[1] < 0.15 && q[2] > -2.9 ? 'vlat_inf' : (q[2] < -2.55 ? 'vlat_post' : (q[2] > 1.0 ? 'vlat_ant' : 'vlat_cent'));
  ms.forEach(m => { if (m.parent) m.parent.remove(m); const k = ALLMESH.indexOf(m); if (k >= 0) ALLMESH.splice(k, 1); });
  ITEMS.vlat.meshes = [];
  const porGeo = new Map(); ms.forEach(m => { if (!porGeo.has(m.geometry)) porGeo.set(m.geometry, []); porGeo.get(m.geometry).push(m); });
  porGeo.forEach((lista, g) => {
    const m1 = lista.find(m => m.userData.side === 1) || lista[0], p = g.attributes.position, W = [];
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m1.matrix); W.push([v.x, v.y, v.z]); }
    const I = g.index.array, grupos = {};
    for (let t = 0; t < I.length; t += 3) { const A = W[I[t]], B2 = W[I[t + 1]], C = W[I[t + 2]], q = [(A[0] + B2[0] + C[0]) / 3, (A[1] + B2[1] + C[1]) / 3, (A[2] + B2[2] + C[2]) / 3], id = parte(q); (grupos[id] = grupos[id] || []).push(I[t], I[t + 1], I[t + 2]); }
    Object.keys(grupos).forEach(id => {
      const sub = new THREE.BufferGeometry(); Object.keys(g.attributes).forEach(k => sub.setAttribute(k, g.attributes[k]));
      sub.setIndex(new THREE.BufferAttribute(new Uint32Array(grupos[id]), 1)); sub.computeBoundingSphere(); sub.computeBoundingBox();
      lista.forEach(src => { const m = new THREE.Mesh(sub, stdMat(META[id].color, { roughness: 0.62 })); m.matrixAutoUpdate = false; m.matrix.copy(src.matrix); register(id, m, src.userData.side); m.userData.op0 = 0.5; m.userData.pai = 'vlat'; itemOf('vlat').meshes.push(m); });
    });
  });
})();
// pregas da dura-máter (Machado, cap. 8, p. 69-71)
function laminaSag(id, pts) {   // lâmina no plano mediano, pts em (z, y)
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(q => new THREE.Vector2(q[0], q[1]))));
  const m = new THREE.Mesh(g, stdMat(META[id].color, { roughness: 0.75 })); m.rotation.y = -Math.PI / 2; m.position.x = 0.002; m.userData.op0 = 0.45; register(id, m, 0); return m;
}
{
  const sup = lin(SSS0, SSS1, 40).map(a => { const p = CONT.pt(a, 0.12); return [p[2], p[1]]; });
  const reto = [[TORC[2], TORC[1]], [-6.4, tenda(-6.4)], [-4.6, Math.min(0.3, tenda(-4.6))], [-3.2, 0.8]];
  const livre = [[-3.0, 1.5], [-2.3, 2.4], [-1.0, 2.95], [0.7, 3.15], [2.6, 2.9], [4.35, 1.95]];
  laminaSag('foice', sup.concat(reto.slice(1), livre));
}
laminaSag('foicecb', [[TORC[2], TORC[1]], [TORC[2] + 0.55, TORC[1] - 1.2], [TORC[2] + 1.6, TORC[1] - 2.3]].concat([CB.sag(-95, 0.18), CB.sag(-60, 0.18), CB.sag(-25, 0.18)].map(p => [p[2], p[1]])));
(function () {   // tentório: faixa entre a borda presa (seios transverso e petroso superior) e a incisura
  const N = 28;
  const borda = sx => [TORC].concat(ST.slice(1).map(p => esp(sx, p)), [esp(sx, mix(SIG0, [5.3, SIG0[1] - 1.3, SIG0[2] + 0.6], 0.3))], infP(sx, [[3.9, -2.3], [2.6, -0.9]], 0.25), [[sx * 1.3, -2.35, 0.5]]);
  const incisura = sx => [[0, 0.8, -3.2], [sx * 0.9, 0.3, -3.05], [sx * 1.7, -0.5, -2.4], [sx * 2.05, -1.15, -1.3], [sx * 1.9, -1.75, -0.1], [sx * 1.35, -2.25, 0.5]];
  [1, -1].forEach(sx => {
    const A = new THREE.CatmullRomCurve3(borda(sx).map(p => new THREE.Vector3(p[0], p[1], p[2]))).getSpacedPoints(N), Bv = new THREE.CatmullRomCurve3(incisura(sx).map(p => new THREE.Vector3(p[0], p[1], p[2]))).getSpacedPoints(N);
    const pos = [], idx = []; for (let i = 0; i <= N; i++) { pos.push(A[i].x, A[i].y, A[i].z, Bv[i].x, Bv[i].y, Bv[i].z); if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, stdMat(META.tentorio.color, { roughness: 0.75 })); m.userData.op0 = 0.45; register('tentorio', m, sx);
  });
})();
(function () { const g = new THREE.RingGeometry(0.12, 0.6, 32); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, stdMat(META.diafragma.color, { roughness: 0.75 })); m.position.set(0, -1.88, 1.35); m.userData.op0 = 0.6; register('diafragma', m, 0); })();
// medula espinal, parte cervical (continua o bulbo da malha)
tube('medula', [B(28.6, 0, 0.5), BE(30.5, 0, 0.5), BE(33, 0, 0.48), BE(36, 0, 0.46)], 0.62, 0.52, { mid: true, sx: 1.2, seg: 30, rad: 18 });
// ponta da medula fechada com um disco liso (o corte em H volta com os cortes da medula, no modo de fatias)
(function () {
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), stdMat(META.medula.color, { roughness: 0.85 }));
  const a = BE(35.6, 0, 0.46), b = BE(36.4, 0, 0.46), d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  m.position.set(b[0] - d.x * 0.02, b[1] - d.y * 0.02, b[2] - d.z * 0.02); m.up.set(0, 0, 1); m.lookAt(new THREE.Vector3(b[0] + d.x, b[1] + d.y, b[2] + d.z));
  m.scale.set(0.62, 0.52, 1); register('medula', m, 0);
})();

