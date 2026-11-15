/* ===== DADOS: grupos e estruturas (base: Ângelo Machado, Neuroanatomia Funcional) ===== */
const GROUPS = {
  cortex: { name: 'Córtex e giros', color: '#4a8fd6' },
  deep:   { name: 'Núcleos da base e substância branca', color: '#e0a23a' },
  limbic: { name: 'Sistema límbico', color: '#8e6cc9' },
  dien:   { name: 'Diencéfalo, hipófise e vias ópticas', color: '#e0707a' },
  stem:   { name: 'Tronco encefálico e cerebelo', color: '#c98a52' },
  vent:   { name: 'Ventrículos e líquor', color: '#6cc3d6' },
  art:    { name: 'Artérias', color: '#d8322d' },
  ven:    { name: 'Veias e seios venosos', color: '#2f5fb8' },
  nc:     { name: 'Nervos cranianos e núcleos', color: '#e3c044' },
  vias:   { name: 'Grandes vias', color: '#7a5cd6' },
  men:    { name: 'Meninges: pregas da dura-máter', color: '#a8957c' }
};
const META = {};
function M(id, name, grp, color, f, i, c) { META[id] = { id, name, grp, color, f: f || '', i: i || '', c: c || '', nota: '', conf: '' }; }

/* ---- córtex: face lateral ---- */
M('gfs','Giro frontal superior','cortex','#4a8fd6','Áreas 8, 9 e parte da 6. Planejamento do comportamento. Na face medial inclui a área motora suplementar.','ACA na face medial e na faixa mais alta da face lateral; ACM no restante.','Lesões dorsolaterais prejudicam planejamento e memória operacional.');
M('gfm','Giro frontal médio','cortex','#5fa3e0','Córtex pré-frontal dorsolateral (áreas 9 e 46) e campo ocular frontal (área 8): memória operacional, atenção e movimentos voluntários dos olhos.','ACM.','Lesão do campo ocular frontal: desvio conjugado do olhar para o lado da lesão.');
M('gfi_op','Giro frontal inferior, parte opercular','cortex','#3a76c0','Área 44 de Brodmann. Junto com a área 45 forma a área de Broca, que programa a atividade motora da fala. Dominante à esquerda.','ACM.','Afasia de Broca (motora): fala não fluente, compreensão preservada.');
M('gfi_tr','Giro frontal inferior, parte triangular','cortex','#2f68b0','Área 45 e parte da 44: área de Broca (linguagem expressiva).','ACM.','Afasia de Broca.');
M('gfi_or','Giro frontal inferior, parte orbital','cortex','#6bb0ea','Porção do giro frontal inferior que se continua com os giros orbitais; córtex pré-frontal ventrolateral.','ACM.','');
M('gpre','Giro pré-central','cortex','#3d4fb5','Área 4: área motora primária. Somatotopia (homúnculo motor): face e língua inferiormente, membro superior no meio, membro inferior na face medial (lóbulo paracentral). Origina o trato corticospinal.','Face lateral pela ACM; porção alta e medial (perna) pela ACA.','Lesão: paralisia contralateral. Obstrução da ACA: paralisia do membro inferior contralateral.');
M('gpos','Giro pós-central','cortex','#e6a817','Áreas 3, 1 e 2: área somestésica primária. Recebe do núcleo ventral posterior do tálamo. Somatotopia semelhante à do giro pré-central.','ACM na face lateral; ACA na porção alta e medial.','Lesão: hipoestesia contralateral e perda da discriminação tátil.');
M('gps','Lóbulo parietal superior','cortex','#f0c04a','Áreas 5 e 7: associação somestésica e integração visuoespacial.','ACM; parte medial pela ACA e ACP.','Lesões do lado não dominante: heminegligência.');
M('gsm','Giro supramarginal','cortex','#e98f2b','Área 40. Curva-se em torno da extremidade do ramo posterior do sulco lateral. Participa da área posterior da linguagem.','ACM.','Lesão esquerda: apraxias e distúrbios de linguagem.');
M('gang','Giro angular','cortex','#d97a1d','Área 39. Curva-se em torno da extremidade do sulco temporal superior. Integra informação visual e auditiva na linguagem escrita.','ACM (artéria do giro angular).','Lesão do giro angular pode causar afasia e alexia.');
M('gts','Giro temporal superior','cortex','#3fae6a','Áreas 22, 41 e 42. Na face superior está o giro temporal transverso (de Heschl), área auditiva primária. A parte posterior da área 22 é a área de Wernicke (percepção da linguagem).','ACM.','Lesão da área de Wernicke: afasia sensitiva (fluente, sem compreensão).');
M('gtm','Giro temporal médio','cortex','#5cc07f','Área 21: associação auditiva e semântica.','ACM; faixa inferior pela ACP.','');
M('gti','Giro temporal inferior','cortex','#86d49b','Área 20: associação visual (via ventral, reconhecimento de objetos). Forma a borda lateral do hemisfério.','ACM e ACP (ramos temporais inferiores).','');
M('gfus','Giro occipitotemporal lateral (fusiforme)','cortex','#7fcf9a','Face inferior do lobo temporal, entre os sulcos occipitotemporal e colateral. Reconhecimento de faces e cores.','ACP (ramos temporais).','Lesão bilateral: prosopagnosia e hemiacromatopsia.');
M('gpt','Polo temporal','cortex','#2f9a5b','Extremidade anterior do lobo temporal; associação e memória semântica. Continua-se com o unco e a amígdala.','ACM e ACP.','');
M('gocc','Giros occipitais laterais','cortex','#d6567f','Áreas 18 e 19: áreas visuais secundárias (forma, cor, movimento).','ACP; faixa lateral pela ACM.','Lesões causam agnosias visuais.');
M('gor','Giros orbitais','cortex','#7dbcf0','Face inferior do lobo frontal. Córtex orbitofrontal: emoções, tomada de decisão e supressão de comportamentos socialmente indesejáveis.','ACA (frontobasilar medial) e ACM (frontobasilar lateral).','Síndrome de Luria pré-frontal: desinibição.');
/* ---- córtex: face medial ---- */
M('gcing','Giro do cíngulo','cortex','#8e6cc9','Áreas 23, 24, 25 e 32. Arqueia-se sobre o corpo caloso; parte do sistema límbico (emoção, dor, atenção). Continua-se com o giro para-hipocampal pelo istmo.','ACA (ramos pericalosos e calosomarginais); porção posterior pela ACP (artéria dorsal do corpo caloso).','');
M('gfsm','Giro frontal superior (face medial)','cortex','#4a8fd6','Face medial do giro frontal superior; inclui a área motora suplementar (parte da área 6).','ACA.','');
M('gpara','Lóbulo paracentral','cortex','#6f7fd8','Continuação dos giros pré e pós-central na face medial. Controle motor e sensibilidade do membro inferior e controle dos esfíncteres.','ACA, pelo ramo paracentral da artéria calosomarginal.','Obstrução da ACA: paralisia e hipoestesia do membro inferior contralateral.');
M('gprec','Pré-cúneo','cortex','#f0b84a','Lóbulo parietal da face medial, entre o lóbulo paracentral e o sulco parietoccipital. Associação visuoespacial.','ACA na parte anterior; ACP (artéria parietoccipital) na posterior.','');
M('gcun','Cúneo','cortex','#e0709a','Entre o sulco parietoccipital e o sulco calcarino. O lábio superior do calcarino é a área visual primária (17) e recebe o campo visual inferior.','ACP (artérias calcarina e parietoccipital).','Lesão: quadrantopsia inferior contralateral. Lesão calcarina total: hemianopsia homônima com preservação macular.');
M('gling','Giro lingual (occipitotemporal medial)','cortex','#c9456f','Abaixo do sulco calcarino; recebe o campo visual superior.','ACP.','Lesão: quadrantopsia superior contralateral.');
M('gparahip','Giro para-hipocampal','cortex','#9b7fd1','Entre o sulco do hipocampo e o sulco colateral. Sua parte anterior é o córtex entorrinal (área 28), porta de entrada do hipocampo. Anteriormente curva-se no unco.','ACP; unco também por ramos da coroídea anterior.','');
M('greto','Giro reto e giros orbitais mediais','cortex','#7dbcf0','Face medial e orbital do lobo frontal, sobre o sulco olfatório, onde repousam o bulbo e o trato olfatórios.','ACA (artéria frontobasilar medial).','');
M('gsubc','Área subcalosa e área septal','cortex','#b79be0','Sob o rostro do corpo caloso, à frente da lâmina terminal. A área septal pertence ao sistema límbico.','ACA.','');
M('cc_cut','Corpo caloso (corte sagital)','cortex','#e9d7b4','');
M('dien_wall','Parede medial do hemisfério (corte)','cortex','#cfc8c0','');
/* ---- regiões da parcelação Desikan-Killiany que não tinham item próprio ---- */
M('ginsula','Ínsula','cortex','#39b3a6','Lobo situado no fundo do sulco lateral, encoberto pelos opérculos frontal, parietal e temporal. Tem giros curtos e giro longo, separados pelo sulco central da ínsula. Relaciona-se com gustação, sensibilidade visceral e emoções.','ACM.','');
M('gtt','Giro temporal transverso anterior (de Heschl)','cortex','#1f8a52','Na face superior do giro temporal superior, no assoalho do sulco lateral. Área auditiva primária (áreas 41 e 42), com tonotopia. Recebe a radiação auditiva vinda do corpo geniculado medial.','ACM.','Lesão unilateral causa déficit auditivo pequeno, porque a via auditiva é bilateral.');
M('gcalc','Córtex do sulco calcarino (área 17)','cortex','#b83260','Lábios do sulco calcarino, entre o cúneo e o giro lingual. Área visual primária (córtex estriado), com retinotopia: o lábio superior recebe o campo visual inferior e o lábio inferior, o campo superior.','ACP (artéria calcarina).','Lesão: hemianopsia homônima contralateral, em geral com preservação macular.');
M('gpolof','Polo frontal','cortex','#9ccaf5','Extremidade anterior do lobo frontal; córtex pré-frontal (área 10).','ACA e ACM.','');
M('gbsts','Margens do sulco temporal superior','cortex','#b9d65c','Paredes da parte posterior do sulco temporal superior, entre os giros temporal superior e médio.','ACM.','');
const REGION_ALIAS = { cc_cut: 'cc' };

/* ---- núcleos da base e substância branca ---- */
M('caudado','Núcleo caudado','deep','#e8a93f','Cabeça, corpo e cauda. Forma a parede lateral do ventrículo lateral. Com o putame forma o neoestriado, que recebe aferências do córtex e da substância negra.','Cabeça: artéria recorrente de Heubner (ACA) e lenticuloestriadas (ACM).','Doença de Huntington: atrofia do caudado e coreia.');
M('putame','Putame','deep','#d98b2b','Parte lateral do núcleo lentiforme. Neoestriado: principal porta de entrada das aferências corticais nos núcleos da base.','Artérias lenticuloestriadas (ACM).','Hemorragia das lenticuloestriadas: hemiplegia contralateral.');
M('gpe','Globo pálido, segmento externo','deep','#f2c45b','Relé da via indireta: recebe do estriado e projeta ao núcleo subtalâmico.','Lenticuloestriadas (ACM).','');
M('gpi','Globo pálido, segmento interno','deep','#f7d889','Principal via de saída dos núcleos da base. Projeta ao tálamo (VL e VA). A via direta o inibe e libera o tálamo; a indireta o ativa.','Lenticuloestriadas (ACM) e coroídea anterior.','');
M('accumbens','Núcleo accumbens','deep','#c06a2c','Principal componente do estriado ventral. Circuito de recompensa e motivação, ligando sistema límbico e motor.','Recorrente de Heubner (ACA) e lenticuloestriadas.','');
M('claustro','Claustro','deep','#b9a07a','Fina lâmina de substância cinzenta entre as cápsulas externa e extrema, lateral ao putame. Conexões com o córtex.','ACM.','');
M('capsint','Cápsula interna','deep','#f5e6a8','Lâmina de substância branca em V entre o tálamo e o caudado (medialmente) e o núcleo lentiforme (lateralmente). Perna anterior (caudado e lentiforme), joelho e perna posterior (tálamo e lentiforme). Passam quase todas as fibras de projeção do córtex.','Lenticuloestriadas (ACM), Heubner (ACA) e coroídea anterior (perna posterior).','Lesão: hemiplegia contralateral.');
M('cc','Corpo caloso','deep','#efe3c8','Maior comissura inter-hemisférica. Rostro, joelho, tronco e esplênio. Forma o teto dos ventrículos laterais.','ACA (4/5 anteriores, pericalosa) e ACP (esplênio, artéria dorsal do corpo caloso).','Secção: síndrome de desconexão calosa.');
M('comant','Comissura anterior','deep','#f1d98e','Une os bulbos e tratos olfatórios e os lobos temporais. Situa-se à frente das colunas do fórnix, na lâmina terminal.','ACA.','');
M('compost','Comissura posterior','deep','#e6c978','Cruza abaixo da pineal, no limite entre diencéfalo e mesencéfalo, ligando as áreas pré-tetais (reflexo fotomotor consensual).','ACP.','');
M('laminaterm','Lâmina terminal','deep','#e9ddc3','Fina lâmina que forma a parede anterior do III ventrículo, entre a comissura anterior e o quiasma óptico. Contém o órgão vascular da lâmina terminal.','','');

/* ---- sistema límbico ---- */
M('amigdala','Corpo amigdaloide','limbic','#b0467a','Complexo de 13 núcleos no polo temporal, à frente do corno inferior. Grupos corticomedial (olfação), basolateral (recebe aferências) e central (origina eferências). Processa o medo; via direta rápida e via indireta que passa pelo córtex pré-frontal.','Coroídea anterior e ramos da ACM e ACP.','');
M('hipocampo','Hipocampo','limbic','#7a5cc2','Formação hipocampal no assoalho do corno inferior. Memória declarativa. Eferências pelo fórnix.','ACP (ramos hipocampais) e coroídea anterior.','Lesão bilateral: amnésia anterógrada. Atrofia precoce na doença de Alzheimer.');
M('fornice','Fórnix','limbic','#b7a3ec','Principal eferência do hipocampo: fímbria, pilares (pernas), corpo e colunas até os corpos mamilares (circuito de Papez). A comissura do fórnix liga os dois hipocampos.','ACA e ACP; coroídeas.','');
M('mamilar','Corpos mamilares','limbic','#d46f9b','Porção posterior do hipotálamo. Recebem o fórnix e projetam ao núcleo anterior do tálamo pelo trato mamilotalâmico.','Ramos centrais do polígono de Willis.','Lesão: síndrome de Wernicke-Korsakoff.');
M('bulbolf','Bulbo e trato olfatórios','limbic','#e6b87d','Primeiro par craniano. Repousa na lâmina cribriforme. O trato divide-se em estrias olfatórias medial e lateral, delimitando o trígono olfatório e a substância perfurada anterior.','ACA.','');

/* ---- diencéfalo ---- */
M('talamo','Tálamo','dien','#e0707a','Maior parte do diencéfalo; parede lateral do III ventrículo. Relé sensorial (núcleos ventrais posteriores, geniculados), motor (VL e VA) e de associação (pulvinar, dorsomedial). Inclui o pulvinar.','ACP (talamoperfurantes e coroídea posterior); ventrolateral pela coroídea anterior.','AVE talâmico: dor persistente e demência talâmica.');
M('cgl','Corpo geniculado lateral','dien','#c9546e','Relé visual: recebe o trato óptico e projeta pela radiação óptica à área 17.','Coroídeas anterior e posterior.','');
M('cgm','Corpo geniculado medial','dien','#b04668','Relé auditivo: recebe do braço do colículo inferior e projeta ao giro temporal transverso (áreas 41 e 42).','Coroídea posterior.','');
M('hipotal','Hipotálamo','dien','#f08f76','Abaixo do sulco hipotalâmico. Controle do SNA (anterior: parassimpático; posterior: simpático), endócrino, temperatura, fome e sede. Núcleos supraóptico e paraventricular produzem vasopressina e ocitocina.','Ramos centrais do polígono de Willis.','');
M('subtal','Núcleo subtalâmico','dien','#d9a0a8','Abaixo do tálamo. Recebe do globo pálido externo e projeta ao interno (via indireta, excitatório).','Coroídea posterior e ramos centrais.','Lesão: hemibalismo contralateral.');
M('pineal','Glândula pineal','dien','#9a6b4e','Epitálamo; secreta melatonina (ritmos circadianos). Calcifica com a idade, sendo marco radiológico.','Coroídea posterior medial.','');
M('hipofise','Hipófise','dien','#e8a05a','Na sela turca. Adeno-hipófise (GH, TSH, ACTH, FSH, LH, prolactina) e neuro-hipófise, que libera vasopressina e ocitocina produzidas no hipotálamo.','Artérias hipofisárias superiores e inferiores.','Adenoma comprime o quiasma: hemianopsia bitemporal.');
M('quiasma','Quiasma e vias ópticas','dien','#f2d36b','Fibras nasais da retina cruzam no quiasma. O trato óptico segue ao corpo geniculado lateral. O quiasma faz parte do assoalho do III ventrículo.','Ramos do polígono de Willis; coroídea anterior (trato).','Lesão do quiasma: hemianopsia bitemporal.');

/* ---- tronco e cerebelo ---- */
M('mesenc','Mesencéfalo','stem','#c98a52','Tecto (colículos), tegmento e pedúnculos cerebrais. Contém núcleos dos pares III e IV, substância negra e núcleo rubro. Atravessado pelo aqueduto.','ACP, cerebelar superior e ramos paramedianos da basilar.','');
M('ponte','Ponte','stem','#b9763f','Base com núcleos pontinos e fibras corticopontinas. Tegmento com núcleos dos pares V a VIII. Liga-se ao cerebelo pelo pedúnculo cerebelar médio.','Basilar (ramos pontinos) e AICA.','');
M('bulbo','Bulbo','stem','#a8683a','Continua-se com a medula. Pirâmides, olivas e núcleos dos pares IX a XII. Centros respiratório e cardiovascular.','Vertebrais, espinal anterior e PICA.','Síndrome de Wallenberg (PICA).');
M('pedunc','Pedúnculos cerebrais','stem','#d49b65','Base do pedúnculo: fibras corticospinais e corticopontinas. Entre eles, a fossa interpeduncular e a substância perfurada posterior.','ACP e coroídea anterior.','');
M('colsup','Colículos superiores','stem','#e0b184','Via visual: reflexos oculomotores e orientação visual. Associam-se às áreas pré-tetais.','ACP e cerebelar superior.','');
M('colinf','Colículos inferiores','stem','#cf9a6b','Via auditiva: relé para o corpo geniculado medial.','Cerebelar superior.','');
M('snegra','Substância negra','stem','#4b3a35','Parte compacta dopaminérgica que projeta ao estriado; parte reticulada.','ACP e coroídea posterior.','Degeneração: doença de Parkinson.');
M('rubro','Núcleo rubro','stem','#c0392b','No tegmento do mesencéfalo. Recebe do cerebelo e do córtex motor e origina o trato rubroespinal.','ACP e cerebelar superior.','');
M('cerebelo','Hemisférios cerebelares','stem','#d9b38c','Zona lateral (cerebrocerebelo): planejamento e coordenação do movimento voluntário fino, do mesmo lado.','Cerebelares superior, inferior anterior e inferior posterior.','Lesão: ataxia e dismetria ipsilaterais.');
M('vermis','Vérmis do cerebelo','stem','#c79c72','Zona medial: controla a musculatura axial, a postura e o equilíbrio.','Cerebelares superior e PICA.','');
M('denteado','Núcleo denteado','stem','#8a5a3b','Maior núcleo do cerebelo, na zona lateral. Projeta pelo pedúnculo cerebelar superior ao núcleo VL do tálamo.','Cerebelares.','');
M('emboliforme','Núcleo emboliforme','stem','#6e8a3b','Zona intermédia. Projeta ao núcleo rubro.','Cerebelares.','');
M('globoso','Núcleo globoso','stem','#8a6e3b','Zona intermédia. Projeta ao núcleo rubro.','Cerebelares.','');
M('fastigial','Núcleo fastigial','stem','#3b6e8a','Zona medial. Projeta aos núcleos vestibulares e à formação reticular. Ordem de lateral para medial: denteado, emboliforme, globoso, fastigial.','Cerebelares.','');

/* ---- cerebelo: lobos, lóbulos, fissuras e pedúnculos (Machado, 4ª ed., cap. 5, p. 47-49) ---- */
const CB_GERAL = 'Os lóbulos do cerebelo recebem nomes diferentes no verme e nos hemisférios; a cada lóbulo do verme correspondem dois nos hemisférios. São ao todo 17 lóbulos e oito fissuras, mas a maioria não tem, isoladamente, importância funcional ou clínica e não precisa ser memorizada. Os que devem ser identificados nas peças são o nódulo, o flóculo e a tonsila, e as fissuras posterolateral e prima.';
M('cb_ant', 'Lobo anterior do cerebelo', 'stem', '#e3a86e', 'Parte do corpo do cerebelo à frente da fissura prima. A fissura posterolateral separa o lobo floculonodular do corpo do cerebelo, e a fissura prima divide o corpo do cerebelo em lobo anterior e lobo posterior. No verme: língula, lóbulo central e cúlmen; nos hemisférios: asa do lóbulo central e parte anterior do lóbulo quadrangular.', '', '');
M('cb_post', 'Lobo posterior do cerebelo', 'stem', '#cf8e80', 'Parte do corpo do cerebelo entre a fissura prima e a fissura posterolateral. No verme: declive, fólium, túber, pirâmide e úvula; nos hemisférios: parte posterior do lóbulo quadrangular, lóbulos semilunares superior e inferior, lóbulo biventre e tonsila.', '', '');
M('cb_fn', 'Lobo floculonodular', 'stem', '#9fb26f', 'Formado pelo nódulo e pelos flóculos, unidos pelos pedúnculos do flóculo. É separado do corpo do cerebelo pela fissura posterolateral. É importante por ser a parte do cerebelo responsável pela manutenção do equilíbrio. Na divisão funcional corresponde ao vestibulocerebelo, que tem conexões com o núcleo fastigial e com os núcleos vestibulares (cap. 22).', '', 'Tumores do teto do IV ventrículo comprimem o nódulo e o pedúnculo do flóculo: perda do equilíbrio com ataxia de tronco e nistagmo, sem alteração do tônus (cap. 22, p. 213).');
const CBL = [
  ['cb_lingula', 'Língula', '#e9b886', 'Lóbulo do verme, o mais anterior, apoiado sobre o véu medular superior (figura 5.5).'],
  ['cb_central', 'Lóbulo central', '#d99a5e', 'Lóbulo do verme entre as fissuras pré-central e pré-culminar. No hemisfério corresponde à asa do lóbulo central.'],
  ['cb_culmen', 'Cúlmen', '#ebb57a', 'Lóbulo do verme entre a fissura pré-culminar e a fissura prima; é o último lóbulo do lobo anterior. No hemisfério corresponde à parte anterior do lóbulo quadrangular.'],
  ['cb_declive', 'Declive', '#c98577', 'Primeiro lóbulo do verme no lobo posterior, entre a fissura prima e a fissura pós-clival. No hemisfério corresponde à parte posterior do lóbulo quadrangular.'],
  ['cb_folium', 'Fólium', '#dba293', 'Lóbulo do verme entre a fissura pós-clival e a fissura horizontal. No hemisfério corresponde ao lóbulo semilunar superior.'],
  ['cb_tuber', 'Túber', '#c47a6c', 'Lóbulo do verme logo abaixo da fissura horizontal. No hemisfério corresponde ao lóbulo semilunar inferior.'],
  ['cb_piramide', 'Pirâmide do verme', '#d99c8c', 'Lóbulo do verme entre as fissuras pré-piramidal e pós-piramidal. No hemisfério corresponde ao lóbulo biventre.'],
  ['cb_uvula', 'Úvula', '#bd7466', 'Lóbulo do verme entre a fissura pós-piramidal e a fissura posterolateral. No hemisfério corresponde à tonsila.'],
  ['cb_nodulo', 'Nódulo', '#9fb26f', 'É o último lóbulo do verme e fica situado logo abaixo do teto do IV ventrículo (figura 5.5). Liga-se aos flóculos pelos pedúnculos do flóculo, formando o lobo floculonodular.'],
  ['cb_asa', 'Asa do lóbulo central', '#d99a5e', 'Lóbulo do hemisfério que corresponde ao lóbulo central do verme (figura 5.6).'],
  ['cb_quadant', 'Lóbulo quadrangular, parte anterior', '#ebb57a', 'Lóbulo do hemisfério à frente da fissura prima; corresponde ao cúlmen (figura 5.6).'],
  ['cb_quadpost', 'Lóbulo quadrangular, parte posterior', '#c98577', 'Lóbulo do hemisfério entre a fissura prima e a fissura pós-clival; corresponde ao declive (figura 5.6).'],
  ['cb_semisup', 'Lóbulo semilunar superior', '#dba293', 'Lóbulo do hemisfério acima da fissura horizontal, na face superior; corresponde ao fólium (figura 5.6).'],
  ['cb_semiinf', 'Lóbulo semilunar inferior', '#c47a6c', 'Lóbulo do hemisfério abaixo da fissura horizontal, na face inferior; corresponde ao túber (figuras 5.4 e 5.6).'],
  ['cb_biventre', 'Lóbulo biventre', '#d99c8c', 'Lóbulo da face inferior do hemisfério, entre o lóbulo semilunar inferior e a tonsila (figura 5.4).'],
  ['cb_tonsila', 'Tonsila do cerebelo', '#bd7466', 'Lóbulo do hemisfério bem evidente na face ventral do cerebelo, projetando-se medialmente sobre a face dorsal do bulbo (figura 5.4).'],
  ['cb_floculo', 'Flóculo', '#9fb26f', 'Lóbulo do hemisfério, alongado transversalmente e com folhas pequenas, situado logo atrás do pedúnculo cerebelar inferior. Liga-se ao nódulo pelo pedúnculo do flóculo, constituindo o lobo floculonodular.']];
CBL.forEach(q => M(q[0], q[1], 'stem', q[2], q[3] + ' ' + CB_GERAL, '', ''));
TXT('cb_tonsila', { c: 'Em certas situações as tonsilas podem ser deslocadas caudalmente, formando uma hérnia de tonsila que penetra no forame magno e comprime o bulbo, o que pode ser fatal (cap. 8, item 3.3.2).' });
TXT('cb_nodulo', { c: 'Tumores do teto do IV ventrículo comprimem o nódulo e o pedúnculo do flóculo: perda do equilíbrio, com ataxia de tronco; as crianças não conseguem se manter em pé. Há nistagmo (cap. 22, p. 213).' });
TXT('cb_floculo', { c: 'Os movimentos oculares de seguimento são controlados pelo flóculo. As lesões unilaterais, causadas principalmente por tumores do VIII nervo, dificultam esses movimentos para o lado da lesão (cap. 22, p. 213).' });
const CBF = [
  ['f_precent', 'Fissura pré-central', 'Separa a língula do lóbulo central (figura 5.5).'],
  ['f_preculm', 'Fissura pré-culminar', 'Separa o lóbulo central do cúlmen (figura 5.5).'],
  ['f_prima', 'Fissura prima', 'Divide o corpo do cerebelo em lobo anterior e lobo posterior. É uma das fissuras que devem ser identificadas nas peças.'],
  ['f_posclival', 'Fissura pós-clival', 'Separa o declive do fólium e, no hemisfério, a parte posterior do lóbulo quadrangular do lóbulo semilunar superior (figuras 5.5 e 5.6).'],
  ['f_horiz', 'Fissura horizontal', 'Separa o fólium do túber e, no hemisfério, os lóbulos semilunares superior e inferior (figuras 5.5 e 5.6).'],
  ['f_prepir', 'Fissura pré-piramidal', 'Separa o túber da pirâmide (figura 5.5).'],
  ['f_pospir', 'Fissura pós-piramidal', 'Separa a pirâmide da úvula (figura 5.5).'],
  ['f_postlat', 'Fissura posterolateral', 'Separa o lobo floculonodular do corpo do cerebelo. É uma das fissuras que devem ser identificadas nas peças.']];
CBF.forEach(q => M(q[0], q[1], 'stem', '#4a2f28', q[2], '', ''));
M('pcs', 'Pedúnculo cerebelar superior', 'stem', '#efe2d2', 'Liga o cerebelo ao mesencéfalo. Por ele passam as fibras do núcleo denteado para o tálamo do lado oposto (via dentotalamocortical) e entra o trato espinocerebelar anterior (cap. 22).', '', '');
M('pcm', 'Pedúnculo cerebelar médio', 'stem', '#e4d0bb', 'Enorme feixe de fibras que liga o cerebelo à ponte e constitui a parede dorsolateral da metade cranial do IV ventrículo. Considera-se como limite entre a ponte e o pedúnculo cerebelar médio o ponto de emergência do nervo trigêmeo. Por ele entram as fibras pontocerebelares, da via corticopontocerebelar (cap. 22).', '', '');
M('pci', 'Pedúnculo cerebelar inferior', 'stem', '#d8c0a6', 'Liga o cerebelo à medula. Por ele entram o trato espinocerebelar posterior e o fascículo vestibulocerebelar (cap. 22 e 29).', '', '');
M('arbvida', 'Secção sagital do verme: corpo medular e lóbulos', 'stem', '#ffffff', 'Na secção sagital mediana, o corpo medular do cerebelo, de substância branca, ramifica-se em lâminas que entram em cada lóbulo e em cada folha, cobertas pelo córtex cerebelar. Veem-se as fissuras, os lóbulos do verme da língula ao nódulo e, à frente, o IV ventrículo com o véu medular superior e o teto do nódulo (figura 5.5).', '', '');
REF(['cb_ant', 'cb_post', 'cb_fn', 'pcs', 'pcm', 'pci', 'arbvida'].concat(CBL.map(q => q[0]), CBF.map(q => q[0])), 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 5 (Tronco Encefálico e Cerebelo), p. 47-49, figuras 5.4 a 5.7; função: cap. 22, p. 208-213.');

/* ---- ramos dos nervos cranianos e gânglios (Machado, 4ª ed., cap. 10, p. 96-102; cap. 17, p. 151-154; cap. 8, p. 73) ---- */
const RAMOS = [
  ['g_trig', 'Gânglio trigeminal', '#d9a23a', 'Fica sobre a parte petrosa do osso temporal. Contém os neurônios sensitivos do trigêmeo: os prolongamentos centrais formam a raiz sensitiva e os periféricos formam os nervos oftálmico, maxilar e mandibular.'],
  ['n_oft', 'Nervo oftálmico (V1)', '#e3c044', 'Primeiro ramo do trigêmeo. Sai do crânio pela fissura orbital superior. Passa próximo à parede lateral do seio cavernoso, com os nervos troclear e oculomotor. Fibras aferentes somáticas gerais da fronte, da conjuntiva ocular e de parte da cavidade nasal.'],
  ['n_max', 'Nervo maxilar (V2)', '#e3c044', 'Segundo ramo do trigêmeo. Sai do crânio pelo forame redondo. Fibras aferentes somáticas gerais da pele da face, dos dentes superiores e de parte da cavidade nasal e bucal.'],
  ['n_mand', 'Nervo mandibular (V3)', '#e3c044', 'Terceiro ramo do trigêmeo. Sai do crânio pelo forame oval. É o único ramo misto: a raiz motora do trigêmeo acompanha-o e inerva os músculos mastigadores, o milo-hióideo e o ventre anterior do digástrico. Fibras sensitivas dos dois terços anteriores da língua e dos dentes inferiores.'],
  ['g_ciliar', 'Gânglio ciliar', '#d9a23a', 'Gânglio parassimpático. Recebe, pelo nervo oculomotor, fibras pré-ganglionares do núcleo de Edinger-Westphal; dele saem fibras pós-ganglionares para o músculo ciliar (acomodação) e para o músculo esfíncter da pupila.'],
  ['g_pterig', 'Gânglio pterigopalatino', '#d9a23a', 'Gânglio parassimpático. Recebe fibras pré-ganglionares do núcleo lacrimal, que saem pelo nervo intermédio e chegam pelos nervos petroso maior e do canal pterigóideo; dele saem fibras pós-ganglionares para a glândula lacrimal.'],
  ['n_petmaior', 'Nervo petroso maior e nervo do canal pterigóideo', '#e3c044', 'Levam ao gânglio pterigopalatino as fibras pré-ganglionares do núcleo lacrimal, que saem do tronco encefálico pelo nervo intermédio (VII).'],
  ['g_genic', 'Gânglio geniculado', '#d9a23a', 'Gânglio sensitivo do nervo facial, no joelho externo do canal facial. Contém os neurônios cujas fibras levam a gustação dos dois terços anteriores da língua.'],
  ['n_corda', 'Nervo corda do tímpano', '#e3c044', 'Ramo do nervo facial. Leva a gustação dos dois terços anteriores da língua e as fibras pré-ganglionares do núcleo salivatório superior, que ganham o nervo lingual e chegam ao gânglio submandibular.'],
  ['n_lingual', 'Nervo lingual', '#e3c044', 'Ramo do nervo mandibular (V3). Recebe o nervo corda do tímpano e leva suas fibras ao gânglio submandibular e à língua.'],
  ['g_submand', 'Gânglio submandibular', '#d9a23a', 'Gânglio parassimpático ligado ao nervo lingual. Recebe fibras pré-ganglionares do núcleo salivatório superior, pelo nervo intermédio e pela corda do tímpano; dele saem fibras pós-ganglionares para as glândulas submandibular e sublingual.'],
  ['n_timp', 'Nervo timpânico e nervo petroso menor', '#e3c044', 'Levam ao gânglio ótico as fibras pré-ganglionares do núcleo salivatório inferior, que saem pelo nervo glossofaríngeo.'],
  ['g_otico', 'Gânglio ótico', '#d9a23a', 'Gânglio parassimpático junto ao nervo mandibular, abaixo do forame oval. Recebe fibras pré-ganglionares do núcleo salivatório inferior pelos nervos timpânico e petroso menor; dele saem fibras pós-ganglionares para a parótida, pelo nervo auriculotemporal.'],
  ['n_auriculo', 'Nervo auriculotemporal', '#e3c044', 'Ramo do nervo mandibular (V3) que leva à parótida as fibras pós-ganglionares do gânglio ótico.'],
  ['g_ix', 'Gânglios superior e inferior do glossofaríngeo', '#d9a23a', 'Os dois gânglios sensitivos do nervo glossofaríngeo, junto ao forame jugular.'],
  ['g_x', 'Gânglios superior (jugular) e inferior (nodoso) do vago', '#d9a23a', 'Os dois gânglios sensitivos do nervo vago, junto ao forame jugular e logo abaixo dele.'],
  ['n_v1ramos', 'Ramos do nervo oftálmico: frontal, lacrimal e nasociliar', '#e8cd5c', 'Ramos em que o nervo oftálmico se divide na órbita: frontal (para a fronte), lacrimal (para a glândula lacrimal e a pálpebra) e nasociliar (para o bulbo ocular e a cavidade nasal).'],
  ['n_infraorb', 'Nervo infraorbital', '#e8cd5c', 'Continuação do nervo maxilar (V2), que corre no assoalho da órbita e chega à face pelo forame infraorbital.'],
  ['n_alvinf', 'Nervo alveolar inferior', '#e8cd5c', 'Ramo do nervo mandibular (V3) que entra no canal da mandíbula e inerva os dentes inferiores.'],
  ['n7_ramos', 'Ramos terminais do nervo facial', '#e8cd5c', 'Depois de sair pelo forame estilomastóideo, o nervo facial atravessa a parótida e se divide nos ramos para a musculatura mímica: temporais, zigomáticos, bucais, marginal da mandíbula e cervical.']];
RAMOS.forEach(q => M(q[0], q[1], 'nc', q[2], q[3], '', ''));
TXT('g_genic', { c: 'Lesão do nervo facial dentro do canal facial: paralisia facial periférica com perda da gustação nos dois terços anteriores da língua (cap. 19).' });
REF(['g_trig', 'n_oft', 'n_max', 'n_mand'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 10 (Nervos Cranianos), p. 98-99; seio cavernoso: cap. 8, p. 73.');
REF(['g_ciliar', 'g_pterig', 'n_petmaior', 'g_submand', 'n_timp', 'g_otico', 'n_auriculo', 'n_lingual', 'n_corda'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 17 (Núcleos dos Nervos Cranianos), p. 152-153; cap. 10, p. 99-100.');
REF(['g_genic', 'g_ix', 'g_x'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 10 (Nervos Cranianos), p. 99-101.');

/* ---- prosencéfalo e envoltórios (Machado, 4ª ed., cap. 7, p. 55-62; cap. 8, p. 69-71) ---- */
const SULCOS = [
  ['s_lateral', 'Sulco lateral (de Sylvius)', 'Inicia-se na base do cérebro como uma fenda profunda que separa o lobo frontal do temporal e dirige-se para a face lateral, onde termina dividindo-se em três ramos: ascendente, anterior e posterior. Os ramos ascendente e anterior são curtos e penetram no lobo frontal; o posterior é muito mais longo, dirige-se para trás e para cima e termina no lobo parietal. Separa o lobo temporal, abaixo, dos lobos frontal e parietal, acima. No seu fundo está a ínsula.', 'p. 55'],
  ['s_central', 'Sulco central (de Rolando)', 'Profundo e geralmente contínuo, percorre obliquamente a face superolateral do hemisfério, separando os lobos frontal e parietal. Inicia-se na face medial, aproximadamente no meio da borda dorsal, e dirige-se para diante e para baixo em direção ao ramo posterior do sulco lateral, do qual é separado por uma pequena prega cortical. É ladeado pelos giros pré-central (motricidade) e pós-central (sensibilidade).', 'p. 55'],
  ['s_precentral', 'Sulco pré-central', 'Mais ou menos paralelo ao sulco central e muitas vezes dividido em dois segmentos. Entre ele e o sulco central está o giro pré-central, onde se localiza a principal área motora do cérebro.', 'p. 57'],
  ['s_fronsup', 'Sulco frontal superior', 'Inicia-se geralmente na porção superior do sulco pré-central e tem direção aproximadamente perpendicular a ele. Acima dele está o giro frontal superior; abaixo, o giro frontal médio.', 'p. 57'],
  ['s_froninf', 'Sulco frontal inferior', 'Parte da porção inferior do sulco pré-central e dirige-se para frente e para baixo. Separa o giro frontal médio do giro frontal inferior.', 'p. 57'],
  ['s_tempsup', 'Sulco temporal superior', 'Inicia-se próximo ao polo temporal e dirige-se para trás, paralelamente ao ramo posterior do sulco lateral, terminando no lobo parietal. Entre ele e o sulco lateral está o giro temporal superior. O giro angular curva-se em torno da sua porção terminal e ascendente.', 'p. 59'],
  ['s_tempinf', 'Sulco temporal inferior', 'Paralelo ao sulco temporal superior; em geral é formado por duas ou mais partes descontínuas. Separa o giro temporal médio do giro temporal inferior.', 'p. 59'],
  ['s_poscentral', 'Sulco pós-central', 'Quase paralelo ao sulco central, é frequentemente dividido em dois segmentos, que podem estar mais ou menos distantes um do outro. Entre ele e o sulco central fica o giro pós-central, sede da área somestésica.', 'p. 59'],
  ['s_intrapar', 'Sulco intraparietal', 'Muito variável e geralmente perpendicular ao pós-central, com o qual pode estar unido; estende-se para trás para terminar no lobo occipital. Separa o lóbulo parietal superior do lóbulo parietal inferior, onde estão os giros supramarginal e angular.', 'p. 59'],
  ['s_calcarino', 'Sulco calcarino', 'Inicia-se abaixo do esplênio do corpo caloso e tem trajeto arqueado em direção ao polo occipital. Nos seus lábios localiza-se a área visual, também chamada área estriada, porque o córtex apresenta uma estria branca visível a olho nu, a estria de Gennari.', 'p. 62'],
  ['s_parocc', 'Sulco parietoccipital', 'Muito profundo, separa o lobo occipital do parietal e encontra, em ângulo agudo, o sulco calcarino. Entre os dois fica o cúneo.', 'p. 62'],
  ['s_corpcal', 'Sulco do corpo caloso', 'Começa abaixo do rostro do corpo caloso, contorna o tronco e o esplênio e continua, já no lobo temporal, com o sulco do hipocampo.', 'p. 62'],
  ['s_cingulo', 'Sulco do cíngulo', 'Tem curso paralelo ao sulco do corpo caloso, do qual é separado pelo giro do cíngulo. Termina posteriormente dividindo-se em dois ramos: o ramo marginal, que se curva em direção à margem superior do hemisfério, e o sulco subparietal.', 'p. 62'],
  ['s_marginal', 'Ramo marginal do sulco do cíngulo', 'Ramo terminal do sulco do cíngulo que se curva em direção à margem superior do hemisfério. Com o sulco paracentral, delimita o lóbulo paracentral.', 'p. 62'],
  ['s_subpar', 'Sulco subparietal', 'Ramo terminal do sulco do cíngulo que continua posteriormente na direção dele, abaixo do pré-cúneo.', 'p. 62'],
  ['s_paracent', 'Sulco paracentral', 'Destaca-se quase sempre do sulco do cíngulo em direção à margem superior do hemisfério; com o sulco do cíngulo e o ramo marginal, delimita o lóbulo paracentral, onde ficam as áreas motora e sensitiva da perna e do pé.', 'p. 62'],
  ['s_colateral', 'Sulco colateral', 'Inicia-se próximo ao polo occipital e dirige-se para a frente entre o sulco calcarino e o sulco do hipocampo, delimitando com eles o giro occipitotemporal medial (lingual) e o giro para-hipocampal. Pode ser contínuo com o sulco rinal, que separa a parte mais anterior do giro para-hipocampal do restante do lobo temporal.', 'p. 62'],
  ['s_occtemp', 'Sulco occipitotemporal', 'Na face inferior do lobo temporal, limita-se com o sulco temporal inferior pelo giro temporal inferior e, medialmente, com o sulco colateral pelo giro occipitotemporal lateral (fusiforme).', 'p. 62'],
  ['s_olfat', 'Sulco olfatório', 'Único sulco importante da face inferior do lobo frontal, profundo e de direção anteroposterior. Medialmente a ele situa-se o giro reto. Aloja o bulbo e o trato olfatório.', 'p. 62']];
SULCOS.forEach(q => { M(q[0], q[1], 'cortex', '#3a2a24', q[2], '', ''); META[q[0]].ref = 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7 (Telencéfalo), ' + q[3] + ', figuras 7.1, 7.4 a 7.8.'; });
M('cc_rostro', 'Rostro do corpo caloso', 'deep', '#efe6dc', 'O joelho afila-se para formar o rostro do corpo caloso, que termina na comissura anterior. Abaixo do rostro e adiante da lâmina terminal fica a área septal.', '', '');
M('cc_joelho', 'Joelho do corpo caloso', 'deep', '#efe6dc', 'O corpo caloso flete-se anteriormente, em direção à base do cérebro, para constituir o joelho. Em corte sagital, é a parte anterior da lâmina branca arqueada.', '', '');
M('cc_tronco', 'Tronco do corpo caloso', 'deep', '#efe6dc', 'Em corte sagital do cérebro, aparece como uma lâmina branca arqueada dorsalmente. O corpo caloso é a maior das comissuras inter-hemisféricas: grande número de fibras mielínicas que cruzam o plano mediano e penetram de cada lado no centro branco medular, unindo áreas simétricas do córtex.', '', '');
M('cc_esplenio', 'Esplênio do corpo caloso', 'deep', '#efe6dc', 'Dilatação posterior do tronco do corpo caloso. Abaixo dele emerge o fórnice e começa o sulco calcarino.', '', '');
M('septo', 'Septo pelúcido', 'deep', '#e9ddd2', 'Entre o corpo caloso e o fórnice estende-se o septo pelúcido, constituído por duas delgadas lâminas de tecido nervoso. Ele separa os dois ventrículos laterais (figuras 7.1 e 7.3).', '', '');
M('aderencia', 'Aderência intertalâmica', 'dien', '#e88a92', 'Ponte de substância cinzenta que, atravessando o III ventrículo, une os dois tálamos (figura 7.1).', '', '');
M('unco', 'Unco', 'limbic', '#a988d9', 'A porção anterior do giro para-hipocampal curva-se em torno do sulco do hipocampo para formar o unco. Unco, giro para-hipocampal, istmo do giro do cíngulo e giro do cíngulo formam uma formação contínua que circunda as estruturas inter-hemisféricas, considerada por muitos um lobo independente, o lobo límbico.', '', '');
M('fimbria', 'Fímbria do hipocampo', 'limbic', '#cdb8ef', 'Feixe de fibras na margem medial do hipocampo que continua com a perna do fórnice. As pernas do fórnice divergem e penetram de cada lado no corno inferior do ventrículo lateral, onde se ligam ao hipocampo.', '', '');
M('giroden', 'Giro denteado', 'limbic', '#9b7ccf', 'Faixa estreita de córtex entre a fímbria e o giro para-hipocampal, na face medial do hipocampo (figura 7.3).', '', '');
M('vlat_ant', 'Corno anterior do ventrículo lateral', 'vent', '#6cc3d6', 'Parte do ventrículo lateral adiante do forame interventricular, no lobo frontal. Medialmente é separado do corno do outro lado pelo septo pelúcido; lateralmente está a cabeça do núcleo caudado (figuras 7.2 e 7.3).', '', '');
M('vlat_cent', 'Parte central do ventrículo lateral', 'vent', '#6cc3d6', 'Corpo do ventrículo lateral, sob o tronco do corpo caloso; comunica-se com o III ventrículo pelo forame interventricular. No assoalho estão o tálamo, a estria terminal com a veia talamoestriada e o plexo corioide (figuras 7.2 e 7.3).', '', '');
M('vlat_post', 'Corno posterior do ventrículo lateral', 'vent', '#6cc3d6', 'Prolongamento do ventrículo lateral no lobo occipital. Na sua parede medial fazem saliência o bulbo do corno posterior e o calcar avis; o trígono colateral fica na transição para o corno inferior (figuras 7.2 e 7.3).', '', '');
M('vlat_inf', 'Corno inferior do ventrículo lateral', 'vent', '#6cc3d6', 'Prolongamento do ventrículo lateral no lobo temporal. No seu assoalho está o hipocampo, com a fímbria, e a eminência colateral; nele penetram as pernas do fórnice (figuras 7.2 e 7.3).', '', '');
M('foice', 'Foice do cérebro', 'men', '#bfae96', 'Septo vertical mediano em forma de foice, prega do folheto interno da dura-máter, que ocupa a fissura longitudinal do cérebro, separando os dois hemisférios cerebrais. Na sua margem de inserção corre o seio sagital superior; na margem livre, o seio sagital inferior; na união com o tentório, o seio reto.', '', '');
M('tentorio', 'Tentório do cerebelo', 'men', '#b3a28a', 'Projeta-se para diante como um septo transversal entre os lobos occipitais e o cerebelo. Separa a fossa posterior da fossa média do crânio, dividindo a cavidade craniana em um compartimento superior (supratentorial) e outro inferior (infratentorial). A borda anterior livre, a incisura do tentório, ajusta-se ao mesencéfalo.', '', 'A sintomatologia das afecções supratentoriais, sobretudo tumores, é muito diferente da das infratentoriais. A incisura do tentório pode, em certas circunstâncias, lesar o mesencéfalo e os nervos troclear e oculomotor, que nele se originam.');
M('foicecb', 'Foice do cerebelo', 'men', '#bfae96', 'Pequeno septo vertical mediano, situado abaixo do tentório do cerebelo, entre os dois hemisférios cerebelares. Ao longo da sua margem de inserção corre o seio occipital.', '', '');
M('diafragma', 'Diafragma da sela', 'men', '#c9b89e', 'Pequena lâmina horizontal que fecha superiormente a sela turca, deixando apenas um pequeno orifício para a passagem da haste hipofisária.', '', 'Quando se retira o encéfalo de um cadáver, a haste geralmente se rompe e a hipófise fica na sela turca. O diafragma isola e protege a hipófise, mas dificulta consideravelmente a cirurgia dessa glândula.');
M('medula', 'Medula espinal (parte cervical)', 'stem', '#d8b48c', 'Continua caudalmente o bulbo. Não há linha de demarcação nítida entre os dois: considera-se que o limite está num plano horizontal logo acima do filamento radicular mais cranial do 1º nervo cervical, o que corresponde ao nível do forame magno. Os sulcos e funículos do bulbo continuam os da medula.', '', '');
REF(['cc_rostro', 'cc_joelho', 'cc_tronco', 'cc_esplenio', 'septo'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7 (Telencéfalo), p. 61-62, figura 7.1.');
REF(['unco'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7, p. 62, figura 7.7.');
REF(['fimbria', 'giroden', 'vlat_ant', 'vlat_cent', 'vlat_post', 'vlat_inf'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7, p. 55-62, figuras 7.2 e 7.3.');
REF(['aderencia'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7, figura 7.1.');
REF(['foice', 'tentorio', 'foicecb', 'diafragma'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 8 (Meninges e Liquor), p. 69-71, figuras 8.2 e 8.3.');
REF(['medula'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 5, p. 43.');

/* ---- vascularização ampliada (Machado, 4ª ed., cap. 8, p. 72-73; cap. 18, p. 162-169) ---- */
const SVP = 'Pertence ao sistema venoso profundo, que drena corpo estriado, cápsula interna, diencéfalo e grande parte do centro branco medular do cérebro; quase todo o seu sangue converge para a veia cerebral magna (cap. 18, p. 168).';
const VFP = 'Veia da fossa posterior: drena o tronco encefálico ou o cerebelo para os seios da dura-máter vizinhos. As veias do encéfalo, de modo geral, não acompanham as artérias e são maiores e mais calibrosas que elas (cap. 18, p. 168).';
const NOVOS_VASOS = [
  ['a_espost', 'Artérias espinais posteriores', 'art', '#d2453a', 'As artérias espinais posteriores direita e esquerda emergem das artérias vertebrais correspondentes, dirigem-se dorsalmente contornando o bulbo e, em seguida, percorrem em sentido longitudinal a medula, medialmente aos filamentos radiculares das raízes dorsais dos nervos espinais. Vascularizam a coluna e o funículo posterior da medula.'],
  ['a_hipof', 'Artéria hipofisária', 'art', '#e36b5c', 'Ramo da artéria carótida interna para a hipófise, mostrado na figura 18.3 (artérias da base do encéfalo).'],
  ['centrais_am', 'Ramos centrais da cerebral anterior e da comunicante anterior', 'art', '#ef7d6d', 'Os ramos centrais emergem da porção proximal de cada uma das artérias cerebrais e das artérias comunicantes, penetram perpendicularmente na base do cérebro e vascularizam o diencéfalo, os núcleos da base e a cápsula interna. Quando se retira a pia-máter, permanecem os orifícios de penetração desses ramos: daí a denominação substância perfurada, anterior e posterior. Há anastomoses entre eles, mas escassas: comportam-se, sob o aspecto funcional, como artérias terminais.'],
  ['centrais_pl', 'Ramos centrais da cerebral posterior (pós-comunicante)', 'art', '#ef7d6d', 'Ramos centrais que emergem da porção proximal da artéria cerebral posterior e penetram perpendicularmente na base do cérebro para o diencéfalo. Os ramos centrais emergem da porção proximal de cada uma das artérias cerebrais e das comunicantes e comportam-se funcionalmente como artérias terminais.'],
  ['a_polfront', 'Artéria polar frontal', 'art', '#e05d4a', 'Ramo cortical da artéria cerebral anterior para o polo frontal, na face medial. A ACA irriga a face medial do cérebro até o sulco parietoccipital e a faixa de cima da face lateral (cap. 18).'],
  ['a_frontmed', 'Ramos frontais internos da ACA', 'art', '#e66a52', 'Ramos corticais que sobem pela face medial do giro frontal superior. A ACA irriga a face medial do cérebro até o sulco parietoccipital, inclusive a parte das áreas motora e sensitiva que corresponde à perna (cap. 18).'],
  ['a_prefront', 'Artéria pré-frontal (ACM)', 'art', '#e8704f', 'Ramo cortical da artéria cerebral média que sobe do sulco lateral para a parte anterior do lobo frontal. A ACM irriga a maior parte da face lateral do hemisfério (cap. 18).'],
  ['a_tempant', 'Ramo temporal anterior (ACM)', 'art', '#e87056', 'Ramo cortical da ACM que desce do sulco lateral sobre a parte anterior do lobo temporal.'],
  ['a_tempmed', 'Ramo temporal médio (ACM)', 'art', '#e87056', 'Ramo cortical da ACM que desce do sulco lateral sobre a parte média do lobo temporal.'],
  ['a_temppost', 'Ramo temporal posterior (ACM)', 'art', '#e87056', 'Ramo cortical da ACM que desce do sulco lateral sobre a parte posterior do lobo temporal.'],
  ['vinf', 'Veias cerebrais superficiais inferiores', 'ven', '#3c6ad6', 'Provêm da metade inferior da face lateral de cada hemisfério e de sua face inferior, terminando nos seios da base (petroso superior e cavernoso) e no seio transverso. A principal delas é a veia cerebral média superficial, que percorre o sulco lateral.'],
  ['sesfpar', 'Seio esfenoparietal', 'ven', '#3a68d0', 'Percorre a face interior da pequena asa do esfenoide e desemboca no seio cavernoso.'],
  ['plexbas', 'Plexo basilar', 'ven', '#3561c4', 'Ímpar, ocupa a porção basilar do occipital. Comunica-se com os seios petroso inferior e cavernoso, liga-se ao plexo do forame occipital e, por meio deste, ao plexo venoso vertebral interno.'],
  ['v_talest', 'Veia talamoestriada superior', 'ven', '#4a78e0', 'Corre no sulco entre o núcleo caudado e o tálamo, junto da estria terminal (figura 5.2), até o forame interventricular, onde se une às veias do septo pelúcido e corioide para formar a veia cerebral interna. ' + SVP],
  ['v_coroid', 'Veia corioide superior', 'ven', '#4a78e0', 'Acompanha o plexo corioide do ventrículo lateral até o forame interventricular e se junta à veia cerebral interna. ' + SVP],
  ['v_septo', 'Veia anterior do septo pelúcido', 'ven', '#4a78e0', 'Corre sobre o septo pelúcido, do corno frontal do ventrículo lateral até o forame interventricular, e se junta à veia cerebral interna. ' + SVP],
  ['v_profmed', 'Veia cerebral média profunda', 'ven', '#4471dc', 'Drena a ínsula e corre na profundidade do sulco lateral até a substância perfurada anterior, onde ajuda a formar a veia basal. ' + SVP],
  ['v_cerant', 'Veias cerebrais anteriores', 'ven', '#4471dc', 'Acompanham a artéria cerebral anterior na base do cérebro e se juntam à veia cerebral média profunda para formar a veia basal. ' + SVP],
  ['v_comunpost', 'Veia comunicante posterior', 'ven', '#4471dc', 'Une as duas veias basais através da fossa interpeduncular.'],
  ['v_pontomes', 'Veia pontomesencefálica', 'ven', '#3d6bd8', 'Corre na face anterior do mesencéfalo e da parte alta da ponte e liga as veias da ponte à veia basal. ' + VFP],
  ['v_amponte', 'Veia anteromediana da ponte', 'ven', '#3d6bd8', 'Corre longitudinalmente na face ventral da ponte, perto do sulco basilar. ' + VFP],
  ['v_alponte', 'Veia anterolateral da ponte', 'ven', '#3d6bd8', 'Corre longitudinalmente na parte lateral da face ventral da ponte. ' + VFP],
  ['v_ambulbo', 'Veia anteromediana do bulbo', 'ven', '#3d6bd8', 'Corre ao longo da fissura mediana anterior do bulbo e continua para baixo com as veias da medula. ' + VFP],
  ['v_recesso', 'Veia do recesso lateral do IV ventrículo', 'ven', '#3d6bd8', 'Sai do recesso lateral do IV ventrículo, perto do flóculo, em direção ao ângulo pontocerebelar. ' + VFP],
  ['v_vermsup', 'Veia superior do verme', 'ven', '#3a66d2', 'Corre sobre a face superior do verme, de trás para a frente, e drena para a veia cerebral magna. ' + VFP],
  ['v_verminf', 'Veia inferior do verme', 'ven', '#3a66d2', 'Corre sobre a face inferior do verme e drena para o seio reto ou para a confluência dos seios. ' + VFP],
  ['v_cerebsup', 'Veias cerebelares superiores', 'ven', '#3a66d2', 'Drenam a face superior dos hemisférios cerebelares para o seio transverso. ' + VFP],
  ['v_cerebinf', 'Veias cerebelares inferiores', 'ven', '#3a66d2', 'Drenam a face inferior dos hemisférios cerebelares para os seios transverso e sigmoide. ' + VFP]];
NOVOS_VASOS.forEach(q => M(q[0], q[1], q[2], q[3], q[4], '', ''));
TXT('a_espost', { c: 'Vascularizam a coluna e o funículo posterior da medula (cap. 18, p. 169).' });
TXT('sesfpar', { c: '' });
REF(['a_espost'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18 (Vascularização do SNC), p. 163 e 168-169.');
REF(['a_hipof'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18, figura 18.3 (p. 162).');
REF(['centrais_am', 'centrais_pl'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18, p. 162-163.');
REF(['vinf'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18, p. 168.');
REF(['sesfpar', 'plexbas'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 8 (Meninges e Liquor), p. 73.');

/* ---- tronco encefálico: acidentes da superfície (Machado, 4ª ed., cap. 5, p. 43-46, figuras 5.1 e 5.2) ---- */
const TE_ITENS = [
  // bulbo, face ventral e lateral
  ['fismedant', 'Fissura mediana anterior', '#5b3a26', 'Na área ventral do bulbo observa-se a fissura mediana anterior; de cada lado dela fica a pirâmide. Na parte caudal do bulbo ela é obliterada pela decussação das pirâmides. Os sulcos do bulbo continuam os sulcos da medula e delimitam as áreas anterior, lateral e posterior, que aparecem como continuação dos funículos da medula.'],
  ['piramide', 'Pirâmide do bulbo', '#d99a68', 'Eminência alongada de cada lado da fissura mediana anterior, formada por um feixe compacto de fibras nervosas descendentes que ligam as áreas motoras do cérebro aos neurônios motores da medula: o trato corticospinal.'],
  ['decpir', 'Decussação das pirâmides', '#c27f52', 'Na parte caudal do bulbo, fibras do trato corticospinal cruzam obliquamente o plano mediano em feixes interdigitados, que obliteram a fissura mediana anterior.'],
  ['sulantlat', 'Sulco lateral anterior do bulbo', '#5b3a26', 'Limita lateralmente a pirâmide. Dele emergem, ventralmente à oliva, os filamentos radiculares do nervo hipoglosso (XII).'],
  ['oliva', 'Oliva', '#e8b070', 'Eminência oval na área lateral do bulbo, entre os sulcos lateral anterior e lateral posterior, formada por uma grande massa de substância cinzenta, o núcleo olivar inferior, situado logo abaixo da superfície.'],
  ['sulpostlat', 'Sulco lateral posterior do bulbo', '#5b3a26', 'Limita a área lateral do bulbo dorsalmente. Dele emergem os filamentos radiculares que se unem para formar os nervos glossofaríngeo (IX) e vago (X), além dos que constituem a raiz craniana do nervo acessório (XI).'],
  ['sulbp', 'Sulco bulbopontino', '#5b3a26', 'Sulco horizontal visível no contorno ventral, limite superior do bulbo, que corresponde à margem inferior da ponte. Dele emergem de cada lado, a partir da linha mediana, o VI, o VII e o VIII pares cranianos. O VI emerge entre a ponte e a pirâmide; o VIII lateralmente, próximo do flóculo; o VII medialmente ao VIII, e entre os dois o nervo intermédio.'],
  // ponte
  ['baseponte', 'Base da ponte', '#c4864e', 'Parte ventral da ponte, que repousa sobre a parte basilar do osso occipital e o dorso da sela turca. Apresenta estriação transversal pelos numerosos feixes de fibras transversais que a percorrem; essas fibras convergem de cada lado para formar o pedúnculo cerebelar médio. No limite entre a ponte e o pedúnculo cerebelar médio emerge o nervo trigêmeo (V), por uma raiz sensitiva maior e uma raiz motora menor.'],
  ['sulbas', 'Sulco basilar', '#5b3a26', 'Sulco que percorre longitudinalmente a superfície ventral da ponte e aloja a artéria basilar.'],
  // mesencéfalo
  ['fossaip', 'Fossa interpeduncular', '#8f5a35', 'Depressão entre os dois pedúnculos cerebrais, na face ventral do mesencéfalo (figura 5.1).'],
  ['sulmedped', 'Sulco medial do pedúnculo cerebral', '#5b3a26', 'Com o sulco lateral do mesencéfalo, marca na superfície o limite entre a base e o tegmento do pedúnculo cerebral, correspondendo à substância negra. Dele emerge o nervo oculomotor (III).'],
  ['sullatmes', 'Sulco lateral do mesencéfalo', '#5b3a26', 'Com o sulco medial do pedúnculo cerebral, marca na superfície o limite entre a base e o tegmento do pedúnculo, correspondendo à substância negra.'],
  // assoalho do IV ventrículo
  ['fossarom', 'Assoalho do IV ventrículo (fossa romboide)', '#c79b80', 'Tem forma losângica e é formado pela parte dorsal da ponte e pela porção aberta do bulbo. Limita-se inferolateralmente pelos pedúnculos cerebelares inferiores e pelos tubérculos dos núcleos grácil e cuneiforme e, na porção superolateral, pelos pedúnculos cerebelares superiores, que saem de cada hemisfério cerebelar e convergem para penetrar no mesencéfalo.'],
  ['sulmedfr', 'Sulco mediano do IV ventrículo', '#5b3a26', 'Percorre o assoalho do IV ventrículo em toda a sua extensão.'],
  ['eminmed', 'Eminência medial', '#e3ae8a', 'Eminência de cada lado do sulco mediano do assoalho do IV ventrículo, limitada lateralmente pelo sulco limitante. Na parte caudal está o trígono do nervo hipoglosso.'],
  ['colfac', 'Colículo facial', '#f2c096', 'Bem no meio do assoalho do IV ventrículo, a eminência medial dilata-se para constituir, de cada lado, uma elevação arredondada, o colículo facial, formado por fibras do nervo facial que, nesse nível, contornam o núcleo do nervo abducente.'],
  ['sullim', 'Sulco limitante', '#5b3a26', 'Limita lateralmente a eminência medial. Separa os núcleos motores, derivados da lâmina basal e situados medialmente, dos núcleos sensitivos, derivados da lâmina alar e localizados lateralmente. Alarga-se para formar as fóveas superior e inferior.'],
  ['fovsup', 'Fóvea superior', '#8a6450', 'Depressão formada pelo alargamento do sulco limitante na metade cranial do IV ventrículo.'],
  ['fovinf', 'Fóvea inferior', '#8a6450', 'Depressão formada pelo alargamento do sulco limitante na metade caudal do IV ventrículo.'],
  ['locus', 'Locus ceruleus', '#4f6488', 'Área de coloração um pouco escura que se estende da fóvea superior em direção ao aqueduto cerebral, lateralmente à eminência medial. Ali estão os neurônios mais ricos em noradrenalina do encéfalo.'],
  ['areavest', 'Área vestibular', '#b88d6b', 'Grande área triangular lateral ao sulco limitante, que se estende de cada lado em direção aos recessos laterais; corresponde aos núcleos vestibulares do nervo vestibulococlear.'],
  ['estrias', 'Estrias medulares do IV ventrículo', '#f5e8d8', 'Finas cordas de fibras nervosas que, frequentemente, cruzam transversalmente a área vestibular para se perderem no sulco mediano.'],
  ['trighipo', 'Trígono do nervo hipoglosso', '#ebb28a', 'Pequena área triangular de vértice inferior na parte caudal da eminência medial, correspondente ao núcleo do nervo hipoglosso.'],
  ['trigvago', 'Trígono do nervo vago', '#a3968c', 'Área triangular de coloração ligeiramente acinzentada, lateral ao trígono do hipoglosso e na porção caudal quanto à fóvea inferior; corresponde ao núcleo dorsal do vago. Lateralmente, uma estreita crista oblíqua, o funículo separans, separa-o da área postrema.'],
  ['areapostrema', 'Área postrema', '#b4887a', 'Região do assoalho do IV ventrículo separada do trígono do vago pelo funículo separans; relaciona-se com o mecanismo do vômito desencadeado por estímulos químicos.'],
  ['obex', 'Óbex', '#7a5040', 'Ângulo caudal do assoalho do IV ventrículo (figura 5.2). Abaixo dele, na porção fechada do bulbo, o ventrículo continua com o estreito canal que prolonga o canal central da medula.'],
  // bulbo, face dorsal
  ['sulmedpost', 'Sulco mediano posterior do bulbo', '#5b3a26', 'Termina a meia altura do bulbo, em virtude do afastamento de seus lábios, que contribuem para a formação dos limites laterais do IV ventrículo.'],
  ['sulintpost', 'Sulco intermédio posterior', '#5b3a26', 'Divide a área posterior do bulbo, continuação do funículo posterior da medula, em fascículo grácil (medial) e fascículo cuneiforme (lateral).'],
  ['fgrac', 'Fascículo grácil', '#d49a6c', 'Parte medial da área posterior do bulbo. Formado por fibras nervosas ascendentes, provenientes da medula, que terminam no núcleo grácil.'],
  ['fcun', 'Fascículo cuneiforme', '#c48c60', 'Parte lateral da área posterior do bulbo. Formado por fibras nervosas ascendentes, provenientes da medula, que terminam no núcleo cuneiforme.'],
  ['tubgrac', 'Tubérculo do núcleo grácil', '#e6ae7c', 'Eminência determinada pelo núcleo grácil, na parte mais cranial do fascículo grácil, medialmente. Com o aparecimento do IV ventrículo, os tubérculos grácil e cuneiforme se afastam lateralmente como os ramos de um V e continuam para cima com o pedúnculo cerebelar inferior.'],
  ['tubcun', 'Tubérculo do núcleo cuneiforme', '#d9a171', 'Eminência determinada pelo núcleo cuneiforme, na parte mais cranial do fascículo cuneiforme, lateralmente ao tubérculo do núcleo grácil.']];
TE_ITENS.forEach(q => M(q[0], q[1], 'stem', q[2], q[3], '', ''));
TXT('piramide', { c: 'Lesão da base do bulbo (pirâmide): hemiparesia do lado oposto, porque o trato corticospinal cruza abaixo desse nível; somam-se sinais do hipoglosso do mesmo lado (cap. 19, p. 177).' });
TXT('colfac', { c: 'Lesão nesta região atinge o núcleo do abducente e as fibras do facial que o contornam: paralisia do reto lateral e paralisia facial periférica do mesmo lado (cap. 19).' });
M('bracsup', 'Braço do colículo superior', 'stem', '#e6c39c', 'Feixe que liga o colículo superior ao corpo geniculado lateral, visível na face dorsal do mesencéfalo (figura 5.2).', '', '');
M('bracinf', 'Braço do colículo inferior', 'stem', '#dcb48c', 'Feixe que liga o colículo inferior ao corpo geniculado medial. Faz parte da via auditiva: o colículo inferior projeta ao corpo geniculado medial pelo braço do colículo inferior (cap. 29, p. 276).', '', '');
M('veusup', 'Véu medular superior', 'stem', '#f1e4d4', 'Fina lâmina de substância branca que constitui a metade cranial do teto do IV ventrículo e se estende entre os dois pedúnculos cerebelares superiores. Na metade caudal, o teto é formado pela tela corioide.', '', '');
REF(TE_ITENS.map(q => q[0]).concat(['bracsup', 'bracinf', 'veusup']), 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 5 (Tronco Encefálico e Cerebelo), p. 43-46, figuras 5.1 e 5.2.');

/* ---- ventrículos ---- */
M('vlat','Ventrículo lateral','vent','#6cc3d6','Corno frontal, corpo, átrio e cornos occipital e temporal. Teto: corpo caloso. Contém plexo coroide. Comunica-se com o III ventrículo pelo forame interventricular.','Coroídeas anterior e posterior (plexo).','');
M('v3','III ventrículo','vent','#52b0c8','Fenda mediana entre os tálamos. Parede anterior: lâmina terminal. Assoalho: quiasma, infundíbulo, túber cinéreo e corpos mamilares (hipotalâmicos).','','');
M('aqueduto','Aqueduto cerebral','vent','#7fd0e0','Canal no mesencéfalo, entre tecto e tegmento, ligando o III ao IV ventrículo.','','Obstrução (estenose do aqueduto): hidrocefalia não comunicante, com dilatação do III ventrículo e dos ventrículos laterais; o IV ventrículo permanece com dimensões normais.');
M('v4','IV ventrículo','vent','#4fa6bd','Entre ponte e bulbo (ventralmente) e cerebelo (dorsalmente). Comunica-se com o espaço subaracnóideo pelas aberturas mediana e laterais.','PICA (plexo coroide).','');

/* ---- artérias ---- */
M('aci','Artéria carótida interna','art','#d8322d','Atravessa o canal carótico e o seio cavernoso (sifão carotídeo) e divide-se em ACM e ACA. Dá a oftálmica, a comunicante posterior e a coroídea anterior.','','');
M('acm','Artéria cerebral média (ACM)','art','#e0492f','Maior ramo da carótida interna. Percorre o sulco lateral e irriga a maior parte da face lateral do hemisfério: áreas motora, somestésica e de linguagem, ínsula e parte do temporal.','','Obstrução: hemiplegia (exceto membro inferior), hipoestesia e hemianopsia homônima contralaterais; afasia se à esquerda.');
M('lenticulo','Artérias lenticuloestriadas','art','#ff6a3d','Ramos centrais da ACM que perfuram a substância perfurada anterior e irrigam a maior parte do corpo estriado e da cápsula interna.','','Hemorragia hipertensiva: AVE grave com hemiplegia contralateral.');
M('a_fbl','Artéria frontobasilar lateral','art','#e8654a','Ramo da ACM para a face orbital lateral do lobo frontal. A frontobasilar medial é ramo da ACA.','','');
M('a_cent','Artérias do sulco pré-central e central','art','#f07a5a','Ramos da ACM para as áreas motora e somestésica primárias.','','');
M('a_par','Artérias parietais da ACM','art','#d65a3e','Ramos parietais anterior e posterior da ACM.','','');
M('a_ang','Artéria do giro angular','art','#c94d36','Ramo terminal da ACM para o giro angular.','','');
M('a_temp','Artérias temporais da ACM','art','#e87056','Ramos temporais anterior, médio e posterior da ACM; irrigam a maior parte da face lateral do lobo temporal, inclusive a área auditiva.','','');
M('aca1','ACA, segmento pré-comunicante','art','#c8201c','Une a carótida interna à artéria comunicante anterior. Dá ramos centrais ao hipotálamo e ao quiasma.','','');
M('acomA','Artéria comunicante anterior','art','#ef4b3c','Une as duas ACA e fecha o polígono de Willis anteriormente.','','Local frequente de aneurismas.');
M('pericalosa','Artéria pericalosa (ACA)','art','#c8352d','Continuação da ACA ao redor do joelho e sobre o corpo caloso. Irriga os 4/5 anteriores do corpo caloso e a face medial do hemisfério.','','Obstrução da ACA: paralisia e hipoestesia do membro inferior contralateral.');
M('calmarg','Artéria calosomarginal','art','#d94a3a','Ramo da ACA que segue no sulco do cíngulo. Dá ramos frontais e o ramo paracentral para o lóbulo paracentral.','','');
M('heubner','Artéria recorrente de Heubner','art','#ff8a4c','Ramo proximal da ACA. Irriga a parte anterior do caudado, o terço anterior do putame, parte do globo pálido externo e a perna anterior da cápsula interna.','','Obstrução: paresia da face e do membro superior.');
M('a_fbm','Artérias frontopolar e frontobasilar medial','art','#e05d4a','Ramos da ACA para o polo frontal e a face orbital medial.','','');
M('pcom','Artéria comunicante posterior','art','#e63c35','Liga a carótida interna à cerebral posterior; anastomose entre os sistemas carotídeo e vertebrobasilar.','','');
M('coroant','Artéria coroídea anterior','art','#ff5a4a','Origina-se na carótida interna, acompanha o trato óptico e entra no corno inferior. Irriga a perna posterior da cápsula interna, o globo pálido interno, o trato e a radiação ópticos e o plexo coroide.','','');
M('vertebral','Artérias vertebrais','art','#a8201d','Entram pelo forame magno e se fundem na basilar. Dão as espinais anterior e posterior e a PICA.','','');
M('basilar','Artéria basilar','art','#b82722','No sulco basilar da ponte. Ramos: cerebelar superior, AICA, labiríntica e ramos pontinos. Termina nas cerebrais posteriores.','','');
M('pica','Cerebelar inferior posterior (PICA)','art','#9c1e1b','Ramo da vertebral; irriga as porções inferior e posterior do cerebelo.','','Síndrome bulbar lateral (Wallenberg).');
M('aica','Cerebelar inferior anterior (AICA)','art','#b02a25','Ramo da basilar; irriga a parte anterior da face inferior do cerebelo.','','');
M('sca','Cerebelar superior','art','#c23a31','Ramo da basilar, inferior às cerebrais posteriores; irriga o mesencéfalo e a parte superior do cerebelo.','','');
M('acp','Artéria cerebral posterior (ACP)','art','#cc2a2a','Ramo terminal da basilar. Contorna o pedúnculo cerebral e irriga a face inferior do lobo temporal e o lobo occipital, incluindo o córtex calcarino.','','Hemianopsia homônima, prosopagnosia e, se atinge o hipocampo, amnésia.');
M('a_calc','Artéria calcarina','art','#d44a4a','Ramo da ACP que segue o sulco calcarino e irriga a área visual primária.','','Obstrução: cegueira cortical ou hemianopsia homônima.');
M('a_parocc','Artéria parietoccipital','art','#dc5a52','Ramo da ACP que segue o sulco parietoccipital; irriga cúneo e pré-cúneo.','','');
M('a_dorsalcc','Artéria dorsal do corpo caloso','art','#e26a60','Ramo da ACP que contorna o esplênio e irriga a região posterior do corpo caloso e o istmo do cíngulo.','','');
M('a_tempinf','Ramos temporais inferiores da ACP','art','#b8403c','Irrigam a face inferior do lobo temporal, inclusive o giro occipitotemporal lateral.','','');
M('talamoperf','Artérias talamoperfurantes','art','#ff7a6a','Ramos centrais da ACP que irrigam o tálamo e o hipotálamo.','','Infarto talâmico.');
M('coropost','Artérias coroídeas posteriores','art','#ee5a52','Ramos da ACP (medial e lateral) que irrigam o tálamo, o corpo geniculado, a pineal e o plexo coroide do III e dos ventrículos laterais.','','');

/* ---- veias e seios ---- */
M('sss','Seio sagital superior','ven','#2f5fb8','Na margem superior da foice do cérebro. Recebe as veias cerebrais superiores e as granulações aracnóideas (reabsorção do líquor). Desemboca na confluência dos seios.','','');
M('sinf','Seio sagital inferior','ven','#3a6fd0','Na margem inferior da foice, sobre o corpo caloso. Desemboca no seio reto.','','');
M('sreto','Seio reto','ven','#274b99','Une-se ao sagital superior na confluência dos seios. Recebe a veia cerebral magna e o seio sagital inferior.','','');
M('torcula','Confluência dos seios','ven','#1f3f82','Na protuberância occipital interna; reúne o sagital superior, o reto e o occipital e origina os seios transversos.','','');
M('stransv','Seio transverso','ven','#2f5fb8','Do torcular ao seio sigmoide, na borda de fixação da tenda do cerebelo. Recebe a veia anastomótica inferior (de Labbé).','','');
M('ssigm','Seio sigmoide','ven','#2a55a8','Continuação do seio transverso; termina no bulbo da veia jugular interna.','','');
M('jugular','Veia jugular interna','ven','#3a6fd0','Continuação do sigmoide, após o forame jugular; drena o encéfalo para o pescoço.','','');
M('scav','Seio cavernoso','ven','#4a7fe0','De cada lado da sela turca. Atravessam-no a carótida interna (sifão) e o nervo abducente; recebe a veia cerebral média superficial.','','Trombose séptica: oftalmoplegia.');
M('spsup','Seio petroso superior','ven','#3d6fcf','Liga o seio cavernoso ao seio sigmoide (ao longo da margem superior da parte petrosa).','','');
M('spinf','Seio petroso inferior','ven','#5b8be0','Liga o seio cavernoso ao bulbo da jugular interna, no forame jugular.','','');
M('galeno','Veia cerebral magna (de Galeno)','ven','#3f6fcf','Curto tronco ímpar formado pela confluência das veias cerebrais internas, abaixo do esplênio. Desemboca no seio reto. Drena quase todo o sistema venoso profundo.','','');
M('vint','Veias cerebrais internas','ven','#5584d8','Percorrem o teto do III ventrículo e se unem na veia cerebral magna. Drenam o corpo estriado, a cápsula interna e o diencéfalo.','','');
M('basal','Veia basal (de Rosenthal)','ven','#4a78cc','Contorna o pedúnculo cerebral e desemboca na veia cerebral magna.','','');
M('silv','Veia cerebral média superficial','ven','#6b94e6','Percorre o sulco lateral e termina geralmente no seio cavernoso.','','');
M('trolard','Veia anastomótica superior (de Trolard)','ven','#5a86dc','Liga a veia cerebral média superficial ao seio sagital superior.','','');
M('labbe','Veia anastomótica inferior (de Labbé)','ven','#4d7bd4','Liga a veia cerebral média superficial ao seio transverso.','','');
M('vsup','Veias cerebrais superiores','ven','#7aa1ec','Drenam a face medial e a metade superior da face lateral para o seio sagital superior.','','');

/* ---- líquor: formação, circulação e absorção (Machado, 4ª ed., cap. 8, p. 75-76) ---- */
M('plexo','Plexos corioides','vent','#d8587f','Estruturas enoveladas, formadas por dobras de pia-máter, vasos sanguíneos e células ependimárias modificadas. Secretam ativamente a maior parte do líquor (cerca de 500 mL por dia; o volume total, de uns 150 mL, renova-se a cada 8 horas). Existem nos ventrículos laterais (corno inferior e parte central) e no teto do III e do IV ventrículos. Os dos ventrículos laterais contribuem com o maior contingente.','','Processos patológicos dos plexos corioides podem aumentar a produção de líquor e causar hidrocefalia comunicante.');
M('fmonro','Forame interventricular','vent','#2f9fb8','Comunica cada ventrículo lateral com o III ventrículo. Por ele passa o líquor formado nos ventrículos laterais.','','Obstrução: hidrocefalia não comunicante, com dilatação do ventrículo lateral correspondente.');
M('abmed','Abertura mediana do IV ventrículo','vent','#1d7f96','Abertura ímpar do IV ventrículo. Junto com as aberturas laterais, dá passagem ao líquor dos ventrículos para o espaço subaracnóideo.','','Obstrução das aberturas mediana e laterais: dilatação de todo o sistema ventricular.');
M('ablat','Aberturas laterais do IV ventrículo','vent','#3fb4cc','Uma de cada lado do IV ventrículo. Junto com a abertura mediana, dão passagem ao líquor dos ventrículos para o espaço subaracnóideo.','','Obstrução das aberturas mediana e laterais: dilatação de todo o sistema ventricular.');
M('granul','Granulações aracnóideas','vent','#9fd8e6','Projetam-se no interior dos seios da dura-máter. Por elas o líquor é reabsorvido e chega à circulação sistêmica. Predominam no seio sagital superior, por isso o líquor circula de baixo para cima no espaço subaracnóideo, passando entre a incisura do tentório e o mesencéfalo. Há pequenas granulações também nos prolongamentos da dura-máter que acompanham as raízes dos nervos espinais.','','Deficiência de absorção (doença dos seios ou das granulações): hidrocefalia comunicante. Bloqueio na incisura do tentório: dilatação de todo o sistema ventricular.');

/* ---- vascularização: itens novos (Machado, 4ª ed., cap. 18, p. 162-166) ---- */
M('acm2','ACM, ramos sobre a ínsula (segmentos M2 e M3)','art','#e85a3a','Continuação da artéria cerebral média no fundo do sulco lateral, sobre a ínsula, de onde saem os ramos corticais para a face lateral do hemisfério.','','');
M('acp1','ACP, segmento pré-comunicante (P1)','art','#d83838','Trecho da artéria cerebral posterior entre a bifurcação da basilar e a anastomose com a artéria comunicante posterior. Daqui saem ramos proximais, como as artérias talamoperfurantes.','','');
M('a_oft','Artéria oftálmica','art','#f08a6a','Ramo da carótida interna. Emerge quando ela atravessa a dura-máter, logo abaixo do processo clinoide anterior. Irriga o bulbo ocular e formações anexas.','','');
M('a_labir','Artéria labiríntica','art','#c84a42','Ramo da artéria basilar. Penetra no meato acústico interno junto com os nervos facial e vestibulococlear e vasculariza estruturas do ouvido interno.','','');
M('a_pont','Ramos pontinos','art','#b83a34','Ramos da artéria basilar para a ponte.','','');
M('a_espant','Artéria espinal anterior','art','#a02a26','Origina-se das artérias vertebrais, que também dão as duas artérias espinais posteriores. Vascularizam a medula.','','');

/* ---- seios novos (Machado, 4ª ed., cap. 8, p. 72-73) ---- */
M('socc','Seio occipital','ven','#24468c','Muito pequeno e irregular. Dispõe-se ao longo da margem de inserção da foice do cerebelo e participa da confluência dos seios.','','');
M('sinterc','Seios intercavernosos','ven','#5f8fe8','Unem os dois seios cavernosos, envolvendo a hipófise.','','');

/* ---- nervos cranianos (Machado, 4ª ed., cap. 5, p. 43-47; cap. 10, p. 96-102; lesões: cap. 19, p. 177-181) ---- */
function NC(id, name, o) { M(id, name, 'nc', '#e3c044', o.f, '', o.c); Object.assign(META[id], { nuc: o.nuc || '', orig: o.orig || '', forame: o.forame || '' }); }
NC('nc1', 'I. Nervo olfatório', {
  f: 'Exclusivamente sensitivo. É representado por numerosos pequenos feixes nervosos que se originam na região olfatória de cada fossa nasal e terminam no bulbo olfatório. Fibras aferentes viscerais especiais (olfação).',
  orig: 'Bulbo olfatório. Não faz conexão com o tronco encefálico.',
  forame: 'Lâmina crivosa do osso etmoide.' });
NC('nc2', 'II. Nervo óptico', {
  f: 'Exclusivamente sensitivo. Grosso feixe de fibras que se originam na retina e emergem próximo ao polo posterior do bulbo ocular. Une-se ao do lado oposto no quiasma óptico, onde há cruzamento parcial das fibras, que continuam no trato óptico até o corpo geniculado lateral. Fibras aferentes somáticas especiais (visão).',
  orig: 'Quiasma óptico. Não faz conexão com o tronco encefálico.',
  forame: 'Canal óptico.' });
NC('nc3', 'III. Nervo oculomotor', {
  f: 'Motor. Fibras eferentes somáticas para os músculos extrínsecos do olho: elevador da pálpebra superior, retos superior, inferior e medial e oblíquo inferior. Fibras eferentes viscerais gerais (pré-ganglionares parassimpáticas) para o gânglio ciliar, de onde saem fibras para o músculo ciliar e para o esfíncter da pupila.',
  nuc: 'Núcleo do oculomotor (coluna eferente somática) e núcleo de Edinger-Westphal (coluna eferente visceral geral), no mesencéfalo, ao nível do colículo superior.',
  orig: 'Sulco medial do pedúnculo cerebral, na fossa interpeduncular.',
  forame: 'Fissura orbital superior.',
  c: 'Impossibilidade de mover o olho para cima, para baixo e em direção medial; diplopia; estrabismo divergente; ptose palpebral; midríase. Na síndrome de Weber (base do pedúnculo cerebral), a lesão do oculomotor de um lado soma-se à hemiparesia do lado oposto. Na síndrome de Benedikt (tegmento do mesencéfalo), soma-se à anestesia da metade oposta do corpo e a tremores e movimentos anormais do lado oposto.' });
NC('nc4', 'IV. Nervo troclear', {
  f: 'Motor, muito delgado. Fibras eferentes somáticas para o músculo oblíquo superior.',
  nuc: 'Núcleo do troclear, no mesencéfalo, ao nível do colículo inferior (coluna eferente somática).',
  orig: 'Caudalmente ao colículo inferior. É o único dos pares cranianos que emerge dorsalmente; contorna o mesencéfalo para surgir ventralmente entre a ponte e o mesencéfalo.',
  forame: 'Fissura orbital superior.' });
NC('nc5', 'V. Nervo trigêmeo', {
  f: 'Misto, com componente sensitivo consideravelmente maior. A raiz sensitiva é formada pelos prolongamentos centrais dos neurônios do gânglio trigeminal, que fica sobre a parte petrosa do osso temporal; os prolongamentos periféricos formam os nervos oftálmico, maxilar e mandibular. Fibras aferentes somáticas gerais: pele da face e da fronte, conjuntiva ocular, parte da mucosa da cavidade bucal, nariz e seios paranasais, dentes, dois terços anteriores da língua e maior parte da dura-máter craniana; propriocepção dos músculos mastigadores e da articulação temporomandibular. A raiz motora acompanha o nervo mandibular: fibras eferentes viscerais especiais para os músculos mastigadores (temporal, masseter, pterigóideos lateral e medial), milo-hióideo e ventre anterior do digástrico.',
  nuc: 'Núcleo motor do trigêmeo, na ponte (coluna eferente visceral especial). Coluna aferente somática geral: núcleo do trato mesencefálico (propriocepção), núcleo sensitivo principal (sobretudo tato) e núcleo do trato espinal (dor e temperatura).',
  orig: 'Limite entre a ponte e o pedúnculo cerebelar médio, por uma raiz sensitiva (maior) e uma raiz motora (menor).',
  forame: 'Nervo oftálmico: fissura orbital superior. Nervo maxilar: forame redondo. Nervo mandibular: forame oval.',
  c: 'Paralisia da musculatura mastigadora do lado da lesão, com desvio da mandíbula para o lado paralisado; anestesia da face do mesmo lado no território dos três ramos; perda do reflexo corneano. Lesão da base da ponte nesse nível: soma-se hemiplegia do lado oposto. Neuralgia do trigêmeo: crises dolorosas muito intensas no território de um dos ramos.' });
NC('nc6', 'VI. Nervo abducente', {
  f: 'Motor. Fibras eferentes somáticas para o músculo reto lateral.',
  nuc: 'Núcleo do abducente, na ponte, sob o colículo facial (coluna eferente somática). As fibras do nervo facial contornam esse núcleo.',
  orig: 'Sulco bulbopontino, entre a ponte e a pirâmide do bulbo.',
  forame: 'Fissura orbital superior.',
  c: 'Paralisia do músculo reto lateral do mesmo lado, que impede a abdução do olho; diplopia; estrabismo convergente. Na síndrome de Millard-Gubler (base da ponte), soma-se hemiparesia do lado oposto e, se a lesão se estende lateralmente, sinais de lesão do nervo facial.' });
NC('nc7', 'VII. Nervo facial', {
  f: 'Emerge por uma raiz motora, o nervo facial propriamente dito, e uma raiz sensitiva e visceral, o nervo intermédio. Eferentes viscerais especiais: músculos mímicos, estilo-hióideo e ventre posterior do digástrico. Eferentes viscerais gerais: glândulas lacrimal, submandibular e sublingual. Aferentes viscerais especiais: gustação nos dois terços anteriores da língua, pelo nervo corda do tímpano. Os neurônios sensitivos ficam no gânglio geniculado.',
  nuc: 'Núcleo do facial, na ponte (coluna eferente visceral especial); núcleos lacrimal e salivatório superior (eferente visceral geral); núcleo do trato solitário (aferente visceral); pequeno contingente para a coluna aferente somática geral.',
  orig: 'Sulco bulbopontino, medialmente ao VIII par. O nervo intermédio emerge entre os dois.',
  forame: 'Entra no meato acústico interno com o VIII par, percorre o canal facial (joelho externo, com o gânglio geniculado) e sai do crânio pelo forame estilomastóideo.',
  c: 'Paralisia periférica (lesão do nervo ou do núcleo): toda a metade da face do mesmo lado; desvio da comissura labial para o lado normal; a pálpebra não fecha e o reflexo corneano fica abolido. Paralisia central (lesão do trato corticonuclear): só a metade inferior da face do lado oposto. Lesão no canal facial: soma-se perda da gustação nos dois terços anteriores da língua e sintomas do VIII par.' });
NC('nc8', 'VIII. Nervo vestibulococlear', {
  f: 'Exclusivamente sensitivo. Parte vestibular: fibras dos neurônios do gânglio vestibular, relacionadas com o equilíbrio. Parte coclear: fibras dos neurônios do gânglio espiral, relacionadas com a audição. Fibras aferentes somáticas especiais.',
  nuc: 'Núcleos cocleares ventral e dorsal e núcleos vestibulares superior, inferior, medial e lateral (coluna aferente somática especial).',
  orig: 'Porção lateral do sulco bulbopontino, entre a emergência do VII par e o flóculo do cerebelo (ângulo pontocerebelar).',
  forame: 'Meato acústico interno, na porção petrosa do osso temporal, com os nervos facial e intermédio.',
  c: 'Diminuição da audição (parte coclear); vertigem, alterações do equilíbrio e enjoo (parte vestibular); pode haver nistagmo. O neurinoma cresce no ângulo pontocerebelar e comprime também o facial e o intermédio, podendo atingir o trigêmeo e o pedúnculo cerebelar médio.' });
NC('nc9', 'IX. Nervo glossofaríngeo', {
  f: 'Misto. Aferentes viscerais gerais (o componente mais importante): terço posterior da língua, faringe, úvula, tonsila, tuba auditiva, seio e corpo carotídeos. Aferentes viscerais especiais: gustação no terço posterior da língua. Eferentes viscerais gerais: glândula parótida, pelo gânglio ótico. Eferentes viscerais especiais: músculo constritor superior da faringe e músculo estilofaríngeo. Tem dois gânglios sensitivos, superior e inferior.',
  nuc: 'Núcleo ambíguo (eferente visceral especial); núcleo salivatório inferior (eferente visceral geral); núcleo do trato solitário (aferente visceral); pequeno contingente para a coluna aferente somática geral.',
  orig: 'Sulco lateral posterior do bulbo, por filamentos radiculares dispostos em linha vertical.',
  forame: 'Forame jugular.',
  c: 'Neuralgia do glossofaríngeo: crises dolorosas na faringe e no terço posterior da língua, que podem irradiar para o ouvido.' });
NC('nc10', 'X. Nervo vago', {
  f: 'Misto e essencialmente visceral; o maior dos nervos cranianos. Percorre o pescoço e o tórax e termina no abdome. Aferentes viscerais gerais: faringe, laringe, traqueia, esôfago e vísceras do tórax e do abdome. Eferentes viscerais gerais: inervação parassimpática das vísceras torácicas e abdominais. Eferentes viscerais especiais: músculos da faringe e da laringe. Aferentes viscerais especiais: gustação na epiglote. Tem dois gânglios sensitivos: superior (jugular) e inferior (nodoso).',
  nuc: 'Núcleo dorsal do vago (eferente visceral geral); núcleo ambíguo (eferente visceral especial); núcleo do trato solitário (aferente visceral); pequeno contingente para a coluna aferente somática geral.',
  orig: 'Sulco lateral posterior do bulbo, por filamentos radiculares.',
  forame: 'Forame jugular.',
  c: 'Lesão do núcleo ambíguo, como na síndrome de Wallenberg: perturbações da deglutição (disfagia) e da fonação (disfonia), por paralisia dos músculos da faringe e da laringe.' });
NC('nc11', 'XI. Nervo acessório', {
  f: 'Formado por uma raiz craniana (bulbar) e uma raiz espinal. A raiz espinal vem dos cinco ou seis primeiros segmentos cervicais da medula e entra no crânio pelo forame magno. O ramo interno, com as fibras da raiz craniana, une-se ao vago: músculos da laringe, pelo nervo laríngeo recorrente, e vísceras torácicas. O ramo externo, com as fibras da raiz espinal, inerva os músculos trapézio e esternocleidomastóideo.',
  nuc: 'Raiz craniana: núcleo ambíguo. Raiz espinal: coluna anterior dos cinco primeiros segmentos cervicais da medula.',
  orig: 'Raiz craniana: sulco lateral posterior do bulbo. Raiz espinal: face lateral dos primeiros segmentos cervicais da medula.',
  forame: 'Forame jugular, em companhia do glossofaríngeo e do vago. Antes disso, a raiz espinal entra no crânio pelo forame magno.' });
NC('nc12', 'XII. Nervo hipoglosso', {
  f: 'Essencialmente motor. Fibras eferentes somáticas para os músculos intrínsecos e extrínsecos da língua.',
  nuc: 'Núcleo do hipoglosso, no bulbo, sob o trígono do nervo hipoglosso, no assoalho do IV ventrículo (coluna eferente somática).',
  orig: 'Sulco lateral anterior do bulbo, ventralmente à oliva, por filamentos radiculares.',
  forame: 'Canal do hipoglosso.',
  c: 'Paralisia e atrofia da musculatura da metade da língua do lado lesado; na protrusão, a língua desvia para o lado lesado. Na lesão da base do bulbo, soma-se hemiparesia do lado oposto (pirâmide).' });

/* ---- núcleos dos nervos cranianos por colunas funcionais (Machado, 4ª ed., cap. 17, p. 151-154) ---- */
const COLF = { es: ['eferente somática', '#d94f4f'], evg: ['eferente visceral geral', '#e89a3c'], eve: ['eferente visceral especial', '#c95fb0'], asg: ['aferente somática geral', '#4f86d9'], ase: ['aferente somática especial', '#4fae7a'], av: ['aferente visceral', '#35b3b3'] };
function NU(id, name, col, f, c) { M(id, name, 'nc', COLF[col][1], f, '', c); META[id].col = COLF[col][0]; }
NU('nu3', 'Núcleo do oculomotor', 'es', 'No mesencéfalo, ao nível do colículo superior. Só a parte somática pertence a esta coluna. Origina fibras para todos os músculos extrínsecos do olho, com exceção do reto lateral e do oblíquo superior. Os núcleos desta coluna dispõem-se de cada lado, próximo ao plano mediano.');
NU('nu4', 'Núcleo do troclear', 'es', 'No mesencéfalo, ao nível do colículo inferior. Origina fibras para o músculo oblíquo superior.');
NU('nu6', 'Núcleo do abducente', 'es', 'Na ponte, sob o colículo facial. Origina fibras para o músculo reto lateral.', 'A lesão do núcleo do facial na ponte provavelmente compromete também este núcleo.');
NU('nu12', 'Núcleo do hipoglosso', 'es', 'No bulbo, sob o trígono do nervo hipoglosso, no assoalho do IV ventrículo. Origina fibras para os músculos da língua.');
NU('nuew', 'Núcleo de Edinger-Westphal', 'evg', 'Pertence ao complexo oculomotor, no mesencéfalo, ao nível do colículo superior. Origina fibras pré-ganglionares para o gânglio ciliar (pelo nervo oculomotor), de onde saem fibras pós-ganglionares para o músculo ciliar (acomodação) e para o esfíncter da pupila. Nos núcleos desta coluna estão os neurônios pré-ganglionares do parassimpático craniano.');
NU('nulacr', 'Núcleo lacrimal', 'evg', 'Na ponte, próximo ao núcleo salivatório superior. Origina fibras pré-ganglionares que saem pelo nervo intermédio (VII par) e, pelos nervos petroso maior e do canal pterigóideo, chegam ao gânglio pterigopalatino, de onde saem as fibras pós-ganglionares para a glândula lacrimal.');
NU('nusals', 'Núcleo salivatório superior', 'evg', 'Na parte caudal da ponte. Origina fibras pré-ganglionares que saem pelo nervo intermédio e ganham o nervo lingual pelo nervo corda do tímpano, chegando ao gânglio submandibular, de onde saem fibras pós-ganglionares para as glândulas submandibular e sublingual.');
NU('nusali', 'Núcleo salivatório inferior', 'evg', 'Na parte mais cranial do bulbo. Origina fibras pré-ganglionares que saem pelo nervo glossofaríngeo e chegam ao gânglio ótico pelos nervos timpânico e petroso menor. Do gânglio ótico saem fibras pós-ganglionares para a parótida, pelo nervo auriculotemporal.');
NU('nudx', 'Núcleo dorsal do vago', 'evg', 'No bulbo, sob o trígono do vago, no assoalho do IV ventrículo. Origina fibras pré-ganglionares que saem pelo nervo vago e fazem sinapse em pequenos gânglios nas paredes das vísceras torácicas e abdominais.');
NU('numot5', 'Núcleo motor do trigêmeo', 'eve', 'Na ponte. Origina fibras que saem pela raiz motora do trigêmeo, ganham a divisão mandibular e inervam músculos derivados do primeiro arco branquial: mastigadores (temporal, masseter, pterigóideos lateral e medial), milo-hióideo e ventre anterior do digástrico. Os núcleos desta coluna localizam-se profundamente no interior do tronco encefálico.');
NU('nu7', 'Núcleo do facial', 'eve', 'Na ponte. Origina fibras que, pelo VII par, vão à musculatura mímica e ao ventre posterior do digástrico, músculos derivados do segundo arco branquial. Antes de emergir, as fibras contornam o núcleo do abducente (joelho interno do nervo facial), formando o colículo facial no assoalho do IV ventrículo.', 'Lesão do núcleo: paralisia facial de tipo periférico, do mesmo lado.');
NU('nuamb', 'Núcleo ambíguo', 'eve', 'No bulbo. Origina fibras que inervam os músculos da laringe e da faringe, saindo pelos nervos glossofaríngeo, vago e raiz craniana do acessório.', 'Lesão (síndrome de Wallenberg): disfagia e disfonia.');
NU('numes5', 'Núcleo do trato mesencefálico do trigêmeo', 'asg', 'Estende-se ao longo de todo o mesencéfalo e da parte mais cranial da ponte. Recebe impulsos proprioceptivos dos músculos da mastigação e, provavelmente, dos músculos extrínsecos do bulbo ocular, além de fibras dos dentes e do periodonto, importantes para a regulação reflexa da força da mordida. Seus neurônios são sensitivos: é exceção à regra de que os corpos dos neurônios sensitivos ficam fora do sistema nervoso central.');
NU('nusp5', 'Núcleo sensitivo principal do trigêmeo', 'asg', 'Na ponte, aproximadamente no nível da penetração da raiz sensitiva do trigêmeo. Continua caudalmente com o núcleo do trato espinal. Relaciona-se sobretudo com o tato.');
NU('nuesp5', 'Núcleo do trato espinal do trigêmeo', 'asg', 'Estende-se da ponte até a parte alta da medula, onde continua com a substância gelatinosa. É acompanhado em toda a extensão pelo trato espinal do trigêmeo. Relaciona-se com dor e temperatura. Nesta coluna termina também um pequeno contingente de fibras dos nervos VII, IX e X.', 'Tratotomia (secção do trato espinal): abole a sensibilidade térmica e dolorosa da face do lado operado, com muito pouca alteração do tato. Na síndrome de Wallenberg: perda da sensibilidade térmica e dolorosa na metade da face do lado da lesão.');
NU('nucocl', 'Núcleos cocleares', 'ase', 'Dois núcleos, ventral e dorsal. Recebem as fibras da parte coclear do VIII par (audição).');
NU('nuvest', 'Núcleos vestibulares', 'ase', 'Quatro núcleos: superior, inferior, medial e lateral. Ocupam toda a área vestibular do assoalho do IV ventrículo; por isso esta coluna é muito larga e, morfologicamente, não se parece com uma coluna. Recebem as fibras da parte vestibular do VIII par (equilíbrio).');
NU('nusol', 'Núcleo do trato solitário', 'av', 'Único núcleo da coluna aferente visceral, no bulbo. Recebe a sensibilidade visceral geral e especial (gustação) que entra pelos nervos facial, glossofaríngeo e vago. Antes de terminar no núcleo, as fibras descem no trato solitário. As fibras gustativas fazem sinapse no terço anterior do núcleo; as viscerais gerais, nos dois terços posteriores.');

/* ---- grandes vias (Machado, 4ª ed.: cap. 27, p. 249; cap. 29, p. 265-282; cap. 30, p. 285-288) ---- */
M('v_cs', 'Tratos corticospinais', 'vias', '#d23c3c',
  'Unem o córtex aos neurônios motores da medula. Um terço das fibras origina-se na área 4 (motora primária), um terço na área 6 (pré-motora e motora suplementar) e um terço no córtex somatossensorial. Trajeto: área 4, coroa radiada, perna posterior da cápsula interna, base do pedúnculo cerebral, base da ponte e pirâmide bulbar. Na decussação das pirâmides cruzam de 75% a 90% das fibras, que formam o trato corticospinal lateral: ocupa o funículo lateral da medula e atua sobretudo na musculatura distal dos membros, a principal via da motricidade voluntária. As fibras que não cruzam continuam ventralmente como trato corticospinal anterior, cruzam depois na comissura branca e atuam na musculatura axial.', '',
  'Paresia e lentidão da contração voluntária; o sintoma mais evidente, do qual os doentes não se recuperam, é a perda da capacidade de mover grupos musculares isolados, como os dedos (perda do fracionamento). Sinal de Babinski. Como os tratos rubrospinal e reticulospinais compensam em parte, a lesão isolada do corticospinal lateral não causa a hemiplegia que antes se supunha.');
M('v_cn', 'Trato corticonuclear', 'vias', '#e0702c',
  'Mesmo valor funcional do corticospinal, mas leva impulsos aos neurônios motores do tronco encefálico. Origina-se principalmente na parte inferior da área 4 (representação da cabeça), passa pelo joelho da cápsula interna e desce com o corticospinal. Destacam-se feixes para os núcleos da coluna eferente somática (III, IV, VI e XII) e eferente visceral especial (ambíguo, motores do V e do VII); a maioria faz sinapse com neurônios internunciais da formação reticular. Diferente do corticospinal, tem muitas fibras homolaterais: a maioria dos músculos da cabeça tem representação nos dois lados do córtex. A metade inferior da face recebe só fibras do lado oposto; a língua, predominantemente do lado oposto.', '',
  'Lesão de um lado (por exemplo, na cápsula interna): paralisia da metade inferior da face do lado oposto (paralisia facial central) e ligeiro enfraquecimento da língua. Não há paralisia dos músculos com representação bilateral: laringe e faringe, metade superior da face, músculos que fecham a mandíbula e músculos do olho.');
M('v_lm', 'Lemnisco medial: propriocepção consciente e tato epicrítico', 'vias', '#3b7fd9',
  'Via de propriocepção consciente, tato epicrítico e sensibilidade vibratória. Neurônios I nos gânglios espinais: o ramo ascendente longo sobe nos fascículos grácil e cuneiforme. Neurônios II nos núcleos grácil e cuneiforme do bulbo: os axônios formam as fibras arqueadas internas, cruzam o plano mediano e sobem como lemnisco medial. Neurônios III no núcleo ventral posterolateral do tálamo: as radiações talâmicas passam pela cápsula interna e pela coroa radiada até a área somestésica (giro pós-central, áreas 3, 2 e 1).', '', '');
M('v_st', 'Via neoespinotalâmica (dor e temperatura)', 'vias', '#2fa37a',
  'Via clássica de dor e temperatura. Neurônios I nos gânglios espinais; o prolongamento central termina na coluna posterior. Neurônios II: os axônios cruzam o plano mediano pela comissura branca, ganham o funículo lateral do lado oposto e sobem como trato espinotalâmico lateral; na ponte, une-se ao espinotalâmico anterior e forma o lemnisco espinal. Neurônios III no núcleo ventral posterolateral do tálamo, que projeta pela cápsula interna e coroa radiada à área somestésica. Responsável pela dor aguda e bem localizada (dor em pontada). A via paleoespinotalâmica (espinorreticular, dor crônica em queimação, núcleos intralaminares) não está desenhada.', '', '');
M('v_opt', 'Via óptica', 'vias', '#c7a21c',
  'Os nervos ópticos convergem no quiasma óptico, onde as fibras da retina nasal cruzam e as da retina temporal seguem do mesmo lado. Cada trato óptico leva, assim, fibras temporais do seu lado e nasais do lado oposto, e termina no corpo geniculado lateral. Daí a radiação óptica (trato geniculocalcarino) segue à área 17, nos lábios do sulco calcarino. As fibras das partes superiores da retina vão ao lábio superior; as das partes inferiores, ao lábio inferior; as da mácula, à parte posterior. O córtex visual de um lado percebe o que está no hemicampo visual do lado oposto. Desenhados: as fibras temporais do olho esquerdo e as nasais do olho direito, que chegam juntas ao córtex visual esquerdo.', '', '');
M('v_aud', 'Via auditiva', 'vias', '#9b59c9',
  'Neurônios I no gânglio espiral da cóclea; os prolongamentos centrais formam a parte coclear do VIII par. Neurônios II nos núcleos cocleares dorsal e ventral: os axônios cruzam formando o corpo trapezoide, contornam o complexo olivar superior e sobem como lemnisco lateral do lado oposto (há também fibras homolaterais). Neurônios III no colículo inferior, que projeta ao corpo geniculado medial pelo braço do colículo inferior. Neurônios IV no corpo geniculado medial: a radiação auditiva passa pela cápsula interna até a área auditiva (áreas 41 e 42), no giro temporal transverso anterior. Mantém organização tonotópica.', '', '');
M('v_papez', 'Circuito de Papez', 'vias', '#d65fa0',
  'Proposto por Papez em 1937 para explicar as emoções. Composto pelo hipocampo, fórnice, corpo mamilar, fascículo mamilotalâmico, núcleos anteriores do tálamo, cápsula interna, giro do cíngulo, giro para-hipocampal e novamente o hipocampo, fechando o circuito.', '', '');
M('v_vest', 'Vias vestibulares', 'vias', '#22a6b8',
  'Neurônios I: células bipolares do gânglio vestibular; os prolongamentos centrais formam a parte vestibular do nervo vestibulococlear. Neurônios II nos núcleos vestibulares. Via inconsciente: os axônios formam o fascículo vestibulocerebelar, que passa pelo pedúnculo cerebelar inferior e ganha o córtex do vestibulocerebelo (lobo floculonodular); algumas fibras vão direto ao cerebelo. Via consciente: hoje admitida, com relé talâmico, mas de trajeto controverso; chega ao sulco lateral, ao córtex insular posterior e a uma pequena região do lobo parietal próxima da área somestésica da face. Dos núcleos vestibulares saem também os tratos vestibulospinais medial e lateral, que mantêm o equilíbrio e ativam os músculos extensores (antigravitacionais) das pernas. Desenhados: a via inconsciente e o trato vestibulospinal.', '', '');
M('v_cereb', 'Circuitos do cerebelo', 'vias', '#b8742a',
  'O cerebelo influencia os neurônios motores do próprio lado: suas vias, quando não são homolaterais, sofrem duplo cruzamento. Desenhados três circuitos. Via corticopontocerebelar (cerebrocerebelo): do córtex aos núcleos pontinos; as fibras pontocerebelares cruzam e entram pelo pedúnculo cerebelar médio na zona lateral do hemisfério oposto. Via dentotalamocortical: as células de Purkinje da zona lateral projetam no núcleo denteado, que vai, pelo pedúnculo cerebelar superior, ao tálamo do lado oposto e daí às áreas motoras, onde se origina o trato corticospinal; controla planejamento, início, velocidade e tempo do movimento. Trato espinocerebelar posterior (espinocerebelo): entra pelo pedúnculo cerebelar inferior e termina no córtex das zonas medial e intermédia; informa o grau de contração dos músculos e a posição e velocidade das partes do corpo.', '', '');
M('v_nb', 'Núcleos da base: circuito motor', 'vias', '#3d63c9',
  'Circuito em alça córtico-estriado-tálamo-cortical. Começa nas áreas motora e somestésica, que projetam ao neoestriado de forma somatotópica. Via direta: neoestriado, pálido medial, núcleos ventral anterior e ventral lateral do tálamo e de volta às áreas motoras. Via indireta: neoestriado, pálido lateral, núcleo subtalâmico, pálido medial, tálamo e córtex. O pálido medial mantém uma inibição permanente dos núcleos talâmicos, um freio para movimentos indesejados. Na via direta o neoestriado inibe o pálido medial e facilita o movimento; na indireta ocorre o oposto. As fibras nigroestriatais, dopaminérgicas, são excitatórias na via direta (receptor D1) e inibitórias na indireta (D2). Há ainda a via hiperdireta, do córtex ao núcleo subtalâmico (não desenhada).', '', '');
M('v_hip', 'Hipotálamo: trato hipotálamo-hipofisário e controle autonômico', 'vias', '#e0608c',
  'O hormônio antidiurético (vasopressina) e o ocitócico são sintetizados nos núcleos supra-óptico e paraventricular e levados pelas fibras do trato hipotálamo-hipofisário até a neuro-hipófise, onde são liberados. O hipotálamo é o centro suprassegmentar mais importante do sistema nervoso autônomo: a estimulação do hipotálamo anterior aumenta o peristaltismo, contrai a bexiga, reduz o ritmo cardíaco e a pressão e contrai a pupila (controla principalmente o parassimpático); a do hipotálamo posterior dá respostas opostas (controla sobretudo o simpático). Desenhado: o trato hipotálamo-hipofisário. As áreas anterior e posterior estão marcadas pelos pontos de lesão.', '', '');
REF(['v_vest'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 29 (Grandes Vias Aferentes), p. 278; vestibulospinais: cap. 30, p. 288; lesões: cap. 22, p. 213.');
REF(['v_cereb'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 22 (Estrutura e Funções do Cerebelo), p. 208-214.');
REF(['v_nb'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 24 (Estrutura e Funções dos Núcleos da Base), p. 224-227.');
REF(['v_hip'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 21 (Estrutura e Funções do Hipotálamo), p. 197-201.');
REF(['v_cs', 'v_cn'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 30 (Grandes Vias Eferentes), p. 286-288; lesões: cap. 19, p. 177-180.');
REF(['v_lm', 'v_st'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 29 (Grandes Vias Aferentes), p. 265-269; lesões: cap. 19, p. 177-181.');
REF(['v_opt'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 29 (Grandes Vias Aferentes), p. 279-282, figura 29.10.');
REF(['v_aud'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 29 (Grandes Vias Aferentes), p. 276; lesão do VIII par: cap. 10, p. 101.');
REF(['v_papez'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 27 (Sistema Límbico), p. 249.');

/* ---- notas sobre a malha (o que a região Desikan-Killiany cobre) ---- */
function NOTA(id, t) { META[id].nota = t; }
NOTA('gfs','Parte da região frontal superior do atlas Desikan-Killiany que fica na face lateral e superior; a divisão com a face medial foi feita pela margem superior do hemisfério.');
NOTA('gfsm','Parte medial da região frontal superior do atlas Desikan-Killiany; a divisão com a face lateral foi feita pela margem superior do hemisfério.');
NOTA('gfm','Reúne as regiões frontal média rostral e caudal do atlas Desikan-Killiany.');
NOTA('gang','Corresponde à região parietal inferior do atlas Desikan-Killiany, que contém o giro angular e córtex vizinho; é mais larga que o giro angular em sentido estrito.');
NOTA('gocc','Região occipital lateral do atlas Desikan-Killiany.');
NOTA('gcing','Reúne quatro regiões do atlas Desikan-Killiany: cíngulo anterior rostral, anterior caudal, posterior e istmo.');
NOTA('gparahip','Reúne as regiões para-hipocampal e entorrinal do atlas Desikan-Killiany.');
NOTA('greto','Corresponde à região orbitofrontal medial do atlas Desikan-Killiany.');
NOTA('gor','Corresponde à região orbitofrontal lateral do atlas Desikan-Killiany.');
NOTA('gcun','Na malha, os lábios do sulco calcarino formam uma região separada (córtex do sulco calcarino).');
NOTA('gling','Na malha, os lábios do sulco calcarino formam uma região separada (córtex do sulco calcarino).');
NOTA('gsubc','Sem malha própria: no atlas Desikan-Killiany esta área fica dentro das regiões orbitofrontal medial e cíngulo anterior rostral.');
NOTA('ginsula','Fica escondida no fundo do sulco lateral. Ao selecionar, o restante do córtex fica transparente para ela aparecer.');
NOTA('gtt','Fica escondido dentro do sulco lateral. Ao selecionar, o restante do córtex fica transparente para ele aparecer.');
NOTA('gbsts','Região do atlas Desikan-Killiany ("banks of the superior temporal sulcus"). Não é um giro descrito à parte no Machado.');
NOTA('caudado','Cabeça e corpo: malha real do mesmo cérebro. A cauda não faz parte dessa segmentação e está desenhada como tubo esquemático.');
NOTA('gpe','Malha real do globo pálido. A segmentação não separa os dois segmentos: a divisão entre externo e interno é aproximada (plano perpendicular ao eixo pálido-putame).');
NOTA('gpi','Malha real do globo pálido. A segmentação não separa os dois segmentos: a divisão entre externo e interno é aproximada (plano perpendicular ao eixo pálido-putame).');
NOTA('talamo','Malha real do tálamo (inclui o pulvinar). Os corpos geniculados estão como formas esquemáticas ao lado.');
NOTA('vlat','Malha real: corpo, cornos frontal e occipital, átrio e corno temporal.');
NOTA('v4','Malha real do IV ventrículo; a segmentação inclui o início do aqueduto.');
NOTA('mesenc','Malha real do tronco encefálico. A segmentação traz o tronco inteiro: a divisão com a ponte é aproximada (onde começa a saliência ventral da ponte) e a parte mais alta do mesencéfalo fica fora da malha.');
NOTA('ponte','Malha real do tronco encefálico. Os limites com mesencéfalo e bulbo são aproximados: onde a saliência ventral da ponte começa e termina.');
NOTA('bulbo','Malha real do tronco encefálico. O limite com a ponte é aproximado (fim da saliência ventral da ponte); a malha termina pouco abaixo.');
NOTA('cerebelo','Malha real do córtex cerebelar. A segmentação não separa o vérmis: usei uma faixa mediana de 9 mm para cada lado, limite aproximado.');
NOTA('vermis','Malha real do córtex cerebelar. A segmentação não separa o vérmis: usei uma faixa mediana de 9 mm para cada lado, limite aproximado.');
NOTA('cc_cut','Superfície de corte da malha na linha média; o contorno vem do corpo caloso do mesmo cérebro.');
NOTA('dien_wall','Superfície que fecha a malha do hemisfério na linha média (diencéfalo, tronco cortado e região do hipocampo). Não é córtex.');

NOTA('plexo','Forma esquemática dentro dos ventrículos, que ficam translúcidos para o plexo aparecer.');
NOTA('abmed','Posição tirada da malha real do IV ventrículo (ponto mais caudal). Também chamada forame de Magendie.');
NOTA('ablat','Posição tirada da malha real do IV ventrículo (extremidade de cada recesso lateral). Também chamadas forames de Luschka.');
NOTA('granul','Forma esquemática: pequenas esferas ao longo do seio sagital superior.');

/* ---- fonte conferida no livro ---- */
function REF(ids, t) { ids.forEach(id => { META[id].ref = t; }); }
REF(['plexo','fmonro','abmed','ablat','granul','aqueduto'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 8 (Meninges e Liquor), p. 75-76.');

/* ---- textos reescritos pelo cap. 18 do Machado ---- */
function TXT(id, o) { Object.assign(META[id], o); }
TXT('aci', { f: 'Ramo de bifurcação da carótida comum. Penetra no crânio pelo canal carotídeo do osso temporal e atravessa o seio cavernoso, onde descreve uma dupla curva em S, o sifão carotídeo. Perfura a dura-máter e a aracnoide e, no início do sulco lateral, divide-se nas artérias cerebrais média e anterior. Dá também as artérias oftálmica, comunicante posterior e corióidea anterior.' });
TXT('acm', { name: 'Artéria cerebral média (ACM), tronco (segmento M1)', f: 'Ramo principal da carótida interna. Percorre o sulco lateral em toda a sua extensão e vasculariza a maior parte da face lateral de cada hemisfério: área motora, área somestésica e áreas de linguagem. Os ramos corticais irrigam também a ínsula e parte do lobo temporal; os ramos medulares nutrem o centro semioval.', c: 'Obstrução: hemiplegia (exceto no membro inferior), hipoanestesia e hemianopsia homônima contralaterais, com desvio conjugado do olhar para o lado da lesão. À esquerda: afasia global e apraxia ideomotora. À direita: aprosódia, heminegligência, apraxias, anosognosia, prosopagnosia e distúrbios visuoespaciais.' });
TXT('lenticulo', { f: 'Ramos centrais que se destacam da artéria cerebral média e penetram na substância perfurada anterior. Vascularizam a maior parte do corpo estriado e da cápsula interna. Funcionam como artérias terminais.', c: 'São especialmente graves os AVE hemorrágicos destas artérias: como pela cápsula interna passam quase todas as fibras de projeção do córtex, causam hemiplegia contralateral.' });
TXT('aca1', { name: 'ACA, segmento pré-comunicante (A1)', f: 'Trecho da artéria cerebral anterior entre a bifurcação da carótida interna e a artéria comunicante anterior. Esta porção proximal origina a artéria recorrente de Heubner.' });
TXT('acomA', { f: 'Pequena artéria que anastomosa as duas cerebrais anteriores adiante do quiasma óptico. Fecha anteriormente o círculo arterial do cérebro (polígono de Willis), que circunda o quiasma óptico e o túber cinéreo.' });
TXT('pericalosa', { name: 'ACA depois da comunicante (A2) e artéria pericalosa', f: 'A artéria cerebral anterior dirige-se para diante e para cima, curva-se em torno do joelho do corpo caloso e ramifica-se na face medial do hemisfério, do lobo frontal até o sulco parietoccipital. Irriga os três quartos anteriores da superfície medial, a superfície médio-orbitofrontal, a parte mais alta da face lateral (onde se limita com o território da ACM) e os quatro quintos anteriores do corpo caloso.', c: 'Obstrução: paralisia e diminuição da sensibilidade no membro inferior do lado oposto, por lesão da porção alta dos giros pré e pós-central (lóbulo paracentral). O comprometimento do corpo caloso pode causar a síndrome de desconexão calosa.' });
TXT('heubner', { f: 'Ramo único ou múltiplo da porção proximal da artéria cerebral anterior. Com pequenas artérias, irriga a parte anterior do núcleo caudado, o terço anterior do putame, parte do segmento externo do globo pálido, o ramo anterior da cápsula interna e o hipotálamo, podendo incluir parte da região olfatória.', c: 'Obstrução: paresia da face e do membro superior, pelo acometimento da parte anterior da cápsula interna.' });
TXT('pcom', { f: 'Ramo da carótida interna que se anastomosa com a artéria cerebral posterior, ramo da basilar. Une o sistema carotídeo interno ao sistema vertebral no círculo arterial do cérebro. A anastomose é apenas potencial: em condições normais não há passagem significativa de sangue de um sistema para o outro.' });
TXT('coroant', { f: 'Emerge da carótida interna acima da comunicante posterior e dirige-se para trás ao longo do trato óptico. Seus ramos perfurantes irrigam os dois terços posteriores do ramo posterior da cápsula interna, o segmento interno do globo pálido, o tálamo ventrolateral, o trato e a radiação ópticos, parte do corpo geniculado lateral e parte do lobo temporal. Penetra no corno inferior do ventrículo lateral e irriga o plexo corioide. Anastomosa-se com a artéria corióidea posterior.' });
TXT('vertebral', { f: 'Destacam-se das artérias subclávias, sobem pelos forames transversos das vértebras cervicais e penetram no crânio pelo forame magno. Percorrem a face ventral do bulbo e, aproximadamente no nível do sulco bulbopontino, fundem-se na artéria basilar. Dão as duas artérias espinais posteriores, a espinal anterior e as cerebelares inferiores posteriores.' });
TXT('basilar', { f: 'Tronco único formado pela fusão das duas vertebrais. Percorre geralmente o sulco basilar da ponte e termina bifurcando-se nas artérias cerebrais posteriores. Ramos mais importantes: cerebelar superior, cerebelar inferior anterior, labiríntica e ramos pontinos.' });
TXT('pica', { f: 'Ramo da artéria vertebral. Irriga as porções inferior e posterior do cerebelo.' });
TXT('aica', { f: 'Ramo da artéria basilar. Distribui-se à parte anterior da face inferior do cerebelo.' });
TXT('sca', { f: 'Nasce da basilar, inferiormente às cerebrais posteriores. Distribui-se ao mesencéfalo e à parte superior do cerebelo.' });
TXT('acp', { name: 'Artéria cerebral posterior (ACP), depois da comunicante (P2)', f: 'Ramo de bifurcação da artéria basilar. Dirige-se para trás, contorna o pedúnculo cerebral e anastomosa-se com a comunicante posterior. Seus ramos corticais percorrem a face inferior do lobo temporal e o lobo occipital, irrigando as áreas visuais, incluindo a primária no sulco calcarino.', c: 'Praticamente todos os pacientes têm sintomas visuais: hemianopsia homônima ou quadrantopsias; o acometimento calcarino ocasiona cegueira. Lesão das áreas secundárias: hemiacromatopsia e agnosias visuais, como a prosopagnosia. Pode haver queixas sensitivas (tálamo), hemiparesia em geral transitória e, se a lesão se estender ao hipocampo, amnésia anterógrada. À esquerda: afasia sensitiva transcortical, anomia e alexia pura.' });
TXT('talamoperf', { f: 'Ramos proximais da artéria cerebral posterior. Com as corióideas posteriores, irrigam o tálamo, o corpo geniculado lateral, a glândula pineal, a região posterior da cápsula interna, o hipotálamo e o mesencéfalo, incluindo a substância negra e o núcleo rubro.', c: 'AVE talâmico: dores persistentes e demência talâmica.' });
TXT('coropost', { f: 'Corióidea posterior lateral e corióidea posterior medial: ramos proximais da artéria cerebral posterior. Com as talamoperfurantes, irrigam o tálamo, o corpo geniculado lateral, a glândula pineal, a região posterior da cápsula interna, o hipotálamo e o mesencéfalo.' });
REF(['aci','acm','acm2','lenticulo','aca1','acomA','pericalosa','heubner','pcom','coroant','vertebral','basilar','pica','aica','sca','acp','acp1','talamoperf','coropost','a_oft','a_labir','a_pont','a_espant','gor'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18 (Vascularização do SNC), p. 162-166.');
NOTA('acm','Os nomes de segmento (M1 a M4, A1, A2, P1, P2) são convenção clínica e radiológica; o Machado descreve as artérias sem essa divisão. No modelo, M4 corresponde aos ramos corticais.');
NOTA('acm2','Os nomes de segmento (M2, M3) são convenção clínica e radiológica; o Machado não usa essa divisão.');
NOTA('acp1','Os nomes de segmento (P1, P2) são convenção clínica e radiológica; o Machado não usa essa divisão.');
NOTA('aca1','Os nomes de segmento (A1, A2) são convenção clínica e radiológica; o Machado não usa essa divisão.');
NOTA('a_espant','Só o início está desenhado, na face ventral do bulbo; a medula não faz parte do modelo. As espinais posteriores não estão desenhadas.');

/* ---- drenagem venosa: textos reescritos pelo Machado (cap. 8, p. 72-73; cap. 18, p. 168) ---- */
TXT('sss', { f: 'Ímpar e mediano, percorre a margem de inserção da foice do cérebro. Termina próximo à protuberância occipital interna, na confluência dos seios. Recebe as veias cerebrais superficiais superiores. Tem expansões laterais irregulares, as lacunas venosas, e nele predominam as granulações aracnóideas, por onde o líquor é reabsorvido.' });
TXT('sinf', { f: 'Situa-se na margem livre da foice do cérebro e termina no seio reto.' });
TXT('sreto', { f: 'Localiza-se ao longo da linha de união entre a foice do cérebro e o tentório do cerebelo. Recebe, em sua extremidade anterior, o seio sagital inferior e a veia cerebral magna, e termina na confluência dos seios.' });
TXT('torcula', { f: 'Próxima à protuberância occipital interna. É formada pela confluência dos seios sagital superior, reto e occipital e pelo início dos seios transversos esquerdo e direito. Também conhecida como torcular de Herófilo. Nem sempre os seios se encontram em um só ponto: descrevem-se pelo menos quatro tipos de confluência.' });
TXT('stransv', { f: 'Par. Dispõe-se de cada lado ao longo da inserção do tentório do cerebelo no osso occipital, da confluência dos seios até a parte petrosa do osso temporal, onde passa a se chamar seio sigmoide. Recebe veias cerebrais superficiais inferiores.' });
TXT('ssigm', { f: 'Em forma de S, é a continuação do seio transverso até o forame jugular, onde continua diretamente com a veia jugular interna. Drena a quase totalidade do sangue venoso da cavidade craniana.' });
TXT('jugular', { f: 'Continuação direta do seio sigmoide a partir do forame jugular. As veias jugulares internas recebem praticamente todo o sangue venoso encefálico.' });
TXT('scav', { f: 'Cavidade bastante grande e irregular, de cada lado do corpo do esfenoide e da sela turca. Recebe as veias oftálmica superior e central da retina e algumas veias do cérebro. Drena pelos seios petroso superior e petroso inferior e comunica-se com o do lado oposto pelo seio intercavernoso. É atravessado pela artéria carótida interna e pelo nervo abducente e, próximo à parede lateral, pelos nervos troclear e oculomotor e pelo ramo oftálmico do trigêmeo.', c: 'Aneurisma da carótida interna dentro do seio comprime o nervo abducente e, em certos casos, os demais nervos, com distúrbios típicos dos movimentos do olho. Perfuração da carótida dentro do seio (fístula carótido-cavernosa): exoftalmia pulsátil. Infecções superficiais da face, como espinhas do nariz, podem se propagar ao seio pelas comunicações entre a veia angular e as veias oftálmicas.' });
TXT('spsup', { f: 'Dispõe-se de cada lado ao longo da inserção do tentório do cerebelo na porção petrosa do osso temporal. Drena o sangue do seio cavernoso para o seio sigmoide e termina próximo do ângulo entre os seios transverso e sigmoide.' });
TXT('spinf', { f: 'Percorre o sulco petroso inferior, entre o seio cavernoso e o forame jugular, onde termina lançando-se na veia jugular interna.' });
TXT('galeno', { f: 'A mais importante veia do sistema venoso profundo: para ela converge quase todo o sangue desse sistema. É um curto tronco ímpar e mediano, formado pela confluência das veias cerebrais internas logo abaixo do esplênio do corpo caloso, e desemboca no seio reto.', c: 'Suas paredes muito finas rompem-se com facilidade, o que às vezes ocorre em recém-nascidos por traumatismo durante o parto.' });
TXT('vint', { f: 'Veias do sistema venoso profundo, que drena o corpo estriado, a cápsula interna, o diencéfalo e grande parte do centro branco medular do cérebro. Confluem logo abaixo do esplênio do corpo caloso para formar a veia cerebral magna.' });
TXT('silv', { f: 'Principal veia cerebral superficial inferior. Percorre o sulco lateral e termina, em geral, no seio cavernoso.' });
TXT('vsup', { name: 'Veias cerebrais superficiais superiores', f: 'Provêm da face medial e da metade superior da face lateral de cada hemisfério e desembocam no seio sagital superior. As veias do encéfalo em geral não acompanham as artérias e são maiores e mais calibrosas que elas.' });
REF(['sss','sinf','sreto','torcula','stransv','ssigm','jugular','scav','spsup','spinf','socc','sinterc'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 8 (Meninges e Liquor), p. 72-73.');
REF(['galeno','vint','silv','vsup'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 18 (Vascularização do SNC), p. 168.');
NOTA('socc','Trajeto esquemático, na linha média abaixo da confluência dos seios.');
NOTA('sinterc','Trajeto esquemático, à frente e atrás da hipófise.');

/* ---- itens que não foram conferidos no Machado ---- */
function CONF(ids, t) { ids.forEach(id => { META[id].conf = t; }); }
CONF(['a_fbl','a_fbm','a_cent','a_par','a_ang','a_temp','calmarg','a_calc','a_parocc','a_dorsalcc','a_tempinf'], 'Nome e território deste ramo cortical: conferir se aparecem assim no livro. O trajeto no modelo é esquemático, apoiado sobre a malha.');
CONF(['heubner','talamoperf','coropost','coroant','lenticulo'], 'Território descrito de forma resumida; conferir no livro. Trajeto esquemático.');
CONF(['trolard','labbe','basal','spsup','spinf','vsup','silv'], 'Trajeto esquemático; a anatomia venosa varia muito entre indivíduos. Conferir a descrição no livro.');
CONF(['ginsula','gpolof','gbsts'], 'Texto curto escrito para a região nova da malha, sem conferência no livro.');
CONF(['gtt','gcalc'], 'Texto escrito para a região nova da malha a partir dos itens vizinhos; conferir no livro.');
CONF(['abmed','ablat'], 'Os epônimos (Magendie, Luschka) e a posição exata no teto e nos recessos laterais não estão nas páginas conferidas (cap. 8); ver cap. 5.');
CONF(['a_fbl','a_fbm','a_cent','a_par','a_ang','a_temp','calmarg','a_calc','a_parocc','a_dorsalcc','a_tempinf'], 'O cap. 18 do Machado (p. 164-166) descreve os territórios corticais das três artérias cerebrais, mas não nomeia este ramo. Nome, trajeto e território aqui são esquemáticos.');
CONF(['heubner','talamoperf','coropost','coroant','lenticulo','gor'], '');   // conferidos no cap. 18
CONF(['spsup','spinf','vsup','silv'], '');   // conferidos (cap. 8 e cap. 18)
CONF(['trolard','labbe'], 'O Machado (cap. 18, p. 168) descreve as veias cerebrais superficiais superiores e inferiores, mas não nomeia esta veia anastomótica nas páginas lidas. Nome e trajeto são esquemáticos.');
CONF(['basal'], 'A veia basal aparece só na figura 8.3 do Machado (p. 72), sem descrição no texto lido. Trajeto esquemático.');
CONF(['socc','sinterc'], 'Trajeto esquemático. O texto vem do livro; a posição no modelo, não.');
CONF(['acm2','acp1','a_oft','a_labir','a_pont','a_espant'], 'Trajeto esquemático. O texto vem do livro; a posição no modelo, não.');


/* Tudo o que depende da malha roda depois que o GLB embutido é lido. */
function iniciar(gltf) {
/* ---- grandes vias: notas e avisos ---- */
['v_cs', 'v_cn', 'v_lm', 'v_st', 'v_opt', 'v_aud', 'v_vest', 'v_cereb', 'v_nb', 'v_hip'].forEach(k => NOTA(k, 'Trajeto esquemático, desenhado só a partir do hemisfério esquerdo (o da vista lateral); a via do outro lado é simétrica. O modelo não tem medula espinal: a via termina num coto logo abaixo do bulbo. As setas brancas mostram o sentido da condução.'));
NOTA('v_papez', 'Trajeto esquemático, nos dois hemisférios. As setas brancas mostram o sentido do circuito.');
CONF(['v_hip'], 'O cap. 21 diz que o hipotálamo anterior controla o parassimpático e o posterior o simpático, mas não descreve o trajeto das fibras descendentes até o tronco e a medula. Por isso esse trajeto não foi desenhado. A figura 21.2 (trato hipotálamo-hipofisário) não foi conferida.');
CONF(['v_vest'], 'A via vestibular consciente não foi desenhada: o livro diz que o trajeto é controverso (p. 278).');
CONF(['v_papez'], 'O texto vem da p. 249. As consequências clínicas da lesão do circuito (memória) estão no cap. 28, ainda não lido; por isso não há pontos de lesão nesta via.');

/* ---- ramos dos nervos: notas e avisos ---- */
RAMOS.forEach(q => NOTA(q[0], 'Trajeto esquemático. O modelo não tem crânio nem face: a posição dos forames, da órbita, da cavidade timpânica e da face é só indicativa.'));
CONF(['n_v1ramos', 'n_infraorb', 'n_alvinf', 'n7_ramos'], 'O Machado não nomeia estes ramos nas páginas lidas. Nomes pela Terminologia Anatômica; trajeto esquemático. Conferir em outro atlas (Netter).');
CONF(['n_oft', 'n_max', 'n_mand'], 'Os forames constam da tabela da p. 95 do cap. 10, que saiu em branco na digitalização (o do V1 é confirmado pelo cap. 8, p. 73).');
CONF(['g_x'], 'Os nomes jugular e nodoso estão no cap. 10; a posição exata em relação ao forame jugular é aproximada.');

/* ---- prosencéfalo e envoltórios: notas e avisos ---- */
SULCOS.forEach(q => NOTA(q[0], 'Linha traçada sobre a superfície, ao longo da borda entre as regiões da parcelação Desikan-Killiany que este sulco separa. Os limites automáticos nem sempre caem no fundo do sulco: posição aproximada.'));
CONF(['s_olfat'], 'Traçado pela borda entre as regiões orbitofrontais medial e lateral da parcelação, que só aproxima o sulco olfatório.');
CONF(['aderencia'], 'Aparece só como rótulo na figura 7.1; o texto lido não a descreve. Inconstante.');
CONF(['fimbria', 'giroden'], 'Aparecem como rótulos na figura 7.3; o texto lido só cita a fímbria pela ligação do fórnice ao hipocampo. Forma esquemática sobre a malha real do hipocampo.');
NOTA('unco', 'Forma esquemática na parte anterior e medial do giro para-hipocampal.');
['vlat_ant', 'vlat_cent', 'vlat_post', 'vlat_inf'].forEach(k => NOTA(k, 'Parte da malha real do ventrículo lateral, separada por limites aproximados (forame interventricular, átrio).'));
NOTA('vlat', 'Malha real. Cada parte (cornos anterior, posterior e inferior, parte central) pode ser selecionada sozinha.');
['foice', 'tentorio', 'foicecb', 'diafragma'].forEach(k => NOTA(k, 'Lâmina esquemática apoiada nos seios da dura-máter do modelo. Translúcida para não esconder o encéfalo.'));
NOTA('medula', 'Cilindro esquemático continuando o bulbo da malha, que termina pouco abaixo da oliva. As grandes vias terminam nele.');
NOTA('cc', 'Cada parte (rostro, joelho, tronco, esplênio) pode ser selecionada sozinha.');

/* ---- vascularização ampliada: notas e avisos ---- */
NOVOS_VASOS.forEach(q => NOTA(q[0], 'Trajeto esquemático, apoiado na superfície das malhas reais. As veias variam muito entre indivíduos.'));
CONF(['a_hipof'], 'Aparece só como rótulo na figura 18.3; não há descrição no texto lido. Trajeto esquemático.');
CONF(['centrais_am', 'centrais_pl'], 'O Machado descreve os ramos centrais em conjunto. A divisão em grupos (anteromediais, posterolaterais) e o território de cada um não estão nas páginas lidas.');
CONF(['a_polfront', 'a_frontmed', 'a_prefront', 'a_tempant', 'a_tempmed', 'a_temppost'], 'O cap. 18 descreve os territórios das artérias cerebrais, mas não nomeia estes ramos corticais. Nome pela Terminologia Anatômica; conferir em outro atlas (Netter, Rhoton).');
CONF(['v_talest'], 'Aparece só como rótulo na figura 5.2 ("estria terminal e veia tálamo-estriada"). O trajeto e a formação da veia cerebral interna não estão nas páginas lidas.');
CONF(['v_coroid', 'v_septo', 'v_profmed', 'v_cerant', 'v_comunpost', 'v_pontomes', 'v_amponte', 'v_alponte', 'v_ambulbo', 'v_recesso', 'v_vermsup', 'v_verminf', 'v_cerebsup', 'v_cerebinf'], 'Esta veia não é descrita no Machado (cap. 8 e 18). Nome pela Terminologia Anatômica, trajeto esquemático; conferir em outro atlas (Netter, Rhoton).');

/* ---- tronco: notas ---- */
TE_ITENS.forEach(q => NOTA(q[0], 'A malha real do tronco é lisa. Este acidente foi esculpido sobre ela (sulco cavado ou relevo elevado) na posição das figuras 5.1 e 5.2, medida em relação ao perfil ventral do tronco e ao assoalho do IV ventrículo da malha. Posição aproximada.'));
CONF(['fossarom'], 'O nome "fossa romboide" não aparece nas páginas lidas: o Machado fala em assoalho do IV ventrículo de forma losângica.');
CONF(['obex'], 'O óbex aparece só como rótulo na figura 5.2; a descrição é a do canal da porção fechada do bulbo (p. 44).');
CONF(['bracsup'], 'Aparece só como rótulo na figura 5.2 (face dorsal); a ligação ao corpo geniculado lateral não foi conferida no texto. Trajeto esquemático.');
NOTA('bracinf', 'Trajeto esquemático, do colículo inferior ao corpo geniculado medial.');
NOTA('veusup', 'Lâmina esquemática no teto do IV ventrículo, entre os pedúnculos cerebelares superiores.');
CONF(['sullatmes'], 'Posição na face lateral do mesencéfalo aproximada: a figura 5.3 (secção do mesencéfalo) não foi conferida.');

NOTA('pedunc', 'Faixa achatada esquemática sobre a face ventral do mesencéfalo, abrindo-se para o diencéfalo.');
/* ---- substância branca do corpo estriado e hipófise (Prometheus, p. 208 e 222; Machado, cap. 21) ---- */
M('capsext', 'Cápsula externa', 'deep', '#efe6dc', 'Lâmina de substância branca entre o putame e o claustro. De medial para lateral: cápsula interna, núcleo lentiforme (globo pálido e putame), cápsula externa, claustro, cápsula extrema e córtex da ínsula.', '', '');
M('capsextr', 'Cápsula extrema', 'deep', '#efe6dc', 'Lâmina de substância branca entre o claustro e o córtex da ínsula.', '', '');
M('adeno', 'Adeno-hipófise (lobo anterior)', 'dien', '#e8a05a', 'Parte glandular da hipófise, anterior. Secreta GH, TSH, ACTH, FSH, LH e prolactina, sob controle dos fatores liberadores do hipotálamo.', '', '');
M('neurohip', 'Neuro-hipófise (lobo posterior)', 'dien', '#f2c38c', 'Parte neural da hipófise, posterior, continuação do infundíbulo. Libera a vasopressina e a ocitocina produzidas nos núcleos supra-óptico e paraventricular do hipotálamo e trazidas pelo trato hipotálamo-hipofisário.', '', 'Lesão do sistema hipotálamo-neuro-hipofisário: diabetes insipidus (cap. 21, p. 201).');
REF(['capsext', 'capsextr'], 'Prometheus, Cabeça e Neuroanatomia, p. 208 (fig. C, corte horizontal do telencéfalo).');
REF(['adeno', 'neurohip'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 21, p. 201; forma: Prometheus, Cabeça e Neuroanatomia, p. 222.');
TXT('claustro', { f: 'Estria de substância cinzenta lateral ao putame, entre as cápsulas externa e extrema. Não faz parte dos núcleos da base (Prometheus, p. 208).' });
['capsint', 'capsext', 'capsextr', 'claustro'].forEach(k => NOTA(k, 'Lâmina desenhada a partir da superfície real do putame e do globo pálido (malhas do mesmo cérebro), afastada para medial ou lateral; posição aproximada.'));
/* ---- núcleos do cerebelo: forma e sinônimos (Prometheus) ---- */
TXT('denteado', { f: META.denteado.f + ' É uma lâmina de substância cinzenta pregueada, em forma de bolsa, aberta medialmente (hilo), por onde saem as fibras do pedúnculo cerebelar superior. Sinônimo: núcleo lateral do cerebelo; recebe da parte lateral do hemisfério.' });
TXT('emboliforme', { f: META.emboliforme.f + ' Faixa alongada junto ao hilo do denteado. Sinônimo: núcleo interpósito anterior; recebe da parte intermédia.' });
TXT('globoso', { name: 'Núcleos globosos', f: META.globoso.f + ' Duas ou mais pequenas massas entre o emboliforme e o fastigial. Sinônimo: núcleo interpósito posterior; recebe da parte intermédia.' });
TXT('fastigial', { f: META.fastigial.f + ' Junto à linha média, no teto do IV ventrículo. Sinônimo: núcleo medial do cerebelo; recebe do verme.' });
REF(['denteado', 'emboliforme', 'globoso', 'fastigial'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 22, p. 208-209; forma e sinônimos: Prometheus, Cabeça e Neuroanatomia, p. 240.');
NOTA('arbvida', 'No corte, cada lóbulo do verme tem a sua cor e o seu nome; a faixa da borda mostra o lobo (amarelo: anterior; rosa: posterior; verde: floculonodular). Clique num lóbulo do corte para abri-lo. As fissuras prima e posterolateral aparecem mais grossas.');

/* ---- cerebelo: notas ---- */
CBL.map(q => q[0]).concat(['cb_ant', 'cb_post', 'cb_fn']).forEach(k => NOTA(k, 'A malha real do cerebelo é lisa. Os limites dos lóbulos foram traçados pelo ângulo em torno do fastígio, como na secção sagital da figura 5.5, e ajustados às figuras 5.4 e 5.6; as folhas são um relevo desenhado sobre a malha. Posição aproximada.'));
CBF.map(q => q[0]).forEach(k => NOTA(k, 'Traçado aproximado sobre a malha lisa, a partir das figuras 5.4 a 5.6.'));
['pcs', 'pcm', 'pci'].forEach(k => NOTA(k, 'Forma esquemática, dentro do cerebelo: aparece com o cerebelo transparente ou ao selecionar.'));
NOTA('arbvida', 'Aparece na vista medial (hemisfério direito oculto). O contorno vem da malha; as lâminas do corpo medular são desenhadas.');
NOTA('cerebelo', 'Cada lóbulo e cada fissura do hemisfério pode ser selecionado sozinho; este item acende o hemisfério inteiro.');
NOTA('vermis', 'Cada lóbulo do verme pode ser selecionado sozinho; este item acende o verme inteiro. Na vista medial aparece a secção sagital.');
CONF(['arbvida'], 'O nome "árvore da vida" (arbor vitae) não aparece nas páginas lidas do Machado; o desenho das lâminas é esquemático.');
CONF(['cb_lingula', 'cb_central', 'cb_culmen', 'cb_declive', 'cb_folium', 'cb_tuber', 'cb_piramide', 'cb_uvula', 'cb_asa', 'cb_quadant', 'cb_quadpost', 'cb_semisup', 'cb_semiinf', 'cb_biventre'], 'A correspondência entre lóbulos do verme e do hemisfério foi lida nas figuras 5.4 e 5.6 (posição lado a lado); a figura 5.1, com o esquema completo, não foi conferida.');

/* ---- nervos cranianos e núcleos: fonte, notas e avisos ---- */
(function () {
  const nervos = [], nucleos = [];
  Object.keys(META).forEach(k => { if (META[k].grp === 'nc') (META[k].col ? nucleos : nervos).push(k); });
  REF(nervos, 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 10 (Nervos Cranianos), p. 96-102; origens aparentes: cap. 5, p. 43-47; lesões: cap. 19, p. 177-181.');
  REF(nucleos, 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 17 (Núcleos dos Nervos Cranianos), p. 151-154.');
  nervos.forEach(k => NOTA(k, 'Trajeto esquemático. O modelo não tem os ossos do crânio: a posição dos forames é só indicativa, e o nervo é interrompido pouco depois deles.'));
  nucleos.forEach(k => NOTA(k, 'Forma e posição esquemáticas dentro da malha do tronco encefálico, guiadas pelo assoalho do IV ventrículo e pelas figuras 17.1 a 17.4.'));
})();
NOTA('nc2', 'Desenhado do quiasma até o canal óptico. O quiasma e o trato óptico estão no item "Quiasma e vias ópticas".');
NOTA('nc3', 'O tubo fino dentro do mesencéfalo representa as fibras que vão do núcleo até a emergência (figura 17.1). Trajeto esquemático; sem os ossos, a posição da fissura orbital superior é só indicativa.');
NOTA('nc6', 'O tubo fino dentro da ponte representa as fibras que vão do núcleo até a emergência (figura 17.1). Trajeto esquemático.');
NOTA('nc7', 'O tubo fino dentro da ponte representa as fibras que contornam o núcleo do abducente (joelho interno, figura 17.3). O tubo mais delgado ao lado do nervo é o nervo intermédio. Trajeto esquemático.');
CONF(['nc5'], 'Os forames dos três ramos (fissura orbital superior, forame redondo, forame oval) constam da tabela da p. 95 do cap. 10, que saiu em branco na digitalização. Conferir no livro impresso.');
CONF(['nc4'], 'As fibras entre o núcleo e a emergência dorsal não foram desenhadas: o trajeto dentro do mesencéfalo está no cap. 16, ainda não lido.');
CONF(['nc1', 'nc2'], 'A p. 95 do cap. 10 (introdução e tabela dos nervos) saiu em branco na digitalização; o texto vem do item 3 do capítulo (p. 97).');
CONF(['abmed','ablat'], '');   // conferidos no cap. 5, p. 46 (forame de Magendie e forames de Luschka)

/* ---- etapa E: vasos (Prometheus, Cabeça e Neuroanatomia, p. 246-261) ---- */
M('aci_cerv', 'Carótida interna: parte cervical', 'art', '#d8322d', 'Sobe no espaço lateral da faringe, medial à veia jugular interna, sem dar ramos, até o canal carótico.', '', '');
M('aci_petr', 'Carótida interna: parte petrosa', 'art', '#d23a33', 'No canal carótico da parte petrosa do temporal: sobe e dobra em ângulo para frente e medialmente, até o ápice da parte petrosa.', '', '');
M('aci_cav', 'Carótida interna: parte cavernosa', 'art', '#dc443c', 'Dentro do seio cavernoso, ao lado da sela turca, descreve a curva em S. Com o início da parte cerebral forma o sifão carótico (segmentos C2-C4); a parte cavernosa corresponde a C3-C5 (porção infraclinóidea).', '', 'Aneurisma ou fístula carótido-cavernosa comprimem os nervos do seio (III, IV, V1, V2, VI).');
M('aci_cer', 'Carótida interna: parte cerebral', 'art', '#e04f45', 'Perfura a dura-máter na cisterna quiasmática (C1-C2, porção supraclinóidea). Dá a oftálmica, a comunicante posterior e a corióidea anterior e divide-se em artérias cerebrais média e anterior.', '', '');
REF(['aci_cerv', 'aci_petr', 'aci_cav', 'aci_cer'], 'Prometheus, Cabeça e Neuroanatomia, p. 246 (quatro partes da carótida interna e segmentos C1-C5); Machado, cap. 18, p. 162.');
M('smarg', 'Seio marginal', 'ven', '#24468c', 'Plexo venoso em volta do forame magno. Liga os seios da base (plexo basilar e seio occipital) às redes venosas do canal vertebral.', '', '');
M('v_emiss', 'Veias emissárias', 'ven', '#7e9bd6', 'Veias sem válvulas que atravessam aberturas do crânio e ligam os seios às veias do couro cabeludo e às diplóicas: parietal, occipital, mastóidea e condilar. Ajudam a equilibrar a pressão.', '', 'Bactérias do couro cabeludo podem chegar por elas aos seios e às meninges (meningite purulenta).');
M('v_oftsup', 'Veia oftálmica superior', 'ven', '#5a86d6', 'Drena a órbita para a parte anterior do seio cavernoso; comunica-se com a veia angular da face.', '', 'Sem válvulas: infecções da face podem chegar ao seio cavernoso (trombose).');
M('v_occint', 'Veia occipital interna', 'ven', '#5584d8', 'Drena a face medial do lobo occipital, junto ao sulco calcarino, em direção à veia cerebral magna.', '', '');
REF(['smarg', 'v_emiss', 'v_oftsup'], 'Prometheus, Cabeça e Neuroanatomia, p. 254-257.');
REF(['v_occint'], 'Prometheus, Cabeça e Neuroanatomia, p. 258 (figura da face medial).');
CONF(['v_occint'], 'Desembocadura exata (veia cerebral magna ou veia basal) não descrita no texto; trajeto esquemático.');
CONF(['vertebral'], 'Alça sobre o arco posterior do atlas: trajeto aproximado (nem o Machado nem o Prometheus a descrevem em detalhe).');
['trolard', 'labbe', 'basal', 'spsup', 'spinf', 'vsup', 'silv'].forEach(id => { META[id].conf = ''; META[id].ref = (META[id].ref ? META[id].ref + ' ' : '') + 'Confirmado no Prometheus, Cabeça e Neuroanatomia, p. 254-259 (o trajeto das veias varia entre indivíduos).'; });
CONF(['a_fbl','a_fbm','a_cent','a_par','a_ang','a_temp','calmarg','a_calc','a_parocc','a_dorsalcc','a_tempinf','pericalosa','a_frontmed','a_prefront'], 'Os ramos terminais finos são ilustrativos: mostram que a artéria se divide até a periferia do território, não o número real de ramos.');

/* ---- remodelagem 3, fase 2: lobos, giros e sistema límbico (gabarito Unicamp; texto Machado) ---- */
M('lobo_front', 'Lobo frontal', 'cortex', '#4f8fe0', 'À frente do sulco central e acima do sulco lateral. Na face lateral: giros pré-central, frontal superior, médio e inferior; na face inferior, giro reto e giros orbitários.', 'ACA (face medial) e ACM (face lateral).', 'Lesão do giro pré-central: paresia do lado oposto. Lesão do giro frontal inferior do hemisfério dominante: afasia de expressão (Broca).');
M('lobo_par', 'Lobo parietal', 'cortex', '#e0a640', 'Atrás do sulco central, até a linha entre o sulco parietoccipital e a incisura pré-occipital. Giro pós-central, lóbulos parietais superior e inferior (giros supramarginal e angular) e, na face medial, pré-cúneo.', 'ACM (face lateral) e ACA (face medial).', 'Lesão do giro pós-central: perda da sensibilidade do lado oposto.');
M('lobo_temp', 'Lobo temporal', 'cortex', '#45b07a', 'Abaixo do sulco lateral. Giros temporais superior, médio e inferior; na face inferior, giros occipitotemporais e para-hipocampal; no assoalho do sulco lateral, giros temporais transversos (área auditiva).', 'ACM (face lateral) e ACP (face inferior).', '');
M('lobo_occ', 'Lobo occipital', 'cortex', '#d65f8f', 'Atrás da linha parietoccipital. Na face medial, o sulco calcarino separa o cúneo do giro lingual; as suas margens formam a área visual primária.', 'ACP.', 'Lesão da área visual de um lado: hemianopsia do lado oposto.');
M('lobo_limb', 'Lobo límbico', 'cortex', '#9a6fd0', 'Anel de córtex na face medial do hemisfério, em volta do corpo caloso e do diencéfalo: giro do cíngulo, istmo do giro do cíngulo e giro para-hipocampal, com o unco. Faz parte do sistema límbico.', 'ACA (giro do cíngulo) e ACP (istmo e giro para-hipocampal).', 'Lesões do sistema límbico: alterações de memória e do comportamento emocional.');
M('gistmo', 'Istmo do giro do cíngulo', 'cortex', '#d9a3d3', 'Parte estreita do giro do cíngulo, atrás e abaixo do esplênio do corpo caloso; por ela o giro do cíngulo continua-se com o giro para-hipocampal.', 'ACP.', '');
M('fis_long', 'Fissura longitudinal do cérebro', 'cortex', '#3a2a24', 'Fenda mediana profunda que separa os dois hemisférios. Nela fica a foice do cérebro; no fundo dela está o corpo caloso.', '', '');
M('gsubcal', 'Giro subcaloso (área septal)', 'limbic', '#b48ad8', 'Pequena área de córtex na face medial, abaixo do rostro do corpo caloso e à frente da lâmina terminal. Pertence à área septal, ligada ao sistema límbico.', 'ACA.', '');
M('pehipo', 'Pé do hipocampo (cabeça)', 'limbic', '#c99be6', 'Extremidade anterior, alargada, do hipocampo, no assoalho do corno inferior do ventrículo lateral, junto do corpo amigdaloide. As saliências da superfície lembram os dedos de uma pata.', 'Coroídea anterior e ACP.', '');
M('hipo_corpo', 'Hipocampo: corpo e cauda', 'limbic', '#b07fdb', 'Eminência alongada no assoalho do corno inferior do ventrículo lateral. Atrás, a fímbria continua-se com o pilar do fórnice.', 'ACP e coroídea anterior.', 'Lesão bilateral: perda da capacidade de formar memórias novas.');
M('alveo', 'Álveo', 'limbic', '#efe6f7', 'Fina camada de substância branca que cobre a face ventricular do hipocampo. Suas fibras convergem para a fímbria e daí para o fórnice.', '', '');
M('subiculo', 'Subículo', 'limbic', '#8f63c4', 'Zona de transição entre o hipocampo e o giro para-hipocampal. Forma a formação hipocampal junto com o hipocampo e o giro denteado.', 'ACP.', '');
M('f_cingulo', 'Fascículo do cíngulo', 'limbic', '#e9d8f5', 'Feixe de fibras de associação dentro do giro do cíngulo, em arco sobre o corpo caloso; liga o giro do cíngulo ao giro para-hipocampal.', '', '');
M('f_mamtal', 'Fascículo mamilotalâmico', 'limbic', '#f2e4ff', 'Liga o corpo mamilar ao núcleo anterior do tálamo. É uma das etapas do circuito de Papez.', '', '');
M('estria_t', 'Estria terminal', 'limbic', '#e6d2fa', 'Feixe fino que sai do corpo amigdaloide, acompanha a cauda do núcleo caudado e corre no sulco entre o caudado e o tálamo, junto da veia talamoestriada, até a região da comissura anterior e do hipotálamo. É uma das vias eferentes da amígdala.', '', '');
M('subst_inom', 'Substância inominada', 'deep', '#d7c08a', 'Região abaixo do globo pálido e acima da substância perfurada anterior, no nível da comissura anterior. Contém o núcleo basal de Meynert.', 'Lenticuloestriadas e ramos centrais da ACA.', '');
M('meynert', 'Núcleo basal de Meynert', 'deep', '#a8873e', 'Grupo de neurônios grandes, colinérgicos, dentro da substância inominada. Projeta-se para todo o córtex cerebral.', '', 'Degenera na doença de Alzheimer.');
M('trighab', 'Trígono das habênulas', 'dien', '#e5a3b3', 'Pequena área triangular na parte dorsal e posterior do tálamo, à frente da glândula pineal. Contém os núcleos habenulares (epitálamo).', 'Coroídeas posteriores.', '');
M('comhab', 'Comissura das habênulas', 'dien', '#f0c7d1', 'Une os núcleos habenulares dos dois lados, logo acima da raiz da glândula pineal.', '', '');
REF(['lobo_front', 'lobo_par', 'lobo_temp', 'lobo_occ', 'gistmo', 'fis_long'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 7 (Telencéfalo), p. 55-62. Gabarito: Unicamp, cortes coronais.');
REF(['lobo_limb', 'gsubcal', 'pehipo', 'hipo_corpo', 'alveo', 'subiculo', 'f_cingulo', 'f_mamtal', 'estria_t'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 27 (Sistema Límbico). Gabarito: Unicamp, cortes coronais 2 a 9.');
REF(['subst_inom', 'meynert'], 'Gabarito: Unicamp, corte coronal 4 (detalhe 4a1).');
REF(['trighab', 'comhab'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 6 (Diencéfalo). Gabarito: Unicamp, corte coronal 7 (detalhe 7b1).');
CONF(['lobo_limb', 'gsubcal', 'pehipo', 'hipo_corpo', 'alveo', 'subiculo', 'f_cingulo', 'f_mamtal', 'estria_t', 'trighab', 'comhab'], 'Página do Machado a confirmar.');
CONF(['subst_inom', 'meynert'], 'Não conferido no Machado; posição pela Unicamp (corte 4). Página a confirmar.');
NOTA('lobo_limb', 'O lóbulo paracentral (parte frontal e parte parietal) não entra em nenhum lobo aqui; a ínsula é o próprio lobo insular (item Ínsula).');
['gsubcal', 'alveo', 'subiculo', 'f_cingulo', 'f_mamtal', 'estria_t', 'subst_inom', 'meynert', 'trighab', 'comhab'].forEach(id => NOTA(id, 'Forma esquemática, desenhada sobre as malhas reais na posição indicada pela peça da Unicamp; tamanho aproximado.'));
['pehipo', 'hipo_corpo'].forEach(id => NOTA(id, 'Malha real do hipocampo dividida num plano coronal aproximado entre a cabeça e o corpo.'));
/* ---- remodelagem 3, fase 4: núcleos e feixes internos do tronco (gabarito Unicamp, série axial; texto Machado) ---- */
M('nuoliva', 'Núcleo olivar inferior', 'stem', '#c9a04a', 'Lâmina de substância cinzenta pregueada, em forma de bolsa aberta medialmente (hilo), dentro da oliva do bulbo. Envia as fibras olivocerebelares (fibras trepadeiras) ao cerebelo pelo pedúnculo cerebelar inferior.', 'Vertebral e PICA.', '');
M('nugrac', 'Núcleo grácil', 'stem', '#5b8fd6', 'No bulbo fechado, sob o tubérculo do núcleo grácil. Nele terminam as fibras do fascículo grácil (tato epicrítico e propriocepção consciente da metade inferior do corpo); dele sai o lemnisco medial, depois de cruzar.', 'Espinais posteriores.', '');
M('nucun', 'Núcleo cuneiforme', 'stem', '#4c7fc8', 'No bulbo fechado, sob o tubérculo do núcleo cuneiforme, lateral ao grácil. Recebe o fascículo cuneiforme (metade superior do corpo); dele sai o lemnisco medial, depois de cruzar.', 'Espinais posteriores.', '');
M('nupont', 'Núcleos da base da ponte (núcleos pontinos)', 'stem', '#b88a64', 'Grupos de neurônios espalhados entre os feixes longitudinais da base da ponte. Recebem as fibras corticopontinas e enviam as fibras pontocerebelares, que cruzam e formam o pedúnculo cerebelar médio.', 'Ramos pontinos da basilar.', '');
M('freticular', 'Formação reticular', 'stem', '#9c8f86', 'Rede de neurônios e fibras que ocupa o centro do tegmento, do mesencéfalo ao bulbo. Ativação do córtex e vigília, centros respiratório e vasomotor, controle da motricidade e da dor.', 'Ramos paramedianos e circunferenciais curtos.', 'Lesões extensas do tegmento alto: coma.');
M('ctrap', 'Corpo trapezoide', 'stem', '#d9b0e8', 'Fibras transversais da via auditiva na parte ventral do tegmento da ponte, vindas dos núcleos cocleares; muitas cruzam para formar o lemnisco lateral.', 'Ramos da basilar.', '');
M('flm', 'Fascículo longitudinal medial', 'stem', '#e8e0cf', 'Feixe paramediano, logo abaixo do assoalho do IV ventrículo e do aqueduto. Liga os núcleos vestibulares aos núcleos dos nervos III, IV e VI (movimentos conjugados dos olhos).', '', 'Lesão: oftalmoplegia internuclear.');
REF(['nuoliva', 'nugrac', 'nucun', 'nupont', 'freticular', 'ctrap', 'flm'], 'Machado, Neuroanatomia Funcional, 4ª ed., cap. 16 e 17 (estrutura do tronco encefálico). Gabarito: Unicamp, série axial de cerebelo e tronco.');
CONF(['nuoliva', 'nugrac', 'nucun', 'nupont', 'freticular', 'ctrap', 'flm'], 'Página do Machado a confirmar.');
['nuoliva', 'nugrac', 'nucun', 'nupont', 'freticular', 'ctrap', 'flm'].forEach(id => NOTA(id, 'Forma esquemática; posição tirada das regiões reais da superfície do tronco (oliva, tubérculos, assoalho do IV ventrículo).'));
