/* Save compression: LZW over the save's UTF-8 bytes, with codes packed 15 bits per UTF-16 character (offset 32, so no
   character is a surrogate or control code). Synchronous, so the save after every action stays simple. Decimals are
   trimmed to 3 places first. Saves start "Z1:"; older plain-JSON saves still load. */
const P2=[];for(let i=0;i<=40;i++)P2.push(Math.pow(2,i));
const bitLen=x=>x<=1?1:Math.floor(Math.log2(x))+1;
function packSave(str){
  const bytes=new TextEncoder().encode(str),dict=new Map(),out=[];
  let next=256,w=-1,k=0,buf=0,bits=0;
  const emit=c=>{k++;const wd=bitLen(256+k-1);buf=buf*P2[wd]+c;bits+=wd;while(bits>=15){bits-=15;const v=Math.floor(buf/P2[bits]);buf-=v*P2[bits];out.push(String.fromCharCode(v+32))}};
  for(let i=0;i<bytes.length;i++){const b=bytes[i];if(w<0){w=b;continue}const key=w*256+b,c=dict.get(key);if(c!==undefined)w=c;else{emit(w);dict.set(key,next++);w=b}}
  if(w>=0)emit(w);
  if(bits>0)out.push(String.fromCharCode(buf*P2[15-bits]+32));
  let s='';for(let i=0;i<out.length;i+=8192)s+=out.slice(i,i+8192).join('');
  return'Z1:'+k.toString(36)+':'+s;
}
function unpackSave(z){
  const a=z.indexOf(':',3),n=parseInt(z.slice(3,a),36),d=z.slice(a+1);
  let pos=0,buf=0,bits=0;
  const read=wd=>{while(bits<wd){buf=buf*P2[15]+(d.charCodeAt(pos++)-32);bits+=15}bits-=wd;const v=Math.floor(buf/P2[bits]);buf-=v*P2[bits];return v};
  let cap=1<<16,pre=new Int32Array(cap),last=new Uint8Array(cap),first=new Uint8Array(cap),len=new Int32Array(cap);
  for(let i=0;i<256;i++){pre[i]=-1;last[i]=i;first[i]=i;len[i]=1}
  let next=256,prev=-1,out=new Uint8Array(1<<20),op=0;
  const grow=()=>{cap*=2;const g=(A,T)=>{const B=new T(cap);B.set(A);return B};pre=g(pre,Int32Array);last=g(last,Uint8Array);first=g(first,Uint8Array);len=g(len,Int32Array)};
  for(let k=1;k<=n;k++){
    const c=read(bitLen(256+k-1));
    if(prev>=0){if(next>=cap)grow();pre[next]=prev;first[next]=first[prev];last[next]=c<next?first[c]:first[prev];len[next]=len[prev]+1;next++}
    const L=len[c];if(op+L>out.length){const o=new Uint8Array(Math.max(out.length*2,op+L));o.set(out);out=o}
    let x=c;for(let j=op+L-1;j>=op;j--){out[j]=last[x];x=pre[x]}
    op+=L;prev=c;
  }
  return new TextDecoder().decode(out.subarray(0,op));
}
const trimNum=(k,v)=>k[0]==='_'?undefined:(typeof v==='number'&&!Number.isInteger(v)?Math.round(v*1000)/1000:v);
