/* Cups and European competitions.
   Domestic cups: every club in the country enters, lower divisions first, the top flight joins later; single-leg ties.
   Champions / Europa League: 32-team league phase (8 games), top 8 straight to the last 16, 9-24 play two-legged play-offs,
   then two-legged last 16, quarter-finals and semi-finals, and a single-leg final. */
const CUPWK=[2,7,11,15,21,25,33,38],EULPW=[5,9,13,17,19,23,27,29],EUKOW=[[31,32],[35,36],[39,40],[43,44],[46]];
const EUR=['Knockout play-off','Round of 16','Quarter-final','Semi-final','Final'],EUN={ucl:'Champions League',uel:'Europa League'};
const ENTRY={2:{2:0,1:1},3:{3:0,2:1,1:2},4:{4:0,3:0,2:1,1:2}};
const p2=n=>{let p=1;while(p*2<=n)p*=2;return p};
const topLg=lg=>LGN.findIndex(l=>l.country===LGN[lg].country&&l.tier===1);

function planCup(lg){
  const clubs=ST.W.clubs.filter(c=>LGN[c.lg].country===LGN[lg].country),T=Math.max(...clubs.map(c=>LGN[c.lg].tier)),tbl=ENTRY[Math.min(T,4)]||ENTRY[2],ent=[];
  for(const c of clubs){const r=tbl[Math.min(LGN[c.lg].tier,4)]||0;(ent[r]=ent[r]||[]).push(c.id)}
  for(let i=0;i<ent.length;i++)ent[i]=ent[i]||[];
  const sizes=[];let surv=0;
  for(let r=0;r<ent.length||surv>1;r++){
    const f=surv+(ent[r]?ent[r].length:0);if(f<2)break;sizes.push(f);
    if(f===2)break;const P=p2(f),m=f===P?f/2:f-P;surv=f-m;
  }
  const nm=n=>n===2?'Final':n===4?'Semi-final':n===8?'Quarter-final':n===16?'Round of 16':n===32?'Round of 32':null;
  return{nr:sizes.length,sizes,names:sizes.map((f,r)=>nm(f)||('Round '+(r+1))),ent,cur:[],rounds:[],byes:[],win:null};
}
// the draw for round r is a pure function of the seed, so it can be shown before it is played
function cupDraw(lg,r){
  const cp=ST.cup[lg],field=cp.cur.concat(cp.ent[r]||[]),g=R(ST.seed+'|L|cupdraw|'+ST.season+'|'+lg+'|'+r),f=field.length;
  if(f<2)return{ties:[],byes:field,field};
  const P=p2(f),m=f===P?f/2:f-P,s=field.slice().sort((a,b)=>club(b).base-club(a).base+(g.r()-.5)),byes=s.slice(0,f-2*m),pool=g.shuffle(s.slice(f-2*m)),ties=[];
  for(let i=0;i<pool.length;i+=2)ties.push({h:pool[i],a:pool[i+1]});
  return{ties,byes,field};
}
const cupRoundOf=(cp,i)=>i-(CUPWK.length-cp.nr);
function initComps(cand){
  ST.cup=LGN.slice(0,NTOP).map((_,lg)=>planCup(lg));
  ST.cup.forEach(cp=>{cp.cur=(cp.ent[0]||[]).slice()});   // round 0 entrants are the starting field; later entrants join when their round comes
  ST.cup.forEach(cp=>{cp.ent[0]=[]});
  ST.eu={};
  [['ucl',0],['uel',32]].forEach(([k,o])=>{
    const teams=cand.slice(o,o+32).map(x=>x.id),g=R(ST.seed+'|L|eulp|'+ST.season+'|'+k),arr=g.shuffle(teams.slice()),n=arr.length,fx=[];
    for(let r=0;r<8;r++){const m=[];for(let i=0;i<n/2;i++){let h=arr[i],a=arr[n-1-i];if((i+r)%2)[h,a]=[a,h];m.push([h,a])}fx.push(m);arr.splice(1,0,arr.pop())}
    const tab={};teams.forEach(id=>tab[id]={p:0,w:0,d:0,l:0,gf:0,ga:0,pl:0});
    ST.eu[k]={teams,seeds:teams,lp:{fx,tab},rounds:[],win:null};
  });
}
function euRank(k){
  const e=ST.eu[k],t=e.lp.tab;
  return e.teams.slice().sort((a,b)=>t[b].p-t[a].p||(t[b].gf-t[b].ga)-(t[a].gf-t[a].ga)||t[b].gf-t[a].gf||e.teams.indexOf(a)-e.teams.indexOf(b));
}
function euRankOf(k,id){const e=ST.eu[k];if(!e.rank)e.rank=euRank(k);return e.rank.indexOf(id)}
function mkTie(k,x,y){const rx=euRankOf(k,x),ry=euRankOf(k,y);return rx<ry?{h:y,a:x}:{h:x,a:y}}   // better league-phase team hosts the second leg
function euAdvance(k){
  const e=ST.eu[k],R_=e.rounds,last=R_.length-1;
  if(last<0)return;
  const w=R_[last].map(t=>t.w);
  if(last===4){e.win=w[0];return}
  if(last===0){const dir=e.rank.slice(0,8),ties=[];for(let j=0;j<8;j++)ties.push(mkTie(k,dir[j],w[7-j]));R_[1]=ties;return}
  const ties=[];for(let i=0;i<w.length;i+=2)ties.push(mkTie(k,w[i],w[i+1]));R_[last+1]=ties;
}
function euRankReady(k){const e=ST.eu[k];e.rank=euRank(k);const rk=e.rank,ties=[];for(let j=0;j<8;j++)ties.push({h:rk[23-j],a:rk[8+j]});e.rounds[0]=ties}
const euLabel=(k,s)=>EUN[k]+' · '+(s.p==='lp'?'League phase, game '+s.m:EUR[s.rd]+(s.rd<4?(s.leg===1?' · 1st leg':' · 2nd leg'):''));
const euAlive=(k,id)=>{const e=ST.eu[k];if(!e.teams.includes(id))return false;if(e.win!=null)return false;if(!e.rounds.length)return !e.rank||true;const last=e.rounds.length-1;return e.rounds[last].some(t=>(t.h===id||t.a===id)&&(t.w==null||t.w===id))||(last===0&&e.rank&&e.rank.slice(0,8).includes(id))}
// the fixture my club plays in a slot, if any (null when not involved)
function slotFixture(s,id){
  if(s.t==='cup'){
    const lg=topLg(club(id).lg),cp=ST.cup[lg],r=cupRoundOf(cp,s.r);if(r<0||r>=cp.nr)return null;
    const d=cupDraw(lg,r),t=d.ties.find(x=>x.h===id||x.a===id);return t?{c:LGN[lg].cup+' · '+cp.names[r],o:t.h===id?t.a:t.h,h:t.h===id,neutral:r===cp.nr-1}:(d.byes.includes(id)?{bye:1,c:LGN[lg].cup+' · '+cp.names[r]}:null);
  }
  if(s.t==='eu')for(const k of['ucl','uel']){
    const e=ST.eu[k];
    if(s.p==='lp'){const f=e.lp.fx[s.m-1].find(x=>x[0]===id||x[1]===id);if(f)return{c:euLabel(k,s),o:f[0]===id?f[1]:f[0],h:f[0]===id,k}}
    else{const rs=e.rounds[s.rd],t=rs&&rs.find(x=>(x.h===id||x.a===id)&&x.w==null);if(t){const home=s.rd===4?true:(s.leg===1?t.h===id:t.a===id);return{c:euLabel(k,s),o:t.h===id?t.a:t.h,h:home,k,neutral:s.rd===4}}}
  }
  return null;
}
function eurPts(id){
  const e=ST.eu,n=k=>e[k].rounds.filter((r,i)=>i>=1&&r&&r.some(t=>t.h===id||t.a===id)).length,po=k=>e[k].rounds[0]&&e[k].rounds[0].some(t=>t.h===id||t.a===id),u=n('ucl'),l=n('uel');
  return{pts:[0,1.5,4,7,10.5][Math.min(u,4)]+(e.ucl.win===id?4:0)+[0,.4,1,1.8,2.6][Math.min(l,4)]+(e.uel.win===id?1.2:0)+(po('ucl')&&!u?.5:0),eu:e.ucl.teams.includes(id)||e.uel.teams.includes(id)};
}

/* ---------- playing a slot ---------- */
function playCupSlot(s,inSen,decide,report){
  const W=ST.W,me=ST.me;let rep=null;
  for(let lg=0;lg<NTOP;lg++){
    const cp=ST.cup[lg],r=cupRoundOf(cp,s.r);if(r<0||r>=cp.nr)continue;
    const{ties,byes}=cupDraw(lg,r),done=[],fin=r===cp.nr-1;
    for(const t of ties){
      const hc=W.clubs[t.h],ac=W.clubs[t.a],mine=inSen(t.h,t.a),rk=ST.season+'|cup'+r+'|'+t.h+'|'+t.a,pl=mine?decide('cup',rk):null;
      const res=koPlay(hc,ac,rk,{detail:mine,me:mine?me:null,play:pl,side:mine?(me.cl===t.h?0:1):-1,neutral:fin});
      t.hg=res.hg;t.ag=res.ag;t.pen=res.pen?1:0;t.w=res.w;done.push(res.w);
      if(mine)rep=report(res,'cup',LGN[lg].cup+' · '+cp.names[r],hc,ac,pl);
    }
    cp.rounds[r]=ties;cp.byes[r]=byes;cp.cur=byes.concat(done);if(fin)cp.win=done[0];
  }
  return rep;
}
function playEuSlot(s,inSen,decide,report){
  const W=ST.W,me=ST.me;let rep=null;
  for(const k of['ucl','uel']){
    const e=ST.eu[k];
    if(s.p==='lp'){
      for(const[h,a]of e.lp.fx[s.m-1]){
        const hc=W.clubs[h],ac=W.clubs[a],mine=inSen(h,a),rk=ST.season+'|'+k+'lp'+s.m+'|'+h+'|'+a,pl=mine?decide('eu',rk):null;
        const res=playMatch(hc,ac,rk,{detail:mine,scorers:true,eu:true,me:mine?me:null,play:pl,side:mine?(me.cl===h?0:1):-1});
        const T=e.lp.tab,A=T[h],B=T[a];A.pl++;B.pl++;A.gf+=res.hg;A.ga+=res.ag;B.gf+=res.ag;B.ga+=res.hg;
        if(res.hg>res.ag){A.w++;A.p+=3;B.l++}else if(res.hg<res.ag){B.w++;B.p+=3;A.l++}else{A.d++;B.d++;A.p++;B.p++}
        if(mine)rep=report(res,'eu',euLabel(k,s),hc,ac,pl);
      }
      if(s.m===8)euRankReady(k);
    }else{
      const ties=e.rounds[s.rd]||[],fin=s.rd===4;
      for(const t of ties){
        const mine=inSen(t.h,t.a),first=s.leg===1&&!fin,hid=first||fin?t.h:t.a,aid=first||fin?t.a:t.h,hc=W.clubs[hid],ac=W.clubs[aid],rk=ST.season+'|'+k+s.rd+s.leg+'|'+t.h+'|'+t.a,pl=mine?decide('eu',rk):null;
        const o={detail:mine,scorers:true,eu:true,me:mine?me:null,play:pl,side:mine?(me.cl===hid?0:1):-1,neutral:fin};
        if(fin){const res=koPlay(hc,ac,rk,o);t.hg=res.hg;t.ag=res.ag;t.pen=res.pen?1:0;t.w=res.w;if(mine)rep=report(res,'eu',euLabel(k,s),hc,ac,pl);continue}
        if(!first)o.etNeed=(h,a)=>t.l1[1]+h===t.l1[0]+a;   // second leg: home side here is t.a
        const res=playMatch(hc,ac,rk,o);
        if(first)t.l1=[res.hg,res.ag];
        else{
          t.l2=[res.ag,res.hg];t.hg=t.l1[0]+t.l2[0];t.ag=t.l1[1]+t.l2[1];
          res.etTie=res.et;if(t.hg===t.ag){const gp=R(ST.seed+'|L|pen|'+rk),sh=strength(pickXI(club(t.h),R('o|'+t.h))).o,sa=strength(pickXI(club(t.a),R('o|'+t.a))).o;t.pen=1;t.w=gp.r()<clamp(.5+.012*(sh-sa),.3,.7)?t.h:t.a;res.pen=true;res.w=t.w}
          else{t.w=t.hg>t.ag?t.h:t.a;res.w=t.w}
          res.agg=[t.hg,t.ag];
        }
        if(mine)rep=report(res,'eu',euLabel(k,s),hc,ac,pl);
      }
      if(fin||s.leg===2)euAdvance(k);
    }
  }
  return rep;
}

/* ---------- U18 league standings (Premier League-style academy table) ---------- */
// a lightweight simulated table across every top-flight club's academy side in a country, seeded off the save so
// it reads the same every time; the player's own club's row uses their actual record instead of a simulated one
function u18Clubs(country){return ST.W.clubs.filter(c=>LGN[c.lg].country===country&&LGN[c.lg].tier===1)}
function u18WeeksPlayed(){
  if(!ST.slots)return 0;
  let n=0;for(let i=0;i<ST.si;i++)if(ST.slots[i].t==='yth')n++;
  return n;
}
function u18Table(country){
  const clubs=u18Clubs(country);
  if(clubs.length<2)return[];
  const arr=clubs.map(c=>c.id).slice(),n=arr.length,rounds=[];
  for(let r=0;r<n-1;r++){const m=[];for(let i=0;i<n/2;i++){let h=arr[i],a=arr[n-1-i];if(r%2&&i===0)[h,a]=[a,h];m.push([h,a])}rounds.push(m);arr.splice(1,0,arr.pop())}
  const full=rounds.concat(rounds.map(m=>m.map(([h,a])=>[a,h]))),played=Math.min(full.length,u18WeeksPlayed());
  const tab={};clubs.forEach(c=>tab[c.id]={w:0,d:0,l:0,gf:0,ga:0,p:0});
  for(let wk=0;wk<played;wk++)for(const[h,a]of full[wk]){
    const g=R(ST.seed+'|L|u18|'+country+'|'+ST.season+'|'+wk+'|'+h+'|'+a),diff=(club(h).base-club(a).base)/10;
    const hg=g.pois(clamp(1.3+diff*.15,.3,3.5)),ag=g.pois(clamp(1.1-diff*.15,.3,3.5)),H=tab[h],A=tab[a];
    H.gf+=hg;H.ga+=ag;A.gf+=ag;A.ga+=hg;
    if(hg>ag){H.w++;H.p+=3;A.l++}else if(hg<ag){A.w++;A.p+=3;H.l++}else{H.d++;A.d++;H.p++;A.p++}
  }
  return clubs.map(c=>({id:c.id,t:tab[c.id]})).sort((a,b)=>b.t.p-a.t.p||(b.t.gf-b.t.ga)-(a.t.gf-a.t.ga)||b.t.gf-a.t.gf);
}
