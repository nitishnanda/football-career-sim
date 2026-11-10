/* The world around you moves: a summer transfer window between AI clubs, and managers who get sacked and replaced.
   Clubs shop from weaker clubs, so departures cascade down the divisions and real lower-league players move up;
   made-up players are only created at the bottom when a squad is still short. */
function boardGoal(c){
  const l=LGN[c.lg],cs=ST.W.clubs.filter(x=>x.lg===c.lg).sort((a,b)=>b.base-a.base),n=cs.length,r=cs.findIndex(x=>x.id===c.id)+1;
  const sib=LGN.filter(x=>x.country===l.country),top=Math.max(...sib.map(x=>x.tier)),grp=sib.filter(x=>x.tier===l.tier).length>1;
  if(l.tier===1){
    if(r<=2)return{t:'Challenge for the title',max:2};
    if(r<=4)return{t:'Qualify for the Champions League',max:4};
    if(r<=7)return{t:'Qualify for Europe',max:6};
    if(r<=n-6)return{t:'Finish in the top half',max:Math.floor(n/2)};
    return{t:'Avoid relegation',max:n-3};
  }
  const up=grp?2:3;
  if(r<=Math.max(3,up+1))return{t:'Win promotion',max:up};
  if(r<=n-6||l.tier===top)return{t:'Finish in the top half',max:Math.floor(n/2)};
  return{t:'Avoid relegation',max:n-3};
}

function posOf(c){return table(c.lg).findIndex(x=>x.id===c.id)+1}
const ordE=n=>n+(['th','st','nd','rd'][(n%100>>3^1&&n%10<4)?n%10:0]||'th');
const newsTr=(t)=>addNews('tr',t);
function moveAI(p,from,to,fee,free){
  const W=ST.W;from.sq=from.sq.filter(x=>x!==p.id);to.sq.push(p.id);p.cl=to.id;from._bp=null;to._bp=null;from._av=null;to._av=null;
  p.wg=wageFor(to,wageVal(p.ovr,p.age,p.pa,to,p.pk));p.ce=ST.season+1+(p.age>=31?1:2)+((p.id*7)%3);
  const me=ST.me,mine=me.cl===to.id||me.cl===from.id;
  if(fee>=25||mine||(p.ovr>=84))newsTr(`${p.n} joins ${to.name} from ${from.name}${free?' on a free':' for '+fmtM(fee)}`);
  if(mine)addMsg('club',me.cl===to.id?'New signing: '+p.n:'Departure: '+p.n,me.cl===to.id?`${to.name} have signed ${p.n} (${plab(p)}, ${p.age}) from ${from.name}${free?' on a free transfer':' for '+fmtM(fee)}.${p.pos===me.pos?' He plays in your position.':''}`:`${p.n} has left for ${to.name}${free?' on a free':' for '+fmtM(fee)}.${p.pos===me.pos?' One less player ahead of you for a place.':''}`);
}
// Summer window: each club looks at its first-choice places, and where a starter is well below the club's level (or old),
// it buys a better player from a weaker club it can afford. Richest clubs shop first; weaker clubs then replace who they lost.
function summerWindow(g){
  const W=ST.W,me=ST.me,byP={};
  for(const p of W.pl){if(p&&p.cl>=0)(byP[p.pos]=byP[p.pos]||[]).push(p)}
  const clubs=W.clubs.slice().sort((a,b)=>b.base-a.base);let moves=0,spent=0;
  for(const c of clubs){
    let budget=clubMeans(c)*1.4,signed=0;const bp=byPos(c),needs=[];
    for(const pos in NSL){const L=bp[pos]||[];for(let i=0;i<NSL[pos];i++){const p=L[i];if(!p||p.ovr<c.base-3||(p.age>=32&&g.chance(.35)))needs.push({pos,cur:p?p.ovr:0})}}
    g.shuffle(needs);
    for(const nd of needs){
      if(signed>=3)break;
      let best=null;
      for(const p of byP[nd.pos]||[]){
        if(p.cl===c.id||p.cl<0)continue;const sc=W.clubs[p.cl];
        if(sc.base>=c.base-1||p.ovr<Math.max(nd.cur+2,c.base-5)||p.age>31||p.age<18)continue;
        const v=valueFor(p.ovr,p.age,p.pa,sc),free=p.ce!=null&&p.ce<=ST.season+1,fee=free?0:v;
        if(fee>budget||(!free&&v>clubMeans(c)))continue;
        const s=p.ovr+(p.age<=25?1.5:0)-fee*.015+g.r()*2.5;
        if(!best||s>best.s)best={p,sc,v,free,s};
      }
      if(!best)continue;
      // the selling club wants a fair fee, more for key players (the real fee/value spread runs 0.6x to 1.7x)
      const fee=best.free?0:Math.round(best.v*(.85+g.r()*.45)*10)/10;
      if(fee>budget)continue;
      moveAI(best.p,best.sc,c,fee,best.free);budget-=fee;spent+=fee;signed++;moves++;
    }
  }
  W.lastWindow={s:ST.season,moves,spent:Math.round(spent)};
}
// AI contracts: every player has an end date; older players' deals run out and some are released to find a new club
function ensureContracts(g){for(const p of ST.W.pl)if(p&&p.cl>=0&&p.ce==null)p.ce=ST.season+1+g.int(0,4)}
function releaseVeterans(g){
  const W=ST.W;
  for(const c of W.clubs)for(const id of c.sq.slice()){const p=W.pl[id];if(!p)continue;
    if(p.ce<=ST.season+1){
      if(p.age>=31&&p.ovr<c.base-2&&g.chance(.6)){   // released: a weaker club picks him up
        const dest=W.clubs.filter(x=>x.id!==c.id&&x.base<c.base-2&&x.base>c.base-14);const to=dest.length?g.pick(dest):null;
        if(to)moveAI(p,c,to,0,true);else p.ce=ST.season+2;
      }else p.ce=ST.season+1+(p.age>=31?1:g.int(2,4));   // re-signed
    }}
}

/* ---------- managers ---------- */
function genMgr(c){const g=R('mgr|'+c.id+'|'+ST.season),p=POOLS[poolOf(LGN[c.lg].country)]||POOLS[Object.keys(POOLS)[0]];return g.pick(p[0])+' '+g.pick(p[1])}
function appoint(c,g,depth){
  const W=ST.W;W.mfree=W.mfree||[];
  // first choice: a manager overachieving at a smaller club; then the best recently-sacked one; then a new face
  const poach=depth<1?W.clubs.filter(x=>x.id!==c.id&&x.mgr&&x.base<c.base-2&&x.base>c.base-14&&posOf(x)<=boardGoal(x).max-2).sort((a,b)=>b.base-a.base)[0]:null;
  const fa=W.mfree.filter(m=>m.lvl>=c.base-8&&ST.season-m.s<=4).sort((a,b)=>b.lvl-a.lvl)[0];
  if(poach&&g.chance(.55)){c.mgr=poach.mgr;poach.mgr=null;appoint(poach,g,depth+1);return'from '+poach.name}
  if(fa&&g.chance(.8)){c.mgr=fa.n;W.mfree.splice(W.mfree.indexOf(fa),1);return'after leaving '+fa.from}
  c.mgr=genMgr(c);return'his first job at this level';
}
function sack(c,g,why){
  const W=ST.W,me=ST.me;W.mfree=W.mfree||[];const old=mgr(c);
  W.mfree.push({n:old,lvl:c.base,s:ST.season,from:c.name});if(W.mfree.length>60)W.mfree.shift();
  const how=appoint(c,g,0);c.ea=(c.ea||0)+.04;   // a small new-manager bounce
  W.mchanges=(W.mchanges||0)+1;
  if(c.lg<NTOP||c.id===me.cl)addNews('mg',`${c.name} sack ${old} ${why}; ${c.mgr} takes over (${how})`);
  if(c.id===me.cl||(me.parent>=0&&c.id===me.parent)){addMsg('club','New manager: '+c.mgr,`${old} has been sacked ${why}. ${c.mgr} takes over (${how}). Everyone starts again in his eyes.`);me.trust=clamp(55+((me.trust||60)-55)*.4,30,75)}
}
// run at the end of a season (mid=false) and at the in-season reviews (mid=true)
function managerReview(mid){
  const W=ST.W,g=R(ST.seed+'|L|mgr|'+ST.season+(mid?'|'+ST.si:''));
  for(const c of W.clubs){
    const n=table(c.lg).length,pos=posOf(c),bad=pos-boardGoal(c).max,played=c.t.w+c.t.d+c.t.l;
    if(mid&&played<10)continue;
    let p=0;
    if(mid)p=bad>=6?.16:bad>=3?.06:0;
    else p=bad>=6?.6:bad>=3?.35:bad>=1?.15:.06;   // even a good season sees some managers leave or retire
    if(g.chance(p))sack(c,g,mid?'mid-season, with the club '+ordE(pos):'after finishing '+ordE(pos));
  }
}
