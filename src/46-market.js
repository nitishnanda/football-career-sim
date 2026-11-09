const fmtM=v=>v>=1?'€'+(v>=10?Math.round(v):v.toFixed(1))+'M':'€'+Math.round(v*1000)+'k';
/* Transfer market: clubs bid within their means, the selling club decides, wages follow what each club can pay. */
// Biggest fee a club can pay (EUR m): fitted on the largest fee each real club paid in 2021-26 (Transfermarkt transfers),
// against club strength, per division tier, with some headroom; capped near the world record.
const FEEFIT={1:[-7.73,.1516],2:[-16.72,.2951],3:[-3.82,.082],4:[-4.7,.082]};
// lower divisions are also capped at a share of what a top-flight club of the same strength could pay (the tier-2 fit
// extrapolates too steeply for strong second-tier sides)
const TIERCAP={1:1,2:.6,3:.25,4:.12};
function clubMeans(c){const t=LGN[c.lg].tier,f=FEEFIT[t]||FEEFIT[4],f1=FEEFIT[1];return clamp(Math.min(1.25*Math.exp(f[0]+f[1]*c.base),1.25*Math.exp(f1[0]+f1[1]*c.base)*(TIERCAP[t]||.1)),.1,230)}
// Wages (EUR k per week). Premier League fitted to Capology's 2026-27 gross wages for the top 500 earners (rank by rank, within ~10%);
// other leagues' levels are published estimates relative to it;
// richer clubs pay more than their league average, and within a club pay scales with market value.
const LWAGE={England:[119,17.5,4.7,2.4],Spain:[45,5,2],Germany:[45,8,2.5],Italy:[32,5],France:[35,6,2]};
// pay follows standing, not resale value: no youth premium, no age discount (veterans keep the contracts they earned)
// Pay follows standing, not resale value. Young players' deals lag their ability; veterans are paid on the standing they
// built: in Capology's 2026-27 contracts players aged 30-33 earn what their peak ability would, tapering after 34
// (real pay over current-ability pay: 1.5x at 30-31, 2x at 32-33, 3x at 34+).
const VCUT=age=>age<=31?.9:age<=33?.8:age<=35?.72:.6;   // pay kept at each renewal: ~10% cut at 30-31, ~20% at 32-33, ~28% at 34-35, ~40% after
const PKW=age=>age<30?0:age<=31?.9:age<=33?.6:age<=35?.5:.35;
const wageVal=(ovr,age,pa,c,pk)=>valueFor(pk&&pk>ovr?ovr+PKW(age)*(pk-ovr):ovr,clamp(age,24,30),pa,c)*(age<23?1-.06*(23-age):1);
const clubAvgV=c=>{if(c._av!=null&&c._avs===ST.season)return c._av;const v=c.sq.map(id=>ST.W.pl[id]).filter(Boolean).map(p=>wageVal(p.ovr,p.age,p.pa,c,p.pk)).sort((a,b)=>b-a).slice(0,18);c._avs=ST.season;return c._av=v.length?v.reduce((a,b)=>a+b,0)/v.length:1};   // first-team (top 18) average
const lgBase=lg=>{const L=ST.W.clubs.filter(x=>x.lg===lg);return L.reduce((a,x)=>a+x.base,0)/L.length};
// leagues with Capology data use the shape fitted on the Premier League; others keep the gentler earlier shape
function wageFormula(c,v){const l=LGN[c.lg],pl=!!anch(l)||(l.country==='England'&&l.tier===1),k=pl?.138:.12,e=pl?.715:.8,avg=((LWAGE[l.country]||[20,5,2])[l.tier-1]||1.5)*Math.exp(k*(c.base-lgBase(c.lg)));return Math.round(clamp(Math.min(avg*Math.pow(Math.max(.05,v)/Math.max(.2,clubAvgV(c)),e),avg*2.03),.5,620)*10)/10}
function wageFor(c,v){
  const l=LGN[c.lg],f=wageFormula(c,v);
  return anch(l)?curveWage(c.lg,f):f;
}
// Pay by rank for the leagues with real wage data (Capology 2026-27: Premier League, Bundesliga, La Liga, Serie A).
// The formula decides who out-earns whom; the league's real curve decides what each place in the order is paid.
// Ranks are compared as a share of the league, since the real lists and the game's squads differ slightly in size.
const WG=(REAL.wages&&REAL.wages.leagues)||{};
const anch=l=>WG[l.s]||null;
function lgFormulaList(lg){
  const W=ST.W;W._lf=W._lf||{};const k=lg+'|'+ST.season;if(W._lf[k])return W._lf[k];
  const L=[];for(const c of W.clubs){if(c.lg!==lg)continue;for(const id of c.sq){const p=W.pl[id];if(p)L.push(wageFormula(c,wageVal(p.ovr,p.age,p.pa,c,p.pk)))}}
  return W._lf[k]=L.sort((a,b)=>b-a);
}
function curveWage(lg,f){
  const A=anch(LGN[lg]),L=lgFormulaList(lg);let gt=0,eq=0;for(const x of L){if(x>f)gt++;else if(x===f)eq++;else break}
  const r=gt+(eq+1)/2;   // players tied at the club pay ceiling share their places instead of all taking the top one
  const P=A.curve,rr=Math.max(1,r*A.n/Math.max(1,L.length));
  let w=P[P.length-1][1];
  for(let i=1;i<P.length;i++){const[a,wa]=P[i-1],[b,wb]=P[i];if(rr<=b){w=rr<=a?wa:Math.exp(Math.log(wa)+(Math.log(wb)-Math.log(wa))*(rr-a)/(b-a));break}}
  return Math.round(w*A.fx*10)/10;
}
function wageCap(c){return wageFor(c,205)}
function sellP(o){
  const me=ST.me,cur=club(me.parent>=0?me.parent:me.cl),L=byPos(cur)[me.pos]||[],k=NSL[me.pos],v=Math.max(.2,mval());
  const rank=L.filter(p=>p.ovr>me.ovr).length+1,alt=L.filter(p=>p.ovr<=me.ovr&&p.id!==(me.p&&me.p.id)).sort((a,b)=>b.ovr-a.ovr)[0],gap=alt?me.ovr-alt.ovr:12;
  const key=rank<=k?(rank===1?.28:.2):rank<=k+1?.05:-.12,prem=(o.fee||0)/v-1,left=me.ct?me.ct.exp-(ST.season+1):2;
  const rep=clamp((8-gap)*.025,-.15,.15),exp=left<=0?.25:left===1?.1:0;
  const big=.15*clamp((o.fee||0)/clubMeans(cur)-.6,0,1);   // a fee bigger than the seller could ever pay itself is hard to turn down
  return clamp(.5+prem*1.5-key+rep+exp+big,.02,.97);
}
const sellStatus=p=>p>=.62?'ok':p>=.3?'ask':'block';
function sellWhy(o){
  const me=ST.me,cur=club(me.parent>=0?me.parent:me.cl),v=Math.max(.2,mval()),L=byPos(cur)[me.pos]||[],rank=L.filter(p=>p.ovr>me.ovr).length+1,k=NSL[me.pos];
  const prem=Math.round(((o.fee||0)/v-1)*100),bits=[];
  bits.push(prem>=15?'the fee is a healthy profit':prem>=0?'the fee is around your market value':'the fee is below your value');
  bits.push(rank<=k?'you are a key player for them':rank<=k+1?'you are a rotation option':'you are not in their plans');
  return bits.join(', ');
}
function makeOffers(avg){
  const me=ST.me,g=R(ST.seed+'|P|offers|'+ST.season),W=ST.W,home=me.parent>=0?me.parent:me.cl,cur=club(home);
  const D=me.ovr+(me.age<24?(me.pa-me.ovr)*.2:0)+(avg-RAVG)*3,k=NSL[me.pos],v=mval(),opts=[];
  const rm=role=>role==='starter'?1.1:role==='rotation'?1:.85;
  const wv=wageVal(me.ovr,me.age,me.pa,cur,me.peak);
  const offerW=(c,role)=>Math.round(Math.min(wageCap(c)*1.05,wageFor(c,wv)*rm(role)*(.92+g.r()*.2))*10)/10;   // what this club pays a player of your value, by role
  const stay=(kind,c,role)=>({k:kind,c:c.id,role,y:g.int(1,5),w:Math.min(wageCap(c),Math.max(Math.round(wageFor(c,wv)*rm(role)*10)/10,me.ct&&c.id===home?Math.round(me.ct.w*(me.age>=30?VCUT(me.age):1)*10)/10:.5)),fee:0});   // over 30, your club's renewal comes in lower, more so with age
  const roleD=c=>{const L=byPos(c)[me.pos]||[],t1=L[k-1]?L[k-1].ovr:0,t2=L[k]?L[k].ovr:0;return D>=t1-1?'starter':D>=t2?'rotation':null};
  const rs=roleAt(cur,me.ovr);
  // Contracts run out. 'left' = seasons still to run once this one ends. With time left you can see out your deal ('keep');
  // in the last two years the club may offer an extension; when it expires you are a free agent: no fee, and your club
  // cannot block a move (it can only offer to re-sign you, and only if it still wants you).
  const left=me.ct?me.ct.exp-(ST.season+1):null,free=left!=null&&left<=0;
  const wanted=rs==='starter'||rs==='rotation'||(me.age<23&&rs!=='youth');
  if(me.age<16||left==null)opts.push(stay(me.parent>=0?'return':'stay',cur,me.age<16?'youth':rs));
  else if(!free){
    opts.push({k:me.parent>=0?'return':'keep',c:cur.id,role:rs,y:left,w:me.ct.w,fee:0,cur:1});
    if(left<=2&&wanted){const o=stay('stay',cur,rs);o.y=Math.max(o.y,left+1);opts.push(o)}
  }else if(wanted||me.age<30){opts.push(stay('stay',cur,rs))}
  else addMsg('club','Contract not renewed',`${cur.name} will not offer you a new deal. Your contract runs out this summer and you leave as a free agent.`);
  const interest=[];
  if(me.age>=16){
    const cand=[];
    for(const c of W.clubs){
      if(c.id===home||(c.id===me.cl&&me.parent<0))continue;
      const r=roleD(c);if(!r)continue;
      const cap=clubMeans(c);if(!free&&cap<v*.75)continue;          // cannot afford the fee (no fee when you are a free agent)
      cand.push({c,r,s:c.base+g.r()*5+(cap>v*1.3?2:0)});
    }
    cand.sort((a,b)=>b.s-a.s);
    const pool=free?cand.filter(x=>x.c.base>=cur.base-10):cand;   // a free agent's phone rings from clubs near his level
    pool.slice(0,2).concat(g.shuffle(pool.slice(2)).slice(0,2)).forEach(x=>{
      const cap=clubMeans(x.c),b0=v*(.82+g.r()*.2)*(left===1?.75:1),bids=   // one year left: clubs bid less, knowing you could leave for free next summer
        [b0,b0*1.12,b0*1.25,b0*1.4].map(b=>Math.round(Math.min(b,cap*.95)*10)/10).filter((b,i,a)=>i===0||b>a[i-1]);
      const o=free?{k:'transfer',free:1,c:x.c.id,role:x.r,y:g.int(2,5),w:Math.round(offerW(x.c,x.r)*1.1*10)/10,fee:0,sell:'ok'}   // free agents earn a signing premium
                  :{k:'transfer',c:x.c.id,role:x.r,y:g.int(2,5),w:offerW(x.c,x.r),fee:bids[0],bids,bi:0};
      if(!free)o.sell=sellStatus(sellP(o));opts.push(o);interest.push(o);
    });
  }
  if(!free&&me.age>=16&&me.age<=29&&(rs==='bench'||rs==='youth'||(me.age<21&&rs==='rotation'))){
    const lc=W.clubs.filter(c=>c.id!==home&&c.base<=cur.base-3&&c.base>=cur.base-15&&roleD(c)==='starter');
    g.shuffle(lc).slice(0,2).forEach(c=>opts.push({k:'loan',c:c.id,role:'starter',y:1,w:offerW(c,'starter'),fee:0,sell:'ok'}));
  }
  if(free&&!opts.some(o=>o.k!=='retire')){   // nobody came in: smaller clubs offer a way back
    const lc=W.clubs.filter(c=>c.id!==home&&c.base<=cur.base&&roleD(c)).sort((a,b)=>b.base-a.base).slice(0,6);
    g.shuffle(lc).slice(0,2).forEach(c=>{const r=roleD(c);opts.push({k:'transfer',free:1,c:c.id,role:r,y:g.int(1,3),w:offerW(c,r),fee:0,sell:'ok'})});
  }
  if(me.age>=34)opts.push({k:'retire'});
  if(!opts.length||me.age>=43)return[{k:'retire'}];
  if(free&&me.age>=16)addMsg('agent','Your agent: you are a free agent',`Your contract with ${cur.name} has expired, so any club can sign you without a fee. ${interest.length?interest.map(o=>club(o.c).name).join(', ')+' want to talk.':'Interest is thin, but a few clubs have called.'}`);
  else if(interest.length&&me.age>=16){
    const L=interest.map(o=>`${club(o.c).name} have bid ${fmtM(o.fee)} (${o.sell==='ok'?cur.name+' are open to selling':o.sell==='ask'?cur.name+' are reluctant':cur.name+' say you are not for sale'})`);
    addMsg('agent','Your agent: transfer interest',`Clubs have registered their interest in you this summer. ${L.join('. ')}. ${cur.name}, not you, decide whether a deal can go ahead: you can ask your agent to push for a higher bid, or hand in a transfer request.`);
  }else if(me.age>=16)addMsg('agent','Your agent: quiet summer',`No club can currently match your value, so there is no firm interest. Keep performing and offers will follow.`);
  return opts;
}
function pushBid(i){
  const o=ST.pend.opts[i];if(!o||o.k!=='transfer'||ST.bud<1||!o.bids)return;
  ST.bud--;const g=R(ST.seed+'|P|push|'+ST.season+'|'+i);
  if(o.bi>=o.bids.length-1){logArch(club(o.c).name+' will not go any higher');o.maxed=1;return}
  if(g.r()<.18+o.bi*.12){o.rej=1;logArch(club(o.c).name+' walked away from the deal');return}
  o.bi++;o.fee=o.bids[o.bi];o.sell=sellStatus(sellP(o));logArch(club(o.c).name+' raised their bid to '+fmtM(o.fee));
}
function askLeave(i){
  const o=ST.pend.opts[i];if(!o||o.k!=='transfer'||ST.bud<1||o.asked||o.sell==='ok')return;
  ST.bud--;o.asked=1;const g=R(ST.seed+'|P|ask|'+ST.season+'|'+i),p=clamp(sellP(o)+.22,.1,.9),me=ST.me;
  if(g.r()<p){o.sell='ok';me.trust=Math.max(0,(me.trust||60)-8);logArch('Transfer request accepted for '+club(o.c).name)}
  else{o.sell='block';me.trust=Math.max(0,(me.trust||60)-4);logArch('Transfer request refused: '+club(me.parent>=0?me.parent:me.cl).name+' will not sell')}
}

// Every player holds a contract wage (p.wg, EUR k/wk). Players named in Capology's lists (PL, BL, LL, SA) start on their real
// contract; everyone else starts on the formula. Contracts then move like real ones: a rising player is often re-signed on
// more, a declining one keeps his deal until it runs out.
function seedWages(){
  const W=ST.W;
  for(const c of W.clubs){const A=anch(LGN[c.lg]);for(const id of c.sq){const p=W.pl[id];if(!p)continue;
    const real=A&&A.wages?A.wages[p.n]:null;
    p.wg=real?Math.round(real*A.fx*10)/10:wageFor(c,wageVal(p.ovr,p.age,p.pa,c,p.pk))}}
}
function rollWages(g){
  const W=ST.W;
  W._lf={};
  for(const c of W.clubs){c._av=null;for(const id of c.sq){const p=W.pl[id];if(!p)continue;const f=wageFor(c,wageVal(p.ovr,p.age,p.pa,c,p.pk));
    if(p.wg==null)p.wg=f;
    const A=anch(LGN[c.lg]),top=A?A.curve[0][1]*A.fx*1.05:null;
    if(top&&p.wg>top)p.wg=Math.max(f,Math.round(top*10)/10);   // relegation clauses: nobody keeps a pay packet above the league's real top earner
    else if(f>p.wg*1.15&&g.chance(.35))p.wg=f;                      // new deal after a step up
    else if(f<p.wg*.87&&g.chance(p.age>=30?.5:.35))                  // deal expires (veterans sign shorter ones, so more often)
      p.wg=p.age>=30?Math.max(f,Math.round(p.wg*VCUT(p.age)*10)/10):f;   // a veteran steps down per renewal instead of falling straight to his current level
  }}
}
