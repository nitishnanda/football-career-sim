/* Reinvention. A player is built around one defining attribute (pace for a Pace Abuser, dribbling for a Flashy Winger, shooting for a
   Poacher...). When age or a bad injury takes enough of it away, the player can reinvent himself: keep playing the position in a different
   style, or move to a neighbouring one, using what he still has. Switching keeps his real attributes (a ball-winner who becomes a regista
   still has the same tackling and passing), recomputes his overall for the new role, adds a short adaptation penalty, and puts him on the
   new archetype's ageing curve, which is how a pace-dependent winger buys himself extra years as a creator or a finisher.
   Reinvention only runs one way, as it does in real careers: players move away from what the body has taken (pace, quick feet, legs) toward
   what lasts (technique, reading the game, strength in the air). Nobody reinvents himself into a pace merchant or a flashy dribbler, so a role is
   only offered if it is less athletic than the current one and is not built on pace or dribbling. */
const REIN_DROP=8,REIN_COOL=4;   // points below his career-best defining attribute; seasons before he is asked again
const attMain=(att,pos)=>{att=att||{};const keys=pos==='GK'?GKK:OUTK;let b=null;for(const k of keys)if(att[k]!=null&&(b==null||att[k]>att[b]))b=k;return b||keys[0]};
const mainOf=(pos,arch)=>attMain(ARX[pos]&&ARX[pos][arch]&&ARX[pos][arch].att,pos);
const mainAttr=me=>attMain(archOf(me).att,me.pos);
// the sub-attributes that usually go first when a group is damaged
const HURT={pac:['acc','spr'],dri:['agi','drb','bco'],sho:['fin','pwr'],pas:['vis','spa'],def:['stk','awa'],phy:['str','sta']};
// the sub-attributes of his defining group that have fallen furthest from their career best
function fallenSubs(me){
  if(!me.sub||!me.smax)return[];const g=mainAttr(me),l=(GROUPS.find(x=>x[0]===g)||[0,[]])[1];
  return l.map(j=>[j,(me.smax[j]||me.sub[j])-me.sub[j]]).filter(x=>x[1]>=3).sort((a,b)=>b[1]-a[1]).slice(0,2);
}
// a long injury always costs a little pace (reflexes for a keeper); the worst ones can also take lasting damage to what the player is built on
function injuryCost(me,inj){
  const w=inj.w,g=R(ST.seed+'|P|injcost|'+ST.season+'|'+me.age+'|'+w),main=mainAttr(me),base=me.pos==='GK'?'ref':'pac';
  me.dev[base]=(me.dev[base]||0)-(w>=24?3:2);
  if(g.chance(w>=24?.6:w>=16?.35:.12)){
    const loss=Math.max(2,Math.round(g.norm(w>=24?7:4.5,1.5)));
    // most of it lands on one sub-attribute of the group (acceleration, agility, finishing...), the rest on the group
    const hit=me.pos==='GK'?null:g.pick(HURT[main]||[]),what=hit?SL[hit]:KL[main];
    if(hit){me.sdev=me.sdev||{};me.sdev[hit]=(me.sdev[hit]||0)-Math.round(loss*.7);me.dev[main]=(me.dev[main]||0)-loss*.5}
    else me.dev[main]=(me.dev[main]||0)-loss;
    me.gap=clamp(me.gap-loss*.35,-9,3);me.skillHit=ST.season;
    addMsg('medical','Lasting damage: '+what,`The ${inj.t.toLowerCase()} has left its mark. The medical staff expect your ${what.toLowerCase()} to stay down by around ${loss} points, and your game may need to change with it.`);
  }
  refresh(me);
}
// what his current attributes are worth in a role, and how that role's ageing curve treats him over the next three years
function reinventOptions(me){
  const A=me.attr,fam=me.pos==='GK',keysOf_=p=>p==='GK'?GKK:OUTK,sh=shiftsOf(me),age=me.age;
  const proj=(pos,arch,ovr)=>{const w=mixOf(pos,arch),n=curveAt(w,age,sh);return ovr*curveAt(w,age+3,sh)/Math.max(.3,n)};
  const stay=proj(me.pos,me.arch,me.ovr),by={},src=mixOf(me.pos,me.arch),gone=mainAttr(me);
  for(const pos of[me.pos].concat(DON[me.pos]||[])){
    if(!ARX[pos]||(pos==='GK')!==fam)continue;
    const keys=keysOf_(pos),w=OVW[pos];let sw=0,so=0;keys.forEach((k,i)=>{sw+=w[i];so+=w[i]*(A[k]||0)});
    const mean=keys.reduce((s,k)=>s+(A[k]||0),0)/keys.length;
    for(const arch of Object.keys(ARX[pos])){
      if(pos===me.pos&&arch===me.arch)continue;
      // one-way: never toward pace or dribbling, never toward what has just been lost, and only to something clearly less athletic
      const cm=mainOf(pos,arch),tm=mixOf(pos,arch);
      if(cm==='pac'||cm==='dri'||cm===gone||tm[0]>src[0]-.05)continue;
      const att=ARX[pos][arch].att||{};let fit=0,tot=0;for(const k of keys){fit+=(att[k]||0)*((A[k]||0)-mean);tot+=Math.abs(att[k]||0)}
      fit/=Math.max(1,tot);
      const pen=pos===me.pos?1:2.5,ovr=Math.round(so/sw-pen),p3=Math.round(proj(pos,arch,ovr)),score=.5*ovr+.5*p3+fit*.4;
      const why='Needs '+Math.round((src[0]-tm[0])*100)+'% less athleticism than your current game'+(tm[2]>=.3?' and rewards reading the game':tm[1]>=.55?' and leans on technique':'')+'.';
      if(!by[pos]||score>by[pos].score)by[pos]={pos,arch,ovr,p3,pen,why,fit:Math.round(fit*10)/10,score};
    }
  }
  const out=Object.values(by).filter(o=>o.ovr>=me.ovr-7&&o.p3>=Math.round(stay)-1).sort((a,b)=>b.score-a.score).slice(0,3);
  for(const o of out){const w=mixOf(o.pos,o.arch),sh2=sh;let m=0,lo=null,hi=null;for(let a=18;a<=40;a++)m=Math.max(m,curveAt(w,a,sh2,SMUL));for(let a=18;a<=40;a++)if(curveAt(w,a,sh2,SMUL)>=m*.99){if(lo==null)lo=a;hi=a}o.st=[lo,hi]}
  return{opts:out,stay:Math.round(stay)};
}
// run at the end of a season: has the defining attribute fallen far enough (or an injury taken enough) that he should be offered a new role?
function reinventCheck(){
  const me=ST.me;if(me.role==='youth'||me.cl<0||me.age<24)return null;
  if(me.reinv!=null&&ST.season-me.reinv<REIN_COOL)return null;
  const k=mainAttr(me),now=gval(me,k),peak=(me.amax||{})[k]||now,drop=peak-now,hurt=me.skillHit!=null&&ST.season-me.skillHit<=1;
  if(drop<REIN_DROP&&!(hurt&&drop>=5))return null;
  const r=reinventOptions(me);if(!r.opts.length)return null;
  const fs=fallenSubs(me).map(([j,d])=>SL[j].toLowerCase()+' (−'+d+')').join(' and ');
  return{k,peak,now,drop,hurt,opts:r.opts,stay:r.stay,arch:me.arch,pos:me.pos,age:me.age,
    title:'Time to reinvent your game',body:(hurt?'The injury has taken something you relied on. ':'Age is taking something you relied on. ')+KL[k]+' is down from '+peak+' to '+now+(fs?': mostly '+fs:'')+'.'};
}
function reinvent(i){
  const rn=ST.pend&&ST.pend.rein,me=ST.me;if(!rn||!rn.opts[i])return;
  const o=rn.opts[i],A=Object.assign({},me.attr),oldSub=me.sub?Object.assign({},me.sub):null,fromPos=me.pos,fromArch=me.arch;
  me.pos=o.pos;me.arch=o.arch;me.archHidden=0;if(SIDED[me.pos]&&!me.sd)me.sd=me.foot==='Left'?'L':'R';me.focus=null;me.dev={};me.sdev={};
  const keys=me.pos==='GK'?GKK:OUTK,w=OVW[me.pos],P=PROF[me.pos],ar=archOf(me).att||{};
  let sw=0,so=0;keys.forEach((k,j)=>{sw+=w[j];so+=w[j]*(A[k]||0)});
  const nov=so/sw,pen=o.pen,F=fOf(me,me.age);
  me.pa=Math.round(Math.min(110,Math.max(nov,nov/F))*10)/10;me.gap=clamp(Math.round((nov-pen-me.pa*F)*10)/10,-9,3);
  me.base=me.pa*F+me.gap;
  const ag=attrAging(me,keys);
  keys.forEach(k=>{me.dev[k]=Math.round(((A[k]||0)-nov-(P[k]||0)-(ar[k]||0)-(ag[k]||0))*10)/10});
  me.amax=Object.assign({},A);me.reinv=ST.season;me.skillHit=null;me.smax=oldSub?Object.assign({},oldSub):{};
  refresh(me);
  // keep every sub-attribute where it was: what the new role makes typical is cancelled by training offsets, so nothing he has changes
  if(oldSub&&me.sub&&me.pos!=='GK'){for(const j of SUBK)me.sdev[j]=Math.round((oldSub[j]-me.sub[j])*10)/10;refresh(me)}
  me.amax=Object.assign({},me.gd||me.attr);me.s0=Object.assign({},me.sub||{});me.role=calcRole();
  const nm=fromPos===me.pos?fromArch+' → '+me.arch:fromArch+' ('+fromPos+') → '+me.arch+' ('+me.pos+')';
  logArch('Reinvented: '+nm);
  addMsg('club','Reinvention: '+me.arch,`You are now a ${me.arch}${fromPos===me.pos?'':' ('+pname(me).toLowerCase()+')'}. Your attributes carry over; it will take a season to settle in. ${archOf(me).blurb}`);
  ST.pend.rein=null;
  if(ST.pend.avg!=null)ST.pend.opts=makeOffers(ST.pend.avg);
}
function reinventDecline(){
  const rn=ST.pend&&ST.pend.rein;if(!rn)return;
  ST.me.reinv=ST.season;logArch('Stuck with the '+ST.me.arch+' game');ST.pend.rein=null;
}
