/* Match stat lines and ratings for every player, from a model fitted on real per-match data (scripts/fit_ratings.py).
   Each stat is drawn per 90 for the position, scaled by possession, player quality and (for the user) attributes and archetype,
   with real over-dispersion; the rating is the fitted linear model of those stats plus result, clamped 3-10. */
const RM=REAL.rating||null;
const RAVG=RM?6.98:6.8;
// small per-position correction measured by scripts/validate_ratings.js (real minus simulated starter mean)
const RCAL={GK:-.02,CB:0,FB:0,DM:.05,CM:.03,AM:.1,W:.09,ST:0};   // a typical starter's match rating on this scale
const GSK=['shoff','sotng','kpx','pas','pmiss','tk','bl','ic','duw','dul','drs','drf','past','fd','fc','off','sv','yc'];
const SATT={shoff:'sho',sotng:'sho',kpx:'pas',pas:'pas',pmiss:'pas',tk:'def',bl:'def',ic:'def',duw:'phy',dul:'phy',drs:'dri',drf:'dri',past:'def',fd:'dri',fc:'def',off:'pac',sv:'ref',yc:'def'};
const GATT={pas:'kic',pmiss:'kic',sv:'ref'};
const XMAP={shoff:'sh',sotng:'sh',kpx:'kp',pas:'kp',drs:'dr',drf:'dr',tk:'tk',ic:'tk',bl:'tk',duw:'tk'};
function gammaS(g,k){if(k<1)return gammaS(g,k+1)*Math.pow(g.r()||1e-9,1/k);const d=k-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=g.norm(0,1);v=1+c*x}while(v<=0);v=v*v*v;const u=g.r();if(u<1-.0331*x*x*x*x||Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v}}
function cnt(g,mu,disp){if(mu<=0)return 0;if(disp<=1.03)return g.pois(mu);const k=mu/(disp-1);return g.pois(gammaS(g,k)*mu/k)}
// g: optional random stream for the part of a rating no box-score stat explains (model residual)
function ratingOf(pos,f,g){const M=RM.model[pos]||RM.model.CM;let r=M.b0+(RCAL[pos]||0);for(const k in M.w)r+=M.w[k]*(f[k]||0);if(g)r+=g.norm(0,M.sd||.25);return clamp(Math.round(r*10)/10,3,10)}
// q: number (player overall) or function(stat)->effective quality; xm: archetype multipliers; vol: extra spread for dribble-heavy styles
function simLine(g,pos,min,gl,as,gf,ga,poss,opx,q,xm,vol,red,gcOn){
  const G=RM.gen[pos]||RM.gen.CM,f={m90:min/90,short:min<25?1:0,g:gl,g2:Math.max(0,gl-1),a:as};
  for(const s of GSK){
    const P=G[s];if(!P)continue;const[m,kp,kq,d]=P,qq=typeof q==='function'?q(s):q;
    let mu=m*min/90*Math.exp(kp*(poss-.5)+kq*(qq-G.qref))*((xm&&xm[XMAP[s]])||1);
    if(s==='sv')mu*=opx;
    f[s]=cnt(g,mu,(s==='drs'||s==='drf')?d*(vol||1):d);
  }
  f.pmiss=Math.min(f.pmiss,f.pas);
  const gc=gcOn!=null?gcOn:(min>=85?ga:Math.min(ga,Math.floor(ga*min/90+g.r())));
  f.gc=(pos==='GK'||pos==='CB'||pos==='FB')?gc:0;f.cs=(gc===0&&min>=60&&(pos==='GK'||pos==='CB'||pos==='FB'||pos==='DM'))?1:0;
  f.win=gf>ga?1:0;f.loss=gf<ga?1:0;f.gd=clamp(gf-ga,-3,3);f.rc=red?1:0;
  f.pw=g.chance(.012*min/90)?1:0;f.pcm=pos==='CB'||pos==='FB'?(g.chance(.01*min/90)?1:0):0;
  if(pos!=='GK'&&f.sotng+gl>0&&gl===0&&g.chance(.015))f.pm=1;
  return f;
}
const possOf=(sh,sa,g,neutral)=>clamp((neutral?.5:.52)+.011*(sh.m-sa.m)+g.norm(0,.03),.3,.72);
// Same model without drawing every stat: expected stat counts plus the matching random spread. Used for AI players
// in matches the user does not see in detail, so a season sims fast; the distribution matches simLine.
function ratingFast(g,pos,min,gl,as,gf,ga,poss,opx,q,acc,gcOn){
  const G=RM.gen[pos]||RM.gen.CM,M=RM.model[pos]||RM.model.CM,W_=M.w;
  let r=M.b0+(RCAL[pos]||0)+W_.m90*min/90+(min<25?W_.short:0)+W_.g*gl+W_.g2*Math.max(0,gl-1)+W_.a*as,v=0;
  const mus={};
  for(const s of GSK){const P=G[s];if(!P)continue;let mu=P[0]*min/90*Math.exp(P[1]*(poss-.5)+P[2]*(q-G.qref));if(s==='sv')mu*=opx;mus[s]=mu;const w=W_[s]||0;r+=w*mu;v+=w*w*mu*P[3]}
  if(acc)addLine(acc,mus,gl,as,g);
  const gc=gcOn!=null?gcOn:(min>=85?ga:ga*min/90);
  if(pos==='GK'||pos==='CB'||pos==='FB')r+=W_.gc*gc;
  if(gc===0&&min>=60&&(pos==='GK'||pos==='CB'||pos==='FB'||pos==='DM'))r+=W_.cs;
  r+=(gf>ga?W_.win:0)+(gf<ga?W_.loss:0)+W_.gd*clamp(gf-ga,-3,3);
  return clamp(Math.round((r+g.norm(0,Math.sqrt(v+(M.sd||.25)**2)))*10)/10,3,10);
}
// What moved a rating: each stat's contribution relative to an average full game at the position
const FLAB={g:'Goals',g2:'Extra goals',a:'Assists',shoff:'Shots off target',sotng:'Shots on target (saved)',kpx:'Key passes',pas:'Passes',pmiss:'Misplaced passes',tk:'Tackles',bl:'Blocks',ic:'Interceptions',duw:'Duels won',dul:'Duels lost',drs:'Dribbles completed',drf:'Dribbles lost',past:'Dribbled past',fd:'Fouls won',fc:'Fouls committed',yc:'Yellow card',rc:'Red card',pw:'Penalty won',pcm:'Penalty conceded',pm:'Penalty missed',off:'Offsides',sv:'Saves',gc:'Goals conceded',cs:'Clean sheet',win:'Win',loss:'Defeat',gd:'Goal difference'};
function rateParts(pos,f){
  if(!RM||!f)return[];const M=RM.model[pos]||RM.model.CM,G=RM.gen[pos]||{},out=[];
  for(const k in FLAB){const w=M.w[k];if(!w)continue;const base=G[k]?G[k][0]*(f.m90||1):0,d=w*((f[k]||0)-base);if(Math.abs(d)>=.04)out.push([FLAB[k],d,f[k]||0])}
  return out.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6);
}

// season totals for a player's stat line, kept as a small integer array (it is saved for every player).
// Unseen matches add expected counts, rounded at random so the totals stay unbiased.
const XK=['sh','kp','dr','dra','tk','ic','pa','pc','du','duw','sv'];
function addLine(acc,f,gl,as,g){
  const v=[(f.shoff||0)+(f.sotng||0)+gl,(f.kpx||0)+as,f.drs||0,(f.drs||0)+(f.drf||0),f.tk||0,f.ic||0,f.pas||0,(f.pas||0)-(f.pmiss||0),(f.duw||0)+(f.dul||0),f.duw||0,f.sv||0];
  for(let i=0;i<v.length;i++){let x=v[i];if(g){const fl=Math.floor(x);x=fl+(g.r()<x-fl?1:0)}acc[i]=(acc[i]||0)+x}
}
const xv=(p,k)=>{const x=p.x;if(!x)return 0;return Array.isArray(x)?(x[XK.indexOf(k)]||0):(x[k]||0)};
