// Tracks every player's rating through simulated seasons: change by age, how much arrives during the season, and whether performance drives growth for the young.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,applyOffer,getST:()=>ST}')(REAL);
const N=+process.argv[2]||5,SEAS=4,rec=[];
for(let s=0;s<N;s++){
  E.newCareer({seed:'dev'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
  while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
  E.closePend();
  for(let season=0;season<SEAS;season++){
    const start={};ST.W.pl.forEach(p=>{if(p.cl>=0)start[p.id]={o:p.ovr,age:p.age,n:p.n}});let b4={},z={};
    let k=0;
    while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){
      if(ST.pend){if(ST.pend.t==='block'&&ST.pend.n===4)ST.W.pl.forEach(p=>{if(p.cl>=0)b4[p.id]=p.ovr});E.closePend()}else E.step()}
    ST.W.pl.forEach(p=>{if(p.cl>=0&&p.ap>=15)z[p.id]=p.zp||0});
    E.applyOffer(0);
    ST.W.pl.forEach(p=>{const a=start[p.id];if(a&&p.cl>=0&&p.n===a.n)rec.push({age:a.age,d:p.ovr-a.o,d4:b4[p.id]!=null?b4[p.id]-a.o:null,z:z[p.id]})});
  }
}
const bucket=a=>a<=19?'17-19':a<=22?'20-22':a<=25?'23-25':a<=29?'26-29':a<=33?'30-33':'34+';
const g={};rec.forEach(r=>{(g[bucket(r.age)]=g[bucket(r.age)]||[]).push(r)});
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
console.log('annual rating change by age (players tracked: '+rec.length+'): age | n | mean | sd | share of the change already in place at block 4');
for(const b of ['17-19','20-22','23-25','26-29','30-33','34+']){const a=g[b];if(!a)continue;const big=a.filter(r=>Math.abs(r.d)>=2&&r.d4!=null);
  console.log(b.padEnd(6),String(a.length).padStart(5),mean(a.map(r=>r.d)).toFixed(2).padStart(6),sd(a.map(r=>r.d)).toFixed(2).padStart(5),big.length?(Math.round(100*mean(big.map(r=>r.d4/r.d)))+'%'):'n/a')}
for(const [lo,hi,lab] of [[17,23,'under 24'],[24,29,'24-29']]){
  const a=rec.filter(r=>r.age>=lo&&r.age<=hi&&r.z!=null);const zs=a.map(r=>r.z),ds=a.map(r=>r.d),mz=mean(zs),md=mean(ds);
  const c=a.reduce((s,r)=>s+(r.z-mz)*(r.d-md),0)/Math.sqrt(a.reduce((s,r)=>s+(r.z-mz)**2,0)*a.reduce((s,r)=>s+(r.d-md)**2,0));
  const top=a.filter(r=>r.z>.5),bot=a.filter(r=>r.z<-.5);
  console.log(lab+': correlation between season performance and rating change '+c.toFixed(2)+' | performed well (z>.5): '+mean(top.map(r=>r.d)).toFixed(2)+' ('+top.length+') vs poorly (z<-.5): '+mean(bot.map(r=>r.d)).toFixed(2)+' ('+bot.length+')');
}
