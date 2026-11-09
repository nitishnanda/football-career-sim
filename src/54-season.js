/* Season page (hero + match report + dashboard cards) and header, per the UI guide. */
let DT='games',TRG=null;
// training focus picker: six groups, then the sub-attributes of the selected one (goalkeepers keep their six)
function trainRow(me){
  if(me.pos==='GK'||!me.sub)return seg(keysOf(me).map(k=>[k,KL[k]]),me.focus||keysOf(me)[0],'focus');
  const g=TRG||(me.focus&&SUBG[me.focus])||'sho';
  return seg(GROUPS.map(([k])=>[k,KL[k]]),g,'trg')+'<div style="margin-top:8px">'+seg(GROUPS.find(x=>x[0]===g)[1].map(j=>[j,SL[j]]),me.focus,'focus')+'</div>';
}
const lspark=(v,w,h)=>{
  if(v.length<2)return'';const lo=Math.min(...v),hi=Math.max(...v),r=hi-lo||1,x=i=>i/(v.length-1)*(w-8)+4,y=a=>h-5-(a-lo)/r*(h-10);
  return`<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${v.map((a,i)=>x(i).toFixed(1)+','+y(a).toFixed(1)).join(' ')}"/></svg>`;
};
const ico=(e,t,tag)=>`<h2><span>${e} ${t}</span>${tag?`<span class="pill">${tag}</span>`:''}</h2>`;
const seg=(items,cur,act,badge)=>`<div class="seg2">${items.map(([k,n])=>`<button class="${cur===k?'on':''}" data-a="${act}" data-v="${k}">${n}${badge&&badge[k]?`<i>${badge[k]}</i>`:''}</button>`).join('')}</div>`;

function vTop(){
  const me=ST.me,inj=me.inj>0;
  return`<header class="top"><div class="brand"><span class="logo">⚽</span><div><b>FOOTBALL CAREER SIM</b>${kk('Pro circuit')}</div></div>
  <nav class="nav">${tabBtns()}</nav>
  <div class="hr"><div class="info"><b>OVR ${me.ovr} · ${esc(String(me.tier).toUpperCase())}</b>${kk(`Age ${me.age} · ${plab(me)} · ${inj?'Injured '+me.inj+'w':'Fitness '+cond()+'%'}`)}</div>
  <div class="sv ${SAVEOK?'':'off'}" title="${SAVEOK?'Autosave is on':'Saving is blocked'}"><span>${SAVEOK?(SAVET?'Saved':'Autosave'):'Not saving'}</span></div>
  <button class="srchbtn" data-a="srch" title="Search players and clubs ( / )" style="margin-left:0"><span>⌕</span><em>Search</em><kbd>/</kbd></button>
  <button class="ico gear" data-a="gear" title="Settings">⚙</button><button class="btn sm red" data-a="reset">New</button><button class="ico av" data-a="tab" data-v="career" title="Career">${ab(me.name).slice(0,2)}</button></div></header>`;
}

function vSeasonHero(){
  const me=ST.me,mc=club(me.cl),nf=nextFixObj(),oc=nf&&nf.o!=null&&!nf.y?club(nf.o):null,l=LGN[mc.lg],pos=posOf(mc);
  let t=mc.t,pl=t.w+t.d+t.l,md=l.md||38,lbl=esc(l.n)+' season',rc2=esc(mc.name)+' record';
  if(me.role==='youth'){
    if(l.tier===1){
      // top-flight academy: same simulated U18 Premier League table shown on the League page, so the two always agree
      const rows=u18Table(l.country),mine=rows.find(r=>r.id===mc.id);
      t=mine?mine.t:{w:0,d:0,l:0,gf:0,ga:0,p:0};md=u18Clubs(l.country).length-1||19;
    }else{
      const y=ST.mineLog.filter(x=>/U18/.test(x.c)),tot=ST.slots.filter(x=>x.t==='yth').length;
      let w=0,d=0,lo=0,gf=0,ga=0;y.forEach(x=>{gf+=x.gf;ga+=x.ga;x.gf>x.ga?w++:x.gf<x.ga?lo++:d++});
      t={w,d,l:lo,gf,ga,p:w*3+d};md=tot||y.length||1;
    }
    pl=t.w+t.d+t.l;lbl='U18 League season';rc2=esc(mc.name)+' U18 record';
  }
  const pct=Math.round(pl/md*100);
  const nx=nf?(oc?`${nf.h?'vs':'@'} ${esc(oc.name)} (${oc.t.w}-${oc.t.d}-${oc.t.l})`:nf.y&&nf.o!=null?`${nf.h?'vs':'@'} ${esc(club(nf.o).name)} U18`:esc(nf.c)):'Season complete';
  const fm=me.form.slice(-5).map(r=>rb(r)).join('');
  const f=me.focus||keysOf(me)[0];
  const ss=me.ss,S=k=>me.role==='youth'?((ss.yth&&ss.yth[k])||0):clubSS(me,k),sAp=S('ap'),sG=S('g'),sA=S('a'),sRn=S('rn'),sAvg=sRn?S('rs')/sRn:0;
  const avgBox=`<div class="box"><span class="k">Season avg</span><b>${sAvg?sAvg.toFixed(2):'-'}</b><span class="k">${sG}G ${sA}A · ${sAp} apps</span></div>`;
  const lr=ST.last;let lastBox='';
  if(lr){
    const gf=lr.sd?lr.ag:lr.hg,ga=lr.sd?lr.hg:lr.ag,res=gf>ga?'W':gf<ga?'L':'D',opp=lr.sd?lr.h:lr.a;
    const stat=lr.st?`${lr.st.g}G ${lr.st.a}A`:lr.mp==='dnp'?'Unused sub':lr.mp==='out'?(lr.why||'Missed'):'Did not feature';
    lastBox=`<div class="box ${res==='W'?'good':res==='L'?'bad':''}"><span class="k">Last match</span><b>${res} ${gf}-${ga}</b><span class="k">${lr.sd?'@':'vs'} ${esc(opp)} · ${stat}</span></div>`;
  }
  return G('shero',`<div class="k" style="font-size:13px;letter-spacing:.14em">${label(ST.season)} season</div>
  <div class="pills" style="margin-top:8px"><span class="pill live">Live campaign</span><span class="pill">${me.role==='youth'?'U18 League':esc(l.n)+' · '+ord(pos)}</span><span class="pill">Next: ${nx}</span></div>
  <div class="nm">${esc(me.name)}</div>
  <div class="idl">${esc(club(me.cl).name)} · ${pname(me)} · ${me.ht} cm · ${esc(archName(me))}${me.role==='youth'?' · Academy':''}</div>
  <div class="rec"><span class="no">#${shirt(me)}</span><div class="box">${kk(rc2)}<b>${t.w}-${t.d}-${t.l}</b>${kk(t.p+' pts · '+(t.gf-t.ga>0?'+':'')+(t.gf-t.ga)+' GD')}</div>${avgBox}${lastBox}</div>
  ${fm?`<div class="fchips">${kk('Form')} ${fm}</div>`:''}
  <div style="margin-top:14px"><div class="prog"><span>${lbl}</span><span>Matchday ${pl} / ${md} · ${pct}%</span></div><div class="track"><i style="width:${pct}%"></i></div></div>
  <div style="margin-top:12px">${kk('Training focus · switch any time')}<div style="margin-top:8px">${trainRow(me)}</div><div class="m" style="margin-top:8px">${esc(me.focus?fLabel(me.focus)+': '+fDir(me.focus):'Pick what to work on this season')}</div></div>
  <div class="actbar"><button class="btn xl" data-a="next">▶ Sim next match</button><button class="btn alt" data-a="blk">⏭ Sim to review</button><button class="btn alt sm" data-a="chunk" data-n="3">Sim 3</button><button class="btn alt sm" data-a="chunk" data-n="10">Sim 10</button><button class="btn alt sm" data-a="ssn">Skip season »</button></div>
  ${me.inj>0?`<div class="warn">Injured: about ${me.inj} more matchday${me.inj>1?'s':''} out.</div>`:''}${ST.note?`<div class="warn">${esc(ST.note)}</div>`:''}`);
}

function vCalendar(){
  const L=nextFixList(16);
  if(!L.length)return'';
  const tile=f=>{
    const comp=esc(f.c.split(' · ')[0]),oc=f.o!=null?club(f.o):null;
    const who=oc?`${f.h?'vs':'@'} ${esc(oc.name)}`:f.nat?'International duty':f.y?'Opponent TBD':'—';
    return`<div class="caltile"><span class="m sm">${comp}</span><b>${who}</b></div>`;
  };
  return G('pad s12 calrow',`${ico('📅','Upcoming fixtures')}<div class="calstrip">${L.map(tile).join('')}</div>`);
}
function vSeasonBdo(){
  const rows=race();
  if(!rows.length)return'';
  const mi=rows.findIndex(r=>r.me),show=rows.slice(0,8);
  if(mi>=8)show.push(rows[mi]);
  const top=rows[0]?rows[0].sc:1,w=r=>Math.exp((r.sc-top)/Math.max(2,Math.abs(top)*.18)),tot=show.reduce((s,r)=>s+w(r),0)||1;
  const row=r=>{
    const rank=rows.indexOf(r)+1,pct=Math.round(w(r)/tot*100),open=BDOX===rank;
    const st=open?clubCompStatus(r.c):null;
    return`<div class="tile ${r.me?'me':''}" style="margin-bottom:8px">
    <button class="row sp" data-a="bdox" data-v="${rank}" style="width:100%;background:none;border:none;cursor:pointer;color:inherit;text-align:left;padding:0">
      <div><span class="mono b">${rank}</span> &nbsp;<b>${r.me?esc(r.n)+' · YOU':esc(r.n)}</b> <span class="m sm">${esc(club(r.c).name)}</span></div>
      <div class="row" style="gap:8px"><b class="mono" style="font-size:20px">${pct}%</b><span class="m">${open?'▴':'▾'}</span></div>
    </button><div class="track mt"><i style="width:${pct}%"></i></div>
    ${open?`<div class="grid2 mt" style="grid-template-columns:repeat(3,1fr)"><div class="tile"><span class="k">Apps</span><b class="n">${r.ap||0}</b></div><div class="tile"><span class="k">Goals</span><b class="n">${r.g}</b></div><div class="tile"><span class="k">Assists</span><b class="n">${r.a}</b></div></div>
    <div class="m sm mt">${esc(club(r.c).name)}: ${ord(st.pos)} in ${esc(st.lgName)}${st.cupTxt?' · '+esc(st.cupTxt)+' of the '+esc(st.cupName):''}${st.eu?' · into the '+esc(st.eu):''}</div>`:''}</div>`;
  };
  return G('pad s12',`${ico('🏆',"Ballon d'Or race",'live')}${show.map(row).join('')}`);
}
function vStream(){
  const L=ST.mineLog.slice(-3).reverse(),r=ST.last,s=r&&r.st,me=ST.me;
  const rows=L.map(l=>{const w=l.gf>l.ga?'W':l.gf<l.ga?'L':'D',sub=l.m==='out'?'OUT':l.m==='dnp'?'UNUSED':[l.g?l.g+' G':'',l.a?l.a+' A':''].filter(Boolean).join(' · ')||l.mn+' MIN';
    return`<div class="res"><span class="wl ${w}">${w}</span><div class="g1"><div class="t">${l.h?'VS':'@'} ${esc(l.o)}</div>${kk(esc(l.c.split(' · ')[0])+' · '+sub)}</div><span class="sc">${l.gf} - ${l.ga}</span>${l.rt!=null?rb(l.rt):''}</div>`}).join('');
  const feat=s?`<div class="tile"><div class="row sp"><span class="k">Featured line: ${esc(r.h===club(me.cl).name||r.sd===0?'vs '+r.a:'@ '+r.h)}</span><span>${r.motm&&s.rating>=r.motm.r?'<span class="pill hot">★ '+s.rating.toFixed(1)+' Best on pitch</span>':rb(s.rating)} <span class="m">${r.min} min</span></span></div>
    <div class="stats4 mt"><div class="tile"><b>${s.g}</b>${kk('Goals')}</div><div class="tile"><b>${s.a}</b>${kk('Assists')}</div><div class="tile"><b>${s.kp}</b>${kk('Key passes')}</div><div class="tile"><b>${s.sh}</b>${kk('Shots')}</div></div>
    <div class="kv"><span>Passing</span><b>${s.pc}/${s.pa} completed</b></div><div class="kv"><span>Defending</span><b>${s.tk} tackles · ${s.ic} interceptions</b></div><div class="kv"><span>Dribbles</span><b>${s.dr} won</b></div></div>`:'';
  const all=ST.mineLog.slice(-25).reverse();
  return G('pad s6',`${ico('☰','Match stream','Last 3')}${rows||'<div class="empty">Play your first match.</div>'}${feat}
  <details class="dsc"><summary>▶ Full log: last ${all.length} matches</summary>${all.map(l=>`<div class="kv"><span>${l.h?'VS':'@'} ${esc(l.o)} · ${l.gf}-${l.ga}</span><b>${l.m==='out'||l.m==='dnp'?'-':(l.g||0)+' G · '+(l.a||0)+' A'} ${l.rt!=null?rb(l.rt):''}</b></div>`).join('')}</details>`);
}
function roleBadge(){
  const me=ST.me;if(me.role==='youth'||me.cl<0)return'<span class="pill tag">Academy</span>';
  const ps=selData().ps,b=ps>=.92?['Undisputed #1','hot']:ps>=.7?['Starter','good']:ps>=.3?['Rotation','']:['Reserve','bad'];
  return`<span class="pill tag ${b[1]}">${b[0]}</span>`;
}
function vCompRows(){
  const me=ST.me,c=club(me.cl),ss=me.ss,yth=me.role==='youth';
  const eu=ST.eu&&ST.eu.ucl.teams.includes(me.cl)?'Champions League':ST.eu&&ST.eu.uel.teams.includes(me.cl)?'Europa League':'European competition';
  const defs=yth?[['yth','U18 League','🎓']]:[['lg',LGN[c.lg].n,'🏆'],['cup',LGN[c.lg].cup,'🥇'],['eu',eu,'★']];
  const rows=defs.map(([k,n,i])=>({n,i,s:ss[k]||{}})).filter(r=>(r.s.ap||0)>0);
  if(!yth&&ss.nat&&ss.nat.ap)rows.push({n:me.nat+' · national team',i:'🌍',s:ss.nat,intl:1});
  const club_=rows.filter(r=>!r.intl),T=k=>club_.reduce((a,r)=>a+(r.s[k]||0),0),rn=T('rn'),rt=rn?T('rs')/rn:null;
  const rate=s=>s.rn?rb(s.rs/s.rn):'<span class="m">-</span>';
  const line=(r)=>`<div class="crow"><span class="nm"><span class="i">${r.i}</span><span>${esc(r.n)}</span></span><span class="n">${r.s.ap||0}</span><span class="n">${r.s.mn||0}</span><span class="n">${r.s.g||0}</span><span class="n">${r.s.a||0}</span><span class="r">${rate(r.s)}</span></div>`;
  return`<div class="tile mt"><div class="crow h"><span>${label(ST.season)} · ${esc(c.name)}${yth?' U18':''}</span><span class="r">Apps</span><span class="r">Mins</span><span class="r">G</span><span class="r">A</span><span class="r">Rtg</span></div>
  <div class="crow t"><span class="nm"><span class="i">Σ</span><span>All club competitions</span></span><span class="n">${T('ap')}</span><span class="n">${T('mn')}</span><span class="n">${T('g')}</span><span class="n">${T('a')}</span><span class="r">${rt!=null?rb(rt):'<span class="m">-</span>'}</span></div>
  ${rows.map(line).join('')||'<div class="m sm" style="padding:10px 6px">No matches played yet.</div>'}</div>`;
}
function vAverages(){
  const me=ST.me,ss=me.ss,S=k=>me.role==='youth'?((ss.yth&&ss.yth[k])||0):clubSS(me,k),ap=S('ap'),g=S('g'),a=S('a'),rn=S('rn'),rs=S('rs'),mn=S('mn'),p90=x=>mn?(x/mn*90).toFixed(2):'0.00',log=ST.mineLog.filter(l=>l.rt!=null),last=me.rows[me.rows.length-1];
  const avg=rn?rs/rn:0,dl=last&&last.avg&&avg?avg-last.avg:null,arrow=d=>d==null?'':`<span class="dl ${d>=0?'up':'dn'}">${d>=0?'↗ +':'↘ '}${d.toFixed(2)}</span>`;
  const cum=k=>{let c=0;return log.map(l=>c+=l[k]||0)};
  const tile=(k,n,sub,sp,extra,badge)=>`<div class="stile">${kk(k)}${badge||''}<span class="n">${n}${extra||''}</span><span class="m">${sub}</span>${sp||''}</div>`;
  const kl=keysOf(me),A=me.gd||me.attr;
  return G('pad s6',`${ico('⚽','Season averages','Per match')}<div class="grid2">
  ${tile('Goals',g,ap+' games · '+p90(g)+' per 90',lspark(cum('g'),200,46),last&&last.ap?`<span class="dl m">${last.g} last yr</span>`:'')}
  ${tile('Assists',a,ap+' games · '+p90(a)+' per 90',lspark(cum('a'),200,46),last&&last.ap?`<span class="dl m">${last.a} last yr</span>`:'')}
  ${tile('Avg rating',avg?avg.toFixed(2):'-',log.length+' rated games',lspark(log.map(l=>l.rt),200,46),arrow(dl))}
  ${tile('Minutes / game',ap?Math.round(mn/ap):0,S('st')+' starts · '+ap+' apps · '+mn+' min',lspark(log.map(l=>l.mn||0),200,46),'',roleBadge())}</div>
  ${vCompRows()}
  <div class="tile mt"><div class="row sp"><span class="k">Attributes</span><span class="k">${esc(String(me.tier))}</span></div><div class="bars">${kl.map(k=>`<div class="br"><span>${KL[k]}</span><div class="track"><i style="width:${A[k]}%"></i></div><b>${A[k]}</b></div>`).join('')}</div></div>
  <div class="row mt wr"><span class="pill">Pass accuracy ${S('pa')?Math.round(S('pc')/S('pa')*100)+'%':'-'}</span><span class="pill">Shots ${S('sh')}</span><span class="pill">Key passes ${S('kp')}</span><span class="pill">xG ${(+S('xg')).toFixed(1)}</span></div>`);
}
function vWire(){
  const ic={hat:'⚽',big:'🔥',me:'★',inj:'✚',tr:'💸',mg:'🪑'},mc=club(ST.me.cl),n=(ST.news||[]).slice(0,5),t=table(mc.lg),p=posOf(mc);
  return G('pad s6',`${ico('📡','League wire','after '+(mc.t.w+mc.t.d+mc.t.l)+' games')}${n.map(x=>`<div class="nrow"><span>${ic[x.k]||'•'}</span><span>${esc(x.t)}</span></div>`).join('')}
  <div class="nrow"><span>🥇</span><span>${esc(t[0].name)} lead the ${esc(LGN[mc.lg].n)} on ${t[0].t.p} points.</span></div><div class="nrow"><span>📍</span><b>You are ${ord(p)} in the ${esc(LGN[mc.lg].n)} (${mc.t.w}-${mc.t.d}-${mc.t.l}).</b></div>`);
}
function careerTotals(){
  const me=ST.me,rs=me.rows.filter(r=>!r.youth),done=ST.pend&&ST.pend.t==='season',cur=k=>done?0:clubSS(me,k);
  return{g:rs.reduce((s,r)=>s+(r.g||0),0)+cur('g'),a:rs.reduce((s,r)=>s+(r.a||0),0)+cur('a'),ap:rs.reduce((s,r)=>s+(r.ap||0),0)+cur('ap'),seasons:rs.length};
}
function narrative(){
  const me=ST.me,bd=me.aw.filter(a=>a.t==="Ballon d'Or").length,hon=me.hon.length,rs=me.rows.filter(r=>!r.youth&&r.avg),avg=rs.length?rs.reduce((s,r)=>s+r.avg,0)/rs.length:null;
  if(bd>=3)return['An era-defining legend',"Ballon d'Or winner several times over: the game is measured against you."];
  if(bd>=1)return["Ballon d'Or winner",'The best player in the world, for one year at least.'];
  if(me.peak>=88&&hon>=3)return['World class','Elite and decorated, but the very top prizes are still to come.'];
  if(me.ovr>=80)return['An established star','A big name in the league, though not yet a household one.'];
  if(me.ovr>=72)return['A solid professional','Dependable, but nobody is writing about you yet.'];
  if(me.ovr>=65)return['A squad player','Fighting for minutes. The league has not noticed you.'];
  return me.age<19?['A prospect','Still developing. Nothing is expected of you yet.']:['On the fringes','Few people outside the club know your name.'];
}
function vWatch(){
  const me=ST.me,T=careerTotals(),bd=me.aw.filter(a=>a.t==="Ballon d'Or").length,nr=narrative();
  return G('pad s12',`${ico('📈','History watch')}<div class="quote"><b>The narrative: “${nr[0]}”</b><br><span class="m">${nr[1]}</span></div>
  <div class="grid2 mt"><div class="kv"><span>Senior goals</span><b>${T.g}</b></div><div class="kv"><span>Senior assists</span><b>${T.a}</b></div><div class="kv"><span>Senior appearances</span><b>${T.ap}</b></div><div class="kv"><span>Seasons as a pro</span><b>${T.seasons+(me.role==='youth'?0:1)}</b></div>
  <div class="kv"><span>Honours</span><b>${me.hon.length}</b></div><div class="kv"><span>Ballon d'Or</span><b>${bd}</b></div><div class="kv"><span>Caps / goals</span><b>${me.caps} / ${me.ig}</b></div><div class="kv"><span>Peak rating</span><b>${me.peak}</b></div></div>`);
}

function vH2H(){
  const me=ST.me;if(me.role==='youth'||me.cl<0)return G('pad s12',`${ico('⚔','Competition for my place')}<div class="m">You are in the academy side. Once you join the first team, the players you compete with appear here.</div>`);
  const sd=selData(),f2=x=>x==null?'-':x.toFixed(2),rows=sd.rows.slice(0,sd.k+2),m=sd.me,ps=Math.round(sd.ps*100);
  const beat=r=>[m.ovr>r.ovr,(m.avg||0)>(r.avg||0),m.ga>r.ga].filter(Boolean).length;
  const need=sd.margin>=0?`You are ahead of the shirt by ${sd.margin.toFixed(1)} points.`:`You need ${(-sd.margin).toFixed(1)} more selection points to win a starting place.`;
  return G('pad s12',`${ico('⚔','Competition for my place',pname(me))}
  <div class="grid2" style="grid-template-columns:repeat(3,1fr)"><div class="tile">${kk('Chance to start')}<b class="n">${ps}%</b></div><div class="tile">${kk('Minutes per game')}<b class="n">${m.ap?Math.round(m.mn/m.ap):0}</b></div><div class="tile">${kk('Starts / games played')}<b class="n">${m.st}/${m.ap}</b></div></div>
  <div class="quote mt"><b>${need}</b><br><span class="m">The manager picks on form as well as ability: ${ST.me.role==='starter'?'you are first choice':ST.me.role==='rotation'?'you are in the rotation':'you are on the bench'}. A better average rating or more goal involvements than the player in front wins you minutes.</span></div>
  <div style="overflow-x:auto" class="mt"><table class="tb"><tr><th>Player</th><th class="r">Age</th><th class="r">OVR</th><th class="r">Avg rating</th><th class="r">G+A / game</th><th class="r">Apps</th><th class="r">Sel.</th><th class="r">You win</th></tr>
  <tr class="me"><td>${esc(me.name)} · YOU</td><td class="r">${me.age}</td><td class="r">${m.ovr}</td><td class="r">${m.avg?rb(m.avg):'-'}</td><td class="r">${f2(m.ga)}</td><td class="r">${m.ap}</td><td class="r">${sd.mySel.toFixed(1)}</td><td></td></tr>
  ${rows.map((r,i)=>`<tr><td>${plink(r.p)}${i<sd.k?' <span class="pill">Starter</span>':''}</td><td class="r">${r.p.age}</td><td class="r">${r.ovr}</td><td class="r">${r.avg?rb(r.avg):'-'}</td><td class="r">${f2(r.ga)}</td><td class="r">${r.ap}</td><td class="r">${r.sel.toFixed(1)}</td><td class="r">${beat(r)} of 3</td></tr>`).join('')}</table></div>
  <div class="m sm mt">Selection score = overall rating, plus form (average rating and goal involvements, counted more as the season goes on), plus the manager's trust in you. Incumbents get a small bonus.</div>`);
}
const DTABS=[['games','⚽ Games'],['stats','📊 Stats'],['squad','⚔ My place'],['league','🌎 League'],['inbox','📥 Inbox'],['hist','📜 History']];
function vHome(){
  const u=unread(),dash=seg(DTABS,DT,'dt',{inbox:u});
  const B={games:()=>vStream()+vAverages(),stats:()=>vProfile()+vShotMap()+vImpact(),squad:()=>vH2H()+vLeaders(),league:()=>vObjective()+vSnap()+vWire(),inbox:()=>`<div class="s12">${vInbox()}</div>`,hist:()=>vWatch()+vHofCard()};
  return`<div class="g12"><div class="s12">${vSeasonHero()}</div><div class="s12">${vCalendar()}</div><div class="s12">${vSeasonBdo()}</div><div class="s12">${vMatchCenter()}</div><div class="s12" style="display:flex;justify-content:center;overflow-x:auto">${dash}</div>${(B[DT]||B.games)()}</div>`;
}
function vImpact(){
  const me=ST.me,ss=me.ss,ap=Math.max(1,clubSS(me,'ap')),A=me.attr,kl=keysOf(me),sh=clubSS(me,'sh');
  const pt=(k,v,sub)=>`<div class="stile">${kk(k)}<span class="n">${v}</span><span class="m">${sub}</span></div>`;
  return G('pad s12',`${ico('🛡','Performance profile','Per game')}<div class="grid2" style="grid-template-columns:repeat(3,1fr)">${pt('Shots',(sh/ap).toFixed(1),sh+' total')}${pt('Key passes',(clubSS(me,'kp')/ap).toFixed(1),clubSS(me,'kp')+' total')}${pt('Pass accuracy',clubSS(me,'pa')?Math.round(clubSS(me,'pc')/clubSS(me,'pa')*100)+'%':'-',clubSS(me,'pc')+'/'+clubSS(me,'pa'))}${pt('xG',(+clubSS(me,'xg')).toFixed(1),'vs '+clubSS(me,'g')+' goals')}${pt('xA',(+clubSS(me,'xa')).toFixed(1),'vs '+clubSS(me,'a')+' assists')}${pt('Clean sheets',clubSS(me,'cs'),'team, when you play')}</div>`);
}
function vHofCard(){
  return G('pad s12',`${ico('🏆','Past seasons across Europe')}${ST.hof.length?`<div style="overflow-x:auto"><table class="tb"><tr><th></th><th>Champions League</th><th>Europa League</th><th>Ballon d'Or</th></tr>${ST.hof.slice().reverse().map(h=>`<tr><td>${h.s}</td><td>${esc(h.ucl)}</td><td>${esc(h.uel)}</td><td class="${h.bdo.me?'b':''}">${esc(h.bdo.n)} <span class="m">${esc(h.bdo.c)}</span></td></tr>`).join('')}</table></div>`:'<div class="m sm">History builds season by season.</div>'}`);
}

let SMF='all';
function shotPts(){
  const me=ST.me,ss=me.ss,sh=Math.max(clubSS(me,'sh'),clubSS(me,'g')),g=clubSS(me,'g'),hd=({ST:.22,W:.1,AM:.07,CM:.07,DM:.08,FB:.06,CB:.3,GK:0})[me.pos]||.1,R0=R(ST.seed+'|sm|'+ST.season+'|'+me.cl),n=Math.min(sh,260);
  const last=ST.last&&ST.last.st?Math.min(ST.last.st.sh,n):0,pts=[];
  for(let i=0;i<n;i++){
    const head=R0.chance(hd),inb=head||R0.chance(me.pos==='ST'?.72:me.pos==='W'?.5:.38);
    let x=inb?50+R0.norm(0,head?7:9):50+R0.norm(0,19),y=inb?(head?R0.int(3,11):R0.int(3,16)):R0.int(18,36);
    x=inb?clamp(x,26,74):clamp(x,6,94);
    const b=y<=17&&x>=22&&x<=78;                       // the 18-yard box on this drawing
    pts.push({x,y,h:head&&b,b,g:0,l:i>=n-last});
  }
  let need=Math.min(g,n);const ix=pts.map((p,i)=>i).sort((a,b)=>(pts[a].b?0:1)-(pts[b].b?0:1)||R0.r()-.5);
  for(const i of ix){if(need<=0)break;if(R0.chance(pts[i].b?.9:.35)){pts[i].g=1;need--}}
  for(const i of ix){if(need<=0)break;if(!pts[i].g){pts[i].g=1;need--}}
  return pts;
}
function vShotMap(){
  const pts=shotPts(),F=SMF,fl=p=>F==='all'||(F==='box'&&p.b&&!p.h)||(F==='out'&&!p.b)||(F==='head'&&p.h),pct=f=>{const a=pts.filter(f);return a.length?(a.filter(p=>p.g).length/a.length*100).toFixed(1)+'%':'-'};
  const sel=pts.filter(fl),mk=sel.filter(p=>p.g).length;
  const dots=sel.map(p=>{const c=p.l?'#ffd166':'#fff';return p.g?`<circle cx="${p.x}" cy="${p.y}" r="1.7" fill="${c}"/>`:`<path d="M${p.x-1.2} ${p.y-1.2}l2.4 2.4m0-2.4l-2.4 2.4" stroke="${p.l?'#ffd166':'#8e97a6'}" stroke-width=".7"/>`}).join('');
  return G('pad s12',`${ico('◎','Shot map','Simulated from your season stats')}<div class="row wr" style="justify-content:space-between">${seg([['all','All '+pct(()=>1)],['box','Box '+pct(p=>p.b&&!p.h)],['out','Outside '+pct(p=>!p.b)],['head','Headers '+pct(p=>p.h)]],F,'smf')}<span class="k">${pts.length} shots · ${pts.filter(p=>p.g).length} goals</span></div>
  <div style="max-width:560px;margin:14px auto 0"><svg viewBox="0 0 100 62" style="width:100%;border-radius:18px;background:#0b1a14;border:1px solid rgba(255,255,255,.1)"><g fill="none" stroke="rgba(255,255,255,.28)" stroke-width=".45"><rect x="1" y="1" width="98" height="60"/><rect x="22" y="1" width="56" height="17"/><rect x="38" y="1" width="24" height="6"/><path d="M38 18a12 12 0 0 0 24 0"/><path d="M1 61a8 8 0 0 0 8-8"/><path d="M99 61a8 8 0 0 1-8-8"/></g>${dots}</svg></div>
  <div class="row mt wr" style="justify-content:space-between"><span class="k"><span style="color:#fff">●</span> goal · <span>✕</span> no goal · <span style="color:#ffd166">●</span> last match</span><b class="big" style="font-size:30px">${sel.length?Math.round(mk/sel.length*1000)/10:0}% conversion</b></div>`);
}

/* ---------- rating breakdown (see 32-breakdown.js) ---------- */
// a centred bar: green/yellow to the right, orange/red to the left, full width at three typical spreads
const bkBar=z=>{const w=Math.min(1,Math.abs(z)/3)*50;return`<div class="bkbar"><i class="${bkCls(z)}" style="${z>=0?'left:50%':'right:50%'};width:${w}%"></i></div>`};
const sgn=v=>(v>=0?'+':'')+v.toFixed(2);
// one match: the four bars, then how the rating adds up from 6.5
function vBk(pos,bd,rating){
  if(!bd)return'';
  const cats=bkCats(pos),sum=bd.c.reduce((a,b)=>a+b,0);
  return`<h3 class="mt">Rating breakdown</h3><div class="bkhead"><span class="m sm">Every rating starts at 6.5</span><span class="mono sm">impact on this match</span></div>
  ${cats.map(([lab],i)=>{const z=bkZg(pos,i,bd.c[i]);return`<div class="bkrow"><span class="nm">${lab}</span>${bkBar(z)}</div>`}).join('')}
  <details class="dsc"><summary>How it adds up</summary><div class="kv"><span>Base</span><b class="mono">6.50</b></div><div class="kv"><span>A typical ${esc(POSN[pos].toLowerCase())} match (minutes and involvement)</span><b class="mono">${sgn(bd.t)}</b></div>
  ${cats.map(([lab],i)=>`<div class="kv"><span>${lab}</span><b class="mono" style="color:var(--${bd.c[i]>=.05?'good':bd.c[i]<=-.05?'badc':'tx'})">${sgn(bd.c[i])}</b></div>`).join('')}
  <div class="kv"><span>Team result</span><b class="mono">${sgn(bd.x)}</b></div><div class="kv"><span>Style and match feel</span><b class="mono">${sgn(bd.o)}</b></div>
  <div class="kv"><span><b>Rating</b>${Math.abs(6.5+bd.t+sum+bd.x+bd.o-rating)>.06?' (kept between 3 and 10)':''}</span>${rb(rating)}</div></details><div class="m sm mt">Compared with an average game at your position. Ratings come from a model fitted on 91,000 real player-matches.</div>`;
}
// the average game: this role's average impact per category, a colour strip of recent games, and how each role he has played compares
function vProfile(){
  const me=ST.me,pos=me.pos,cats=bkCats(pos),cur=(me.bkr||{})[me.arch+'|'+pos],log=(ST.mineLog||[]).filter(l=>l.bd&&l.bd.length===cats.length).slice(-20);
  if(!cur&&!log.length)return G('pad s12',`${ico('🎨','Your average game','by category')}<div class="m">Play a few matches and this shows what your games are made of: how often shooting, passing, dribbling and defending lift your rating, and how that changes if you reinvent yourself.</div>`);
  const rows=cats.map(([lab],i)=>{
    const avg=cur?cur.sum[i]/cur.n:0,z=bkZ(pos,i,avg),gp=cur?Math.round(cur.g[i]/cur.n*100):0,rp=cur?Math.round(cur.r[i]/cur.n*100):0;
    const strip=log.map(l=>`<i class="${bkCls(bkZg(pos,i,l.bd[i]))}" title="${esc(l.c.split(' · ')[0])} vs ${esc(l.o)}: ${sgn(l.bd[i])}"></i>`).join('');
    return`<div class="bkrow"><span class="nm">${lab}</span>${bkBar(z)}<b class="mono sm" style="width:46px;text-align:right">${sgn(avg)}</b></div>
    <div class="bkmeta"><div class="bkstrip">${strip}</div><span class="m sm">${gp}% green · ${rp}% below par</span></div>`}).join('');
  // other roles he has played, newest last
  const roles=Object.values(me.bkr||{}).filter(o=>o.n>=3&&bkCats(o.pos).length===cats.length);
  const cmp=roles.length>=2?`<h3 class="mt">How reinventing changed your game</h3><div style="overflow-x:auto"><table class="tb"><tr><th></th>${roles.map(o=>`<th class="r">${esc(o.arch)}<br><span class="m sm">${o.n} games</span></th>`).join('')}<th class="r">Change</th></tr>
    ${cats.map(([lab],i)=>{const zs=roles.map(o=>bkZ(o.pos,i,o.sum[i]/o.n)),d=zs[zs.length-1]-zs[zs.length-2];
      return`<tr><td>${lab}</td>${roles.map((o,k)=>`<td class="r"><span class="rb ${bkCls(zs[k])}">${sgn(o.sum[i]/o.n)}</span> <span class="m sm">${Math.round(o.g[i]/o.n*100)}%</span></td>`).join('')}<td class="r"><b style="color:var(--${d>.15?'good':d<-.15?'badc':'tx'})">${d>.15?'▲':d<-.15?'▼':'–'} ${Math.abs(d).toFixed(1)}</b></td></tr>`}).join('')}</table></div><div class="m sm mt">Average impact per game, and the share of games where the category was worth 7.0+ on its own. Change is in typical spreads between your last two roles.</div>`:'';
  return G('pad s12',`${ico('🎨','Your average game',esc(me.arch)+' · '+(cur?cur.n:0)+' games')}<div class="bkhead"><span class="m sm">Each square is one match, newest on the right</span><span class="mono sm">average impact</span></div>${rows}${cmp}`);
}
