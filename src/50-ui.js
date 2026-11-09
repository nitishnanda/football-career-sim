let TAB='home',LGV=0,UIM=null,COMPACT=false,BRK=false,INB={f:'all',sel:null,log:0};
const CF={name:'',nat:'England',pos:'ST',arch:'Poacher',foot:'Right',ht:182,frame:'Athletic',tier:'random',seed:'',era:2026};
const PPOS={GK:[6,50],CB:[21,50],FB:[27,12],DM:[38,50],CM:[52,34],AM:[64,66],W:[76,88],ST:[91,50]};
const FRAMES=['Lean Wire','Athletic','Power Solid'],WMUL={'Lean Wire':.78,Athletic:.88,'Power Solid':.98};
const DIR={pac:'Sprint mechanics & acceleration',sho:'Finishing patterns & shot technique',pas:'Ball progression & key passes',dri:'Close control & 1v1 take-ons',def:'Positioning & tackling timing',phy:'Strength & endurance block',div:'Diving range & recovery',han:'Handling & claiming crosses',kic:'Distribution & kicking',ref:'Reflex & reaction work',pos:'Positioning & sweeping'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rc=r=>r>=9?'r6':r>=8?'r5':r>=7?'r4':r>=6.5?'r3':r>=6?'r2':'r1';
const rb=(r,big)=>r==null?'':`<span class="rb ${big?'big ':''}${rc(r)}">${r.toFixed(1)}</span>`;
const stars=pa=>{const n=clamp(Math.round((pa-62)/7),1,5);return'★'.repeat(n)+'☆'.repeat(5-n)};
const euro=v=>v>=1?'€'+(v>=10?Math.round(v):v.toFixed(1))+'M':'€'+Math.round(v*1000)+'k';
const ord=n=>n+(['th','st','nd','rd'][(n%100>>3^1&&n%10<4)?n%10:0]||'th');
const keysOf=me=>me.pos==='GK'?GKK:OUTK;
const kk=t=>`<span class="k">${t}</span>`;
const G=(cls,h)=>`<section class="glass ${cls||''}">${h}</section>`;
const ab=n=>{const w=String(n).replace(/[^A-Za-zÀ-ÿ ]/g,'').split(' ').filter(Boolean);return(w.length>1?w.map(x=>x[0]).join(''):(w[0]||'?').slice(0,3)).slice(0,3).toUpperCase()};
const crestN=(n,sz)=>`<span class="crest${sz?' '+sz:''}">${ab(n)}</span>`;
const dots=f=>`<span class="dots">${(f||'').split('').map(x=>`<i class="d ${x}"></i>`).join('')}</span>`;
const pct=(v,t)=>t?Math.round(v/t*100):0;
const phi=z=>.5*(1+Math.tanh(.8*z));
const shirt=me=>{const o={GK:[1],CB:[4,5,15,23],FB:[2,3,12,16],DM:[6,14,18],CM:[8,16,20],AM:[10,21],W:[7,11,17],ST:[9,19]}[me.pos];return o[hashStr(me.name)%o.length]};
const bgm=p=>(ST.me.nr&&p?1:0);

// Saves are upgraded, never rejected: missing fields get defaults here, and upgradeSave() rebuilds anything whose shape
// changed once the save is loaded (see 55-saves.js).
function migrate(s){
  if(!s||!s.me||!s.W)return null;
  s._from=s.v||1;s.v=VER;s.inbox=s.inbox||[];s.archive=s.archive||[];s.mid=s.mid||1;s.bud=s.bud==null?2:s.bud;s.yr0=s.yr0==null?(s.season||2026)-8:s.yr0;
  const m=s.me;m.tx=m.tx||{};m.trust=m.trust||60;m.caps=m.caps||0;m.ig=m.ig||0;m.tn=m.tn||0;m.wf=m.wf||3;m.frame=m.frame||'Athletic';
  if(m.ss&&!m.ss.nat)m.ss.nat=z0();
  return s;
}

/* ---------- create ---------- */
function archBlurb(a){return Object.entries(a).map(([k,v])=>(v>0?'+':'')+v+' '+KL[k]).join(' · ')}
const TLAB={gen:'Generational',wk:'Wonderkid',pr:'Promising',gr:'Grassroots'};
function archRefs(x){return['gen','wk','pr','gr'].map(t=>`<div class="kv"><span>${TLAB[t]}</span><b>${(x.refs[t]||[]).length?esc(x.refs[t].join(', ')):'<span class="m">lower-league regulars</span>'}</b></div>`).join('')}
function eraPicker(){
  const lastLab=label(LAST_HIST);
  const presets=[[DEFAULT_SEASON,'Classic · today',"Debut in the "+label(DEFAULT_SEASON)+" season. The world is real right now and invents players as it moves forward from here, same as it always has."],
    [FIRST_HIST,'Historic · 2013',"Debut in the "+label(FIRST_HIST)+" season. Every top-flight squad, manager and market value through "+lastLab+" is the real one -- Messi, peak Drogba, teenage Mbappé, all at the right age. Lower divisions still use today's snapshot throughout. After "+lastLab+" the world starts inventing players, exactly like a Classic career does from the start."]];
  return presets.map(([v,n,d])=>`<button class="opt ${String(CF.era)===String(v)?'on':''}" data-a="cf" data-k="era" data-v="${v}"><b>${n}</b><br><span class="m sm">${esc(d)}</span></button>`).join('');
}
function archPicker(){
  const L=ARX[CF.pos],sel=CF.arch==='random'?null:L[CF.arch];
  return`<button class="opt ${CF.arch==='random'?'on':''}" data-a="cf" data-k="arch" data-v="random"><div class="row sp"><b>Surprise me</b>${CF.arch==='random'?'<span class="pill hot">ACTIVE</span>':''}</div><span class="m sm">A hidden style is picked for you. Coaches reveal it when you turn pro at 15.</span></button>
  ${Object.entries(L).map(([n,x])=>`<button class="opt ${CF.arch===n?'on':''}" data-a="cf" data-k="arch" data-v="${esc(n)}"><div class="row sp"><b>${n}</b>${CF.arch===n?'<span class="pill hot">ACTIVE</span>':''}</div><span class="m sm">${esc(x.blurb)}</span></button>`).join('')}
  ${sel?`<div class="tile mt"><div class="row wr" style="gap:6px;margin-bottom:8px">${sel.traits.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div><h3>Players like this</h3>${archRefs(sel)}<div class="m sm mt mono">${archBlurb(sel.att)}</div></div>`:''}`;
}
const archName=me=>me.archHidden?'Style unknown':(archOf(me)===ARX[me.pos][me.arch]?me.arch:Object.keys(ARX[me.pos]).find(n=>ARX[me.pos][n]===archOf(me)));
function vCreate(){
  const o=(arr,v)=>arr.map(x=>`<option${x===v?' selected':''}>${x}</option>`).join('');
  const tiers=[['random','Random','Most start as grassroots talent. Anything can happen.'],...TIERS.map((t,i)=>[i,t.n,['Journeyman ceiling, a long way up','Top-flight starter potential','Future star','Once-in-a-generation'][i]])];
  const wt=Math.round((CF.ht-100)*WMUL[CF.frame]),wf=CF.foot==='Both'?5:3;
  return`<div class="page" style="padding-top:24px"><div class="g12">
  ${G('pad s12',`<div class="row sp wr"><div>${kk('Prodigy intake protocol · age 7 to retirement')}<h1>Player creation & academy pathway</h1></div>
  <div class="steps"><div class="step on"><i>01</i><span class="sm">Identity & physicals</span></div><div class="step on"><i>02</i><span class="sm">Tactical archetype</span></div><div class="step"><i>03</i><span class="sm">Academy offers</span></div></div></div>`)}
  ${G('pad s4',`<h2>Identity & bio ${kk('phase 1/3')}</h2><div class="tile row"><span class="crest lg">${ab(CF.name||'Player')}</span><div><b>${esc(CF.name||'Player')}</b><br>${kk(POSN[CF.pos]+' · age 7 · '+CF.nat)}</div></div>
  <div class="form"><label>${kk('Player full name')}<input data-f="name" value="${esc(CF.name)}" placeholder="Your player"></label>
  <label>${kk('Nationality & pathway')}<select data-f="nat">${o(NATS.map(n=>n[0]),CF.nat)}</select></label>
  <label>${kk('Preferred foot · weak foot '+'★'.repeat(wf)+'☆'.repeat(5-wf))}<div class="row">${['Left','Right','Both'].map(f=>`<button class="btn alt g1 ${CF.foot===f?'on':''}" data-a="cf" data-k="foot" data-v="${f}">${f}</button>`).join('')}</div></label>
  <label>${kk('Anthropometric profile · '+CF.ht+' cm · '+wt+' kg')}<input data-f="ht" type="range" min="160" max="204" value="${CF.ht}" style="padding:0"></label>
  <label>${kk('Frame archetype')}<div class="row">${FRAMES.map(f=>`<button class="btn alt g1 sm ${CF.frame===f?'on':''}" data-a="cf" data-k="frame" data-v="${f}">${f}</button>`).join('')}</div></label>
  <label>${kk('Seed (optional)')}<input data-f="seed" value="${esc(CF.seed)}" placeholder="same seed, same league"></label></div>
  <div class="tile mt"><b>Homegrown status</b><br><span class="m sm">Seasons at an academy before 21 count towards squad homegrown quotas.</span></div>`)}
  ${G('pad s4',`<h2>Tactical matrix ${kk('selected: '+CF.pos)}</h2><div class="pitch">${Object.entries(PPOS).map(([p,[x,y]])=>`<button class="pp ${CF.pos===p?'on':''}" style="left:${x}%;top:${y}%" data-a="cf" data-k="pos" data-v="${p}">${p}</button>`).join('')}</div>
  <div class="m sm" style="margin:8px 0 2px">${POSN[CF.pos]}</div><h3 class="mt">Tactical specialisation</h3>
  ${archPicker()}`)}  ${G('pad s4',`<h2>Scout & offers ${kk('age 12')}</h2><div class="tile"><b>${TIERS.map((t,i)=>String(CF.tier)===String(i)?t.n:'').join('')||'Random talent'}</b><br><span class="m sm">Your potential is hidden. Scouts only see what you show on the pitch.</span></div>
  <h3 class="mt">Pathway</h3><div class="tile sm">Ages 7–11 grassroots, then three academy offers at 12. Academy years up to 14 are summarised. From 15 every match is simulated.</div>
  <h3 class="mt">Era</h3>${eraPicker()}
  <h3 class="mt">Talent</h3>${tiers.map(([v,n,d])=>`<button class="opt ${String(CF.tier)===String(v)?'on':''}" data-a="cf" data-k="tier" data-v="${v}"><b>${n}</b><br><span class="m sm">${d}</span></button>`).join('')}`)}
  ${G('pad s12',`<div class="row sp wr"><div><b style="font-size:18px">Finalise formal registration</b> <span class="pill good">READY TO SIGN</span><br><span class="m sm">${esc(CF.name||'Player')} · ${CF.arch==='random'?'Hidden style':CF.arch} · ${CF.nat}</span></div><button class="btn" data-a="create">Begin journey →</button></div>`)}
  </div></div>`;
}

/* ---------- shared bits ---------- */
function unread(){return ST.inbox.filter(m=>!m.seen).length+(ST.pend&&ST.pend.t==='season'?ST.pend.opts.filter(o=>!o.rej&&!o.seen).length+(ST.pend.rein&&!ST.pend.rein.seen?1:0):0)}
function vBanner(){
  const p=ST.pend;if(!p||p.t!=='season'||!p.rev||(TAB==='home'&&DT==='inbox'))return'';
  return`<div class="banner glass pad"><div class="row sp wr"><div><b>Season ${p.s} is over.</b> <span class="m">Decisions are waiting in your inbox before the next season starts.</span></div><button class="btn sm" data-a="goinbox">Review options →</button></div></div>`;
}
function teamBlk(c,right){
  return`<div class="team ${right?'r':''}">${crestN(c.name,'lg')}<div style="min-width:0"><div class="tn">${esc(c.name)}</div>${kk(`${ord(posOf(c))} · ${c.t.p} pts · GD ${c.t.gf-c.t.ga>0?'+':''}${c.t.gf-c.t.ga}`)}<br>${dots(c.f)}</div></div>`;
}
function nextFixObj(){
  const me=ST.me;
  if(me.role==='youth'){const s=ST.slots.slice(ST.si).find(x=>x.t==='yth');return s?{c:'U18 League · Match '+s.w/2,o:(ST.yopp&&ST.yopp[s.w]!=null)?ST.yopp[s.w]:null,h:true,w:s.w,y:1}:null}
  const lg=club(me.cl).lg;
  for(let i=ST.si;i<ST.slots.length;i++){
    const s=ST.slots[i];
    if(s.t==='lg'){if(s.w>LGN[lg].md)continue;const f=fixtures(lg)[s.w-1].find(x=>x[0]===me.cl||x[1]===me.cl),h=f[0]===me.cl;return{c:LGN[lg].n+' · Matchday '+s.w,o:h?f[1]:f[0],h,w:s.w,lg:1}}
    if(s.t==='cup'||s.t==='eu'){const f=slotFixture(s,me.cl);if(f&&!f.bye)return{c:f.c,o:f.o,h:f.h,w:s.w,neutral:f.neutral};continue}
    if(s.t==='int'&&me.nr)return{c:me.nat+' · international break',o:null,h:true,w:s.w};
  }
  return null;
}
// the next n scheduled fixtures, across every competition, for the calendar strip
function nextFixList(n){
  const me=ST.me,out=[];
  if(me.role==='youth'){
    for(let i=ST.si;i<ST.slots.length&&out.length<n;i++){
      const s=ST.slots[i];
      if(s.t==='yth')out.push({c:'U18 League · Match '+(s.w/2),o:(ST.yopp&&ST.yopp[s.w]!=null)?ST.yopp[s.w]:null,h:true,w:s.w,y:1});
      else if(s.t==='int'&&me.nr)out.push({c:me.nat+' · international break',o:null,h:true,w:s.w,nat:1});
    }
    return out;
  }
  const lg=club(me.cl).lg;
  for(let i=ST.si;i<ST.slots.length&&out.length<n;i++){
    const s=ST.slots[i];
    if(s.t==='lg'){
      if(s.w>LGN[lg].md)continue;
      const f=fixtures(lg)[s.w-1].find(x=>x[0]===me.cl||x[1]===me.cl);
      if(f){const h=f[0]===me.cl;out.push({c:LGN[lg].n+' · Matchday '+s.w,o:h?f[1]:f[0],h,w:s.w,lg:1})}
    }else if(s.t==='cup'||s.t==='eu'){
      const f=slotFixture(s,me.cl);
      if(f&&!f.bye)out.push({c:f.c,o:f.o,h:f.h,w:s.w,neutral:f.neutral});
    }else if(s.t==='int'&&me.nr){
      out.push({c:me.nat+' · international break',o:null,h:true,w:s.w,nat:1});
    }else if(s.t==='tour'&&me.nr){
      out.push({c:TNAME(ST.season+1),o:null,h:true,w:s.w,nat:1});
    }
  }
  return out;
}
function matchTag(nf,mc,oc){
  if(!nf||!oc||!nf.lg)return'';
  const t=table(mc.lg),pm=t.findIndex(x=>x.id===mc.id),po=t.findIndex(x=>x.id===oc.id),n=t.length;
  if(nf.w>=15&&pm<2&&po<2)return'Title decider';if(pm<4&&po<4)return'Top-four clash';if(pm>=n-4&&po>=n-4)return'Six-pointer';return'';
}

/* ---------- dashboard ---------- */
function leagueAvgPct(avg,minAp){
  const lg=club(ST.me.cl).lg,ps=ST.W.pl.filter(p=>p.cl>=0&&club(p.cl).lg===lg&&p.ap>=minAp);
  return ps.length?Math.max(1,Math.round(ps.filter(p=>p.rs/p.ap>avg).length/ps.length*100)):null;
}
function vLog(){
  const me=ST.me,ss=me.ss,ap=sumSS(ss,'ap'),st=sumSS(ss,'st'),g=sumSS(ss,'g'),a=sumSS(ss,'a'),mn=sumSS(ss,'mn'),rn=sumSS(ss,'rn'),rs=sumSS(ss,'rs'),sh=sumSS(ss,'sh'),pc=sumSS(ss,'pc'),pa=sumSS(ss,'pa'),xg=sumSS(ss,'xg'),xa=sumSS(ss,'xa'),kp=sumSS(ss,'kp');
  const poss=ST.mineLog.length*90,avg=rn?rs/rn:0,tp=avg?leagueAvgPct(avg,Math.min(8,ss.lg.ap)):null;
  const bar=(l,v,t)=>`<div class="mt"><div class="row sp">${kk(l)}<span class="mono sm">${t}</span></div><div class="bar" style="margin-top:6px"><i style="width:${clamp(v*100,0,100)}%"></i></div></div>`;
  return G('pad s4',`<h2>Campaign logbook ${kk(label(ST.season))}</h2><div class="grid">
  <div class="tile">${kk('Appearances')}<b class="n">${ap}</b><span class="m sm">${st} starts · ${pct(st,ap)}%</span></div>
  <div class="tile">${kk('Total goals')}<b class="n">${g}</b><span class="m sm">${mn?(g/mn*90).toFixed(2):'0.00'} /90 · ${g-xg>=0?'+':''}${(g-xg).toFixed(1)} vs xG ${xg.toFixed(1)}</span></div>
  <div class="tile">${kk('Total assists')}<b class="n">${a}</b><span class="m sm">${xa.toFixed(1)} xA · ${kp} key chances</span></div>
  <div class="tile">${kk('Average rating')}<b class="n">${rn?avg.toFixed(2):'-'}</b><span class="m sm">${tp?'Top '+tp+'% in league':'No data yet'}</span></div></div>
  ${bar('Total pitch volume',poss?mn/poss:0,mn+' / '+poss+' mins')}${bar('Shot conversion',sh?g/sh*2.5:0,sh?`${pct(g,sh)}% (${g}/${sh} shots)`:'-')}${bar('Passing accuracy',pa?pc/pa:0,pa?pct(pc,pa)+'%':'-')}
  <div class="tile mt"><div class="row sp">${kk('Contract status')}<span class="mono sm">${me.ct?'Expires June '+me.ct.exp+' · €'+me.ct.w+'k/wk':'Academy terms'}</span></div></div>`);
}
function vRadar(){
  const rows=race(),mi=rows.findIndex(r=>r.me),top=rows.slice(0,4),all=rows.slice(0,10),den=all.reduce((a,r)=>a+Math.exp(r.sc/6),0)||1;
  const sh=r=>Math.round(Math.exp(r.sc/6)/den*100);
  const row=(r,i)=>`<div class="lrow ${r.me?'me':''}"><span class="no">${i+1}</span><div class="g1"><b>${esc(r.n)}${r.me?' · YOU':''}</b><br>${kk(esc(club(r.c).name)+' · '+r.pos)}</div><div style="text-align:right"><span class="mono sm">${r.g} G · ${r.a} A</span><br>${kk(i<10?sh(r)+'% vote share':'outside top 10')}</div></div>`;
  return G('pad s4',`<h2>Ballon d'Or radar ${kk('live polling')}</h2>${top.map(row).join('')||'<div class="empty">Builds as the season goes on.</div>'}
  ${mi>=4?`<div class="m c">···</div>${row(rows[mi],mi)}`:''}
  <div class="note"><b>Jury weighting.</b> European trophies and Champions League knockout ties count for more than domestic form. A league title adds less than a Champions League win.</div>`);
}
function vTrain(){
  const me=ST.me,A=me.attr,f=me.focus,x=f&&me.tx[f]?me.tx[f]:{xp:0,t:1},a0=me.a0||A;
  const sb=me.sub&&me.pos!=='GK',s0=me.s0||{},ch=(sb?SUBK:keysOf(me)).map(k=>sb?[k,me.sub[k],me.sub[k]-(s0[k]||me.sub[k])]:[k,A[k],A[k]-(a0[k]||A[k])]).sort((p,q)=>Math.abs(q[2])-Math.abs(p[2])||q[1]-p[1]).slice(0,3);
  const tr=me.trust||60,tl=tr>=90?'Untouchable':tr>=75?'Key man':tr>=60?'Trusted':tr>=40?'Neutral':'Doubtful',mc=cond();
  const hc=club(me.parent>=0?me.parent:me.cl);
  return G('pad s4',`<h2>Training regime ${kk('tier '+x.t)}</h2>
  <div class="tile"><div class="row sp">${kk('Active directive')}<span class="mono sm">${f?'+'+(SUBG[f]?trainGain(me,f,me.age<30?3:1.5).toFixed(1):(me.age<30?1.6:.8))+' at season end':'none set'}</span></div><b style="font-size:17px">${f?fLabel(f)+': '+fDir(f):'Pick a focus below'}</b>
  <div class="row sp mt">${kk('Mastery experience')}<span class="mono sm">${Math.round(x.xp)} / 1,000 XP</span></div><div class="bar" style="margin-top:6px"><i style="width:${x.xp/10}%"></i></div>
  <div class="row sp sm m mt">${x.t>1?`<span>Tier ${x.t-1} completed</span>`:'<span>Tier 1 in progress</span>'}<span>Tier ${x.t+1}: ${Math.round(1000-x.xp)} XP away</span></div></div>
  <div class="grid mt"><div class="tile">${kk('Conditioning')}<b class="n">${mc}%</b><span class="m sm">${mc>=90?'Match sharpness: high':mc>=80?'Match sharpness: good':'Needs rest'}</span></div><div class="tile">${kk('Trust metric')}<b class="n">${Math.round(tr)}%</b><span class="m sm">${esc(mgr(hc).split(' ').pop())}: ${tl}</span></div></div>
  <div class="tile mt mono sm">${ch.map(([k,v,d])=>`<div class="row sp"><span>${fLabel(k)}</span><span>${v-d} → ${v} <b style="color:${d>0?'#86f2bd':d<0?'#ff9a9a':'inherit'}">(${d>0?'+':''}${d})</b></span></div>`).join('')}</div>
  <button class="btn alt full" style="text-align:center" data-a="plan">Modify development plan</button>`);
}

/* ---------- match center ---------- */
const teamBlkS=(n,me,right)=>`<div class="team ${right?'r':''}">${crestN(n,'lg')}<div><div class="tn">${esc(n)}</div>${me?kk('Your club'):''}</div></div>`;
function vTimeline(r){
  const L=r.len||{a1:0,a2:0,et:0,e1:0,e2:0},T=totAct(L),pc=t=>(t/T*100).toFixed(2),iv=r.iv||(r.mp==='sub'?[90-r.min,90]:[0,r.min]);
  const ticks=[[0,"0'"],[45+L.a1,"HT"],[T-(L.et?30+L.e1+L.e2:0),"FT"]].concat(L.et?[[T,"AET"]]:[]);
  return`<div class="tl"><div class="tl-bar"></div>${r.st?`<div class="tl-me" style="left:${pc(iv[0])}%;width:${pc(iv[1]-iv[0])}%"></div>`:''}
  ${r.evs.map(e=>`<span class="mk ${e.s?'a':''} ${e.me||e.am?'me':''}" style="left:${pc(e.t!=null?e.t:e.m)}%" title="${esc(e.mt||e.m)}'"></span>`).join('')}
  ${ticks.map(([t,l])=>`<span class="tk" style="left:${pc(t)}%">${l}</span>`).join('')}</div>`;
}
const mLab=(r,t)=>r.len?minLabel(t,r.len):Math.round(t);
function touchMap(r){
  const s=r.st,me=ST.me,g=R('map|'+r.wk+r.h+r.a+r.hg+r.ag+r.c),zx={ST:.8,W:.7,AM:.62,CM:.5,DM:.4,FB:.45,CB:.3,GK:.08}[me.pos];
  const n=clamp(Math.round((s.pa+s.tk+s.ic+s.dr+s.sh+s.kp)*.85+6),8,100),side=me.pos==='W'||me.pos==='FB'?(g.chance(.5)?.22:.78):.5,sd=side===.5?.2:.1;
  let svg='',gl=0;
  for(let i=0;i<n;i++){const x=clamp(zx+g.norm(0,.14),.03,.98)*100,y=clamp(side+g.norm(0,sd),.05,.95)*64;svg+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#fff" opacity=".09" filter="url(#bl)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".7" fill="#fff" opacity=".7"/>`}
  const mine=r.evs.filter(e=>e.me),ass=r.evs.filter(e=>e.am);
  mine.forEach(e=>{const y=(.5+g.norm(0,.08))*64;svg+=`<circle cx="93" cy="${y.toFixed(1)}" r="2.2" fill="#fff"/><text x="93" y="${(y-4).toFixed(1)}" fill="#fff" font-size="3" text-anchor="middle" font-family="monospace">${e.m}'</text>`});
  ass.forEach(e=>{const y=(.5+g.norm(0,.2))*64;svg+=`<path d="M70 ${y.toFixed(1)} Q82 ${(y-8).toFixed(1)} 92 32" stroke="#fff" stroke-width=".5" stroke-dasharray="1.5 1.5" fill="none"/><circle cx="70" cy="${y.toFixed(1)}" r="1.4" fill="none" stroke="#fff" stroke-width=".6"/>`});
  for(let i=0;i<Math.max(0,s.sh-s.g);i++){svg+=`<circle cx="${(84+g.norm(0,4)).toFixed(1)}" cy="${((.5+g.norm(0,.14))*64).toFixed(1)}" r="1.2" fill="none" stroke="#fff" stroke-width=".5" opacity=".8"/>`}
  return`<svg class="map" viewBox="0 0 100 64"><defs><filter id="bl" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2"/></filter></defs><g fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".4"><rect x="1" y="1" width="98" height="62"/><path d="M50 1V63"/><circle cx="50" cy="32" r="8"/><rect x="1" y="14" width="14" height="36"/><rect x="85" y="14" width="14" height="36"/><rect x="1" y="24" width="5" height="16"/><rect x="94" y="24" width="5" height="16"/></g>${svg}</svg>`;
}
function vDiag(r){
  const s=r.st,pos=ST.me.pos,ss=ST.me.ss,ap=Math.max(1,sumSS(ss,'ap')),avgKp=sumSS(ss,'kp')/ap,g=R('dg|'+r.c+r.wk+r.hg+r.ag);
  const att=s.dr+Math.round(s.dr*.4+g.r()),ftp=clamp(Math.round(pct(s.pc,Math.max(1,s.pa))+g.norm(-3,3)),40,99),prog=Math.round(s.dr*.8+s.kp*.8+g.r()*2);
  const R_=(t,sub,v,tag)=>`<div class="diag"><div><b>${t}</b><br>${kk(sub)}</div><div style="text-align:right"><b style="font-size:20px">${v}</b><br>${kk(tag)}</div></div>`;
  let rows;
  if(pos==='GK')rows=[R_('Saves','Shots on target faced: '+(s.sv+s.ga),s.sv,Math.round(pct(s.sv,s.sv+s.ga))+'% save rate'),R_('Goals conceded','Clean sheet: '+(s.ga?'no':'yes'),s.ga,'xG against ~'+(s.sv*.3+s.ga*.9).toFixed(2)),R_('Distribution','Passes completed',s.pc+' / '+s.pa,pct(s.pc,s.pa)+'% accuracy')];
  else if(['DM','CB','FB'].includes(pos))rows=[R_('Tackles won','Defensive actions',s.tk,'per 90: '+(s.tk/Math.max(.1,s.min/90)).toFixed(1)),R_('Interceptions','Reading of play',s.ic,'per 90: '+(s.ic/Math.max(.1,s.min/90)).toFixed(1)),R_('Pass accuracy','Passes completed',pct(s.pc,s.pa)+'%',s.pc+' of '+s.pa),R_('Progressive carries','>10m vertical gain',prog,'carry volume'),R_('Take-ons completed','1v1 isolated runs',s.dr+' / '+att,pct(s.dr,att)+'% success')];
  else rows=[R_('Key passes','Expected assists: '+s.xa,s.kp,(s.kp-avgKp>=0?'+':'')+(s.kp-avgKp).toFixed(1)+' vs season avg'),R_('Shots on target / total','Cumulative xG: '+s.xg,s.sot+' / '+s.sh,s.sh?pct(s.sot,s.sh)+'% precision':'no shots'),R_('Take-ons completed','1v1 isolated runs',s.dr+' / '+att,pct(s.dr,att)+'% success'),R_('Final third pass accuracy',s.pc+' of '+s.pa+' completed',ftp+'%',ftp>=85?'squad leader':'steady'),R_('Progressive carries','>10m vertical gain',prog,'carry volume')];
  const pctl=Math.round(phi((s.rating-6.9)/.55)*100);
  return rows.join('')+`<div class="diag"><div><b>Aggregated match impact</b><br>${kk('Percentile against '+LGN[club(ST.me.cl).lg].s+' '+pos+'s')}</div><b style="font-size:26px">${pctl}<small class="m" style="font-size:13px">%ile</small></b></div>`;
}
const VERD={hi:['Outstanding. Controlled the game and made the difference when it mattered.','A complete performance. Everything good we did went through him.'],mid:['A solid shift. Did the job and stuck to the plan.','Professional and tidy. We would like a little more end product.'],lo:['Not his day. We expect more and he knows it.','Struggled to get into it. We move on and go again.']};
function vMyGame(r){
  let h=0,a=0;const me=ST.me,s=r.st,hc=ST.W.clubs.find(c=>c.name===r.h)||club(me.cl),mc=club(me.parent>=0&&me.role==='youth'?me.parent:me.cl);
  const chips=r.evs.map(e=>{e.s?a++:h++;return`<span class="chip ${e.me||e.am?'me':''}">${e.m}' ⚽ ${esc(e.n)}${e.a?' ← '+esc(e.a):''} (${h}–${a})</span>`});
  if(r.mp==='sub')chips.unshift(`<span class="chip me">${91-r.min}' ↑ you come on</span>`);else if(s&&r.min<90)chips.push(`<span class="chip me">${r.min}' ↓ you are subbed off</span>`);
  if(r.inj)chips.push(`<span class="chip">injury: ${esc(r.inj.t)}</span>`);if(r.red)chips.push('<span class="chip">sent off</span>');
  const g=R('vd|'+r.c+r.wk+r.hg+r.ag),tr=me.trust||60,form=ST.mineLog.slice(-5).reduce((p,l)=>p+(l.gf>l.ga?3:l.gf===l.ga?1:0),0),mor=form>=11?'Superb':form>=8?'Good':form>=5?'Okay':'Low',chem=clamp(1+(me.tn||0)+(me.role==='starter'?1:0),1,5);
  const mgn=r.k==='nat'?natMgr(me.nat):mgr(mc),vb=s?(s.rating>=7.7?VERD.hi:s.rating>=6.8?VERD.mid:VERD.lo):null;
  let duel='';
  if(s&&r.duel){
    const att=Math.max(4,s.tk+s.ic+s.dr+g.int(2,5)),w=clamp(Math.round(att*(.5+(s.rating-RAVG)*.08+(me.ovr-r.duel.ovr)*.006)),0,att),f1=g.int(0,3),f2=g.int(0,3),d1=g.int(0,3),d2=g.int(0,4);
    const cmp=(l,x,y,t)=>`<div class="cmp"><div class="row sp"><span>${x}</span><span class="m">${l}</span><span>${y}</span></div><div class="two"><div class="bar"><i style="width:${t?pct(x,t):x*20}%"></i></div><div class="bar"><i style="width:${t?pct(y,t):y*20}%"></i></div></div></div>`;
    duel=G('pad s12',`<h2>Duel of the match ${kk('you vs '+esc(r.duel.n))}</h2><div class="row sp"><div class="row"><span class="crest">${ab(me.name)}</span><div><b>${esc(me.name)}</b><br>${kk(me.pos+' · '+r.min+' min')}</div></div><span class="pill ${w*2>att?'good':''}">${w*2>att?'ADVANTAGE: YOU':'ADVANTAGE: THEM'}</span><div class="row"><div style="text-align:right"><b>${esc(r.duel.n)}</b><br>${kk(me.pos+' · OVR '+r.duel.ovr)}</div><span class="crest">${ab(r.duel.n)}</span></div></div>
    ${cmp('GROUND DUELS WON',w,att-w,att)}${cmp('FOULS COMMITTED',f1,f2,0)}${cmp('LOST POSSESSIONS',d1,d2,0)}
    <div class="note"><b>Analyst take.</b> ${esc(me.name)} ${w*2>att?'won the individual battle':'was kept quiet'} against ${esc(r.duel.n)}${s.kp>=2?', and his passing created '+s.kp+' chances':''}${r.hg+r.ag===0?'. A tight game with little between the sides.':'.'}</div>`);
  }
  const att3=s?Math.round(s.pa*({ST:.5,W:.5,AM:.45,CM:.3,DM:.15,FB:.28,CB:.1,GK:0}[me.pos])+s.sh+s.kp):0;
  return`${G('pad s5',`<h2>Match rating</h2><div class="row" style="gap:18px">${s?rb(s.rating,1):'<span class="m">no rating</span>'}<div class="g1">${r.motm?`<div class="m sm">Best rated: <b>${esc(r.motm.n)}</b> ${rb(r.motm.r)}</div>`:''}</div></div>
  ${vb?`<div class="note"><b>Managerial verdict · ${esc(mgn)}</b><br>“${g.pick(vb)}”</div>`:''}${r.inj?`<div class="warn">Injury: ${esc(r.inj.t)}, about ${r.inj.w} week${r.inj.w>1?'s':''}.</div>`:''}${r.red?'<div class="warn">Sent off. You miss the next match.</div>':''}`)}
  ${G('pad s7',`<h2>Spatial dominance & shot trajectory ${kk('simulated from your stats')}</h2>${s?touchMap(r):'<div class="empty">You did not take part.</div>'}
  ${s?`<div class="grid mt"><div class="tile">${kk('Attacking third touches')}<b class="n">${att3}</b></div><div class="tile">${kk('Box penetrations')}<b class="n">${Math.round(s.sh*.8+s.kp*.7+s.dr*.5+s.g*.5)}</b></div><div class="tile">${kk('High press turnovers')}<b class="n">${Math.round(s.ic*.5+s.tk*.5)}</b></div></div>`:''}`)}
  ${s?G('pad s6',`<h2>${ME_POSLABEL()} diagnostics ${kk('90-min scaled')}</h2>${vDiag(r)}`):''}
  ${s?G('pad s6',`<h2>Club dynamics & trust <span class="pill ${tr>=75?'good':''}">${tr>=90?'UNTOUCHABLE':tr>=75?'KEY MAN':tr>=60?'TRUSTED':tr>=40?'NEUTRAL':'DOUBTFUL'}</span></h2><div class="row sp"><span>${esc(mgn)} trust rating</span><b class="mono">${Math.round(tr)}%</b></div><div class="bar" style="margin:6px 0 14px"><i style="width:${tr}%"></i></div>
  <div class="grid"><div class="tile">${kk('Squad morale')}<b class="n" style="font-size:20px">${mor}</b></div><div class="tile">${kk('Team chemistry')}<b class="n" style="font-size:20px">Level ${chem}</b></div></div>
  <div class="note">Next: ${esc((nextFixObj()||{c:'season break'}).c)}</div>`):''}
  ${duel}`;
}
const ME_POSLABEL=()=>({GK:'Goalkeeper',CB:'Defender',FB:'Full-back',DM:'Midfield',CM:'Midfield',AM:'Playmaker',W:'Winger',ST:'Striker'}[ST.me.pos]);

/* ---------- league & cups ---------- */
function zc(lg,i,n){
  if(i<0)return'';
  const l=LGN[lg],sib=LGN.filter(x=>x.country===l.country),top=Math.max(...sib.map(x=>x.tier));
  if(l.tier===1)return i<4?'z1':i<6?'z2':i>=n-3?'z3':'';
  const nx=sib.filter(x=>x.tier===l.tier+1).length,dn=l.tier===top?0:(nx>1?nx*2:3),up=sib.filter(x=>x.tier===l.tier).length>1?2:3;
  return i<up?'z1':dn&&i>=n-dn?'z3':'';
}
function vTableL(lg,hl){
  const t=table(lg),n=t.length;
  return`<table class="tb"><tr><th>#</th><th>Club</th><th class="r">P</th>${COMPACT?'':'<th class="r">W</th><th class="r">D</th><th class="r">L</th>'}<th class="r">GD</th><th class="r">Pts</th>${COMPACT?'':'<th>Last 5</th>'}</tr>${t.map((c,i)=>`<tr class="${c.id===hl?'me':''} ${zc(lg,i,n)&&zc(lg,i,n)!==zc(lg,i-1,n)||(zc(lg,i,n)===''&&zc(lg,i-1,n)&&i>0)?'cut':''}"><td><span class="zone ${zc(lg,i,n)}"></span>${i+1}</td><td>${clink(c)}</td><td class="r">${c.t.w+c.t.d+c.t.l}</td>${COMPACT?'':`<td class="r">${c.t.w}</td><td class="r">${c.t.d}</td><td class="r">${c.t.l}</td>`}<td class="r">${c.t.gf-c.t.ga>0?'+':''}${c.t.gf-c.t.ga}</td><td class="r b">${c.t.p}</td>${COMPACT?'':`<td>${dots(c.f)}</td>`}</tr>`).join('')}</table>
  <div class="row wr mt mono sm m">${LGN[lg].tier===1?'<span><span class="zone z1"></span>Champions League</span><span><span class="zone z2"></span>Europa League</span><span><span class="zone z3"></span>Relegation</span>':'<span><span class="zone z1"></span>Promotion</span><span><span class="zone z3"></span>Relegation</span>'}</div>`;
}
function euOdds(a,b){return 1/(1+Math.exp(-.12*(strength(pickXI(club(a),R('o|'+a))).o-strength(pickXI(club(b),R('o|'+b))).o)))}
function tieRow(t,hl){
  const done=t.w!=null,legs=t.l1?` <span class="m sm">(${t.l1[0]}–${t.l1[1]}${t.l2?', '+t.l2[0]+'–'+t.l2[1]:''})</span>`:'';
  const sc=done?`${t.hg}–${t.ag}${t.pen?' p':''}`:t.l1?`${t.l1[0]}–${t.l1[1]}`:'v';
  return`<div class="lrow ${t.h===hl||t.a===hl?'me':''}"><span class="g1 ${done&&t.w===t.h?'b':done?'m':''}">${clink(club(t.h))}</span><span style="text-align:center"><b class="mono">${sc}</b>${done&&t.l1?legs:''}${!done&&t.l1?'<div class="m sm">1st leg</div>':''}</span><span class="g1 ${done&&t.w===t.a?'b':done?'m':''}" style="text-align:right">${clink(club(t.a))}</span></div>`;
}
let EUV='lp';
function euStage(k){
  const e=ST.eu[k];if(e.win!=null)return'Finished';
  if(!e.rounds.length)return'League phase';
  return EUR[e.rounds.length-1]+(e.rounds.length-1<4&&e.rounds[e.rounds.length-1].every(t=>t.w!=null)?' (complete)':'');
}
function vEuro(k,title){
  const me=ST.me,e=ST.eu[k],rk=e.rank||euRank(k),T=e.lp.tab,ko=e.rounds.length>0;
  const bar=seg([['lp','League phase'],['ko','Knockouts']],EUV,'euv');
  let body;
  if(EUV==='lp')body=`<table class="tb"><tr><th>#</th><th>Club</th><th class="r">P</th><th class="r">W</th><th class="r">D</th><th class="r">L</th><th class="r">GD</th><th class="r">Pts</th></tr>${rk.map((id,i)=>{const t=T[id],z=ko?(i<8?'z1':i<24?'z2':'z3'):(i<8?'z1':i<24?'z2':'z3');return`<tr class="${id===me.cl?'me':''} ${i===8||i===24?'cut':''}"><td><span class="zone ${z}"></span>${i+1}</td><td>${clink(club(id))}</td><td class="r">${t.pl}</td><td class="r">${t.w}</td><td class="r">${t.d}</td><td class="r">${t.l}</td><td class="r">${t.gf-t.ga>0?'+':''}${t.gf-t.ga}</td><td class="r b">${t.p}</td></tr>`}).join('')}</table>
  <div class="row wr mt mono sm m"><span><span class="zone z1"></span>Last 16</span><span><span class="zone z2"></span>Knockout play-off</span><span><span class="zone z3"></span>Out</span></div>`;
  else body=ko?e.rounds.map((rs,i)=>`<h3 class="mt">${EUR[i]}${i<4?' · two legs':' · one match'}</h3>${rs.map(t=>tieRow(t,me.cl)).join('')}`).join(''):'<div class="m sm">The knockouts start after the eighth league-phase game.</div>';
  return G('pad s12',`<h2>${title} ${kk(e.win!=null?'winners: '+esc(club(e.win).name):euStage(k))}</h2><div style="margin-bottom:14px">${bar}</div>${body}`);
}
function cupStatus(lg){
  const me=ST.me,tl=topLg(lg),cp=ST.cup[tl];let last=-1;
  cp.rounds.forEach((r,i)=>{if(r&&(r.some(t=>t.h===me.cl||t.a===me.cl)||(cp.byes[i]||[]).includes(me.cl)))last=i});
  if(cp.win===me.cl)return'Winners';
  const alive=cp.cur.includes(me.cl);
  if(last>=0&&!alive)return'Out in the '+cp.names[last].toLowerCase();
  if(alive)return cp.rounds.length>=cp.nr?'Season over':'Through to the '+cp.names[Math.min(cp.nr-1,cp.rounds.length)].toLowerCase();
  return cp.rounds.length?'Not involved':'Enters in '+(cp.names[cp.ent.findIndex(x=>x.includes(me.cl))]||'a later round').toLowerCase();
}

/* ---------- inbox ---------- */
function inboxItems(){
  const out=[],p=ST.pend&&ST.pend.t==='season'?ST.pend:null;
  if(p&&p.rein)out.push({key:'rein',kind:'reinvent',m:p.rein,rein:p.rein,title:p.rein.title,sub:p.rein.body,tag:'REINVENTION',s:label(ST.season)});
  if(p)p.opts.forEach((o,i)=>{
    if(o.rej)return;const con=o.k==='stay'||o.k==='keep'||o.k==='return'||o.k==='retire',c=o.c!=null?club(o.c):null;
    out.push({key:'o'+i,kind:con?'contract':'offer',i,o,title:o.k==='retire'?'Retirement':(o.k==='loan'?'Loan: ':o.k==='transfer'?(o.free?'Free transfer: ':''):o.k==='return'?'Return: ':o.k==='keep'?'Stay on your deal: ':'Extension: ')+c.name+(o.cur?' ('+o.y+' yr'+(o.y>1?'s':'')+' left)':''),sub:o.k==='retire'?'Hang up your boots.':ROLEN[o.role]+' · €'+o.w+'k/wk'+(o.fee?' · '+euro(o.fee):''),tag:o.k==='transfer'?'TRANSFER OFFER':o.k==='loan'?'LOAN OFFER':o.k==='retire'?'CAREER':'CONTRACT',s:'now'});
  });
  ST.inbox.forEach(m=>out.push({key:'m'+m.id,kind:m.t,m,title:m.title,sub:m.body,tag:m.t==='medical'?'MEDICAL STAFF':m.t==='national'?'NATIONAL TEAM':m.t==='agent'?'YOUR AGENT':'CLUB',s:m.s}));
  return out;
}
function vOffer(it){
  const o=it.o,me=ST.me;
  if(o.k==='retire')return G('pad',`<h1>Retire from football</h1><p class="m">${me.age} years old. Peak OVR ${me.peak}. Your legacy will be scored on trophies, awards, goals and peak rating.</p><button class="btn" data-a="acc" data-v="${it.i}">Confirm retirement</button>`);
  const c=club(o.c),I=offerInfo(o),chg=I.cur?Math.round((o.w/I.cur-1)*100):0,x=pct(o.w-I.min,Math.max(1,I.top.w-I.min)),cx=pct(I.cur-I.min,Math.max(1,I.top.w-I.min)),tier=c.base>=82?1:c.base>=76?2:3;
  const memo=I.old?`Replaces ageing ${I.old.n} (${I.old.age}). ${o.role==='starter'?'A guaranteed starting slot':'A place in the rotation'} with performance bonuses. ${esc(c.name)} will build the ${POSN[me.pos].toLowerCase()} position around your profile.`:'A good fit for your profile.';
  return G('pad',`<div class="row sp wr"><div class="row">${crestN(c.name,'lg')}<div><span class="pill hot">${it.tag}</span> <span class="pill">${LGN[c.lg].n.toUpperCase()}</span><h1 style="margin:6px 0 0">${esc(c.name)}</h1>${kk('Tier '+tier+' · '+LGN[c.lg].nat+' · '+esc(c.gd||c.name+' Stadium'))}</div></div></div>
  ${o.k==='transfer'?(()=>{const cu=club(me.parent>=0?me.parent:me.cl),st=o.sell||'ok';return`<div class="note" style="margin:14px 0 0;border-color:${st==='ok'?'rgba(95,213,143,.5)':st==='ask'?'rgba(255,209,102,.5)':'rgba(255,107,96,.5)'}"><b>${st==='ok'?'✓ '+esc(cu.name)+' have agreed to sell you':st==='ask'?esc(cu.name)+' are reluctant to sell':esc(cu.name)+' say you are not for sale'}</b><br><span class="m">${esc(sellWhy(o))}.${o.asked&&st!=='ok'?' Your transfer request was refused.':''}</span></div>`})():''}
  ${o.free?`<div class="note" style="margin:14px 0 0;border-color:rgba(95,213,143,.5)"><b>Free transfer</b><br><span class="m">Your contract has run out, so there is no fee and your club cannot stop you leaving.</span></div>`:''}${o.k==='keep'?`<div class="note" style="margin:14px 0 0"><b>Your current contract</b><br><span class="m">${o.y} season${o.y>1?'s':''} left at €${o.w}k a week. ${o.y===1?'Next summer you can leave for free, and clubs will bid less for you this year.':''}</span></div>`:''}  <div class="mt2">${kk(o.k==='loan'?'Loan agreement':'Transfer bid')}<div class="big" style="font-size:36px">${o.k==='loan'?'Loan':o.fee?euro(o.fee):'Free'}</div>${o.bids&&o.bids.length>1?`<div class="m sm mt">Bid history: ${o.bids.slice(0,o.bi+1).map(euro).join(' → ')}${o.maxed||o.bi>=o.bids.length-1?' (their limit)':''}. Spending power: about ${euro(clubMeans(c))}.</div>`:o.k==='transfer'?`<div class="m sm mt">Spending power: about ${euro(clubMeans(c))}.</div>`:''}</div>
  <div class="g12 mt" style="margin-bottom:0"><div class="tile s4" style="text-align:center"><h3>Tactical fit score</h3><div class="ovr-ring" style="--p:${I.fit};margin:0 auto"><b>${I.fit}</b></div><div class="mono sm m mt">MATCH FIT</div></div>
  <div class="s8 grid" style="grid-template-columns:1fr 1fr"><div class="tile">${kk('Proposed squad role')}<b class="n" style="font-size:19px">${ROLEN[o.role]}</b><span class="m sm">${o.role==='starter'?'Guaranteed in domestic & European fixtures':'Competes for a place'}</span></div>
  <div class="tile">${kk('Weekly wage')}<b class="n">€${o.w}k <small>/ wk</small></b><span class="m sm">${chg>=0?'+':''}${chg}% · current €${I.cur}k</span></div>
  <div class="tile">${kk('Contract length')}<b class="n">${o.y} <small>years</small></b><span class="m sm">Through June ${ST.season+1+o.y}</span></div>
  <div class="tile">${kk('Bonus incentives')}<b class="n" style="font-size:19px">€${I.sf}k cap</b><span class="m sm">€${I.ast}k per assist · €${I.sf}k UCL semi-final</span></div></div></div>
  <div class="tile mt"><div class="row sp">${kk('Wage ladder context ('+esc(c.name)+' squad)')}<span class="mono sm">Rank ${I.rank} of ${I.of}</span></div><div class="ladder"><i style="left:${cx}%;opacity:.5"></i><i style="left:${x}%"></i></div><div class="row sp mono sm m"><span>Squad min: €${I.min}k</span><b style="color:#fff">Your offer: €${o.w}k</b><span>Top earner: €${I.top.w}k (${esc(I.top.n)})</span></div></div>
  <div class="tile mt row"><span class="crest">CA</span><div><b>Chief analyst intelligence memo</b><br><span class="m sm">${memo}</span><br><span class="mono sm" style="color:#86f2bd">Trophy probability: ${Math.round(I.dom*100)}% domestic, ${Math.round(I.ucl*100)}% UCL · Agent commission: €${I.agent}M (covered by club)</span></div></div>
  <div class="tile mt row sp wr"><div><b>Seek manager consultation</b><br><span class="m sm">Discuss your long-term roadmap with ${esc(mgr(club(me.parent>=0?me.parent:me.cl)))} before agreeing. Costs 1 decision.</span></div><button class="btn alt sm" data-a="cons" ${ST.bud<1?'disabled':''}>Request meeting</button></div>
  <div class="row wr mt2" style="justify-content:flex-end">${o.k==='stay'||o.k==='keep'||o.k==='return'?'':`<button class="btn bad" data-a="rej" data-v="${it.i}">Reject offer</button>`}${o.k==='transfer'&&o.sell!=='ok'&&!o.asked?`<button class="btn alt" data-a="ask" data-v="${it.i}" ${ST.bud<1?'disabled':''}>Hand in transfer request</button>`:''}${o.bids&&!o.maxed&&o.bi<o.bids.length-1?`<button class="btn alt" data-a="push" data-v="${it.i}" ${ST.bud<1?'disabled':''}>Ask agent for a higher bid</button>`:''}<button class="btn alt" data-a="ctr" data-v="${it.i}" ${ST.bud<1||o.cnt?'disabled':''}>${o.cnt?'Wage counter used':'Negotiate wages'}</button><button class="btn" data-a="acc" data-v="${it.i}" ${o.k==='transfer'&&o.sell!=='ok'?'disabled':''}>Accept & enter talks →</button></div>`);
}
function vReinvent(r){
  const me=ST.me,W=a=>a[0]+'-'+a[1],cur=peakWindows(me).st;
  const card=(o,i)=>`<div class="tile mt"><div class="row sp wr"><div><span class="pill hot">${esc(POSN[o.pos])}</span> <b style="font-size:19px">${esc(o.arch)}</b><br>${kk(o.pos===me.pos?'Same position, new style':'Move from '+POSN[me.pos].toLowerCase())}</div><button class="btn" data-a="rein" data-v="${i}">Switch to this role</button></div>
    <div class="grid mt" style="grid-template-columns:repeat(3,1fr)"><div class="tile">${kk('Overall now')}<b class="n">${o.ovr}</b><span class="m sm">${o.ovr-me.ovr>=0?'+':''}${o.ovr-me.ovr} (adapting: -${o.pen})</span></div><div class="tile">${kk('In 3 years')}<b class="n">~${o.p3}</b><span class="m sm">${o.p3>=r.stay?'+':''}${o.p3-r.stay} vs staying</span></div><div class="tile">${kk('Output peak')}<b class="n">${W(o.st)}</b><span class="m sm">${o.fit>=0?'Suits your attributes':'A stretch for your attributes'}</span></div></div>
    <div class="m sm mt"><b>Why it works:</b> ${esc(o.why||'')} ${esc(ARX[o.pos][o.arch].blurb)}</div></div>`;
  return G('pad',`<span class="pill hot">REINVENTION</span> ${kk(label(ST.season))}<h1>${esc(r.title)}</h1><p>${esc(r.body)}</p>
  <div class="grid" style="grid-template-columns:repeat(3,1fr)"><div class="tile">${kk(KL[r.k]+' (career best)')}<b class="n">${r.peak}</b></div><div class="tile">${kk(KL[r.k]+' now')}<b class="n">${r.now}</b><span class="m sm">down ${r.drop}</span></div><div class="tile">${kk('Staying a '+esc(r.arch))}<b class="n">~${r.stay}</b><span class="m sm">overall in 3 years, output peak ${W(cur)}</span></div></div>
  <p class="m sm mt">Your attributes carry over: a new role is built from what you still have. You will need a season to settle, so the overall shown is a little lower to start.</p>
  ${r.opts.map(card).join('')}
  <div class="row wr mt2" style="justify-content:flex-end"><button class="btn alt" data-a="reinx">Stick with my game</button></div>`);
}
function vInbox(){
  const items=inboxItems(),F=INB.f,cnt=k=>items.filter(i=>i.kind===k).length,list=F==='all'?items:items.filter(i=>i.kind===F);
  const sel=items.find(i=>i.key===INB.sel)||list[0]||items[0];if(sel&&sel.m&&!sel.m.seen)sel.m.seen=1;if(sel&&sel.o)sel.o.seen=1;
  const p=ST.pend&&ST.pend.t==='season'?ST.pend:null;
  const left=`${G('pad',`<div class="row sp"><div class="row"><span class="crest">⌛</span><div><b>Decision budget</b><br><span class="m sm">Counter-offers and manager meetings use a decision. Resets each matchday.</span></div></div><b class="mono nw">${2-ST.bud} / 2</b></div><div class="bar" style="margin-top:10px"><i style="width:${(2-ST.bud)*50}%"></i></div>`)}
  <div style="height:12px"></div>${G('pad',`<div class="tabsm">${[['all','All ('+items.length+')'],['offer','Offers ('+cnt('offer')+')'],['contract','Contracts ('+cnt('contract')+')'],['national','National ('+cnt('national')+')'],['medical','Medical ('+cnt('medical')+')']].map(([k,n])=>`<button class="${F===k?'on':''}" data-a="inf" data-v="${k}">${n}</button>`).join('')}</div>
  ${list.map(it=>`<button class="msg ${sel&&sel.key===it.key?'on':''} ${(it.m?!it.m.seen:!it.o.seen)?'unr':''}" data-a="sel" data-v="${it.key}"><div class="row sp"><span class="row" style="gap:8px">${(it.m?!it.m.seen:!it.o.seen)?'<i class="udot"></i>':''}<span class="pill">${it.tag}</span></span>${kk(it.s)}</div><div class="t">${esc(it.title)}</div><div class="m sm">${esc(String(it.sub).slice(0,90))}</div></button>`).join('')||'<div class="empty">Nothing here.</div>'}
  <div class="tile row sp"><div><b>Decision archive</b><br><span class="m sm">${ST.archive.length} past decisions recorded</span></div><button class="btn alt sm" data-a="log">${INB.log?'Hide':'View log'}</button></div>
  ${INB.log?`<div class="mt sm m">${ST.archive.slice(0,30).map(a=>`<div style="padding:4px 0;border-top:1px solid rgba(255,255,255,.06)">${a.s} · ${esc(a.t)}</div>`).join('')||'Empty'}</div>`:''}`)}`;
  let right;
  if(!sel)right=G('empty','No messages yet. Offers arrive at the end of each season.');
  else if(sel.rein)right=vReinvent(sel.rein);
  else if(sel.o)right=vOffer(sel);
  else right=G('pad',`<span class="pill hot">${sel.tag}</span> ${kk(sel.s)}<h1>${esc(sel.title)}</h1><p>${esc(sel.m.body)}</p>`);
  return`<div class="inbox"><div>${left}</div><div>${p&&p.rev?`<div class="note" style="margin:0 0 12px"><button class="btn alt sm" data-a="revb">View season review</button> <span class="m">You must pick an option to start the next season.</span></div>`:''}${right}</div></div>`;
}

/* ---------- career ---------- */
function careerTable(){
  const rs=ST.me.rows;if(!rs.length)return'<div class="m sm">No seasons yet.</div>';
  return`<div style="overflow-x:auto"><table class="tb"><tr><th>Season</th><th>Age</th><th>Club</th><th class="r">Apps</th><th class="r">G</th><th class="r">A</th><th class="r">Avg</th><th class="r">OVR</th></tr>`+rs.map(r=>`<tr><td>${r.s}</td><td>${r.age}</td><td>${esc(r.club)}${r.loan?' (L)':''}${'🏆'.repeat(r.hon||0)}</td><td class="r">${r.ap}${r.y?`<span class="m"> +${r.y.ap}</span>`:''}</td><td class="r">${r.g}${r.y?`<span class="m"> +${r.y.g}</span>`:''}</td><td class="r">${r.a}</td><td class="r">${r.avg?r.avg.toFixed(2):'-'}</td><td class="r">${r.youth?'<span class="m">-</span>':r.ovr}</td></tr>`).join('')+'</table></div><div class="m sm" style="margin-top:6px">+n = youth games · academy years aren\'t scouted for an OVR</div>';
}
// Four peaks (see COMPS in 20-world.js): physical, technical and IQ are the underlying components; statistical is the output they produce.
// Each window is the years within 1% of that peak, with where the player is now.
function primeTxt(me){
  const W=peakWindows(me),a=me.age,row=(k,w,now,past)=>[k,w[0]+'-'+w[1],a<w[0]?'Rising: '+(w[0]-a)+' yr'+(w[0]-a>1?'s':'')+' to go':a<=w[1]?now:past];
  return[row('Physical',W.ph,'Body at its best','Past its physical best'),row('Technical',W.te,'Technique at its best','Past its technical best'),row('IQ',W.iq,'Reading the game at its best','Past its IQ peak'),row('Statistical',W.st,'Output at its peak','Output past its peak')];
}
// the attribute card: six groups, each opening to its sub-attributes with the career best and a train button
function vAttrs(me){
  const A=me.attr,mx=me.amax||{},sm=me.smax||{},tg=me.focus;
  if(me.pos==='GK'||!me.sub)return keysOf(me).map(k=>{const d=(mx[k]||A[k])-A[k];return`<div class="row" style="margin:9px 0"><span style="width:88px" class="sm">${KL[k]}</span><div class="bar g1"><i style="width:${A[k]}%"></i></div><b class="mono" style="width:26px;text-align:right">${A[k]}</b><span class="m sm" style="width:30px;text-align:right">${d>=3?'−'+d:''}</span></div>`}).join('');
  return GROUPS.map(([k,l])=>{const d=(mx[k]||A[k])-A[k];
    return`<details class="atg"${tg&&SUBG[tg]===k?' open':''}><summary><span style="width:88px" class="sm">${KL[k]}</span><div class="bar g1"><i style="width:${A[k]}%"></i></div><b class="mono" style="width:26px;text-align:right">${A[k]}</b><span class="m sm" style="width:30px;text-align:right">${d>=3?'−'+d:''}</span></summary>
    ${l.map(j=>{const dj=(sm[j]||me.sub[j])-me.sub[j];return`<div class="sa"><span class="nm">${SL[j]}</span><div class="bar g1"><i style="width:${me.sub[j]}%"></i></div><b class="mono" style="width:26px;text-align:right">${me.sub[j]}</b><span class="m sm" style="width:30px;text-align:right" title="Career best ${sm[j]||me.sub[j]}">${dj>=3?'−'+dj:''}</span><button class="btn alt xs ${tg===j?'on':''}" data-a="focus" data-v="${j}" title="${esc(SDIR[j])}">${tg===j?'Training':'Train'}</button></div>`}).join('')}</details>`}).join('');
}
function vCareer(){
  const me=ST.me,A=me.attr,v=mval(),wt=Math.round((me.ht-100)*WMUL[me.frame||'Athletic']);
  return`<div class="g12">${G('pad s4',`<div class="row" style="gap:16px"><div class="ovr-ring" style="--p:${me.ovr}"><b>${me.ovr}</b></div><div><b style="font-size:20px">${esc(me.name)}</b><br>${kk(POSN[me.pos]+' · '+archName(me))}<br><span class="sm">${stars(me.pa)}</span> <span class="m sm">${esc(me.tier)}</span></div></div>
  <div class="mt">${vAttrs(me)}</div>
  <div class="tile mt sm"><div class="row sp"><span class="m">Frame</span><span>${me.frame||'Athletic'} · ${me.ht} cm · ${wt} kg</span></div><div class="row sp"><span class="m">Foot</span><span>${me.foot} · weak foot ${'★'.repeat(me.wf||3)}</span></div><div class="row sp"><span class="m">Nationality</span><span>${esc(me.nat)}</span></div></div>`)}
  <div class="s8" style="display:grid;gap:16px">${G('pad',`<h2>Contract & value</h2><div class="grid"><div class="tile">${kk('Value')}<b class="n">${euro(v)}</b></div><div class="tile">${kk('Wage / wk')}<b class="n">${me.ct?'€'+me.ct.w+'k':'-'}</b></div><div class="tile">${kk('Expires')}<b class="n">${me.ct?me.ct.exp:'-'}</b></div><div class="tile">${kk('Peak OVR')}<b class="n">${me.peak}</b></div>${primeTxt(me).map(r=>`<div class="tile">${kk(r[0]+' peak')}<b class="n">${r[1]}</b><span class="m sm">${r[2]}</span></div>`).join('')}</div></div>${me.moves.length?`<div class="m sm mt">${me.moves.map(m=>`${m.s}: ${m.k==='loan'?'loan':m.k==='return'?'returned':'moved'} ${esc(m.from)} → ${esc(m.to)}`).join('<br>')}</div>`:''}`)}
  ${G('pad',`<h2>National team ${kk(esc(me.nat))}</h2><div class="grid"><div class="tile">${kk('Status')}<b class="n" style="font-size:19px">${me.nr==='starter'?'First choice':me.nr==='squad'?'In the squad':me.age<16?'Not eligible yet':'Not selected'}</b></div><div class="tile">${kk('Caps')}<b class="n">${me.caps}</b></div><div class="tile">${kk('Goals')}<b class="n">${me.ig}</b></div><div class="tile">${kk('Assists')}<b class="n">${me.ina||0}</b></div><div class="tile">${kk('Avg rating')}<b class="n">${me.natRn?(me.natRs/me.natRn).toFixed(2):'-'}</b></div><div class="tile">${kk('Tournaments won')}<b class="n">${me.hon.filter(h=>h.t==='World Cup'||h.t==='European Championship').length}</b></div></div>`)}
  ${G('pad',`<h2>Career</h2>${careerTable()}`)}</div>
  ${vTrain()}${vRadar()}${vLog()}
  ${vCabinet()}
  ${vAwardCabinet()}
  ${G('pad s12',`<h2>Past seasons across Europe</h2>${ST.hof.length?`<table class="tb"><tr><th></th><th>Champions League</th><th>Europa League</th><th>Ballon d'Or</th></tr>${ST.hof.slice().reverse().map(h=>`<tr><td>${h.s}</td><td>${esc(h.ucl)}</td><td>${esc(h.uel)}</td><td class="${h.bdo.me?'b':''}">${esc(h.bdo.n)} <span class="m">${esc(h.bdo.c)}</span></td></tr>`).join('')}</table>`:'<div class="m sm">History builds season by season.</div>'}`)}</div>`;
}

/* ---------- youth / retired ---------- */
function vYouth(){
  const me=ST.me,lab=label(ST.yr0+me.age-7);
  return`<div class="page" style="padding-top:24px"><div class="g12">${G('pad s12',`<div class="row wr" style="gap:20px"><div class="ovr-ring" style="--p:${me.pa}"><b>?</b></div><div class="g1"><h1>${esc(me.name)}</h1>${kk(POSN[me.pos]+' · '+archName(me)+' · age '+me.age+(me.cl>=0?' · '+esc(club(me.cl).name)+' Academy':' · local club'))}<div style="margin-top:6px">Potential <span style="letter-spacing:.1em">${stars(me.pa)}</span></div><div class="m sm mt">No scout rates an academy player's overall — that comes once you turn pro.</div></div>
  <button class="btn" data-a="yr">Play ${lab} season →</button></div><div class="m sm mt">Seasons up to 14 are summarised. Match-by-match play starts at 15.</div>`)}
  ${G('pad s12',`<h2>Youth career</h2>${careerTable()}`)}</div><button class="btn alt" data-a="reset">New career</button></div>`;
}
function vRetired(){
  const m=ST.me,s=ST.sum;
  return`<div class="page" style="padding-top:24px"><div class="g12">${G('pad s12 c',`${kk('Retired at '+m.age+' · '+s.seasons+' senior seasons')}<h1>${esc(m.name)}</h1><div class="big">${s.tier}</div>${kk('legacy score '+s.sc)}`)}
  ${G('pad s12',`<div class="grid">${[['Apps',s.ap],['Goals',s.g],['Assists',s.a],['Caps',m.caps],['Peak OVR',s.peak],['League titles',s.lg],['Champions Leagues',s.ucl],["Ballons d'Or",s.bd],['Other honours',s.oth+s.aw]].map(([a,b])=>`<div class="tile">${kk(a)}<b class="n">${b}</b></div>`).join('')}</div>`)}
  ${G('pad s12',`<h2>Career</h2>${careerTable()}`)}</div><button class="btn" data-a="reset">New career</button></div>`;
}

/* ---------- modals ---------- */
function focusBtns(){
  const me=ST.me,f=me.focus,note=`<div class="m sm" style="margin:8px 0 14px">${f?esc(fLabel(f))+': '+esc(fDir(f))+(SUBG[f]?' · about +'+trainGain(me,f,me.age<30?3:1.5).toFixed(1)+' this season':''):'One attribute grows faster and earns mastery XP. Pace and agility respond little to training, passing and finishing a lot.'}</div>`;
  if(me.pos==='GK'||!me.sub)return`<div class="row wr">${keysOf(me).map(k=>`<button class="btn alt ${f===k?'on':''}" data-a="focus" data-v="${k}">${KL[k]}</button>`).join('')}</div>${note}`;
  return GROUPS.map(([g,l])=>`<div class="m sm" style="margin:10px 0 4px">${KL[g]} · <b>${me.attr[g]}</b></div><div class="row wr">${l.map(j=>`<button class="btn alt ${f===j?'on':''}" data-a="focus" data-v="${j}">${SL[j]} <span class="m">${me.sub[j]}</span></button>`).join('')}</div>`).join('')+note;
}
function vModal(){
  const p=ST.pend,me=ST.me;let h='';
  if(typeof UIM==='string'&&UIM[0]==='p'&&UIM[1]===':')return wrapM(vPCard(+UIM.slice(2)));
  if(typeof UIM==='string'&&UIM[0]==='c'&&UIM[1]===':')return wrapM(vCCard(+UIM.slice(2)));
  if(UIM==='search')return wrapM(vSearch());
  if(p&&p.t==='academy'){
    const sel=p.sel!=null?p.sel:0;
    h=`${kk('Age 12 · scout & offers')}<h1>Academy placement</h1><div class="tile"><div class="row sp"><b>Trial metric ${(clamp(2.8+me.gap/3+(me.pa-78)/9,1,5)).toFixed(1)} / 5.0</b>${kk('ceiling hidden')}</div><div class="m sm mt">“${R(ST.seed+'|scout').pick(['Exceptional instinct and a rare feel for the game.','Technically gifted, still raw physically.','Hard worker with a cool head. Easy to coach.','Quick learner. The final product is hard to predict.'])}”</div></div>
    <h3 class="mt2">Competing intake bids · ${p.opts.length} active offers</h3>${p.opts.map((id,i)=>{const c=club(id),f=clamp(Math.round((c.base-58)/6),1,5);return`<button class="opt ${sel===i?'on':''}" data-a="acad" data-v="${i}"><div class="row sp"><div class="row">${crestN(c.name)}<div><b>${esc(c.name)} Academy</b><br>${kk(LGN[c.lg].n+' · facilities level '+f)}</div></div>${sel===i?'<span class="pill hot">SELECTED</span>':''}</div><div class="row sp mono sm m mt"><span>Senior path: ${c.base>=80?'competitive':'faster'}</span><span>Stipend €${300+f*70} / wk · 24 months guaranteed</span></div></button>`}).join('')}
    <button class="btn full" style="text-align:center" data-a="sign">Sign academy contract & begin journey →</button>`;
  }else if(UIM==='plan')h=`${kk('Development plan')}<h1>Training focus</h1>${focusBtns()}<button class="btn" data-a="closem">Done</button>`;
  else if(UIM==='gear')h=`${kk('Settings')}<h1>Saves & data</h1><p class="m sm">Your career saves automatically after every action and reopens where you left off.</p>${vSaves()}<h3 class="mt2">About the data</h3><p class="m sm">Squads are the 2026–27 rosters as at the close of the summer 2026 window (API-Football), managers are head coaches as of 3 Nov 2026 (Wikipedia, CC BY-SA), and player ratings are derived from Transfermarkt market values up to June 2026, then club strength, caps and age. Ratings are not copied from any game.</p><div class="row wr mt"><button class="btn" data-a="closem">Close</button></div>`;
  else if(p&&p.t==='train')h=`${kk(esc(club(me.cl).name)+' · '+ROLEN[me.role])}<h1>${label(ST.season)} season</h1>${me.nr?`<div class="note" style="margin:0 0 12px">${esc(me.nat)} call-up status: <b>${me.nr==='starter'?'first choice':'in the squad'}</b>. International breaks are simulated.</div>`:''}<h2>Training focus</h2>${focusBtns()}<button class="btn" data-a="cont">Start season →</button>`;
  else if(p&&p.t==='block'){const all=sumSS(me.ss,'ap'),g=sumSS(me.ss,'g'),a=sumSS(me.ss,'a');
    h=`${kk('Review')}<h1>Block ${p.n} complete</h1><div class="grid" style="margin-bottom:16px"><div class="tile">${kk('Apps')}<b class="n">${all}</b></div><div class="tile">${kk('Goals')}<b class="n">${g}</b></div><div class="tile">${kk('Assists')}<b class="n">${a}</b></div><div class="tile">${kk('Form')}<b class="n">${me.form.length?(me.form.reduce((x,y)=>x+y,0)/me.form.length).toFixed(1):'-'}</b></div><div class="tile">${kk('OVR this season')}<b class="n">${me.o0||me.ovr} → ${me.ovr}</b></div></div><h2>Training focus</h2>${focusBtns()}<button class="btn" data-a="cont">Continue →</button>`}
  else if(p&&p.t==='season'){
    const r=p.row;
    h=`${kk('Season review')}<h1>${p.s}</h1><div class="grid"><div class="tile">${kk('Apps')}<b class="n">${r.ap}${r.y?' +'+r.y.ap:''}</b></div><div class="tile">${kk('Goals')}<b class="n">${r.g}</b></div><div class="tile">${kk('Assists')}<b class="n">${r.a}</b></div><div class="tile">${kk('Avg rating')}<b class="n">${r.avg?r.avg.toFixed(2):'-'}</b></div></div>
    ${p.hon.length?`<div class="mt">🏆 ${p.hon.map(esc).join(' · ')}</div>`:''}${p.aw.length?`<div class="b" style="margin-top:6px">${p.aw.map(esc).join(' · ')}</div>`:''}
    <h2 class="mt2">Champions</h2><div class="sm">${LGN.slice(0,NTOP).map((l,i)=>`${l.s}: <b>${esc(p.H.champs[i])}</b>`).join(' · ')}<br>Champions League: <b>${esc(p.H.ucl)}</b> · Europa League: <b>${esc(p.H.uel)}</b></div>
    <h2 class="mt2">Ballon d'Or ${p.rank?kk('you finished '+ord(p.rank)):''}</h2>${p.bdo.slice(0,5).map((x,i)=>`<div class="lrow ${x.me?'me':''}"><span class="no">${i+1}</span><div class="g1"><b>${esc(x.n)}</b><br>${kk(esc(x.c))}</div><b class="mono">${x.sc}</b></div>`).join('')}
    <button class="btn full" style="text-align:center" data-a="rev">Review your options →</button>`}
  return`<div class="modal"><section class="glass">${h}</section></div>`;
}
function modalOpen(){const p=ST.pend;return UIM||(p&&!(p.t==='season'&&p.rev))}

