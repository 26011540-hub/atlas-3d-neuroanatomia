/* ===== PARES CRANIANOS: sem, origem (ramo de 2 cm) ou trajeto inteiro ===== */
const RAMOSET = new Set(RAMOS.map(q => q[0]));
['nc3', 'nc6', 'nc7'].forEach(id => ITEMS[id].meshes.slice(0, 2).forEach(m => { m.userData.intra = true; }));   // fibras dentro do tronco (núcleo até a emergência)
function nervoTubo(m) { const id = m.userData.id; return /^nc\d+$/.test(id) && m.geometry.index && !m.userData.intra; }
function aplicaNervos() {
  const curto = state.nervos === 'curto';
  ALLMESH.forEach(m => {
    if (!nervoTubo(m)) return;
    const g = m.geometry; if (m.userData.drFull === undefined) m.userData.drFull = g.index.count;
    if (!curto) { g.setDrawRange(0, m.userData.drFull); return; }
    // mede o comprimento ao longo do tubo, anel por anel, e corta em 2 cm
    const ix = g.index.array, rad = ix[1] - 1, p = g.attributes.position.array, aneis = p.length / 3 / (rad + 1); let acc = 0, ant = null, k = aneis - 1;
    for (let i = 0; i < aneis; i++) { let x = 0, y = 0, z = 0; for (let j = 0; j <= rad; j++) { const o = (i * (rad + 1) + j) * 3; x += p[o]; y += p[o + 1]; z += p[o + 2]; } const c = [x / (rad + 1), y / (rad + 1), z / (rad + 1)]; if (ant) acc += Math.hypot(c[0] - ant[0], c[1] - ant[1], c[2] - ant[2]); ant = c; if (acc > 2.0) { k = i; break; } }
    g.setDrawRange(0, Math.max(1, k) * rad * 6);
  });
  applyVisibility();
}
function escondeNervo(m) {
  const id = m.userData.id;
  if (state.nervos === 'sem') return /^nc\d+$/.test(id) || RAMOSET.has(id);
  if (state.nervos === 'curto') return RAMOSET.has(id);
  return false;
}
/* ===== TRONCO ISOLADO ===== */
const TI_COR = { mesenc: '#e2b27c', ponte: '#c98a55', bulbo: '#a8714a', medula: '#dcc39d', pedunc: '#d9a26a', colsup: '#ebc08e', colinf: '#e3b583' };

/* ===== SEPARAR O CEREBELO DO TRONCO (Prometheus, p. 242, fig. 7.3b) ===== */
const SEP_OFF = new THREE.Vector3(0, 0.7, -2.6);
var sepT = 0;
const SEP_MESH = (function () {
  const ids = Object.keys(ITEMS).filter(k => /^(cb_|f_)/.test(k)).concat(['cerebelo', 'vermis', 'arbvida', 'denteado', 'emboliforme', 'globoso', 'fastigial', 'v_vermsup', 'v_verminf', 'v_cerebsup', 'v_cerebinf']);
  const st = new Set(); ids.forEach(k => ITEMS[k] && ITEMS[k].meshes.forEach(m => st.add(m))); return Array.from(st);
})();
SEP_MESH.forEach(m => { m.userData.sepAuto = m.matrixAutoUpdate; m.userData.sep0 = m.matrixAutoUpdate ? m.position.clone() : m.matrix.clone(); });
function sepAtual() { const t = sepT * sepT * (3 - 2 * sepT); return SEP_OFF.clone().multiplyScalar(t); }
function aplicaSep() {
  const off = sepAtual(), M = new THREE.Matrix4().makeTranslation(off.x, off.y, off.z);
  SEP_MESH.forEach(m => { if (m.userData.sepAuto) m.position.copy(m.userData.sep0).add(off); else m.matrix.copy(M).multiply(m.userData.sep0); });
  if (typeof ANC !== 'undefined') { Object.keys(ANC).forEach(k => delete ANC[k]); Object.keys(centroRot).forEach(k => delete centroRot[k]); }
}
function stepSep(dt) { const alvo = state.separado ? 1 : 0; if (sepT === alvo) return; sepT = alvo > sepT ? Math.min(1, sepT + dt / 0.8) : Math.max(0, sepT - dt / 0.8); aplicaSep(); if (sepT === alvo) applyVisibility(); }
const TI_FORA = { rubro: 1, snegra: 1, v4: 1, plexo: 1, abmed: 1, ablat: 1, denteado: 1, emboliforme: 1, globoso: 1, fastigial: 1 };
function animando() { return sepT !== (state.separado ? 1 : 0); }
// pedúnculos: os tubos somem e aparecem as superfícies de corte no tronco
['pcs', 'pcm', 'pci'].forEach(id => ITEMS[id].meshes.forEach(m => { m.userData.tuboPed = true; }));
function corteDisco(id, c, n, r) {
  [1, -1].forEach(sx => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), stdMat('#d8c3ab', { roughness: 0.9 }));
    m.scale.set(r[0], r[1], 1); m.position.set(c[0] * sx, c[1], c[2]); m.lookAt(new THREE.Vector3(c[0] * sx + n[0] * sx, c[1] + n[1], c[2] + n[2]));
    m.userData.cortePed = true; register(id, m, sx);
  });
}
corteDisco('pcm', B(14, latT(14, 1.7) - 0.02, 1.75), [0.75, 0.05, -0.65], [0.5, 0.78]);
corteDisco('pcs', B(8.5, latT(8.5, 2.0) * 0.8, 2.1), [0.55, 0.45, -0.7], [0.17, 0.26]);
corteDisco('pci', B(23, latT(23, 1.4) * 0.95, 1.5), [0.7, 0.1, -0.7], [0.2, 0.3]);

// pontos de lesão (lado esquerdo) e déficits (Machado, cap. 19, 29 e 30)
const LES = {
  v_cs: [
    { nome: 'Cápsula interna esquerda (perna posterior)', p: CAPP, txt: 'Déficit motor da metade direita do corpo: paresia, lentidão e perda do fracionamento dos movimentos, sinal de Babinski. Na cápsula, o trato corticonuclear costuma ser atingido junto: paralisia da metade inferior da face à direita e ligeiro enfraquecimento da língua (p. 286-288).' },
    { nome: 'Base do pedúnculo cerebral esquerdo (síndrome de Weber)', p: B(3.5, 0.75, 0.3), txt: 'Lesão do trato corticospinal: hemiparesia do lado direito. Lesão das fibras do nervo oculomotor esquerdo, do lado da lesão: o olho não se move para cima, para baixo nem medialmente, estrabismo divergente, diplopia, ptose palpebral e midríase. É uma síndrome alterna: o nervo craniano do lado da lesão e o corpo do lado oposto (cap. 19, p. 180).' },
    { nome: 'Base da ponte esquerda (síndrome de Millard-Gubler)', p: B(17, 0.5, 0.7), txt: 'Hemiparesia do lado direito, pela lesão do trato corticospinal antes do cruzamento. Paralisia do reto lateral esquerdo, pelas fibras do abducente: o olho não abduz, estrabismo convergente e diplopia. Se a lesão se estende lateralmente, soma-se paralisia facial do tipo periférico à esquerda (cap. 19, p. 179).' },
    { nome: 'Pirâmide esquerda (base do bulbo)', p: B(24, 0.3, 0.17), txt: 'Hemiparesia do lado direito, porque o trato cruza abaixo desse nível; se a lesão se estende dorsalmente aos demais tratos motores, hemiplegia. Lesão do hipoglosso esquerdo: paralisia e atrofia da metade esquerda da língua, que desvia para a esquerda na protrusão (cap. 19, p. 177).' }],
  v_cn: [
    { nome: 'Joelho da cápsula interna esquerda', p: [1.75, 0.5, 1.0], txt: 'Paralisia facial central: só a metade inferior da face do lado direito, porque os neurônios do facial para essa metade recebem fibras apenas do córtex oposto. A metade superior (orbicular do olho, frontal) é poupada, pois recebe fibras dos dois lados. Ligeiro enfraquecimento da língua. Mastigação, deglutição, fonação e movimentos dos olhos ficam preservados pela representação bilateral. A musculatura mímica ainda pode se contrair em manifestações emocionais (cap. 19, p. 178-179; cap. 30, p. 288).' }],
  v_lm: [
    { nome: 'Lemnisco medial esquerdo na ponte', p: B(16, 0.45, 1.45), txt: 'Perda da propriocepção consciente e do tato epicrítico do lado direito, oposto ao da lesão, porque as fibras já cruzaram no bulbo (fibras arqueadas internas). Na lesão da base da ponte que se estende ao lemnisco medial, soma-se ao quadro motor (cap. 19, p. 179).' },
    { nome: 'Tegmento do mesencéfalo esquerdo (síndrome de Benedikt)', p: B(5, 0.95, 1.0), txt: 'Lesão dos lemniscos medial, espinal e trigeminal: anestesia da metade direita do corpo, inclusive da cabeça. Lesão do oculomotor esquerdo e do núcleo rubro: tremores e movimentos anormais do lado direito (cap. 19, p. 180-181).' }],
  v_st: [
    { nome: 'Funículo lateral da medula (cordotomia anterolateral)', p: BE(33, 0.55, 0.68), txt: 'Na cordotomia anterolateral, cirurgia para tratar a dor, são seccionadas as fibras espinotalâmicas e espinorreticulares: desaparecem a dor em pontada e a dor em queimação. Como as fibras já cruzaram na comissura branca, a perda é do lado oposto ao da secção (cap. 29, p. 266).' },
    { nome: 'Parte dorsolateral do bulbo (síndrome de Wallenberg)', p: B(27, latE(27, 0.8, 0.72), 0.8), txt: 'Na trombose da artéria cerebelar inferior posterior: perda da sensibilidade térmica e dolorosa na metade direita do corpo (trato espinotalâmico lateral, já cruzado) e na metade esquerda da face (trato espinal do trigêmeo, ainda não cruzado). Somam-se incoordenação do lado esquerdo (pedúnculo cerebelar inferior), disfagia e disfonia (núcleo ambíguo) e, às vezes, síndrome de Horner (cap. 19, p. 177).' },
    { nome: 'Núcleo ventral posterolateral do tálamo', p: desl(VPL, 0.12, -0.2, -0.1), txt: 'A lesão do núcleo ventral posterolateral (via neoespinotalâmica) causa perda da dor superficial em pontada, mas deixa intacta a dor crônica profunda, que depende dos núcleos intralaminares (cap. 29, p. 268).' }],
  v_opt: [
    { nome: 'A. Nervo óptico esquerdo', p: [1.0, -1.45, 2.6], campo: { E: 'all', D: '' }, txt: 'Cegueira completa do olho esquerdo. Ocorre, por exemplo, em traumatismos ou no glaucoma, quando a pressão intraocular lesa as fibras na papila (cap. 29, p. 280).' },
    { nome: 'B. Parte mediana do quiasma', p: [0, -1.32, 1.5], campo: { E: 'esq', D: 'dir' }, txt: 'Hemianopsia bitemporal (heterônima), pela interrupção das fibras das retinas nasais, que cruzam nesse ponto. Típica dos tumores da hipófise, que comprimem o quiasma de baixo para cima, e dos gliomas do quiasma (cap. 29, p. 280).' },
    { nome: 'C. Parte lateral esquerda do quiasma', p: [0.62, -1.28, 1.55], campo: { E: 'dir', D: '' }, txt: 'Hemianopsia nasal do olho esquerdo, pela interrupção das fibras da sua retina temporal. Mais frequente em aneurismas da carótida interna que comprimem lateralmente o quiasma; dos dois lados, hemianopsia binasal (cap. 29, p. 280).' },
    { nome: 'D. Trato óptico esquerdo', p: [1.3, -1.2, 0.6], campo: { E: 'dir', D: 'dir' }, txt: 'Hemianopsia homônima direita: interrompem-se as fibras da retina temporal do olho esquerdo e da nasal do olho direito. O reflexo fotomotor está ausente quando se ilumina a metade cega da retina, porque as fibras retino-pré-tetais também são lesadas. Lesões do corpo geniculado lateral dão o mesmo defeito de campo (cap. 29, p. 280-282).' },
    { nome: 'E. Parte inferior da radiação óptica esquerda (lobo temporal)', p: RADI[2], campo: { E: 'dirSup', D: 'dirSup' }, txt: 'Quadrantanopsia homônima superior direita: interrompem-se as fibras das metades inferiores das retinas (nasal direita e temporal esquerda). Ocorre em certos tumores do lobo temporal (cap. 29, p. 282).' },
    { nome: 'F. Radiação óptica esquerda inteira', p: [2.85, 0.0, -2.4], campo: { E: 'dir', D: 'dir' }, txt: 'Hemianopsia homônima direita, como na lesão do trato óptico, mas o reflexo fotomotor está presente, porque a lesão fica depois do corpo geniculado lateral. Na prática as lesões completas da radiação são raras; são mais comuns escotomas e quadrantanopsias (cap. 29, p. 280-282).' },
    { nome: 'G. Lábio inferior do sulco calcarino esquerdo', p: LABI[1], campo: { E: 'dirSup', D: 'dirSup' }, txt: 'Quadrantanopsia homônima superior direita. As lesões completas do córtex visual de um lado dão o mesmo defeito da lesão completa da radiação (hemianopsia homônima), mas as lesões parciais são mais frequentes (cap. 29, p. 282).' }],
  v_vest: [
    { nome: 'Nervo vestibular esquerdo (tumor do VIII par)', p: [2.6, -3.7, -1.75], txt: 'Vertigem, alterações do equilíbrio, enjoo e nistagmo (cap. 10). As lesões unilaterais do vestibulocerebelo são causadas principalmente por tumores do VIII nervo e dificultam os movimentos oculares de seguimento para o lado da lesão (cap. 22, p. 213).' }],
  v_cereb: [
    { nome: 'Hemisfério cerebelar direito, zona lateral (cerebrocerebelo)', p: ZLAT, txt: 'Síndrome do cerebrocerebelo, do mesmo lado da lesão (direito): atraso no início do movimento, decomposição do movimento multiarticular, disdiadococinesia, rechaço, tremor que se acentua ao final do movimento e dismetria (prova dedo-nariz). As lesões cerebelares dão sintomas ipsilaterais por causa do duplo cruzamento das vias (cap. 22, p. 209 e 214).' },
    { nome: 'Núcleo interpósito e zona intermédia esquerdos (espinocerebelo)', p: [0.95, -3.0, -4.6], txt: 'Redução da ativação dos tratos rubrospinal e corticospinal, com redução do tônus muscular. Dismetria por erros na cronologia, direção e extensão do movimento; ataxia de membros, com o alvo alcançado por caminho sinuoso, e tremor terminal. Sinais do lado esquerdo, o da lesão (cap. 22, p. 213).' },
    { nome: 'Nódulo, no teto do IV ventrículo (vestibulocerebelo)', p: NODULO, txt: 'Tumores do teto do IV ventrículo comprimem o nódulo e o pedúnculo do flóculo: só perda do equilíbrio, com ataxia de tronco; as crianças não conseguem ficar em pé. Há nistagmo. O tônus é normal e, deitadas, a coordenação é praticamente normal. Marcha com base alargada, com olhos abertos ou fechados, e tendência a quedas (cap. 22, p. 213).' }],
  v_nb: [
    { nome: 'Núcleo subtalâmico esquerdo (hemibalismo)', p: STN, txt: 'Hemibalismo: movimentos involuntários de grande amplitude e forte intensidade dos membros do lado oposto (direito), que nos casos graves não desaparecem com o sono. Decorre da menor excitação do pálido medial pelo subtalâmico: diminui a inibição sobre o tálamo e o córtex motor responde exageradamente. Causa mais comum: pequenos acidentes vasculares (cap. 24, p. 226-227).' },
    { nome: 'Substância negra (doença de Parkinson)', p: SNC, txt: 'Na doença de Parkinson a disfunção principal está na substância negra, com menos dopamina nas fibras nigroestriatais. Cai a via direta (D1) e sobe a indireta (D2), com excesso de atividade do subtalâmico: o pálido medial inibe mais o tálamo. Acinesia, bradicinesia, rigidez e tremor de repouso, que some com o movimento. É doença degenerativa e progressiva, não uma lesão de um lado só; a L-Dopa melhora os sintomas. A lesão cirúrgica do subtalâmico ou do pálido medial também melhora o parkinsonismo (cap. 24, p. 227).' },
    { nome: 'Neoestriado (coreia de Huntington)', p: desl(PUT, 0.15, 0.35, 0.3), txt: 'Doença degenerativa genética, autossômica dominante. A lesão mais precoce é nos neurônios estriatais, e a via indireta é afetada primeiro, o que desequilibra as vias a favor da desinibição: movimentos involuntários anormais (coreia) e alterações de humor, personalidade e cognição (cap. 24, p. 227).' }],
  v_hip: [
    { nome: 'Hipotálamo anterior (centro da perda de calor)', p: [0.3, -0.65, 1.25], txt: 'Elevação incontrolável da temperatura (febre central), quase sempre fatal; pode ocorrer em traumatismos cranianos e em cirurgias da hipófise. O hipotálamo anterior controla principalmente o parassimpático (cap. 21, p. 200).' },
    { nome: 'Núcleos supra-óptico e paraventricular ou trato hipotálamo-hipofisário', p: [0.1, -1.25, 1.2], txt: 'Diabetes insipidus: grande aumento do volume de urina, sem glicose, por falta do hormônio antidiurético, que é sintetizado nesses núcleos e levado pelo trato à neuro-hipófise (cap. 21, p. 201).' },
    { nome: 'Núcleo ventromedial (centro da saciedade)', p: [0.35, -0.95, 0.75], txt: 'Hiperfagia e obesidade extrema. Em tumores suprasselares, a obesidade com hipogonadismo forma a síndrome adiposogenital de Fröhlich (cap. 21, p. 201).' },
    { nome: 'Hipotálamo lateral (centro da fome)', p: [0.75, -0.75, 0.5], txt: 'Ausência completa do desejo de alimentar-se (anorexia), com inanição (cap. 21, p. 201).' },
    { nome: 'Hipotálamo posterior (centro da conservação do calor)', p: [0.35, -0.8, 0.1], txt: 'O hipotálamo posterior controla sobretudo o simpático e contém o centro da conservação do calor: sua estimulação causa vasoconstrição periférica, calafrios e liberação de hormônio tireoidiano. O livro não descreve o quadro da lesão nas páginas lidas (cap. 21, p. 200).' }],
  v_aud: [
    { nome: 'Nervo coclear direito', p: [-3.3, -3.75, -1.7], txt: 'Diminuição da audição à direita, por comprometimento da parte coclear do nervo vestibulococlear. No neurinoma do VIII par somam-se vertigem, alterações do equilíbrio e sintomas do facial e do intermédio (cap. 10, p. 101).' },
    { nome: 'Área auditiva esquerda (giro temporal transverso)', p: TT, txt: 'Não há perda da audição: cada área auditiva recebe impulsos das duas cócleas, por causa das muitas fibras homolaterais da via. Por isso é impossível a perda da audição por lesão de uma só área auditiva (cap. 29, p. 276).' }]
};
const lesGeo = new THREE.SphereGeometry(0.17, 18, 12);
Object.keys(LES).forEach(v => { META[v].les = LES[v]; LES[v].forEach((q, k) => { const m = new THREE.Mesh(lesGeo, new THREE.MeshStandardMaterial({ color: '#202020', roughness: 0.4 })); m.position.set(q.p[0], q.p[1], q.p[2]); m.userData.les = k; m.renderOrder = 3; register(v, m, 0); }); });
// setas do sentido da condução
const setaGrp = new THREE.Group(); scene.add(setaGrp);
const SETAS = [];
(function () {
  const g = new THREE.ConeGeometry(0.13, 0.36, 12); g.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  Object.keys(VIAC).forEach(id => VIAC[id].forEach(c => { const n = Math.max(1, Math.round(c.getLength() / 2.2)); for (let i = 0; i < n; i++) { const m = new THREE.Mesh(g, mat); m.renderOrder = 4; setaGrp.add(m); SETAS.push({ id, c, m, u: i / n }); } }));
})();
const _q = new THREE.Vector3();
function stepSetas(dt) {
  const on = !!state.groupOn.vias && !state.inflada, sel = state.sel && META[state.sel] && META[state.sel].grp === 'vias' ? state.sel : null;
  setaGrp.visible = on; if (!on) return;
  SETAS.forEach(q => {
    q.m.visible = !sel || q.id === sel; if (!q.m.visible) return;
    if (!semMov) q.u = (q.u + dt * 0.9 / q.c.getLength()) % 1;
    q.m.position.copy(q.c.getPointAt(q.u)); q.m.lookAt(_q.copy(q.c.getPointAt(Math.min(1, q.u + 0.01))));
  });
}
const semMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// campo visual em SVG (convenção da figura 29.10: cada círculo é o campo de um olho, visto pelo paciente)
function campoSVG(c) {
  const meia = (cx, m) => { const r = 24, cy = 30; if (!m) return ''; if (m === 'all') return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="currentColor"/>';
    if (m === 'esq') return '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' Z" fill="currentColor"/>';
    if (m === 'dir') return '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' Z" fill="currentColor"/>';
    if (m === 'dirSup') return '<path d="M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' Z" fill="currentColor"/>'; return ''; };
  const olho = (cx, m) => meia(cx, m) + '<circle cx="' + cx + '" cy="30" r="24" fill="none" stroke="currentColor" stroke-width="2"/>';
  return '<figure class="campo"><svg viewBox="0 0 160 76" width="200" role="img" aria-label="Campo visual: em preto, a parte perdida">' + olho(40, c.E) + olho(120, c.D) +
    '<text x="40" y="72" text-anchor="middle" font-size="10" fill="currentColor">olho esquerdo</text><text x="120" y="72" text-anchor="middle" font-size="10" fill="currentColor">olho direito</text></svg><figcaption>Campo visual; em preto, a parte perdida.</figcaption></figure>';
}   // ficam translúcidos quando a camada dos nervos está ligada, para mostrar os núcleos

const state = { sel: null, isolate: true, cortexOp: 1, groupOn: {}, hideL: false, hideR: false, quiz: null, inflada: false, fluxo: false, territ: false, avc: false, lesao: false, les: null, separado: false, troncoIso: false, nervos: 'inteiro', bisturi: false, removidos: new Set(), pilhaRem: [], rotulos: false, ocultar: false, sulcos: false, licao: null, lingua: 'pt', qmodo: 'est' };
Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art' || k === 'stem'));   // abertura: córtex, artérias reais e tronco com o cerebelo real

/* ===== LÍQUOR (Machado, cap. 8) ===== */
// extremos da malha real do IV ventrículo: ponto mais caudal (abertura mediana) e ponta do recesso lateral
const V4X = (function () {
  const m = ITEMS.v4.meshes[0], p = m.geometry.attributes.position, v = new THREE.Vector3();
  let baixo = null, lado = null;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrix); if (!baixo || v.y < baixo[1]) baixo = [0, v.y, v.z]; if (!lado || Math.abs(v.x) > Math.abs(lado[0])) lado = [Math.abs(v.x), v.y, v.z]; }
  return { baixo, lado };
})();
tube('fmonro', [[0.1, 0.72, 0.9], [0.42, 0.98, 0.95], [0.72, 1.22, 1.0]], 0.09, 0.09);
ell('abmed', () => V4X.baixo, [0.16, 0.1, 0.16], null, { mid: true });
ell('ablat', sx => [sx * V4X.lado[0], V4X.lado[1], V4X.lado[2]], [0.1, 0.13, 0.13], null);
const plexoR = u => 0.075 + 0.03 * Math.sin(u * 60);
tube('plexo', [[0.72, 1.25, 0.95], [0.95, 1.72, -0.1], [1.25, 1.72, -1.1], [1.9, 1.3, -2.2], [2.9, 0.3, -2.75], [3.4, -0.4, -2.4], [3.66, -1.2, -1.0], [3.6, -1.55, -0.4]], plexoR, 0, { seg: 120, rad: 7 });   // parte central e corno inferior
tube('plexo', [[0.07, 0.72, 0.75], [0.07, 0.8, -0.2], [0.07, 0.68, -1.2]], plexoR, 0, { seg: 40, rad: 7 });                       // teto do III ventrículo
tube('plexo', [[0.12, V4X.baixo[1] + 1.3, V4X.baixo[2] - 0.05], [0.14, V4X.baixo[1] + 0.7, V4X.baixo[2] - 0.05], [0.12, V4X.baixo[1] + 0.25, V4X.baixo[2]]], plexoR, 0, { seg: 30, rad: 7 });   // teto do IV ventrículo
[40, 55, 70, 85, 100, 115, 130, 145].forEach(a => { const p = CONT.pt(a, 0.1); ell('granul', sx => [sx * 0.27, p[1] - 0.1, p[2]], [0.07, 0.07, 0.07], null); });

// caminho do líquor: plexo do ventrículo lateral -> forame interventricular -> III ventrículo -> aqueduto ->
// IV ventrículo -> aberturas -> espaço subaracnóideo (sobe pela incisura do tentório) -> granulações do seio sagital superior
const fluxoGrp = new THREE.Group(); scene.add(fluxoGrp); fluxoGrp.visible = false;
const fluxoCurvas = [1, -1].map(sx => {
  const fim = sssEm(-1.0);
  const pts = [[sx * 3.6, -1.5, -0.4], [sx * 3.4, -0.4, -2.4], [sx * 2.4, 0.9, -2.6], [sx * 1.3, 1.75, -1.1], [sx * 0.95, 1.75, -0.1], [sx * 0.72, 1.22, 1.0], [sx * 0.1, 0.72, 0.9],
    [0, 0.2, 0.2], [0, -0.1, -1.0], [0, -0.15, -1.6], [0, -0.6, -2.25], [0, -1.2, -2.65], [0, -1.7, -2.9], [0, V4X.baixo[1] + 1.2, V4X.baixo[2] + 0.5], V4X.baixo,
    [sx * 0.3, V4X.baixo[1] - 0.5, V4X.baixo[2] - 0.5], [sx * 1.9, V4X.baixo[1] + 0.3, V4X.baixo[2] + 1.6], [sx * 2.1, -2.4, -0.9], [sx * 2.0, -0.8, -1.3]]
    .concat(surf(sx, [[sx * 5.6, 0.4, -1.6], [sx * 5.4, 3.2, -1.2], [sx * 3.0, 6.4, -1.0]], 0.15), [[sx * 0.27, fim[1] - 0.1, fim[2]]]);
  return new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
});
const fluxoGotas = [];
(function () {
  const g = new THREE.SphereGeometry(0.12, 10, 8), mat = new THREE.MeshBasicMaterial({ color: 0x1fb6d9 });
  fluxoCurvas.forEach((c, k) => { for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(g, mat); m.renderOrder = 1; fluxoGrp.add(m); fluxoGotas.push({ m, c, u: (i + k * 0.5) / 26 }); } });
})();
const semMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function stepFluxo(dt) {
  fluxoGrp.visible = !!state.fluxo && !state.inflada;
  if (!fluxoGrp.visible) return;
  fluxoGotas.forEach(q => { if (!semMovimento) q.u = (q.u + dt * 0.035) % 1; q.m.position.copy(q.c.getPointAt(q.u)); });
}
const PASSOS = [['plexo', 'Plexos corioides', 'formam o líquor (sobretudo nos ventrículos laterais)'], ['fmonro', 'Forame interventricular', ''], ['v3', 'III ventrículo', ''], ['aqueduto', 'Aqueduto cerebral', ''],
  ['v4', 'IV ventrículo', ''], ['abmed', 'Abertura mediana', 'e aberturas laterais'], [null, 'Espaço subaracnóideo', 'sobe entre a incisura do tentório e o mesencéfalo; na medula, desce'], ['granul', 'Granulações aracnóideas', 'reabsorção para o seio sagital superior']];
(function () {
  const ol = document.getElementById('passos'), cb = document.getElementById('fluxo');
  ol.innerHTML = PASSOS.map(p => '<li>' + (p[0] ? '<button type="button" data-passo="' + p[0] + '">' + p[1] + '</button>' : p[1]) + (p[2] ? ' <span>' + p[2] + '</span>' : '') + '</li>').join('');
  ol.querySelectorAll('button').forEach(b => b.addEventListener('click', () => select(b.dataset.passo)));
  cb.addEventListener('change', () => {
    state.fluxo = cb.checked; ol.hidden = !cb.checked;
    if (cb.checked) { state.groupOn.vent = true; state.groupOn.ven = true; state.groupOn.art = false; syncLayerUI(); }   // sem artérias, para o caminho ficar legível
    applyVisibility(); applyAppearance();
  });
})();

