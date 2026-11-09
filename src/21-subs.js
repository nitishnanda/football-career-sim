/* Sub-attributes (outfield players). Each of the six group attributes (pace, shooting, passing, dribbling, defending, physical) is made of
   the sub-attributes below, and a group is always their weighted average (SW), so overall and the match engine keep working off the six.
   A sub-attribute's value is its group's value plus:
     - what is typical for the position (SUBP) and the archetype (ASUB): a striker is better at finishing than at crossing,
     - training (me.sdev),
     - how it has aged relative to the rest of the player (subAging): every sub-attribute has its own age curve (SUBX), so strength and
       awareness keep building into the late 20s while acceleration and agility fade first.
   The offsets inside a group are re-centred so the group average never moves. Position and talent change the rates: a pace-based
   archetype's physical subs age sooner, an elite talent's technical and IQ subs hold up longer and develop earlier. */
const GROUPS=[['pac',['acc','spr']],['sho',['fin','apo','pwr','lsh','vol','pen']],['pas',['vis','crs','fkk','spa','lpa','cur']],['dri',['agi','bal','rea','bco','drb','com']],['def',['itc','hea','awa','stk','slk']],['phy',['jum','sta','str','agg']]];
const SL={acc:'Acceleration',spr:'Sprint speed',fin:'Finishing',apo:'Att. positioning',pwr:'Shot power',lsh:'Long shots',vol:'Volleys',pen:'Penalties',vis:'Vision',crs:'Crossing',fkk:'Free kick accuracy',spa:'Short passing',lpa:'Long passing',cur:'Curve',agi:'Agility',bal:'Balance',rea:'Reactions',bco:'Ball control',drb:'Dribbling',com:'Composure',itc:'Interceptions',hea:'Heading accuracy',awa:'Def. awareness',stk:'Standing tackle',slk:'Sliding tackle',jum:'Jumping',sta:'Stamina',str:'Strength',agg:'Aggression'};
const SDIR={acc:'Explosive first steps',spr:'Top-speed running mechanics',fin:'Finishing drills in and around the box',apo:'Movement to find space in the box',pwr:'Strike technique for power',lsh:'Shooting from distance',vol:'Volleys and half-volleys',pen:'Spot-kick routine',vis:'Scanning and spotting runs',crs:'Delivery from wide areas',fkk:'Dead-ball technique',spa:'Quick, accurate passing',lpa:'Switches and long balls',cur:'Bending the ball',agi:'Quick changes of direction',bal:'Staying on your feet under pressure',rea:'Reading the first move',bco:'First touch and close control',drb:'Take-ons and skill moves',com:'Calm in front of goal and under pressure',itc:'Reading passes and cutting them out',hea:'Heading technique',awa:'Positioning and reading danger',stk:'Winning the ball on your feet',slk:'Sliding tackles and recoveries',jum:'Leap and timing',sta:'Aerobic base and repeat sprints',str:'Strength and shielding the ball',agg:'Intensity and commitment'};
const SW={acc:.45,spr:.55,fin:.35,apo:.2,pwr:.2,lsh:.15,vol:.05,pen:.05,vis:.2,crs:.1,fkk:.05,spa:.3,lpa:.2,cur:.15,agi:.15,bal:.1,rea:.15,bco:.3,drb:.25,com:.05,itc:.25,hea:.1,awa:.3,stk:.25,slk:.1,jum:.15,sta:.3,str:.35,agg:.2};
const SUBG={};GROUPS.forEach(([g,l])=>l.forEach(s=>SUBG[s]=g));
const SUBK=Object.keys(SUBG);
// what is typical for a position, in points against the group's value
const SUBP={
ST:{fin:8,apo:7,pwr:3,lsh:-6,vol:3,vis:-6,crs:-12,fkk:-8,spa:2,lpa:-10,cur:-5,bal:2,rea:3,com:4,drb:-2,itc:-3,hea:4,awa:-4,stk:-4,slk:-4,jum:2,sta:-4,str:4,acc:2,spr:-1},
W:{apo:2,pwr:-4,lsh:-2,vol:-4,pen:-5,crs:10,fkk:-2,spa:-3,lpa:-8,cur:6,agi:8,bal:-4,bco:2,drb:6,com:-6,hea:-12,itc:-2,awa:-5,jum:-8,sta:2,str:-8,agg:-6,acc:4},
AM:{apo:4,pwr:-2,lsh:6,pen:2,vis:8,crs:-2,fkk:4,spa:4,lpa:-1,cur:3,agi:3,bal:-3,rea:3,bco:3,drb:2,com:1,hea:-10,awa:-3,jum:-6,sta:-2,str:-6,agg:-6},
CM:{fin:-4,apo:-4,lsh:6,vol:-3,pen:-2,vis:3,crs:-5,spa:5,lpa:2,cur:-2,agi:-3,bal:1,rea:1,com:3,itc:3,hea:-3,awa:1,stk:1,slk:-1,jum:-2,sta:6,agg:1},
DM:{fin:-10,apo:-10,pwr:2,vol:-5,pen:-4,vis:-4,crs:-8,fkk:-3,spa:3,lpa:6,cur:-4,agi:-6,bal:3,bco:-3,drb:-6,com:5,itc:5,hea:2,awa:3,stk:2,slk:-3,sta:6,str:2,agg:3},
FB:{fin:-10,apo:-8,pwr:-3,lsh:-4,vol:-6,pen:-5,vis:-8,crs:12,fkk:-4,lpa:-2,cur:4,bco:-2,com:-3,hea:-4,awa:1,stk:4,slk:2,jum:-4,sta:8,str:-3,agg:1,spr:3},
CB:{acc:-3,spr:1,fin:-10,apo:-8,pwr:2,lsh:-8,vol:-6,vis:-10,crs:-14,fkk:-8,lpa:6,cur:-6,agi:-8,bal:2,bco:-4,drb:-10,com:4,itc:3,hea:8,awa:4,stk:3,slk:3,jum:8,sta:-3,str:8,agg:5}};
// and for an archetype, on top of the position
const ASUB={
'Poacher':{fin:6,apo:6,com:3,bco:-2,hea:-2},'Playmaking Forward':{vis:8,spa:6,bco:4,fin:-3},'Target Man':{hea:12,str:8,jum:6,fin:-1,agi:-8,spa:-3},'Complete Forward':{pwr:2,vol:2,vis:2},
'Inside Forward':{fin:5,cur:6,pwr:2,lsh:4,crs:-6},'Traditional Winger':{crs:10,vis:3,fkk:2,pwr:-4},'Flashy Winger':{agi:8,bco:6,drb:6,bal:2,str:-4,crs:-3},'Pace Abuser':{acc:8,spr:4,str:2,bco:-6,com:-6},
'Classic No.10':{vis:8,spa:4,lpa:4,fkk:4},'Shadow Striker':{fin:6,apo:8,vis:-4},'Dribbling Ten':{agi:8,drb:6,bco:6,bal:3},
'Deep-Lying Playmaker':{lpa:8,vis:6,spa:4,com:6,awa:2,cur:2},'Box-to-Box':{sta:8,str:4,agg:4,itc:3,stk:3},'Advanced Creator':{vis:4,bco:4,lsh:4,drb:3},
'Anchor':{awa:6,itc:6,stk:3,com:2},'Ball Winner':{stk:6,slk:6,agg:8,sta:6,awa:-2},'Regista':{lpa:8,vis:6,com:6,awa:2,cur:2},
'Attacking Wing-Back':{crs:6,sta:6,acc:2},'Inverted Full-Back':{spa:6,vis:4,bco:3,crs:-6},'Defensive Full-Back':{stk:4,hea:4,awa:4,crs:-6},
'Stopper':{hea:6,stk:4,str:4,agg:6,jum:2,slk:2},'Ball-Playing Defender':{lpa:8,vis:6,spa:5,bco:4,com:4},'Recovery Defender':{spr:6,acc:6,slk:5,itc:3,hea:-4}};
/* How each sub-attribute ages: [physical, technical, IQ] share of the three age curves (COMPS in 20-world.js), and a lag in years. A positive
   lag means it matures later and peaks later (strength, awareness, composure, vision); negative means sooner (acceleration, agility). */
const SUBX={acc:[1,0,0,-1],spr:[1,0,0,-.5],fin:[0,.6,.4,0],apo:[0,.2,.8,2],pwr:[.4,.6,0,0],lsh:[.1,.8,.1,.5],vol:[.2,.7,.1,0],pen:[0,.3,.7,2],
vis:[0,.1,.9,2],crs:[.1,.9,0,0],fkk:[0,.7,.3,1],spa:[0,.6,.4,0],lpa:[0,.5,.5,1],cur:[0,.8,.2,.5],agi:[.9,.1,0,-1],bal:[.6,.4,0,.5],rea:[.2,.2,.6,0],bco:[.1,.8,.1,0],drb:[.4,.6,0,-.5],com:[0,.1,.9,3],
itc:[.1,.1,.8,1.5],hea:[.5,.2,.3,1],awa:[0,0,1,3],stk:[.3,.2,.5,.5],slk:[.4,.2,.4,0],jum:[1,0,0,-.5],sta:[1,0,0,.5],str:[1,0,0,2],agg:[.2,0,.8,1]};
// how well each sub-attribute responds to training (pace and agility are mostly genetic; passing and finishing are coachable)
const TRN={acc:.45,spr:.35,fin:1,apo:.8,pwr:.8,lsh:.9,vol:.9,pen:.9,vis:.7,crs:1,fkk:.9,spa:1,lpa:.9,cur:.8,agi:.5,bal:.5,rea:.6,bco:1,drb:.9,com:.6,itc:.8,hea:.9,awa:.7,stk:1,slk:.9,jum:.5,sta:.9,str:.8,agg:.7};
// which sub-attributes drive each match stat (weights sum to 1); used by the match engine for the user's player
const SSUB={shoff:{fin:.35,pwr:.2,lsh:.2,apo:.15,vol:.1},sotng:{fin:.5,pwr:.2,com:.15,apo:.15},kpx:{vis:.35,spa:.25,crs:.15,lpa:.1,cur:.15},pas:{spa:.45,lpa:.25,vis:.2,cur:.1},pmiss:{spa:.4,lpa:.3,vis:.1,com:.2},
tk:{stk:.5,slk:.2,awa:.2,agg:.1},bl:{awa:.5,jum:.2,str:.1,itc:.2},ic:{itc:.6,awa:.4},duw:{str:.3,jum:.3,hea:.2,agg:.2},dul:{str:.3,jum:.3,hea:.2,agg:.2},drs:{drb:.35,bco:.25,agi:.2,bal:.1,rea:.1},drf:{drb:.35,bco:.25,agi:.2,bal:.1,rea:.1},
past:{awa:.4,itc:.3,stk:.3},fd:{agi:.3,bal:.3,drb:.4},off:{spr:.3,acc:.3,apo:.4}};
/* Realism ceilings: the highest value any player has ever had for each attribute (Mbappé 97 acceleration and sprint speed, Messi 97 ball
   control and 96 composure, Neymar 96 agility, Kanté 97 stamina, ...). Volleys, penalties, crossing, curve, reactions, balance and heading
   accuracy were not in the record list and are estimates. Values approach a ceiling gradually (softCap), so only an extreme case gets within
   a point or two of the record and nobody sits on it for a decade. */
const SACAP={acc:97,spr:97,fin:95,apo:95,pwr:95,lsh:94,vol:93,pen:92,vis:94,crs:94,fkk:94,spa:94,lpa:93,cur:94,agi:96,bal:95,rea:95,bco:97,drb:96,com:96,itc:92,hea:94,awa:94,stk:93,slk:91,jum:95,sta:97,str:95,agg:95};
const softCap=(v,cap)=>{const k=cap-10;return v<=k?v:k+10*(1-Math.exp(-(v-k)/10))};
/* Build: lean frames are quick and agile but weak, power frames are strong, balanced and good in the air and in the tackle but slow and stiff.
   FRAMEG moves the six groups (it changes the player's profile, not his overall); FRAMESUB moves the sub-attributes inside the groups. */
const FRAMEG={'Lean Wire':{pac:4,dri:2,def:-2,phy:-5},'Power Solid':{pac:-4,dri:-2,def:3,phy:5}};
const FRAMESUB={'Lean Wire':{acc:5,spr:4,agi:6,bal:-3,str:-8,jum:1,agg:-3,sta:3,hea:-3,stk:-2,slk:-1},'Power Solid':{acc:-5,spr:-4,agi:-6,bal:5,str:8,jum:3,agg:4,sta:-2,hea:3,stk:3,slk:2}};
const gval=(me,k)=>me.gd?me.gd[k]:me.attr[k];   // a group attribute as shown
const fLabel=f=>SL[f]||KL[f]||f,fDir=f=>SDIR[f]||DIR[f]||'';
// ageing of every sub-attribute relative to the player's overall curve, in rating points (0 up to the early teens, where all curves are the same)
function subAging(me){
  const sh=shiftsOf(me),w=mixOf(me.pos,me.arch),a=me.age,out={};
  const tal=clamp(((me.pa||78)-78)/12,-1,1),ramp=clamp((a-12)/6,0,1),late=clamp((a-24)/4,0,1);
  let raw=0;for(let c=0;c<3;c++)raw+=w[c]*compAt(c,a,sh[c]);
  for(const j of SUBK){
    const x=SUBX[j];
    // lag: its own maturity, shortened for elite talents (they develop sooner); position: athletic archetypes' physical subs age sooner
    const lag=(x[3]*(x[3]>0?1-.3*tal:1)+x[0]*(.35-w[0])*2.5)*ramp,ae=a-lag;
    let s=0;for(let c=0;c<3;c++)s+=x[c]*compAt(c,ae,sh[c]);
    // talent also sets how fast a sub-attribute falls away from its peak: an elite talent loses about 30% less, a limited one about 10% more
    if(s<1&&late>0)s=1-(1-s)*(1-.3*tal*late);
    out[j]=me.base*(s/raw-1);
  }
  return out;
}
// group-level ageing offsets: the weighted average of each group's sub-attributes
function attrAging(me,keys){
  if(me.pos==='GK')return gkAging(me,keys);
  const g=subAging(me),o={};
  for(const[k,l]of GROUPS)o[k]=l.reduce((s,j)=>s+SW[j]*g[j],0);
  return o;
}
// fills me.sub (the 29 values) and me.subd (how far each is from what is typical for the role and age: training and ageing, which is what the match engine uses)
function buildSubs(me,A){
  if(me.pos==='GK'){me.sub=null;me.subd=null;me.gd=null;return}
  const g=subAging(me),fr=FRAMESUB[me.frame]||{},pp=SUBP[me.pos]||{},aa=ASUB[me.arch]||ASUB[(typeof ARALIAS!=='undefined'&&ARALIAS[me.arch])||'']||{},sub={},subd={};
  me.smax=me.smax||{};
  for(const[k,l]of GROUPS){
    let Gk=0;for(const j of l)Gk+=SW[j]*g[j];
    let mean=0,meanB=0;const base={},dv={};
    for(const j of l){base[j]=(pp[j]||0)+(aa[j]||0)+(fr[j]||0);dv[j]=((me.sdev&&me.sdev[j])||0)+(g[j]-Gk);mean+=SW[j]*(base[j]+dv[j]);meanB+=SW[j]*base[j]}
    for(const j of l){
      const t=base[j]+dv[j]-mean;sub[j]=clamp(Math.round(softCap(A[k]+t,SACAP[j])),15,SACAP[j]);subd[j]=t-(base[j]-meanB);
      if(sub[j]>(me.smax[j]||0))me.smax[j]=sub[j];
    }
  }
  me.sub=sub;me.subd=subd;
  // the group as shown: the weighted mean of its capped sub-attributes (the engine keeps using the uncapped group value in me.attr)
  const gd={};for(const[k,l]of GROUPS)gd[k]=Math.round(l.reduce((t,j)=>t+SW[j]*sub[j],0));me.gd=gd;
}
// training: a sub-attribute (or, for goalkeepers, a group attribute). The sub rises by the full amount and lifts its group by its share,
// so the rest of the group holds still. Pace and agility respond little, passing and finishing a lot; the young and the talented gain more.
// diminishing returns: the closer a sub-attribute is to the top, the less a season of work adds
const trainGain=(me,f,amt)=>amt*(TRN[f]||.8)*(me.age<=21?1.3:me.age>=31?.6:1)*(1+.15*clamp(((me.pa||78)-78)/12,-1,1))*(me.sub&&me.sub[f]!=null?clamp(((SACAP[f]||97)-me.sub[f])/30,.15,1):1);
function trainBoost(me,f,amt){
  const g=SUBG[f];
  if(!g){me.dev[f]=Math.min(12,(me.dev[f]||0)+amt);return}
  const x=trainGain(me,f,amt);
  me.sdev=me.sdev||{};me.sdev[f]=Math.min(14,(me.sdev[f]||0)+x);
  // the group is lifted by the sub's share, unless it is already at its ceiling (then the lift would only be taken back from the other groups)
  if(me.attr[g]<(ACAP[g]||99)-3)me.dev[g]=(me.dev[g]||0)+x*SW[f];
}
// adjustment to the player's effective attribute for a match stat, from his sub-attributes
function subAdj(me,stat){
  const m=SSUB[stat];if(!m||!me.subd)return 0;
  let a=0;for(const j in m)a+=m[j]*(me.subd[j]||0);
  return a;
}
