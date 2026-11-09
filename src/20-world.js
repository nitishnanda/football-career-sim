let ST=null;
const SQ=[['GK',2],['CB',4],['FB',4],['DM',2],['CM',3],['AM',2],['W',4],['ST',3]];
const NSL={GK:1,CB:2,FB:2,DM:1,CM:1,AM:1,W:2,ST:1};
const fAge=a=>F[clamp(Math.round(a),7,43)-7];
const ovrAt=(pa,age,dv)=>clamp(Math.round(pa*fAge(age)+dv),25,98);
const club=id=>ST.W.clubs[id];
const poolOf=n=>(NATS.find(x=>x[0]===n)||NATS[0])[1];

const SLOPE=.034,FSA=1.1,FSD=1.4,EFC=.6;   // FS undoes the shrinkage in the fitted strengths (right for forecasting one match, but it compresses a whole simulated league); EFC caps a club effect
const MINSQ={GK:2,CB:3,FB:3,DM:1,CM:2,AM:1,W:3,ST:2};
const DON={CB:['FB','DM','CM'],FB:['W','CB','DM','CM'],DM:['CM','CB','AM'],CM:['DM','AM','W'],AM:['CM','W','ST'],W:['AM','ST','FB','CM'],ST:['W','AM'],GK:[]};
const TM={1:75,2:66,3:59,4:54},TS={1:5.5,2:3.5,3:3,4:2.8},CADJ={England:1.5,Spain:.5,Germany:0,Italy:0,France:-1.5};

function addPlayer(g,c,pos,ovr,age,pa,real){
  const W=ST.W,id=W.free.length?W.free.pop():W.pl.length;
  let n,nat;
  if(real){n=real.n;nat=real.nat}
  else{nat=g.chance(.5)?LGN[c.lg].nat:g.pick(NATS)[0];const pl=POOLS[poolOf(nat)];n=g.pick(pl[0])+' '+g.pick(pl[1]);
    const nm=W._nm||(W._nm=new Set(W.pl.filter(Boolean).map(x=>x.n)));
    for(let t=0;nm.has(n)&&t<14;t++)n=g.pick(pl[0])+' '+g.pick(pl[1]);
    if(nm.has(n))n+=' '+String.fromCharCode(65+g.int(0,25))+'.';
    nm.add(n)}
  const p={id,n,nat,pos,age,pa:Math.round((pa||ovr/fAge(age))*10)/10,dv:0,ovr,cl:c.id,g:0,a:0,ap:0,rs:0,eg:0,cs:0,pk:age>=29?Math.min(ovr+12,Math.round(ovr/fAge(age))):ovr};   // pk: best rating reached (estimated for veterans at the start)
  if(real&&real.fl)p.fl=1;
  if(!real)p.fk=1;   // made-up regen or signing: not a real player
  if(real&&real.gs!=null){p.gs=real.gs;p.asr=real.asr;p.pf=real.pf}
  if(real&&real.gm!=null)p.gm=Math.round(real.gm*100)/100;   // growth-speed multiplier: how closely a young player follows the nominal age curve   // evidence: share of team goals/assists and performance vs position
  W.pl[id]=p;c.sq.push(id);c._bp=null;return p;
}

// summer top-up: only when a position falls below its minimum, with a youth regen or a signing
const SQT={1:26,2:25,3:24,4:23};   // first-team squad sizes clubs keep (real top-flight squads carry 25-28)
function newArrival(g,c,pos){
  if(g.chance(.45)){   // academy graduate or young signing: potential spread around the club's level, rarely world class
    const pa=clamp(c.base-2+g.norm(0,6),45,94),age=g.int(17,19);   // academy graduates: mostly squad-level, the odd gem
    addPlayer(g,c,pos,Math.round(pa*fAge(age)),age,pa);
  }else{
    const ovr=c.base-4+g.norm(0,4)+(g.chance(.08)?g.int(3,6):0);       // squad signings come in below the starters
    addPlayer(g,c,pos,Math.round(clamp(ovr,38,93)),g.int(22,29));
  }
}
function fillSquad(g,c){
  const have={};for(const id of c.sq){const p=ST.W.pl[id];have[p.pos]=(have[p.pos]||0)+1}
  for(const[pos,n]of Object.entries(MINSQ))for(let r=have[pos]||0;r<n;r++){newArrival(g,c,pos);have[pos]=(have[pos]||0)+1}
  const T=SQT[LGN[c.lg].tier]||23;
  while(c.sq.length<T){   // replace departures where the squad is thinnest relative to a normal shape
    const pos=Object.keys(MINSQ).sort((a,b)=>(have[a]||0)/MINSQ[a]-(have[b]||0)/MINSQ[b])[0];
    newArrival(g,c,pos);have[pos]=(have[pos]||0)+1;
  }
}

// real squad -> ratings. Order within a position by caps, squad number and age; ratings hang off club strength.
function addReal(g,c,list){
  const L=list.map(([t,d,pos,by,nat,caps,no,v,m,pid,gs,asr,pf,evm])=>({gs,asr,pf,evm:evm||0,n:t.replace(/\s*\(.*\)$/,''),pos,age:clamp(ST.season-by,16,42),nat:nat==='United States'?'USA':(nat||LGN[c.lg].nat),caps,v:v||0,m:m||0,q:caps+(v||0)*2+(m||0)/20+(no>0&&no<=11?12:no>0&&no<=25?6:0)}));
  L.forEach(x=>{if(x.age>=24&&x.age<=31)x.q+=4});
  const cov=L.filter(x=>x.v>0).length/L.length;
  const cnt=p=>L.filter(x=>x.pos===p).length;
  for(const pos in NSL)while(cnt(pos)<NSL[pos]){const dn=DON[pos].find(d=>cnt(d)>NSL[d]);if(!dn)break;L.filter(x=>x.pos===dn).sort((a,b)=>a.q-b.q)[0].pos=pos}
  for(const pos in NSL){
    const arr=L.filter(x=>x.pos===pos).sort((a,b)=>b.q-a.q),k=NSL[pos];
    arr.forEach((x,r)=>{
      const bump=x.caps>=80?5:x.caps>=50?3.5:x.caps>=25?2:x.caps>=10?1:0;
      let ovr=r<k?c.base+g.norm(0,3.2)+bump:c.base-4-2*Math.min(r-k,4)+g.norm(0,3)+bump*.5;
      if(x.age<22)ovr-=(22-x.age)*1.3;
      if(!(x.v>0)&&cov>=.4&&x.m<400)ovr-=5+(x.age<21?4:0);  // no market value at a club that has them for its real players: fringe or academy
      // market value (EUR m) sets the rating when known; young players' values include potential, so they are discounted
      if(x.v>0)ovr=clamp(65+.9*Math.log(Math.max(x.v,.05)/5)/.155-(x.age<24?(24-x.age)*.9:0)+(pos==='GK'?3:0),c.base-14,c.base+14);
      // recent real performance (average match rating against his position, shrunk by minutes) moves the rating
      if(x.pf!=null)ovr=clamp(ovr+clamp(x.pf,-3,3)*2.2,c.base-16,c.base+16);
      ovr=Math.round(clamp(ovr,38,95));
      // potential: young players only keep the nominal growth if their real performances back it up
      let pa,gm;
      if(x.age<24){const rel=x.evm/(x.evm+600);gm=clamp(.8+.3*(x.pf||0)*rel-(x.evm<300?.1:0),.3,1.2);pa=Math.min(96,ovr/fAge(x.age))}
      addPlayer(g,c,pos,ovr,x.age,pa,{n:x.n,nat:x.nat,gs:x.gs,asr:x.asr,pf:x.pf,gm});
    });
    for(let r=arr.length;r<k;r++){c.fln=(c.fln||0)+1;addPlayer(g,c,pos,Math.round(c.base-6),26,undefined,{n:c.name+' reserve '+c.fln,nat:LGN[c.lg].nat,fl:1})}
  }
}

// Real squads for a 2013-2025 start (data/historical.json, England/Spain/Germany/Italy/France top flight only;
// earlier than 2013 isn't available -- that's as far back as the source data has full squads, not just results).
// Returns {players,ground,manager} for club id `cid` in ST.season, or `fallback` (today's single 2026/27 snapshot)
// when no real data exists for that club that season (lower divisions, or a club outside the top flight that year).
function histDataFor(cid,fallback){
  const H=REAL.hist&&REAL.hist[String(ST.season)]&&REAL.hist[String(ST.season)][String(cid)];
  if(!H)return fallback;
  return{players:H.p.map(([n,pos,by,nat,v,mn])=>[n,'',pos,by,nat,0,0,v,mn,0,null,null,null,0]),ground:H.gd||fallback.ground,manager:H.mgr||fallback.manager};
}
// Summer transfer window for the historic era: swap a top-flight club's whole squad for the real one, where we have
// it, instead of the usual procedural ageing/retirement/AI-transfer machinery. Runs after rollWorld's own summer
// so it has the final say; once ST.season runs past the last real season (2025) this simply finds nothing and the
// normal procedural engine carries the world on exactly as it does for a 2026-start career.
function applyHistoricSeason(g){
  const H=REAL.hist&&REAL.hist[String(ST.season)];if(!H)return;
  for(const cid in H){
    const c=club(+cid);if(!c)continue;
    for(const id of c.sq){ST.W.pl[id].cl=-1;ST.W.free.push(id)}
    c.sq=[];c._bp=null;c._av=null;
    const hd=histDataFor(+cid,{ground:c.gd,manager:c.mgr});
    c.gd=hd.ground;c.mgr=hd.manager;
    addReal(g,c,hd.players);
    fillSquad(g,c);
  }
}
function genWorld(){
  const g=R(ST.seed+'|world'),RC=REAL.clubs;
  const sc=RC.map(c=>c.players.map(p=>Math.max(Math.log(1+10*(p[7]||0)),p[5]/30)).sort((a,b)=>b-a).slice(0,12).reduce((s,x)=>s+x,0));
  const st={};RC.forEach((c,i)=>{const k=DIVI[c.div];(st[k]=st[k]||[]).push(sc[i])});
  const ms={};for(const k in st){const a=st[k],m=a.reduce((x,y)=>x+y,0)/a.length;ms[k]=[m,Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length)||1]}
  RC.forEach((rc,i)=>{
    const lg=DIVI[rc.div],l=LGN[lg],z=clamp((sc[i]-ms[lg][0])/ms[lg][1],-2.2,1.7);
    const base=TM[l.tier]+(l.tier===1?CADJ[l.country]:0)+TS[l.tier]*z;
    const hd=histDataFor(i,{players:rc.players,ground:rc.ground,manager:rc.manager});
    const c={id:i,lg,name:rc.name,gd:hd.ground,mgr:hd.manager,base,b0:base,sq:[],t:{p:0,w:0,d:0,l:0,gf:0,ga:0}};
    ST.W.clubs.push(c);addReal(g,c,hd.players);
    const bp=byPos(c),used={};let tot=0;
    for(const pos of SLOTS){const k=used[pos]=used[pos]||0;used[pos]++;tot+=((bp[pos]||[])[k]||{ovr:c.base}).ovr}
    c.base=c.b0=tot/11;
    const used2={},xi=[];for(const pos of SLOTS){const k=used2[pos]=used2[pos]||0;used2[pos]++;const p=(bp[pos]||[])[k];if(p)xi.push({p,pos})}
    const st=strength(xi);c._o=st.o;c._d=st.d;
  });
  // club effect: what real results say beyond the squad ratings (system, manager, cohesion), per division and centred on it
  // measured in the division where the evidence came from; carried over at 35% when a club has since moved division
  const bySrc={};ST.W.clubs.forEach(c=>{const f=RC[c.id].fit;if(f)(bySrc[f[3]]=bySrc[f[3]]||[]).push(c)});
  for(const k in bySrc){
    const cs=bySrc[k];if(cs.length<4)continue;
    const m=f=>cs.reduce((s,c)=>s+f(c),0)/cs.length,ma=m(c=>RC[c.id].fit[0]),md=m(c=>RC[c.id].fit[1]),mo=m(c=>c._o),mdd=m(c=>c._d);
    cs.forEach(c=>{const f=RC[c.id].fit,sc=DVS[c.lg].short===k?1:.35;c.ea=clamp(((f[0]-ma)*FSA-SLOPE*(c._o-mo))*sc,-EFC,EFC);c.ed=clamp(((f[1]-md)*FSD-SLOPE*(c._d-mdd))*sc,-EFC,EFC)});
  }
  ST.W.q0=topDist();   // the real world's elite: how good the 300 best players are at the start
  seedWages();
}

function byPos(c){
  if(c._bp)return c._bp;
  const o={};for(const id of c.sq){const p=ST.W.pl[id];(o[p.pos]=o[p.pos]||[]).push(p)}
  for(const k in o)o[k].sort((a,b)=>b.ovr-a.ovr);
  return c._bp=o;
}

// one summer of ageing, retirements and replacements for every NPC squad
const QN=300;
function topDist(){return ST.W.pl.filter(p=>p&&p.cl>=0).map(p=>p.ovr).sort((a,b)=>b-a).slice(0,QN)}
// Keeps the number of world-class players stable from season to season, as in real football, by ranking players and
// pulling anyone above the start-of-game rating at their rank back to it (order is kept; ordinary players are untouched).
// The ceiling moves a little each season (a shared shift plus small noise per rank), so some years have a deeper crop of
// stars than others, as in real football, while the long-run size of the elite stays where the real world is.
function eliteCeiling(){
  const W=ST.W,g=R(ST.seed+'|L|elite|'+ST.season),q=[];
  const sh=W.esh=clamp(.6*(W.esh||0)+g.norm(0,.35),-1,1);   // drifts gradually rather than jumping year to year
  for(let i=0;i<W.q0.length;i++){let v=W.q0[i]+sh+g.norm(0,.35);if(i>0)v=Math.min(v,q[i-1]);q.push(v)}
  return q;
}
function holdEliteTail(){
  const W=ST.W;if(!W.q0)return;
  const q=W._qs===ST.season&&W._q?W._q:(W._q=eliteCeiling(),W._qs=ST.season,W._q);
  const P=W.pl.filter(p=>p&&p.cl>=0).sort((a,b)=>b.ovr-a.ovr);
  for(let i=0;i<Math.min(QN,P.length);i++){const c=Math.round(q[i]);if(P[i].ovr>c){P[i].ovr=c;P[i].o0=c}}
}
function rollWorld(){
  const W=ST.W,g=R(ST.seed+'|L|roll|'+ST.season);
  for(const c of W.clubs){
    c._bp=null;
    for(const id of c.sq.slice()){
      const p=W.pl[id],dvN=clamp(p.dv*.75+g.norm(0,1.5),-8,8),o0=p.o0!=null?p.o0:p.ovr;
      p.age++;p.dv=dvN;const nom=ovrAt(p.pa,p.age,dvN);
      p.ovr=p.gm!=null&&p.age<=25&&nom>o0?Math.round(o0+p.gm*(nom-o0)):nom;p.o0=p.ovr;delete p.ovf;p.pk=Math.max(p.pk||p.ovr,p.ovr);
      if(p.age>=43||(p.age>=34&&g.chance((p.age-33)*.17))){p.cl=-1;W.free.push(id);c.sq=c.sq.filter(x=>x!==id)}
    }
    c.base=clamp(c.b0+.8*(c.base-c.b0)+g.norm(0,1.2),c.b0-7,c.b0+7);
    c.ea=(c.ea||0)*.7;c.ed=(c.ed||0)*.7;   // a club's system effect fades unless results keep confirming it
  }
  // summer: contracts run out, veterans are released, clubs trade; only then are remaining gaps filled with new players
  ensureContracts(g);releaseVeterans(g);summerWindow(g);
  for(const c of W.clubs)fillSquad(g,c);
  if(!W.q0)W.q0=topDist();   // older saves: anchor on the current world
  holdEliteTail();
  applyHistoricSeason(g);
  rollWages(g);
}
