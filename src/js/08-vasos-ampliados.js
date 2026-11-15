/* ===== VASCULARIZAÇÃO AMPLIADA (Machado, cap. 8 e 18; o que ele não descreve está marcado "a confirmar") ===== */
['a_tempant', 'a_tempmed', 'a_temppost'].forEach(id => ITEMS[id].meshes.forEach(m => { m.userData.pai = 'a_temp'; itemOf('a_temp').meshes.push(m); }));
ITEMS.a_polfront.meshes.forEach(m => { m.userData.pai = 'a_fbm'; itemOf('a_fbm').meshes.push(m); });
// superfície do cerebelo (malha nova): ponto mais alto e mais baixo perto de (x, z)
const CBG = (function () { const P = CB.HP, g = new Map(); for (let i = 0; i < P.length; i += 3) { const k = Math.round(P[i] / 0.3) + ',' + Math.round(P[i + 2] / 0.3); const c = g.get(k); if (!c) g.set(k, [P[i + 1], P[i + 1]]); else { c[0] = Math.max(c[0], P[i + 1]); c[1] = Math.min(c[1], P[i + 1]); } } return g; })();
const cbY = (x, z, cima) => { const c = CBG.get(Math.round(Math.abs(x) / 0.3) + ',' + Math.round(z / 0.3)); return c ? (cima ? c[0] + 0.08 : c[1] - 0.08) : -3; };
const cbSup = (sx, x, z) => [sx * x, cbY(x, z, true), z], cbInf = (sx, x, z) => [sx * x, cbY(x, z, false), z];
const Bd = (i, lat, p) => i <= 29 ? B(i, lat, p) : desl(B(29, lat, p), 0, -0.183 * (i - 29), -0.082 * (i - 29));   // abaixo do bulbo da malha
const vnt = (i, x, p) => B(i, x, p);
// artérias espinais posteriores: da vertebral, contornam o bulbo dorsalmente e descem pela medula
tube('a_espost', [[1.12, -6.05, -3.5], Bd(28.6, 0.95, 0.75), Bd(28.4, 0.6, 1.3), Bd(30, 0.42, 1.25), Bd(33, 0.4, 1.2)], 0.045, 0.04, { seg: 40, rad: 7 });
// artéria hipofisária e ramos centrais
tube('a_hipof', [[1.1, -1.95, 1.65], [0.62, -1.85, 1.5], [0.12, -1.72, 1.32]], 0.035, 0.03, { seg: 20, rad: 6 });
[[0.14, -0.9, 1.97, 0.3, -0.25, 1.35], [0.45, -0.98, 1.88, 0.6, -0.2, 1.4], [0.7, -1.0, 1.8, 0.95, -0.15, 1.45], [0.3, -0.93, 1.93, 0.35, -0.55, 1.15]].forEach(q => tube('centrais_am', [[q[0], q[1], q[2]], [(q[0] + q[3]) / 2, (q[1] + q[4]) / 2 - 0.05, (q[2] + q[5]) / 2], [q[3], q[4], q[5]]], 0.03, 0.022, { seg: 16, rad: 6 }));
[[1.7, -0.9, -1.0, 1.95, -0.15, -1.2], [1.85, -0.85, -1.4, 2.05, -0.1, -1.65], [2.0, -0.8, -1.8, 1.75, 0.05, -2.0]].forEach(q => tube('centrais_pl', [[q[0], q[1], q[2]], [(q[0] + q[3]) / 2 + 0.05, (q[1] + q[4]) / 2, (q[2] + q[5]) / 2], [q[3], q[4], q[5]]], 0.03, 0.022, { seg: 16, rad: 6 }));
// ramos corticais da ACA e da ACM
tube('a_frontmed', sx => { const cg = arcoCingulo(sx), out = []; [0, 2, 4].forEach(k => { }); return medP(sx, [cg[1] || cg[0], desl(cg[1] || cg[0], 0, 0.9, 0.2), desl(cg[1] || cg[0], 0, 1.9, 0.3)]); }, 0.05, 0.035, { galhos: 'med', gfr: [0.7, 0.95], seg: 24, rad: 6 });
tube('a_frontmed', sx => { const cg = arcoCingulo(sx), a = cg[3] || cg[cg.length - 1]; return medP(sx, [a, desl(a, 0, 0.9, -0.1), desl(a, 0, 1.8, -0.2)]); }, 0.05, 0.035, { galhos: 'med', gfr: [0.7, 0.95], seg: 24, rad: 6 });
tube('a_prefront', sx => { const a = S(sx, 0.2), b = cen(sx, 'parstriangularis'), c = cen(sx, 'rostralmiddlefrontal'); return surf(sx, [a, b, mix(b, c, 0.6), c]); }, 0.06, 0.035, { galhos: 'lat', seg: 30, rad: 6 });
// veias cerebrais superficiais inferiores: face inferior do lobo temporal para o seio transverso e para os seios da base
tube('vinf', sx => infP(sx, [[3.0, 0.6], [3.5, -0.8], [3.8, -2.2]]).concat([esp(sx, ST[3])]), 0.06, 0.07, { galhos: 'inf', gfr: [0.4], seg: 30, rad: 7 });
tube('vinf', sx => infP(sx, [[3.3, 1.6], [2.6, 1.9]]).concat([[sx * 1.6, -2.3, 1.5]]), 0.05, 0.06, { galhos: 'inf', gfr: [0.4], seg: 24, rad: 7 });
// seio esfenoparietal e plexo basilar
tube('sesfpar', [[3.5, -0.95, 2.55], [2.5, -1.45, 2.25], [1.6, -1.9, 1.95], [1.1, -2.15, 1.8]], 0.08, 0.09, { seg: 30, rad: 8 });
tube('plexbas', (function () { const p = []; for (let i = 4; i <= 28; i += 2) p.push(ventral(i, 0.62)); return p; })(), 0.06, 0.06, { mid: true, sx: 3.5, seg: 50, rad: 10 });
tube('plexbas', sx => [ventral(10, 0.62).map((c, k) => k === 0 ? sx * 0.35 : c), [sx * 1.0, -2.6, 0.5]], 0.05, 0.05, { seg: 12, rad: 6 });
// sistema venoso profundo: tributárias da veia cerebral interna e da veia basal
tube('v_talest', [[1.95, 1.15, -1.5], [1.45, 1.45, -0.3], [0.9, 1.35, 0.6], [0.3, 1.02, 0.95]], 0.05, 0.06, { seg: 30, rad: 7 });
tube('v_coroid', [[1.9, 1.22, -2.1], [1.25, 1.6, -1.0], [0.85, 1.55, 0.0], [0.33, 1.05, 0.9]], 0.035, 0.045, { seg: 30, rad: 6 });
tube('v_septo', [[0.22, 1.65, 2.4], [0.18, 1.4, 1.6], [0.27, 1.05, 1.0]], 0.035, 0.045, { seg: 20, rad: 6 });
tube('v_profmed', sx => { const ci = cen(sx, 'insula'); return [desl(ci, -sx * 0.35, -0.2, 0.2), [sx * 2.4, -1.1, 1.4], [sx * 1.4, -1.25, 1.25]]; }, 0.045, 0.06, { seg: 24, rad: 7 });
tube('v_cerant', [[0.25, -0.6, 2.6], [0.55, -1.0, 1.85], [1.3, -1.25, 1.22]], 0.035, 0.045, { seg: 20, rad: 6 });
tube('v_comunpost', [[-0.95, -1.12, -0.42], [-0.4, -1.32, -0.3], [0, -1.36, -0.28], [0.4, -1.32, -0.3], [0.95, -1.12, -0.42]], 0.035, 0.035, { mid: true, seg: 24, rad: 6 });
// fossa posterior: veias da face ventral do tronco
tube('v_pontomes', [vnt(3.5, 0.1, 0.05), vnt(5, 0.2, 0.0), vnt(6.5, 0.6, 0.05), [1.2, -1.2, -0.55], [1.9, -1.2, 0.0]], 0.035, 0.04, { seg: 30, rad: 6 });
tube('v_amponte', (function () { const p = []; for (let i = 6; i <= 21.5; i += 2.5) p.push(vnt(i, 0.28, 0.04)); return p; })(), 0.03, 0.035, { seg: 30, rad: 6 });
tube('v_alponte', (function () { const p = []; for (let i = 7; i <= 20; i += 2.5) p.push(vnt(i, 1.0, 0.12 + 0.25 * (1.0 / 1.5) ** 2)); return p; })(), 0.03, 0.035, { seg: 30, rad: 6 });
tube('v_ambulbo', (function () { const p = []; for (let i = 22.5; i <= 31; i += 1.5) p.push(Bd(i, 0.05, -0.05)); return p; })(), 0.03, 0.03, { mid: true, seg: 30, rad: 6 });
tube('v_recesso', [[1.45, -3.9, -3.25], [2.3, -4.0, -3.0], [3.0, -3.55, -1.95]], 0.035, 0.04, { seg: 20, rad: 6 });
// fossa posterior: veias do cerebelo
tube('v_vermsup', [CB.sag(20, 0.1), CB.sag(55, 0.1), CB.sag(90, 0.1), CB.sag(125, 0.1), [0, 0.45, -2.75]], 0.045, 0.06, { mid: true, seg: 40, rad: 7 });
tube('v_verminf', [CB.sag(-115, 0.1), CB.sag(-80, 0.1), CB.sag(-45, 0.1), CB.sag(-10, 0.1), TORC], 0.045, 0.06, { mid: true, seg: 40, rad: 7 });
tube('v_cerebsup', sx => [cbSup(sx, 1.5, -6.3), cbSup(sx, 2.8, -5.8), cbSup(sx, 3.9, -5.0), esp(sx, ST[2])], 0.04, 0.055, { seg: 30, rad: 6 });
tube('v_cerebsup', sx => [cbSup(sx, 2.2, -4.6), cbSup(sx, 3.4, -4.4), esp(sx, ST[3])], 0.035, 0.05, { seg: 24, rad: 6 });
tube('v_cerebinf', sx => [cbInf(sx, 1.6, -6.0), cbInf(sx, 3.0, -5.6), cbInf(sx, 4.2, -4.4), esp(sx, mix(SIG0, [5.3, SIG0[1] - 1.3, SIG0[2] + 0.6], 0.5))], 0.04, 0.055, { seg: 30, rad: 6 });

// continuação das artérias cerebelares sobre o cerebelo (Prometheus, p. 252): sobem/descem e se ramificam na superfície
tube('sca', sx => [[sx * 2.2, -1.35, -4.8], cbSup(sx, 1.9, -5.3), cbSup(sx, 2.7, -6.0), cbSup(sx, 3.6, -6.5), cbSup(sx, 4.4, -6.7)], 0.06, 0.03, { galhos: 'cbs', gfr: [0.4, 0.7, 0.95], seg: 40, rad: 6 });
tube('sca', sx => [[sx * 1.3, -1.45, -1.1], cbSup(sx, 0.8, -3.4), cbSup(sx, 0.45, -4.6), cbSup(sx, 0.35, -5.8)], 0.045, 0.025, { galhos: 'cbs', gfr: [0.6, 0.95], seg: 36, rad: 6 });   // ramo vermiano superior
tube('pica', sx => [[sx * 1.6, -5.2, -6.0], cbInf(sx, 2.4, -6.4), cbInf(sx, 3.4, -6.5), cbInf(sx, 4.3, -6.1)], 0.055, 0.025, { galhos: 'cbi', gfr: [0.5, 0.95], seg: 36, rad: 6 });   // ramo hemisférico
tube('pica', sx => [[sx * 1.6, -5.2, -6.0], cbInf(sx, 0.9, -6.6), cbInf(sx, 0.4, -7.2)], 0.045, 0.025, { seg: 30, rad: 6 });   // ramo vermiano inferior
tube('aica', sx => [[sx * 3.5, -4.4, -2.9], cbInf(sx, 4.1, -3.7), cbInf(sx, 4.7, -4.6)], 0.055, 0.025, { galhos: 'cbi', gfr: [0.6, 0.95], seg: 30, rad: 6 });
// veia oftálmica superior: da órbita para a parte anterior do seio cavernoso (Prometheus, p. 256)
tube('v_oftsup', [[1.05, -2.2, 2.1], [1.3, -2.0, 2.75], [1.55, -1.9, 3.5], [1.7, -1.85, 4.2]], 0.075, 0.055, { seg: 30, rad: 7 });
// seio marginal: anel em volta do forame magno, ligado ao plexo basilar e ao seio occipital (Prometheus, p. 254-257)
const SMG = (function () {
  const c0 = ventral(28, -0.55), c = [0, c0[1] - 0.913 * 0.4, c0[2] - 0.408 * 0.4], vy = -0.408, vz = 0.913, p = [];
  for (let a = 0; a <= 360; a += 15) { const t = a * Math.PI / 180; p.push([Math.sin(t) * 1.7, c[1] + vy * Math.cos(t) * 1.45, c[2] + vz * Math.cos(t) * 1.45]); }
  return p;
})();
tube('smarg', SMG, 0.065, 0.065, { mid: true, seg: 80, rad: 8 });
tube('smarg', [ventral(28, 0.62), SMG[0]], 0.06, 0.065, { mid: true, seg: 10, rad: 7 });
tube('socc', [desl(TORC, 0, -2.3, 1.6), [0, -4.55, -5.6], SMG[12]], 0.06, 0.065, { mid: true, seg: 24, rad: 7 });
// veias emissárias (Prometheus, p. 256-257): parietal (do seio sagital superior), occipital (da confluência), mastóidea (do sigmóideo), condilar (do bulbo da jugular)
tube('v_emiss', sx => { const a = sssEm(-2.4); return [a, desl(a, sx * 0.3, 0.55, 0), desl(a, sx * 0.5, 1.15, -0.05)]; }, 0.05, 0.03, { seg: 16, rad: 6 });
tube('v_emiss', [TORC, desl(TORC, 0, -0.25, -0.6), desl(TORC, 0, -0.35, -1.2)], 0.055, 0.03, { mid: true, seg: 16, rad: 6 });
tube('v_emiss', sx => { const a = esp(sx, [5.3, SIG0[1] - 1.3, SIG0[2] + 0.6]); return [a, desl(a, sx * 0.55, -0.1, -0.35), desl(a, sx * 1.0, -0.25, -0.75)]; }, 0.05, 0.03, { seg: 16, rad: 6 });
tube('v_emiss', [[3.4, -5.7, -2.5], [3.15, -6.25, -3.15], [2.85, -6.85, -3.6]], 0.05, 0.03, { seg: 16, rad: 6 });
// veia occipital interna: da região calcarina para a veia cerebral magna (Prometheus, p. 258)
tube('v_occint', sx => medP(sx, calc(sx).slice().reverse()).concat([[sx * 0.2, 0.45, -2.85]]), 0.035, 0.055, { seg: 40, rad: 6 });

// braços dos colículos e véu medular superior (Machado, cap. 5, figura 5.2; p. 46)
tube('bracinf', [[0.68, -0.95, -2.85], [1.3, -0.75, -2.55], [1.85, -0.45, -2.15]], 0.1, 0.09, { seg: 30, rad: 10 });
tube('bracsup', [[0.72, -0.28, -2.45], [1.55, -0.32, -2.25], [2.35, -0.35, -1.85]], 0.09, 0.08, { seg: 30, rad: 10 });
fita('veusup', [B(6.8, 0, F(6.8) + 0.3), B(9.5, 0, F(9.5) + 0.32), B(12.2, 0, F(12.2) + 0.34)], u => 0.2 + 0.2 * u, 0.025, { mid: true, up: [0, 0.408, -0.913], ponta: false });
// pedúnculos cerebelares (Machado, cap. 5, p. 49): superior ao mesencéfalo, médio à ponte, inferior ao bulbo
tube('pcm', [B(12.5, latT(12.5, 1.3) * 0.88, 1.3), B(14, latT(14, 1.7) + 0.05, 1.9), [2.25, -2.95, -3.35], [2.55, -3.3, -4.25]], 0.42, 0.3, { seg: 40, rad: 14 });
tube('pcs', [B(5.5, 0.48, F(5.5) + 0.22), B(8.5, 0.78, F(8.5) + 0.2), [1.3, -2.65, -4.1], [1.65, -2.95, -4.6]], 0.17, 0.17, { seg: 40, rad: 12 });
tube('pci', [B(26.5, 0.75, F(26.5) + 0.12), B(23.5, 1.05, F(23.5) + 0.35), [1.6, -3.5, -4.05], [1.9, -3.6, -4.6]], 0.19, 0.19, { seg: 40, rad: 12 });

