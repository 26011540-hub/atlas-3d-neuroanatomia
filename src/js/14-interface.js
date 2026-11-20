/* ===== INTERFACE ===== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- listas de itens por grupo (sem os "cortes" auxiliares) ---- */
const LISTABLE = Object.keys(META).filter(k => k !== 'cc_cut' && k !== 'dien_wall');
const byGroup = {};
Object.keys(GROUPS).forEach(g => byGroup[g] = LISTABLE.filter(k => META[k].grp === g));

/* ---- painel de informação ---- */
const infoEl = $('#info');
function renderInfo() {
  const sel = state.sel;
  if (state.quiz && !state.quiz.revealed && state.quiz.modo === 'clique') { infoEl.innerHTML = '<p class="eyebrow">Modo teste</p><h2>' + esc(state.quiz.pergunta) + '</h2><p class="muted">Gire o modelo e clique na estrutura pedida.</p>'; return; }
  if (state.quiz && !state.quiz.revealed) {
    infoEl.innerHTML = state.quiz.modo === 'est' || !state.quiz.modo ? '<p class="eyebrow">Modo teste</p><h2>Qual estrutura está destacada?</h2><p class="muted">Gire o modelo se precisar e escolha uma das opções na aba Teste.</p>' : '<p class="eyebrow">Modo teste</p><h2>' + esc(state.quiz.pergunta) + '</h2><p class="muted">Leia o quadro na aba Teste e escolha uma opção. Depois da resposta, o modelo mostra ' + (state.quiz.modo === 'art' ? 'o território da artéria.' : 'o ponto da lesão.') + '</p>';
    return;
  }
  if (!sel) {
    infoEl.innerHTML = '<p class="eyebrow">Mímir · Atlas 3D</p><h2>Clique em uma estrutura</h2><p class="muted">Cada giro, núcleo, artéria e veia abre aqui com função, irrigação e correlação clínica. Use a aba Camadas para ligar e desligar grupos.</p>';
    return;
  }
  const m = META[selId(sel)], g = GROUPS[m.grp];
  if (state.ocultar && !REVELADO[sel] && !(state.quiz && state.quiz.revealed)) {
    infoEl.innerHTML = '<p class="eyebrow"><span class="dot" style="background:' + m.color + '"></span>' + esc(g.name) + '</p><h2>Que estrutura é esta?</h2><p class="muted">Os nomes estão ocultos. Pense na resposta e revele.</p><button type="button" class="btn primary" id="revelar">Revelar o nome</button>';
    $('#revelar').addEventListener('click', () => { REVELADO[sel] = true; renderInfo(); });
    return;
  }
  let h = '<p class="eyebrow"><span class="dot" style="background:' + m.color + '"></span>' + esc(g.name) + '</p><h2>' + esc(m.name) + '</h2>';
  { const nn = NOMES[selId(sel)] || NOMES[sel]; if (nn) h += '<p class="muted nomes">Latim: <i>' + esc(nn[0]) + '</i> · Inglês: ' + esc(nn[1]) + '</p>'; }
  if (m.col) h += '<p class="muted" style="margin:0 0 6px">Coluna ' + esc(m.col) + '</p>';
  if (m.f) h += '<h3>' + (m.orig ? 'Componentes e função' : 'Função e posição') + '</h3><p>' + esc(m.f) + '</p>';
  if (m.nuc) h += '<h3>Núcleos</h3><p>' + esc(m.nuc) + '</p>';
  if (m.orig) h += '<h3>Origem aparente no encéfalo</h3><p>' + esc(m.orig) + '</p>';
  if (m.forame) h += '<h3>Passagem pelo crânio</h3><p>' + esc(m.forame) + '</p>';
  if (m.i) h += '<h3>Irrigação</h3><p>' + esc(m.i) + '</p>';
  if (m.c) h += '<h3>' + (m.grp === 'nc' ? 'Lesão' : 'Clínica') + '</h3><p>' + esc(m.c) + '</p>';
  if (!m.f && !m.i && !m.c) h += '<p class="muted">Região de corte do plano sagital mediano.</p>';
  const nota = META[sel].nota || m.nota;
  if (nota) h += '<h3>Sobre a malha</h3><p>' + esc(nota) + '</p>';
  if (m.conf) h += '<p class="conf"><b>A confirmar no Machado.</b> ' + esc(m.conf) + '</p>';
  if (m.les) {
    h += '<h3>Lesões' + (state.lesao ? '' : ' (ligue o modo Lesão para ver os pontos no modelo)') + '</h3><div class="lesoes">' + m.les.map((q, k) => '<button type="button" class="chipbtn" data-les="' + k + '" aria-pressed="' + (state.les && state.les.via === m.id && state.les.k === k ? 'true' : 'false') + '">' + esc(q.nome) + '</button>').join('') + '</div>';
    if (state.les && state.les.via === m.id) { const q = m.les[state.les.k]; h += '<div class="lesbox"><p class="eyebrow">Lesão em</p><h3 style="margin-top:0">' + esc(q.nome) + '</h3>' + (q.campo ? campoSVG(q.campo) : '') + '<p>' + esc(q.txt) + '</p></div>'; }
  }
  const ocl = oclusao();
  if (ocl) h += '<h3>Oclusão desta artéria (modo AVC)</h3><p>' + esc(ocl.txt) + '</p>';
  if (m.ref) h += '<p class="fonte">Fonte: ' + esc(m.ref) + '</p>';
  infoEl.innerHTML = h;
  infoEl.querySelectorAll('[data-les]').forEach(b => b.addEventListener('click', () => { state.les = { via: m.id, k: +b.dataset.les }; applyAppearance(); renderInfo(); }));
}

/* ---- camadas ---- */
const layersEl = $('#layers');
function buildLayers() {
  let h = '<div class="group-list">';
  Object.keys(GROUPS).forEach(k => {
    h += '<label class="row"><input type="checkbox" data-g="' + k + '"><span class="sw" style="background:' + GROUPS[k].color + '"></span><span class="lbl">' + esc(GROUPS[k].name) + '</span><span class="cnt">' + byGroup[k].length + '</span></label>';
  });
  h += '</div>';
  layersEl.querySelector('.layer-groups').innerHTML = h;
  $$('input[data-g]', layersEl).forEach(cb => cb.addEventListener('change', () => {
    state.groupOn[cb.dataset.g] = cb.checked;
    if (state.sel && !state.groupOn[META[selId(state.sel)].grp]) state.sel = null;
    applyVisibility(); applyAppearance(); renderInfo(); markList();
  }));
}
function syncLayerUI() { $$('input[data-g]', layersEl).forEach(cb => cb.checked = !!state.groupOn[cb.dataset.g]); }
function syncHemiUI() { const l = $('#hideL'), r = $('#hideR'); if (l) l.checked = state.hideL; if (r) r.checked = state.hideR; }
function syncAuto() { const a = $('#auto'); if (a) a.checked = auto; }
buildLayers();
state.groupOn.art = true;
syncLayerUI();
$('#hideL').addEventListener('change', e => { state.hideL = e.target.checked; applyVisibility(); });
$('#hideR').addEventListener('change', e => { state.hideR = e.target.checked; applyVisibility(); });
$('#iso').addEventListener('change', e => { state.isolate = e.target.checked; applyAppearance(); });
$('#auto').addEventListener('change', e => { auto = e.target.checked; });
$('#op').addEventListener('input', e => { state.cortexOp = +e.target.value; $('#opv').textContent = Math.round(state.cortexOp * 100) + '%'; applyAppearance(); });
$('#allOn').addEventListener('click', () => { Object.keys(GROUPS).forEach(k => state.groupOn[k] = true); syncLayerUI(); applyVisibility(); applyAppearance(); });
$('#allOff').addEventListener('click', () => { Object.keys(GROUPS).forEach(k => state.groupOn[k] = false); state.sel = null; syncLayerUI(); applyVisibility(); applyAppearance(); renderInfo(); markList(); });
$('#sulcosOn').addEventListener('change', e => { state.sulcos = e.target.checked; applyVisibility(); });
function renderBisturi() {
  const bar = $('#bistbar'), n = state.removidos.size;
  bar.hidden = !state.bisturi && !n;
  $('#bistTxt').textContent = state.bisturi ? 'Bisturi: clique para remover' + (n ? ' · ' + n + ' removida' + (n > 1 ? 's' : '') : '') : n + ' estrutura' + (n > 1 ? 's' : '') + ' removida' + (n > 1 ? 's' : '');
  $('#bistDesf').hidden = !state.pilhaRem.length; $('#bistTudo').hidden = !n;
  const L = $('#bistLista');
  L.innerHTML = n ? '<span class="muted" style="font-size:12.5px">Removidas (clique para devolver):</span>' + Array.from(state.removidos).map(k => { const [id, sd] = k.split('|'); return '<button type="button" data-rem="' + esc(k) + '">' + esc(nomeL(id)) + (sd === '1' ? ' (E)' : sd === '-1' ? ' (D)' : '') + ' ↺</button>'; }).join('') : '';
  $$('[data-rem]', L).forEach(b => b.addEventListener('click', () => { state.removidos.delete(b.dataset.rem); state.pilhaRem = state.pilhaRem.filter(x => x !== b.dataset.rem); applyVisibility(); renderBisturi(); }));
}
$('#bisturiBtn').addEventListener('click', () => { state.bisturi = !state.bisturi; $('#bisturiBtn').setAttribute('aria-pressed', state.bisturi ? 'true' : 'false'); renderBisturi(); });
$('#bistDesf').addEventListener('click', () => { const k = state.pilhaRem.pop(); if (k) state.removidos.delete(k); applyVisibility(); renderBisturi(); });
$('#bistTudo').addEventListener('click', () => { state.removidos.clear(); state.pilhaRem = []; applyVisibility(); renderBisturi(); });
function setNervos(modo) {
  state.nervos = modo; $$('[data-nm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.nm === modo ? 'true' : 'false'));
  if (modo !== 'sem' && !state.groupOn.nc) { state.groupOn.nc = true; syncLayerUI(); }
  aplicaNervos(); applyAppearance();
}
$$('[data-nm]').forEach(b => b.addEventListener('click', () => setNervos(b.dataset.nm)));
// o tronco é inclinado para trás: as vistas ventral e dorsal olham perpendicularmente à sua face (eixo do perfil ventral)
const TI_VISTA = { ventral: ['anterior', [0, -3.1, -1.5], 15, 0, 1.99], dorsal: ['posterior', [0, -3.0, -2.5], 14, Math.PI, 1.15], lateral: ['lateral', [0, -3.1, -1.9], 16, Math.PI / 2, 1.57] };
function vistaTronco(v) { const q = TI_VISTA[v]; const hl = state.hideL, hr = state.hideR; setView(q[0]); state.hideL = hl; state.hideR = hr; camGoal.target.set(q[1][0], q[1][1], q[1][2]); camGoal.dist = q[2]; camGoal.theta = q[3]; camGoal.phi = q[4]; $$('[data-tiv]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tiv === v ? 'true' : 'false')); applyVisibility(); }
function setTroncoIso(on) {
  state.troncoIso = !!on; $('#tiBtn').setAttribute('aria-pressed', on ? 'true' : 'false'); $('#modoExplorar').setAttribute('aria-pressed', on ? 'false' : 'true'); $('#grpVistas').hidden = !!on; $('#tipainel').hidden = !on;
  if (on) {
    state.licao = null; renderLicao(); state.sel = null;
    Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'stem' || k === 'cereb' || k === 'ped' || k === 'nc')); syncLayerUI();
    if (state.nervos === 'inteiro') setNervos('curto');
    state.hideL = state.hideR = false; syncHemiUI(); vistaTronco('ventral');
  } else { Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art')); syncLayerUI(); setNervos('inteiro'); setView('lateral'); }
  applyVisibility(); applyAppearance(); renderInfo(); markList();
}
$('#tiBtn').addEventListener('click', () => { if (state.bol.on) setBolachas(false); if (!state.troncoIso) setTroncoIso(true); });
$('#modoExplorar').addEventListener('click', () => { if (state.bol.on) setBolachas(false); if (state.troncoIso) setTroncoIso(false); });
$('#tiBtn2').addEventListener('click', () => setTroncoIso(true));
$('#tiSair').addEventListener('click', () => setTroncoIso(false));
$$('[data-tiv]').forEach(b => b.addEventListener('click', () => vistaTronco(b.dataset.tiv)));
$$('[data-tip]').forEach(b => b.addEventListener('click', () => select(b.dataset.tip, { focus: false })));
function setSeparado(on) { state.separado = !!on; $('#sepBtn').textContent = on ? 'Juntar o cerebelo ao tronco' : 'Separar o cerebelo do tronco'; if (on) { state.groupOn.stem = true; syncLayerUI(); } applyVisibility(); marca(); }
$('#sepBtn').addEventListener('click', () => setSeparado(!state.separado));
$('#rotOn').addEventListener('change', e => { state.rotulos = e.target.checked; });
$('#rotOcultar').addEventListener('change', e => { state.ocultar = e.target.checked; Object.keys(REVELADO).forEach(k => delete REVELADO[k]); renderInfo(); renderLicao(); });
$('#cavernoso').addEventListener('click', () => {
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'nc' || k === 'art' || k === 'ven' || k === 'stem' || k === 'cereb' || k === 'ped' || k === 'dien'));
  state.sel = 'scav'; state.isolate = true; $('#iso').checked = true; syncLayerUI();
  state.realce = { aci: 1, nc3: 1, nc4: 1, n_oft: 1, nc6: 1, sinterc: 1, hipofise: 1, g_trig: 1 };   // o que atravessa o seio ou corre na sua parede (cap. 8, p. 73)
  setView('anterior'); camGoal.theta = 0.75; camGoal.phi = 1.25; camGoal.target.set(1.2, -2.2, 1.6); camGoal.dist = 15;
  applyVisibility(); applyAppearance(); renderInfo(); markList();
});
$('#nervos').addEventListener('click', () => {
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'stem' || k === 'cereb' || k === 'ped' || k === 'nc'));
  state.cortexOp = 0.1; $('#op').value = 0.1; $('#opv').textContent = '10%';
  state.sel = null; syncLayerUI(); setView('inferior'); camGoal.target.set(0, -3.0, -0.8); camGoal.dist = 24;
  applyVisibility(); applyAppearance(); renderInfo(); markList();
});
$('#verVias').addEventListener('click', () => {
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'stem' || k === 'cereb' || k === 'ped' || k === 'vias'));
  state.cortexOp = 0.15; $('#op').value = 0.15; $('#opv').textContent = '15%';
  state.sel = null; state.les = null; syncLayerUI(); setView('lateral'); camGoal.dist = 34;
  applyVisibility(); applyAppearance(); renderInfo(); markList();
});
$('#lesao').addEventListener('change', e => {
  state.lesao = e.target.checked; if (!state.lesao) state.les = null;
  if (state.lesao && !state.groupOn.vias) { state.groupOn.vias = true; syncLayerUI(); }
  applyVisibility(); applyAppearance(); renderInfo();
});
$('#reset').addEventListener('click', () => {
  state.licao = null; renderLicao(); if (state.troncoIso) setTroncoIso(false); setNervos('inteiro'); state.removidos.clear(); state.pilhaRem = []; state.bisturi = false; $('#bisturiBtn').setAttribute('aria-pressed', 'false'); renderBisturi(); setSeparado(false);
  state.sel = null; state.cortexOp = 1; state.hideL = state.hideR = false; $('#op').value = 1; $('#opv').textContent = '100%'; state.fluxo = false; $('#fluxo').checked = false; state.territ = state.avc = false; state.lesao = false; state.les = null; $('#lesao').checked = false; $('#territ').checked = $('#avc').checked = false; $('#legenda').hidden = true; $('#passos').hidden = true; setInflada(false);
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art')); syncLayerUI(); syncHemiUI();
  applyVisibility(); applyAppearance(); renderInfo(); markList(); setView('lateral'); camGoal.dist = 40;
});

/* ---- lista de estruturas + busca ---- */
const listEl = $('#list'), searchEl = $('#search');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function buildList() {
  let h = '';
  Object.keys(GROUPS).forEach(g => {
    h += '<details class="grp" data-g="' + g + '"><summary><span class="sw" style="background:' + GROUPS[g].color + '"></span>' + esc(GROUPS[g].name) + '<span class="cnt">' + byGroup[g].length + '</span></summary><ul>';
    byGroup[g].forEach(id => { const sin = (META[id].sin || []).join(' · '); h += '<li><button type="button" data-id="' + id + '"' + (sin ? ' title="' + esc(sin) + '"' : '') + '>' + esc(META[id].name) + (sin ? '<span hidden> ' + esc(sin) + '</span>' : '') + '</button></li>'; });   // sinônimos do registro: entram na busca
    h += '</ul></details>';
  });
  listEl.innerHTML = h;
  $$('button[data-id]', listEl).forEach(b => b.addEventListener('click', () => { if (state.quiz) endQuiz(); select(b.dataset.id); }));
}
function filterList() {
  const q = norm(searchEl.value.trim());
  $$('details.grp', listEl).forEach(d => {
    let any = false;
    $$('li', d).forEach(li => {
      const ok = !q || norm(li.textContent).indexOf(q) >= 0; li.hidden = !ok; if (ok) any = true;
    });
    d.hidden = !any; if (q) d.open = any;
  });
}
function markList() { $$('button[data-id]', listEl).forEach(b => b.classList.toggle('on', b.dataset.id === state.sel || (REGION_ALIAS[state.sel] === b.dataset.id))); }
buildList(); searchEl.addEventListener('input', filterList);
$('details.grp', listEl).open = true;

/* ---- abas ---- */
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
  $$('.panel').forEach(p => p.hidden = p.id !== t.dataset.panel);
  if (t.dataset.panel === 'quizP' && !state.quiz) startQuiz(); else if (t.dataset.panel !== 'quizP' && state.quiz) endQuiz();
}));

/* ---- modo teste ---- */
const quizEl = $('#quizBody');
let qScore = { ok: 0, total: 0 };
function startQuiz() { state.quiz = { revealed: false }; nextQuestion(); }
function endQuiz() { state.quiz = null; state.avc = false; $('#avc').checked = false; renderInfo(); applyAppearance(); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sorteia = a => a[Math.floor(Math.random() * a.length)];
// artérias: déficit da oclusão -> qual artéria (Machado, cap. 18)
const ART_Q = { ACA: ['Artéria cerebral anterior', 'aca1'], ACM: ['Artéria cerebral média', 'acm'], ACP: ['Artéria cerebral posterior', 'acp'], heubner: ['Artéria recorrente de Heubner', 'heubner'], lenticulo: ['Artérias lenticuloestriadas', 'lenticulo'], talamoperf: ['Artérias talamoperfurantes', 'talamoperf'] };
// lesões: déficit -> onde está a lesão (Machado, caps. 19, 21, 22, 24, 29 e 30); ficam de fora os pontos sem déficit descrito
const nomeLes = n => n.replace(/^[A-G]\. /, '').replace(/\s*\(.*?\)/g, '');
const LES_Q = [];
Object.keys(LES).forEach(v => LES[v].forEach((q, k) => { if (!/não descreve|Não há perda/.test(q.txt)) LES_Q.push({ v, k, nome: nomeLes(q.nome) }); }));
const semNomes = (t, nomes) => { let r = t; nomes.forEach(n => { r = r.split(n).join('…'); }); return r; };
// cada pergunta começa de uma vista limpa: sem modos ligados, córtex opaco, só córtex e artérias
function limparVista() {
  state.les = null; state.lesao = false; $('#lesao').checked = false; state.avc = false; $('#avc').checked = false;
  state.territ = false; $('#territ').checked = false; $('#legenda').hidden = true; state.fluxo = false; $('#fluxo').checked = false; $('#passos').hidden = true;
  state.cortexOp = 1; $('#op').value = 1; $('#opv').textContent = '100%';
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = (k === 'cortex' || k === 'art')); syncLayerUI();
}
function nextQuestion() {
  limparVista();
  const modo = state.qmodo;
  if (modo !== 'est') setView('lateral');
  if (modo === 'clique') {
    let pool;
    if (state.licao) { abrirLicao(state.licao.ti, state.licao.li); pool = state.licao.ids.filter(id => ITEMS[id] && ITEMS[id].meshes.length); }
    else pool = LISTABLE.filter(id => ITEMS[id] && ITEMS[id].meshes.length && ['cortex', 'stem', 'cereb', 'ped', 'dien', 'deep', 'limbic', 'nc', 'art', 'ven'].indexOf(META[id].grp) >= 0 && !/^(s_|f_|nu)/.test(id));
    const t = sorteia(pool);
    if (!state.licao) {
      const g = META[t].grp; state.groupOn[g] = true; syncLayerUI();
      if (g !== 'cortex') { state.cortexOp = 0.15; $('#op').value = 0.15; $('#opv').textContent = '15%'; const c = centerOf(t); if (c) { camGoal.target.copy(c); camGoal.dist = 28; } }
      else if (MEDIAIS.indexOf(t) >= 0) setView('medial');
    }
    state.quiz = { modo, target: t, opts: [], revealed: false, pergunta: 'Clique em: ' + nomeL(t) };
    state.sel = null; applyVisibility(); applyAppearance();
  } else if (modo === 'art') {
    const t = sorteia(Object.keys(OCLUSAO));
    let txt = OCLUSAO[t].txt.replace(/^[^:]*:\s*/, ''); txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    const opts = shuffle([t].concat(shuffle(Object.keys(OCLUSAO).filter(x => x !== t)).slice(0, 3))).map(x => ({ key: x, label: ART_Q[x][0] }));
    state.quiz = { modo, target: t, opts, revealed: false, pergunta: 'Que oclusão arterial causa este quadro?', texto: txt };
    state.sel = null; applyVisibility(); applyAppearance();
  } else if (modo === 'les') {
    const t = sorteia(LES_Q), q = LES[t.v][t.k];
    const outros = shuffle(LES_Q.filter(x => x !== t && x.nome !== t.nome));
    const mesma = outros.filter(x => x.v === t.v).slice(0, 1), resto = outros.filter(x => x.v !== t.v && mesma.indexOf(x) < 0);
    const opts = shuffle([t].concat(mesma, resto.slice(0, 3 - mesma.length))).map(x => ({ key: x.v + ':' + x.k, label: x.nome }));
    const txt = semNomes(q.txt.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔ])/)[0].replace(/\s*\(cap\. [^)]*\)/, ''), [t.nome]);   // só a primeira frase: as seguintes costumam dizer onde está a lesão
    state.quiz = { modo, target: t.v + ':' + t.k, opts, revealed: false, pergunta: 'Onde está a lesão que causa este quadro?', texto: txt, campo: q.campo, les: t };
    state.sel = null; applyVisibility(); applyAppearance();
  } else {
    const pool = LISTABLE.filter(id => ITEMS[id] && ITEMS[id].meshes.length && META[id].grp !== 'vias');   // só o que tem forma no modelo
    const target = sorteia(pool);
    const same = shuffle(pool.filter(id => id !== target && META[id].grp === META[target].grp));
    const other = shuffle(pool.filter(id => id !== target && META[id].grp !== META[target].grp));
    const opts = shuffle([target].concat(same.slice(0, 2), other.slice(0, 1))).map(id => ({ key: id, label: META[id].name }));
    state.quiz = { modo, target, opts, revealed: false, pergunta: 'Qual estrutura está destacada no modelo?' };
    state.groupOn[META[target].grp] = true; syncLayerUI();
    state.isolate = true; $('#iso').checked = true;
    state.sel = target; applyVisibility(); applyAppearance();
    const c = centerOf(target); if (c) { camGoal.target.copy(c); camGoal.dist = Math.min(camGoal.dist, 36); }
    state.hideL = state.hideR = false; syncHemiUI();
    if (REGIONS.indexOf(target) >= 0) enquadrar(target);
    applyVisibility();
  }
  renderQuiz(); renderInfo(); markList();
}
// depois da resposta, mostra no modelo: o território (artéria) ou o ponto da lesão
function mostrarResposta() {
  const q = state.quiz;
  if (q.modo === 'art') {
    const a = ART_Q[q.target][1];
    state.avc = true; $('#avc').checked = true; state.groupOn.art = true; state.groupOn.cortex = true;
    (OCLUSAO[q.target].deep || []).forEach(x => { state.groupOn[META[x].grp] = true; });
    syncLayerUI(); select(a);
  } else if (q.modo === 'les') {
    state.lesao = true; $('#lesao').checked = true; state.groupOn.vias = true; state.groupOn.stem = state.groupOn.cereb = state.groupOn.ped = true;
    state.cortexOp = Math.min(state.cortexOp, 0.15); $('#op').value = state.cortexOp; $('#opv').textContent = Math.round(state.cortexOp * 100) + '%';
    state.les = { via: q.les.v, k: q.les.k }; syncLayerUI(); select(q.les.v, { focus: false });
    const p = LES[q.les.v][q.les.k].p; camGoal.target.set(p[0], p[1], p[2]); camGoal.dist = Math.min(camGoal.dist, 26);
  }
}
function renderQuiz() {
  const q = state.quiz; if (!q) return;
  let h = '<div class="qmodo" role="group" aria-label="Tipo de pergunta">' + [['est', 'Estrutura'], ['clique', 'Clique na estrutura'], ['art', 'Artéria: déficit'], ['les', 'Lesão: onde está']].map(m => '<button type="button" class="chipbtn" data-qm="' + m[0] + '" aria-pressed="' + (state.qmodo === m[0]) + '">' + m[1] + '</button>').join('') + '</div>';
  h += '<p class="score">Acertos: <b>' + qScore.ok + '</b> de ' + qScore.total + '</p>';
  h += '<p class="qq">' + esc(q.pergunta) + '</p>';
  if (q.texto) h += '<div class="qtxt">' + (q.campo ? campoSVG(q.campo) : '') + esc(q.texto) + '</div>';
  h += '<div class="opts">';
  q.opts.forEach(o => { h += '<button type="button" class="opt" data-o="' + esc(o.key) + '"' + (q.revealed ? ' disabled' : '') + '>' + esc(o.label) + '</button>'; });
  h += '</div>';
  const certo = q.opts.find(o => o.key === q.target) || { label: nomeL(q.target) };
  if (q.modo === 'clique' && !q.revealed) h += '<p class="muted">Gire e aproxime o modelo e clique na estrutura. As que não fazem parte do teste ficam apagadas e não respondem ao clique.</p>';
  if (q.modo === 'clique' && q.revealed && !q.correct) h += '<p class="muted">Você clicou em: ' + esc(nomeL(q.chosen)) + '. A estrutura certa está destacada.</p>';
  if (q.revealed) h += '<p class="fb ' + (q.correct ? 'ok' : 'no') + '">' + (q.correct ? 'Correto.' : 'Incorreto. A resposta é ' + esc(certo.label) + '.') + (q.modo !== 'est' ? ' Veja no modelo e no painel.' : '') + '</p><button type="button" class="btn primary" id="nextQ">Próxima</button>';
  else h += '<button type="button" class="btn" id="skipQ">Pular</button>';
  quizEl.innerHTML = h;
  $$('.opt', quizEl).forEach(b => {
    if (q.revealed) { if (b.dataset.o === q.target) b.classList.add('right'); else if (b.dataset.o === q.chosen) b.classList.add('wrong'); }
    b.addEventListener('click', () => answer(b.dataset.o));
  });
  $$('[data-qm]', quizEl).forEach(b => b.addEventListener('click', () => { state.qmodo = b.dataset.qm; nextQuestion(); }));
  const n = $('#nextQ'), sk = $('#skipQ');
  if (n) n.addEventListener('click', nextQuestion);
  if (sk) sk.addEventListener('click', nextQuestion);
}
function responderClique(id, ok) {
  const q = state.quiz; if (!q || q.revealed) return;
  q.revealed = true; q.chosen = id; q.correct = ok; qScore.total++; if (ok) qScore.ok++;
  state.sel = q.target; state.isolate = true; $('#iso').checked = true; applyVisibility(); applyAppearance();
  renderQuiz(); renderInfo(); markList();
}
function answer(id) {
  const q = state.quiz; if (!q || q.revealed) return;
  q.revealed = true; q.chosen = id; q.correct = id === q.target; qScore.total++; if (q.correct) qScore.ok++;
  if (q.modo !== 'est') mostrarResposta();
  renderQuiz(); renderInfo();
}

/* ---- nomes em latim (Terminologia Anatômica) e inglês ---- */
const NOMES = {};
`nuoliva|Nucleus olivaris inferior|Inferior olivary nucleus;nugrac|Nucleus gracilis|Gracile nucleus;nucun|Nucleus cuneatus|Cuneate nucleus;nupont|Nuclei pontis|Pontine nuclei;freticular|Formatio reticularis|Reticular formation;ctrap|Corpus trapezoideum|Trapezoid body;flm|Fasciculus longitudinalis medialis|Medial longitudinal fasciculus;lobo_front|Lobus frontalis|Frontal lobe;lobo_par|Lobus parietalis|Parietal lobe;lobo_temp|Lobus temporalis|Temporal lobe;lobo_occ|Lobus occipitalis|Occipital lobe;lobo_limb|Lobus limbicus|Limbic lobe;gistmo|Isthmus gyri cinguli|Isthmus of cingulate gyrus;fis_long|Fissura longitudinalis cerebri|Longitudinal cerebral fissure;gsubcal|Gyrus subcallosus|Subcallosal gyrus;pehipo|Pes hippocampi|Hippocampal head (pes);hipo_corpo|Hippocampus|Hippocampus, body and tail;alveo|Alveus hippocampi|Alveus;subiculo|Subiculum|Subiculum;f_cingulo|Cingulum|Cingulum;f_mamtal|Fasciculus mammillothalamicus|Mammillothalamic tract;estria_t|Stria terminalis|Stria terminalis;subst_inom|Substantia innominata|Substantia innominata;meynert|Nucleus basalis (Meynert)|Basal nucleus of Meynert;trighab|Trigonum habenulae|Habenular trigone;comhab|Commissura habenularum|Habenular commissure;mesenc|Mesencephalon|Midbrain;ponte|Pons|Pons;bulbo|Medulla oblongata|Medulla oblongata;pedunc|Pedunculus cerebri|Cerebral peduncle;colsup|Colliculus superior|Superior colliculus;colinf|Colliculus inferior|Inferior colliculus;fismedant|Fissura mediana anterior|Anterior median fissure;piramide|Pyramis medullae oblongatae|Pyramid;decpir|Decussatio pyramidum|Pyramidal decussation;sulantlat|Sulcus anterolateralis|Anterolateral sulcus;oliva|Oliva|Olive;sulpostlat|Sulcus posterolateralis|Posterolateral sulcus;sulbp|Sulcus bulbopontinus|Medullopontine sulcus;baseponte|Pars basilaris pontis|Basilar part of pons;sulbas|Sulcus basilaris|Basilar sulcus;fossaip|Fossa interpeduncularis|Interpeduncular fossa;sulmedped|Sulcus medialis cruris cerebri|Medial sulcus of cerebral crus;sullatmes|Sulcus lateralis mesencephali|Lateral sulcus of midbrain;fossarom|Fossa rhomboidea|Rhomboid fossa;sulmedfr|Sulcus medianus|Median sulcus;eminmed|Eminentia medialis|Medial eminence;colfac|Colliculus facialis|Facial colliculus;sullim|Sulcus limitans|Sulcus limitans;fovsup|Fovea superior|Superior fovea;fovinf|Fovea inferior|Inferior fovea;locus|Locus caeruleus|Locus coeruleus;areavest|Area vestibularis|Vestibular area;estrias|Striae medullares ventriculi quarti|Medullary striae of fourth ventricle;trighipo|Trigonum nervi hypoglossi|Hypoglossal trigone;trigvago|Trigonum nervi vagi|Vagal trigone;areapostrema|Area postrema|Area postrema;obex|Obex|Obex;sulmedpost|Sulcus medianus posterior|Posterior median sulcus;sulintpost|Sulcus intermedius posterior|Posterior intermediate sulcus;fgrac|Fasciculus gracilis|Gracile fasciculus;fcun|Fasciculus cuneatus|Cuneate fasciculus;tubgrac|Tuberculum gracile|Gracile tubercle;tubcun|Tuberculum cuneatum|Cuneate tubercle;bracsup|Brachium colliculi superioris|Brachium of superior colliculus;bracinf|Brachium colliculi inferioris|Brachium of inferior colliculus;veusup|Velum medullare superius|Superior medullary velum;pcs|Pedunculus cerebellaris superior|Superior cerebellar peduncle;pcm|Pedunculus cerebellaris medius|Middle cerebellar peduncle;pci|Pedunculus cerebellaris inferior|Inferior cerebellar peduncle;cerebelo|Hemispherium cerebelli|Cerebellar hemisphere;vermis|Vermis cerebelli|Vermis;cb_ant|Lobus cerebelli anterior|Anterior lobe of cerebellum;cb_post|Lobus cerebelli posterior|Posterior lobe of cerebellum;cb_fn|Lobus flocculonodularis|Flocculonodular lobe;cb_lingula|Lingula cerebelli|Lingula;cb_central|Lobulus centralis|Central lobule;cb_culmen|Culmen|Culmen;cb_declive|Declive|Declive;cb_folium|Folium vermis|Folium of vermis;cb_tuber|Tuber vermis|Tuber of vermis;cb_piramide|Pyramis vermis|Pyramid of vermis;cb_uvula|Uvula vermis|Uvula of vermis;cb_nodulo|Nodulus|Nodule;cb_asa|Ala lobuli centralis|Wing of central lobule;cb_quadant|Lobulus quadrangularis anterior|Anterior quadrangular lobule;cb_quadpost|Lobulus quadrangularis posterior|Posterior quadrangular lobule;cb_semisup|Lobulus semilunaris superior|Superior semilunar lobule;cb_semiinf|Lobulus semilunaris inferior|Inferior semilunar lobule;cb_biventre|Lobulus biventer|Biventral lobule;cb_tonsila|Tonsilla cerebelli|Cerebellar tonsil;cb_floculo|Flocculus|Flocculus;f_prima|Fissura prima|Primary fissure;f_postlat|Fissura posterolateralis|Posterolateral fissure;f_horiz|Fissura horizontalis|Horizontal fissure;f_precent|Fissura precentralis|Precentral fissure;f_preculm|Fissura preculminalis|Preculminate fissure;f_posclival|Fissura postclivalis|Postclival fissure;f_prepir|Fissura prepyramidalis|Prepyramidal fissure;f_pospir|Fissura secunda|Secondary fissure;arbvida|Arbor vitae cerebelli|Arbor vitae;nc1|Nervus olfactorius|Olfactory nerve;nc2|Nervus opticus|Optic nerve;nc3|Nervus oculomotorius|Oculomotor nerve;nc4|Nervus trochlearis|Trochlear nerve;nc5|Nervus trigeminus|Trigeminal nerve;nc6|Nervus abducens|Abducens nerve;nc7|Nervus facialis|Facial nerve;nc8|Nervus vestibulocochlearis|Vestibulocochlear nerve;nc9|Nervus glossopharyngeus|Glossopharyngeal nerve;nc10|Nervus vagus|Vagus nerve;nc11|Nervus accessorius|Accessory nerve;nc12|Nervus hypoglossus|Hypoglossal nerve;g_trig|Ganglion trigeminale|Trigeminal ganglion;n_oft|Nervus ophthalmicus|Ophthalmic nerve;n_max|Nervus maxillaris|Maxillary nerve;n_mand|Nervus mandibularis|Mandibular nerve;g_ciliar|Ganglion ciliare|Ciliary ganglion;g_pterig|Ganglion pterygopalatinum|Pterygopalatine ganglion;n_petmaior|Nervus petrosus major|Greater petrosal nerve;g_genic|Ganglion geniculi|Geniculate ganglion;n_corda|Chorda tympani|Chorda tympani;n_lingual|Nervus lingualis|Lingual nerve;g_submand|Ganglion submandibulare|Submandibular ganglion;n_timp|Nervus tympanicus|Tympanic nerve;g_otico|Ganglion oticum|Otic ganglion;n_auriculo|Nervus auriculotemporalis|Auriculotemporal nerve;n_infraorb|Nervus infraorbitalis|Infraorbital nerve;n_alvinf|Nervus alveolaris inferior|Inferior alveolar nerve;aci|Arteria carotis interna|Internal carotid artery;acm|Arteria cerebri media|Middle cerebral artery;aca1|Arteria cerebri anterior|Anterior cerebral artery;acomA|Arteria communicans anterior|Anterior communicating artery;pcom|Arteria communicans posterior|Posterior communicating artery;acp|Arteria cerebri posterior|Posterior cerebral artery;acp1|Arteria cerebri posterior, pars precommunicalis|Precommunicating part of posterior cerebral artery;basilar|Arteria basilaris|Basilar artery;vertebral|Arteria vertebralis|Vertebral artery;pica|Arteria inferior posterior cerebelli|Posterior inferior cerebellar artery;aica|Arteria inferior anterior cerebelli|Anterior inferior cerebellar artery;sca|Arteria superior cerebelli|Superior cerebellar artery;a_pont|Arteriae pontis|Pontine arteries;a_labir|Arteria labyrinthi|Labyrinthine artery;a_espant|Arteria spinalis anterior|Anterior spinal artery;a_espost|Arteria spinalis posterior|Posterior spinal artery;coroant|Arteria choroidea anterior|Anterior choroidal artery;a_oft|Arteria ophthalmica|Ophthalmic artery;pericalosa|Arteria pericallosa|Pericallosal artery;calmarg|Arteria callosomarginalis|Callosomarginal artery;heubner|Arteria striata medialis distalis|Recurrent artery (of Heubner);lenticulo|Arteriae centrales anterolaterales|Anterolateral central (lenticulostriate) arteries;sss|Sinus sagittalis superior|Superior sagittal sinus;sinf|Sinus sagittalis inferior|Inferior sagittal sinus;sreto|Sinus rectus|Straight sinus;torcula|Confluens sinuum|Confluence of sinuses;stransv|Sinus transversus|Transverse sinus;ssigm|Sinus sigmoideus|Sigmoid sinus;jugular|Vena jugularis interna|Internal jugular vein;socc|Sinus occipitalis|Occipital sinus;scav|Sinus cavernosus|Cavernous sinus;sinterc|Sinus intercavernosi|Intercavernous sinuses;spsup|Sinus petrosus superior|Superior petrosal sinus;spinf|Sinus petrosus inferior|Inferior petrosal sinus;sesfpar|Sinus sphenoparietalis|Sphenoparietal sinus;plexbas|Plexus basilaris|Basilar plexus;galeno|Vena magna cerebri|Great cerebral vein;vint|Venae internae cerebri|Internal cerebral veins;basal|Vena basalis|Basal vein;v_talest|Vena thalamostriata superior|Superior thalamostriate vein;v_coroid|Vena choroidea superior|Superior choroidal vein;v_septo|Vena anterior septi pellucidi|Anterior vein of septum pellucidum;silv|Vena media superficialis cerebri|Superficial middle cerebral vein;s_lateral|Sulcus lateralis|Lateral sulcus;s_central|Sulcus centralis|Central sulcus;s_precentral|Sulcus precentralis|Precentral sulcus;s_poscentral|Sulcus postcentralis|Postcentral sulcus;s_fronsup|Sulcus frontalis superior|Superior frontal sulcus;s_froninf|Sulcus frontalis inferior|Inferior frontal sulcus;s_tempsup|Sulcus temporalis superior|Superior temporal sulcus;s_tempinf|Sulcus temporalis inferior|Inferior temporal sulcus;s_intrapar|Sulcus intraparietalis|Intraparietal sulcus;s_calcarino|Sulcus calcarinus|Calcarine sulcus;s_parocc|Sulcus parietooccipitalis|Parieto-occipital sulcus;s_corpcal|Sulcus corporis callosi|Callosal sulcus;s_cingulo|Sulcus cinguli|Cingulate sulcus;s_marginal|Ramus marginalis sulci cinguli|Marginal branch of cingulate sulcus;s_subpar|Sulcus subparietalis|Subparietal sulcus;s_paracent|Sulcus paracentralis|Paracentral sulcus;s_colateral|Sulcus collateralis|Collateral sulcus;s_occtemp|Sulcus occipitotemporalis|Occipitotemporal sulcus;s_olfat|Sulcus olfactorius|Olfactory sulcus;cc|Corpus callosum|Corpus callosum;cc_rostro|Rostrum corporis callosi|Rostrum of corpus callosum;cc_joelho|Genu corporis callosi|Genu of corpus callosum;cc_tronco|Truncus corporis callosi|Trunk of corpus callosum;cc_esplenio|Splenium corporis callosi|Splenium of corpus callosum;septo|Septum pellucidum|Septum pellucidum;fornice|Fornix|Fornix;aderencia|Adhesio interthalamica|Interthalamic adhesion;unco|Uncus|Uncus;fimbria|Fimbria hippocampi|Fimbria of hippocampus;giroden|Gyrus dentatus|Dentate gyrus;hipocampo|Hippocampus|Hippocampus;vlat|Ventriculus lateralis|Lateral ventricle;vlat_ant|Cornu frontale|Frontal horn;vlat_cent|Pars centralis ventriculi lateralis|Central part of lateral ventricle;vlat_post|Cornu occipitale|Occipital horn;vlat_inf|Cornu temporale|Temporal horn;v3|Ventriculus tertius|Third ventricle;v4|Ventriculus quartus|Fourth ventricle;aqueduto|Aqueductus mesencephali|Cerebral aqueduct;fmonro|Foramen interventriculare|Interventricular foramen;foice|Falx cerebri|Falx cerebri;tentorio|Tentorium cerebelli|Tentorium cerebelli;foicecb|Falx cerebelli|Falx cerebelli;diafragma|Diaphragma sellae|Diaphragma sellae;medula|Medulla spinalis|Spinal cord;talamo|Thalamus|Thalamus;hipotal|Hypothalamus|Hypothalamus;hipofise|Hypophysis|Pituitary gland;pineal|Glandula pinealis|Pineal gland;caudado|Nucleus caudatus|Caudate nucleus;putame|Putamen|Putamen;amigdala|Corpus amygdaloideum|Amygdala;capsint|Capsula interna|Internal capsule;quiasma|Chiasma opticum|Optic chiasm;gpre|Gyrus precentralis|Precentral gyrus;gpos|Gyrus postcentralis|Postcentral gyrus;gfs|Gyrus frontalis superior|Superior frontal gyrus;gfm|Gyrus frontalis medius|Middle frontal gyrus;gts|Gyrus temporalis superior|Superior temporal gyrus;gtm|Gyrus temporalis medius|Middle temporal gyrus;gti|Gyrus temporalis inferior|Inferior temporal gyrus;gsm|Gyrus supramarginalis|Supramarginal gyrus;gang|Gyrus angularis|Angular gyrus;gcing|Gyrus cinguli|Cingulate gyrus;gcun|Cuneus|Cuneus;gprec|Precuneus|Precuneus;gling|Gyrus lingualis|Lingual gyrus;gparahip|Gyrus parahippocampalis|Parahippocampal gyrus;ginsula|Insula|Insula;gfus|Gyrus fusiformis|Fusiform gyrus;greto|Gyrus rectus|Straight gyrus;gpara|Lobulus paracentralis|Paracentral lobule;gps|Lobulus parietalis superior|Superior parietal lobule`.split(';').forEach(l => { const q = l.split('|'); NOMES[q[0]] = [q[1], q[2]]; });

/* ---- lições guiadas: uma vista, poucas estruturas numeradas, em sequência ---- */
const LICOES = [
  { t: 'Tronco encefálico', l: [
    { n: 'Visão geral (face ventral)', v: 'anterior', a: [0, -2.8, -1.5], d: 14, g: ['stem', 'nc'], i: ['mesenc', 'pedunc', 'ponte', 'pcm', 'bulbo', 'medula', 'nc3', 'nc5', 'nc7', 'nc12'], x: 'O tronco encefálico fica entre a medula e o diencéfalo, ventralmente ao cerebelo, e divide-se em bulbo, ponte e mesencéfalo. Dez dos doze pares cranianos fazem conexão com ele (cap. 5).' },
    { n: 'Bulbo: face ventral e lateral', v: 'anterior', a: [0, -4.2, -1.6], d: 9, g: ['stem'], i: ['fismedant', 'piramide', 'decpir', 'sulantlat', 'oliva', 'sulpostlat', 'sulbp'], x: 'Os sulcos do bulbo continuam os da medula. De cada lado da fissura mediana anterior está a pirâmide (trato corticospinal); entre os sulcos lateral anterior e lateral posterior, a oliva.' },
    { n: 'Ponte e mesencéfalo: face ventral', v: 'inferior', a: [0, -2.6, -1.0], d: 11, g: ['stem'], i: ['baseponte', 'sulbas', 'pcm', 'sulbp', 'fossaip', 'sulmedped', 'pedunc'], x: 'A base da ponte tem estriação transversal; o sulco basilar aloja a artéria basilar. Entre os pedúnculos cerebrais fica a fossa interpeduncular.' },
    { n: 'Mesencéfalo: face dorsal', v: 'posterior', ph: 0.9, a: [0, -1.0, -2.6], d: 9, g: ['stem', 'dien'], i: ['colsup', 'colinf', 'bracsup', 'bracinf', 'pcs', 'veusup', 'sullatmes'], x: 'O teto do mesencéfalo apresenta os colículos superiores e inferiores. Caudalmente ao colículo inferior emerge o nervo troclear, único par craniano dorsal.' },
    { n: 'Assoalho do IV ventrículo', v: 'posterior', ph: 0.75, a: [0, -3.0, -2.9], d: 8, g: ['stem'], i: ['sulmedfr', 'eminmed', 'colfac', 'sullim', 'fovsup', 'fovinf', 'locus', 'areavest', 'estrias', 'trighipo', 'trigvago', 'areapostrema', 'obex'], x: 'Losângico, formado pela parte dorsal da ponte e pela porção aberta do bulbo. O sulco limitante separa os núcleos motores (mediais) dos sensitivos (laterais).' },
    { n: 'Bulbo: face dorsal', v: 'posterior', ph: 1.2, a: [0, -4.3, -2.6], d: 8, g: ['stem'], i: ['sulmedpost', 'sulintpost', 'fgrac', 'fcun', 'tubgrac', 'tubcun', 'pci'], x: 'A área posterior do bulbo continua o funículo posterior da medula: fascículos grácil e cuneiforme, que terminam nos tubérculos dos núcleos de mesmo nome.' }] },
  { t: 'Cerebelo', l: [
    { n: 'Lobos e fissuras principais', v: 'superior', a: [0, -3, -5], d: 16, g: ['stem'], i: ['cb_ant', 'cb_post', 'f_prima', 'vermis', 'cerebelo'], x: 'A fissura prima divide o corpo do cerebelo em lobo anterior e lobo posterior; a fissura posterolateral separa o lobo floculonodular (cap. 5, p. 49).' },
    { n: 'Face superior: lóbulos', v: 'superior', a: [0, -3, -5], d: 15, g: ['stem'], i: ['cb_culmen', 'cb_declive', 'cb_folium', 'cb_asa', 'cb_quadant', 'cb_quadpost', 'cb_semisup', 'f_posclival', 'f_horiz'], x: 'A cada lóbulo do verme correspondem dois nos hemisférios (figura 5.6).' },
    { n: 'Face inferior: lóbulos', v: 'inferior', a: [0, -3.5, -4.5], d: 16, g: ['stem'], i: ['cb_semiinf', 'cb_biventre', 'cb_tonsila', 'cb_floculo', 'cb_nodulo', 'cb_uvula', 'cb_piramide', 'cb_tuber', 'f_postlat'], x: 'Os que devem ser identificados nas peças: nódulo, flóculo e tonsila (figura 5.4).' },
    { n: 'Verme em corte sagital', v: 'medial', a: [0, -3.2, -4.5], d: 13, g: ['stem'], i: ['arbvida', 'cb_lingula', 'cb_central', 'cb_culmen', 'cb_declive', 'cb_folium', 'cb_tuber', 'cb_piramide', 'cb_uvula', 'cb_nodulo', 'f_prima', 'f_postlat'], x: 'Na secção sagital mediana aparecem o corpo medular e os lóbulos do verme, da língula ao nódulo (figura 5.5).' },
    { n: 'Pedúnculos cerebelares (cerebelo separado)', sep: true, v: 'lateral', th: 1.95, ph: 1.35, a: [0, -3, -3.6], d: 17, g: ['stem'], i: ['pcs', 'pcm', 'pci', 'veusup', 'denteado', 'emboliforme', 'globoso', 'fastigial'], x: 'Com o cerebelo afastado, veem-se no tronco os cortes dos três pedúnculos: o superior liga o cerebelo ao mesencéfalo, o médio à ponte e o inferior à medula. No cerebelo, os quatro núcleos: denteado, emboliforme, globosos e fastigial (de lateral para medial).' }] },
  { t: 'Pares cranianos', l: [
    { n: 'Origens aparentes', v: 'inferior', a: [0, -3, -0.5], d: 19, g: ['stem', 'nc', 'dien'], i: ['nc1', 'nc2', 'nc3', 'nc4', 'nc5', 'nc6', 'nc7', 'nc8', 'nc9', 'nc10', 'nc11', 'nc12'], x: 'Do sulco bulbopontino emergem, a partir da linha média, o VI, o VII e o VIII; do sulco lateral anterior do bulbo, o XII; do lateral posterior, o IX, o X e a raiz craniana do XI.' },
    { n: 'Seio cavernoso', v: 'anterior', th: 0.75, ph: 1.25, a: [1.2, -2.2, 1.6], d: 15, g: ['nc', 'art', 'ven', 'dien', 'stem'], i: ['scav', 'aci', 'nc3', 'nc4', 'n_oft', 'nc6', 'sinterc', 'hipofise'], x: 'É atravessado pela carótida interna e pelo abducente; junto à parede lateral passam o troclear, o oculomotor e o ramo oftálmico do trigêmeo (cap. 8, p. 73).' },
    { n: 'Trigêmeo e seus ramos', v: 'lateral', a: [2.3, -3.2, 1.5], d: 14, g: ['nc', 'stem'], i: ['g_trig', 'n_oft', 'n_max', 'n_mand', 'n_v1ramos', 'n_infraorb', 'n_lingual', 'n_alvinf', 'n_auriculo', 'g_otico'], x: 'Do gânglio trigeminal saem os nervos oftálmico, maxilar e mandibular; a raiz motora acompanha o mandibular.' },
    { n: 'Facial e intermédio', v: 'lateral', a: [3.2, -4.6, 0], d: 16, g: ['nc', 'stem'], i: ['nc7', 'nc8', 'g_genic', 'n_petmaior', 'g_pterig', 'n_corda', 'g_submand', 'n7_ramos'], x: 'O facial entra no meato acústico interno, faz o joelho externo com o gânglio geniculado e sai pelo forame estilomastóideo.' },
    { n: 'IX, X, XI e XII', v: 'lateral', a: [2.4, -5.8, -1.5], d: 16, g: ['nc', 'stem'], i: ['nc9', 'g_ix', 'n_timp', 'g_otico', 'nc10', 'g_x', 'nc11', 'nc12'], x: 'IX, X e XI saem pelo forame jugular; o XII, pelo canal do hipoglosso.' },
    { n: 'Núcleos por colunas', v: 'posterior', ph: 0.9, a: [0, -3, -2.5], d: 10, g: ['stem', 'nc'], i: ['nu3', 'nu4', 'nu6', 'nu12', 'nuew', 'nudx', 'nusals', 'nusali', 'numot5', 'nu7', 'nuamb', 'numes5', 'nusp5', 'nuesp5', 'nuvest', 'nucocl', 'nusol'], x: 'Os núcleos dos nervos cranianos dispõem-se em seis colunas funcionais (cap. 17). A cor de cada um segue a legenda da coluna.' }] },
  { t: 'Vascularização', l: [
    { n: 'Polígono de Willis', v: 'inferior', a: [0, -1.6, -0.3], d: 16, g: ['art', 'stem'], i: ['aci', 'acm', 'aca1', 'acomA', 'pcom', 'acp1', 'acp', 'basilar', 'coroant', 'a_oft'], x: 'Circunda o quiasma óptico e o túber cinéreo; formado pelas carótidas internas, cerebrais anteriores e posteriores e comunicantes (cap. 18, p. 162).' },
    { n: 'Carótida interna: quatro partes', v: 'lateral', a: [1.4, -4.6, 0.3], d: 15, g: ['art', 'ven'], i: ['aci_cerv', 'aci_petr', 'aci_cav', 'aci_cer', 'scav', 'a_oft', 'pcom', 'coroant'], x: 'Parte cervical (sem ramos), petrosa (no canal carótico), cavernosa (curva em S no seio cavernoso) e cerebral (dá oftálmica, comunicante posterior e corióidea anterior). Os segmentos C2-C4 formam o sifão carótico (Prometheus, p. 246).' },
    { n: 'Sistema vertebrobasilar', v: 'anterior', a: [0, -3.5, -1.5], d: 16, g: ['art', 'stem'], i: ['vertebral', 'basilar', 'pica', 'aica', 'sca', 'a_pont', 'a_labir', 'a_espant', 'a_espost'], x: 'As vertebrais fundem-se perto do sulco bulbopontino para formar a basilar, que percorre o sulco basilar e se bifurca nas cerebrais posteriores.' },
    { n: 'Seios da dura-máter', v: 'lateral', th: 2.3, ph: 1.1, a: [0, -1, -1], d: 32, g: ['ven'], i: ['sss', 'sinf', 'sreto', 'torcula', 'stransv', 'ssigm', 'jugular', 'socc', 'scav', 'spsup', 'spinf', 'galeno', 'smarg', 'v_emiss', 'v_oftsup'], x: 'O sangue venoso do encéfalo converge para os seios e daí para as veias jugulares internas (cap. 8 e 18). Vias acessórias: veias emissárias, oftálmica superior e seio marginal, todas sem válvulas (Prometheus, p. 256-257).' },
    { n: 'Sistema venoso profundo', v: 'medial', a: [0, 0.6, -0.5], d: 16, g: ['ven', 'dien'], i: ['vint', 'galeno', 'basal', 'v_talest', 'v_coroid', 'v_septo', 'sreto', 'sinf'], x: 'Drena corpo estriado, cápsula interna, diencéfalo e centro branco medular; converge para a veia cerebral magna (cap. 18, p. 168).' }] },
  { t: 'Telencéfalo e envoltórios', l: [
    { n: 'Face lateral: sulcos', v: 'lateral', d: 34, g: ['cortex'], i: ['s_lateral', 's_central', 's_precentral', 's_poscentral', 's_fronsup', 's_froninf', 's_tempsup', 's_tempinf', 's_intrapar'], x: 'Os dois sulcos mais importantes são o lateral (de Sylvius) e o central (de Rolando) (cap. 7, p. 55).' },
    { n: 'Face medial', v: 'medial', d: 34, g: ['cortex', 'deep'], i: ['s_corpcal', 's_cingulo', 's_marginal', 's_paracent', 's_subpar', 's_parocc', 's_calcarino', 'cc_rostro', 'cc_joelho', 'cc_tronco', 'cc_esplenio', 'septo'], x: 'O corpo caloso une os hemisférios; entre ele e o fórnice está o septo pelúcido (cap. 7, p. 61-62).' },
    { n: 'Face inferior', v: 'inferior', d: 32, g: ['cortex', 'limbic'], i: ['s_olfat', 'greto', 's_occtemp', 'gfus', 's_colateral', 'gparahip', 'unco', 'gling'], x: 'No lobo temporal, da borda lateral para a medial: sulcos occipitotemporal, colateral e do hipocampo (cap. 7, p. 62).' },
    { n: 'Lobos do cérebro', v: 'lateral', d: 34, g: ['cortex'], i: ['lobo_front', 'lobo_par', 'lobo_temp', 'lobo_occ', 'ginsula', 's_central', 's_lateral', 's_parocc', 'fis_long'], x: 'O sulco central separa o lobo frontal do parietal; o sulco lateral separa o temporal dos lobos frontal e parietal; o occipital fica atrás da linha parietoccipital. A ínsula, lobo insular, fica no fundo do sulco lateral (cap. 7, p. 55).' },
    { n: 'Sistema límbico', v: 'medial', a: [0, 0.2, -0.6], d: 22, g: ['cortex', 'limbic', 'dien', 'deep'], i: ['lobo_limb', 'gcing', 'gistmo', 'gparahip', 'unco', 'gsubcal', 'f_cingulo', 'pehipo', 'hipo_corpo', 'fimbria', 'fornice', 'mamilar', 'f_mamtal', 'amigdala', 'estria_t', 'cc'], x: 'O lobo límbico (cíngulo, istmo e para-hipocampal) cerca o corpo caloso. Circuito de Papez: hipocampo, fórnice, corpo mamilar, fascículo mamilotalâmico, núcleo anterior do tálamo, giro do cíngulo, fascículo do cíngulo e de volta ao giro para-hipocampal (cap. 27).' },
    { n: 'Ventrículos', v: 'lateral', a: [0, 0, -0.5], d: 22, g: ['vent'], i: ['vlat_ant', 'vlat_cent', 'vlat_post', 'vlat_inf', 'fmonro', 'v3', 'aqueduto', 'v4'], x: 'Os ventrículos laterais comunicam-se com o III ventrículo pelos forames interventriculares; o aqueduto liga o III ao IV (figura 7.2).' },
    { n: 'Pregas da dura-máter', v: 'lateral', th: 2.3, ph: 1.1, d: 32, g: ['men', 'ven', 'stem'], i: ['foice', 'tentorio', 'foicecb', 'diafragma', 'sss', 'sinf', 'sreto', 'torcula'], x: 'O folheto interno da dura-máter forma pregas que dividem a cavidade craniana: foice do cérebro, tentório do cerebelo, foice do cerebelo e diafragma da sela (cap. 8, p. 69-71).' }] }];
const licEl = $('#licBody');
function abrirLicao(ti, li) {
  if (state.bol.on) setBolachas(false);
  const L = LICOES[ti].l[li];
  state.licao = { ti, li, ids: L.i.filter(id => ITEMS[id] && ITEMS[id].meshes.length), set: {} }; state.licao.ids.forEach(id => state.licao.set[id] = 1);
  state.sel = null; state.realce = null; state.les = null; state.lesao = false; $('#lesao').checked = false;
  setView(L.v); setSeparado(!!L.sep);
  Object.keys(GROUPS).forEach(k => state.groupOn[k] = L.g.indexOf(k) >= 0 || ((k === 'cereb' || k === 'ped') && L.g.indexOf('stem') >= 0));   // lições antigas: 'stem' inclui cerebelo e pedúnculos
  state.cortexOp = 1; $('#op').value = 1; $('#opv').textContent = '100%'; syncLayerUI();
  if (L.a) camGoal.target.set(L.a[0], L.a[1], L.a[2]);
  if (L.d) camGoal.dist = L.d; if (L.th !== undefined) camGoal.theta = L.th; if (L.ph !== undefined) camGoal.phi = L.ph;
  applyVisibility(); applyAppearance(); renderLicao(); renderInfo(); markList();
}
function sairLicao() { state.licao = null; applyVisibility(); applyAppearance(); renderLicao(); }
function passo(dl) {
  let { ti, li } = state.licao; li += dl;
  if (li >= LICOES[ti].l.length) { ti = (ti + 1) % LICOES.length; li = 0; }
  if (li < 0) { ti = (ti - 1 + LICOES.length) % LICOES.length; li = LICOES[ti].l.length - 1; }
  abrirLicao(ti, li);
}
function renderLicao() {
  if (!licEl) return;
  if (!state.licao) {
    licEl.innerHTML = '<p class="muted" style="margin-top:0">Cada lição mostra uma vista com poucas estruturas numeradas. Avance em sequência, oculte os nomes para se testar e termine com o teste de clicar.</p>' +
      LICOES.map((T, ti) => '<p class="lic-topico">' + esc(T.t) + '</p><div class="lic-lista">' + T.l.map((L, li) => '<button type="button" data-ti="' + ti + '" data-li="' + li + '">' + (li + 1) + '. ' + esc(L.n) + '</button>').join('') + '</div>').join('');
    $$('[data-ti]', licEl).forEach(b => b.addEventListener('click', () => abrirLicao(+b.dataset.ti, +b.dataset.li)));
    return;
  }
  const { ti, li } = state.licao, T = LICOES[ti], L = T.l[li];
  let h = '<p class="lic-cab">' + esc(T.t) + ' › lição ' + (li + 1) + ' de ' + T.l.length + '</p><h3 style="margin:0 0 6px">' + esc(L.n) + '</h3><p style="margin:0 0 6px">' + esc(L.x) + '</p>';
  h += '<ol class="lic-ol">' + state.licao.ids.map((id, k) => '<li><button type="button" data-lid="' + id + '"' + (state.sel === id ? ' class="on"' : '') + '><span class="num">' + (k + 1) + '</span><span' + (nomeVisivel(id) ? '' : ' class="oc"') + '>' + esc(nomeL(id)) + '</span></button></li>').join('') + '</ol>';
  h += '<div class="btnrow"><button class="btn" type="button" id="licAnt">← Anterior</button><button class="btn primary" type="button" id="licProx">Próxima →</button></div>';
  h += '<div class="btnrow" style="margin-top:6px"><button class="btn" type="button" id="licOc">' + (state.ocultar ? 'Mostrar os nomes' : 'Ocultar os nomes') + '</button><button class="btn" type="button" id="licTeste">Testar esta lição</button><button class="btn" type="button" id="licSair">Todas as lições</button></div>';
  licEl.innerHTML = h;
  $$('[data-lid]', licEl).forEach(b => b.addEventListener('click', () => { const id = b.dataset.lid; if (state.ocultar && !REVELADO[id]) REVELADO[id] = true; select(id, { focus: false }); renderLicao(); }));
  $('#licAnt').addEventListener('click', () => passo(-1));
  $('#licProx').addEventListener('click', () => passo(1));
  $('#licOc').addEventListener('click', () => { const c = $('#rotOcultar'); c.checked = !c.checked; c.dispatchEvent(new Event('change')); renderLicao(); });
  $('#licTeste').addEventListener('click', () => { state.qmodo = 'clique'; if (state.quiz) endQuiz(); document.querySelector('[data-panel=quizP]').click(); });
  $('#licSair').addEventListener('click', sairLicao);
}
function setLingua(l) {
  state.lingua = l; $$('#linguaSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === l ? 'true' : 'false'));
  Object.keys(ROT).forEach(k => ROT[k].textContent = ''); renderLicao(); if (state.quiz) renderQuiz();
}
$$('#linguaSeg button').forEach(b => b.addEventListener('click', () => setLingua(b.dataset.l)));
renderLicao();

marcaT('fim');
/* ---- início ---- */
renderInfo(); markList(); setView('lateral');
loadEl.hidden = true;
requestAnimationFrame(frame);


}

