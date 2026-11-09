// Spread of league points per game (standard deviation across clubs) in simulated seasons, with in-season development on or off.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,getST:()=>ST,table,club}')(REAL);
const N=+process.argv[2]||10;
for(const off of [true,false]){
  const sd={0:[],1:[],2:[],3:[],4:[]},mu={};let man=[];
  for(let s=0;s<N;s++){
    E.newCareer({seed:'sp'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
    while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
    ST.noisd=off;E.closePend();let k=0;
    while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
    for(let lg=0;lg<5;lg++){const t=E.table(lg),v=t.map(c=>c.t.p/(c.t.w+c.t.d+c.t.l)),m=v.reduce((a,b)=>a+b,0)/v.length;sd[lg].push(Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length))}
    const t=E.table(0);man.push(t.findIndex(c=>c.name==='Manchester United')+1);
  }
  const a=x=>x.reduce((p,q)=>p+q,0)/x.length;
  console.log((off?'in-season development OFF':'in-season development ON ')+' | sd of points/game  PL '+a(sd[0]).toFixed(2)+'  LL '+a(sd[1]).toFixed(2)+'  BL '+a(sd[2]).toFixed(2)+'  SA '+a(sd[3]).toFixed(2)+'  F1 '+a(sd[4]).toFixed(2)+' | Man United avg finish '+a(man).toFixed(1)+' (worst '+Math.max(...man)+')');
}
