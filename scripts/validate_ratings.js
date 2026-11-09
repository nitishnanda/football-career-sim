// Step 5: compare simulated match ratings with the real per-match distribution (data/rating.json "real").
// Usage: node scripts/validate_ratings.js [seasons]
const fs=require('fs'),path=require('path');const dir=path.join(__dirname,'../src');
const code=fs.readdirSync(dir).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));REAL.rating=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/rating.json'),'utf8'));
if(fs.existsSync(path.join(__dirname,'../data/wages.json')))REAL.wages=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/wages.json'),'utf8'));
const E=new Function('REAL',code+'\nreturn{newCareer,youthYear,pickAcademy,step,closePend,applyOffer,getST:()=>ST,club,LGN}')(REAL);
const N=+process.argv[2]||2;E.newCareer({seed:'val',name:'T',nat:'England',pos:'ST',arch:'Poacher',tier:1});
let ST=E.getST(),seasons=0;
while(ST.phase==='youth'){if(ST.pend)E.pickAcademy(0);else E.youthYear()}
ST._rlog=[];
while(seasons<N){if(ST.pend){if(ST.pend.t==='season'){seasons++;const i=ST.pend.opts.findIndex(o=>o.k==='keep'||o.k==='stay'||o.k==='return');E.applyOffer(Math.max(0,i));ST._rlog=ST._rlog||[]}else E.closePend();continue}E.step()}
const L=ST._rlog,mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
console.log('pos | sim mean/real | sd sim/real | >=8 sim/real | <6 sim/real | blank sim/real | scored sim/real | sub<30 sim/real');
for(const pos of ['GK','CB','FB','DM','CM','AM','W','ST']){
  const R=REAL.rating.real[pos],S=L.filter(x=>x[0]===pos&&x[1]>=60).map(x=>x[2]),B=L.filter(x=>x[0]===pos&&x[1]>=60&&!x[3]&&!x[4]).map(x=>x[2]),G=L.filter(x=>x[0]===pos&&x[1]>=60&&x[3]>0).map(x=>x[2]),U=L.filter(x=>x[0]===pos&&x[1]<30).map(x=>x[2]);
  const f=(a,b)=>`${a==null||isNaN(a)?' -  ':a.toFixed(2)}/${b==null?' -  ':b.toFixed(2)}`;
  console.log(pos.padEnd(3),'|',f(mean(S),R.mean),'|',f(sd(S),R.sd),'|',f(S.filter(x=>x>=8).length/S.length,R.p8),'|',f(S.filter(x=>x<6).length/S.length,R.p6),'|',f(B.length?mean(B):null,R.blank),'|',f(G.length?mean(G):null,R.scored),'|',f(U.length?mean(U):null,R.sub),' n=',S.length);
}
