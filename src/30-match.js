const SLOTS=['GK','CB','CB','FB','FB','DM','CM','AM','W','W','ST'];
const SCW={ST:5,W:3.2,AM:3.2,CM:1.3,DM:.5,FB:.6,CB:.7,GK:0};
const ASW={ST:1.6,W:3.5,AM:4,CM:2,DM:.8,FB:2,CB:.4,GK:0};
const DW={GK:.26,CB:.22,FB:.13,DM:.09,CM:.03,AM:0,W:0,ST:0};
const GV={ST:.75,W:.85,AM:.85,CM:.95,DM:1.05,FB:1.1,CB:1.15,GK:1.4};
const PB={GK:.22,CB:.2,FB:.12,DM:.12,CM:.08,AM:.06,W:.04,ST:0};
// per-90 expectations for the user's detailed stat line
const EXP={ST:{sh:2.6,kp:.8,pa:20,tk:.5,ic:.2,dr:1.1},W:{sh:2,kp:1.6,pa:30,tk:1.1,ic:.4,dr:2.3},AM:{sh:1.7,kp:2.2,pa:40,tk:.9,ic:.5,dr:1.6},CM:{sh:.9,kp:1.3,pa:58,tk:2,ic:1.2,dr:1},DM:{sh:.5,kp:.8,pa:62,tk:2.9,ic:1.7,dr:.5},FB:{sh:.4,kp:1,pa:48,tk:2.3,ic:1.3,dr:1.1},CB:{sh:.5,kp:.3,pa:60,tk:1.5,ic:1.7,dr:.2},GK:{kp:.05,pa:30,sv:2.8}};
const ATK={sh:'sho',kp:'pas',pa:'pas',tk:'def',ic:'def',dr:'dri'};
const WZ={sh:.12,kp:.4,pa:.1,tk:.35,ic:.3,dr:.35,sv:.9};
const PACC={CB:.1,DM:.08,CM:.05,FB:0,AM:-.02,W:-.04,ST:-.05,GK:-.15};

function pickXI(c,g){
  const bp=byPos(c),used={},xi=[];
  for(const pos of SLOTS){
    const s=used[pos]=used[pos]||0,k=NSL[pos],L=bp[pos];used[pos]++;
    let p=L[s];if(g.r()<.1&&L[k+s])p=L[k+s];
    xi.push({p,pos,min:90,from:1});
  }
  return xi;
}
function injectMe(xi,me,pl){
  if(pl.mode==='start'){
    let bi=-1;xi.forEach((x,i)=>{if(x.pos===me.pos&&(bi<0||x.p.ovr<xi[bi].p.ovr))bi=i});
    xi[bi]={p:me.p,pos:me.pos,min:pl.min,from:1,me:true};
  }else xi.push({p:me.p,pos:me.pos,min:pl.min,from:91-pl.min,me:true,sub:true});
}
function strength(xi){
  let a=0,aw=0,m=0,mw=0,d=0,dw=0;
  for(const x of xi){
    if(x.sub)continue;const o=x.p.ovr;
    switch(x.pos){
      case'ST':a+=o*1.2;aw+=1.2;break;case'W':a+=o;aw+=1;break;
      case'AM':a+=o*.8;aw+=.8;m+=o*.8;mw+=.8;break;
      case'CM':m+=o*1.2;mw+=1.2;break;case'DM':m+=o;mw+=1;d+=o*.3;dw+=.3;break;
      case'FB':d+=o;dw+=1;break;case'CB':d+=o*1.2;dw+=1.2;break;case'GK':d+=o*1.3;dw+=1.3;break;
    }
  }
  a/=aw;m/=mw;d/=dw;
  return{o:.55*a+.45*m,d:.55*d+.45*m,m};
}
const PRI=REAL.priors||{g:{},a:{}};
// share of his team's goals/assists while on the pitch: his own evidence-based record if we have one, else the real position average scaled by quality
const CG={ST:.078,W:.14,AM:.097,CM:.075,DM:.045,FB:.055,CB:.045,GK:0},CA={ST:.045,W:.07,AM:.07,CM:.05,DM:.04,FB:.05,CB:.04,GK:0};   // how fast a player's share grows with quality over his team's XI
// Experience: a teenager with the same overall as a prime-age player still gets fewer goals and assists (strength, positioning, composure),
// and a player in his statistical prime gets a few more than his ability alone says.
// Only applied to simulated shares; a real player's measured share (p.gs / p.asr) already reflects his own record.
const YTHF=a=>a>=22?1:a>=21?.97:a>=20?.93:a>=19?.89:a>=18?.84:a>=17?.78:.72;
// output multiplier: the teenage ramp, times output relative to ability at this age (see outRatio: later for IQ-based players)
const statF=p=>{if(p.age==null||!p.pos)return 1;if(p._sfa!==p.age){p._sfa=p.age;p._sf=YTHF(p.age)*clamp(outRatio(p,p.age),.85,1.15)}return p._sf};
function gshare(x,ref){const p=x.p;if(p.gs!=null)return p.gs;const mu=PRI.g[x.pos],d=clamp((p.sc||p.ovr)-ref,-12,10),y=statF(p);return mu==null?(x.pos==='GK'?0:SCW[x.pos]/23.4*Math.exp((CG[x.pos]||.04)*(d-6))*y):mu*Math.exp((CG[x.pos]||.04)*(d-6))*(p.gm||1)*y}
function ashare(x,ref){const p=x.p;if(p.asr!=null)return p.asr;const mu=PRI.a[x.pos],d=clamp((p.ac||p.ovr)-ref,-12,10),y=statF(p);return mu==null?ASW[x.pos]/20*Math.exp((CA[x.pos]||.04)*(d-3))*y:mu*Math.exp((CA[x.pos]||.04)*(d-3))*(p.am||1)*y}
function allocate(xi,n,g,L){
  const evs=[],cnt=new Map(),st=xi.filter(x=>!x.sub),ref=st.reduce((s,x)=>s+x.p.ovr,0)/st.length;
  for(let i=0;i<n;i++){
    const sc=g.wpick(xi,x=>{if(x.pos==='GK')return 0;const m=cnt.get(x)||0;return gshare(x,ref)*x.min/90*(m>=5?.02:m>=3?.25:m>=2?.65:1)});cnt.set(sc,(cnt.get(sc)||0)+1);
    const as=g.r()<.75?g.wpick(xi,x=>x===sc||!onAt(x,sc)?0:ashare(x,ref)*x.min/90):null;
    const t=L&&sc.iv?sc.iv[0]+g.r()*(sc.iv[1]-sc.iv[0]):sc.from-1+g.r()*sc.min;
    evs.push({t,m:L?regOf(t,L):Math.floor(t)+1,mt:L?minLabel(t,L):String(Math.floor(t)+1),sc,as});
  }
  evs.sort((a,b)=>a.t-b.t);
  for(const e of evs){e.sc.g=(e.sc.g||0)+1;if(e.as)e.as.a=(e.as.a||0)+1}
  return evs;
}
// match clock: L = {a1,a2,et,e1,e2} added time per half (minutes). Regulation minute -> real elapsed time, and back.
const toAct=(m,L)=>m<45?m:m<90?m+L.a1:m<105?m+L.a1+L.a2:m<120?m+L.a1+L.a2+L.e1:m+L.a1+L.a2+L.e1+L.e2;
const totAct=L=>L.et?120+L.a1+L.a2+L.e1+L.e2:90+L.a1+L.a2;
function regOf(t,L){const b=[45,45+L.a1,90+L.a1,90+L.a1+L.a2,105+L.a1+L.a2,105+L.a1+L.a2+L.e1,120+L.a1+L.a2+L.e1];
  return t<b[0]?Math.floor(t)+1:t<b[1]?45:t<b[2]?Math.floor(t-L.a1)+1:t<b[3]?90:t<b[4]?Math.floor(t-L.a1-L.a2)+1:t<b[5]?105:t<b[6]?Math.floor(t-L.a1-L.a2-L.e1)+1:120}
function minLabel(t,L){const b=[45,45+L.a1,90+L.a1,90+L.a1+L.a2,105+L.a1+L.a2,105+L.a1+L.a2+L.e1,120+L.a1+L.a2+L.e1];
  if(t<b[0])return String(Math.floor(t)+1);if(t<b[1])return'45+'+(Math.floor(t-b[0])+1);if(t<b[2])return String(46+Math.floor(t-b[1]));if(t<b[3])return'90+'+(Math.floor(t-b[2])+1);
  if(t<b[4])return String(91+Math.floor(t-b[3]));if(t<b[5])return'105+'+(Math.floor(t-b[4])+1);if(t<b[6])return String(106+Math.floor(t-b[5]));return'120+'+(Math.floor(t-b[6])+1)}
const onAt=(x,y)=>!y.iv||!x.iv||(x.iv[0]<y.iv[1]&&x.iv[1]>y.iv[0]);
// real time on the pitch, stoppage and extra time included
function setIv(xs,L){const end=L.et?120:90,T=totAct(L);for(const x of xs){const s0=x.from-1,e0=s0+x.min;x.iv=[toAct(s0,L),e0>=end?T:toAct(e0,L)];x.act=Math.max(1,Math.round(x.iv[1]-x.iv[0]))}}
// AI changes: 3-5 substitutions, mostly attackers and midfielders around the hour; a replacement also comes on when the user is taken off or brought on
const SUBW={ST:3,W:3,AM:2.5,CM:2,DM:1.2,FB:1.1,CB:.5,GK:0};
function addSubs(xi,c,g){
  if(!c||!c.sq||!c.sq.length)return;
  const used=new Set(xi.map(x=>x.p.id)),bp=byPos(c),me=xi.find(x=>x.me),outs=[];
  let k=3+(g.chance(.9)?1:0)+(g.chance(.6)?1:0);   // about 4.5 changes a game, as in the real data
  if(me&&!me.sub&&me.min<90){outs.push({x:me,F:me.min});k--}
  if(me&&me.sub){const o=xi.filter(x=>!x.me&&!x.sub&&x.pos===me.pos);const v=o.length?o[0]:null;if(v){v.min=me.from-1;used.add(-1)}k--}
  const cand=xi.filter(x=>!x.me&&!x.sub&&x.pos!=='GK'&&x.min>=90);
  for(let i=0;i<k&&cand.length;i++){const x=g.wpick(cand,y=>SUBW[y.pos]||1);cand.splice(cand.indexOf(x),1);const F=g.int(56,88);x.min=F;outs.push({x,F})}
  for(const{x,F}of outs){
    let rep=(bp[x.pos]||[]).find(p=>!used.has(p.id));
    if(!rep)rep=c.sq.map(id=>ST.W.pl[id]).find(p=>p&&!used.has(p.id)&&p.pos!=='GK');
    if(!rep)continue;used.add(rep.id);xi.push({p:rep,pos:x.pos,min:90-F,from:F+1,sub:true});
  }
}
// Sofascore-style 0-10 rating: baseline + result + goals/assists + defensive record + quality + performance
function rate(pos,ovr,gl,as,gf,ga,perf,min){
  let r=6.6+PB[pos]+(ovr-72)*.018;
  r+=Math.sign(gf-ga)*.25+clamp(gf-ga,-3,3)*.05;
  r+=(1-Math.min(ga,3))*DW[pos];
  r+=gl*GV[pos]-(gl>2?(gl-2)*.35:0)+as*.5+perf*.42;
  if(min<80)r=6.6+(r-6.6)*(.45+min/165);
  return clamp(Math.round(r*10)/10,3,10);
}
function genStats(me,min,gl,as,gf,ga,lt,lo,gm,pl,poss,act,gcOn){
  const pos=me.pos,A=me.attr,P=PROF[pos],AX=archOf(me);
  if(!RM){const r=rate(pos,me.ovr,gl,as,gf,ga,0,min);return{min,g:gl,a:as,ga,sh:gl,sot:gl,kp:as,pa:0,pc:0,tk:0,ic:0,dr:0,sv:0,rating:r}}
  // effective quality per stat: the relevant attribute measured against the position's profile (what an average player of this overall would have)
  const q=s=>{const k=pos==='GK'?(GATT[s]||'pos'):SATT[s];let a=A[k];if(a==null)return me.ovr;if(pos!=='GK')a+=subAdj(me,s);return me.ovr+(a-((P[k]||0)+me.ovr))};
  const f=simLine(gm,pos,min,gl,as,gf,ga,poss==null?.5:poss,lo/1.35,q,AX.ex,AX.vol,pl&&pl.red,gcOn);
  const s={min:act||min,reg:min,g:gl,a:as,ga,sh:f.shoff+f.sotng+gl,sot:f.sotng+gl,kp:f.kpx+as,pa:f.pas,pc:f.pas-f.pmiss,tk:f.tk,ic:f.ic,dr:f.drs,dra:f.drs+f.drf,bl:f.bl,du:f.duw+f.dul,duw:f.duw,past:f.past,fd:f.fd,fc:f.fc,sv:f.sv,yc:f.yc};
  const sc=bkScores(pos,f,ratingNoise(pos,gm)+(AX.ro||0)*(min>=60?1:min/60));s.rating=rateOf(pos,sc);s.f=f;s.bd=breakdown(pos,f,s.rating,sc);return s;
}
// Simulated team stats around a result: possession from midfield strength, shots and corners from expected goals
function teamStats(lh,la,sh,sa,hg,ag,g,p0){
  const ph=p0!=null?Math.round(p0*100):clamp(Math.round(52+1.1*(sh.m-sa.m)+g.norm(0,3)),32,68);
  const one=(l,gl)=>{const s=Math.max(gl+1,Math.round(l*8.6+g.norm(0,2.6))),sot=clamp(Math.round(s*.34+g.norm(0,1.2)),gl,s);return{sh:s,sot,xg:Math.round(clamp(l*(.85+g.r()*.3),.1,5)*100)/100,cor:clamp(Math.round(s*.42+g.norm(0,1.5)),0,16),fls:clamp(Math.round(g.norm(11.5,2.6)),4,20),yc:g.pois(1.7)}};
  return{poss:[ph,100-ph],h:one(lh,hg),a:one(la,ag)};
}
// Plays one match. o: {detail, scorers, upd, eu, neutral, me, play, side}
function playMatch(hc,ac,rk,o){
  o=o||{};
  const g=R(ST.seed+'|L|'+rk),gm=o.me?R(ST.seed+'|P|m|'+rk):null;
  const hx=hc.xi?hc.xi.slice():pickXI(hc,g),ax=ac.xi?ac.xi.slice():pickXI(ac,g);
  const pl=o.play;
  let duel=null;
  if(o.me&&pl&&(pl.mode==='start'||pl.mode==='sub')&&o.side>=0){
    injectMe(o.side===0?hx:ax,o.me,pl);
    const ox=(o.side===0?ax:hx).find(x=>x.pos===o.me.pos);if(ox)duel={n:ox.p.n||'Opponent',ovr:ox.p.ovr};
  }
  const sh=strength(hx),sa=strength(ax),nz=()=>Math.exp(g.norm(0,.05));
  const DL=LGN[hc.lg],gh=o.neutral?1.3:DL&&DL.gh!=null?DL.gh*.97:1.42,ga=o.neutral?1.3:DL&&DL.ga!=null?DL.ga*.97:1.14;
  let lh=gh*Math.exp(SLOPE*(sh.o-sa.d)+(hc.ea||0)-(ac.ed||0))*nz(),la=ga*Math.exp(SLOPE*(sa.o-sh.d)+(ac.ea||0)-(hc.ed||0))*nz();
  const sfc=l=>l<2.4?l:2.4+Math.tanh((l-2.4)/2.6)*2.3;lh=sfc(lh);la=sfc(la);
  let hg=Math.min(g.pois(lh),8),ag=Math.min(g.pois(la),8);
  const L={a1:1+Math.min(g.pois(2),6),a2:3+Math.min(g.pois(3.5),10),et:0,e1:0,e2:0};
  // extra time when a knockout tie is level after 90 minutes (single match, or on aggregate in a second leg)
  let hg2=0,ag2=0;
  if(o.etNeed&&o.etNeed(hg,ag)){L.et=1;L.e1=g.pois(.8);L.e2=1+g.pois(1.2);hg2=Math.min(g.pois(lh*.3),3);ag2=Math.min(g.pois(la*.3),3)}
  const res={h:hc.id,a:ac.id,hg:hg+hg2,ag:ag+ag2,sh,sa,side:o.side,duel,len:L,et:L.et};
  if(o.detail||o.scorers){
    addSubs(hx,hc,g);addSubs(ax,ac,g);
    const L0={...L,et:0,e1:0,e2:0};setIv(hx,L0);setIv(ax,L0);
    const eh=allocate(hx,hg,g,L0),ea=allocate(ax,ag,g,L0);
    if(L.et){   // extra time: everyone still on at 90 plays 30 more; extra-time goals go to them
      for(const x of hx.concat(ax))if(x.from-1+x.min>=90)x.min+=30;
      setIv(hx,L);setIv(ax,L);const s0=90+L.a1+L.a2,T=totAct(L);
      for(const[xs,n,arr]of[[hx,hg2,eh],[ax,ag2,ea]]){
        const tmp=xs.filter(x=>x.iv[1]>=T-.5).map(x=>({p:x.p,pos:x.pos,min:30,from:91,me:x.me,_x:x,iv:[s0,T]})),ev=allocate(tmp,n,g,L);
        for(const e of ev){e.sc=e.sc._x;if(e.as)e.as=e.as._x;arr.push(e)}
        for(const t of tmp){t._x.g=(t._x.g||0)+(t.g||0);t._x.a=(t._x.a||0)+(t.a||0)}
      }
    }else{setIv(hx,L);setIv(ax,L)}
    for(const e of eh)e.s=0;for(const e of ea)e.s=1;
    res.evs=eh.concat(ea).sort((x,y)=>x.t-y.t);
    if(o.eu)for(const e of res.evs)if(!e.sc.me)e.sc.p.eg=(e.sc.p.eg||0)+1;
    if(o.detail){
      const ph=possOf(sh,sa,g,o.neutral),rt=[],lu=[[],[]],keep=!!o.me,fg=res.hg,fa=res.ag;   // lineups and team stats are only kept for the user's matches
      for(let sd=0;sd<2;sd++){
        const xi=sd?ax:hx,gf=sd?fa:fg,ga=sd?fg:fa;
        for(const x of xi){
          const gc=x.iv?Math.max(0,res.evs.filter(e=>e.s!==sd&&e.t>=x.iv[0]&&e.t<=x.iv[1]).length):ga;
          if(x.me){const st=genStats(o.me,x.min,x.g|0,x.a|0,gf,ga,sd?la:lh,sd?lh:la,gm,pl,sd?1-ph:ph,x.act,gc);res.me=st;res.meIv=x.iv;rt.push({n:o.me.name,r:st.rating,me:1});lu[sd].push({n:o.me.name,pos:x.pos,o:o.me.ovr,r:st.rating,g:x.g|0,a:x.a|0,m:x.act,me:1,sub:x.sub?1:0,on:x.sub?x.iv[0]:null,off:x.iv[1]<totAct(L)-.5?x.iv[1]:null});continue}
          const p=x.p,acc=o.upd?(Array.isArray(p.x)?p.x:(p.x=[])):null;
          let r;
          if(!RM)r=rate(x.pos,p.ovr,x.g|0,x.a|0,gf,ga,g.norm(0,.75),x.min);
          else if(keep){const f=simLine(g,x.pos,x.min,x.g|0,x.a|0,gf,ga,sd?1-ph:ph,(sd?lh:la)/1.35,p.ovr,null,1,0,gc);r=ratingOf(x.pos,f,g);if(acc)addLine(acc,f,x.g|0,x.a|0)}
          else r=ratingFast(g,x.pos,x.min,x.g|0,x.a|0,gf,ga,sd?1-ph:ph,(sd?lh:la)/1.35,p.ovr,acc,gc);
          if(ST._rlog)ST._rlog.push([x.pos,x.min,r,x.g|0,x.a|0,x.sub?1:0]);
          if(o.upd){p.ap++;if(!x.sub)p.st=(p.st||0)+1;p.mn=(p.mn||0)+(x.act||x.min);p.rs+=r;p.g+=x.g|0;p.a+=x.a|0;if(x.pos==='GK'&&ga===0&&!x.sub)p.cs++}
          rt.push({n:p.n||'',r});
          if(keep)lu[sd].push({n:p.n||'',pos:x.pos,o:p.ovr,r,g:x.g|0,a:x.a|0,m:x.act||x.min,sub:x.sub?1:0,on:x.sub?x.iv[0]:null,off:x.iv&&x.iv[1]<totAct(L)-.5?x.iv[1]:null,id:typeof p.id==='number'?p.id:-1});
        }
      }
      res.motm=rt.reduce((b,x)=>x.r>b.r?x:b,rt[0]);
      if(keep){res.lu=lu;res.ts=teamStats(lh,la,sh,sa,res.hg,res.ag,g,ph)}
    }
  }
  return res;
}
function koPlay(hc,ac,rk,o){
  const res=playMatch(hc,ac,rk,Object.assign({},o,{etNeed:(h,a)=>h===a}));
  if(res.hg===res.ag){const gp=R(ST.seed+'|L|pen|'+rk);res.pen=true;res.w=gp.r()<clamp(.5+.012*(res.sh.o-res.sa.o),.3,.7)?hc.id:ac.id}
  else res.w=res.hg>res.ag?hc.id:ac.id;
  return res;
}
