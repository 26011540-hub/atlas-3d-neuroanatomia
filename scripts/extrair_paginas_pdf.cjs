// extrai os JPEG (DCTDecode) de um PDF escaneado, na ordem em que aparecem no arquivo
const fs=require('fs');const [,, pdf, dir, pref]=process.argv;
fs.mkdirSync(dir,{recursive:true});
const fd=fs.openSync(pdf,'r'), tam=fs.fstatSync(fd).size, B=64*1024*1024;
let n=0, pos=0, resto=Buffer.alloc(0), base=0, aberto=null;
const SOI=Buffer.from([0xFF,0xD8,0xFF]), FIM=Buffer.from('endstream');
while(pos<tam || resto.length){
  const lido=Buffer.alloc(Math.min(B,tam-pos)); if(lido.length) fs.readSync(fd,lido,0,lido.length,pos); pos+=lido.length;
  let buf=Buffer.concat([resto,lido]); let i=0;
  while(true){
    const a=buf.indexOf(SOI,i); if(a<0){ i=Math.max(i,buf.length-8); break; }
    // so vale se vier logo depois de "stream"
    const antes=buf.slice(Math.max(0,a-10),a).toString('latin1');
    if(!/stream\r?\n$/.test(antes)){ i=a+3; continue; }
    const z=buf.indexOf(FIM,a); if(z<0){ if(pos>=tam){ i=buf.length; break; } i=a; break; }
    n++; fs.writeFileSync(dir+'/'+pref+String(n).padStart(3,'0')+'.jpg', buf.slice(a,z)); i=z+9;
  }
  resto=buf.slice(i); if(pos>=tam && (resto.length<12 || resto.indexOf(SOI)<0)) break;
  if(pos>=tam && lido.length===0) break;
}
console.log(pref, n, 'imagens');
