/* ===== ARTÉRIAS =====
   Troncos da base: trajeto esquemático. Ramos corticais: apoiados sobre a malha (envelope) e guiados
   pelas bordas entre regiões (sulco central, pré-central, pós-central, do cíngulo, calcarino, parietoccipital). */
// perfil ventral mediano do tronco (da malha real): a basilar corre sobre o ventre da ponte
const TR = MARCOS.tronco;
const ventral = (i, d) => [0, TR.perfil[i][0] - 0.408 * d, TR.perfil[i][1] + 0.913 * d];
const BAS_T = ventral(TR.iSup, 0.22), BAS_B = ventral(TR.iInf, 0.22);
const ACI_T = [1.2, -1.3, 1.5];       // término da carótida interna, lateral ao quiasma
const esp = (sx, p) => [p[0] * sx, p[1], p[2]];
// carótida interna (Prometheus, p. 246): cervical (sobe medial à jugular), petrosa (no canal carótico, dobra para frente e medialmente),
// cavernosa (curva em S dentro do seio cavernoso) e cerebral (sobe até a bifurcação, lateral ao quiasma)
partes(['aci_cerv', 'aci_petr', 'aci_cav', 'aci_cer'], [[2.35, -8.8, -1.3], [2.3, -7.4, -1.15], [2.25, -5.6, -0.95],
  [2.2, -4.6, -0.8], [2.0, -4.15, -0.45], [1.6, -3.98, 0.05], [1.25, -3.85, 0.4],
  [1.12, -3.2, 0.55], [1.05, -2.55, 0.78], [1.0, -2.4, 1.2], [1.0, -2.4, 1.72], [1.05, -2.18, 2.05], [1.12, -1.9, 1.95],
  [1.15, -1.62, 1.75], ACI_T], [0, 2, 6, 12, 14], u => 0.21 - 0.03 * u, 'aci');
tube('acm', sx => { const ci = cen(sx, 'insula'); return [esp(sx, ACI_T), [sx * 2.1, -1.4, 1.6], [sx * 2.9, -1.05, 1.6], desl(ci, sx * 0.25, -0.7, 0.4)]; }, 0.17, 0.15, { seg: 40 });
tube('acm2', sx => { const ci = cen(sx, 'insula'); return [desl(ci, sx * 0.25, -0.7, 0.4), desl(ci, sx * 0.32, 0.2, -0.3), desl(ci, sx * 0.45, 0.65, -1.3)].concat(surf(sx, [S(sx, 0.8)], 0.08)); }, 0.15, 0.11, { galhos: 'lat', gfr: [0.9], seg: 50 });
tube('a_oft', sx => [[sx * 1.13, -1.8, 1.88], [sx * 1.2, -1.95, 2.6], [sx * 1.5, Math.min(-1.95, ENV[sx].inf(1.5, 3.6) - 0.55), 3.6]], 0.07, 0.06, { seg: 24, rad: 7 });
[0, 1, 2, 3, 4].forEach(i => {
  const x1 = 1.85 + i * 0.24;
  tube('lenticulo', [[x1, -1.32, 1.55 - i * 0.03], [x1 + 0.15, -0.6, 1.35], [x1 + 0.35, 0.3, 1.1], [x1 + 0.4, 1.0 + (i % 2) * 0.2, 0.9]], 0.05, 0.035, { seg: 24, rad: 6 });
});
tube('a_fbl', sx => surf(sx, [S(sx, 0.03), cen(sx, 'parsorbitalis'), mix(cen(sx, 'parsorbitalis'), cen(sx, 'lateralorbitofrontal'), 0.55)]), 0.07, 0.04, { galhos: 'lat', seg: 30, rad: 6 });
function sulco(sx, n) { const b = emOrdem(bd.apply(null, [sx].concat(Array.prototype.slice.call(arguments, 2))), p => p[1], n); return [sylvPerto(sx, b[0])].concat(b.slice(0, -1)); }
tube('a_cent', sx => surf(sx, sulco(sx, 7, 'postcentral|precentral')), 0.07, 0.04, { galhos: 'lat', seg: 44, rad: 6 });
tube('a_cent', sx => surf(sx, sulco(sx, 7, 'caudalmiddlefrontal|precentral', 'parsopercularis|precentral')), 0.06, 0.035, { galhos: 'lat', seg: 44, rad: 6 });
tube('a_par', sx => surf(sx, sulco(sx, 7, 'postcentral|supramarginal', 'postcentral|superiorparietal')), 0.06, 0.035, { galhos: 'lat', seg: 44, rad: 6 });
tube('a_par', sx => surf(sx, [S(sx, 0.93), cen(sx, 'supramarginal'), mix(cen(sx, 'supramarginal'), cen(sx, 'superiorparietal'), 0.6)]), 0.06, 0.035, { galhos: 'lat', seg: 30, rad: 6 });
tube('a_ang', sx => { const a = S(sx, 1), c = cen(sx, 'inferiorparietal'); return surf(sx, [a, mix(a, c, 0.55), c, mix(c, cen(sx, 'lateraloccipital'), 0.4)]); }, 0.07, 0.04, { galhos: 'lat', seg: 34, rad: 6 });
[[0.14, 0.35, 'a_tempant'], [0.45, -0.25, 'a_tempmed'], [0.78, -0.9, 'a_temppost']].forEach(q => {
  tube(q[2], sx => { const a = S(sx, q[0]); return surf(sx, [a, desl(a, 0, -1.2, q[1] * 0.5), desl(a, 0, -2.4, q[1])]); }, 0.06, 0.035, { galhos: 'lat', gfr: [0.6, 0.95], seg: 24, rad: 6 });
});
// ACA
tube('aca1', [ACI_T, [0.7, -1.02, 1.8], [0.14, -0.93, 1.97]], 0.13, 0.12);
tube('acomA', [[-0.14, -0.93, 1.97], [0, -0.93, 1.99], [0.14, -0.93, 1.97]], 0.09, 0.09, { mid: true });
const arcoCaloso = (sx, a0, a1) => arco(bd(sx, 'caudalanteriorcingulate|unknown', 'rostralanteriorcingulate|unknown', 'posteriorcingulate|unknown', 'isthmuscingulate|unknown'), a0, a1, 14).map(p => fora(p, 0.12));
const arcoCingulo = (sx) => arco(bd(sx, 'caudalanteriorcingulate|superiorfrontal', 'rostralanteriorcingulate|superiorfrontal', 'posteriorcingulate|superiorfrontal', 'paracentral|posteriorcingulate'), 5, 130, 15);
tube('pericalosa', sx => [[sx * 0.14, -0.93, 1.97], [sx * 0.15, -0.45, 2.45]].concat(medP(sx, arcoCaloso(sx, -60, 150))), 0.1, 0.07, { galhos: 'med', gfr: [0.45, 0.62, 0.8, 0.97], seg: 100, rad: 8 });
tube('calmarg', sx => { const pc = arcoCaloso(sx, -10, 20); return medP(sx, pc.slice(0, 1).concat(arcoCingulo(sx))); }, 0.07, 0.05, { galhos: 'med', seg: 60, rad: 7 });
tube('calmarg', sx => { const cg = arcoCingulo(sx), c = cen(sx, 'paracentral'); return medP(sx, [cg[cg.length - 1], c, [0, ENV[sx].topo(c[2]) - 0.35, c[2] - 0.1]]); }, 0.05, 0.035, { galhos: 'med', seg: 24, rad: 6 });   // ramo paracentral
tube('heubner', [[0.2, -0.9, 2.05], [0.9, -0.95, 2.1], [1.5, -0.8, 2.0], [1.7, -0.2, 2.1], [1.6, 0.4, 2.3]], 0.07, 0.05, { seg: 30, rad: 7 });
tube('a_polfront', sx => { const a = arcoCaloso(sx, -60, -20)[0] || [0, 0.2, 3.2], b = cen(sx, 'frontalpole'); return medP(sx, [a, mix(a, b, 0.5), mix(a, b, 0.9)]); }, 0.06, 0.04, { galhos: 'med', gfr: [0.6, 0.95], seg: 24, rad: 6 });
tube('a_fbm', sx => { const a = [0, -0.45, 2.45], b = cen(sx, 'medialorbitofrontal'); return medP(sx, [a, mix(a, b, 0.6), desl(b, 0, -0.35, 0.7)]); }, 0.06, 0.04, { galhos: 'med', gfr: [0.6, 0.95], seg: 24, rad: 6 });
tube('pcom', [[1.2, -1.35, 1.4], [1.1, -1.3, 0.5], [0.9, BAS_T[1] + 0.1, BAS_T[2] + 0.2]], 0.08, 0.08);
tube('coroant', [[1.3, -1.35, 1.35], [1.8, -1.25, 0.6], [2.4, -1.1, -0.3], [3.0, -1.2, -0.9], [3.5, -1.4, -0.7]], 0.07, 0.05, { seg: 30, rad: 7 });
// sistema vertebrobasilar
tube('vertebral', [[2.5, -9.2, -2.55], [2.55, -7.9, -2.65], [2.6, -6.95, -2.8], [2.55, -6.62, -3.3], [2.2, -6.55, -3.95], [1.6, -6.4, -4.15], [1.15, -6.1, -3.85], [1.08, -5.95, -3.3], [1.1, BAS_B[1] - 1.2, BAS_B[2] - 0.75], [0.3, BAS_B[1] - 0.15, BAS_B[2] - 0.08]], 0.17, 0.17, { seg: 90, reto: true });
tube('basilar', (function () { const p = []; for (let i = TR.iInf; i > TR.iSup; i -= 2) p.push(ventral(i, 0.22)); p.push(BAS_T); return p; })(), 0.2, 0.2, { mid: true, seg: 60 });
[TR.iPonte - 3, TR.iPonte, TR.iPonte + 3].forEach(i => { const p = ventral(i, 0.2); tube('a_pont', [[0.15, p[1], p[2]], [0.9, p[1] - 0.05, p[2] - 0.25], [1.45, p[1] - 0.1, p[2] - 0.8]], 0.05, 0.035, { seg: 16, rad: 6 }); });
(function () { const p = ventral(TR.iPonte + 2, 0.2); tube('a_labir', [[0.15, p[1], p[2]], [1.3, p[1] - 0.1, p[2] - 0.5], [2.4, p[1] - 0.05, p[2] - 0.9], [3.3, p[1] + 0.1, p[2] - 1.0]], 0.05, 0.04, { seg: 24, rad: 6 }); })();
tube('a_espant', (function () { const p = [[0, BAS_B[1] - 0.25, BAS_B[2] - 0.12]]; for (let i = TR.iInf + 2; i < TR.perfil.length; i += 2) p.push(ventral(i, 0.1)); return p; })(), 0.07, 0.06, { mid: true, seg: 24, rad: 7 });
tube('pica', [[1.0, BAS_B[1] - 1.0, BAS_B[2] - 0.6], [1.6, -5.4, -3.4], [1.9, -5.45, -4.6], [1.6, -5.2, -6.0]], 0.09, 0.06, { seg: 30, rad: 7 });
tube('aica', [desl(ventral(TR.iPonte + 4, 0.2), 0.2, 0, 0), [1.4, -3.4, -1.5], [2.6, -3.9, -2.2], [3.5, -4.4, -2.9]], 0.08, 0.06, { seg: 30, rad: 7 });
tube('sca', [desl(ventral(TR.iSup + 2, 0.2), 0.15, 0, 0), [1.3, -1.45, -1.1], [1.9, -1.4, -2.2], [2.0, -1.25, -3.6], [2.2, -1.35, -4.8]], 0.08, 0.06, { seg: 30, rad: 7 });
// ACP
const calc = sx => emOrdem(bd(sx, 'cuneus|pericalcarine', 'lingual|pericalcarine'), p => -p[2], 6);
tube('acp1', sx => [BAS_T, [sx * 0.45, BAS_T[1] + 0.06, BAS_T[2] + 0.13], [sx * 0.9, BAS_T[1] + 0.1, BAS_T[2] + 0.2]], 0.16, 0.16, { seg: 20 });
tube('acp', sx => [[sx * 0.9, BAS_T[1] + 0.1, BAS_T[2] + 0.2], [sx * 1.7, -0.9, -1.0], [sx * 2.0, -0.8, -1.8], [sx * 1.5, -0.3, -2.7], [sx * 0.9, 0.2, -3.3]].concat(medP(sx, calc(sx).slice(0, 1))), 0.16, 0.1, { seg: 70 });
tube('a_calc', sx => medP(sx, calc(sx)), 0.07, 0.05, { galhos: 'med', seg: 30, rad: 7 });
tube('a_parocc', sx => medP(sx, calc(sx).slice(0, 1).concat(emOrdem(bd(sx, 'cuneus|precuneus'), p => p[1], 5))), 0.06, 0.04, { galhos: 'med', seg: 30, rad: 7 });
tube('a_dorsalcc', sx => medP(sx, calc(sx).slice(0, 1).concat(arco(bd(sx, 'isthmuscingulate|unknown', 'posteriorcingulate|unknown'), 120, 215, 16).reverse().map(p => fora(p, 0.14)))), 0.06, 0.04, { galhos: 'med', gfr: [0.7, 0.95], seg: 36, rad: 7 });
tube('a_tempinf', sx => [[sx * 2.0, -0.85, -1.6]].concat(infP(sx, [[2.5, -1.9], [3.1, -2.8], [3.5, -3.9], [3.4, -5.0]])), 0.06, 0.04, { galhos: 'inf', seg: 30, rad: 7 });
tube('a_tempinf', sx => [[sx * 2.0, -0.85, -1.4]].concat(infP(sx, [[2.6, -0.9], [3.0, 0.0], [3.3, 0.9]])), 0.06, 0.04, { galhos: 'inf', seg: 30, rad: 7 });
tube('talamoperf', [[0.5, BAS_T[1] + 0.08, BAS_T[2] + 0.1], [0.7, -0.5, -0.7], [1.0, 0.3, -0.8]], 0.05, 0.04, { seg: 20, rad: 6 });
tube('talamoperf', [[0.3, BAS_T[1] + 0.08, BAS_T[2] + 0.1], [0.4, -0.6, -0.3], [0.6, 0.0, -0.2]], 0.05, 0.04, { seg: 20, rad: 6 });
tube('coropost', [[2.0, -0.8, -1.8], [2.3, 0.0, -2.3], [2.0, 1.2, -2.0], [1.3, 1.8, -1.0]], 0.05, 0.04, { seg: 30, rad: 6 });

/* ===== VEIAS E SEIOS ===== */
const SSS0 = 12, SSS1 = 197;
const TORC = CONT.pt(SSS1, 0.1);
const sssEm = z => { let b = null; for (let a = 30; a <= 150; a += 2) { const p = CONT.pt(a, 0.1); if (!b || Math.abs(p[2] - z) < Math.abs(b[2] - z)) b = p; } return b; };
const ST = [[0, 0, 0], [1.8, -0.1, 0.35], [3.6, -0.45, 1.4], [4.9, -0.9, 3.0], [5.5, -1.35, 4.6]].map(d => desl(TORC, d[0], d[1], d[2]));   // seio transverso (lado esquerdo)
const SIG0 = ST[ST.length - 1];
tube('sss', lin(SSS0, SSS1, 48).map(a => CONT.pt(a, 0.1)), 0.2, 0.2, { mid: true, seg: 140, rad: 8 });
tube('sinf', [[0, 1.95, 4.35], [0, 2.9, 2.6], [0, 3.15, 0.7], [0, 2.95, -1.0], [0, 2.4, -2.3], [0, 1.5, -3.0], [0, 0.85, -3.2]], 0.08, 0.1, { mid: true });
tube('galeno', [[0, 0.55, -1.95], [0, 0.4, -2.6], [0, 0.8, -3.2]], 0.2, 0.16, { mid: true });
// seio reto: acompanha a margem inferomedial dos lobos occipitais (inserção da foice na tenda)
const tenda = z => Math.min(ENV[1].inf(0.5, z), ENV[-1].inf(0.5, z)) - 0.12;
tube('sreto', [[0, 0.8, -3.2], [0, Math.min(0.3, tenda(-4.6)), -4.6], [0, tenda(-6.4), -6.4], TORC], 0.15, 0.18, { mid: true });
ell('torcula', TORC, [0.3, 0.3, 0.3], null, { mid: true });
tube('stransv', ST, 0.2, 0.2);
tube('socc', [TORC, desl(TORC, 0, -1.2, 0.55), desl(TORC, 0, -2.3, 1.6)], 0.08, 0.06, { mid: true, seg: 24, rad: 7 });
tube('sinterc', [[-0.75, -2.2, 1.65], [0, -2.25, 1.8], [0.75, -2.2, 1.65]], 0.08, 0.08, { mid: true, seg: 16, rad: 7 });
tube('sinterc', [[-0.75, -2.2, 0.95], [0, -2.25, 0.88], [0.75, -2.2, 0.95]], 0.08, 0.08, { mid: true, seg: 16, rad: 7 });
tube('ssigm', [SIG0, [5.3, SIG0[1] - 1.3, SIG0[2] + 0.6], [4.4, -4.9, -2.9], [3.4, -5.7, -2.5]], 0.2, 0.22);
tube('jugular', [[3.4, -5.7, -2.5], [3.2, -6.7, -2.2], [3.0, -8.2, -1.9]], 0.3, 0.3);
ell('scav', [1.0, -2.2, 1.3], [0.45, 0.4, 0.9], null);
ITEMS.scav.meshes.forEach(m => { m.userData.op0 = 0.4; });   // translúcido: deixa ver o sifão carótico dentro do seio
tube('spsup', sx => [[sx * 1.3, -2.35, 0.5]].concat(infP(sx, [[2.6, -0.9], [3.9, -2.3]], 0.25), [esp(sx, mix(SIG0, [5.3, SIG0[1] - 1.3, SIG0[2] + 0.6], 0.3))]), 0.09, 0.09);
tube('spinf', [[1.1, -2.6, 0.4], [1.9, -4.2, -1.2], [3.3, -5.6, -2.45]], 0.09, 0.09);
tube('vint', [[0.25, 1.0, 0.95], [0.22, 1.25, -0.3], [0.2, 1.1, -1.3], [0.1, 0.65, -1.9]], 0.07, 0.08);
tube('basal', [[1.3, -1.25, 1.2], [1.9, -1.2, 0.0], [2.1, -0.9, -1.3], [1.6, -0.2, -2.2], [0.6, 0.4, -2.3], [0.1, 0.5, -2.15]], 0.07, 0.09, { seg: 50 });
tube('silv', sx => surf(sx, [S(sx, 0.9), S(sx, 0.7), S(sx, 0.5), S(sx, 0.3), S(sx, 0.1)], 0.1).concat([[sx * 3.9, -1.7, 3.3], [sx * 2.8, -2.15, 3.0], [sx * 1.8, -2.3, 2.3], [sx * 1.1, -2.25, 1.7]]), 0.08, 0.1, { seg: 70, rad: 7 });
tube('trolard', sx => { const a = S(sx, 0.55), c = cen(sx, 'postcentral'); return surf(sx, [a, mix(a, c, 0.6), c, desl(c, -sx * 1.2, 1.6, -0.2), desl(c, -sx * 2.6, 2.8, -0.3)], 0.1).concat([desl(sssEm(c[2] - 0.3), sx * 0.3, 0, 0)]); }, 0.07, 0.06, { galhos: 'lat', gfr: [0.3, 0.6], seg: 44, rad: 7 });
tube('labbe', sx => { const a = S(sx, 0.7); return surf(sx, [a, desl(a, 0, -1.0, -1.0), desl(a, 0, -2.0, -2.4), desl(a, 0, -2.5, -3.6)], 0.1).concat([esp(sx, ST[3])]); }, 0.06, 0.07, { galhos: 'lat', gfr: [0.3, 0.6], seg: 44, rad: 7 });
[5.6, 4.2, 2.8, 1.2, -0.4, -2.0, -3.6, -5.2].forEach(z0 => {
  tube('vsup', sx => surf(sx, [[sx * 5.5, 2.8, z0], [sx * 4.6, 4.7, z0 - 0.1], [sx * 2.6, 6.6, z0 - 0.1]], 0.1).concat([desl(sssEm(z0 - 0.1), sx * 0.3, 0, 0)]), 0.05, 0.06, { galhos: 'lat', gfr: [0.35, 0.65], seg: 24, rad: 6 });
});

