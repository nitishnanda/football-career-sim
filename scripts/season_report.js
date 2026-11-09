// Simulates the 2026-27 season N times (league only) and reports who finishes where, from the evidence-based model.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,getST:()=>ST,table,LGN,club}')(REAL);
const N=+process.argv[2]||24,agg={};
const watch=process.argv.slice(3);
for(let s=0;s<N;s++){
  E.newCareer({seed:'rep'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
  while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
  E.closePend();let k=0;
  while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
  for(let lg=0;lg<5;lg++){
    const ps=ST.W.pl.filter(p=>p.cl>=0&&E.club(p.cl).lg===lg);
    for(const [key,name] of [['g','goals'],['a','assists']]){
      ps.slice().sort((a,b)=>b[key]-a[key]||b.ap-a.ap).forEach((p,i)=>{const o=agg[lg+name+p.n]=agg[lg+name+p.n]||{lg,name,n:p.n,club:E.club(p.cl).name,tot:0,top3:0,top1:0,seasons:0};o.tot+=p[key];o.seasons++;if(i<3)o.top3++;if(i===0)o.top1++});
    }
  }
}
const L=['Premier League','La Liga','Bundesliga','Serie A','Ligue 1'];
for(let lg=0;lg<5;lg++){for(const name of ['goals','assists']){
  const a=Object.values(agg).filter(o=>o.lg===lg&&o.name===name).sort((x,y)=>y.tot/N-x.tot/N).slice(0,5);
  console.log(L[lg]+' '+name+': '+a.map(o=>`${o.n} (${o.club}) ${(o.tot/N).toFixed(0)} avg, top-3 ${Math.round(100*o.top3/N)}%`).join(' | '));}}
for(const w of watch){const hits=Object.values(agg).filter(o=>o.n.toLowerCase().includes(w.toLowerCase()));for(const o of hits)console.log('  '+o.n+' ('+o.club+') '+o.name+': '+(o.tot/N).toFixed(1)+' avg, top-3 in '+Math.round(100*o.top3/N)+'% of seasons, top in '+Math.round(100*o.top1/N)+'%')}
