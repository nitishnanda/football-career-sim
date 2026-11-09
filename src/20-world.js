let ST=null;
const SQ=[['GK',2],['CB',4],['FB',4],['DM',2],['CM',3],['AM',2],['W',4],['ST',3]];
const NSL={GK:1,CB:2,FB:2,DM:1,CM:1,AM:1,W:2,ST:1};
/* Four peaks. Ability is built from three components that age differently, each with its own curve (all share the climb to 21, F):
     physical   stamina, strength, jumping, pace: peaks early (about 23-25), fades from the late 20s
     technical  first touch, dribbling, skills, finishing and passing technique: peaks mid-to-late 20s, fades slowly
     IQ         decisions, positioning, shot selection, pass quality: keeps rising into the 30s and fades last
   An archetype is a mix of the three (MIXA; positions have a default, MIXP, used for generated players), so a pace-based winger peaks
   early and a deep-lying playmaker late. The mixes were fitted so the statistical peak of each archetype matches the median peak age of its
   real example players (see data/ref_careers.txt and scripts/fit_peaks.py). Statistical peak is not a fourth curve: it is the same three
   components weighted toward what produces numbers (technique and especially IQ, less raw athleticism, SMUL), so goal and assist share
   follows it. Each player also has personal shifts (pks, tks, iqs: years) so some peak early and some late; they are blended in from age 21 to 27. */
function mkComp(pk,pw,a,b){
  const c=F.slice(),f21=F[14];let loss=0,i=0;
  for(let age=22;age<=43;age++){
    if(age<pk){const t=(age-21)/(pk-21);c[age-7]=f21+(1-f21)*(1-(1-t)*(1-t))}
    else if(age<=pk+pw)c[age-7]=1;
    else{loss+=Math.min(.04,a+b*i++);c[age-7]=Math.max(.3,1-loss)}   // a component never loses more than 4% of its peak in a year
  }
  return c;
}
const COMPS=[mkComp(23,2,.010,.006),mkComp(26,3,.004,.003),mkComp(30,4,.004,.002)],SMUL=[.6,1,1.5],CNAME=['Physical','Technical','IQ'];
const MIXP={ST:[0.35,0.53,0.11],W:[0.32,0.52,0.15],AM:[0.16,0.61,0.23],CM:[0.25,0.40,0.35],DM:[0.26,0.26,0.48],FB:[0.38,0.25,0.37],CB:[0.39,0.09,0.52],GK:[0.30,0.30,0.40]};
const MIXA={"ST|Poacher":[.40,.50,.10],"ST|Playmaking Forward":[.25,.60,.15],"ST|Target Man":[.05,.65,.30],"ST|Complete Forward":[.35,.55,.10],"W|Inside Forward":[.35,.50,.15],"W|Traditional Winger":[.40,.55,.05],"W|Flashy Winger":[.40,.55,.05],"W|Pace Abuser":[.80,.20,0],"AM|Classic No.10":[.25,.65,.10],"AM|Shadow Striker":[.40,.55,.05],"AM|Dribbling Ten":[.70,.30,0],"CM|Deep-Lying Playmaker":[0,.20,.80],"CM|Box-to-Box":[.50,.30,.20],"CM|Advanced Creator":[.35,.35,.30],"DM|Anchor":[.25,.25,.50],"DM|Ball Winner":[.50,.30,.20],"DM|Regista":[.15,.30,.55],"FB|Attacking Wing-Back":[.40,.25,.35],"FB|Inverted Full-Back":[.55,.20,.25],"FB|Defensive Full-Back":[.40,.25,.35],"CB|Stopper":[.20,.10,.70],"CB|Ball-Playing Defender":[.20,.10,.70],"CB|Recovery Defender":[.85,.05,.10],"GK|Shot-Stopper":[.15,.35,.50],"GK|Sweeper Keeper":[.15,.35,.50]};
const mixOf=(pos,arch)=>MIXA[pos+'|'+arch]||MIXP[pos]||[.33,.34,.33];
// a component's value at an age, with a personal shift blended in between 21 and 27 (teenage development is untouched)
function compAt(ci,a,sh){a=clamp(a,7,43);if(sh)a=clamp(a-sh*clamp((a-21)/6,0,1),7,43);const T=COMPS[ci],i=Math.floor(a),f=a-i;return f?T[i-7]*(1-f)+T[Math.min(36,i-6)]*f:T[i-7]}
const _mx={};
function blendMax(w){const k=w.join();if(_mx[k]!=null)return _mx[k];let m=0;for(let a=21;a<=43;a++){let r=0;for(let c=0;c<3;c++)r+=w[c]*COMPS[c][a-7];if(r>m)m=r}return _mx[k]=m}
// share of peak ability (or output, with sm=SMUL) at an age for a mix w and personal shifts sh=[physical,technical,iq]
function curveAt(w,a,sh,sm){
  if(sm)w=norm3(w.map((x,i)=>x*sm[i]));
  let r=0;for(let c=0;c<3;c++)r+=w[c]*compAt(c,a,sh&&sh[c]);
  const f21=F[14],mx=blendMax(w);return r<=f21?r:f21+(r-f21)/(mx-f21)*(1-f21);
}
const norm3=w=>{const s=w[0]+w[1]+w[2];return[w[0]/s,w[1]/s,w[2]/s]};
const pkShiftOf=n=>{const h=hashStr('pks|'+n);return Math.round(((h%1000)/1000+((h>>>10)%1000)/1000-1)*5.5*10)/10};
const tkShiftOf=n=>{const h=hashStr('tks|'+n);return Math.round(((h%1000)/1000+((h>>>10)%1000)/1000-1)*5.5*10)/10};
const iqShiftOf=n=>{const h=hashStr('iqs|'+n);return Math.round(((h%1000)/1000+((h>>>10)%1000)/1000-1)*8*10)/10};
// a player's personal shifts, assigned from his name the first time they are needed
function shiftsOf(p){if(p.pks==null)p.pks=pkShiftOf(p.n||'');if(p.tks==null)p.tks=tkShiftOf(p.n||'');if(p.iqs==null)p.iqs=iqShiftOf(p.n||'');return[p.pks,p.tks,p.iqs]}
// share of peak ability: pos/arch pick the mix; sh the personal shifts (omit both for the shared climb only)
function fAge(a,pos,arch,sh){if(!pos)return F[clamp(Math.round(a),7,43)-7];return curveAt(mixOf(pos,arch),a,sh)}
const fOf=(p,a)=>fAge(a,p.pos,p.arch,shiftsOf(p));
// output relative to ability: how much more (or less) a player produces than his ability alone says, at his age
function outRatio(p,a){const w=mixOf(p.pos,p.arch),sh=shiftsOf(p);return curveAt(w,a,sh,SMUL)/curveAt(w,a,sh)}
const ovrAt=(pa,age,dv,p)=>clamp(Math.round(pa*fOf(p,age)+dv),25,98);
/* Attribute-level aging. Each attribute follows its own mix of the three components, so pace and strength fade first while passing,
   positioning and shot selection hold up. attrAging gives each attribute's offset, in rating points, against what the player's overall
   curve alone would say (zero up to 21, where all components are the same curve). refresh() adds it before re-centring, so the overall
   rating is untouched: a 33-year-old winger loses pace and keeps his passing, he does not lose points of overall twice. */
const ATTC={pac:[1,0,0],phy:[1,0,0],dri:[.35,.65,0],sho:[0,.65,.35],pas:[0,.5,.5],def:[.45,0,.55],div:[.6,.4,0],han:[0,1,0],kic:[0,.5,.5],ref:[1,0,0],pos:[0,0,1]};
// goalkeepers keep group-level attributes (reflexes, diving, handling, kicking, positioning): their ageing, by component
function gkAging(me,keys){
  const sh=shiftsOf(me),w=mixOf(me.pos,me.arch),a=me.age,o={};
  let raw=0;for(let c=0;c<3;c++)raw+=w[c]*compAt(c,a,sh[c]);
  for(const k of keys){const m=ATTC[k]||[.33,.34,.33];let s=0;for(let c=0;c<3;c++)s+=m[c]*compAt(c,a,sh[c]);o[k]=me.base*(s/raw-1)}
  return o;
}
// peak windows for the tile: the years each component is within 1% of its best, and the years output is within 1% of its best
function peakWindows(p){
  const sh=shiftsOf(p),w=mixOf(p.pos,p.arch),win=fn=>{let m=0;for(let a=16;a<=43;a++)m=Math.max(m,fn(a));let lo=null,hi=null;for(let a=16;a<=43;a++)if(fn(a)>=m*.99){if(lo==null)lo=a;hi=a}return[lo,hi]};
  return{ph:win(a=>compAt(0,a,sh[0])),te:win(a=>compAt(1,a,sh[1])),iq:win(a=>compAt(2,a,sh[2])),st:win(a=>curveAt(w,a,sh,SMUL)),ab:win(a=>curveAt(w,a,sh))};
}
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
  const sh=[pkShiftOf(n),tkShiftOf(n),iqShiftOf(n)],p={id,n,nat,pos,age,pks:sh[0],tks:sh[1],iqs:sh[2],pa:Math.round((pa||ovr/fAge(age,pos,null,sh))*10)/10,dv:0,ovr,cl:c.id,g:0,a:0,ap:0,rs:0,eg:0,cs:0,pk:age>=29?Math.min(ovr+12,Math.round(ovr/fAge(age,pos,null,sh))):ovr};   // pk: best rating reached (estimated for veterans at the start)
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
    addPlayer(g,c,pos,Math.round(pa*fAge(age,pos)),age,pa);
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
      if(x.age<24){const rel=x.evm/(x.evm+600);gm=clamp(.8+.3*(x.pf||0)*rel-(x.evm<300?.1:0),.3,1.2);pa=Math.min(96,ovr/fAge(x.age,pos,null,[pkShiftOf(x.n),tkShiftOf(x.n),iqShiftOf(x.n)]))}
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
      p.age++;p.dv=dvN;const nom=ovrAt(p.pa,p.age,dvN,p);
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
