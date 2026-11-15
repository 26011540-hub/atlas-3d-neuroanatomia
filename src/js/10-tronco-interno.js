/* ===== TRONCO: NÚCLEOS E FEIXES INTERNOS (remodelagem 3, fase 4) =====
   Gabarito: Unicamp, série axial de cerebelo e tronco (figuras 1 a 21). Texto: Machado, cap. 16 e 17.
   Posições tiradas das regiões reais da superfície (oliva, tubérculos, assoalho do IV ventrículo); formas esquemáticas. */
// eixo do tronco no plano mediano: ponto ventral e direções (cranial e dorsal) num nível qualquer (fracionário) do perfil
function eixoTronco(f) {
  const P = MARCOS.tronco.perfil, n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(f))), t = Math.max(0, Math.min(1, f - i));
  const y = P[i][0] + (P[i + 1][0] - P[i][0]) * t, z = P[i][1] + (P[i + 1][1] - P[i][1]) * t;
  const a = P[Math.max(0, i - 6)], b = P[Math.min(n, i + 7)], ty = a[0] - b[0], tz = a[1] - b[1], L = Math.hypot(ty, tz) || 1;   // janela larga: a ponte é abaulada e o eixo local oscila
  const cr = [0, ty / L, tz / L];            // cranial (para cima ao longo do tronco)
  const dor = [0, cr[2], -cr[1]];            // dorsal (para trás, perpendicular ao eixo)
  return { V: [0, y, z], cr, dor };
}
const ROT_TRONCO = Math.atan2(0.28, 0.96);   // inclinação do eixo do tronco em relação à vertical
// núcleo olivar inferior: bolsa pregueada dentro da oliva, aberta medialmente (hilo); núcleos olivares acessórios não modelados
blob('nuoliva', [0.7, -4.66, -2.84], [0.17, 0.34, 0.18], [ROT_TRONCO, 0, 0], { amp: 0.22, freq: 4.2, seed: 61, seg: 48, seg2: 36, achata: [0, 0.55] });
// núcleos grácil e cuneiforme: sob os tubérculos homônimos, no bulbo fechado
blob('nugrac', [0.17, -4.97, -3.4], [0.08, 0.3, 0.08], [ROT_TRONCO, 0, 0], { amp: 0.05, seed: 63 });
blob('nucun', [0.5, -4.8, -3.52], [0.11, 0.27, 0.09], [ROT_TRONCO, 0, 0], { amp: 0.05, seed: 65 });
// núcleos da base da ponte: grupos de neurônios espalhados entre as fibras da base (granulado esquemático)
(function () {
  let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const T = MARCOS.tronco, cnt = 34;
  for (let k = 0; k < cnt; k++) {
    const f = T.iSup + 1.5 + rnd() * (T.iInf - T.iSup - 3), e = eixoTronco(f), prof = 0.18 + rnd() * 0.5, x = (rnd() * 2 - 1) * 0.85;
    const c = [x, e.V[1] + e.dor[1] * prof, e.V[2] + e.dor[2] * prof];
    blob('nupont', c, [0.07 + rnd() * 0.04, 0.05, 0.06], null, { mid: true, amp: 0.2, seed: 70 + k, seg: 12, seg2: 9 });
  }
})();
// formação reticular: coluna difusa no centro do tegmento, do mesencéfalo ao bulbo
tube('freticular', sx => lin(1, 28, 14).map(f => { const e = eixoTronco(f), prof = f < MARCOS.tronco.iSup ? 0.95 : (f < MARCOS.tronco.iInf ? 1.05 : 0.7); return [sx * 0.3, e.V[1] + e.dor[1] * prof, e.V[2] + e.dor[2] * prof]; }), 0.2, 0.15, { seg: 60, rad: 10, reto: true });
ITEMS.freticular.meshes.forEach(m => { m.userData.op0 = 0.45; });
// corpo trapezoide: fibras transversais da via auditiva, na parte ventral do tegmento da ponte inferior
(function () { const e = eixoTronco(MARCOS.tronco.iInf - 3), p = 0.62; const y = e.V[1] + e.dor[1] * p, z = e.V[2] + e.dor[2] * p;
  fita('ctrap', [[-0.85, y, z], [-0.3, y - 0.02, z], [0.3, y - 0.02, z], [0.85, y, z]], 0.13, 0.045, { mid: true, up: e.cr }); })();
// fascículo longitudinal medial: paramediano, logo abaixo do assoalho, do mesencéfalo ao bulbo
tube('flm', [[0.1, -0.7, -1.98], [0.11, -1.9, -2.8], [0.12, -3.19, -3.12], [0.11, -4.3, -3.28], [0.1, -5.3, -3.42]], 0.05, 0.045, { seg: 60, rad: 8, reto: true });

if (/debug/.test(location.hash)) window.tcDbg = { eixoTronco };
