/* ===== REGISTRO DO CEREBELO (reforma do cerebelo, Fase 0) =====
   REG_CEREBELO vem de data/registro_cerebelo.json (embutido por scripts/embutir_glb.mjs). Dele saem o nome, os
   sinônimos (que entram na busca), a cor e a classificação (lobo, Larsell, zona, divisão funcional) de cada item.
   Também separa as camadas: cerebelo e pedúnculos cerebelares deixam o grupo do tronco encefálico
   (grupos "cereb" e "ped"), com malhas movidas para os grupos novos; malhas carregadas depois (cerebelo real,
   núcleos do SUIT) já entram no grupo certo porque o grupo é lido do META na hora do registro. */
const REG_CB = {};
(typeof REG_CEREBELO !== 'undefined' ? REG_CEREBELO.estruturas : []).forEach(e => {
  REG_CB[e.id] = e;
  const m = META[e.id]; if (!m) return;
  m.name = e.nome; if (e.cor) m.color = e.cor; m.sin = e.sinonimos || []; m.reg = e;
  const grupo = e.grupo === 'pedúnculo' ? 'ped' : 'cereb';
  if (m.grp !== grupo) {
    m.grp = grupo;
    (ITEMS[e.id] ? ITEMS[e.id].meshes : []).forEach(mesh => { if (!mesh.userData.cortex) grpObj[grupo].add(mesh); });
  }
});
