/* ===== GRANDES VIAS (Machado, cap. 27, 29 e 30) =====
   Cada via é um tubo no sentido da condução, com setas animadas. Pontos de lesão (LES) ficam sobre a via;
   ao escolher um, o painel mostra o déficit e a explicação (modo Lesão). */
const VIAC = {};          // id -> curvas, para as setas
function trE(i) { const n = TR.perfil.length - 1; if (i <= n) return trP(i); const a = TR.perfil[n], b = TR.perfil[n - 2], k = (i - n) / 2; return [a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k]; }
const BE = (i, lat, prof) => { const p = trE(i); return [lat, p[0] + TRd[0] * prof, p[1] + TRd[1] * prof]; };
function cItem(id, sx) {
  const v = new THREE.Vector3(), t = [0, 0, 0]; let n = 0;
  ITEMS[id].meshes.forEach(m => { if (m.matrixAutoUpdate !== false || (m.userData.side !== sx && m.userData.side !== 0)) return; const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k += 2) { v.fromBufferAttribute(p, k).applyMatrix4(m.matrix); if (m.userData.side === 0 && v.x * sx < 0) continue; t[0] += v.x; t[1] += v.y; t[2] += v.z; n++; } });
  return n ? t.map(x => x / n) : [sx * 1.2, 0.6, -0.6];
}
function leque(id, ponta, dentro, r) {   // ramos curtos em leque a partir de 'dentro' até a superfície em volta de 'ponta'
  const sx = ponta[0] >= 0 ? 1 : -1, n = new THREE.Vector3(ponta[0] - dentro[0], ponta[1] - dentro[1], ponta[2] - dentro[2]).normalize();
  const t1 = new THREE.Vector3(0, 1, 0).cross(n); if (t1.lengthSq() < 1e-3) t1.set(1, 0, 0); t1.normalize(); const t2 = n.clone().cross(t1).normalize();
  [[0.9, 0], [-0.9, 0], [0, 0.9], [0, -0.9], [0.65, 0.65], [-0.65, -0.65]].forEach(q => {
    const alvo = [ponta[0] + t1.x * q[0] + t2.x * q[1], ponta[1] + t1.y * q[0] + t2.y * q[1], ponta[2] + t1.z * q[0] + t2.z * q[1]], sup = surf(sx, [alvo], 0.04)[0];
    tube(id, [dentro, mix(dentro, sup, 0.55), sup], r * 0.9, r * 0.35, { mid: true, seg: 20, rad: 7 });
  });
}
function via(id, pts, r) {
  // chegada ao córtex: se uma ponta está na superfície, a via se abre em leque (coroa radiada)
  [[pts[0], pts[Math.min(2, pts.length - 1)]], [pts[pts.length - 1], pts[Math.max(0, pts.length - 3)]]].forEach(q => {
    const p = q[0], sx = p[0] >= 0 ? 1 : -1; if (Math.abs(p[0]) < 0.5) return; const sp = surf(sx, [p], 0)[0];
    if (Math.hypot(sp[0] - p[0], sp[1] - p[1], sp[2] - p[2]) < 0.5) leque(id, p, mix(p, q[1], 0.5), r * 1.4);
  });
  pts = pts.filter((q, i) => i === 0 || Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1], q[2] - pts[i - 1][2]) > 0.02);
  tube(id, pts, r * 1.4, r * 1.4, { mid: true, seg: Math.max(30, pts.length * 12), rad: 8 });
  (VIAC[id] = VIAC[id] || []).push(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5));
}
const TAL = cItem('talamo', 1), VPL = desl(TAL, 0.3, -0.25, -0.35);
const CAPP = [2.05, 0.35, -0.3], CAPS = [2.35, 0.55, -0.65];          // perna posterior da cápsula interna (motora / sensitiva)
const PRE = cen(1, 'precentral'), POS = cen(1, 'postcentral'), PARA = cen(1, 'paracentral');
const PREF = mix(PRE, S(1, 0.42), 0.62);                             // parte inferior da área 4 (cabeça)
const POSF = mix(POS, S(1, 0.62), 0.6);
const recuo = (p, k) => [p[0] * (1 - k), p[1] - k * 0.6, p[2]];       // leva um ponto do córtex para a substância branca

// corticospinal: área 4 (mão e pé) -> coroa radiada -> cápsula -> pedúnculo -> ponte -> pirâmide -> decussação
const CS = [[1.6, -0.35, -0.5], B(3.5, 0.75, 0.3), B(7, 0.62, 0.55), B(12, 0.55, 0.75), B(17, 0.5, 0.7), B(21, 0.4, 0.45), B(24, 0.3, 0.17), B(27, 0.25, 0.2)];
via('v_cs', [PRE, recuo(PRE, 0.25), [2.9, 2.5, -0.1], CAPP].concat(CS, [B(29.5, 0, 0.45), BE(31.5, -0.4, 0.8), BE(35, -0.45, 0.8)]), 0.07);
via('v_cs', [PARA, desl(PARA, 0.5, -0.8, 0), [1.9, 2.6, -0.4], CAPP], 0.05);                     // fibras da área do pé (lóbulo paracentral)
via('v_cs', [B(27, 0.25, 0.2), BE(31, 0.18, 0.15), BE(35, 0.15, 0.15)], 0.04);                     // trato corticospinal anterior (não cruza no bulbo)
// corticonuclear: parte inferior da área 4 -> joelho da cápsula -> tronco, com feixes para os núcleos motores
const CN = [PREF, recuo(PREF, 0.25), [3.0, 1.6, 0.6], [1.75, 0.5, 1.0], [1.4, -0.3, -0.35], B(3.5, 0.6, 0.35), B(8, 0.5, 0.6), B(12, 0.45, 0.78), B(19, 0.4, 0.62), B(23, 0.32, 0.35)];
via('v_cn', CN, 0.06);
[[B(12, 0.45, 0.78), B(12, 0.75, F(12) * 0.72)], [B(12, 0.45, 0.78), B(11, 0, 1.0), B(12, -0.75, F(12) * 0.72)],
 [B(19, 0.4, 0.62), B(19, 0.8, F(19) * 0.5)], [B(19, 0.4, 0.62), B(18.5, 0, 0.95), B(19, -0.8, F(19) * 0.5)],
 [B(23, 0.32, 0.35), B(24, 0.6, F(24) * 0.45)], [B(23, 0.32, 0.35), B(23.5, 0, 0.6), B(24, -0.6, F(24) * 0.45)],
 [B(23, 0.32, 0.35), B(24.5, 0, F(24.5) - 0.5), B(25, -0.11, F(25) - 0.15)]].forEach(p => via('v_cn', p, 0.03));
// lemnisco medial: fascículos do lado direito -> núcleos grácil e cuneiforme -> cruzam -> lemnisco esquerdo -> VPL -> pós-central
const GRA = B(29.2, -0.28, 1.05);
via('v_lm', [BE(35, -0.3, 1.0), BE(32, -0.3, 1.02), GRA, B(28.3, -0.15, 0.75), B(27.5, 0, 0.55), B(26.5, 0.16, 0.5), B(24, 0.2, 0.55), B(20, 0.35, 1.3), B(16, 0.45, 1.45), B(12, 0.62, 1.5), B(8, 0.8, 1.3), B(5, 0.95, 1.0), B(3, 1.1, 0.75), VPL, CAPS, [3.0, 2.4, -0.8], recuo(POS, 0.25), POS], 0.065);
via('v_lm', [VPL, desl(CAPS, -0.1, 0.1, 0.05), [2.0, 2.7, -1.0], desl(PARA, 0.5, -0.8, -0.6), desl(PARA, 0, 0, -0.6)], 0.045);   // área do pé
// neoespinotalâmica: coluna posterior direita -> comissura branca -> funículo lateral esquerdo -> lemnisco espinal -> VPL
const latE = (i, p, f) => latT(i, p) * f;
via('v_st', [BE(35.5, -0.35, 0.95), BE(34.8, 0, 0.55), BE(34, 0.45, 0.65), BE(31, 0.62, 0.7), B(27, latE(27, 0.8, 0.72), 0.8), B(23, latE(23, 0.9, 0.7), 0.9), B(19, latE(19, 1.6, 0.6), 1.6), B(14, latE(14, 1.6, 0.6), 1.6), B(9, latE(9, 1.4, 0.65), 1.4), B(5, latE(5, 1.0, 0.75), 1.0), desl(VPL, 0.12, -0.2, -0.1), desl(CAPS, 0.12, -0.05, -0.1), [3.2, 2.3, -1.1], recuo(POS, 0.2), desl(POS, 0, -0.1, -0.35)], 0.065);
// via óptica: retina -> nervo -> quiasma -> trato -> corpo geniculado lateral -> radiação -> lábios do sulco calcarino
const OLHO = sx => [sx * 1.5, Math.min(-1.6, ENV[sx].inf(1.5, 3.6) - 0.25), 3.6];
const TROPT = [[0.5, -1.3, 1.3], [1.3, -1.2, 0.6], [2.0, -0.9, -0.4], [2.45, -0.5, -1.45]], CGL = [2.5, -0.35, -1.75];
via('v_opt', [OLHO(1), [1.0, -1.45, 2.6], [0.55, -1.3, 1.65], [0.48, -1.3, 1.4]].concat(TROPT, [CGL]), 0.06);                 // retina temporal esquerda: não cruza
via('v_opt', [OLHO(-1), [-1.0, -1.45, 2.6], [-0.5, -1.3, 1.75], [0, -1.32, 1.5], [0.45, -1.32, 1.3]].concat(TROPT.slice(1), [CGL]), 0.06);   // retina nasal direita: cruza no quiasma
const LABS = emOrdem(bd(1, 'cuneus|pericalcarine'), p => -p[2], 4).map(p => desl(p, 0.3, 0, 0)), LABI = emOrdem(bd(1, 'lingual|pericalcarine'), p => -p[2], 4).map(p => desl(p, 0.3, 0, 0));
via('v_opt', [CGL, [2.85, 0.15, -2.4], [2.75, 0.55, -3.8], [2.0, 0.5, -5.0]].concat(LABS.slice(0, 3)), 0.055);                          // partes superiores da retina
const RADI = [CGL, [3.2, -0.75, -1.2], [3.6, -0.75, -2.4], [3.0, -0.45, -4.0], [2.1, -0.3, -5.1]];
via('v_opt', RADI.concat(LABI.slice(0, 3)), 0.055);                                                                                       // partes inferiores da retina (passam pelo lobo temporal)
// via auditiva: cóclea direita -> núcleos cocleares -> corpo trapezoide -> lemnisco lateral esquerdo -> colículo inferior -> CGM -> giro temporal transverso
const COCLEA = sx => [sx * 3.9, -3.9, -1.65], NCOC = sx => B(22.2, sx * 1.08, F(22.2) - 0.1), TT = cen(1, 'transversetemporal');
const LLAT = [B(19.5, 0.85, 1.15), B(15, 1.1, 1.75), B(11, 1.05, 2.3), B(8.6, 0.55, 2.7)];
via('v_aud', [COCLEA(-1), [-3.3, -3.75, -1.7], desl(NCOC(-1), -0.25, 0, 0), NCOC(-1), B(21, -0.55, 1.0), B(20.6, 0, 0.9), B(20.3, 0.55, 1.0)].concat(LLAT, [[0.9, -0.8, -2.75], [1.55, -0.55, -2.3], [1.9, -0.4, -2.1], [2.6, -0.1, -1.6], [3.4, 0.35, -1.2], TT]), 0.065);
via('v_aud', [COCLEA(1), [3.3, -3.75, -1.7], desl(NCOC(1), 0.25, 0, 0), NCOC(1), B(20.5, 0.95, 1.2), B(19.5, 0.9, 1.2)], 0.035);   // fibras homolaterais
// circuito de Papez (dos dois lados)
[1, -1].forEach(sx => {
  const HC = cItem('hipocampo', sx), TA = desl(cItem('talamo', sx), 0, 0.45, 0.75), e = p => [p[0] * sx, p[1], p[2]];
  const fx = [[2.05, 0.05, -2.95], [1.75, 0.75, -2.7], [1.1, 1.4, -2.1], [0.45, 1.68, -1.1], [0.22, 1.7, -0.1], [0.2, 1.5, 0.75], [0.22, 0.9, 1.08], [0.25, 0.2, 1.05], [0.3, -0.5, 0.6], [0.3, -0.95, 0.05]];
  const cg = ['caudalanteriorcingulate', 'posteriorcingulate', 'isthmuscingulate', 'parahippocampal'].map(k => desl(cen(sx, k), sx * 0.15, 0, 0));
  via('v_papez', [desl(HC, sx * -0.1, 0.1, -0.6)].concat(fx.map(e), [e([0.3, -1.05, -0.05]), e([0.4, -0.3, -0.3]), TA, desl(TA, sx * 0.3, 0.9, 0.5), cg[0], cg[1], cg[2], cg[3], desl(HC, 0, -0.1, 0.4)]), 0.05);
});

// vias vestibulares (lado esquerdo): gânglio vestibular -> núcleos vestibulares -> pedúnculo cerebelar inferior -> lobo floculonodular; vestibulospinal
const NVEST = B(21, 0.8, F(21) - 0.14), NODULO = [0.3, -3.35, -4.3], FLOC = [2.4, -4.2, -3.1];
via('v_vest', [desl(MAI, 0.15, 0.08, -0.05), [2.6, -3.7, -1.75], B(21.5, latT(21.5, 1.0) + 0.05, 1.0), NVEST], 0.06);
via('v_vest', [NVEST, B(22.5, 1.05, F(22.5) + 0.25), [1.35, -3.55, -3.7], [0.8, -3.5, -4.15], NODULO], 0.05);
via('v_vest', [B(22.5, 1.05, F(22.5) + 0.25), [1.9, -3.9, -3.5], FLOC], 0.04);
via('v_vest', [NVEST, B(24, 0.75, 1.2), B(27, 0.6, 0.9), BE(31, 0.55, 0.55), BE(35, 0.5, 0.5)], 0.05);   // trato vestibulospinal
// circuitos do cerebelo: corticopontocerebelar e dentotalamocortical (alça esquerda-direita-esquerda) e espinocerebelar posterior
const CMF = cen(1, 'caudalmiddlefrontal'), PONT = B(14, 0.45, 0.7), ZLAT = [-3.8, -3.6, -5.6], DENT = [-1.7, -3.0, -4.7], VL = desl(TAL, 0.15, 0.05, 0.35);
via('v_cereb', [CMF, recuo(CMF, 0.25), [2.5, 1.5, 0.7], [1.75, 0.15, 0.1], B(3.5, 0.9, 0.22), B(9, 0.62, 0.45), PONT, B(14.5, 0, 0.75), B(14, -0.9, 0.95), B(14, -latT(14, 1.6) + 0.05, 1.7), [-2.5, -3.1, -3.5], ZLAT], 0.06);
via('v_cereb', [ZLAT, [-2.6, -3.3, -5.1], DENT, [-1.1, -2.4, -3.9], B(8, -0.55, 2.3), B(6, 0, 1.6), B(4.5, 0.45, 1.0), [0.9, -0.2, -1.0], VL, CAPP, [2.9, 2.5, -0.1], recuo(PRE, 0.25), desl(PRE, 0, 0, -0.15)], 0.06);
via('v_cereb', [BE(34, 0.6, 0.9), B(27, 0.75, 1.0), B(23, 1.0, 1.5), [1.4, -3.4, -4.2], [0.9, -3.0, -5.6]], 0.05);   // espinocerebelar posterior
// núcleos da base, circuito motor (lado esquerdo)
const PUT = cItem('putame', 1), GPI = cItem('gpi', 1), GPE = cItem('gpe', 1), STN = [1.2, -0.5, -0.7], SNC = [0.95, -0.95, -1.2], VAVL = desl(TAL, 0.1, 0.1, 0.55);
via('v_nb', [desl(PRE, 0, 0, 0.15), recuo(PRE, 0.25), [3.3, 1.6, 0.6], desl(PUT, 0.15, 0.35, 0.3)], 0.06);                       // córtex -> neoestriado
via('v_nb', [desl(PUT, 0, 0.1, 0.2), desl(GPI, 0, 0.1, 0.3), [1.5, 0.35, 0.55], VAVL, [2.0, 1.3, 0.6], [3.0, 2.4, 0.4], recuo(PRE, 0.2), desl(PRE, 0, 0.1, 0.35)], 0.06);   // via direta -> tálamo -> córtex
via('v_nb', [desl(PUT, 0, -0.15, -0.2), desl(GPE, 0.05, -0.1, -0.2), [1.45, -0.4, -0.45], STN, [1.35, -0.25, -0.2], desl(GPI, 0, -0.1, -0.1)], 0.045);   // via indireta
via('v_nb', [SNC, [1.4, -0.75, -0.5], [2.0, -0.4, 0.2], desl(PUT, -0.1, -0.35, 0.1)], 0.04);                                     // fibras nigroestriatais
// hipotálamo: núcleos supra-óptico e paraventricular -> infundíbulo -> neuro-hipófise
const SO = [0.45, -1.1, 1.45], PV = [0.22, -0.35, 0.95], INF = [0.04, -1.55, 1.25], NEURO = [0, -2.25, 1.15];
via('v_hip', [PV, [0.2, -0.8, 1.1], [0.1, -1.25, 1.2], INF, [0.02, -1.95, 1.2], NEURO], 0.05);
via('v_hip', [SO, [0.3, -1.3, 1.35], INF], 0.045);

