/* Selection: head-to-head with the players competing for your place decides who starts. */
const PARGA={ST:.55,W:.45,AM:.45,CM:.22,DM:.1,FB:.15,CB:.05,GK:0};
const clubSS=(me,k)=>['lg','cup','eu'].reduce((a,x)=>a+((me.ss[x]&&me.ss[x][k])||0),0);
function selData(){
  const me=ST.me,c=club(me.cl),k=NSL[me.pos],par=PARGA[me.pos]||.2,w=ap=>Math.min(1,ap/10);
  const ap=clubSS(me,'ap'),rn=clubSS(me,'rn'),avg=rn?clubSS(me,'rs')/rn:null,ga=ap?(clubSS(me,'g')+clubSS(me,'a'))/ap:0;
  const f=(ovr,av,n,gr)=>ovr+w(n)*(av?9*(av-RAVG):0)+w(n)*3*(gr-par);
  const L=(byPos(c)[me.pos]||[]).filter(p=>p.id!==(me.p&&me.p.id)).slice(0,k+4);
  const rows=L.map(p=>{const av=p.ap?p.rs/p.ap:null,gr=p.ap?(p.g+p.a)/p.ap:0;return{p,ovr:p.ovr,avg:av,ga:gr,ap:p.ap,sel:f(p.ovr,av,p.ap,gr)+1.2}}).sort((a,b)=>b.sel-a.sel);
  const mySel=f(me.ovr,avg,ap,ga)+((me.trust||60)-60)*.04;
  const gate=rows[k-1]?rows[k-1].sel:mySel-6,margin=mySel-gate,rank=rows.filter(r=>r.sel>mySel).length+1;
  const ps=clamp(.5+.12*margin,.03,.97);
  return{k,rows,mySel,margin,rank,ps,gate,me:{ovr:me.ovr,avg,ga,ap,mn:clubSS(me,'mn'),st:clubSS(me,'st')}};
}
const roleFromPs=ps=>ps>=.7?'starter':ps>=.3?'rotation':'bench';
// this player's debut/rotation/starter-ready ages (see BRKAGE in 10-data.js), nudged by their own club's situation:
// an established, clearly-better incumbent at the same position pushes the timeline back (up to +3 years); a
// position with no senior options at all pulls it forward, since a desperate club bloods youth early
function effBrk(me){
  if(!me.brk)me.brk=rollBrk(R(ST.seed+'|P|brk|'+me.name),me.pos,me.tier);
  let adj=0;
  if(me.cl>=0){
    const c=club(me.cl),L=(byPos(c)[me.pos]||[]).filter(p=>p.id!==(me.p&&me.p.id));
    if(L.length)adj=clamp((Math.max(...L.map(p=>p.ovr))-(me.ovr||me.base||50))*.08,-2,3);
    else adj=-1.5;
  }
  return{d:clamp(me.brk.d+adj,15,27),r:clamp(me.brk.r+adj,15,30),s:clamp(me.brk.s+adj,15,33)};
}
// below the debut age: pure development, in the U18s. Between debut and rotation age: fringe first-team
// involvement. Between rotation and starter-ready age: a trusted squad player, but not yet first-choice.
// Past starter-ready age: the normal merit-based selection takes over fully.
const calcRole=()=>{
  const me=ST.me;
  if(me.cl<0)return'youth';
  const b=effBrk(me);
  if(me.age<b.d)return'youth';
  if(me.age<b.r)return'bench';
  if(me.age<b.s)return'rotation';
  return roleFromPs(selData().ps);
};

/* Ballon d'Or voters tire of the same winner: each consecutive win costs a slice of the score. */
function bdoStreak(name,isMe){let n=0;for(let i=ST.hof.length-1;i>=0;i--){const b=ST.hof[i].bdo;if(b&&(isMe?b.me:(b.n===name&&!b.me)))n++;else break}return n}
const bdoAdj=(sc,isMe,name)=>sc*(1-.075*Math.min(bdoStreak(name,isMe),5));
