'use strict';
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// Every random draw comes from a stream keyed by a string, so results replay from the seed.
// League keys contain '|L|', player-choice keys '|P|': a UI choice never shifts the league stream.
function R(key){
  const f=mulberry32(hashStr(String(key)));f();f();
  return{
    r:f,
    int:(a,b)=>a+Math.floor(f()*(b-a+1)),
    pick:a=>a[Math.floor(f()*a.length)],
    chance:p=>f()<p,
    norm:(m=0,s=1)=>{let u=0;while(!u)u=f();return m+s*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*f())},
    pois:l=>{const L=Math.exp(-l);let k=0,p=1;do{k++;p*=f()}while(p>L);return k-1},
    wpick:(arr,w)=>{let t=0;for(const x of arr)t+=w(x);let r=f()*t;for(const x of arr){r-=w(x);if(r<=0)return x}return arr[arr.length-1]},
    shuffle:a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(f()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  };
}

const norm0=s=>String(s).normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase();   // accent- and case-insensitive key for names
