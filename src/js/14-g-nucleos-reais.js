/* ===== NÚCLEOS DA BASE, LÍMBICO, TÁLAMO E HIPOTÁLAMO DE ATLAS ABERTOS (Fase 5) =====
   MASSP 2.0 (Bazin et al. 2024, CC BY 4.0): núcleos da base, amígdala, claustro, hipocampo e fórnice.
   Allen Human Reference Atlas 3D 2020 (CC BY 4.0): núcleos do tálamo e zona incerta.
   Neudorfer et al. 2020 (CC BY 4.0): núcleos do hipotálamo, corpos mamilares, trato mamilotalâmico.
   Malhas de scripts/process/fase5_nucleos.py, no espaço do atlas pela afim do MNI. Seletor "Núcleos profundos:
   Esquema | Atlas reais": no modo real, os esquemas dos mesmos itens saem. Cores do tálamo pela função:
   motores (VA, VL) quentes, sensitivos (VPL, VPM) azuis como as vias ascendentes, límbicos (anterior, MD) rosados. */
const F5_NOVOS = {
  // tálamo (grupo dien)
  tal_anterior: ['Núcleos anteriores do tálamo', 'dien', '#e58fb8', 'Grupo anterior, no tubérculo anterior do tálamo. Recebe o trato mamilotalâmico e projeta ao giro do cíngulo: faz parte do circuito de Papez.'],
  tal_ld: ['Núcleo lateral dorsal do tálamo', 'dien', '#d77fae', 'Núcleo do grupo lateral, parte dorsal; ligado ao sistema límbico e ao córtex do cíngulo.'],
  tal_md: ['Núcleo mediodorsal do tálamo', 'dien', '#c96a9c', 'Grande núcleo do grupo medial. Liga-se ao córtex pré-frontal e ao sistema límbico (amígdala).'],
  tal_reuniens: ['Núcleo reuniens (da linha média)', 'dien', '#f2c1d6', 'Núcleo da linha média, ventral; ligado ao hipocampo e ao córtex pré-frontal.'],
  tal_linha_media: ['Núcleos da linha média do tálamo', 'dien', '#f6d6e3', 'Pequenos núcleos junto à parede do III ventrículo e à aderência intertalâmica.'],
  tal_va: ['Núcleo ventral anterior do tálamo', 'dien', '#ef8a5c', 'Recebe do globo pálido e da substância negra e projeta ao córtex pré-motor: circuito motor dos núcleos da base.'],
  tal_vl: ['Núcleo ventral lateral do tálamo', 'dien', '#e0623f', 'Recebe do cerebelo (núcleo denteado, pelo pedúnculo cerebelar superior) e do pálido e projeta ao córtex motor.'],
  tal_vpl: ['Núcleo ventral posterolateral do tálamo', 'dien', '#3f8fe0', 'Relé da sensibilidade do corpo: recebe o lemnisco medial e o espinotalâmico e projeta ao giro pós-central.'],
  tal_vpm: ['Núcleo ventral posteromedial do tálamo', 'dien', '#7fb6ef', 'Relé da sensibilidade da cabeça: recebe os lemniscos trigeminais (e a gustação) e projeta ao giro pós-central.'],
  tal_lp: ['Núcleo lateral posterior do tálamo', 'dien', '#a47cc9', 'Núcleo do grupo lateral, parte dorsal posterior; ligado ao córtex parietal de associação.'],
  tal_pulvinar: ['Pulvinar', 'dien', '#8f6bc0', 'Maior núcleo do tálamo, na parte posterior; liga-se ao córtex de associação parietal, temporal e occipital.'],
  tal_cm: ['Núcleo centromediano do tálamo', 'dien', '#b9a3d9', 'Núcleo intralaminar, na lâmina medular interna; liga-se ao estriado e à formação reticular.'],
  tal_pf: ['Núcleo parafascicular do tálamo', 'dien', '#cdbbe4', 'Núcleo intralaminar, medial ao centromediano.'],
  zona_incerta: ['Zona incerta', 'dien', '#9aa3ad', 'Faixa de substância cinzenta do subtálamo, entre o fascículo talâmico e o fascículo lenticular.'],
  // hipotálamo (grupo dien)
  hip_preoptico: ['Núcleo pré-óptico medial', 'dien', '#f08aa0', 'Área pré-óptica, na parte mais anterior do hipotálamo.'],
  hip_paraventricular: ['Núcleo paraventricular do hipotálamo', 'dien', '#e5607e', 'Junto à parede do III ventrículo. Produz ocitocina e vasopressina (trato hipotálamo-hipofisário) e fatores de liberação.'],
  hip_supraoptico: ['Núcleo supraóptico', 'dien', '#d94f6e', 'Acima do trato óptico. Produz vasopressina e ocitocina, levadas à neuro-hipófise.'],
  hip_supraquiasmatico: ['Núcleo supraquiasmático', 'dien', '#f4a2b2', 'Acima do quiasma óptico: relógio biológico (ritmo circadiano), recebe fibras da retina.'],
  hip_anterior: ['Área hipotalâmica anterior', 'dien', '#ec7f95', 'Região anterior do hipotálamo, ligada à regulação da temperatura.'],
  hip_periventricular: ['Núcleos periventriculares do hipotálamo', 'dien', '#f7c3cc', 'Camada fina de neurônios junto à parede do III ventrículo.'],
  hip_ventromedial: ['Núcleo ventromedial do hipotálamo', 'dien', '#c9506c', 'Na região tuberal; ligado à saciedade.'],
  hip_dorsomedial: ['Núcleo dorsomedial do hipotálamo', 'dien', '#d86a83', 'Na região tuberal, acima do ventromedial.'],
  hip_arqueado: ['Núcleo arqueado (infundibular)', 'dien', '#b84462', 'Na base do infundíbulo; produz fatores que controlam a adeno-hipófise.'],
  hip_lateral: ['Área hipotalâmica lateral', 'dien', '#e88aa8', 'Parte lateral do hipotálamo, atravessada pelo feixe prosencefálico medial; ligada à fome.'],
  hip_tuberomamilar: ['Núcleo tuberomamilar', 'dien', '#c7708a', 'Na região mamilar; neurônios histaminérgicos ligados à vigília.'],
  hip_posterior: ['Núcleo posterior do hipotálamo', 'dien', '#a8586f', 'Na região mamilar, acima dos corpos mamilares.'],
  nleito_estria: ['Núcleo do leito da estria terminal', 'limbic', '#b07ad6', 'Núcleo ao longo da estria terminal, junto à comissura anterior; ligado à amígdala.'],
  banda_diagonal: ['Banda diagonal (de Broca)', 'limbic', '#c59ae2', 'Faixa de fibras e neurônios da área septal e do prosencéfalo basal.'],
  // núcleos da base e límbico
  hip_ca1: ['Hipocampo: CA1', 'limbic', '#8f63c4', 'Campo CA1 do corno de Ammon, o mais vulnerável à falta de oxigênio; projeta ao subículo.'],
  hip_ca23: ['Hipocampo: CA2 e CA3', 'limbic', '#a37ad0', 'Campos CA2 e CA3 do corno de Ammon; recebem as fibras musgosas do giro denteado.'],
  presubiculo: ['Pré-subículo e parassubículo', 'limbic', '#b997dd', 'Transição entre o subículo e o córtex entorrinal.'],
  prosenc_colinergico: ['Núcleos colinérgicos do prosencéfalo basal', 'deep', '#7f8fd6', 'Neurônios colinérgicos do prosencéfalo basal (área septal, banda diagonal, núcleo basal de Meynert), que projetam ao córtex e ao hipocampo.'],
};
Object.entries(F5_NOVOS).forEach(([id, [nome, grp, cor, f]]) => M(id, nome, grp, cor, f, '', ''));
REF(Object.keys(F5_NOVOS).filter(id => /^tal_|^zona/.test(id)), 'Forma: Allen Human Reference Atlas 3D 2020 (CC BY 4.0). Texto: a conferir no Machado (cap. 25, tálamo).');
REF(Object.keys(F5_NOVOS).filter(id => /^hip_(pre|para|sup|ant|peri|ven|dor|arq|lat|tub|pos)|nleito|banda/.test(id)), 'Forma: Neudorfer C et al., Sci Data 2020 (CC BY 4.0). Texto: a conferir no Machado (cap. 26, hipotálamo).');
REF(['hip_ca1', 'hip_ca23', 'presubiculo', 'prosenc_colinergico'], 'Forma: MASSP 2.0, Bazin PL et al. 2024 (CC BY 4.0). Texto: a conferir no Machado (cap. 27).');
const F5 = { modo: 'esquema', carga: null, ids: new Set() };
function f5Carregar() {
  if (F5.carga) return F5.carga;
  if (!cbsLoader) { cbsLoader = new THREE.GLTFLoader(); if (window.MeshoptDecoder) cbsLoader.setMeshoptDecoder(window.MeshoptDecoder); }
  F5.carga = new Promise((ok, falha) => cbsLoader.load('models/fase5_nucleos.glb', g => {
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      const nome = o.name.includes('__') ? o.name : ((o.parent && o.parent.name) || ''), [id, lado] = nome.split('__');
      if (!META[id]) return;
      const m = new THREE.Mesh(cbsGeo(o), stdMat(META[id].color, { roughness: 0.6 }));
      m.userData.f5 = true; m.userData.semBolacha = true; register(id, m, lado === 'd' ? -1 : (lado === 'e' ? 1 : 0)); F5.ids.add(id);
    });
    ok();
  }, undefined, falha));
  return F5.carga;
}
function setNucleosReais(modo) {
  F5.modo = modo;
  // o tálamo inteiro fica transparente em volta dos núcleos (o Allen não rotula todo o tálamo)
const _apF5 = applyAppearance;
applyAppearance = function () { _apF5(); if (F5.modo !== 'real') return; ALLMESH.forEach(m => { if (m.userData.id === 'talamo' && !m.userData.f5 && state.sel !== 'talamo') { m.material.opacity = Math.min(m.material.opacity, 0.18); m.material.depthWrite = false; } }); };
document.querySelectorAll('[data-f5]').forEach(b => b.setAttribute('aria-pressed', b.dataset.f5 === modo ? 'true' : 'false'));
  const st = document.getElementById('f5Status');
  if (modo === 'esquema') { if (st) st.textContent = ''; applyVisibility(); applyAppearance(); return; }
  if (st) st.textContent = 'Carregando os núcleos reais…';
  f5Carregar().then(() => { if (st) st.textContent = ''; ['deep', 'limbic', 'dien'].forEach(k => state.groupOn[k] = true); syncLayerUI(); applyVisibility(); applyAppearance(); })
    .catch(e => { if (st) st.textContent = 'Não foi possível carregar models/fase5_nucleos.glb.'; console.warn(e); setNucleosReais('esquema'); });
}
const _visF5 = applyVisibility;
applyVisibility = function () {
  _visF5();
  const real = F5.modo === 'real';
  ALLMESH.forEach(m => {
    const u = m.userData;
    if (u.f5) { m.visible = real && m.visible; return; }
    if (real && F5.ids.has(u.id) && !u.massp && !u.hcp && !u.vk && !u.suit) m.visible = false;   // o esquema do mesmo item sai
  });
};
document.querySelectorAll('[data-f5]').forEach(b => b.addEventListener('click', () => setNucleosReais(b.dataset.f5)));
