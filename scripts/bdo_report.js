// Simulates N seasons and checks the Ballon d'Or top threes against real patterns: Champions League progress, club, position.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,applyOffer,getST:()=>ST,club,eurPts,NTOP}')(REAL);
const N=+process.argv[2]||30,stages=[0,0,0,0,0,0],win={},pos={},top10={nonEu:0,n:0};let top3=0;
const names=[];
for(let s=0;s<N;s++){
  E.newCareer({seed:'bdo'+s,name:'T',pos:'ST',arch:'Poacher',tier:1});let ST=E.getST(),g=0;
  while(ST.phase!=='play'&&g++<50){ST.pend?E.pickAcademy(0):E.youthYear()}
  E.closePend();let k=0;
  while(!(ST.pend&&ST.pend.t==='season')&&k++<4000){if(ST.pend)E.closePend();else E.step()}
  const id=n=>ST.W.clubs.find(c=>c.name===n).id,stage=n=>{const e=ST.eu,i=id(n);const u=e.ucl.rounds.filter(r=>r&&r.some(t=>t.h===i||t.a===i)).length;return e.ucl.win===i?5:u};
  ST.pend.bdo.slice(0,3).forEach((r,i)=>{const st=stage(r.c);stages[st]++;top3++;pos[r.pos]=(pos[r.pos]||0)+1;if(i===0)win[r.n+' ('+r.c+')']=(win[r.n+' ('+r.c+')']||0)+1});
  ST.pend.bdo.forEach(r=>{top10.n++;if(stage(r.c)===0)top10.nonEu++});
  if(s<4)names.push('season '+s+': '+ST.pend.bdo.slice(0,5).map(r=>r.n+' ('+r.c+', CL stage '+stage(r.c)+')').join(' | '));
}
console.log('Champions League stage reached by the clubs of the top-3 finishers ('+top3+' players over '+N+' seasons):');
console.log('  not in Champions League:',stages[0],'| R16 exit:',stages[1],'| QF:',stages[2],'| SF:',stages[3],'| final lost:',stages[4],'| winners:',stages[5]);
console.log('  share from clubs that reached the quarter-finals or better: '+Math.round(100*(stages[2]+stages[3]+stages[4]+stages[5])/top3)+'%  | top-10 players from clubs outside the Champions League: '+Math.round(100*top10.nonEu/top10.n)+'%');
console.log('positions of top-3 finishers:',JSON.stringify(pos));
console.log('winners:',Object.entries(win).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x.join(' x')).join(', '));
console.log(names.join('\n'));
