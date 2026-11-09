// Grid over attack/defence strength scales: spread of points per game, best attack and best defence per game, against real values.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const base=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const N=+process.argv[2]||6,real={sd:[.47,.47,.49,.48,.44],att:[2.27,2.49,3.09,2.25,2.42],def:[.79,.79,.88,.68,.91]};
const grid=JSON.parse(process.argv[3]||'[[1,1.5],[1.2,1.7],[1.0,1.8]]');
console.log('real     | sd '+real.sd.join(' ')+' | best attack '+real.att.join(' ')+' | best defence '+real.def.join(' '));
for(const [fa,fd] of grid){
  const code=base.replace('FSA=1.5,FSD=1.5','FSA='+fa+',FSD='+fd);
  const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,getST:()=>ST,table}')(REAL);
  const sd=[[],[],[],[],[]],at=[[],[],[],[],[]],df=[[],[],[],[],[]];
  for(let s=0;s<N;s++){
    E.newCareer({seed:'ts'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
    while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
    E.closePend();let k=0;
    while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
    for(let lg=0;lg<5;lg++){const t=E.table(lg),n=t[0].t.w+t[0].t.d+t[0].t.l,v=t.map(c=>c.t.p/n),m=v.reduce((a,b)=>a+b,0)/v.length;sd[lg].push(Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length));at[lg].push(Math.max(...t.map(c=>c.t.gf))/n);df[lg].push(Math.min(...t.map(c=>c.t.ga))/n)}
  }
  const a=x=>(x.reduce((p,q)=>p+q,0)/x.length).toFixed(2);
  console.log('att x'+fa+' def x'+fd+' | sd '+sd.map(a).join(' ')+' | best attack '+at.map(a).join(' ')+' | best defence '+df.map(a).join(' '));
}
