// Autopilots careers and prints realism numbers. Usage: node test/headless.js [careers] [tier]
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../src');
const code=fs.readdirSync(dir).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
if(fs.existsSync(path.join(__dirname,'../data/rating.json')))REAL.rating=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/rating.json'),'utf8'));
if(fs.existsSync(path.join(__dirname,'../data/wages.json')))REAL.wages=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/wages.json'),'utf8'));
const E=new Function('REAL',code+'\nreturn{R,newCareer,youthYear,pickAcademy,step,closePend,applyOffer,table,getST:()=>ST,LGN,ARCH,club,NTOP}')(REAL);
const N=+process.argv[2]||10,TIER=process.argv[3]==null?'random':+process.argv[3];
const POS=['ST','ST','W','AM','CM','DM','FB','CB','GK','ST'];
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const agg={n:0,g:0,hw:0,dr:0,top:[[],[],[],[],[]],reg:{},elite:[],title:[[],[],[],[],[]],bdo:{},bdoTrophy:0,bdoN:0};
const users={};
function pick(opts){
  const me=E.getST().me;
  const ok=opts.filter(o=>o.k!=='retire'&&o.role!=='bench'&&o.role!=='youth'&&o.k!=='stay'&&o.k!=='keep'&&o.k!=='return'&&(!o.sell||o.sell==='ok'));
  if(ok.length&&me.age>=17){ok.sort((a,b)=>E.club(b.c).base-E.club(a.c).base);return opts.indexOf(ok[0])}
  const ln=opts.filter(o=>o.k==='loan');if(ln.length&&me.age<24)return opts.indexOf(ln[0]);
  const st=opts.findIndex(o=>o.k==='keep'||o.k==='stay'||o.k==='return');
  if(me.age>=36){const r=opts.findIndex(o=>o.k==='retire');if(r>=0)return r}
  return st>=0?st:opts.findIndex(o=>o.k==='retire');
}
function collect(ST){
  agg.n+=ST.stat.n;agg.g+=ST.stat.g;agg.hw+=ST.stat.hw;agg.dr+=ST.stat.dr;ST.stat={n:0,g:0,hw:0,dr:0};
  const pl=ST.W.pl.filter(p=>p.cl>=0);
  for(let lg=0;lg<5;lg++){
    const ps=pl.filter(p=>E.club(p.cl).lg===lg);
    agg.top[lg].push(Math.max(...ps.map(p=>p.g)));
    const t=E.table(lg),rk=ST.W.clubs.filter(c=>c.lg===lg).sort((a,b)=>b.b0-a.b0).map(c=>c.id);
    agg.title[lg].push(rk.indexOf(t[0].id));
  }
  const reg=pl.filter(p=>p.ap>=28&&E.club(p.cl).lg<5);
  for(const p of reg)(agg.reg[p.pos]=agg.reg[p.pos]||[]).push(p.rs/p.ap);
  const top=reg.map(p=>p.rs/p.ap).sort((a,b)=>b-a).slice(0,10);agg.elite.push(...top);
}
for(let i=0;i<N;i++){
  const pos=POS[i%POS.length];
  E.newCareer({seed:'cal'+i,name:'Test',nat:'England',pos,arch:Object.keys(E.ARCH[pos])[0],tier:TIER});
  let guard=0,ST=E.getST();
  while(ST.phase!=='retired'&&guard++<30000){
    if(ST.phase==='youth'){if(ST.pend)E.pickAcademy(0);else E.youthYear();continue}
    if(ST.pend){
      if(ST.pend.t==='season'){
        collect(ST);
        const p=ST.pend,w=p.bdo[0];agg.bdo[w.pos]=(agg.bdo[w.pos]||0)+1;agg.bdoN++;
        E.applyOffer(pick(p.opts));
      }else E.closePend();
      continue;
    }
    E.step();
  }
  const rows=ST.me.rows.filter(r=>!r.youth),u=users[pos]=users[pos]||{c:0,s:0,ap:0,g:0,a:0,avg:[],peak:[],hon:0,bd:0,ret:[]};
  u.c++;u.s+=rows.length;u.ap+=ST.sum.ap;u.g+=ST.sum.g;u.a+=ST.sum.a;u.avg.push(...rows.filter(r=>r.ap>=15).map(r=>r.avg));u.peak.push(ST.sum.peak);u.hon+=ST.me.hon.length;u.bd+=ST.sum.bd;u.ret.push(rows[rows.length-1].age);
  if(process.env.ROWS&&i<+process.env.ROWS)console.log(pos,ST.me.pa,rows.map(r=>`${r.age}:${r.club.slice(0,6)}${r.loan?'(L)':''} ${r.ap}a ${r.g}g ${r.a}as ${r.avg.toFixed(2)} o${r.ovr}`).join(' | '));
}
const f=(x,d=2)=>x.toFixed(d);
console.log(`careers ${N}, league matches ${agg.n}`);
console.log(`goals/game ${f(agg.g/agg.n)} | home win ${f(agg.hw/agg.n*100,1)}% | draw ${f(agg.dr/agg.n*100,1)}%`);
console.log('Top league scorer per season (mean / max):',agg.top.map((a,i)=>E.LGN[i].s+' '+f(mean(a),1)+'/'+Math.max(...a)).join('  '));
console.log('Title won by the Nth strongest club (share of seasons), N=1..4:');
for(let lg=0;lg<5;lg++){const a=agg.title[lg];console.log('  '+E.LGN[lg].s+' '+[0,1,2,3].map(k=>f(a.filter(x=>x===k).length/a.length*100,0)+'%').join(' '))}
console.log('Regular starter avg rating by pos:',Object.entries(agg.reg).map(([k,v])=>k+' '+f(mean(v))).join('  '));
const el=agg.elite;console.log(`Top-10 rated per season: mean ${f(mean(el))}, share >=8.0: ${f(el.filter(x=>x>=8).length/el.length*100,1)}%`);
console.log('Ballon d\'Or winners by position:',JSON.stringify(agg.bdo),'of',agg.bdoN);
for(const[pos,u]of Object.entries(users))console.log(`User ${pos} x${u.c}: seasons ${f(u.s/u.c,1)} | apps/season ${f(u.ap/u.s,1)} | G/season ${f(u.g/u.s,1)} | A/season ${f(u.a/u.s,1)} | avg rtg ${f(mean(u.avg))} | peak ovr ${f(mean(u.peak),1)} | trophies ${f(u.hon/u.c,1)} | BdO ${u.bd} | retire age ${f(mean(u.ret),1)}`);
