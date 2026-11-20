/* ===== TRANSPARÊNCIA COERENTE (cerebelo, Fase 0) =====
   A aparência do atlas muda a opacidade dos materiais, mas nem todo material estava marcado como transparente:
   com opacidade abaixo de 100% e sem esse modo, o three.js desenha a malha fora de ordem e ela fica "picotada".
   Aqui, depois de todos os outros ajustes de aparência: transparente só quando a opacidade é menor que 100%,
   sem escrever profundidade nesse caso, e desenhada depois das malhas opacas. */
const _apTransp = applyAppearance;
applyAppearance = function () {
  _apTransp();
  ALLMESH.forEach(m => {
    const mat = m.material; if (!mat || mat.opacity === undefined || m.userData.cortex) return;
    const transp = mat.opacity < 0.999;
    if (mat.transparent !== transp) { mat.transparent = transp; mat.needsUpdate = true; }
    if (transp) { mat.depthWrite = false; if (!m.userData.ordem0) { m.userData.ordem0 = true; m.userData.ordemBase = m.renderOrder; } m.renderOrder = Math.max(m.userData.ordemBase || 0, 2); }
    else if (m.userData.ordem0) { m.renderOrder = m.userData.ordemBase || 0; }
  });
};
