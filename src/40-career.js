const HOMEC={England:'England',Scotland:'England',Spain:'Spain',Germany:'Germany',Italy:'Italy',France:'France'};
const BLK=[8,16,24,31];
const FIRST_HIST=2013,LAST_HIST=2025,DEFAULT_SEASON=2026;   // the Transfermarkt dump's lineup/appearance detail starts in 2013-14; before that there are only results, no squads
const INJ=['Hamstring strain','Ankle sprain','Knee ligament','Calf strain','Groin strain','Muscle fatigue','Concussion','Foot fracture'];
const ROLEN={starter:'Starter',rotation:'Rotation',bench:'Squad player',youth:'Youth team'};
const PGV={ST:.6,W:.65,AM:.6,CM:.85,DM:1,FB:1.1,CB:1.2,GK:0};
const z0=()=>({ap:0,st:0,g:0,a:0,mn:0,rs:0,rn:0,cs:0,sh:0,pc:0,pa:0,kp:0,xg:0,xa:0,dr:0,tk:0});
const label=y=>y+'/'+String(y+1).slice(2);
const sortT=a=>a.slice().sort((x,y)=>y.t.p-x.t.p||(y.t.gf-y.t.ga)-(x.t.gf-x.t.ga)||y.t.gf-x.t.gf||x.id-y.id);
const table=lg=>sortT(ST.W.clubs.filter(c=>c.lg===lg));

/* ---------- player ---------- */
function refresh(me){
  const keys=me.pos==='GK'?GKK:OUTK,P=PROF[me.pos],AX=archOf(me),ar=AX.att||{},w=OVW[me.pos],off={};
  let sw=0,so=0;
  const ag=attrAging(me,keys);
  keys.forEach((k,i)=>{off[k]=(P[k]||0)+(ar[k]||0)+(me.dev[k]||0)+(ag[k]||0);sw+=w[i];so+=w[i]*off[k]});
  const A={};let ov=0;
  keys.forEach((k,i)=>{A[k]=clamp(Math.round(me.base-so/sw+off[k]),15,ACAP[k]||99);ov+=w[i]*A[k]});
  me.attr=A;me.ovr=Math.round(ov/sw);me.peak=Math.max(me.peak||0,me.ovr);
  me.amax=me.amax||{};for(const k of keys)if(A[k]>(me.amax[k]||0))me.amax[k]=A[k];   // career-best of each attribute: how far the defining one has fallen
 
  buildSubs(me,A);
  // goal and assist share: the group attribute plus how his finishing / vision / passing stand against what is typical for the role
  const sd=me.subd||{};
  me.sc=me.pos==='GK'?0:A.sho-P.sho+.5*(sd.fin||0)+.3*(sd.apo||0)+.2*(sd.com||0);me.ac=me.pos==='GK'?0:A.pas-P.pas+.4*(sd.vis||0)+.3*(sd.spa||0)+.2*(sd.lpa||0)+.1*(sd.cur||0);
  me.p={id:'me',n:me.name,age:me.age,arch:me.arch,pks:me.pks||0,tks:me.tks||0,iqs:me.iqs||0,pos:me.pos,ovr:me.ovr,sc:me.sc,ac:me.ac,gm:AX.gm||1,am:AX.am||1};
}
function mval(){const me=ST.me;return valueFor(me.ovr,me.age,me.pa,me.cl>=0?club(me.cl):null)}
// end-of-season growth; also ages the player a year
function develop(boost){
  const me=ST.me,g=R(ST.seed+'|P|dev|'+me.age);
  if(me.focus){trainBoost(me,me.focus,me.age<30?3:1.5);me.focus=null}
  me.age++;
  me.gap=clamp(me.gap*.75+g.norm(0,1.5)+boost,-9,3);
  me.base=me.pa*fOf(me,me.age)*archAge(me,me.age)+me.gap;
  // (the old flat pace decline from 30 is gone: attributes now age through attrAging, by component)
  refresh(me);
}
function roleAt(c,o){
  const me=ST.me,L=byPos(c)[me.pos]||[],k=NSL[me.pos],b=L.filter(p=>p.ovr>o).length;
  return b<k?'starter':b===k?'rotation':b===k+1?'bench':'youth';
}

// a player's personal debut / regular-rotation / established-starter ages, drawn from the real distribution for
// their position and tier (see BRKAGE); a cohort's "doesn't always nail down a starting role" trait pushes the
// starter age further out for players who miss that roll
function rollBrk(g,pos,tier){
  const row=(BRKAGE[pos]||BRKAGE.CM)[tier]||BRKAGE.CM['Promising'],[dM,dS,rM,rS,sM,sS,pStart]=row;
  const d=clamp(g.norm(dM,dS),15,25),r=Math.max(d,clamp(g.norm(rM,rS),15,27));
  let s=Math.max(r,clamp(g.norm(sM,sS),15,33));
  if(g.r()*100>=pStart)s=Math.min(33,s*1.4);
  return{d:Math.round(d*10)/10,r:Math.round(r*10)/10,s:Math.round(s*10)/10};
}
function newCareer(o){
  const seed=o.seed||String(Math.floor(Math.random()*1e9)),g=R(seed+'|create');
  const t=o.tier==='random'||o.tier==null?TIERS[g.wpick([0,1,2,3],i=>[.45,.35,.17,.03][i])]:TIERS[+o.tier];
  const pa=clamp(g.norm(t.m,t.s),66,98);
  let arch=o.arch,hid=0;if(!arch||arch==='random'||!ARX[o.pos][arch]){arch=g.pick(Object.keys(ARX[o.pos]));hid=o.arch==='random'?1:0}
  const me={name:o.name||'Player',nat:o.nat||'England',pos:o.pos,arch,archHidden:hid,foot:o.foot||'Right',ht:o.ht||180,pa:Math.round(pa*10)/10,tier:t.n,age:7,gap:0,dev:{},sdev:{},base:0,cl:-1,parent:-1,role:'youth',form:[],inj:0,sus:0,rows:[],hon:[],aw:[],moves:[],focus:null,ss:null,trust:60,caps:0,ig:0,nr:null,tx:{},a0:null,tn:0,wf:o.foot==='Both'?5:3,frame:o.frame||'Athletic'};
  me.brk=rollBrk(g,o.pos,t.n);
  // personal peak shifts in years for the physical, technical and IQ components (see COMPS): negative peaks early, positive late
  me.pks=clamp(Math.round(R(seed+'|pks').norm(0,2.2)*10)/10,-5,5);me.tks=clamp(Math.round(R(seed+'|tks').norm(0,2.2)*10)/10,-5,5);me.iqs=clamp(Math.round(R(seed+'|iqs').norm(0,3.2)*10)/10,-7,7);
  const fp=o.pos==='GK'?'ref':'pac';
  me.dev=me.frame==='Lean Wire'?{[fp]:2,phy:-2}:me.frame==='Power Solid'?{[fp]:-2,phy:3}:{[fp]:1,phy:1};
  me.base=me.pa*fAge(7);   // the early climb is shared by every position
  const season=clamp(Math.round(o.startYear)||DEFAULT_SEASON,FIRST_HIST,DEFAULT_SEASON);
  ST={v:VER,seed,phase:'youth',season,yr0:season-8,W:{pl:[],free:[],clubs:[]},me,pend:null,hof:[],stat:{n:0,g:0,hw:0,dr:0},inbox:[],archive:[],mid:1,bud:2,tour:null};
  refresh(me);genWorld();return ST;
}
function youthYear(){
  const me=ST.me,g=R(ST.seed+'|P|youth|'+me.age),age=me.age;
  const lvl=age<12?'Local club':club(me.cl).name+' Academy';
  const apN=g.int(18,26),rt={ST:.9,W:.55,AM:.45,CM:.25,DM:.12,FB:.1,CB:.1,GK:0}[me.pos]*clamp(1+me.gap*.06,.5,1.6);
  me.rows.push({s:label(ST.yr0+age-7),age,club:lvl,ap:apN,g:g.pois(rt*apN),a:g.pois(rt*.6*apN),ovr:me.ovr,youth:true});
  develop((age>=12?(club(me.cl).base-70)*.03:0));
  if(me.age===12){
    const q=clamp((me.pa-66)/30,0,1),ga=R(ST.seed+'|P|acad'),home=HOMEC[me.nat];
    const near=(arr,qq)=>{const s2=arr.slice().sort((a,b)=>b.base-a.base),c=Math.round(Math.pow(1-qq,1.6)*(s2.length-6))+3;return ga.shuffle(s2.slice(Math.max(0,c-6),c+6))};
    // an academy is capped to your talent tier: grassroots kids top out around League One/Two, wonderkids usually
    // land a Championship academy and only sometimes a Premier League one, generational talent is a given for the
    // very top -- weighted by tier, falling back to whichever tiers actually exist in a thinner country pyramid
    const ACADW={'Grassroots talent':[[3,.45],[4,.55]],Promising:[[2,.4],[3,.6]],Wonderkid:[[1,.22],[2,.78]],Generational:[[1,1]]};
    const acBase=home?ST.W.clubs.filter(c=>LGN[c.lg].country===home):ST.W.clubs.filter(c=>LGN[c.lg].tier<=2);
    const acAvail=new Set(acBase.map(c=>LGN[c.lg].tier));
    let acW=(ACADW[me.tier]||ACADW.Promising).filter(([t])=>acAvail.has(t));
    if(!acW.length){const acMaxT=acAvail.size?Math.max(...acAvail):1;acW=[[acMaxT,1]]}
    const acTgt=ga.wpick(acW,x=>x[1])[0],acCapped=acBase.filter(c=>LGN[c.lg].tier===acTgt);
    // kids mostly join academies in their own country; only elite talent is lured abroad, and only by the biggest clubs
    let pool=near(acCapped.length?acCapped:acBase,q);
    pool=pool.slice(0,3);
    if(home&&q>=.7&&ga.chance(.55)){const ab=ST.W.clubs.filter(c=>LGN[c.lg].country!==home&&LGN[c.lg].tier===1).sort((a,b)=>b.base-a.base).slice(0,10).filter(c=>!pool.includes(c));pool[2]=ga.pick(ab)}
    ST.pend={t:'academy',opts:pool.map(x=>x.id).sort((a,b)=>club(b).base-club(a).base)};
  }else if(me.age===15)startSenior();
}
function pickAcademy(i){ST.me.cl=ST.pend.opts[i];ST.pend=null}
function revealArch(){
  const me=ST.me;if(!me.archHidden)return;me.archHidden=0;const x=archOf(me),r=x.refs.wk.concat(x.refs.gen).slice(0,3);
  addMsg('club','Coaches\' report: your playing style','The coaching staff now see you as a '+me.arch+'. '+x.blurb+(r.length?' Think '+r.join(', ')+'.':''));
}
function startSenior(){ST.phase='play';revealArch();setupSeason();ST.me.role=calcRole();ST.pend={t:'train'}}

/* ---------- season set-up ---------- */
function setupSeason(){
  const W=ST.W;
  for(const c of W.clubs)c.t={p:0,w:0,d:0,l:0,gf:0,ga:0};
  ST.res={};ST.news=ST.news||[];
  for(const p of W.pl){p.g=p.a=p.ap=p.rs=p.eg=p.cs=p.mn=p.st=0;p.x=[];p.zp=0;p.o0=p.ovr;delete p.ovf}
  ST.me.zp=0;ST.me.o0=ST.me.ovr;
  const cand=[];
  for(let lg=0;lg<NTOP;lg++){
    const mem=W.clubs.filter(c=>c.lg===lg),inl=new Set(mem.map(c=>c.id));
    let t=ST.prev?ST.prev[lg].filter(id=>inl.has(id)):[];
    t=t.concat(mem.filter(c=>!t.includes(c.id)).sort((a,b)=>b.base-a.base).map(c=>c.id));
    t.forEach((id,i)=>cand.push({id,pl:i,pp:ST.prevPpg&&ST.prevPpg[id]!=null?ST.prevPpg[id]:W.clubs[id].base/30}));
  }
  cand.sort((a,b)=>a.pl-b.pl||b.pp-a.pp);
  initComps(cand);
  ST.slots=[];
  for(let w=1;w<=46;w++){
    const ci=CUPWK.indexOf(w);
    if(ci>=0)ST.slots.push({t:'cup',r:ci,w});
    const lm=EULPW.indexOf(w);if(lm>=0)ST.slots.push({t:'eu',p:'lp',m:lm+1,w});
    EUKOW.forEach((ws,rd)=>{const li=ws.indexOf(w);if(li>=0)ST.slots.push({t:'eu',p:'ko',rd,leg:li+1,w})});
    ST.slots.push({t:'lg',w});
    if(w<=38){if(w%2===0)ST.slots.push({t:'yth',w});if(INTW.includes(w))ST.slots.push({t:'int',w})}
  }
  if((ST.season+1)%2===0)for(let r=0;r<7;r++)ST.slots.push({t:'tour',r,w:47+r});
  ST.si=0;ST.last=null;ST.mineLog=[];ST.tour=null;ST.bud=2;
  ST.yopp={};
  if(ST.me.cl>=0){
    const gy=R(ST.seed+'|L|yopp|'+ST.season),mc=club(ST.me.cl),opps=gy.shuffle(W.clubs.filter(x=>x.id!==mc.id&&LGN[x.lg].country===LGN[mc.lg].country&&LGN[x.lg].tier<=3).map(x=>x.id));
    let k=0;for(const sl of ST.slots)if(sl.t==='yth')ST.yopp[sl.w]=opps[k++%opps.length];
  }
  const me=ST.me;me.ss={lg:z0(),cup:z0(),eu:z0(),yth:z0(),nat:z0()};me.a0=Object.assign({},me.attr);me.s0=Object.assign({},me.sub||{});
  const nr=natRole();if(nr&&!me.nr)addMsg('national','Senior call-up: '+me.nat,'The '+me.nat+' manager has included you in the squad for the coming internationals.');
  me.nr=nr;
}
function fixtures(lg){
  if(ST._fxs!==ST.season){ST._fx=[];ST._fxs=ST.season}
  if(ST._fx[lg])return ST._fx[lg];
  const g=R(ST.seed+'|L|fix|'+ST.season+'|'+lg),arr=g.shuffle(ST.W.clubs.filter(c=>c.lg===lg).map(c=>c.id)),n=arr.length,rounds=[];
  for(let r=0;r<n-1;r++){
    const m=[];
    for(let i=0;i<n/2;i++){let h=arr[i],a=arr[n-1-i];if(r%2&&i===0)[h,a]=[a,h];m.push([h,a])}
    rounds.push(m);arr.splice(1,0,arr.pop());
  }
  return ST._fx[lg]=rounds.concat(rounds.map(m=>m.map(([h,a])=>[a,h])));
}
/* ---------- playing time ---------- */
function decidePlay(kind,key){
  const me=ST.me,gp=R(ST.seed+'|P|play|'+key);
  if(me.inj>0)return{mode:'out',why:'Injured'};
  if(me.sus>0)return{mode:'out',why:'Suspended'};
  const{ps,pb}=playProbs(kind);
  let mode,min;
  if(gp.r()<ps){mode='start';min=gp.chance(.62)?90:gp.int(55,89)}
  else if(gp.r()<pb){mode='sub';min=gp.int(8,40)}
  else return{mode:'dnp'};
  const o={mode,min};
  if(gp.r()<.012*(archOf(me).inj||1)*(1+Math.max(0,me.age-29)*.1)*(1.3-me.attr.phy/150)*(min/90+.1)){
    const q=gp.r();o.inj={t:gp.pick(INJ),w:q<.62?gp.int(1,4):q<.92?gp.int(4,12):gp.int(16,40)};
    o.min=Math.max(6,Math.round(min*gp.r()));
  }
  if(gp.r()<.005*min/90){o.red=1;o.min=Math.min(o.min,gp.int(25,80))}
  return o;
}

/* ---------- slots ---------- */
function applyLeague(r){
  const hc=ST.W.clubs[r.h],ac=ST.W.clubs[r.a],h=hc.t,a=ac.t,S=ST.stat,top=hc.lg<NTOP;
  h.gf+=r.hg;h.ga+=r.ag;a.gf+=r.ag;a.ga+=r.hg;
  if(top){S.n++;S.g+=r.hg+r.ag}
  if(r.hg>r.ag){h.hw=(h.hw|0)+1;a.al=(a.al|0)+1}else if(r.hg<r.ag){h.hl=(h.hl|0)+1;a.aw=(a.aw|0)+1}else{h.hd=(h.hd|0)+1;a.ad=(a.ad|0)+1}
  if(r.ag===0)h.cs=(h.cs|0)+1;if(r.hg===0)a.cs=(a.cs|0)+1;
  const fm=(c,x)=>c.f=((c.f||'')+x).slice(-5);
  if(r.hg>r.ag){h.p+=3;h.w++;a.l++;if(top)S.hw++;fm(hc,'W');fm(ac,'L')}
  else if(r.hg<r.ag){a.p+=3;a.w++;h.l++;fm(hc,'L');fm(ac,'W')}
  else{h.p++;a.p++;h.d++;a.d++;if(top)S.dr++;fm(hc,'D');fm(ac,'D')}
}
function mkReport(res,kind,lab,hc,ac,pl){
  const me=ST.me,sd=res.side,gf=sd?res.ag:res.hg,ga=sd?res.hg:res.ag;
  const r={k:kind,c:lab,h:hc.name,a:ac.name,hid:hc.id,aid:ac.id,lu:res.lu||null,ts:res.ts||null,hg:res.hg,ag:res.ag,pen:res.pen?1:0,wn:res.w!=null?(res.w===hc.id?hc.name:ac.name):'',wk:(ST.slots[ST.si-1]||{}).w||0,duel:res.duel||null,sd,mp:pl.mode,min:res.me?res.me.min:(pl.min||0),len:res.len||null,et:res.et?1:0,iv:res.meIv||null,why:pl.why||'',motm:res.motm||null,
    evs:(res.evs||[]).map(e=>({m:e.m,t:e.t,mt:e.mt,s:e.s,n:e.sc.p.n,a:e.as?e.as.p.n:'',me:e.sc.me?1:0,am:e.as&&e.as.me?1:0}))};
  const s=me.ss[kind];
  if(res.me){
    const m=res.me;r.st=m;s.ap++;if(pl.mode==='start')s.st++;
    s.g+=m.g;s.a+=m.a;s.mn+=m.min;s.rs+=m.rating;s.rn++;s.sh+=m.sh;s.pc+=m.pc;s.pa+=m.pa;
    m.xg=Math.round((.08*m.sh+.06*m.sot)*100)/100;m.xa=Math.round(.11*m.kp*100)/100;s.kp+=m.kp;s.xg+=m.xg;s.xa+=m.xa;s.dr=(s.dr||0)+m.dr;s.tk=(s.tk||0)+m.tk;for(const k of['ic','bl','du','duw','dra','past','fd','fc','sv','yc','sot'])s[k]=(s[k]||0)+(m[k]||0);
    me.trust=clamp((me.trust||60)+(m.rating-RAVG)*1.6+(pl.mode==='start'?.3:0),5,99);
    if(me.focus){const x=me.tx[me.focus]=me.tx[me.focus]||{xp:0,t:1};x.xp+=20*m.min/90;if(x.xp>=1000){x.xp-=1000;x.t++;trainBoost(me,me.focus,2.4);refresh(me);addMsg('club','Training tier '+x.t+' unlocked',fLabel(me.focus)+' mastery has improved.')}}
    if(kind==='nat'){
      me.caps++;me.ig+=m.g;me.ina=(me.ina||0)+m.a;me.natRs=(me.natRs||0)+m.rating;me.natRn=(me.natRn||0)+1;
      if(me.nr==='squad')me.natSquadApps=(me.natSquadApps||0)+1;
      if(!me.natProven&&(me.natSquadApps||0)>=3&&me.natRs/me.natRn>=6.9)me.natProven=1;
    }
    if(me.pos==='GK'&&ga===0&&m.min>=60)s.cs++;
    me.form.push(m.rating);if(me.form.length>10)me.form.shift();
    if(pl.red){me.sus=1;r.red=1}
    if(pl.inj){
      me.inj=pl.inj.w+1;r.inj=pl.inj;addMsg('medical','Injury: '+pl.inj.t,'Expected to be out for about '+pl.inj.w+' week'+(pl.inj.w>1?'s':'')+'.');
      if(pl.inj.w>=12)injuryCost(me,pl.inj);
    }
  }
  ST.mineLog.push({c:lab,o:sd?hc.name:ac.name,h:sd?0:1,gf,ga,rt:res.me?res.me.rating:null,g:res.me?res.me.g:0,a:res.me?res.me.a:0,m:pl.mode,mn:res.me?res.me.min:0,wk:r.wk});
  ST.hist=ST.hist||[];ST.hist.unshift(r);if(ST.hist.length>40)ST.hist.pop();
  return r;
}
function runSlot(){
  const s=ST.slots[ST.si++],me=ST.me,W=ST.W;let rep=null;
  const inSen=(h,a)=>me.role!=='youth'&&(me.cl===h||me.cl===a);
  if(s.t==='lg'){
    for(let lg=0;lg<LGN.length;lg++){
      if(s.w>LGN[lg].md)continue;
      for(const[h,a]of fixtures(lg)[s.w-1]){
        const hc=W.clubs[h],ac=W.clubs[a],mine=inSen(h,a),rk=ST.season+'|lg'+s.w+'|'+h+'|'+a,pl=mine?decidePlay('lg',rk):null;
        const res=playMatch(hc,ac,rk,{detail:true,upd:true,me:mine?me:null,play:pl,side:mine?(me.cl===h?0:1):-1});
        applyLeague(res);
        ((ST.res[lg]=ST.res[lg]||{})[s.w]=ST.res[lg][s.w]||[]).push([h,a,res.hg,res.ag]);
        newsFrom(res,hc,ac);
        if(mine)rep=mkReport(res,'lg',LGN[lg].s+' · Matchday '+s.w,hc,ac,pl);
      }
    }
    if(me.inj>0){me.inj--;if(me.inj===0)addMsg('medical','Physio clearance','Fitness test passed. You are available for selection.')}
    if(me.sus>0)me.sus--;ST.bud=2;
    if(BLK.includes(s.w)){inSeasonDev(BLK.indexOf(s.w)+1);if(BLK.indexOf(s.w)>=1)managerReview(true);ST.pend={t:'block',n:BLK.indexOf(s.w)+1}}
  }else if(s.t==='cup'){
    rep=playCupSlot(s,inSen,decidePlay,mkReport);
  }else if(s.t==='eu'){
    rep=playEuSlot(s,inSen,decidePlay,mkReport);
  }else if(s.t==='int'&&me.nr){
    const rk=ST.season+'|int'+s.w,g=R(ST.seed+'|L|int|'+rk),on=g.pick(Object.keys(NSTR).filter(n=>n!==me.nat));
    rep=natMatch(rk,me.nat,on,me.nat+' · '+['Qualifier','Friendly','Qualifier','Nations League'][INTW.indexOf(s.w)],false,false).rep;
  }else if(s.t==='tour'&&me.nr){
    rep=tourSlot(s);
  }else if(s.t==='yth'&&me.role==='youth'&&me.cl>=0){
    const rk=ST.season+'|yth'+s.w,g=R(ST.seed+'|L|yth|'+rk),c=club(me.cl),opp=W.clubs[ST.yopp&&ST.yopp[s.w]]||g.pick(W.clubs.filter(x=>x.id!==c.id));
    const nm=()=>{const p=POOLS[g.pick(Object.keys(POOLS))];return g.pick(p[0])+' '+g.pick(p[1])};
    const mk=b=>SLOTS.map(pos=>({p:{id:'y',n:nm(),ovr:Math.round(b+g.norm(0,3)),pos},pos,min:90,from:1}));
    const hc={id:-1,name:c.name+' U18',xi:mk(c.base-11)},ac={id:-2,name:opp.name+' U18',xi:mk(opp.base-11)},pl=decidePlay('yth',rk);
    if(pl.mode==='start'||pl.mode==='sub'){
      const res=playMatch(hc,ac,rk,{detail:true,me,play:pl,side:0});
      rep=mkReport(res,'yth','U18 League · Match '+(s.w/2),hc,ac,pl);
    }
  }
  return rep;
}
function step(){
  if(ST.pend||ST.phase!=='play')return;
  while(ST.si<ST.slots.length){const rep=runSlot();if(rep){ST.last=rep;return}if(ST.pend)return}
  finishSeason();
}
function simTo(all){
  for(let n=0;n<600;n++){
    step();if(ST.phase!=='play')break;
    if(ST.pend){if(all&&ST.pend.t==='block'){closePend();continue}break}
  }
}
function closePend(){
  const p=ST.pend;ST.pend=null;
  if(p&&p.t==='block'){const old=ST.me.role;ST.me.role=calcRole();if(old!==ST.me.role)ST.note='Role changed: '+ROLEN[old]+' → '+ROLEN[ST.me.role]}
}

/* ---------- awards ---------- */
// how far a club got in Europe this season: Champions League rounds count most, Europa League far less
// individual output + visibility (a player whose club is not in Europe is far less likely to be voted for) + team success + star reputation
// Weights fitted (scratch fit over 84 simulated seasons) so the positions of winners and top-3 finishers match the real
// Ballon d'Or 1995-2025: winners ~38 percent strikers, 30 wingers, 14 attacking mids, 9 central/holding mids, 7 centre-backs.
// Ratings count against the player's own position's average, and voters give some positions extra credit (BDOPB).
const BDOPB={"ST": 2.5, "W": -1.2, "AM": -0.06, "CM": 2.97, "DM": 0.12, "FB": -7.03, "CB": 4.96, "GK": 11},BDOW={"wr": 17.498, "wa": 0.382, "wt": 1.463, "wo": 0.33, "csw": 0.35};
function pscore(pos,ap,g,a,avg,eg,cs,tb,ovr,vis){
  const mu=(RM&&RM.real[pos]?RM.real[pos].mean:RAVG);
  const b=BDOW.wr*(avg-mu)+(g+eg*.8)*PGV[pos]+a*BDOW.wa+((pos==='GK'||pos==='CB')?cs*BDOW.csw:0);
  return b*Math.min(1,Math.sqrt(ap/28))*vis+BDOW.wt*tb+Math.max(0,ovr-78)*BDOW.wo+(BDOPB[pos]||0);
}
function race(){
  const W=ST.W,me=ST.me,L=me.ss.lg,rows=[];
  for(const p of W.pl)if(p.cl>=0&&p.ap>=4&&club(p.cl).lg<NTOP)rows.push({n:p.n,c:p.cl,pos:p.pos,g:p.g,a:p.a,ap:p.ap,sc:pscore(p.pos,p.ap,p.g,p.a,p.rs/p.ap,p.eg,p.cs,eurPts(p.cl).pts,p.ovr,eurPts(p.cl).eu?1:.75)});
  if(L.ap>=4&&club(me.cl).lg<NTOP)rows.push({n:me.name,c:me.cl,me:1,pos:me.pos,g:L.g,a:L.a,ap:L.ap,sc:pscore(me.pos,L.ap,L.g,L.a,L.rs/L.rn,me.ss.eu.g,L.cs,eurPts(me.cl).pts,me.ovr,eurPts(me.cl).eu?1:.75)});
  for(const r of rows)r.sc=bdoAdj(r.sc,r.me,r.n);
  return rows.sort((a,b)=>b.sc-a.sc);
}
// league position, cup round and Europe status for a candidate's club -- what powers the Ballon d'Or race's expand view
function clubCompStatus(cid){
  const c=club(cid),lg=c.lg,t=table(lg),pos=t.findIndex(x=>x.id===cid)+1;
  const eu=ST.eu&&ST.eu.ucl.teams.includes(cid)?'Champions League':ST.eu&&ST.eu.uel.teams.includes(cid)?'Europa League':null;
  const tl=topLg(lg),cp=ST.cup&&ST.cup[tl];let cupTxt=null;
  if(cp)for(let r=cp.rounds.length-1;r>=0;r--){if(cp.rounds[r]&&cp.rounds[r].some(x=>x.h===cid||x.a===cid)){cupTxt=cp.names[r];break}}
  return{pos,lgName:LGN[lg].n,eu,cupTxt,cupName:tl!=null?LGN[tl].cup:null};
}
function finishSeason(){
  managerReview(false);
  const W=ST.W,me=ST.me,lab=label(ST.season),ss=me.ss,L=ss.lg,C=ss.cup,E=ss.eu,Y=ss.yth;
  const tabs=LGN.map((_,i)=>table(i)),champ=tabs.map(t=>t[0].id),ucl=ST.eu.ucl.win,uel=ST.eu.uel.win,cups=ST.cup.map(c=>c.win);
  const tb=id=>(champ.includes(id)?4:0)+eurPts(id).pts+(cups.includes(id)?1.5:0),vis=id=>eurPts(id).eu?1:.75;
  const rows=[];
  for(const p of W.pl)if(p.cl>=0&&p.ap>=12&&club(p.cl).lg<NTOP)rows.push({n:p.n,c:p.cl,pos:p.pos,age:p.age,fk:p.fk?1:0,sc:pscore(p.pos,p.ap,p.g,p.a,p.rs/p.ap,p.eg,p.cs,tb(p.cl),p.ovr,vis(p.cl))});
  const lgM=club(me.cl).lg;let mine=null;
  if(L.ap>=12&&lgM<NTOP){mine={n:me.name,c:me.cl,pos:me.pos,age:me.age,me:1,sc:pscore(me.pos,L.ap,L.g,L.a,L.rs/L.rn,E.g,L.cs,tb(me.cl),me.ovr,vis(me.cl))};rows.push(mine)}
  const gn=R(ST.seed+'|L|bdo|'+ST.season);for(const r of rows)r.sc=bdoAdj(r.sc,r.me,r.n)*(1+gn.norm(0,.04));
  rows.sort((a,b)=>b.sc-a.sc);
  const rank=mine?rows.indexOf(mine)+1:0,aw=[],hon=[];
  const boots=LGN.map((_,lg)=>{let b={n:'-',g:0};for(const p of W.pl)if(p.cl>=0&&club(p.cl).lg===lg&&p.g>b.g)b={n:p.n,g:p.g};return b});
  if(mine){
    if(rank===1)aw.push("Ballon d'Or");else if(rank<=30)aw.push("Ballon d'Or: #"+rank);
    if(rows.find(r=>r.age<=21)===mine){aw.push('Kopa Trophy');aw.push('Golden Boy')}
    if(rows.find(r=>r.pos==='GK')===mine)aw.push('Yashin Trophy');
    if(rows.find(r=>club(r.c).lg===lgM)===mine)aw.push(LGN[lgM].s+' Player of the Season');
  }
  if(L.g>0&&L.g>=boots[lgM].g)aw.push(LGN[lgM].s+' Golden Boot');
  if(L.ap>=10&&champ.includes(me.cl))hon.push(LGN[lgM].n);
  if(E.ap>=1&&me.cl===ucl)hon.push('Champions League');
  if(E.ap>=1&&me.cl===uel)hon.push('Europa League');
  if(C.ap>=1&&cups.includes(me.cl))hon.push(LGN[lgM].cup);
  me.hon.push(...hon.map(t=>({t,s:lab,c:club(me.cl).name})));
  me.aw.push(...aw.map(t=>({t,s:lab})));
  const tot=L.ap+C.ap+E.ap,rn=L.rn+C.rn+E.rn,rsum=L.rs+C.rs+E.rs;
  const avg=rn?rsum/rn:Y.rn?Y.rs/Y.rn:0;
  const row={s:lab,age:me.age,club:club(me.cl).name,loan:me.parent>=0,ap:tot,g:L.g+C.g+E.g,a:L.a+C.a+E.a,avg,ovr:me.ovr,hon:hon.length,rank,y:Y.ap?{ap:Y.ap,g:Y.g,a:Y.a}:null};
  me.rows.push(row);
  const H={s:lab,champs:tabs.map(t=>t[0].name),ucl:club(ucl).name,uel:club(uel).name,bdo:{n:rows[0].n,c:club(rows[0].c).name,me:!!rows[0].me},boots,top:tabs.map(t=>t.slice(0,3).map(c=>c.name))};
  ST.hof.push(H);
  ST.prev=tabs.map(t=>t.map(c=>c.id));ST.prevPpg={};
  for(const c of W.clubs)ST.prevPpg[c.id]=c.t.p/Math.max(1,c.t.w+c.t.d+c.t.l);
  const mins=L.mn+C.mn+E.mn+Y.mn*.6;
  let boost=(clamp(mins/2600,0,1.2)-.5)*1.8+((avg||RAVG)-RAVG)*.5;   // the other half of the performance effect has already been applied block by block
  if(me.age>=27)boost*=.4;
  develop(boost);
  const bdo=rows.slice(0,10).map(r=>({n:r.n,c:club(r.c).name,pos:r.pos,sc:Math.round(r.sc),me:r.me?1:0,fk:r.fk||0}));
  ST.pend={t:'season',s:lab,H,bdo,rank,aw,hon,row,rev:0,avg:avg||RAVG,rein:reinventCheck(),opts:makeOffers(avg||RAVG)};
}

/* ---------- offers, moves, retirement ---------- */
function applyOffer(i){
  const me=ST.me,o=ST.pend.opts[i];if(!o)return;
  if(o.k==='transfer'&&o.sell&&o.sell!=='ok'){ST.note=club(o.c).name+' cannot sign you yet: '+club(me.parent>=0?me.parent:me.cl).name+' have not agreed to sell.';return}
  if(o.k==='retire'){retire();return}
  const from=club(me.cl).name;
  if(o.k==='loan'){if(me.parent<0)me.parent=me.cl;me.cl=o.c}
  else if(o.k==='return'){me.cl=me.parent;me.parent=-1}
  else if(o.k==='transfer'){me.cl=o.c;me.parent=-1}
  if(!o.cur)me.ct={w:o.w,y:o.y,exp:ST.season+1+o.y};   // 'keep' and a loan return carry on with the existing deal
  logArch((o.k==='stay'?'Extended with ':o.k==='keep'?'Stayed on current deal at ':o.k==='loan'?'Loan to ':o.k==='return'?'Returned to ':o.free?'Joined on a free transfer: ':'Joined ')+club(o.c).name+' · €'+o.w+'k/wk');
  if(o.k!=='stay'&&o.k!=='keep')me.tn=-1;
  if(o.k!=='stay'&&o.k!=='keep')me.moves.push({s:label(ST.season+1),k:o.k,from,to:club(o.c).name,fee:o.fee});
  newSeason();
}
function newSeason(){
  ST.me.tn=(ST.me.tn||0)+1;promoRel();ST.season++;rollWorld();setupSeason();
  ST.me.role=calcRole();ST.note='';ST.pend={t:'train'};
}
function retire(){
  const me=ST.me,rs=me.rows.filter(r=>!r.youth),T=k=>rs.reduce((a,r)=>a+r[k],0);
  const bd=me.aw.filter(a=>a.t==="Ballon d'Or").length,lg=me.hon.filter(h=>LGN.some(l=>l.n===h.t&&l.tier===1)).length,ucl=me.hon.filter(h=>h.t==='Champions League').length;
  const oth=me.hon.length-lg-ucl,aw=me.aw.length-bd;
  const sc=2.5*lg+7*ucl+1.5*oth+22*bd+2*aw+(me.peak-70)*.9+T('g')*.04+T('a')*.03+T('ap')*.01;
  const tier=sc<8?'Journeyman':sc<20?'Solid professional':sc<40?'Club legend':sc<75?'World-class':sc<130?'All-time great':'The GOAT';
  ST.sum={ap:T('ap'),g:T('g'),a:T('a'),lg,ucl,oth,bd,aw,peak:me.peak,sc:Math.round(sc),tier,seasons:rs.length};
  ST.phase='retired';ST.pend=null;
}
