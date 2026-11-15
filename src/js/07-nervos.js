/* ===== NERVOS CRANIANOS E NÚCLEOS (Machado, cap. 5, 10 e 17) =====
   Sistema de referência do tronco: índice i ao longo do perfil ventral mediano (0 = topo do mesencéfalo,
   TR.iSup = borda superior da ponte, TR.iInf = sulco bulbopontino), afastamento lateral em x e profundidade
   medida da face ventral para a dorsal. O assoalho do canal (aqueduto e IV ventrículo) vem da malha real. */
const TRd = [0.408, -0.913];
function trP(i) { const n = TR.perfil.length - 1; i = Math.max(0, Math.min(n, i)); const a = Math.min(n - 1, Math.floor(i)), t = i - a, p = TR.perfil[a], q = TR.perfil[a + 1]; return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
const B = (i, lat, prof) => { const p = trP(i); return [lat, p[0] + TRd[0] * prof, p[1] + TRd[1] * prof]; };
function nuvem(ids) { const out = [], v = new THREE.Vector3(), vistos = new Set(); ids.forEach(id => ITEMS[id].meshes.forEach(m => { if (!m.matrix || m.matrixAutoUpdate) return; const ch = m.geometry.attributes.position.array; if (vistos.has(ch)) return; vistos.add(ch); const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); out.push([Math.abs(v.x), v.y, v.z]); } })); return out; }
function fatia(pts, i, f) { const q = trP(i); pts.forEach(p => { const dy = p[1] - q[0], dz = p[2] - q[1]; if (Math.abs(dy * 0.913 + dz * 0.408) < 0.14) f(p[0], dy * TRd[0] + dz * TRd[1]); }); }
const TRONCO = nuvem(['mesenc', 'ponte', 'bulbo']), V4P = nuvem(['v4']);
const latT = (i, prof) => { let mx = 0; fatia(TRONCO, i, (x, d) => { if (Math.abs(d - prof) < 0.3 && x > mx) mx = x; }); return mx || 1; };
const ASSO = TR.perfil.map((q, i) => { let lo = null; fatia(V4P, i, (x, d) => { if (x < 0.35 && (lo === null || d < lo)) lo = d; }); return lo; });
(function () {
  let a = ASSO.findIndex(v => v !== null), b = ASSO.length - 1; while (b > 0 && ASSO[b] === null) b--;
  if (a < 0) { a = 0; b = ASSO.length - 1; ASSO.fill(1.5); }
  for (let i = a + 1; i < b; i++) if (ASSO[i] === null) ASSO[i] = ASSO[i - 1];
  for (let i = a - 1; i >= 0; i--) ASSO[i] = Math.max(0.25, ASSO[a] - 0.27 * (a - i));
  for (let i = b + 1; i < ASSO.length; i++) ASSO[i] = ASSO[b] - 0.2 * (i - b);
})();
const F = i => { const n = ASSO.length - 1; i = Math.max(0, Math.min(n, i)); const a = Math.min(n - 1, Math.floor(i)); return ASSO[a] + (ASSO[a + 1] - ASSO[a]) * (i - a); };
// coluna de substância cinzenta: tubo ao longo do tronco, fechado por esferas nas pontas
function colN(id, i0, i1, lat, prof, r) {
  const n = Math.max(2, Math.round((i1 - i0) * 2) + 1), p = [];
  for (let k = 0; k < n; k++) { const i = i0 + (i1 - i0) * k / (n - 1); p.push(B(i, typeof lat === 'function' ? lat(i) : lat, prof(i))); }
  tube(id, p, r, r, { seg: n * 6, rad: 8 });
  ell(id, p[0], [r, r, r], null); ell(id, p[n - 1], [r, r, r], null);
}
const nv = (id, pts, r, o) => tube(id, pts, r, r, Object.assign({ seg: 40, rad: 8 }, o || {}));

// --- núcleos: coluna eferente somática (junto ao plano mediano)
colN('nu3', 3.3, 4.6, 0.13, i => F(i) - 0.28, 0.1);
colN('nu4', 7.1, 7.7, 0.13, i => F(i) - 0.24, 0.09);
ell('nu6', B(18, 0.2, F(18) - 0.22), [0.12, 0.13, 0.12], null);
colN('nu12', 23.3, 27.3, 0.11, i => F(i) - 0.15, 0.08);
// --- coluna eferente visceral geral
colN('nuew', 3.2, 4.2, 0.055, i => F(i) - 0.1, 0.05);
ell('nulacr', B(19.6, 0.5, F(19.6) - 0.5), [0.07, 0.07, 0.07], null);
ell('nusals', B(20.4, 0.5, F(20.4) - 0.5), [0.08, 0.09, 0.08], null);
ell('nusali', B(22.6, 0.5, F(22.6) - 0.45), [0.08, 0.09, 0.08], null);
colN('nudx', 23.5, 27.5, 0.3, i => F(i) - 0.16, 0.07);
// --- coluna eferente visceral especial (profunda)
ell('numot5', B(12, 0.75, F(12) * 0.72), [0.13, 0.2, 0.14], null);
ell('nu7', B(19, 0.8, F(19) * 0.5), [0.14, 0.2, 0.15], null);
colN('nuamb', 23, 28.5, 0.6, i => F(i) * 0.45, 0.06);
// --- coluna aferente somática geral (coluna do trigêmeo)
colN('numes5', 3, 11, 0.32, i => F(i) + 0.02, 0.05);
ell('nusp5', B(12, 1.03, F(12) * 0.8), [0.15, 0.22, 0.16], null);
colN('nuesp5', 13.2, 29, i => i < 20 ? 0.95 : 0.95 - 0.04 * (i - 20), i => F(i) * 0.8, 0.085);
// --- coluna aferente somática especial
colN('nuvest', 18.5, 24, 0.8, i => F(i) - 0.14, 0.17);
ell('nucocl', B(22.2, 1.08, F(22.2) - 0.02), [0.1, 0.12, 0.1], null);
ell('nucocl', B(22.2, 1.12, F(22.2) - 0.45), [0.1, 0.12, 0.1], null);
// --- coluna aferente visceral
colN('nusol', 22.3, 28, 0.5, i => F(i) - 0.34, 0.07);

// --- nervos
const ORB = [1.7, -2.15, 3.3];        // fissura orbital superior (posição indicativa)
const MAI = [3.3, -3.75, -1.7];        // meato acústico interno
const FJ = [2.9, -5.55, -2.2];        // forame jugular
// I: filamentos que atravessam a lâmina crivosa e terminam no bulbo olfatório
[0, 1, 2, 3, 4].forEach(k => tube('nc1', sx => { const z = 5.25 + k * 0.32, y = ENV[sx].inf(1.0, 5.9) - 0.36; return [[sx * 1.0, y, z], [sx * (0.92 + 0.04 * k), y - 0.5, z + 0.05]]; }, 0.035, 0.035, { seg: 6, rad: 6 }));
// III: do núcleo à fossa interpeduncular e daí à fissura orbital superior
nv('nc3', [B(4, 0.13, F(4) - 0.3), B(3.5, 0.3, F(3.5) * 0.45), B(3, 0.24, 0.02)], 0.035, { seg: 20, rad: 6 });
nv('nc3', [B(3, 0.24, 0.02), [0.6, -1.25, -0.3], [1.15, -1.8, 0.7], [1.4, -2.0, 2.0], desl(ORB, -0.05, 0.08, 0)], 0.09);
// IV: emerge dorsalmente, abaixo do colículo inferior, e contorna o mesencéfalo
nv('nc4', [B(9.3, 0.25, F(9.3) + 0.42), B(8.2, latT(8.2, 2.0) + 0.08, 2.0), B(6.5, latT(6.5, 1.0) + 0.1, 1.0), B(4.6, latT(4.6, 0.25) + 0.08, 0.2), [1.3, -1.75, 0.3], [1.5, -1.95, 1.8], desl(ORB, 0, 0.16, 0)], 0.045, { seg: 60, rad: 7 });
// V: raiz sensitiva (maior) e motora (menor), gânglio trigeminal e os três ramos
const V0 = B(12, latT(12, 1.0), 1.0), G5 = [2.15, -2.5, 0.15];
nv('nc5', [V0, [1.95, -2.5, -0.7], G5], 0.17, { seg: 24 });
nv('nc5', [desl(V0, -0.12, 0.2, 0.05), [1.85, -2.3, -0.65], desl(G5, -0.15, 0.12, 0)], 0.06, { seg: 24, rad: 6 });
ell('g_trig', G5, [0.42, 0.14, 0.3], [0, 0.3, 0]);
nv('n_oft', [G5, [2.0, -2.25, 1.6], desl(ORB, 0.1, -0.05, 0)], 0.09, { seg: 24 });                 // oftálmico
nv('n_max', [G5, [2.3, -2.6, 1.5], [2.3, -2.75, 2.7]], 0.09, { seg: 24 });                         // maxilar
nv('n_mand', [G5, [2.6, -2.9, 0.6], [2.75, -3.7, 0.9]], 0.1, { seg: 24 });                          // mandibular
// VI: do núcleo ao sulco bulbopontino; sobe junto à ponte até o seio cavernoso
nv('nc6', [B(18, 0.2, F(18) - 0.25), B(20, 0.3, 1.0), B(22, 0.35, 0.02)], 0.035, { seg: 20, rad: 6 });
nv('nc6', [B(22, 0.35, 0.02), B(18, 0.5, -0.35), B(13, 0.6, -0.45), B(8, 0.7, -0.5), [1.0, -2.25, 0.9], [1.3, -2.2, 2.2], desl(ORB, 0, -0.12, 0)], 0.06, { seg: 60, rad: 7 });
// VII: fibras contornam o núcleo do abducente (joelho interno), emergem no sulco bulbopontino e seguem ao meato acústico interno
const E7 = B(21.8, latT(21.8, 0.5) - 0.02, 0.5), E8 = B(22, latT(22, 0.9), 0.9);
nv('nc7', [B(19, 0.8, F(19) * 0.5), B(18.7, 0.3, F(18.7) - 0.42), B(18.1, 0.08, F(18.1) - 0.2), B(17.6, 0.2, F(17.6) - 0.06), B(18.1, 0.38, F(18.1) - 0.22), B(20, 0.75, 1.1), E7], 0.035, { seg: 50, rad: 6 });
nv('nc7', [E7, mix(E7, MAI, 0.5), MAI, [3.9, -3.75, -1.8], [4.05, -4.1, -2.3], [4.1, -5.0, -2.45], [4.1, -5.9, -2.3], [4.3, -6.4, -1.3]], 0.08, { seg: 70 });
nv('nc7', [desl(E7, 0.08, 0, -0.14), desl(mix(E7, MAI, 0.5), 0.02, -0.02, -0.13), desl(MAI, 0, -0.03, -0.1)], 0.04, { seg: 20, rad: 6 });   // nervo intermédio
// VIII
nv('nc8', [E8, desl(mix(E8, MAI, 0.5), 0, -0.05, -0.1), desl(MAI, 0, -0.1, -0.24)], 0.11, { seg: 24 });
// IX, X e XI: filamentos do sulco lateral posterior do bulbo, reunidos no forame jugular
const slp = i => B(i, latT(i, 0.8) - 0.03, 0.85);
const R9 = [1.9, -5.0, -2.25], R10 = [2.0, -5.3, -2.4], R11 = [1.9, -5.75, -2.75];
[22.8, 23.4].forEach(i => nv('nc9', [slp(i), R9], 0.04, { seg: 10, rad: 6 }));
nv('nc9', [R9, desl(FJ, -0.12, 0.12, 0.15), [3.0, -6.6, -1.4], [2.6, -7.4, -0.2]], 0.07, { seg: 30 });
[24, 24.8, 25.6, 26.4].forEach(i => nv('nc10', [slp(i), R10], 0.04, { seg: 10, rad: 6 }));
nv('nc10', [R10, FJ, [3.0, -6.8, -2.1], [2.9, -8.4, -1.9]], 0.11, { seg: 30 });
[27.2, 28].forEach(i => nv('nc11', [slp(i), R11], 0.04, { seg: 10, rad: 6 }));             // raiz craniana
nv('nc11', [[0.95, -7.6, -3.75], [1.05, -6.6, -3.35], [1.4, -6.0, -3.0], R11], 0.05, { seg: 24, rad: 6 });   // raiz espinal (entra pelo forame magno)
nv('nc11', [R11, desl(FJ, 0.1, -0.12, -0.15), [3.4, -6.8, -2.9], [3.9, -8.2, -3.6]], 0.07, { seg: 30 });
// XII: filamentos do sulco lateral anterior do bulbo, reunidos no canal do hipoglosso
const R12 = [1.3, -5.5, -1.7];
[23.5, 24.5, 25.5, 26.5].forEach(i => nv('nc12', [B(i, 0.42, 0.06), R12], 0.04, { seg: 10, rad: 6 }));
nv('nc12', [R12, [1.7, -5.75, -1.75], [2.2, -6.9, -1.2], [2.0, -7.5, 0.2], [1.3, -7.4, 1.5]], 0.08, { seg: 40 });
const TRANSL = { mesenc: 1, ponte: 1, bulbo: 1, pedunc: 1, cerebelo: 1, vermis: 1, colsup: 1, colinf: 1 };
