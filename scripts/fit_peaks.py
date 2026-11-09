"""Fits each archetype's physical / technical / IQ mix (MIXA in src/20-world.js) so its statistical peak matches the median peak age of its
real example players (data/ref_careers.txt). The three component curves here must match COMPS in src/20-world.js. Run: python3 scripts/fit_peaks.py"""
import json,os,statistics as S
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
F=[.30,.34,.38,.42,.46,.50,.55,.60,.66,.72,.78,.83,.88,.92,.95,.97,.985,1,1,1,1,1,1,.99,.97,.95,.92,.89,.85,.81,.77,.72,.68,.64,.59,.54,.49]
def comp(pk,pw,a,b):
    c=F[:];f21=F[14];loss=0;i=0
    for age in range(22,44):
        if age<pk:
            t=(age-21)/(pk-21);c[age-7]=f21+(1-f21)*(1-(1-t)**2)
        elif age<=pk+pw:c[age-7]=1
        else:
            loss+=a+b*i;i+=1;c[age-7]=max(.3,1-loss)
    return c
CP=comp(23,2,.010,.006);CT=comp(26,3,.004,.003);CI=comp(30,4,.004,.002)
M=(.6,1.0,1.5)
def blend(w):
    raw=[sum(w[k]*C[a-7] for k,C in enumerate((CP,CT,CI))) for a in range(7,44)]
    mx=max(raw);f21=F[14]
    return [F[a-7] if a<=21 else f21+(raw[a-7]-f21)/(mx-f21)*(1-f21) for a in range(7,44)]
def norm(w):
    s=sum(w);return tuple(x/s for x in w)
def peak(curve,lo=18):
    m=max(curve[lo-7:]);ages=[a for a in range(lo,44) if curve[a-7]>=m-.005]
    return sum(ages)/len(ages)
def ab(w):return blend(norm(w))
def st(w):return blend(norm(tuple(w[k]*M[k] for k in range(3))))

OVW={'ST':[.18,.34,.10,.17,.02,.19],'W':[.26,.17,.16,.30,.03,.08],'AM':[.10,.20,.32,.28,.03,.07],'CM':[.09,.10,.30,.17,.17,.17],'DM':[.07,.05,.25,.10,.33,.20],'FB':[.24,.04,.16,.14,.26,.16],'CB':[.12,.01,.08,.04,.46,.29],'GK':[.24,.2,.1,.24,.16,.06]}
# prior mix from what the position's overall is made of: pac/phy -> physical, sho/dri + half pas -> technical, def + half pas -> IQ (GK: reflexes+diving physical, handling/kicking technical, positioning IQ)
def prior(pos):
    pac,sho,pas,dri,de,phy=OVW[pos]
    if pos=='GK':return norm((.24+.06+.1*.0,.2+.1,.24+.16))  # approx
    return norm((pac+phy,sho+dri+pas/2,de+pas/2+.05))
s=open(os.path.join(ROOT,'src/11-arch.js')).read();i=s.index('const ARX=');j=s.index('\n};',i);ARX=json.loads(s[i+len('const ARX='):j+2])
P={}
for l in open(os.path.join(ROOT,'data/ref_careers.txt')):
    if l.startswith('#') or not l.strip():continue
    n,pos,t,b,dd,c,br,pk=l.strip().split('|');P[n]=int(pk)
T={pos+'|'+an:[P[n] for t in x['refs'].values() for n in t if n in P and n not in('Lamine Yamal','Savinho')] for pos,a in ARX.items() for an,x in a.items()}
tgt={k:S.median(v) for k,v in T.items()}
tgt['CM|Deep-Lying Playmaker']=30.0   # user: IQ midfielders (Kroos, Rodri, Xavi, Pirlo) peak statistically late, ~29-33
tgt['DM|Regista']=28.0
grid=[(a/20,b/20,(20-a-b)/20) for a in range(0,21) for b in range(0,21-a)]
res={}
for k,t in tgt.items():
    pos=k.split('|')[0];pr=prior(pos);best=None
    for w in grid:
        ps=peak(st(w));pa=peak(ab(w))
        loss=(ps-t)**2+1.5*sum((w[i]-pr[i])**2 for i in range(3))*2*0.5
        if best is None or loss<best[0]:best=(loss,w,ps,pa)
    res[k]=(best[1],best[2],best[3],t,pr)
    print(f"{k:34} target {t:4.1f}  stat {best[2]:4.1f}  ability {best[3]:4.1f}  mix P/T/I = {best[1][0]:.2f}/{best[1][1]:.2f}/{best[1][2]:.2f}   prior {pr[0]:.2f}/{pr[1]:.2f}/{pr[2]:.2f}")
print('\nposition defaults (MIXP):',{p:[round(x,2) for x in prior(p)] for p in OVW})
