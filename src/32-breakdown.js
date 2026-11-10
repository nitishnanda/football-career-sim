/* Rating breakdown. A match rating is built from five category scores, each between -1 (abysmal) and +1 (perfect), worked out from the match's raw stats first:
     Impact     goals, assists, penalties won or missed or conceded, red cards, and the team's result
     Shooting   shots, shots on target, finishing (goals count here as well)
     Passing    passes, misplaced passes, key passes
     Dribbling  take-ons completed or lost, fouls won
     Defending  tackles, interceptions, blocks, duels, being dribbled past, fouls and cards, goals conceded and clean sheets (a goalkeeper's saves)
   Each position leans on different categories (BKW, weights summing to 1) and the rating is the sum:
     rating = 6.5 + sum(score x weight x modifier)       modifier 4 for a positive score, 3 for a negative one, kept between 3.0 and 10.0
   The stats feeding each category are the same ones, with the same weights, as the fitted model of real player-matches (REAL.rating); a category's raw value is how
   far its stats are from an average game at the position, in rating points, then scaled by BKP (how much counts as perfect, a little less for a good game than a bad one so standout games can reach 9s and 10s) and lifted by BKP.c, because a
   normal professional game is a little above zero. The part of a rating that no stat explains (style, noise, the archetype) is added to Impact. The bars show the scores directly. */
const BK5=['Impact','Shooting','Passing','Dribbling','Defending'];
const BKW={ST:[.35,.30,.10,.20,.05],W:[.35,.30,.10,.20,.05],AM:[.20,.10,.40,.20,.10],CM:[.20,.10,.40,.20,.10],DM:[.15,.05,.35,.05,.40],CB:[.20,0,.15,.05,.60],FB:[.15,.05,.25,.20,.35],GK:[.25,0,.20,0,.55]};
// the categories shown for a position: [label, index into BK5]
const bkCats=pos=>{const w=BKW[pos]||BKW.CM;return BK5.map((l,i)=>[i===4&&pos==='GK'?'Saving':l,i]).filter(x=>w[x[1]]>0)};
const BKST={
  Impact:['g','g2','a','pw','pm','rc','pcm','win','loss','gd'],
  Shooting:['shoff','sotng','off'],
  Passing:['kpx','pas','pmiss'],
  Dribbling:['drs','drf','fd'],
  Defending:['tk','bl','ic','duw','dul','past','fc','yc','sv','gc','cs']};
const BKSTL=BK5.map(c=>BKST[c]);
const GAVG={ST:.38,W:.22,AM:.2,CM:.09,DM:.05,FB:.05,CB:.05,GK:0},AAVG={ST:.13,W:.17,AM:.2,CM:.1,DM:.06,FB:.1,CB:.03,GK:.01};
// what an average player at the position produces in the stat, for the minutes played
function bkExp(pos,k,m,G){
  if(k==='g')return(GAVG[pos]||0)*m;if(k==='g2')return(GAVG[pos]||0)*m*.1;if(k==='a')return(AAVG[pos]||0)*m;
  if(k==='win')return .42;if(k==='loss')return .3;if(k==='m90')return 1;
  return G&&G[k]?G[k][0]*m:0;
}
/* per position: c = the lift every category gets, k = how many spreads of a category make it perfect, sd = each category's typical spread over a game (fitted by
   test/fit_bk.js so that ratings keep the distribution of the fitted model: the same average, spread and share of 8s, 9s and 10s) */
const BKP={ST:{c:0.12,k:3.3,b:1,sd:[0.658,0.282,0.152,0.12,0.235]},W:{c:0.16,k:3.5,b:1,sd:[0.568,0.215,0.203,0.12,0.243]},AM:{c:0.16,k:2.8,b:1,sd:[0.584,0.207,0.225,0.12,0.233]},CM:{c:0.12,k:3.5,b:1,sd:[0.413,0.13,0.215,0.12,0.224]},DM:{c:0.12,k:4.6,b:1,sd:[0.362,0.12,0.199,0.12,0.235]},CB:{c:0.06,k:4.4,b:1,sd:[0.421,0.12,0.142,0.12,0.311]},FB:{c:0.06,k:3.3,b:1,sd:[0.429,0.12,0.177,0.12,0.263]},GK:{c:0.18,k:3.2,b:1,sd:[0.414,0.12,0.12,0.12,0.571]}};
// the five raw category values for a stat line, in rating points relative to an average game at the position
function bkRaw(pos,f){
  const M=RM.model[pos]||RM.model.CM,G=RM.gen[pos]||{},W=M.w,m=f.m90||1;
  const d=k=>(W[k]||0)*((f[k]||0)-bkExp(pos,k,m,G)),sum=ks=>ks.reduce((s,k)=>s+d(k),0);
  const r=BKSTL.map(sum);
  r[1]+=.5*(d('g')+d('g2'));   // a goal is finishing as well as impact
  r[2]+=.3*d('a');             // an assist is a pass as well
  return r;
}
// the five scores; noise is the part of the rating no stat explains, in rating points, and goes to Impact
function bkScores(pos,f,noise){
  const P=BKP[pos]||BKP.CM,r=bkRaw(pos,f);r[0]+=noise||0;
  return r.map((v,i)=>clamp(P.c+v/(P.k*P.sd[i]*(v>0?P.b:1)),-1,1));
}
const bkSum=(pos,s)=>{const w=BKW[pos]||BKW.CM;let r=6.5;for(let i=0;i<5;i++)r+=w[i]*(s[i]>=0?4:3)*s[i];return r};
// a small stretch above 9.0 so a standout game (a hat-trick in a win) can reach 10.0 now and then
const BKTAIL=.8,bkBonus=r=>r>9?(r-9)*BKTAIL:0;
const rateOf=(pos,s)=>{const r=bkSum(pos,s);return clamp(Math.round((r+bkBonus(r))*10)/10,3,10)};
const bkPts=(pos,i,s)=>(BKW[pos]||BKW.CM)[i]*(s>=0?4:3)*s;
function breakdown(pos,f,rating,sc){
  if(!RM||!f)return null;
  return{bs:(sc||bkScores(pos,f,0)).map(v=>Math.round(v*100)/100)};
}
/* Bar colours use the same palette as match ratings, read straight from the score: purple is a standout (0.97+, a category at its ceiling), blue very good (0.8+), green good (0.3+),
   gold slightly above average, orange slightly below, red poor (-0.3 and under). */
const bkCls=s=>s>=.97?'r6':s>=.8?'r5':s>=.3?'r4':s>=0?'r3':s>-.3?'r2':'r1';
// the average game for each role he has played: add one match (scores for all five categories)
function bkAdd(me,bd){
  const key=me.arch+'|'+me.pos;me.bkr=me.bkr||{};
  const o=me.bkr[key]||(me.bkr[key]={arch:me.arch,pos:me.pos,v:5,n:0,sum:[0,0,0,0,0],g:[0,0,0,0,0],r:[0,0,0,0,0]});
  o.n++;bd.bs.forEach((v,i)=>{o.sum[i]+=v;if(v>=.3)o.g[i]++;else if(v<=-.25)o.r[i]++});   // a green game is a category score of 0.3 or more
}
