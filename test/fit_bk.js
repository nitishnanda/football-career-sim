/* Fits BKP in src/32-breakdown.js (the lift c and the "perfect" multiplier k per position) so the five-category rating keeps the distribution of the fitted
   model of real player-matches: same mean, spread and share of 8s, 9s and 10s. Run after `python3 scripts/build.py`: node test/fit_bk.js */
const{chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(300);
const out=await p.evaluate(()=>{
  const RC={GK:-.02,CB:0,FB:0,DM:.05,CM:.03,AM:.1,W:.09,ST:0},K=9,S=1.2,tail=r=>r>K?K+(r-K)*S:r;
  const oldR=(pos,f,n)=>{const M=RM.model[pos];let r=M.b0+RC[pos];for(const k in M.w)r+=M.w[k]*(f[k]||0);return clamp(Math.round(tail(r+n)*10)/10,3,10)};
  const res={};
  for(const pos of['ST','W','AM','CM','DM','CB','FB','GK']){
    const g=R('fitbk|'+pos),G=RM.gen[pos],M=RM.model[pos],games=[];
    for(let i=0;i<3000;i++){
      const gf=g.pois(1.45),ga=g.pois(1.15),min=g.chance(.8)?90:g.int(45,85),sc=Math.min(gf,g.pois((GAVG[pos]||0)*gf/1.4*(min/90))),as=Math.min(Math.max(0,gf-sc),g.pois((AAVG[pos]||0)*gf/1.4*(min/90)));
      const f=simLine(g,pos,min,sc,as,gf,ga,.5+g.norm(0,.05),1.15/1.35,G.qref+g.norm(0,4),null,1,0,null),n=g.norm(0,M.sd||.25);
      games.push({f,n,old:oldR(pos,f,n)});
    }
    const st=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return[m,Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/a.length)]};
    const O=games.map(x=>x.old),[om,os]=st(O),pc=(a,t)=>a.filter(x=>x>=t).length/a.length;
    // category spreads (impact includes the unexplained part)
    const raws=games.map(x=>{const r=bkRaw(pos,x.f);r[0]+=x.n;return r}),sd=[0,1,2,3,4].map(i=>st(raws.map(r=>r[i]))[1]);
    BKP[pos].sd=sd.map(v=>Math.max(v,.12));
    let best=null;
    for(const bb of[1])for(let c=-.3;c<=.5;c+=.02)for(let k=1.5;k<=5;k+=.1){
      BKP[pos].c=c;BKP[pos].k=k;BKP[pos].b=bb;const N=games.map(x=>rateOf(pos,bkScores(pos,x.f,x.n))),[nm,ns]=st(N);
      const e=(nm-om)**2*400+(ns-os)**2*200+(pc(N,8)-pc(O,8))**2*30+(pc(N,9)-pc(O,9))**2*400+(pc(N,10)-pc(O,10))**2*3000;
      if(!best||e<best.e)best={e,c:+c.toFixed(2),k:+k.toFixed(2),b:bb};
    }
    BKP[pos].c=best.c;BKP[pos].k=best.k;BKP[pos].b=best.b;const N=games.map(x=>rateOf(pos,bkScores(pos,x.f,x.n))),[nm,ns]=st(N);
    res[pos]={c:best.c,k:best.k,b:best.b,sd:sd.map(v=>+Math.max(v,.12).toFixed(3)),old:[+om.toFixed(2),+os.toFixed(2),+pc(O,8).toFixed(3),+pc(O,9).toFixed(3),+pc(O,10).toFixed(4)],now:[+nm.toFixed(2),+ns.toFixed(2),+pc(N,8).toFixed(3),+pc(N,9).toFixed(3),+pc(N,10).toFixed(4)]};
  }
  return res});
for(const[p,r]of Object.entries(out))console.log(p,JSON.stringify(r));
console.log('const BKP={'+Object.entries(out).map(([p,r])=>`${p}:{c:${r.c},k:${r.k},b:${r.b},sd:[${r.sd.join(',')}]}`).join(',')+'};');
await b.close()})();
