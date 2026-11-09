// How many made-up players end up in the lists, season by season, going beyond 2026-27.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,applyOffer,getST:()=>ST,club}')(REAL);
const N=+process.argv[2]||4,S=11,acc=Array.from({length:S},()=>({bdo:[0,0],sc:[0,0],top:[0,0],all:[0,0]}));
for(let s=0;s<N;s++){
  E.newCareer({seed:'fk'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
  while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
  E.closePend();
  for(let y=0;y<S;y++){
    let k=0;while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
    const a=acc[y];
    ST.pend.bdo.slice(0,10).forEach(r=>{a.bdo[1]++;a.bdo[0]+=r.fk});
    for(let lg=0;lg<5;lg++){const ps=ST.W.pl.filter(p=>p.cl>=0&&E.club(p.cl).lg===lg);for(const key of ['g','a']){ps.sort((x,z)=>z[key]-x[key]).slice(0,5).forEach(p=>{a.sc[1]++;a.sc[0]+=p.fk?1:0})}}
    ST.W.pl.filter(p=>p.cl>=0).sort((x,z)=>z.ovr-x.ovr).slice(0,100).forEach(p=>{a.top[1]++;a.top[0]+=p.fk?1:0});
    ST.W.pl.filter(p=>p.cl>=0&&E.club(p.cl).lg<5).forEach(p=>{a.all[1]++;a.all[0]+=p.fk?1:0});
    E.applyOffer(0);
  }
}
const pc=x=>String(Math.round(100*x[0]/x[1])).padStart(3)+'%';
console.log('share of MADE-UP players | season | Ballon d\'Or top 10 | top-5 scorers/assisters per league | 100 highest-rated players | everyone in the top five leagues');
acc.forEach((a,y)=>console.log((2026+y)+'/'+String(27+y).slice(-2)+'  ',pc(a.bdo),'          ',pc(a.sc),'                          ',pc(a.top),'                      ',pc(a.all)));
