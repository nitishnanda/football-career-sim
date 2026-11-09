/* Main screens: header, Home, Club, Match Center, League. */
const NAV=[['home','Season'],['club','Team'],['league','League'],['career','Career']];
const tabBtns=(cls)=>{const u=unread();return NAV.map(([k,n])=>`<button class="${TAB===k?'on':''}" data-a="tab" data-v="${k}">${n}${k==='home'&&u?`<i>${u}</i>`:''}</button>`).join('')};

const vDock=()=>`<nav class="dock glass">${tabBtns()}</nav>`;

/* ---------- Home ---------- */
function vHero(){
  const me=ST.me,mc=club(me.cl),nf=nextFixObj(),yth=nf&&nf.y,oc=nf&&nf.o!=null&&!yth?club(nf.o):null,tag=matchTag(nf,mc,oc);
  const opp=oc?(null):yth&&nf.o!=null?`<div class="team ${nf.h?'r':''}">${crestN(club(nf.o).name,'lg')}<div><div class="tn">${esc(club(nf.o).name)} U18</div>${kk('Academy side')}</div></div>`:`<div class="team ${nf&&nf.h?'r':''}"><span class="crest lg">?</span><div><div class="tn">Opponent TBC</div>${kk('Drawn on the day')}</div></div>`;
  const mine=me.role==='youth'?`<div class="team ${nf&&nf.h?'':'r'}">${crestN(mc.name,'lg')}<div><div class="tn">${esc(mc.name)} U18</div>${kk('Academy side')}</div></div>`:teamBlk(mc,nf&&!nf.h);
  const o2=oc?teamBlk(oc,!nf.h):opp,l=nf&&nf.h!==false?[mine,o2]:[o2,mine],hc=nf&&nf.h!==false?mc:oc;
  const ps=playProbs(me.role==='youth'?'yth':'lg').ps,sp=me.inj>0?0:Math.round(ps*100),pv=oc?oppPreview(oc):null;
  return G('pad s8',`<div class="row sp wr"><div class="row wr">${nf?`<span class="pill hot">${nf.y?'U18':nf.o!=null?(nf.h?'HOME':'AWAY'):'NEXT'}</span>`:''}${tag?`<span class="pill good">${tag}</span>`:''}<b>${nf?esc(nf.c):'Season complete'}</b></div>${nf&&hc?kk(esc(hc.gd||hc.name+' Stadium')+' · '+matchDate(nf.w,mc.id)):''}</div>
  ${nf?`<div class="hero">${l[0]}<div class="vs">VS</div>${l[1]}</div>`:'<div class="empty">Choose your next move in the inbox.</div>'}
  ${pv?`<div class="grid" style="margin-bottom:12px"><div class="tile">${kk('Their top scorer')}<div class="b">${pv.top&&pv.top.g?plink(pv.top)+' · '+pv.top.g:'-'}</div></div><div class="tile">${kk('Scoring / conceding')}<div class="b mono">${pv.gf.toFixed(1)} / ${pv.ga.toFixed(1)} per game</div></div><div class="tile">${kk('Their manager')}<div class="b">${esc(oc.mgr||'n/a')}</div></div><div class="tile">${kk('Earlier this season')}<div class="b mono">${pv.last?(pv.last[0]===me.cl?club(pv.last[0]).name.slice(0,3).toUpperCase()+' '+pv.last[2]+'–'+pv.last[3]+' '+oc.name.slice(0,3).toUpperCase():oc.name.slice(0,3).toUpperCase()+' '+pv.last[2]+'–'+pv.last[3]+' '+mc.name.slice(0,3).toUpperCase()):'first meeting'}</div></div></div>`:''}
  <div class="tile row sp wr" style="margin-bottom:14px"><div><b>${esc(me.name)} (No. ${shirt(me)})</b> <span class="pill">${pname(me).toUpperCase()}</span><br>${kk(me.inj>0?'Unavailable: injured':sp+'% chance to start · '+ROLEN[me.role])}</div>${me.inj>0?'<span class="pill bad">INJURED</span>':`<span class="pill ${sp>60?'good':''}">${ROLEN[me.role].toUpperCase()}</span>`}</div>
  <div class="row wr"><button class="btn g1" data-a="next">▶ Play next match</button><button class="btn alt g1" data-a="chunk">Next 3 matches</button><button class="btn alt g1" data-a="blk">To next review</button><button class="btn alt g1" data-a="ssn">Sim season</button></div>
  ${me.inj>0?`<div class="warn">Injured: about ${me.inj} more matchday${me.inj>1?'s':''} out.</div>`:''}${ST.note?`<div class="warn">${esc(ST.note)}</div>`:''}`);
}
function vObjective(){
  const me=ST.me,mc=club(me.cl),g=boardGoal(mc),pos=posOf(mc),n=table(mc.lg).length,ok=pos<=g.max,gap=pos-g.max;
  return G('pad s4',`<h2>Board objective ${kk(label(ST.season))}</h2><b style="font-size:19px;line-height:1.25;display:block">${g.t}</b>
  <div class="row sp mt">${kk('Currently')}<b>${ord(pos)} of ${n}</b></div><div class="bar" style="margin-top:6px"><i style="width:${clamp((n-pos)/Math.max(1,n-1)*100,4,100)}%"></i></div>
  <div class="row sp sm mt"><span class="m">Target: top ${g.max}</span><span class="pill ${ok?'good':'bad'}">${ok?'ON TRACK':gap+' PLACE'+(gap>1?'S':'')+' SHORT'}</span></div>
  <div class="tile mt"><div class="row sp sm"><span class="m">Your role</span><b>${ROLEN[me.role]}</b></div><div class="row sp sm"><span class="m">Manager trust</span><b>${Math.round(me.trust||60)}%</b></div><div class="row sp sm"><span class="m">Conditioning</span><b>${cond()}%</b></div></div>`);
}
function vKPI(){
  const me=ST.me,mc=club(me.cl),ss=me.ss,rn=sumSS(ss,'rn'),rs=sumSS(ss,'rs'),gd=mc.t.gf-mc.t.ga,tile=(k,v,s)=>`<div class="tile">${kk(k)}<b class="n">${v}</b>${s?`<span class="m sm">${s}</span>`:''}</div>`;
  return G('pad s12',`<div class="grid kpi">${tile('League',ord(posOf(mc)),esc(LGN[mc.lg].s))}${tile('Points',mc.t.p,`${mc.t.w}W ${mc.t.d}D ${mc.t.l}L`)}${tile('Goal difference',(gd>0?'+':'')+gd,`${mc.t.gf} for · ${mc.t.ga} against`)}${tile('My appearances',sumSS(ss,'ap'),sumSS(ss,'st')+' starts')}${tile('Goals + assists',sumSS(ss,'g')+sumSS(ss,'a'),sumSS(ss,'g')+' G · '+sumSS(ss,'a')+' A')}${tile('Avg rating',rn?(rs/rn).toFixed(2):'-','this season')}</div>`);
}
function vSnap(){
  const mc=club(ST.me.cl),t=table(mc.lg),i=t.findIndex(c=>c.id===mc.id),lo=clamp(i-3,0,Math.max(0,t.length-7)),n=t.length;
  return G('pad s4',`<h2>League table ${kk(esc(LGN[mc.lg].n))}</h2><table class="tb"><tr><th>#</th><th>Club</th><th class="r">P</th><th class="r">GD</th><th class="r">Pts</th></tr>${t.slice(lo,lo+7).map((c,j)=>`<tr class="${c.id===mc.id?'me':''}"><td><span class="zone ${zc(mc.lg,lo+j,n)}"></span>${lo+j+1}</td><td>${clink(c)}</td><td class="r">${c.t.w+c.t.d+c.t.l}</td><td class="r">${c.t.gf-c.t.ga}</td><td class="r b">${c.t.p}</td></tr>`).join('')}</table><button class="btn alt sm mt" data-a="opendiv" data-v="${mc.lg}">Full table →</button>`);
}
function vFormCard(){
  const me=ST.me,log=ST.mineLog.slice(-5).reverse(),avg=me.form.length?me.form.reduce((a,b)=>a+b,0)/me.form.length:null;
  return G('pad s4',`<h2>My form ${kk('last '+me.form.length)}</h2><div class="row sp" style="margin-bottom:10px"><div class="b" style="font-size:24px">${avg?avg.toFixed(2):'-'}</div><div style="color:var(--mu)">${spark(me.form,150,44)}</div></div>
  ${log.map(l=>{const tag=l.m==='out'?'OUT':l.m==='dnp'?'UNUSED':[l.g?l.g+' G':'',l.a?l.a+' A':''].filter(Boolean).join(' · ')||esc(l.c.split(' · ')[0]);return`<div class="frow"><span class="opp">${ab(l.o)}</span><span>${esc(l.o)} <span class="m">(${l.h?'H':'A'}) ${l.gf}–${l.ga}</span></span><span class="tag">${tag}</span>${l.rt!=null?rb(l.rt):'<span class="m">-</span>'}</div>`}).join('')||'<div class="empty">No matches yet</div>'}`);
}
function vStatus(){
  const me=ST.me,mc=club(me.cl),L=(byPos(mc)[me.pos]||[]).slice(0,5).map(p=>({p,me:0}));L.push({p:me.p,me:1});L.sort((a,b)=>b.p.ovr-a.p.ovr);
  return G('pad s4',`<h2>Competition for my place ${kk(pname(me))}</h2>${L.slice(0,6).map((x,i)=>`<div class="lrow ${x.me?'me':''}"><span class="no">${i+1}</span><div class="g1"><b>${x.me?esc(me.name)+' · YOU':plink(x.p)}</b><br>${kk(x.me?ROLEN[me.role]:x.p.age+' years')}</div><b class="mono">${x.p.ovr}</b></div>`).join('')}<div class="note">${me.role==='starter'?'You are the first choice at the moment.':me.role==='rotation'?'You are in the rotation: a strong run will win you the shirt.':'Minutes are limited. Consider a loan if this continues.'}</div>`);
}
function vLeaders(){
  const mc=club(ST.me.cl),ps=withMe(mc.sq.map(id=>ST.W.pl[id]));
  const list=(arr,f)=>arr.map((p,i)=>`<div class="lrow ${p.me?'me':''}"><span class="no">${i+1}</span><div class="g1"><b>${plink(p)}</b><br>${kk(plab(p)+' · '+p.age)}</div><b class="mono">${f(p)}</b></div>`).join('')||'<div class="m sm">Nothing yet</div>';
  return G('pad s6',`<h2>Club leaders</h2><div class="g12" style="margin:0"><div class="s4"><h3>Goals</h3>${list(ps.filter(p=>p.g).sort((a,b)=>b.g-a.g).slice(0,4),p=>p.g)}</div><div class="s4"><h3>Assists</h3>${list(ps.filter(p=>p.a).sort((a,b)=>b.a-a.a).slice(0,4),p=>p.a)}</div><div class="s4"><h3>Rating</h3>${list(ps.filter(p=>p.ap>=3).sort((a,b)=>b.rs/(b.rn||b.ap)-a.rs/(a.rn||a.ap)).slice(0,4),p=>(p.rs/(p.rn||p.ap)).toFixed(2))}</div></div>`);
}
function vNews(){
  const ic={hat:'⚽',big:'🔥',me:'★',inj:'✚',tr:'💸',mg:'🪑'},n=(ST.news||[]).slice(0,7);
  return G('pad s6',`<h2>Around the leagues</h2>${n.map(x=>`<div class="news"><span class="ni">${ic[x.k]||'•'}</span><div><div>${esc(x.t)}</div>${kk(x.s)}</div></div>`).join('')||'<div class="empty">Headlines appear as the season goes on.</div>'}`);
}

/* ---------- Club ---------- */
function vClub(){
  const me=ST.me,c=club(me.cl),l=LGN[c.lg],pos=posOf(c),goal=boardGoal(c),t=c.t,n=Math.max(1,t.w+t.d+t.l);
  const head=G('pad s12',`<div class="row sp wr"><div class="row" style="gap:14px">${crestN(c.name,'lg')}<div><h1 style="margin:0">${esc(c.name)}</h1>${kk(esc(l.n)+' · '+esc(c.gd||'')+' · Manager '+esc(c.mgr||'n/a'))}<div class="mt">${dots(c.f)}</div></div></div><div class="row" style="gap:26px"><div>${kk('Position')}<div class="big">${ord(pos)}</div></div><div>${kk('Board expects')}<b style="display:block;max-width:190px">${goal.t}</b></div></div></div>`);
  const bar=`<div class="subnav s12">${[['squad','Squad'],['stats','Team stats'],['fix','Fixtures & results']].map(([k,nm])=>`<button class="${CT===k?'on':''}" data-a="ct" data-v="${k}">${nm}</button>`).join('')}</div>`;
  let body='';
  if(CT==='squad'){
    const xi=projXI(c),used=new Set(xi.filter(Boolean).map(x=>x.p.id)),bench=c.sq.map(id=>ST.W.pl[id]).filter(p=>!used.has(p.id)).sort((a,b)=>b.ovr-a.ovr).slice(0,7);
    body=G('pad s5',`<h2>Probable XI ${kk('4-2-3-1')}</h2>${pitchXI(xi)}<h3 class="mt">Bench</h3>${bench.map(p=>`<div class="lrow"><span class="pos ${p.pos}">${plab(p)}</span><span class="g1">${plink(p)}</span><b class="mono">${p.ovr}</b></div>`).join('')}`)+G('pad s7',`<h2>Squad ${kk(c.sq.length+' players · click a header to sort')}</h2>${squadTable(c)}`);
  }else if(CT==='stats'){
    const all=table(c.lg),avgG=all.reduce((s,x)=>s+x.t.gf,0)/all.length/n,avgC=all.reduce((s,x)=>s+x.t.ga,0)/all.length/n,avgP=all.reduce((s,x)=>s+x.t.p,0)/all.length/n,ps=(c.id===ST.me.cl?withMe:x=>x)(c.sq.map(id=>ST.W.pl[id]));
    const split=(a,b,d,e)=>`${a|0}-${b|0}-${d|0}`;
    body=G('pad s5',`<h2>Season record</h2><div class="grid"><div class="tile">${kk('Played')}<b class="n">${t.w+t.d+t.l}</b></div><div class="tile">${kk('Points / game')}<b class="n">${(t.p/n).toFixed(2)}</b></div><div class="tile">${kk('Clean sheets')}<b class="n">${t.cs|0}</b></div><div class="tile">${kk('Goals for')}<b class="n">${t.gf}</b></div><div class="tile">${kk('Goals against')}<b class="n">${t.ga}</b></div><div class="tile">${kk('Goal diff')}<b class="n">${t.gf-t.ga>0?'+':''}${t.gf-t.ga}</b></div></div>
    <table class="tb mt"><tr><th></th><th class="r">W</th><th class="r">D</th><th class="r">L</th></tr><tr><td>Home</td><td class="r">${t.hw|0}</td><td class="r">${t.hd|0}</td><td class="r">${t.hl|0}</td></tr><tr><td>Away</td><td class="r">${t.aw|0}</td><td class="r">${t.ad|0}</td><td class="r">${t.al|0}</td></tr></table>`)
      +G('pad s7',`<h2>Against the league average</h2>${cmpRow('Points per game',t.p/n,avgP,v=>v.toFixed(2))}${cmpRow('Goals scored per game',t.gf/n,avgG,v=>v.toFixed(2))}${cmpRow('Goals conceded per game',t.ga/n,avgC,v=>v.toFixed(2),1)}<div class="m sm">Left is your club, right is the league average. For goals conceded, a bigger bar on the left means you let in fewer.</div>
      <div class="g12 mt" style="margin-bottom:0"><div class="s6"><h3>Top scorers</h3>${ps.filter(p=>p.g).sort((a,b)=>b.g-a.g).slice(0,5).map(p=>`<div class="lrow"><span class="g1">${plink(p)}</span><b class="mono">${p.g}</b></div>`).join('')||'<div class="m sm">Nothing yet</div>'}</div><div class="s6"><h3>Top assists</h3>${ps.filter(p=>p.a).sort((a,b)=>b.a-a.a).slice(0,5).map(p=>`<div class="lrow"><span class="g1">${plink(p)}</span><b class="mono">${p.a}</b></div>`).join('')||'<div class="m sm">Nothing yet</div>'}</div></div>`);
  }else{
    const LG={},CL={};ST.mineLog.forEach(l=>{const m=/Matchday (\d+)/.exec(l.c);if(m)LG[m[1]]=l;else CL[l.c]=l});
    const my=l=>!l?'':l.m==='out'?'<span class="m">Out</span>':l.m==='dnp'?'<span class="m">Unused sub</span>':`${l.rt!=null?rb(l.rt):''} <span class="m sm">${[l.g?l.g+' G':'',l.a?l.a+' A':'',l.mn+"'"].filter(Boolean).join(' · ')}</span>`;
    const played=clubResults(c.id,60).reverse(),up=clubUpcoming(c.id,60);
    const row=(r,done)=>{const home=r.h===c.id,opp=club(home?r.a:r.h);let res='';if(done){const gf=home?r.hg:r.ag,ga=home?r.ag:r.hg;res=`<span class="pill ${gf>ga?'good':gf<ga?'bad':''}">${gf>ga?'W':gf<ga?'L':'D'}</span> <b class="mono">${gf}–${ga}</b>`}return`<tr><td class="m">MD${r.w}</td><td>${home?'H':'A'}</td><td>${clink(opp)}</td><td class="r">${done?res:'<span class="m">upcoming</span>'}</td><td class="r">${my(LG[r.w])}</td></tr>`};
    body=G('pad s7',`<h2>League ${kk(esc(l.n))}</h2><table class="tb"><tr><th>Wk</th><th></th><th>Opponent</th><th class="r">Result</th><th class="r">My game</th></tr>${played.map(r=>row(r,1)).join('')}${up.map(r=>row(r,0)).join('')}</table>`)
      +vCompPanel();
  }
  return`<div class="g12">${head}${bar}${body}</div>`;
}

/* ---------- Match Center ---------- */
const teamBlkL=(name,id,mine,right)=>`<div class="team ${right?'r':''}">${crestN(name,'lg')}<div><div class="tn">${id>=0?clink(club(id),name):esc(name)}</div>${mine?kk('Your club'):''}</div></div>`;
function vMatchCenter(){
  const hist=ST.hist||[],r=hist[MSEL]||ST.last;
  if(!r)return`<div class="g12">${G('s12 empty','Play a match and the full report lands here, with lineups, team stats and your performance.')}</div>`;
  const s=r.st,me=ST.me;
  const toggleBtn=`<button class="ico" data-a="mcmin" title="${MCMIN?'Show full match report':'Minimise match report'}">${MCMIN?'⌄':'⌃'}</button>`;
  const hero=G('pad s12',`<div class="row sp wr">${kk(esc(r.c)+' · 4-2-3-1')}<div class="row wr">${r.mp==='start'||r.mp==='sub'?`<span class="pill">${r.mp==='start'?'STARTED':'SUB'} · ${r.min}'</span>`:''}${s&&r.motm&&s.rating>=r.motm.r?'<span class="pill hot">★ PITCH LEADER</span>':''}${toggleBtn}</div></div>
  <div class="hero">${teamBlkL(r.h,r.hid,r.sd===0)}<div class="c"><div class="score">${r.hg}<span class="m"> : </span>${r.ag}</div>${r.et?'<div class="m sm">After extra time</div>':''}${r.pen?`<div class="m sm">${esc(r.wn)} on penalties</div>`:''}</div>${teamBlkL(r.a,r.aid,r.sd===1,1)}</div>`);
  if(MCMIN)return`<div class="g12">${hero}</div>`;
  const strip=hist.slice(0,14).map((x,i)=>`<button class="chipb ${i===MSEL?'on':''}" data-a="msel" data-v="${i}"><span class="m">${esc(x.c.split(' · ')[0].replace('League','').trim().slice(0,14))}</span> ${x.hg}–${x.ag} ${x.st?rb(x.st.rating):''}</button>`).join('');
  const tabs=`<div class="subnav s12">${[['over','Overview'],['lu','Lineups'],['st','Team stats'],['me','My game']].map(([k,n])=>`<button class="${MT===k?'on':''}" data-a="mt" data-v="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(MT==='over'){
    let h=0,a=0;const chips=r.evs.map(e=>{e.s?a++:h++;return`<span class="chip ${e.me||e.am?'me':''}">${e.mt||e.m}' ⚽ ${esc(e.n)}${e.a?' ← '+esc(e.a):''} (${h}–${a})</span>`});
    if(r.mp==='sub')chips.unshift(`<span class="chip me">${r.iv?mLab(r,r.iv[0]):91-r.min}' ↑ you come on</span>`);else if(s&&r.iv&&r.len&&r.iv[1]<totAct(r.len)-.5)chips.push(`<span class="chip me">${mLab(r,r.iv[1])}' ↓ you are subbed off</span>`);if(r.et)chips.push('<span class="chip">after extra time</span>');
    if(r.inj)chips.push(`<span class="chip">injury: ${esc(r.inj.t)}</span>`);if(r.red)chips.push('<span class="chip">sent off</span>');
    const g=R('vd|'+r.c+r.wk+r.hg+r.ag),vb=s?(s.rating>=7.7?VERD.hi:s.rating>=6.8?VERD.mid:VERD.lo):null;
    body=G('pad s7',`<h2>Match flow</h2>${vTimeline(r)}<div class="chips">${chips.join('')||'<span class="m">No goals</span>'}</div>`)
      +G('pad s5',`<h2>Your rating</h2><div class="row" style="gap:18px">${s?rb(s.rating,1):'<span class="m">no rating</span>'}<div class="g1">${r.motm?`<div class="m sm">Best rated: <b>${esc(r.motm.n)}</b> ${rb(r.motm.r)}</div>`:''}</div></div>${vb?`<div class="note"><b>${r.k==='nat'?'National coach':'Manager'}'s verdict · ${esc(r.k==='nat'?natMgr(me.nat):mgr(club(me.parent>=0&&me.role==='youth'?me.parent:me.cl)))}</b><br>“${g.pick(vb)}”</div>`:''}${s&&s.f?`<h3 class="mt">What drove your rating</h3>${rateParts(me.pos,s.f).map(([l,d,v])=>`<div class="kv"><span>${esc(l)}${typeof v==='number'&&l!=='Win'&&l!=='Defeat'&&l!=='Clean sheet'?' · '+v:''}</span><b style="color:${d>0?'var(--good)':'var(--badc)'}">${d>0?'+':''}${d.toFixed(2)}</b></div>`).join('')}<div class="m sm mt">Compared with an average game at your position. Ratings come from a model fitted on 91,000 real player-matches.</div>`:''}${r.inj?`<div class="warn">Injury: ${esc(r.inj.t)}, about ${r.inj.w} week${r.inj.w>1?'s':''}.</div>`:''}${r.red?'<div class="warn">Sent off. You miss the next match.</div>':''}`);
  }else if(MT==='lu'){
    const col=(lu,name,id)=>`<h2>${id>=0?clink(club(id),name):esc(name)}</h2>${lu.map(x=>`<div class="lrow ${x.me?'me':''}"><span class="pos ${x.pos}">${SIDED[x.pos]?plab({pos:x.pos,sd:x.me?ST.me.sd:(ST.W.pl[x.id]||{}).sd}):x.pos}</span><div class="g1"><b>${x.me?esc(x.n)+' · YOU':(x.id>=0?`<a class="lk" data-a="pcard" data-v="${x.id}">${esc(x.n)}</a>`:esc(x.n))}</b>${x.sub?' <span class="pill">SUB</span>':''}<br>${kk('OVR '+Math.round(x.o)+' · '+x.m+"' played"+(x.on!=null?' · on '+mLab(r,x.on)+"'":'')+(x.off!=null?' · off '+mLab(r,x.off)+"'":''))}</div>${x.g?`<span class="mono">${'⚽'.repeat(Math.min(x.g,4))}</span>`:''}${x.a?`<span class="mono m">${x.a}A</span>`:''}${rb(x.r)}</div>`).join('')}`;
    body=r.lu?G('pad s6',col(r.lu[0],r.h,r.hid))+G('pad s6',col(r.lu[1],r.a,r.aid)):G('s12 empty','No lineup data for this match.');
  }else if(MT==='st'){
    const t=r.ts;
    body=t?G('pad s12',`<h2>Team stats ${kk('simulated around the result')}</h2><div class="row sp mono sm"><b>${esc(r.h)}</b><b>${esc(r.a)}</b></div>${cmpRow('Possession',t.poss[0],t.poss[1],v=>v+'%')}${cmpRow('Shots',t.h.sh,t.a.sh)}${cmpRow('Shots on target',t.h.sot,t.a.sot)}${cmpRow('Expected goals',t.h.xg,t.a.xg,v=>(+v).toFixed(2))}${cmpRow('Corners',t.h.cor,t.a.cor)}${cmpRow('Fouls',t.h.fls,t.a.fls)}${cmpRow('Yellow cards',t.h.yc,t.a.yc)}`):G('s12 empty','No team stats for this match.');
  }else body=s?vMyGame(r):G('s12 empty','You did not take part in this match.');
  return`<div class="g12">${hero}<div class="s12"><div class="strip">${strip}</div></div>${tabs}${body}</div>`;
}

/* ---------- League ---------- */
function lgHeader(){
  const lg=LGV,cur=lg<100?LGN[lg].country:lg>=1000?CO[lg-1000]:null,dv=LGN.map((l,i)=>[i,l]).filter(([i,l])=>l.country===cur);
  return`<div class="row wr" style="margin-bottom:10px">${CO.map(c=>`<button class="btn alt ${c===cur&&lg<1000?'on':''}" data-a="ctry" data-v="${c}">${c}</button>`).join('')}<button class="btn alt ${lg===100?'on':''}" data-a="lg" data-v="100">Champions League</button><button class="btn alt ${lg===101?'on':''}" data-a="lg" data-v="101">Europa League</button></div>${cur?`<div class="row wr" style="margin-bottom:12px">${dv.map(([i,l])=>`<button class="btn alt sm ${i===lg?'on':''}" data-a="lg" data-v="${i}">${l.n}</button>`).join('')}<button class="btn alt sm ${lg===1000+CO.indexOf(cur)?'on':''}" data-a="lg" data-v="${1000+CO.indexOf(cur)}">🎓 U18 Premier League</button></div>`:''}`;
}
function vU18League(country){
  const rows=u18Table(country),me=ST.me,md=u18Clubs(country).length-1,played=u18WeeksPlayed();
  if(!rows.length)return`<div class="g12">${G('s12 empty','No U18 academy division for this country.')}</div>`;
  const row=(c,i)=>`<tr class="${c.id===me.cl?'me':''}"><td>${i+1}</td><td>${clink(club(c.id))}</td><td class="r">${c.t.w+c.t.d+c.t.l}</td><td class="r">${c.t.w}</td><td class="r">${c.t.d}</td><td class="r">${c.t.l}</td><td class="r">${c.t.gf-c.t.ga>0?'+':''}${c.t.gf-c.t.ga}</td><td class="r b">${c.t.p}</td></tr>`;
  return`<div class="g12">${G('pad s12',`<h2>U18 Premier League ${kk('matchday '+Math.min(played,md)+' of '+md)}</h2><div class="m sm" style="margin-bottom:10px">Academy sides of the top flight, same fixture rhythm as the senior league.</div><div style="overflow-x:auto"><table class="tb"><tr><th>#</th><th>Club</th><th class="r">P</th><th class="r">W</th><th class="r">D</th><th class="r">L</th><th class="r">GD</th><th class="r">Pts</th></tr>${rows.map(row).join('')}</table></div>`)}</div>`;
}
function vLeague(){
  const me=ST.me,lg=LGV,head=lgHeader();
  if(lg>=1000)return head+vU18League(CO[lg-1000]);
  if(lg>=100)return head+`<div class="g12">${vEuro(lg===100?'ucl':'uel',lg===100?'Champions League':'Europa League')}</div>`;
  const t=table(lg),md=LGN[lg].md,played=t[0].t.w+t[0].t.d+t[0].t.l,mlg=club(me.cl).lg===lg;
  const sub=`<div class="subnav">${[['table','Table'],['res','Results'],['lead','Leaders'],['aw','Award race'],['cup','Cups & Europe']].map(([k,n])=>`<button class="${LT===k?'on':''}" data-a="lt" data-v="${k}">${n}</button>`).join('')}</div>`;
  const ps=ST.W.pl.filter(p=>p.cl>=0&&club(p.cl).lg===lg),L=me.ss.lg;
  if(mlg&&L.ap)ps.push({n:me.name+' ★',cl:me.cl,g:L.g,a:L.a,ap:L.ap,rs:L.rs,cs:L.cs,me:1,pos:me.pos,age:me.age,mn:L.mn,x:{kp:L.kp,dr:L.dr,tk:L.tk,ic:L.ic||0,sv:L.sv||0}});
  const lrow=(arr,f)=>arr.map((p,i)=>`<div class="lrow ${p.me?'me':''}"><span class="no">${i+1}</span><div class="g1"><b>${p.me?esc(p.n):plink(p)}</b><br>${kk(esc(club(p.cl).name))}</div><b class="mono">${f(p)}</b></div>`).join('')||'<div class="m sm">Nothing yet</div>';
  let body='';
  if(LT==='table'){
    const gap=t[0].t.p-t[1].t.p,tot=t[0].t.p+t[1].t.p||1,proj=t.map(c=>({c,p:c.t.p/Math.max(1,c.t.w+c.t.d+c.t.l)*md})).sort((a,b)=>b.p-a.p),pf=proj.findIndex(x=>x.c.id===me.cl)+1;
    body=G('pad s12',`<div class="row sp wr"><b>Title race</b>${kk('matchday '+played+' of '+md)}</div><div class="row sp mono sm mt"><b>${clink(t[0])} ${t[0].t.p}</b><b>${t[1].t.p} ${clink(t[1])}</b></div><div class="bar" style="margin-top:8px;height:10px"><i style="width:${t[0].t.p/tot*100}%"></i></div><div class="row sp mt">${kk(gap+' pts gap · '+(md-played)+' matches left')}<button class="btn alt sm ${COMPACT?'on':''}" data-a="compact">${COMPACT?'☰ compact':'▦ full'}</button></div>`)
      +G('pad s12',`<h2>${esc(LGN[lg].n)}</h2>${vTableL(lg,me.cl)}${mlg?`<div class="row sp mono sm mt"><span class="m">${esc(club(me.cl).name)}</span><b>Projected finish: ${proj[pf-1].p.toFixed(1)} pts (${ord(pf)})</b></div>`:''}`);
  }else if(LT==='res'){
    const w=RMD==null?Math.max(1,played):clamp(RMD,1,md),ms=leagueRes(lg,w),fx=fixtures(lg)[w-1]||[];
    body=G('pad s12',`<div class="row sp wr"><div class="row"><button class="btn alt sm" data-a="rmd" data-v="${w-1}">‹</button><b>Matchday ${w}</b><button class="btn alt sm" data-a="rmd" data-v="${w+1}">›</button></div>${kk(matchDate(w,lg))}</div><div class="mt">${(ms.length?ms:fx.map(f=>[f[0],f[1],null,null])).map(m=>{const mine=m[0]===me.cl||m[1]===me.cl;return`<div class="lrow ${mine?'me':''}"><span class="g1" style="text-align:right">${clink(club(m[0]))}</span><b class="mono" style="min-width:64px;text-align:center">${m[2]==null?'v':m[2]+' – '+m[3]}</b><span class="g1">${clink(club(m[1]))}</span></div>`}).join('')}</div>`);
  }else if(LT==='lead'){
    const mn=Math.min(8,Math.max(1,...ps.map(p=>p.ap)));
    body=G('pad s6',`<h2>Top scorers</h2>${lrow(ps.slice().sort((a,b)=>b.g-a.g||b.a-a.a).slice(0,10),p=>p.g)}`)+G('pad s6',`<h2>Top assists</h2>${lrow(ps.slice().sort((a,b)=>b.a-a.a||b.g-a.g).slice(0,10),p=>p.a)}`)
      +G('pad s6',`<h2>Highest average rating ${kk('min '+mn+' apps')}</h2>${lrow(ps.filter(p=>p.ap>=mn).sort((a,b)=>b.rs/b.ap-a.rs/a.ap).slice(0,10),p=>(p.rs/p.ap).toFixed(2))}`)+G('pad s6',`<h2>Clean sheets ${kk('goalkeepers')}</h2>${lrow(ps.filter(p=>p.pos==='GK'&&p.cs).sort((a,b)=>b.cs-a.cs).slice(0,10),p=>p.cs)}`)
      +(()=>{const X=(p,k)=>Math.round(xv(p,k)),T=(t,k,f)=>G('pad s3',`<h2>${t}</h2>${lrow(ps.filter(p=>p.x).sort((a,b)=>f(b)-f(a)).slice(0,8),p=>Math.round(f(p)))}`);
        return T('Key passes','kp',p=>X(p,'kp'))+T('Dribbles','dr',p=>X(p,'dr'))+T('Tackles + int.','tk',p=>X(p,'tk')+X(p,'ic'))+T('Saves','sv',p=>p.pos==='GK'?X(p,'sv'):0)})();
  }else if(LT==='aw'){
    body=vAwards(lg,ps);
  }else{
    const tl=topLg(lg),cp=ST.cup[tl],cs=cupStatus(lg),nxt=cp.rounds.length<cp.nr?cupDraw(tl,cp.rounds.length):null,lastR=cp.rounds.length-1;
    body=G('pad s6',`<h2>${LGN[tl].cup} ${kk(cs)}</h2><div class="m sm" style="margin-bottom:10px">Every club in ${esc(LGN[tl].country)} enters. The lower divisions start in round 1 and the biggest clubs join later. One match per tie.</div>
    ${lastR>=0?`<h3>${esc(cp.names[lastR])} · results</h3>${cp.rounds[lastR].map(x=>tieRow(x,me.cl)).join('')}${(cp.byes[lastR]||[]).length?`<div class="m sm mt">${cp.byes[lastR].length} clubs received a bye.</div>`:''}`:'<div class="m sm">The first round has not been played.</div>'}
    ${nxt&&nxt.ties.length?`<h3 class="mt">Next: ${esc(cp.names[cp.rounds.length])} · draw</h3>${nxt.ties.slice(0,12).map(x=>tieRow(x,me.cl)).join('')}${nxt.ties.length>12?`<div class="m sm">…and ${nxt.ties.length-12} more ties</div>`:''}`:''}
    <button class="btn alt sm mt" data-a="brk">${BRK?'Hide':'View'} all rounds</button>${BRK?cp.rounds.map((rs,i)=>rs?`<h3 class="mt">${esc(cp.names[i])}</h3>${rs.map(x=>tieRow(x,me.cl)).join('')}`:'').join(''):''}`)
    +G('pad s6',`${ico('🏆','Europe')}${['ucl','uel'].map(k=>`<div class="tile" style="margin-bottom:10px"><div class="row sp"><b>${EUN[k]}</b><span class="pill">${esc(ST.eu[k].win!=null?'Winners: '+club(ST.eu[k].win).name:euStage(k))}</span></div><div class="m sm mt">${ST.eu[k].teams.includes(me.cl)?'Your club is in this competition.':'Your club is not in this competition.'}</div><button class="btn alt sm mt" data-a="lg" data-v="${k==='ucl'?100:101}">Open →</button></div>`).join('')}`);
  }
  return head+sub+`<div class="g12" style="margin-top:14px">${body}</div>`;
}

/* ---------- shell ---------- */
function render(){
  const a=document.getElementById('app');
  if(!ST){a.innerHTML=vCreate()+(sIdx().length||SAVEMSG?`<div class="page">${G('pad',vSaves())}</div>`:'');return}
  let h='';
  if(ST.phase==='retired')h=vRetired();
  else if(ST.phase==='youth')h=vYouth();
  else{
    h=vTop()+vSaveBanner()+vBanner()+`<main class="page">${({home:vHome,club:vClub,league:vLeague,career:vCareer}[TAB]||vHome)()}</main>`+vDock();
    document.title=`${ST.me.name} · ${label(ST.season)} · ${club(ST.me.cl).name}`;
  }
  if(modalOpen())h+=vModal();
  a.innerHTML=h;
}

let AWK='bdo';
function vAwards(lg,ps){
  const me=ST.me;let rows=[],title='',unit='';
  if(AWK==='bdo'){const r=race().slice(0,8),top=r[0]?r[0].sc:1;rows=r.map(x=>({n:x.n,c:x.c,me:x.me,w:Math.exp((x.sc-top)/Math.max(2,Math.abs(top)*.18)),line:x.g+' G · '+x.a+' A',id:x.id}));title="Ballon d'Or race";unit='across the top five leagues'}
  else if(AWK==='gb'){const r=ps.slice().sort((a,b)=>b.g-a.g||b.a-a.a).slice(0,8),top=r[0]?r[0].g:0;rows=r.map(p=>({n:p.n,c:p.cl,me:p.me,w:Math.exp((p.g-top)/2.2),line:p.g+' goals · '+p.ap+' apps',p}));title='Golden Boot race';unit=LGN[lg].n}
  else{const r=ST.W.pl.filter(p=>p.cl>=0&&p.age<=21&&p.ap>=3&&club(p.cl).lg<NTOP).map(p=>({p,sc:pscore(p.pos,p.ap,p.g,p.a,p.rs/p.ap,p.eg,p.cs,0,p.ovr,1)}));
    if(me.age<=21&&me.ss.lg.ap>=3&&club(me.cl).lg<NTOP)r.push({me:1,sc:pscore(me.pos,me.ss.lg.ap,me.ss.lg.g,me.ss.lg.a,me.ss.lg.rs/me.ss.lg.rn,0,me.ss.lg.cs,0,me.ovr,1),p:{n:me.name,cl:me.cl,g:me.ss.lg.g,a:me.ss.lg.a}});
    r.sort((a,b)=>b.sc-a.sc);const t8=r.slice(0,8),top=t8[0]?t8[0].sc:1;rows=t8.map(x=>({n:x.p.n,c:x.p.cl,me:x.me,w:Math.exp((x.sc-top)/Math.max(2,Math.abs(top)*.2)),line:x.p.g+' G · '+x.p.a+' A',p:x.p}));title='Young player race';unit='under 21, top five leagues'}
  const tot=rows.reduce((s,r)=>s+r.w,0)||1;
  return G('pad s12',`${ico('🏆',title,unit)}<div style="margin-bottom:14px">${seg([['bdo',"Ballon d'Or"],['gb','Golden Boot'],['yp','Young player']],AWK,'awk')}</div>
  ${rows.map((r,i)=>`<div class="tile ${r.me?'me':''}" style="margin-bottom:8px"><div class="row sp"><div><span class="mono b">${i+1}</span> &nbsp;<b>${r.me?esc(r.n)+' · YOU':r.p?plink(r.p):esc(r.n)}</b> <span class="m sm">${esc(club(r.c).name)}</span></div><b class="mono" style="font-size:22px">${Math.round(r.w/tot*100)}%</b></div><div class="track"><i style="width:${Math.round(r.w/tot*100)}%"></i></div>${kk(r.line)}</div>`).join('')||'<div class="m sm">Too early in the season to tell.</div>'}`);
}

/* my matches in cups and Europe: what I played, and what is drawn next */
function vCompPanel(){
  const me=ST.me,c=club(me.cl),cupN=LGN[c.lg].cup,isC=l=>l.c.startsWith(cupN+' · ')||l.c.startsWith('Champions League')||l.c.startsWith('Europa League');
  const played=ST.mineLog.filter(isC);
  const stat=l=>l.m==='out'?'<span class="m">Out</span>':l.m==='dnp'?'<span class="m">Unused sub</span>':`${l.rt!=null?rb(l.rt):''} <span class="m sm">${[l.g?l.g+' G':'',l.a?l.a+' A':'',l.mn+"'"].filter(Boolean).join(' · ')}</span>`;
  const rows=played.map(l=>{const w=l.gf>l.ga?'W':l.gf<l.ga?'L':'D',parts=l.c.split(' · ');return`<div class="res" style="display:block"><div class="row sp"><span class="pill">${esc(parts.slice(1).join(' · '))}</span><span class="k">${esc(parts[0])}</span></div><div class="row sp mt"><span><span class="wl ${w}">${w}</span> &nbsp;${l.h?'vs':'@'} <b>${esc(l.o)}</b></span><b class="mono" style="font-size:22px">${l.gf} - ${l.ga}</b><span>${stat(l)}</span></div></div>`}).reverse().join('');
  const up=[];for(let i=ST.si;i<ST.slots.length&&up.length<4;i++){const s=ST.slots[i];if(s.t!=='cup'&&s.t!=='eu')continue;const f=slotFixture(s,me.cl);if(f&&!f.bye)up.push(f)}
  const tl=topLg(c.lg),st=cupStatus(c.lg);
  const eus=['ucl','uel'].filter(k=>ST.eu[k].teams.includes(me.cl)).map(k=>{const e=ST.eu[k],i=(e.rank||euRank(k)).indexOf(me.cl)+1;return`<span class="pill hot">${EUN[k]}: ${e.rounds.length?euStage(k):'league phase, '+ord(i)}</span>`}).join(' ');
  return G('pad s5',`<h2>Cups and Europe</h2><div class="row wr" style="margin-bottom:12px"><span class="pill">${esc(cupN)}: ${esc(st)}</span>${eus}</div>
  ${up.length?`<h3>Coming up</h3>${up.map(f=>`<div class="kv"><span>${esc(f.c)}</span><b>${f.h?'vs':'@'} ${esc(club(f.o).name)}${f.neutral?' (neutral)':''}</b></div>`).join('')}`:''}
  <h3 class="mt">Played</h3>${rows||'<div class="m sm">No cup or European matches yet.</div>'}`);
}
