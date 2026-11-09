/* Reinvention. A player is built around one defining attribute (pace for a Pace Abuser, dribbling for a Flashy Winger, shooting for a
   Poacher...). When age or a bad injury takes enough of it away, the player can reinvent himself: keep playing the position in a different
   style, or move to a neighbouring one, using what he still has. Switching keeps his real attributes (a ball-winner who becomes a regista
   still has the same tackling and passing), recomputes his overall for the new role, adds a short adaptation penalty, and puts him on the
   new archetype's ageing curve, which is how a pace-dependent winger buys himself extra years as a creator or a finisher. */
const REIN_DROP=8,REIN_COOL=4;   // points below his career-best defining attribute; seasons before he is asked again
function mainAttr(me){
  const att=archOf(me).att||{},keys=me.pos==='GK'?GKK:OUTK;let b=null;
  for(const k of keys)if(att[k]!=null&&(b==null||att[k]>att[b]))b=k;
  return b||keys[0];
}
// a long injury always costs a little pace (reflexes for a keeper); the worst ones can also take lasting damage to what the player is built on
function injuryCost(me,inj){
  const w=inj.w,g=R(ST.seed+'|P|injcost|'+ST.season+'|'+me.age+'|'+w),main=mainAttr(me),base=me.pos==='GK'?'ref':'pac';
  me.dev[base]=(me.dev[base]||0)-(w>=24?3:2);
  if(g.chance(w>=24?.6:w>=16?.35:.12)){
    const loss=Math.max(2,Math.round(g.norm(w>=24?7:4.5,1.5)));
    me.dev[main]=(me.dev[main]||0)-loss;me.gap=clamp(me.gap-loss*.35,-9,3);me.skillHit=ST.season;
    addMsg('medical','Lasting damage: '+KL[main],`The ${inj.t.toLowerCase()} has left its mark. The medical staff expect your ${KL[main].toLowerCase()} to stay down by around ${loss} points, and your game may need to change with it.`);
  }
  refresh(me);
}
// what his current attributes are worth in a role, and how that role's ageing curve treats him over the next three years
function reinventOptions(me){
  const A=me.attr,fam=me.pos==='GK',keysOf_=p=>p==='GK'?GKK:OUTK,sh=shiftsOf(me),age=me.age;
  const proj=(pos,arch,ovr)=>{const w=mixOf(pos,arch),n=curveAt(w,age,sh);return ovr*curveAt(w,age+3,sh)/Math.max(.3,n)};
  const stay=proj(me.pos,me.arch,me.ovr),by={};
  for(const pos of[me.pos].concat(DON[me.pos]||[])){
    if(!ARX[pos]||(pos==='GK')!==fam)continue;
    const keys=keysOf_(pos),w=OVW[pos];let sw=0,so=0;keys.forEach((k,i)=>{sw+=w[i];so+=w[i]*(A[k]||0)});
    const mean=keys.reduce((s,k)=>s+(A[k]||0),0)/keys.length;
    for(const arch of Object.keys(ARX[pos])){
      if(pos===me.pos&&arch===me.arch)continue;
      const att=ARX[pos][arch].att||{};let fit=0,tot=0;for(const k of keys){fit+=(att[k]||0)*((A[k]||0)-mean);tot+=Math.abs(att[k]||0)}
      fit/=Math.max(1,tot);
      const pen=pos===me.pos?1:2.5,ovr=Math.round(so/sw-pen),p3=Math.round(proj(pos,arch,ovr)),score=.5*ovr+.5*p3+fit*.4;
      if(!by[pos]||score>by[pos].score)by[pos]={pos,arch,ovr,p3,pen,fit:Math.round(fit*10)/10,score};
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
  const k=mainAttr(me),peak=(me.amax||{})[k]||me.attr[k],now=me.attr[k],drop=peak-now,hurt=me.skillHit!=null&&ST.season-me.skillHit<=1;
  if(drop<REIN_DROP&&!(hurt&&drop>=5))return null;
  const r=reinventOptions(me);if(!r.opts.length)return null;
  return{k,peak,now,drop,hurt,opts:r.opts,stay:r.stay,arch:me.arch,pos:me.pos,age:me.age,
    title:'Time to reinvent your game',body:(hurt?'The injury has taken something you relied on. ':'Age is taking something you relied on. ')+KL[k]+' is down from '+peak+' to '+now+'.'};
}
function reinvent(i){
  const rn=ST.pend&&ST.pend.rein,me=ST.me;if(!rn||!rn.opts[i])return;
  const o=rn.opts[i],A=Object.assign({},me.attr),fromPos=me.pos,fromArch=me.arch;
  me.pos=o.pos;me.arch=o.arch;me.archHidden=0;me.focus=null;me.dev={};
  const keys=me.pos==='GK'?GKK:OUTK,w=OVW[me.pos],P=PROF[me.pos],ar=archOf(me).att||{};
  let sw=0,so=0;keys.forEach((k,j)=>{sw+=w[j];so+=w[j]*(A[k]||0)});
  const nov=so/sw,pen=o.pen,F=fOf(me,me.age);
  me.pa=Math.round(Math.min(110,Math.max(nov,nov/F))*10)/10;me.gap=clamp(Math.round((nov-pen-me.pa*F)*10)/10,-9,3);
  me.base=me.pa*F+me.gap;
  const ag=attrAging(me,keys);
  keys.forEach(k=>{me.dev[k]=Math.round(((A[k]||0)-nov-(P[k]||0)-(ar[k]||0)-(ag[k]||0))*10)/10});
  me.amax=Object.assign({},A);me.reinv=ST.season;me.skillHit=null;
  refresh(me);me.role=calcRole();
  const nm=fromPos===me.pos?fromArch+' → '+me.arch:fromArch+' ('+fromPos+') → '+me.arch+' ('+me.pos+')';
  logArch('Reinvented: '+nm);
  addMsg('club','Reinvention: '+me.arch,`You are now a ${me.arch}${fromPos===me.pos?'':' ('+POSN[me.pos].toLowerCase()+')'}. Your attributes carry over; it will take a season to settle in. ${archOf(me).blurb}`);
  ST.pend.rein=null;
  if(ST.pend.avg!=null)ST.pend.opts=makeOffers(ST.pend.avg);
}
function reinventDecline(){
  const rn=ST.pend&&ST.pend.rein;if(!rn)return;
  ST.me.reinv=ST.season;logArch('Stuck with the '+ST.me.arch+' game');ST.pend.rein=null;
}
