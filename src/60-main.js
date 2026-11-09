function doCreate(){
  newCareer({name:CF.name.trim()||'Player',nat:CF.nat,pos:CF.pos,arch:CF.arch,foot:CF.foot,ht:+CF.ht||180,frame:CF.frame,tier:CF.tier==='random'?'random':+CF.tier,seed:CF.seed.trim(),startYear:+CF.era});
  TAB='home';INB={f:'all',sel:null,log:0};
}
function exportSave(){
  const b=new Blob([JSON.stringify(ST,(k,v)=>k[0]==='_'?undefined:v)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='career-save.json';a.click();
}
const ACT={
  create:doCreate,
  cf:d=>{CF[d.k]=d.v;if(d.k==='pos'&&CF.arch!=='random')CF.arch=Object.keys(ARCH[CF.pos])[0]},
  yr:()=>{if(!ST.pend&&ST.phase==='youth')youthYear()},
  next:()=>{TAB='home';step()},
  chunk:d=>{for(let i=0;i<(+d.n||3)&&!ST.pend&&ST.phase==='play';i++){const n=ST.si;step();if(ST.si===n)break}},
  blk:()=>{if(!ST.pend)simTo(false)},
  ssn:()=>{if(!ST.pend)simTo(true)},
  tab:d=>{TAB=d.v;UIM=null;window.scrollTo(0,0)},
  lg:d=>{LGV=+d.v},
  ctry:d=>{LGV=LGN.findIndex(l=>l.country===d.v&&l.tier===1)},
  sort:d=>{SORT=SORT.k===d.v?{k:d.v,d:-SORT.d}:{k:d.v,d:(d.v==='n'||d.v==='pos'||d.v==='roleN')?1:-1}},
  awk:d=>{AWK=d.v},euv:d=>{EUV=d.v},smf:d=>{SMF=d.v},
  pcard:d=>{UIM='p:'+d.v},ccard:d=>{UIM='c:'+d.v},srch:()=>{UIM='search'},
  
  pf:d=>{PF=d.v},ct:d=>{CT=d.v},lt:d=>{LT=d.v},msel:d=>{MSEL=+d.v},mt:d=>{MT=d.v},rmd:d=>{RMD=+d.v},mcmin:()=>{MCMIN=!MCMIN},bdox:d=>{BDOX=BDOX===+d.v?-1:+d.v},
  opendiv:d=>{LGV=+d.v;LT='table';UIM=null;TAB='league'},
  compact:()=>{COMPACT=!COMPACT},
  brk:()=>{BRK=!BRK},
  focus:d=>{ST.me.focus=d.v},trg:d=>{TRG=d.v},
  cont:()=>closePend(),
  plan:()=>{UIM='plan'},gear:()=>{UIM='gear'},closem:()=>{UIM=null},export:exportSave,
  acad:d=>{ST.pend.sel=+d.v},
  sign:()=>pickAcademy(ST.pend.sel||0),
  rev:()=>{ST.pend.rev=1;TAB='home';DT='inbox';window.scrollTo(0,0)},goinbox:()=>{TAB='home';DT='inbox';window.scrollTo(0,0)},dt:d=>{DT=d.v},
  revb:()=>{ST.pend.rev=0},
  inf:d=>{INB.f=d.v;INB.sel=null},
  sel:d=>{INB.sel=d.v},
  log:()=>{INB.log=INB.log?0:1},
  acc:d=>{applyOffer(+d.v);TAB='home';DT='games';INB.sel=null},
  rej:d=>{rejectOffer(+d.v);INB.sel=null},
  rein:d=>{reinvent(+d.v);INB.sel=null},reinx:()=>{reinventDecline();INB.sel=null},
  ctr:d=>counterOffer(+d.v),
  cons:()=>consult(),push:d=>pushBid(+d.v),ask:d=>askLeave(+d.v),
  reset:()=>{if(confirm('Start a new career? This one stays saved and you can load it again from Saves.')){save();ST=null;SLOT=null;UIM=null}},
  sload:d=>{save();if(loadSlot(d.v)){UIM=null;TAB='home';DT='games';MSEL=0}},
  sdel:d=>{if(confirm('Delete this saved career for good?'))deleteSlot(d.v)},
  saves:()=>{UIM='gear'}
};
const SLOW={blk:1,ssn:1,chunk:1};
// save just after the screen updates, and only once if several actions land together
let saveT=null;const queueSave=()=>{if(!ST)return;if(saveT)clearTimeout(saveT);saveT=setTimeout(()=>{saveT=null;if(ST)save()},60)};
document.addEventListener('click',e=>{
  if(e.target.classList&&e.target.classList.contains('modal')&&UIM){UIM=null;render();return}
  const b=e.target.closest('[data-a]');if(!b)return;
  const f=ACT[b.dataset.a];if(!f)return;
  const go=()=>{f(b.dataset);render();const o=document.getElementById('busy');if(o&&o.classList)o.classList.remove('on');queueSave()};
  if(SLOW[b.dataset.a]){const o=document.getElementById('busy');if(o&&o.classList)o.classList.add('on');setTimeout(go,30)}else go();
});
document.addEventListener('keydown',e=>{
  if(!ST||e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'){if(e.key==='Escape'){UIM=null;render()}return}
  if(e.key==='Escape'&&UIM){UIM=null;render();return}
  if(ST.phase!=='play'||modalOpen())return;
  const k=e.key.toLowerCase(),tabs=['home','club','league','career'];
  if(k==='/'){e.preventDefault();UIM='search';render();const q=document.getElementById('q');if(q)q.focus()}
  else if(k==='n'){ACT.next();render();queueSave()}
  else if(k==='b'){const o=document.getElementById('busy');if(o&&o.classList)o.classList.add('on');setTimeout(()=>{ACT.blk();render();queueSave();if(o&&o.classList)o.classList.remove('on')},30)}
  else if(/^[1-4]$/.test(k)){TAB=tabs[+k-1];window.scrollTo(0,0);render()}
});
document.addEventListener('input',e=>{
  if(e.target.id==='q'){const r=document.getElementById('qres');if(r)r.innerHTML=searchResults(e.target.value);return}
  const f=e.target.dataset.f;if(!f)return;
  CF[f]=e.target.value;
});
document.addEventListener('change',e=>{
  if(e.target.id==='imp'&&e.target.files[0]){const rd=new FileReader();rd.onload=()=>{if(importSave(rd.result))render()};rd.readAsText(e.target.files[0]);return}
  if(e.target.dataset.f==='ht')render()});
load();render();
