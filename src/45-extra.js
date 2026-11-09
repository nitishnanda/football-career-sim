const NSTR={England:84,France:85,Spain:84,Germany:82,Portugal:83,Brazil:83,Argentina:84,Italy:79,Netherlands:80,Belgium:77,Croatia:75,Uruguay:77,Colombia:76,Morocco:77,Senegal:75,Nigeria:72,Ghana:71,USA:74,Mexico:73,Japan:75,'South Korea':73,Denmark:74,Switzerland:73,Norway:72,Turkey:73,Scotland:70};
const INTW=[9,17,26,34];
const TNAME=y=>y%4===0?'European Championship':'World Cup';
const MGRP=['eng','esp','ger','ita','fra'];

function addMsg(t,title,body){
  const w=(ST.slots&&ST.slots[ST.si-1]||{}).w;
  ST.inbox.unshift({id:ST.mid++,t,title,body,s:label(ST.season)+(w?' · wk '+w:'')});
  if(ST.inbox.length>80)ST.inbox.pop();
}
const logArch=t=>{ST.archive.unshift({s:label(ST.season),t});if(ST.archive.length>200)ST.archive.pop()};
function mgr(c){if(c.mgr)return c.mgr;const g=R('mgr|'+c.id),p=POOLS[poolOf(LGN[c.lg].country)]||POOLS[MGRP[0]];return g.pick(p[0]).slice(0,1)+'. '+g.pick(p[1])}
function playProbs(kind){
  const me=ST.me,fm=me.form.length?me.form.reduce((a,b)=>a+b,0)/me.form.length:RAVG;
  let ps,pb;
  if(kind==='yth'){ps=.93;pb=.3}
  else if(kind==='nat'){
    if(me.nr==='starter'){ps=.85;pb=.5}
    else{const teenCap=me.age<19&&!me.natProven;ps=teenCap?.06:.25;pb=teenCap?.55:.5}
  }else{
    const sd=selData(),t={starter:[0,.55],rotation:[0,.55],bench:[0,.4]}[me.role]||[0,.2];
    ps=sd.ps;pb=t[1];if(kind!=='lg')ps+=me.role==='starter'?.02:.3;
    ps=clamp(ps+(fm-RAVG)*.04,.02,.98);
    // below starter-ready age (see effBrk), clubs are still managing minutes carefully: involvement is capped
    // and skews toward cup football, with Europe trusted to young players last of all
    if(me.cl>=0){
      const b=effBrk(me);
      if(me.age<b.s){
        const early=me.age<b.r;
        ps=clamp(ps*(early?.35:.65),.02,early?.45:.75);
        pb=clamp(pb*1.15,.02,.85);
        if(kind==='cup')ps=clamp(ps*1.25,.02,.85);
        if(kind==='eu')ps=clamp(ps*.5,.01,.5);
      }
    }
  }
  return{ps,pb};
}
function cond(){const me=ST.me;if(me.inj>0)return 55;const l=(ST.mineLog||[]).slice(-3);return clamp(Math.round(99-l.reduce((a,x)=>a+(x.mn||0),0)/270*13),70,99)}

/* ---------- national team ---------- */
function natRole(){
  const me=ST.me;if(me.age<16)return null;
  const fm=me.form.length?me.form.reduce((a,b)=>a+b,0)/me.form.length:RAVG,o=me.ovr+(fm-RAVG)*3,k=NSL[me.pos];
  let better=0;for(const p of ST.W.pl)if(p.cl>=0&&p.nat===me.nat&&p.pos===me.pos&&p.ovr>o)better++;
  if(o<(NSTR[me.nat]||72)-16)return null;
  // under-19s and not yet proven: a debut and a place in the squad, but the starting shirt is earned, not given
  if(me.age<19&&!me.natProven)return better<k+2?'squad':null;
  return better<k?'starter':better<k+2?'squad':null;
}
function fakeXI(g,b,nat){
  const pl=POOLS[nat?poolOf(nat):g.pick(Object.keys(POOLS))];
  return SLOTS.map(pos=>({p:{id:'y',n:g.pick(pl[0])+' '+g.pick(pl[1]),ovr:Math.round(b+g.norm(0,3)),pos},pos,min:90,from:1}));
}
function natMatch(rk,own,opp,lab,neutral,ko){
  const me=ST.me,g=R(ST.seed+'|L|nm|'+rk),pl=decidePlay('nat',rk);
  const hc={id:-1,name:own,xi:fakeXI(g,NSTR[own]||72,own)},ac={id:-2,name:opp,xi:fakeXI(g,NSTR[opp]||72,opp)};
  const res=(ko?koPlay:playMatch)(hc,ac,rk,{detail:true,me,play:pl,side:0,neutral});
  return{res,rep:mkReport(res,'nat',lab,hc,ac,pl)};
}
function tourSlot(s){
  const me=ST.me,y=ST.season+1,nm=TNAME(y),T=ST.tour=ST.tour||{q:null,alive:true,pts:0,gd:0},g=R(ST.seed+'|L|tour|'+y+'|'+s.r);
  if(s.r===0){
    const rank=Object.keys(NSTR).sort((a,b)=>NSTR[b]-NSTR[a]).indexOf(me.nat);
    T.q=R(ST.seed+'|L|tq|'+y).r()<(rank<14?.95:rank<20?.6:.3);T.alive=T.q;
    addMsg('national',nm+(T.q?': squad named':': failed to qualify'),T.q?me.nat+' head into the '+nm+' with you in the squad.':me.nat+' missed out on the '+nm+'.');
  }
  if(!T.alive)return null;
  const names=Object.keys(NSTR).filter(n=>n!==me.nat),ko=s.r>=3;
  const on=ko?g.pick(names.sort((a,b)=>NSTR[b]-NSTR[a]).slice(0,12)):g.pick(names);
  const lab=nm+' · '+(ko?['Round of 16','Quarter-final','Semi-final','Final'][s.r-3]:'Group match '+(s.r+1));
  const{res,rep}=natMatch(ST.season+'|tour'+s.r,me.nat,on,lab,true,ko);
  if(!ko){
    T.pts+=res.hg>res.ag?3:res.hg===res.ag?1:0;T.gd+=res.hg-res.ag;
    if(s.r===2&&!(T.pts>=4||(T.pts===3&&T.gd>=0&&g.chance(.5)))){T.alive=false;addMsg('national',nm+': out in the group stage',me.nat+' finished on '+T.pts+' points and go home.')}
  }else if(res.w!==-1){T.alive=false;addMsg('national',nm+': knocked out',me.nat+' lose in the '+lab.split(' · ')[1].toLowerCase()+'.')}
  else if(s.r===6){T.win=true;me.hon.push({t:nm,s:label(ST.season),c:me.nat});addMsg('national',nm+' winners!',me.nat+' are champions of the world of football.')}
  return rep;
}

/* ---------- decisions ---------- */
function offerInfo(o){
  const me=ST.me,c=club(o.c),L=byPos(c)[me.pos]||[],k=NSL[me.pos],t1=L[k-1]?L[k-1].ovr:me.ovr;
  const wage=p=>p.wg!=null?p.wg:wageFor(c,wageVal(p.ovr,p.age,p.pa,c,p.pk));
  const ws=c.sq.map(id=>ST.W.pl[id]).map(p=>({n:p.n,w:wage(p)})).sort((a,b)=>b.w-a.w);
  const old=L.slice().sort((a,b)=>b.age-a.age)[0],cb=ST.W.clubs.filter(x=>x.lg===c.lg).sort((a,b)=>b.base-a.base).findIndex(x=>x.id===c.id);
  return{fit:clamp(Math.round(62+(me.ovr-t1)*3),40,99),min:ws[ws.length-1].w,top:ws[0],rank:ws.filter(x=>x.w>o.w).length+1,of:ws.length+1,old,
    dom:[.4,.26,.15,.07,.04,.02][cb]||.01,ucl:clamp((c.base-70)*.02,.01,.45),ast:Math.round(o.w*.26),sf:Math.round(o.w*5),
    agent:Math.round((o.fee||mval())*.05*10)/10,cur:me.ct?me.ct.w:(()=>{const h=club(me.parent>=0?me.parent:me.cl);return wageFor(h,wageVal(me.ovr,me.age,me.pa,h,me.peak))})()};
}
function rejectOffer(i){const o=ST.pend.opts[i];if(!o||o.k==='stay'||o.k==='keep'||o.k==='return'||o.k==='retire')return;o.rej=1;logArch('Rejected '+club(o.c).name)}
function counterOffer(i){
  const o=ST.pend.opts[i];if(!o||ST.bud<1||o.cnt||o.k==='retire'||o.cur)return;   // nothing to negotiate on a deal already signed
  ST.bud--;const g=R(ST.seed+'|P|counter|'+ST.season+'|'+i);
  if(g.r()<clamp(.4+((ST.me.trust||60)-50)/150,.2,.8)){o.w=Math.round(Math.min(o.w*1.15,Math.max(o.w,wageCap(club(o.c))))*10)/10;o.cnt=1;logArch('Counter accepted by '+club(o.c).name+': €'+o.w+'k/wk')}
  else if(o.k==='transfer'&&g.chance(.4)){o.rej=1;logArch(club(o.c).name+' withdrew their offer')}
  else{o.cnt=1;logArch(club(o.c).name+' refused to improve their terms')}
}
function consult(){
  if(ST.bud<1)return;ST.bud--;
  const me=ST.me,hc=club(me.parent>=0?me.parent:me.cl),r=roleAt(hc,me.ovr);
  me.trust=Math.min(99,(me.trust||60)+3);
  addMsg('club','Manager meeting: '+mgr(hc),`${mgr(hc)} sees you as ${ROLEN[r].toLowerCase()} next season at ${hc.name}. ${r==='starter'?'He wants to build the side around you.':r==='rotation'?'He expects you to push for a place.':'He suggests going out on loan for minutes.'}`);
  logArch('Met '+mgr(hc));
}
function matchDate(w,key){
  let d=new Date(Date.UTC(ST.season,7,15));while(d.getUTCDay()!==6)d=new Date(d.getTime()+864e5);
  d=new Date(d.getTime()+(w-1)*7*864e5);
  return['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()]+' '+d.getUTCDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]+' · '+['12:30','15:00','17:30','20:00'][hashStr(w+'|'+key)%4];
}

const TMEAN={1:75,2:66,3:59,4:54};
// end of season: top clubs of each lower tier go up, bottom clubs of the tier above go down (groups send 2 each)
function promoRel(){
  const W=ST.W,by={},moves=[];
  LGN.forEach((l,i)=>{const c=by[l.country]=by[l.country]||{};(c[l.tier]=c[l.tier]||[]).push(i)});
  for(const ct in by){
    const ts=Object.keys(by[ct]).map(Number).sort((a,b)=>a-b);
    for(let k=0;k<ts.length-1;k++){
      const U=by[ct][ts[k]],L=by[ct][ts[k+1]],per=L.length>1?2:3,up=[];
      L.forEach(d=>up.push(...ST.prev[d].slice(0,per)));
      const down=[];U.forEach(d=>down.push(...ST.prev[d].slice(-Math.ceil(up.length/U.length))));
      moves.push({U,L,up,down:down.slice(0,up.length)});
    }
  }
  for(const m of moves){
    m.up.forEach((id,i)=>{W.clubs[id].nl=m.U[i%m.U.length]});
    m.down.forEach((id,i)=>{W.clubs[id].nl=m.L[i%m.L.length]});
  }
  for(const c of W.clubs)if(c.nl!=null){
    const was=c.lg;
    if(c.nl!==was){
      c.lg=c.nl;c.b0=c.b0*.75+TMEAN[LGN[c.nl].tier]*.25;
      if(c.id===ST.me.cl||c.id===ST.me.parent)addMsg('club',LGN[c.nl].tier<LGN[was].tier?'Promoted: '+c.name:'Relegated: '+c.name,c.name+' will play in the '+LGN[c.nl].n+' next season.');
    }
    delete c.nl;
  }
}

// ---- in-season development: at each block review ratings move a share of the way to next year's level, and performance beats/misses expectation
const sumSS=(ss,k)=>['lg','cup','eu','yth','nat'].reduce((a,x)=>a+((ss[x]&&ss[x][k])||0),0);
const avgOf=a=>a.reduce((s,x)=>s+x,0)/a.length;
function inSeasonDev(n){
  if(ST.noisd)return;   // test switch
  const W=ST.W,f=1/(6-n);
  // what rating a player of this ovr and position normally gets, from every player's season so far
  const by={};for(const p of W.pl)if(p.cl>=0&&p.ap>=5)(by[p.pos]=by[p.pos]||[]).push(p);
  const fitp={};
  for(const pos in by){
    const a=by[pos];if(a.length<20)continue;
    const xs=a.map(p=>p.ovr),ys=a.map(p=>p.rs/p.ap),mx=avgOf(xs),my=avgOf(ys);let sxy=0,sxx=0;
    for(let i=0;i<a.length;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)*(xs[i]-mx)}
    const b=sxx?sxy/sxx:0,a0=my-b*mx,sd=Math.sqrt(avgOf(a.map((p,i)=>{const r=ys[i]-(a0+b*xs[i]);return r*r})))||.3;
    fitp[pos]={a0,b,sd};
  }
  const sens=age=>age<=23?[.9,1.2]:age<=28?[.5,0]:[.3,0];
  for(const p of W.pl){
    if(p.cl<0)continue;
    const ft=fitp[p.pos];
    if(ft&&p.ap>=5){
      const z=(p.rs/p.ap-(ft.a0+ft.b*p.ovr))/ft.sd*p.ap/(p.ap+12),dz=z-(p.zp||0),[sd,sp]=sens(p.age);
      p.zp=z;p.dv=clamp(p.dv+sd*dz,-8,8);if(sp&&p.age<25)p.gm=clamp((p.gm!=null?p.gm:1)+.1*dz,.25,1.3);
    }
    const o=p.ovf!=null?p.ovf:p.ovr,o0=p.o0!=null?p.o0:p.ovr,nom=ovrAt(p.pa,p.age+1,p.dv*.75),target=p.gm!=null&&p.age<25&&nom>o0?o0+p.gm*(nom-o0):nom;
    p.ovf=Math.round((o+(target-o)*f)*10)/10;p.ovr=Math.round(p.ovf);
  }
  for(const c of W.clubs)c._bp=null;
  // the user's player, same logic
  const me=ST.me,ss=me.ss,rn=sumSS(ss,'rn'),rsum=sumSS(ss,'rs'),ft=fitp[me.pos];
  if(ft&&rn>=4){const z=(rsum/rn-(ft.a0+ft.b*me.ovr))/ft.sd*rn/(rn+12),dz=z-(me.zp||0);me.zp=z;me.gap=clamp(me.gap+(me.age<=23?.8:.4)*dz,-9,3)}
  const target=me.pa*fAge(me.age+1)*archAge(me,me.age+1)+me.gap*.75;me.base+=(target-me.base)*f;refresh(me);
  if(typeof holdEliteTail==='function')holdEliteTail();
}

// ---- value, news
// Market value (EUR m), fitted to real Transfermarkt values of the players in this world (scripts: see VCURVE).
// Prime-age median value by overall: exponential up to about 80, then flattening towards a ceiling, as real values do
// (the most valuable players in the world are worth about 180-200m).
const VCURVE=[[40,.05],[50,.3],[56,1],[60,2.5],[64,5],[68,10],[70,15],[74,25],[78,40],[80,60],[82,86],[84,117],[86,141],[88,190],[90,240],[93,265],[97,285]];   // top end tuned so the world's value spread matches 2024-25 (about 20-23 players over 100m, 6-7 over 150m, 4-5 over 180m, top-10 average about 165m)
function vAt(o){if(o<=VCURVE[0][0])return VCURVE[0][1];for(let i=1;i<VCURVE.length;i++){const[a,va]=VCURVE[i-1],[b,vb]=VCURVE[i];if(o<=b)return Math.exp(Math.log(va)+(Math.log(vb)-Math.log(va))*(o-a)/(b-a))}return VCURVE[VCURVE.length-1][1]}
// c (optional): the player's club. Premier League players carry a market premium; elsewhere values run about 20% lower
// for the same ability (calibrated so each league's total squad value matches its real Transfermarkt total).
function valueFor(ovr,age,pa,c){
  let v=vAt(ovr)*(c?(LGN[c.lg].country==='England'&&LGN[c.lg].tier===1?.97:.8):1);
  if(age<24)v*=Math.exp(.0768*(24-age))*(age<23&&pa>ovr?1+Math.min(.25,(pa-ovr)*.012):1);   // youth premium (fitted .077 per year under 24)
  if(age>31)v*=Math.exp(-.12*(age-31));                                                    // fitted decline after 31
  if(age<18)v*=age<16?.2:age<17?.3:.45;                                                    // not yet a professional
  if(v>180)v=180+20*Math.tanh((v-180)/20);   // soft ceiling: the very best bunch up just under the real record of 200m
  return Math.max(.05,Math.round(v*10)/10);
}
function addNews(k,t){ST.news=ST.news||[];ST.news.unshift({k,t,s:label(ST.season)+' · wk '+((ST.slots[ST.si-1]||{}).w||0)});if(ST.news.length>40)ST.news.pop()}
// headline moments from top-five-league matches: hat-tricks and thrashings
function newsFrom(res,hc,ac){
  if(hc.lg>=NTOP||!res.evs)return;
  const cnt={};for(const e of res.evs){const k=e.sc.p.n||'';(cnt[k]=cnt[k]||{n:0,me:!!e.sc.me}).n++}
  for(const k in cnt)if(cnt[k].n>=3)addNews(cnt[k].me?'me':'hat',`${k} ${cnt[k].n===3?'scores a hat-trick':'scores '+cnt[k].n}: ${hc.name} ${res.hg}–${res.ag} ${ac.name}`);
  if(Math.abs(res.hg-res.ag)>=5)addNews('big',`${res.hg>res.ag?hc.name:ac.name} rout ${res.hg>res.ag?ac.name:hc.name}, ${res.hg}–${res.ag}`);
}

/* national team head coaches (best known as of late 2026; unknown ones read as a caretaker) */
const NMGR={England:'Thomas Tuchel',Scotland:'Sébastien Pocognoli',Spain:'Luis de la Fuente',France:'Zinedine Zidane',Germany:'Jürgen Klopp',Italy:'Gennaro Gattuso',Portugal:'Caretaker manager',Brazil:'Carlo Ancelotti',Argentina:'Lionel Scaloni',Netherlands:'Ronald Koeman',Belgium:'Rudi Garcia',Croatia:'Zlatko Dalić',Uruguay:'Marcelo Bielsa',Colombia:'Néstor Lorenzo',Morocco:'Walid Regragui',Senegal:'Pape Thiaw',Nigeria:'Eric Chelle',Ghana:'Carlos Queiroz',USA:'Mauricio Pochettino',Mexico:'Javier Aguirre',Japan:'Hajime Moriyasu','South Korea':'Hong Myung-bo',Denmark:'Brian Riemer',Switzerland:'Murat Yakin',Norway:'Ståle Solbakken',Turkey:'Vincenzo Montella'};
const natMgr=n=>NMGR[n]||'The national coach';
