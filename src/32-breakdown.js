/* Rating breakdown. The match rating is the fitted linear model in 31-lines.js: 6.5 + a typical match for the position + each stat's weight times how far
   it is from its average, plus noise. Here the same stats are grouped into four categories (goalkeepers: three), each worth its summed contribution against an
   average game at that position, so a category is 0 for an average game, positive when it lifted the rating and negative when it cost it:
     rating = 6.5 base + typical match + shooting + passing + dribbling + defending + team result and minutes + standout bonus + unexplained (style, noise, rounding).
   Nothing here changes a rating; it only explains it. Per-match breakdowns are kept on the stat line, and the average per role is kept on the player so the
   effect of reinventing shows up as a change in his profile. */
const BKCAT={out:[['Shooting',['g','g2','shoff','sotng','pm','off']],['Passing',['a','kpx','pas','pmiss']],['Dribbling',['drs','drf','fd','pw']],['Defending',['tk','bl','ic','duw','dul','past','fc','yc','rc','pcm','gc','cs']]],
  gk:[['Saving',['sv','gc','cs']],['Passing',['a','kpx','pas','pmiss']],['Defending',['tk','bl','ic','duw','dul','past','fc','yc','rc','pcm']]]};
const BKCTX=['win','loss','gd','m90','short'];
const GAVG={ST:.38,W:.22,AM:.2,CM:.09,DM:.05,FB:.05,CB:.05,GK:0},AAVG={ST:.13,W:.17,AM:.2,CM:.1,DM:.06,FB:.1,CB:.03,GK:.01};
const bkCats=pos=>pos==='GK'?BKCAT.gk:BKCAT.out;
// what an average player at the position produces in the stat, for the minutes played
function bkExp(pos,k,m,G){
  if(k==='g')return(GAVG[pos]||0)*m;if(k==='g2')return(GAVG[pos]||0)*m*.1;if(k==='a')return(AAVG[pos]||0)*m;
  if(k==='win')return .42;if(k==='loss')return .3;if(k==='m90')return 1;
  return G&&G[k]?G[k][0]*m:0;
}
function breakdown(pos,f,rating){
  if(!RM||!f)return null;
  const M=RM.model[pos]||RM.model.CM,G=RM.gen[pos]||{},W=M.w,m=f.m90||1,cats=bkCats(pos);
  const imp=ks=>ks.reduce((s,k)=>s+(W[k]||0)*((f[k]||0)-bkExp(pos,k,m,G)),0);
  let typ=M.b0+(RCAL[pos]||0)-6.5;for(const k in W)typ+=W[k]*bkExp(pos,k,m,G);
  const c=cats.map(([,ks])=>imp(ks)),x=imp(BKCTX),sum=c.reduce((a,b)=>a+b,0);
  const r2=v=>Math.round(v*100)/100,bonus=rating>TAIL_K?rating-(TAIL_K+(rating-TAIL_K)/TAIL_S):0;   // the stretch for a standout game (see TAIL_K)
  return{c:c.map(r2),x:r2(x),t:r2(typ),s:r2(bonus),o:r2(rating-(6.5+typ+sum+x+bonus))};
}
/* Categories are shown against their own typical spread at the position (BKSD: the standard deviation of each category over simulated games), the way
   SofaScore scales its bars, so dribbling is as readable as shooting even though a dribble moves the rating much less than a goal. z = impact / spread.
   Colours reuse the rating palette on 6.5 + 0.75 z: no real effect is grey, a small plus is yellow, 7.0 and up is green, 8.0 teal, 9.0 blue; minuses are orange then red. */
const BKSD={GK:[.622,.122,.077],CB:[.155,.15,.036,.319],FB:[.154,.208,.056,.278],DM:[.172,.215,.042,.239],CM:[.234,.244,.058,.23],AM:[.32,.263,.08,.239],W:[.347,.248,.095,.246],ST:[.424,.203,.079,.235]};
// the typical (median) game sits below the mean for goals and assists, because most games have none: single games are measured from it so a normal game reads as neutral
const BKMED={GK:[-.23,.01,-.04],CB:[-.05,-.01,0,.09],FB:[-.06,-.05,0,.07],DM:[-.07,-.02,0,.04],CM:[-.09,-.05,0,0],AM:[-.19,-.09,-.01,-.01],W:[-.2,-.07,-.01,0],ST:[-.29,-.06,-.01,-.01]};
const bkZ=(pos,i,v)=>v/((BKSD[pos]||BKSD.CM)[i]||.2);                      // an average over many games, against the mean
const bkZg=(pos,i,v)=>(v-((BKMED[pos]||BKMED.CM)[i]||0))/((BKSD[pos]||BKSD.CM)[i]||.2);   // a single game, against the typical game
const bkCls=z=>rc(6.5+.75*z);   // same colour scale as match ratings: purple 9+, blue 8+, green 7+, gold 6.5+, orange 6+, red below
/* One match: the colours follow the overall rating, so a bar never outshines the game it belongs to. Below 8.0 no bar goes past green and from 8.0 to 9.0 none
   goes past blue (plenty of 7s and 8s are just greens with a weak defending bar); a 9.0+ game always has one purple bar or two blues. Returns each bar's z, kept inside its colour. */
const BKZ={r3:.001,r4:.67,r5:2,r6:3.34};   // lowest z of each colour on the rating palette (6.5+.75z: 7.0, 8.0, 9.0)
function bkGame(pos,c,rt){
  const z=c.map((v,i)=>bkZg(pos,i,v));if(rt==null)return z.map(v=>({z:v,cls:bkCls(v)}));
  const mx=rt>=9?99:rt>=8?3.33:1.99;let o=z.map(v=>Math.min(v,mx));
  if(rt>=9){const pu=o.filter(v=>v>=BKZ.r6).length,bl=o.filter(v=>v>=BKZ.r5&&v<BKZ.r6).length;
    if(!pu&&bl<2){const ix=o.map((v,i)=>i).sort((a,b)=>o[b]-o[a]);
      if(o[ix[1]]>=1.2){o[ix[0]]=Math.max(o[ix[0]],BKZ.r5+.2);o[ix[1]]=Math.max(o[ix[1]],BKZ.r5+.05)}else o[ix[0]]=Math.max(o[ix[0]],BKZ.r6+.15)}}
  return o.map(v=>({z:v,cls:bkCls(v)}));
}
// the average game for each role he has played: add one match
function bkAdd(me,bd){
  const key=me.arch+'|'+me.pos;me.bkr=me.bkr||{};
  const o=me.bkr[key]||(me.bkr[key]={arch:me.arch,pos:me.pos,n:0,sum:bd.c.map(()=>0),g:bd.c.map(()=>0),r:bd.c.map(()=>0)});
  o.n++;bd.c.forEach((v,i)=>{o.sum[i]+=v;const z=bkZg(me.pos,i,v);if(z>=.67)o.g[i]++;else if(z<=-.67)o.r[i]++});   // a green game is one worth 7.0+ on its own scale
}
