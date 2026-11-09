// Tries club-effect scales and reports the spread of points per game against the real 0.44-0.49.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const base=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const N=+process.argv[2]||8;
for(const [efs,efc,slope] of [[1,.6,.034],[1.3,.6,.034],[1.5,.6,.034],[1.7,.6,.034],[2,.6,.034]]){
  const code=base.replace('FS=1,EFC=.6','FS='+efs+',EFC='+efc).replace('const SLOPE=.034','const SLOPE='+slope);
  const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,getST:()=>ST,table,club}')(REAL);
  const sd=[[],[],[],[],[]],goals=[];
  for(let s=0;s<N;s++){
    E.newCareer({seed:'tu'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
    while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
    E.closePend();let k=0;
    while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
    for(let lg=0;lg<5;lg++){const v=E.table(lg).map(c=>c.t.p/(c.t.w+c.t.d+c.t.l)),m=v.reduce((a,b)=>a+b,0)/v.length;sd[lg].push(Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length))}
    const t=E.table(0);goals.push(t.reduce((a,c)=>a+c.t.gf,0)/(t.length*(t[0].t.w+t[0].t.d+t[0].t.l)));
  }
  const a=x=>x.reduce((p,q)=>p+q,0)/x.length;
  console.log('strength scale x'+efs+' cap '+efc+' slope '+slope+' | sd ppg PL '+a(sd[0]).toFixed(2)+' LL '+a(sd[1]).toFixed(2)+' BL '+a(sd[2]).toFixed(2)+' SA '+a(sd[3]).toFixed(2)+' F1 '+a(sd[4]).toFixed(2)+' | PL goals/team/game '+a(goals).toFixed(2));
}
