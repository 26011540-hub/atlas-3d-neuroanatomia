/* ===== LOBOS, GIROS E SISTEMA LÍMBICO COMPLETOS (remodelagem 3, fase 2) =====
   Gabarito: Unicamp, cortes coronais 1 a 12 (GABARITO.md). Texto: Machado, cap. 6, 7 e 27.
   Formas novas desenhadas sobre as malhas reais; o que é esquemático está dito na nota de cada item. */
// ---- lobos: cada região da parcelação pertence a um lobo; selecionar o lobo acende os seus giros
const LOBO_DK = {
  superiorfrontal: 'lobo_front', rostralmiddlefrontal: 'lobo_front', caudalmiddlefrontal: 'lobo_front', parsopercularis: 'lobo_front', parstriangularis: 'lobo_front',
  parsorbitalis: 'lobo_front', lateralorbitofrontal: 'lobo_front', medialorbitofrontal: 'lobo_front', precentral: 'lobo_front', frontalpole: 'lobo_front',
  postcentral: 'lobo_par', superiorparietal: 'lobo_par', inferiorparietal: 'lobo_par', supramarginal: 'lobo_par', precuneus: 'lobo_par',
  superiortemporal: 'lobo_temp', middletemporal: 'lobo_temp', inferiortemporal: 'lobo_temp', bankssts: 'lobo_temp', fusiform: 'lobo_temp',
  transversetemporal: 'lobo_temp', temporalpole: 'lobo_temp', entorhinal: 'lobo_temp', parahippocampal: 'lobo_temp',
  lateraloccipital: 'lobo_occ', lingual: 'lobo_occ', cuneus: 'lobo_occ', pericalcarine: 'lobo_occ',
  rostralanteriorcingulate: 'lobo_limb', caudalanteriorcingulate: 'lobo_limb', posteriorcingulate: 'lobo_limb', isthmuscingulate: 'lobo_limb'
};
cortexMeshes.forEach(m => {
  const dk = m.userData.dk, L = LOBO_DK[dk];
  if (dk === 'isthmuscingulate') {   // istmo: parte do giro do cíngulo, selecionável sozinho
    m.userData.id = 'gistmo'; m.userData.base = META.gistmo.color; m.userData.pai = 'gcing'; itemOf('gistmo').meshes.push(m);
  }
  if (!L) return;   // lóbulo paracentral (frontal e parietal) e ínsula (o próprio lobo insular) ficam fora
  m.userData.lobo = L; itemOf(L).meshes.push(m);
  if (dk === 'parahippocampal' || dk === 'entorhinal') { m.userData.pai = 'lobo_limb'; itemOf('lobo_limb').meshes.push(m); }   // giro para-hipocampal: lobo temporal e lobo límbico
});
// fissura longitudinal do cérebro: linha na margem superior, entre os hemisférios
tube('fis_long', lin(14, 195, 50).map(a => CONT.pt(a, -0.02)), 0.045, 0.045, { mid: true, seg: 160, rad: 6 });
ITEMS.fis_long.meshes.forEach(m => { m.userData.sulco = true; m.userData.fis = true; });

// ---- giro subcaloso (área septal): abaixo do rostro do corpo caloso, à frente da lâmina terminal
fita('gsubcal', sx => medP(sx, [[0, 0.3, 2.85], [0, 0.0, 2.55], [0, -0.35, 2.2], [0, -0.7, 1.85], [0, -0.95, 1.65]], 0.03), u => 0.2 - 0.06 * u, 0.035, { up: [1, 0, 0] });

// ---- hipocampo por partes: pé (cabeça, anterior) e corpo com a cauda; mesma malha real, dividida
(function () {
  const ms = ITEMS.hipocampo.meshes.slice(), v = new THREE.Vector3(), Z = -0.6;   // limite aproximado entre a cabeça e o corpo
  ms.forEach(m => { if (m.parent) m.parent.remove(m); const k = ALLMESH.indexOf(m); if (k >= 0) ALLMESH.splice(k, 1); });
  ITEMS.hipocampo.meshes = [];
  const porGeo = new Map(); ms.forEach(m => { if (!porGeo.has(m.geometry)) porGeo.set(m.geometry, []); porGeo.get(m.geometry).push(m); });
  porGeo.forEach((lista, g) => {
    const m1 = lista.find(m => m.userData.side === 1) || lista[0], p = g.attributes.position, I = g.index.array, grupos = {}, W = [];
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m1.matrix); W.push(v.z); }
    for (let t = 0; t < I.length; t += 3) { const z = (W[I[t]] + W[I[t + 1]] + W[I[t + 2]]) / 3, id = z > Z ? 'pehipo' : 'hipo_corpo'; (grupos[id] = grupos[id] || []).push(I[t], I[t + 1], I[t + 2]); }
    Object.keys(grupos).forEach(id => {
      const sub = new THREE.BufferGeometry(); Object.keys(g.attributes).forEach(k => sub.setAttribute(k, g.attributes[k]));
      sub.setIndex(new THREE.BufferAttribute(new Uint32Array(grupos[id]), 1)); sub.computeBoundingSphere(); sub.computeBoundingBox();
      lista.forEach(src => { const m = new THREE.Mesh(sub, stdMat(META[id].color, { roughness: 0.62 })); m.matrixAutoUpdate = false; m.matrix.copy(src.matrix); register(id, m, src.userData.side); m.userData.pai = 'hipocampo'; itemOf('hipocampo').meshes.push(m); });
    });
  });
})();
// álveo (face ventricular do hipocampo) e subículo (transição para o giro para-hipocampal): lâminas esquemáticas ao longo do hipocampo
fita('alveo', HIPO.slice(0, -1).map(q => desl(q, 0.22, 0.05, 0)), 0.2, 0.022, { up: [0.55, 0.83, 0], seg: 60 });
fita('subiculo', HIPO.slice(0, -1).map(q => desl(q, -0.2, -0.32, 0)), 0.15, 0.035, { up: [-0.6, 0.8, 0], seg: 60 });

// ---- feixes do sistema límbico
// fascículo do cíngulo: dentro do giro do cíngulo, em arco sobre o corpo caloso
tube('f_cingulo', sx => arcoCaloso(sx, -30, 200).map(p => { const q = fora(p, 0.36); return [sx * 0.42, q[1], q[2]]; }), 0.065, 0.055, { seg: 90, rad: 8, reto: true });
// fascículo mamilotalâmico: do corpo mamilar ao núcleo anterior do tálamo (etapa do circuito de Papez)
tube('f_mamtal', [[0.32, -0.95, 0.0], [0.42, -0.45, 0.22], [0.52, 0.15, 0.55], [0.58, 0.72, 0.82]], 0.045, 0.04, { seg: 30, rad: 8, reto: true });
// estria terminal: do corpo amigdaloide, em C, pelo teto do corno inferior e pelo sulco entre caudado e tálamo, até a comissura anterior
tube('estria_t', [[2.2, -1.1, 0.25], [2.55, -0.5, -0.9], [2.45, 0.25, -1.9], [2.05, 1.05, -1.65], [1.55, 1.36, -0.4], [1.0, 1.28, 0.55], [0.5, 0.88, 1.05], [0.38, 0.2, 1.25], [0.42, -0.35, 1.1]], 0.035, 0.03, { seg: 90, rad: 6, reto: true });

// ---- prosencéfalo basal: substância inominada e núcleo basal de Meynert, abaixo do globo pálido, no nível da comissura anterior
blob('subst_inom', sx => [sx * 1.65, Math.max(ENV[sx].inf(1.65, 1.15) + 0.32, -1.02), 1.15], [0.6, 0.12, 0.36], null, { amp: 0.06, seed: 51 });
ITEMS.subst_inom.meshes.forEach(m => { m.userData.op0 = 0.55; });
blob('meynert', sx => [sx * 1.7, Math.max(ENV[sx].inf(1.7, 1.1) + 0.3, -1.04), 1.1], [0.38, 0.07, 0.2], null, { amp: 0.08, seed: 53 });

// ---- epitálamo: trígono e comissura das habênulas, à frente da glândula pineal, sobre o tálamo
const TOPO_TAL = (x, z) => { const v = new THREE.Vector3(); let y = -9; ITEMS.talamo.meshes.filter(m => m.userData.side === 1).forEach(m => { const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); if (Math.abs(v.x - x) < 0.15 && Math.abs(v.z - z) < 0.18 && v.y > y) y = v.y; } }); return y > -9 ? y : 0.5; };
{ const yh = TOPO_TAL(0.32, -1.4);
  blob('trighab', [0.32, yh + 0.02, -1.4], [0.15, 0.05, 0.2], null, { amp: 0.04, seed: 57 });
  fita('comhab', [[-0.3, yh - 0.02, -1.52], [0, yh - 0.04, -1.56], [0.3, yh - 0.02, -1.52]], 0.05, 0.04, { mid: true }); }
