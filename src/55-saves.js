/* Multi-slot saves: autosave to the current slot, resume the last one on load, export/import files. */
let SLOT=null,SAVEOK=true,SAVEMSG='',SAVET=0;
const SIDX='fcs_idx',SLAST='fcs_last',SPRE='fcs_s_';
const replacer=(k,v)=>k[0]==='_'?undefined:v;
function sIdx(){try{return JSON.parse(localStorage.getItem(SIDX))||[]}catch(e){return[]}}
function sSetIdx(a){localStorage.setItem(SIDX,JSON.stringify(a))}
function sMeta(id){
  const m=ST.me,c=m.cl>=0?ST.W.clubs[m.cl]:null;
  return{id,name:m.name,club:c?c.name:'Academy',age:m.age,season:ST.season,ovr:m.ovr,phase:ST.phase,t:Date.now(),v:ST.v,seasons:m.rows.length};
}
function save(){
  if(!ST)return;
  try{
    if(!SLOT)SLOT='s'+Date.now().toString(36);
    localStorage.setItem(SPRE+SLOT,packSave(JSON.stringify(ST,trimNum)));   // about 8x smaller than plain JSON
    const ix=sIdx().filter(x=>x.id!==SLOT);ix.unshift(sMeta(SLOT));sSetIdx(ix);
    localStorage.setItem(SLAST,SLOT);SAVEOK=true;SAVEMSG='';SAVET=Date.now();
  }catch(e){SAVEOK=false;SAVEMSG=(e&&e.name==='QuotaExceededError')?'Browser storage is full. Delete an old save or export this one.':'Your browser is blocking saves. Export your career as a file, or open the game from http://localhost:8765 instead of a file.'}
}
function loadSlot(id){
  try{
    const raw=localStorage.getItem(SPRE+id);if(!raw)return false;
    const s=migrate(JSON.parse(raw.startsWith('Z1:')?unpackSave(raw):raw));
    if(!s){SAVEMSG='That save is from an older version of the game and cannot be opened.';return false}
    ST=s;SLOT=id;localStorage.setItem(SLAST,id);upgradeSave();return true;
  }catch(e){SAVEMSG='That save could not be read.';return false}
}
function load(){
  try{
    const old=localStorage.getItem('fcs1');
    if(old&&!sIdx().length){ // bring the single legacy save across
      const s=migrate(JSON.parse(old));
      if(s){ST=s;SLOT=null;upgradeSave();save();localStorage.removeItem('fcs1');return}
    }
  }catch(e){}
  const last=localStorage.getItem(SLAST),ix=sIdx();
  if(last&&loadSlot(last))return;
  for(const x of ix)if(loadSlot(x.id))return;
  ST=null;
}
function deleteSlot(id){
  try{localStorage.removeItem(SPRE+id);sSetIdx(sIdx().filter(x=>x.id!==id));if(SLOT===id){SLOT=null;ST=null}if(localStorage.getItem(SLAST)===id)localStorage.removeItem(SLAST)}catch(e){}
}
function importSave(text){
  try{
    const s=migrate(JSON.parse(text));if(!s||!s.me||!s.W)throw 0;
    ST=s;SLOT=null;upgradeSave();save();UIM=null;TAB='home';return true;
  }catch(e){alert('That file is not a valid career save for this version of the game.');return false}
}
const agoT=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
function savedPill(){return SAVEOK?`<span class="m">${SAVET?'Saved '+agoT(SAVET):'Autosave on'}</span>`:'<span style="color:var(--badc)">Not saving!</span>'}
function vSaves(){
  const ix=sIdx();
  return`<h3>Saved careers</h3>${ix.length?ix.map(x=>`<div class="res ${x.id===SLOT?'cur':''}"><div class="g1"><div class="t">${esc(x.name)}</div>${kk(esc(x.club)+' · age '+x.age+' · '+label(x.season)+' · OVR '+x.ovr+' · '+agoT(x.t))}</div>${x.id===SLOT?'<span class="pill hot">Current</span>':`<button class="btn sm" data-a="sload" data-v="${x.id}">Load</button>`}<button class="btn alt sm" data-a="sdel" data-v="${x.id}">Delete</button></div>`).join(''):'<div class="m sm">Nothing saved yet. Your career saves by itself after every action.</div>'}
  <div class="row wr mt">${ST?'<button class="btn alt sm" data-a="export">Download this career</button>':''}<label class="btn alt sm" style="cursor:pointer">Import a career file<input id="imp" type="file" accept=".json,application/json" style="display:none"></label></div>
  ${SAVEOK?'':`<div class="warn">${esc(SAVEMSG)}</div>`}`;
}
function vSaveBanner(){return SAVEOK?'':`<div class="banner glass pad"><b>Not saving.</b> <span class="m">${esc(SAVEMSG)}</span> <button class="btn sm" data-a="export">Download save</button></div>`}
window.addEventListener('pagehide',()=>{if(ST)save()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ST)save()});

/* Bring a save from any earlier version up to date. Everything about the career and the world is kept; fields added since
   get sensible values. If the season's structure itself changed (the cup and European formats), the current season is
   restarted from matchday 1 so it runs on the new rules, and the player is told. */
function upgradeSave(){
  const S=ST,W=S.W,me=S.me,g=R(S.seed+'|upgrade|'+S.season);let notes=[];
  S.news=S.news||[];S.hist=S.hist||[];S.hof=S.hof||[];S.mineLog=S.mineLog||[];S.res=S.res||{};
  me.archHidden=me.archHidden||0;me.peak=me.peak||me.ovr;if(!ARX[me.pos][me.arch]&&!ARALIAS[me.arch])me.arch=Object.keys(ARX[me.pos])[0];
  for(const k of['lg','cup','eu','yth','nat'])if(me.ss&&me.ss[k])for(const f of['dr','tk','ic','bl','du','duw','dra','past','fd','fc','sv','yc','sot'])me.ss[k][f]=me.ss[k][f]||0;
  // v15: ability is now built from physical / technical / IQ components (see COMPS). Rescale each player's potential so today's rating is unchanged.
  const oldF=a=>F[clamp(Math.round(a),7,43)-7];
  if(S._from&&S._from<15){
    me.pks=clamp(Math.round(R(S.seed+'|pks').norm(0,2.2)*10)/10,-5,5);me.tks=clamp(Math.round(R(S.seed+'|tks').norm(0,2.2)*10)/10,-5,5);me.iqs=clamp(Math.round(R(S.seed+'|iqs').norm(0,3.2)*10)/10,-7,7);
    me.pa=Math.round(me.pa*oldF(me.age)/fOf(me,me.age)*10)/10;
    for(const p of W.pl){if(!p)continue;shiftsOf(p);p.pa=Math.round(p.pa*oldF(p.age)/fOf(p,p.age)*10)/10;delete p.sks}
    notes.push('separate physical, technical and IQ peaks');
  }
  // v18/v19: wingers and full-backs have a side (LW / RW, LB / RB)
  if(SIDED[me.pos]&&!me.sd)me.sd=me.foot==='Left'?'L':'R';
  for(const pos of['W','FB'])for(const c of W.clubs){const ws=c.sq.map(id=>W.pl[id]).filter(p=>p&&p.pos===pos&&!p.sd).sort((a,b)=>b.ovr-a.ovr);if(ws.length){const m=assignSides(ws);for(const p of ws)p.sd=m.get(p)}}
  for(const p of W.pl)if(p&&SIDED[p.pos]&&!p.sd)p.sd=sideHash(p.n);
  if(!me.bkr)me.bkr={};
  if(!me.sdev)me.sdev={};
  if(!me.amax)me.amax=Object.assign({},me.attr);
  if(me.pks==null)me.pks=0;if(me.tks==null)me.tks=0;if(me.iqs==null)me.iqs=0;delete me.sks;
  let wages=0;
  for(const p of W.pl){if(!p)continue;
    if(p.pk==null)p.pk=p.age>=29?Math.min(p.ovr+12,Math.round(p.ovr/fOf(p,p.age))):p.ovr;
    if(!Array.isArray(p.x))p.x=[];p.mn=p.mn||0;p.st=p.st||0;
  }
  for(const c of W.clubs){c._bp=null;c._av=null;for(const id of c.sq){const p=W.pl[id];if(p&&p.wg==null){p.wg=wageFor(c,wageVal(p.ovr,p.age,p.pa,c,p.pk));wages++}}}
  if(wages)notes.push('player wages');
  if(!W.q0)W.q0=topDist();
  ensureContracts(g);
  const oldCups=!S.cup||!S.cup[0]||S.cup[0].nr==null,oldEu=!S.eu||!S.eu.ucl||!S.eu.ucl.teams;
  if((oldCups||oldEu)&&S.phase==='play'){
    setupSeason();S.me.role=calcRole();S.pend={t:'train'};
    notes.push('the new cup and European formats (this season restarts from matchday 1)');
  }
  refresh(me);if(!me.s0)me.s0=Object.assign({},me.sub||{});   // builds the sub-attributes for saves from before they existed
  if(S._from&&S._from<VER||notes.length)addMsg('club','Game updated',notes.length?'Your save was brought up to date: '+notes.join(', ')+'. Your career history is unchanged.':'Your save was brought up to date. Nothing in your career changed.');
  delete S._from;
}
