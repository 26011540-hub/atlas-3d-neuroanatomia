// Gera gabarito/unicamp-coronal.json e GABARITO.md.
// Fonte dos níveis e das estruturas: Atlas de anatomia do cérebro humano em cortes coronais, Neupatimagem, FCM-UNICAMP
// (https://anatpat.unicamp.br/bineucerebrocoronalindice.html). Só os nomes das estruturas por corte (fatos anatômicos)
// foram anotados aqui; nenhuma foto ou desenho foi copiado. Uso: node gabarito/montar_gabarito.cjs
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');

// termo da Unicamp -> [id no Mímir ou null, observação]; null = ainda não existe no atlas (entra nas fases 2 a 4)
const MAPA = {
  'Fissura longitudinal do cérebro': ['fis_long'],
  'Giro do cíngulo': ['gcing'], 'Giro do cíngulo, istmo': ['gistmo'],
  'Giro frontal superior': ['gfs'], 'Giro frontal médio': ['gfm'], 'Giro frontal inferior': ['gfi_tr', 'partes opercular, triangular e orbital'],
  'Giros orbitários': ['gor'], 'Giro reto': ['greto'], 'Lobo frontal': ['lobo_front'], 'Lobo temporal': ['lobo_temp'],
  'Lobo parietal': ['lobo_par'], 'Lobo occipital': ['lobo_occ'],
  'Trato olfatório': ['bulbolf'], 'Artéria cerebral anterior': ['aca1'], 'Artéria cerebral média': ['acm'], 'Artéria cerebral posterior': ['acp'],
  'Artéria basilar': ['basilar'], 'Artéria vertebral': ['vertebral'], 'Artérias lentículo-estriadas': ['lenticulo'],
  'Corpo caloso, joelho': ['cc_joelho'], 'Corpo caloso, corpo': ['cc_tronco'], 'Corpo caloso, esplênio': ['cc_esplenio'], 'Corpo caloso': ['cc'],
  'Corpo caloso, radiação posterior (fórceps maior)': [null, 'falta: fórceps maior'], 'Tapetum': [null, 'falta: tapete (fibras do corpo caloso)'],
  'Ventrículo lateral, corno anterior': ['vlat_ant'], 'Ventrículo lateral, corpo': ['vlat_cent'], 'Ventrículo lateral, corno inferior': ['vlat_inf'],
  'Ventrículo lateral, corno posterior': ['vlat_post'], 'Ventrículo lateral, átrio': ['vlat', 'falta o átrio como parte'],
  'Ventrículo, terceiro (III)': ['v3'], 'Ventrículo, quarto': ['v4'], 'Ventrículo, quarto, assoalho': ['fossarom'], 'Ventrículo, quarto, teto': ['v4', 'falta o teto como parte'],
  'Ventrículo, quarto, recesso lateral': ['v4', 'falta o recesso lateral como parte'], 'Abertura lateral do IV ventrículo (Luschka)': ['ablat'],
  'Abertura mediana do IV ventrículo (Magendie)': ['abmed'], 'Forâmen interventricular (Monro)': ['fmonro'], 'Aqueduto cerebral': ['aqueduto'],
  'Núcleo caudado, cabeça': ['caudado'], 'Núcleo caudado, corpo': ['caudado'], 'Núcleo caudado, cauda': ['caudado'], 'Núcleo caudado': ['caudado'],
  'Sulco lateral (Sylvius)': ['s_lateral'], 'Cápsula interna': ['capsint'], 'Cápsula interna, ramo anterior': ['capsint', 'falta a perna anterior como parte'],
  'Cápsula externa': ['capsext'], 'Cápsula extrema': ['capsextr'], 'Claustrum': ['claustro'], 'Cíngulo (fascículo)': ['f_cingulo'],
  'Giro subcaloso': ['gsubcal'], 'Ínsula': ['ginsula'], 'Núcleo accumbens': ['accumbens'], 'Putâmen': ['putame'], 'Septo pelúcido': ['septo'],
  'Nervo óptico': ['nc2'], 'Quiasma óptico': ['quiasma'], 'Trato óptico': ['quiasma'], 'Striatum': ['caudado', 'estriado = caudado + putame (+ accumbens)'],
  'Comissura anterior': ['comant'], 'Fórnix, colunas': ['fornice'], 'Fórnix, corpo': ['fornice'], 'Fórnix, fímbria': ['fimbria'], 'Fímbria do hipocampo': ['fimbria'],
  'Globo pálido': ['gpe', 'segmentos externo e interno'], 'Núcleo lentiforme': ['putame', 'lentiforme = putame + globo pálido'],
  'Núcleo amigdaloide': ['amigdala'], 'Uncus': ['unco'], 'Hipotálamo': ['hipotal'], 'Coroa radiada': [null, 'falta: coroa radiada'],
  'Formação hipocampal': ['hipocampo'], 'Pé do hipocampo': ['pehipo'], 'Subículo': ['subiculo'], 'Álveo': ['alveo'],
  'Ponte, base': ['baseponte'], 'Ponte, tegmento': ['ponte', 'falta o tegmento da ponte como parte'], 'Ponte': ['ponte'], 'Bulbo': ['bulbo'], 'Mesencéfalo': ['mesenc'],
  'Cisterna supraselar': [null, 'falta: cisternas'], 'Cisterna perimesencefálica (ambiens)': [null, 'falta: cisternas'], 'Cisterna magna': [null, 'falta: cisternas'],
  'Cisterna supracerebelar': [null, 'falta: cisternas'],
  'Núcleo basal de Meynert': ['meynert'], 'Substância inominada': ['subst_inom'],
  'Giros occípito-temporais': ['gfus'], 'Giro occípito-temporal lateral': ['gfus'], 'Giro occípito-temporal medial': ['gling'],
  'Giro temporal superior': ['gts'], 'Giro temporal médio': ['gtm'], 'Giro temporal inferior': ['gti'], 'Giro para-hipocampal': ['gparahip'],
  'Nervo oculomotor (III)': ['nc3'], 'Nervo trigêmeo (V)': ['nc5'], 'Nervo facial (VII)': ['nc7'], 'Nervo vestibulococlear (VIII)': ['nc8'],
  'Sulco colateral': ['s_colateral'], 'Sulco occípito-temporal': ['s_occtemp'], 'Sulco temporal superior': ['s_tempsup'], 'Sulco temporal inferior': ['s_tempinf'],
  'Sulco bulbo-pontino': ['sulbp'], 'Sulco central (Rolando)': ['s_central'], 'Sulco do cíngulo': ['s_cingulo'], 'Sulco parieto-occipital': ['s_parocc'],
  'Sulco pós-central': ['s_poscentral'], 'Fissura calcarina': ['s_calcarino'], 'Fissura transversa do cérebro': [null, 'falta: fissura transversa'],
  'Aderência intertalâmica': ['aderencia'], 'Fossa interpeduncular': ['fossaip'], 'Núcleo subtalâmico': ['subtal'], 'Substância negra': ['snegra'],
  'Núcleo rubro': ['rubro'], 'Tálamo': ['talamo'], 'Tálamo, pulvinar': ['talamo', 'falta o pulvinar como parte'], 'Lâmina medular interna (tálamo)': [null, 'falta: lâmina medular interna'],
  'Plexo coroide do ventrículo lateral': ['plexo'], 'Plexo coroide do IV ventrículo': ['plexo'], 'Tela coroide': [null, 'falta: tela coroide'],
  'Pedúnculo cerebral': ['pedunc'], 'Pirâmides bulbares': ['piramide'], 'Trato córtico-espinal': ['v_cs'], 'Fascículo mamilotalâmico': ['f_mamtal'],
  'Substância perfurada posterior': [null, 'falta: substância perfurada posterior'], 'Centro branco medular (centro semioval)': ['cbm'],
  'Cerebelo, hemisfério': ['cerebelo'], 'Cerebelo, vermis': ['vermis'], 'Cerebelo, flóculo': ['cb_floculo'], 'Cerebelo, tonsila': ['cb_tonsila'],
  'Cerebelo, nódulo': ['cb_nodulo'], 'Cerebelo, língula': ['cb_lingula'], 'Cerebelo, núcleo denteado': ['denteado'], 'Cerebelo, núcleos': ['denteado', 'denteado, emboliforme, globosos e fastigial'],
  'Cerebelo, centro branco medular': ['cb_cbm'], 'Cerebelo, valécula': [null, 'falta: valécula'], 'Córtex cerebelar': ['cerebelo'],
  'Cerebelo, véu medular superior': ['veusup'], 'Pedúnculo cerebelar superior': ['pcs'], 'Pedúnculo cerebelar superior, decussação': [null, 'falta: decussação dos pedúnculos cerebelares superiores'],
  'Pedúnculo cerebelar médio': ['pcm'], 'Pedúnculo cerebelar inferior (corpo restiforme)': ['pci'], 'Núcleo olivar inferior': ['oliva', 'a oliva é a saliência; falta o núcleo olivar'],
  'Corpo geniculado lateral': ['cgl'], 'Estria terminal': ['estria_t'], 'Veia terminal (talamoestriada)': ['v_talest'],
  'Glândula pineal': ['pineal'], 'Placa quadrigêmea (teto)': ['colsup', 'colículos superiores e inferiores'], 'Colículo superior': ['colsup'], 'Colículo inferior': ['colinf'],
  'Locus ceruleus': ['locus'], 'Trígono das habênulas': ['trighab'], 'Foice do cérebro': ['foice'], 'Tenda do cerebelo': ['tentorio'],
  'Aracnoide': [null, 'fora do escopo por enquanto (meninges finas)'], 'Pia-máter': [null, 'fora do escopo por enquanto (meninges finas)'],
  'Eminência colateral': [null, 'falta: eminência colateral'], 'Trígono colateral': [null, 'falta: trígono colateral'], 'Radiação óptica': ['v_opt'],
  'Óbex': ['obex'], 'Tubérculo grácil': ['tubgrac'], 'Tubérculo cuneiforme': ['tubcun'], 'Veia cerebral magna (Galeno)': ['galeno'],
  'Córtex cerebral': ['cx_cinza'], 'Calcar avis': [null, 'falta: calcar avis'], 'Lóbulo paracentral': ['gpara'], 'Lóbulo parietal inferior': ['gsm', 'giros supramarginal e angular'],
  'Lóbulo parietal superior': ['gps'], 'Pré-cúneo': ['gprec'], 'Cúneo': ['gcun'], 'Córtex visual primário (área 17)': ['gcalc'], 'Estria de Gennari': ['gcalc', 'falta a estria como detalhe'],
  'Espaços de Virchow-Robin': [null, 'fora do escopo (microscópico)']
};

// cortes: face a = anterior (com os detalhes a1, a2), face b = posterior (com b1, b2). Notas = páginas do PDF de anotações do Gustavo.
const C = (n, a, b, notas, nivel) => ({ n, url: `https://anatpat.unicamp.br/bineucerebrocoronal${n}.html`, nivel, a, b, notas });
const CORTES = [
  C(1, ['Fissura longitudinal do cérebro', 'Giro do cíngulo', 'Giro frontal superior', 'Giro frontal médio', 'Giro frontal inferior', 'Giros orbitários', 'Giro reto', 'Lobo frontal', 'Trato olfatório'],
    ['Artéria cerebral anterior', 'Corpo caloso, joelho', 'Giro do cíngulo', 'Giro reto', 'Ventrículo lateral, corno anterior'], ['p. 14 (alto, face A)'], 'polo frontal até o joelho do corpo caloso'),
  C(2, ['Corpo caloso, joelho', 'Fissura longitudinal do cérebro', 'Giro do cíngulo', 'Lobo frontal', 'Lobo temporal', 'Núcleo caudado, cabeça', 'Sulco lateral (Sylvius)', 'Ventrículo lateral, corno anterior'],
    ['Artéria cerebral média', 'Cápsula interna, ramo anterior', 'Cíngulo (fascículo)', 'Claustrum', 'Corpo caloso, corpo', 'Giro do cíngulo', 'Giro subcaloso', 'Ínsula', 'Lobo temporal', 'Núcleo accumbens', 'Núcleo caudado, cabeça', 'Putâmen', 'Septo pelúcido', 'Sulco lateral (Sylvius)', 'Ventrículo lateral, corno anterior', 'Espaços de Virchow-Robin'],
    ['p. 14 (baixo, face P)', 'p. 11 (baixo, face A)'], 'cabeça do caudado, accumbens e perna anterior da cápsula interna'),
  C(3, ['Artéria cerebral anterior', 'Artéria cerebral média', 'Cápsula externa', 'Cápsula extrema', 'Claustrum', 'Giro subcaloso', 'Ínsula', 'Lobo frontal', 'Nervo óptico', 'Núcleo caudado, cabeça', 'Putâmen', 'Quiasma óptico', 'Septo pelúcido', 'Striatum', 'Sulco lateral (Sylvius)', 'Ventrículo lateral, corno anterior'],
    ['Artéria cerebral média', 'Cápsula interna', 'Claustrum', 'Comissura anterior', 'Corpo caloso', 'Fórnix, colunas', 'Globo pálido', 'Núcleo amigdaloide', 'Núcleo caudado, cabeça', 'Putâmen', 'Ventrículo, terceiro (III)', 'Trato óptico', 'Uncus', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Artérias lentículo-estriadas', 'Cápsula externa', 'Cápsula extrema', 'Hipotálamo', 'Ínsula', 'Artéria cerebral anterior'],
    ['p. 15 (A e P)'], 'quiasma óptico e comissura anterior'),
  C(4, ['Artéria basilar', 'Cápsula interna', 'Claustrum', 'Comissura anterior', 'Coroa radiada', 'Corpo caloso', 'Fissura longitudinal do cérebro', 'Formação hipocampal', 'Globo pálido', 'Ínsula', 'Núcleo amigdaloide', 'Ponte, base', 'Putâmen', 'Sulco lateral (Sylvius)', 'Trato óptico', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artérias lentículo-estriadas', 'Artéria cerebral média', 'Cápsula externa', 'Cápsula extrema', 'Cisterna supraselar', 'Fórnix, colunas', 'Hipotálamo', 'Núcleo basal de Meynert', 'Núcleo caudado', 'Septo pelúcido', 'Substância inominada', 'Espaços de Virchow-Robin',
      'Artéria cerebral posterior', 'Forâmen interventricular (Monro)', 'Giros occípito-temporais', 'Giro temporal inferior', 'Giro temporal médio', 'Giro temporal superior', 'Nervo oculomotor (III)', 'Pé do hipocampo', 'Sulco colateral', 'Uncus'],
    ['Aderência intertalâmica', 'Cápsula interna', 'Coroa radiada', 'Formação hipocampal', 'Fórnix, corpo', 'Fossa interpeduncular', 'Núcleo caudado', 'Núcleo lentiforme', 'Núcleo subtalâmico', 'Plexo coroide do ventrículo lateral', 'Ponte, base', 'Substância negra', 'Tálamo', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artéria cerebral média', 'Artéria cerebral posterior', 'Forâmen interventricular (Monro)', 'Pedúnculo cerebral', 'Septo pelúcido'],
    ['p. 12 (baixo, face A)'], 'amígdala, início do tálamo e núcleo subtalâmico'),
  C(5, ['Centro branco medular (centro semioval)', 'Corpo caloso, corpo', 'Cápsula interna', 'Fórnix, corpo', 'Fossa interpeduncular', 'Formação hipocampal', 'Forâmen interventricular (Monro)', 'Nervo trigêmeo (V)', 'Núcleo caudado, corpo', 'Núcleo lentiforme', 'Núcleo subtalâmico', 'Pedúnculo cerebral', 'Pirâmides bulbares', 'Plexo coroide do ventrículo lateral', 'Ponte, base', 'Substância negra', 'Tálamo', 'Trato córtico-espinal', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artéria cerebral anterior', 'Artéria cerebral média', 'Artéria cerebral posterior', 'Claustrum', 'Fascículo mamilotalâmico', 'Sulco lateral (Sylvius)', 'Giro para-hipocampal', 'Giro temporal inferior', 'Giro temporal médio', 'Giro temporal superior', 'Ínsula',
      'Cisterna perimesencefálica (ambiens)', 'Fímbria do hipocampo', 'Subículo', 'Sulco colateral', 'Sulco temporal inferior', 'Sulco temporal superior', 'Trato óptico', 'Uncus', 'Ventrículo lateral, corno inferior'],
    ['Artéria cerebral anterior', 'Artéria cerebral média', 'Artéria cerebral posterior', 'Cápsula interna', 'Centro branco medular (centro semioval)', 'Corpo caloso, corpo', 'Formação hipocampal', 'Fórnix, corpo', 'Ínsula', 'Mesencéfalo', 'Núcleo caudado, corpo', 'Pedúnculo cerebral', 'Pirâmides bulbares', 'Ponte, base', 'Putâmen', 'Sulco lateral (Sylvius)', 'Tálamo', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Cápsula externa', 'Cápsula extrema', 'Claustrum', 'Forâmen interventricular (Monro)', 'Núcleo caudado, cauda', 'Núcleo rubro', 'Plexo coroide do ventrículo lateral', 'Substância negra', 'Substância perfurada posterior', 'Trato óptico', 'Trato córtico-espinal'],
    ['p. 8 (baixo, face A)', 'p. 12 (baixo)'], 'tálamo, núcleo subtalâmico, substância negra e núcleo rubro, com o tronco no plano do corte'),
  C(6, ['Cápsula interna', 'Centro branco medular (centro semioval)', 'Cerebelo, hemisfério', 'Fissura longitudinal do cérebro', 'Forâmen interventricular (Monro)', 'Formação hipocampal', 'Giro do cíngulo', 'Ínsula', 'Mesencéfalo', 'Nervo facial (VII)', 'Nervo vestibulococlear (VIII)', 'Núcleo caudado, corpo', 'Núcleo lentiforme', 'Núcleo rubro', 'Pedúnculo cerebral', 'Pirâmides bulbares', 'Ponte', 'Substância negra', 'Sulco bulbo-pontino', 'Tálamo', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Cápsula externa', 'Cápsula extrema', 'Claustrum', 'Fórnix, corpo', 'Lâmina medular interna (tálamo)', 'Putâmen', 'Septo pelúcido', 'Trato córtico-espinal', 'Álveo', 'Artéria cerebral posterior', 'Fímbria do hipocampo', 'Giro para-hipocampal', 'Giro occípito-temporal lateral', 'Giro temporal inferior', 'Núcleo caudado, cauda', 'Plexo coroide do ventrículo lateral', 'Sulco colateral', 'Sulco occípito-temporal', 'Trato óptico', 'Ventrículo lateral, corno inferior'],
    ['Bulbo', 'Cápsula interna', 'Cisterna perimesencefálica (ambiens)', 'Corpo caloso, corpo', 'Corpo geniculado lateral', 'Fórnix, corpo', 'Formação hipocampal', 'Mesencéfalo', 'Pedúnculo cerebelar médio', 'Ponte', 'Putâmen', 'Núcleo caudado, corpo', 'Tálamo', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artéria cerebral anterior', 'Artéria cerebral média', 'Artéria cerebral posterior', 'Forâmen interventricular (Monro)', 'Ínsula', 'Núcleo caudado, cauda', 'Pedúnculo cerebelar superior, decussação', 'Pedúnculo cerebral', 'Trato córtico-espinal', 'Veia terminal (talamoestriada)'],
    ['p. 10 (alto, face A)', 'p. 10 (baixo, face P)'], 'tálamo com núcleo rubro e substância negra; ponte e bulbo no plano'),
  C(7, ['Cápsula interna', 'Centro branco medular (centro semioval)', 'Cerebelo, flóculo', 'Cerebelo, hemisfério', 'Corpo caloso, corpo', 'Corpo geniculado lateral', 'Estria terminal', 'Formação hipocampal', 'Fórnix, corpo', 'Fórnix, fímbria', 'Giro do cíngulo', 'Ínsula', 'Mesencéfalo', 'Núcleo caudado, corpo', 'Núcleo olivar inferior', 'Pedúnculo cerebelar médio', 'Pedúnculo cerebelar superior, decussação', 'Pedúnculo cerebral', 'Pirâmides bulbares', 'Putâmen', 'Tálamo', 'Veia terminal (talamoestriada)', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artéria cerebral posterior', 'Cisterna perimesencefálica (ambiens)', 'Giro occípito-temporal lateral', 'Giro para-hipocampal', 'Núcleo caudado, cauda', 'Plexo coroide do ventrículo lateral', 'Subículo', 'Trato córtico-espinal', 'Ventrículo lateral, corno inferior',
      'Abertura lateral do IV ventrículo (Luschka)', 'Aracnoide', 'Artéria vertebral', 'Bulbo', 'Ponte, base', 'Sulco bulbo-pontino'],
    ['Aqueduto cerebral', 'Bulbo', 'Cerebelo, hemisfério', 'Corpo caloso, corpo', 'Foice do cérebro', 'Formação hipocampal', 'Fórnix, fímbria', 'Glândula pineal', 'Mesencéfalo', 'Pedúnculo cerebelar médio', 'Placa quadrigêmea (teto)', 'Plexo coroide do ventrículo lateral', 'Ponte, tegmento', 'Sulco lateral (Sylvius)', 'Tálamo', 'Tenda do cerebelo', 'Ventrículo lateral, corpo', 'Ventrículo, terceiro (III)',
      'Artéria cerebral posterior', 'Colículo inferior', 'Colículo superior', 'Fissura transversa do cérebro', 'Locus ceruleus', 'Núcleo caudado, cauda', 'Tela coroide', 'Trígono das habênulas', 'Veia terminal (talamoestriada)'],
    ['p. 7 (alto)', 'p. 8 (alto, face P)', 'p. 12 (alto, face P)'], 'pineal, colículos, corpo geniculado lateral e aqueduto'),
  C(8, ['Aqueduto cerebral', 'Cápsula interna', 'Cerebelo, hemisfério', 'Cisterna perimesencefálica (ambiens)', 'Corpo caloso, corpo', 'Bulbo', 'Fissura transversa do cérebro', 'Formação hipocampal', 'Fórnix, fímbria', 'Giro do cíngulo', 'Glândula pineal', 'Locus ceruleus', 'Núcleo caudado, cauda', 'Núcleo caudado, corpo', 'Pedúnculo cerebelar médio', 'Placa quadrigêmea (teto)', 'Plexo coroide do ventrículo lateral', 'Ponte, tegmento', 'Tálamo, pulvinar', 'Veia terminal (talamoestriada)', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo',
      'Artéria cerebral anterior', 'Artéria cerebral posterior', 'Eminência colateral', 'Fórnix, corpo', 'Pia-máter', 'Striatum', 'Sulco colateral', 'Tela coroide', 'Cerebelo, tonsila', 'Colículo inferior', 'Colículo superior', 'Pedúnculo cerebelar inferior (corpo restiforme)', 'Ventrículo, quarto, assoalho', 'Ventrículo, quarto, recesso lateral'],
    ['Bulbo', 'Cerebelo, centro branco medular', 'Cerebelo, hemisfério', 'Cerebelo, vermis', 'Cisterna supracerebelar', 'Corpo caloso, esplênio', 'Formação hipocampal', 'Pia-máter', 'Plexo coroide do ventrículo lateral', 'Radiação óptica', 'Trígono colateral', 'Ventrículo lateral, átrio', 'Ventrículo lateral, corno inferior', 'Ventrículo lateral, corpo', 'Ventrículo, quarto',
      'Cerebelo, nódulo', 'Cerebelo, núcleos', 'Cisterna magna', 'Plexo coroide do IV ventrículo', 'Ventrículo, quarto, assoalho',
      'Abertura mediana do IV ventrículo (Magendie)', 'Aracnoide', 'Cerebelo, língula', 'Tenda do cerebelo', 'Óbex', 'Tubérculo cuneiforme', 'Tubérculo grácil', 'Veia cerebral magna (Galeno)', 'Ventrículo, quarto, recesso lateral'],
    ['p. 7 (baixo)', 'p. 9 (alto, face A)', 'p. 13 (baixo, face A)'], 'pulvinar e esplênio; IV ventrículo aberto no plano'),
  C(9, ['Cerebelo, tonsila', 'Cerebelo, centro branco medular', 'Cerebelo, vermis', 'Cisterna magna', 'Corpo caloso, esplênio', 'Formação hipocampal', 'Giro do cíngulo', 'Lobo parietal', 'Plexo coroide do ventrículo lateral', 'Radiação óptica', 'Tapetum', 'Veia cerebral magna (Galeno)', 'Ventrículo lateral, átrio', 'Ventrículo, quarto, recesso lateral', 'Ventrículo, quarto, teto',
      'Aracnoide', 'Córtex cerebelar', 'Cisterna supracerebelar', 'Córtex cerebral', 'Fórnix, fímbria', 'Pia-máter', 'Cerebelo, língula', 'Cerebelo, nódulo', 'Cerebelo, véu medular superior', 'Pedúnculo cerebelar superior', 'Abertura lateral do IV ventrículo (Luschka)'],
    ['Cisterna supracerebelar', 'Corpo caloso, esplênio', 'Corpo caloso, radiação posterior (fórceps maior)', 'Giro do cíngulo', 'Giro do cíngulo, istmo', 'Giro occípito-temporal lateral', 'Giro occípito-temporal medial', 'Giro temporal inferior', 'Giro temporal médio', 'Giro temporal superior', 'Lóbulo paracentral', 'Lóbulo parietal inferior', 'Pré-cúneo', 'Radiação óptica', 'Sulco central (Rolando)', 'Sulco lateral (Sylvius)', 'Veia cerebral magna (Galeno)', 'Ventrículo lateral, corno posterior',
      'Cerebelo, núcleo denteado', 'Cerebelo, vermis', 'Plexo coroide do ventrículo lateral', 'Ventrículo, quarto, teto'],
    ['p. 13 (alto, face P)', 'p. 9 (baixo, face P)'], 'esplênio do corpo caloso e átrio; núcleo denteado'),
  C(10, ['Calcar avis', 'Cerebelo, núcleo denteado', 'Tenda do cerebelo', 'Cerebelo, vermis', 'Corpo caloso, radiação posterior (fórceps maior)', 'Fissura longitudinal do cérebro', 'Foice do cérebro', 'Giro do cíngulo', 'Giro do cíngulo, istmo', 'Giro occípito-temporal lateral', 'Giro occípito-temporal medial', 'Giro temporal inferior', 'Giro temporal médio', 'Giro temporal superior', 'Plexo coroide do ventrículo lateral', 'Radiação óptica', 'Ventrículo lateral, corno posterior',
      'Aracnoide', 'Cerebelo, tonsila', 'Cisterna magna', 'Córtex cerebelar', 'Córtex cerebral', 'Ventrículo, quarto, teto'], [], [], 'corno posterior e calcar avis'),
  C(11, ['Cerebelo, centro branco medular', 'Cerebelo, hemisfério', 'Cerebelo, núcleo denteado', 'Cerebelo, valécula', 'Cerebelo, vermis', 'Fissura longitudinal do cérebro', 'Giro temporal inferior', 'Giro temporal superior', 'Lóbulo paracentral', 'Lóbulo parietal inferior', 'Lóbulo parietal superior', 'Pré-cúneo', 'Radiação óptica', 'Tapetum', 'Ventrículo lateral, corno posterior'], [], [], 'lobos parietais e occipitais; cerebelo com o denteado'),
  C(12, ['Cerebelo, hemisfério', 'Cerebelo, vermis', 'Cúneo', 'Fissura calcarina', 'Lobo occipital', 'Lóbulo paracentral', 'Lóbulo parietal inferior', 'Pré-cúneo', 'Sulco do cíngulo', 'Sulco parieto-occipital', 'Sulco pós-central', 'Córtex visual primário (área 17)', 'Estria de Gennari', 'Ventrículo lateral, corno posterior'], [], [], 'polo occipital: cúneo, fissura calcarina e área 17')
];

// conferências
const semMapa = new Set(); CORTES.forEach(c => [...c.a, ...c.b].forEach(t => { if (!MAPA[t]) semMapa.add(t); }));
if (semMapa.size) { console.error('termos sem mapeamento:', [...semMapa]); process.exit(1); }
const uniq = l => [...new Set(l)];
CORTES.forEach(c => { c.a = uniq(c.a); c.b = uniq(c.b); });
const json = { fonte: 'Atlas de anatomia do cérebro humano em cortes coronais, Neupatimagem, Departamento de Anatomia Patológica, FCM-UNICAMP. https://anatpat.unicamp.br/bineucerebrocoronalindice.html',
  aviso: 'Só os nomes das estruturas por corte; nenhuma imagem copiada. As fotos são dos autores (uso comercial e reprodução em bloco vedados).',
  mapa: Object.fromEntries(Object.entries(MAPA).map(([t, [id, obs]]) => [t, { id, obs: obs || '' }])), cortes: CORTES };
fs.writeFileSync(path.join(__dirname, 'unicamp-coronal.json'), JSON.stringify(json, null, 1));

// dados embutidos no atlas (modo Bolachas): ids do Mímir por face, sem repetição
const GABJS = CORTES.map(c => ({ n: c.n, url: c.url, nivel: c.nivel, a: uniq(c.a.map(t => MAPA[t][0]).filter(Boolean)), b: uniq(c.b.map(t => MAPA[t][0]).filter(Boolean)) }));
fs.writeFileSync(path.join(RAIZ, 'src', 'js', '01-gabarito.js'), '/* ===== GABARITO DAS BOLACHAS (gerado por gabarito/montar_gabarito.cjs a partir do atlas de cortes coronais da Unicamp; só nomes, nenhuma imagem) ===== */\nconst GAB = ' + JSON.stringify(GABJS) + ';\n');
// GABARITO.md
const nomeId = id => id ? '`' + id + '`' : '**falta**';
let md = `# Gabarito das bolachas (cortes coronais)

Base: [Atlas de anatomia do cérebro humano em cortes coronais](https://anatpat.unicamp.br/bineucerebrocoronalindice.html), Neupatimagem, FCM-UNICAMP: 12 cortes, do polo frontal ao polo occipital, cada um com a face anterior (a) e a posterior (b).
Aqui estão só os nomes das estruturas por face, com o item correspondente no Mímir. Nenhuma foto foi copiada: as imagens pertencem aos autores. Cada bolacha do Mímir vai ter o botão "ver a peça real na Unicamp".
As páginas das Notas do Gustavo (material pessoal, não publicado) estão na coluna "Notas". O texto de cada estrutura segue o Machado (capítulo e página no painel do atlas).

Gerado por \`gabarito/montar_gabarito.cjs\`; os dados ficam em \`gabarito/unicamp-coronal.json\`.

`;
CORTES.forEach(c => {
  md += `## Corte ${c.n}: ${c.nivel}\n[ver na Unicamp](${c.url})${c.notas.length ? ' · Notas: ' + c.notas.join(', ') : ''}\n\n| Face | Estrutura (Unicamp) | No Mímir | Observação |\n|---|---|---|---|\n`;
  [['a', 'anterior'], ['b', 'posterior']].forEach(([f, nome]) => c[f].forEach(t => { const m = MAPA[t]; md += `| ${nome} | ${t} | ${nomeId(m[0])} | ${m[1] || ''} |\n`; }));
  md += '\n';
});
const faltam = uniq(Object.entries(MAPA).filter(([t, m]) => !m[0] && !/fora do escopo/.test(m[1] || '')).map(([t]) => t));
const parciais = Object.entries(MAPA).filter(([t, m]) => m[0] && /falta/.test(m[1] || '')).map(([t, m]) => `${t} (${m[1]})`);
md += `## Resumo para as próximas fases\n\n**Estruturas da Unicamp que ainda não existem no Mímir (${faltam.length}):** ${faltam.join('; ')}.\n\n**Existem, mas sem a parte que a Unicamp mostra (${parciais.length}):** ${parciais.join('; ')}.\n`;
fs.writeFileSync(path.join(RAIZ, 'GABARITO.md'), md);
const total = uniq(CORTES.flatMap(c => [...c.a, ...c.b]));
console.log('cortes', CORTES.length, '| termos', total.length, '| no atlas', total.filter(t => MAPA[t][0]).length, '| faltam', faltam.length, '| parciais', parciais.length);
