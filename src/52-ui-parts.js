/* Reusable UI pieces: links, charts, objectives, squad tables, player and club cards, search. */
let CT='squad',LT='table',SORT={k:'roleN',d:1},PF='all',MSEL=0,MT='over',RMD=null,MCMIN=false,BDOX=-1;
const GRP={all:null,GK:['GK'],DEF:['CB','FB'],MID:['DM','CM','AM'],ATT:['W','ST']};
const SLOTXY=[[50,90],[36,74],[64,74],[11,67],[89,67],[37,56],[63,56],[50,39],[14,31],[86,31],[50,14]];   // GK CB CB FB FB DM CM AM W W ST on a 4-2-3-1
const f1=x=>x==null?'-':(+x).toFixed(1);
const plink=(p,txt)=>p&&p.me?`<b>${esc(p.n)}</b> <span class="pill hot">YOU</span>`:p&&typeof p.id==='number'?`<a class="lk" data-a="pcard" data-v="${p.id}">${esc(txt||p.n)}</a>`:esc(txt||(p?p.n:''));
const clink=(c,txt)=>`<a class="lk" data-a="ccard" data-v="${c.id}">${esc(txt||c.name)}</a>`;

/* ---- season state helpers ---- */
function curWeek(){let w=0;for(const lg in ST.res)for(const k in ST.res[lg])w=Math.max(w,+k);return w}
const leagueRes=(lg,w)=>(ST.res&&ST.res[lg]&&ST.res[lg][w])||[];
function clubResults(id,n){const c=club(id),out=[];for(let w=curWeek();w>=1&&out.length<n;w--){const m=leagueRes(c.lg,w).find(x=>x[0]===id||x[1]===id);if(m)out.push({w,h:m[0],a:m[1],hg:m[2],ag:m[3]})}return out}
function clubUpcoming(id,n){const c=club(id),out=[],md=LGN[c.lg].md,fx=fixtures(c.lg);for(let w=curWeek()+1;w<=md&&out.length<n;w++){const m=fx[w-1].find(x=>x[0]===id||x[1]===id);if(m)out.push({w,h:m[0],a:m[1]})}return out}
// what the board expects this season, from the club's strength rank in its division
// the XI the manager would pick: best at each slot, with the user slotted in when he'd play
function projXI(c){
  const bp=byPos(c),used={},xi=SLOTS.map(pos=>{const k=used[pos]=used[pos]||0;used[pos]++;const p=(bp[pos]||[])[k];return p?{p,pos}:null});
  const me=ST.me;
  if(me.cl===c.id&&me.role!=='youth'&&me.inj<=0){
    let bi=-1;xi.forEach((x,i)=>{if(x&&x.pos===me.pos&&(bi<0||x.p.ovr<xi[bi].p.ovr))bi=i});
    if(bi>=0&&(me.role==='starter'||me.ovr>xi[bi].p.ovr))xi[bi]={p:me.p,pos:me.pos,me:1};
  }
  return xi;
}
function oppPreview(oc){
  const ps=oc.sq.map(id=>ST.W.pl[id]),n=Math.max(1,oc.t.w+oc.t.d+oc.t.l),top=ps.slice().sort((a,b)=>b.g-a.g||b.a-a.a)[0],best=ps.filter(p=>p.ap>=3).sort((a,b)=>b.rs/b.ap-a.rs/a.ap)[0];
  const last=(ST.res&&ST.res[oc.lg])?Object.values(ST.res[oc.lg]).flat().find(m=>(m[0]===ST.me.cl&&m[1]===oc.id)||(m[1]===ST.me.cl&&m[0]===oc.id)):null;
  return{top,best,gf:oc.t.gf/n,ga:oc.t.ga/n,last};
}

/* ---- charts ---- */
function spark(v,w,h){
  if(v.length<2)return'<span class="m sm">not enough games</span>';
  const lo=5.5,hi=9,x=i=>i/(v.length-1)*(w-8)+4,y=r=>h-4-(clamp(r,lo,hi)-lo)/(hi-lo)*(h-8);
  return`<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><line x1="0" x2="${w}" y1="${y(RAVG).toFixed(1)}" y2="${y(RAVG).toFixed(1)}" stroke="currentColor" stroke-opacity=".2" stroke-dasharray="3 3"/><polyline fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" points="${v.map((r,i)=>x(i).toFixed(1)+','+y(r).toFixed(1)).join(' ')}"/>${v.map((r,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(r).toFixed(1)}" r="2.3" fill="currentColor"/>`).join('')}</svg>`;
}
function pitchXI(xi){
  const sd=x=>x.me?ST.me.sd:x.p.sd;   // the left-sided winger / full-back takes the left flank
  for(const[a,b,pos]of[[3,4,'FB'],[8,9,'W']])if(xi[a]&&xi[b]&&xi[a].pos===pos&&xi[b].pos===pos&&sd(xi[a])==='R'&&sd(xi[b])==='L'){xi=xi.slice();[xi[a],xi[b]]=[xi[b],xi[a]]}
  return`<div class="xi">${xi.map((x,i)=>x?`<div class="pl${x.me?' me':''}" style="left:${SLOTXY[i][0]}%;top:${SLOTXY[i][1]}%"><b>${x.p.ovr}</b><span>${x.me?esc(ST.me.name.split(' ').pop()):plink(x.p,x.p.n.split(' ').pop())}</span><em class="pp-l">${x.me?plab(ST.me):plab(x.p)}</em></div>`:'').join('')}</div>`;
}

/* ---- squad table (sortable, filterable) ---- */
function squadRows(c){
  const BP=byPos(c),rows=c.sq.map(id=>ST.W.pl[id]).map(p=>{const L=BP[p.pos]||[],rk=L.findIndex(x=>x.id===p.id)+1,k=NSL[p.pos],rn=rk<=k?0:rk<=k+1?1:2;return{id:p.id,pl:p,roleN:rn,pos:p.pos,n:p.n,age:p.age,ovr:p.ovr,ap:p.ap,g:p.g,a:p.a,avg:p.ap?p.rs/p.ap:0,val:valueFor(p.ovr,p.age,p.pa,c),nat:p.nat}});
  const me=ST.me;
  if(me.cl===c.id&&me.role!=='youth'){const ss=me.ss;rows.push({me:1,roleN:me.role==='starter'?0:me.role==='rotation'?1:2,pos:me.pos,sd:me.sd,n:me.name,age:me.age,ovr:me.ovr,ap:sumSS(ss,'ap'),g:sumSS(ss,'g'),a:sumSS(ss,'a'),avg:sumSS(ss,'rn')?sumSS(ss,'rs')/sumSS(ss,'rn'):0,val:mval(),nat:me.nat})}
  return rows;
}
function squadTable(c,limit){
  let rows=squadRows(c);const g=GRP[PF];if(g)rows=rows.filter(r=>g.includes(r.pos));
  const k=SORT.k,d=SORT.d;rows.sort((a,b)=>(typeof a[k]==='string'?a[k].localeCompare(b[k]):a[k]-b[k])*d||b.ovr-a.ovr);
  if(limit)rows=rows.slice(0,limit);
  const th=(key,lab,cls)=>`<th class="${cls||''} srt ${SORT.k===key?'on':''}" data-a="sort" data-v="${key}">${lab}${SORT.k===key?(SORT.d>0?' ▲':' ▼'):''}</th>`;
  return`<div class="row wr" style="margin-bottom:10px">${Object.keys(GRP).map(k=>`<button class="chipb ${PF===k?'on':''}" data-a="pf" data-v="${k}">${k==='all'?'All':k}</button>`).join('')}</div>
  <div style="overflow-x:auto"><table class="tb">${'<tr>'+th('roleN','Role')+th('pos','Pos')+th('n','Player')+th('age','Age','r')+th('ovr','OVR','r')+th('ap','Apps','r')+th('g','G','r')+th('a','A','r')+th('avg','Avg','r')+th('val','Value','r')+'</tr>'}
  ${rows.map((r,i)=>(SORT.k==='roleN'&&(i===0||rows[i-1].roleN!==r.roleN)?`<tr class="grp"><td colspan="10">${['Starters','Rotation','Bench / squad'][r.roleN]}</td></tr>`:'')+`<tr class="${r.me?'me':''}"><td class="m">${['Starter','Rotation','Bench'][r.roleN]}</td><td><span class="pos ${r.pos}">${plab(r.pl||r)}</span></td><td>${r.me?'<b>'+esc(r.n)+'</b> <span class="pill hot">YOU</span>':plink(r.pl)}</td><td class="r">${r.age}</td><td class="r b">${r.ovr}</td><td class="r">${r.ap}</td><td class="r">${r.g}</td><td class="r">${r.a}</td><td class="r">${r.ap?rb(r.avg):'<span class="m">-</span>'}</td><td class="r m">${euro(r.val)}</td></tr>`).join('')}</table></div>`;
}

/* ---- player and club cards (open anywhere from a name) ---- */
const wrapM=h=>`<div class="modal"><section class="glass wide"><button class="btn alt sm mclose" data-a="closem">Close ✕</button>${h}</section></div>`;
// another player's attributes: style, height and build, then the six groups opening to their sub-attributes, with the difference to your own player
function vPAttrs(p){
  const a=attrsFor(p),me=ST.me,cmp=a.sub&&me.sub&&me.pos!=='GK';
  const diff=(v,mine)=>cmp?`<span class="m sm" style="width:34px;text-align:right;color:${mine-v>0?'#86f2bd':mine-v<0?'#ff9a9a':'inherit'}" title="You minus him">${mine-v>0?'+':''}${mine-v}</span>`:'';
  const head=`<div class="row sp wr">${kk('Attributes')}<span class="m sm">${esc(a.arch||'')} · ${a.ht} cm · ${a.frame}</span></div>`;
  if(!a.sub)return`<div class="tile mt">${head}<div class="mt">${GKK.map(k=>`<div class="row" style="margin:7px 0"><span style="width:88px" class="sm">${KL[k]}</span><div class="bar g1"><i style="width:${a.A[k]}%"></i></div><b class="mono" style="width:26px;text-align:right">${a.A[k]}</b></div>`).join('')}</div></div>`;
  return`<div class="tile mt">${head}<div class="mt">${GROUPS.map(([k,l])=>`<details class="atg"><summary><span style="width:88px" class="sm">${KL[k]}</span><div class="bar g1"><i style="width:${a.gd[k]}%"></i></div><b class="mono" style="width:26px;text-align:right">${a.gd[k]}</b>${diff(a.gd[k],me.gd?me.gd[k]:a.gd[k])}</summary>${l.map(j=>`<div class="sa"><span class="nm">${SL[j]}</span><div class="bar g1"><i style="width:${a.sub[j]}%"></i></div><b class="mono" style="width:26px;text-align:right">${a.sub[j]}</b>${diff(a.sub[j],cmp?me.sub[j]:null)}</div>`).join('')}</details>`).join('')}</div>${cmp?'<div class="m sm mt">Green: you are ahead. Red: he is ahead.</div>':''}</div>`;
}
function vPCard(id){
  const p=ST.W.pl[id];if(!p||p.cl<0)return`<h1>Retired</h1><p class="m">This player is no longer active.</p>`;
  const c=club(p.cl),me=ST.me,L=byPos(c)[p.pos]||[],rank=L.findIndex(x=>x.id===p.id)+1,k=NSL[p.pos],role=rank<=k?'Starter':rank<=k+1?'Rotation':'Squad player';
  const avg=p.ap?p.rs/p.ap:0,z=p.pf,verd=z==null?'':z>=1?'a clear overperformer':z>=.4?'ahead of his position':z>-.4?'in line with his position':z>-1?'a little below his position':'well below his position';
  return`<div class="row" style="gap:16px"><div class="ovr-ring" style="--p:${p.ovr}"><b>${p.ovr}</b></div><div><h1 style="margin:0">${esc(p.n)}</h1>${kk(pname(p)+' · '+p.age+' years · '+esc(p.nat||''))}<div class="mt">${clink(c)} <span class="pill">${role}</span></div></div></div>
  <div class="grid mt2"><div class="tile">${kk('Apps')}<b class="n">${p.ap}</b></div><div class="tile">${kk('Goals')}<b class="n">${p.g}</b></div><div class="tile">${kk('Assists')}<b class="n">${p.a}</b></div><div class="tile">${kk('Avg rating')}<b class="n">${p.ap?avg.toFixed(2):'-'}</b></div><div class="tile">${kk('Value')}<b class="n">${euro(valueFor(p.ovr,p.age,p.pa,c))}</b></div></div>
  ${statLine(p)}
  ${vPAttrs(p)}
  ${p.gs!=null?`<div class="tile mt"><h3>Evidence from recent seasons</h3><div class="row sp sm"><span>Share of his team's goals while on the pitch</span><b class="mono">${Math.round(p.gs*100)}%</b></div><div class="row sp sm"><span>Share of assists</span><b class="mono">${Math.round(p.asr*100)}%</b></div>${z!=null?`<div class="row sp sm"><span>Performance against his position</span><b>${verd}</b></div>`:''}</div>`:''}
  <div class="tile mt"><div class="row sp"><span>You (${me.ovr})</span><b class="mono">${me.ovr-p.ovr>=0?'+':''}${me.ovr-p.ovr} OVR</b><span>${esc(p.n.split(' ').pop())} (${p.ovr})</span></div></div>`;
}
function vCCard(id){
  const c=club(id),l=LGN[c.lg],pos=posOf(c),n=Math.max(1,c.t.w+c.t.d+c.t.l),xi=projXI(c),ps=c.sq.map(x=>ST.W.pl[x]),res=clubResults(id,5),up=clubUpcoming(id,3),goal=boardGoal(c);
  const top=(key)=>ps.slice().sort((a,b)=>b[key]-a[key])[0];
  const rl=r=>{const home=r.h===id,opp=club(home?r.a:r.h),gf=home?r.hg:r.ag,ga=home?r.ag:r.hg;return`<div class="lrow"><span class="pill ${gf>ga?'good':gf<ga?'bad':''}">${gf>ga?'W':gf<ga?'L':'D'}</span><span class="g1">${home?'vs':'at'} ${clink(opp)}</span><b class="mono">${gf}–${ga}</b></div>`};
  return`<div class="row" style="gap:14px">${crestN(c.name,'lg')}<div><h1 style="margin:0">${esc(c.name)}</h1>${kk(esc(l.n)+' · '+esc(c.mgr||'manager unknown'))}<div class="mt">${dots(c.f)}</div></div></div>
  <div class="grid mt2"><div class="tile">${kk('Position')}<b class="n">${ord(pos)}</b></div><div class="tile">${kk('Points')}<b class="n">${c.t.p}</b></div><div class="tile">${kk('Record')}<b class="n" style="font-size:19px">${c.t.w}-${c.t.d}-${c.t.l}</b></div><div class="tile">${kk('Goals')}<b class="n" style="font-size:19px">${c.t.gf}:${c.t.ga}</b></div><div class="tile">${kk('Strength')}<b class="n">${Math.round(c.base)}</b></div></div>
  <div class="g12 mt"><div class="s6"><h3>Probable XI</h3>${pitchXI(xi)}</div><div class="s6"><h3>Board expects</h3><div class="tile sm">${goal.t}</div>
  ${ps.some(p=>p.g)?`<h3 class="mt">Leaders</h3><div class="lrow"><span class="g1">${plink(top('g'))}</span><b class="mono">${top('g').g} goals</b></div><div class="lrow"><span class="g1">${plink(top('a'))}</span><b class="mono">${top('a').a} assists</b></div>`:''}
  <h3 class="mt">Recent</h3>${res.map(rl).join('')||'<div class="m sm">No matches yet</div>'}<h3 class="mt">Next</h3>${up.map(u=>{const home=u.h===id,opp=club(home?u.a:u.h);return`<div class="lrow"><span class="pill">MD${u.w}</span><span class="g1">${home?'vs':'at'} ${clink(opp)}</span></div>`}).join('')||'<div class="m sm">Season complete</div>'}</div></div>
  <div class="row wr mt"><button class="btn alt sm" data-a="opendiv" data-v="${c.lg}">Open ${esc(l.n)} table</button></div>`;
}
function searchResults(q){
  q=norm0(q);if(q.length<2)return'<div class="m sm" style="padding:10px 2px">Type at least two letters.</div>';
  const cl=ST.W.clubs.filter(c=>norm0(c.name).includes(q)).slice(0,5),pl=ST.W.pl.filter(p=>p.cl>=0&&norm0(p.n).includes(q)).sort((a,b)=>b.ovr-a.ovr).slice(0,9);
  return(cl.length?`<h3>Clubs</h3>`+cl.map(c=>`<button class="msg" data-a="ccard" data-v="${c.id}"><b>${esc(c.name)}</b> <span class="m sm">${esc(LGN[c.lg].n)}</span></button>`).join(''):'')+(pl.length?`<h3 class="mt">Players</h3>`+pl.map(p=>`<button class="msg" data-a="pcard" data-v="${p.id}"><div class="row sp"><span><b>${esc(p.n)}</b> <span class="m sm">${plab(p)} · ${p.age} · ${esc(club(p.cl).name)}</span></span><b class="mono">${p.ovr}</b></div></button>`).join(''):'')||'<div class="m sm" style="padding:10px 2px">No matches.</div>';
}
const vSearch=()=>`<h1 style="margin:0 0 10px">Search</h1><input id="q" class="srch" placeholder="Search players and clubs" autocomplete="off" autofocus><div id="qres" class="mt">${searchResults('')}</div>`;

/* my own season line, shaped like a squad player so it can sit in club leader lists */
function meRow(){
  const me=ST.me;if(me.role==='youth'||me.cl<0)return null;
  const ap=clubSS(me,'ap');return{me:1,n:me.name,pos:me.pos,age:me.age,ovr:me.ovr,g:clubSS(me,'g'),a:clubSS(me,'a'),ap,rs:clubSS(me,'rs'),rn:clubSS(me,'rn'),cs:clubSS(me,'cs')};
}
const withMe=ps=>{const m=meRow();return m?ps.concat([m]):ps};
function cmpRow(label,a,b,fmt,inv){
  const t=(+a+ +b)||1,pa=Math.round((inv?b:a)/t*100);
  return`<div class="cmp"><div class="row sp"><b class="mono">${fmt?fmt(a):a}</b><span class="k">${label}</span><b class="mono">${fmt?fmt(b):b}</b></div><div class="two"><div class="bar"><i style="width:${pa}%"></i></div><div class="bar"><i style="width:${100-pa}%"></i></div></div></div>`;
}

// a season stat line for any player: minutes, starts and per-90 numbers from the simulated match stats
function statLine(p){
  const x={};for(const k of XK)x[k]=xv(p,k);const mn=p.mn||0;if(!mn)return'';const n=v=>((v||0)/mn*90).toFixed(1),pct=(a,b)=>b?Math.round(a/b*100)+'%':'-';
  const rows=p.pos==='GK'?[['Saves per 90',n(x.sv)],['Pass accuracy',pct(x.pc,x.pa)],['Clean sheets',p.cs||0]]:
    [['Shots per 90',n(x.sh)],['Key passes per 90',n(x.kp)],['Dribbles per 90',n(x.dr)+' ('+pct(x.dr,x.dra)+')'],['Tackles + int. per 90',n((x.tk||0)+(x.ic||0))],['Pass accuracy',pct(x.pc,x.pa)],['Duels won',pct(x.duw,x.du)]];
  return`<div class="tile mt"><div class="row sp"><h3 style="margin:0">Season stat line</h3><span class="k">${mn} min · ${p.st||0} starts · ${p.ap-(p.st||0)} off the bench</span></div>${rows.map(([k,v])=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
}
