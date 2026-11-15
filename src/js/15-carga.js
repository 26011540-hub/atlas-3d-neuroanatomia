/* ===== CARREGAMENTO DO GLB EMBUTIDO ===== */
function falha(e) {
  console.error(e);
  const el = document.getElementById('load');
  el.hidden = false; el.textContent = 'Não foi possível carregar a malha do córtex: ' + (e && e.message ? e.message : e);
}
function lerGLB() {
  const bin = atob(document.getElementById('glb64').textContent.replace(/\s+/g, ''));
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
try { new THREE.GLTFLoader().parse(lerGLB(), '', g => { try { iniciar(g); } catch (e) { falha(e); } }, falha); } catch (e) { falha(e); }
})();
