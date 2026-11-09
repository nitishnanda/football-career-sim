"""Fit a Sofascore-style match rating model per position from real per-match player stats (data/apif_mp),
plus the per-90 stat generator the engine uses. Writes data/rating.json (embedded as REAL.rating by build.py). Pure Python (no numpy)."""
import json,glob,math,os,random,statistics as S,collections
ROOT=os.path.join(os.path.dirname(__file__),'..')
W=json.load(open(os.path.join(ROOT,'data','world.json')))
pos_of={};ovr_of={}
for c in W['clubs']:
    for p in c['players']:
        if len(p)>9 and p[9]:
            pos_of[p[9]]=p[2]
            v=p[7] or .05;ovr_of[p[9]]=65+.9*math.log(max(v,.05)/5)/.155
COARSE={'G':'GK','D':None,'M':None,'F':'ST'}
POS=['GK','CB','FB','DM','CM','AM','W','ST']
rows=[];teams={}
for f in glob.glob(os.path.join(ROOT,'data','apif_mp','*.json')):
    m=json.load(open(f));P=m['p']
    tp=collections.Counter();
    for r in P:tp[r['side']]+=r['pas'] or 0
    tot=sum(tp.values()) or 1
    for r in P:
        if r['rt'] is None or r['min']<10:continue
        pos=pos_of.get(r['pid']) or COARSE.get(r['pos'])
        if not pos:continue
        home=(r['tm']==m['h'])
        gf,ga=(m['hg'],m['ag']) if home else (m['ag'],m['hg'])
        r=dict(r);r.update(fpos=pos,gf=gf,ga=ga,home=home,poss=tp[r['side']]/tot,mid=m['id'],season=m['season'],ovr=ovr_of.get(r['pid']))
        rows.append(r)
print('rows',len(rows),'matches',len({r['mid'] for r in rows}))
def feats(r):
    g=r['g'];sot=r['sot'];sh=max(r['sh'],sot);kp=r['kp'];a=r['a']
    gd=max(-3,min(3,r['gf']-r['ga']))
    return {'m90':r['min']/90,'short':1 if r['min']<25 else 0,'g':g,'g2':max(0,g-1),'a':a,'shoff':sh-sot,'sotng':max(0,sot-g),'kpx':max(0,kp-a),'pas':r['pas'],'pmiss':max(0,r['pas']-r['acc']),
      'tk':r['tk'],'bl':r['bl'],'ic':r['ic'],'duw':r['duw'],'dul':max(0,r['du']-r['duw']),'drs':r['drs'],'drf':max(0,r['dra']-r['drs']),'past':r['past'],'fd':r['fd'],'fc':r['fc'],
      'yc':r['yc'],'rc':r['rc'],'pw':r['pw'],'pcm':r['pcm'],'pm':r['pm'],'off':r['off'],'sv':r['sv'],'gc':r['gc'] if r['fpos'] in('GK','CB','FB') else 0,
      'cs':1 if (r['ga']==0 and r['min']>=60 and r['fpos'] in('GK','CB','FB','DM')) else 0,'win':1 if r['gf']>r['ga'] else 0,'loss':1 if r['gf']<r['ga'] else 0,'gd':gd}
FN=list(feats(rows[0]).keys())
def solve(A,b):
    n=len(b);M=[A[i][:]+[b[i]] for i in range(n)]
    for c in range(n):
        p=max(range(c,n),key=lambda i:abs(M[i][c]));M[c],M[p]=M[p],M[c]
        if abs(M[c][c])<1e-12:continue
        for i in range(n):
            if i!=c:
                f=M[i][c]/M[c][c]
                if f:M[i]=[x-f*y for x,y in zip(M[i],M[c])]
    return [M[i][n]/M[i][i] if abs(M[i][i])>1e-12 else 0 for i in range(n)]
def fit(R,lam=2.0):
    k=len(FN)+1;A=[[0.0]*k for _ in range(k)];b=[0.0]*k
    for r in R:
        x=[1.0]+[r['_f'][f] for f in FN];y=r['rt']
        for i in range(k):
            xi=x[i]
            if xi==0:continue
            b[i]+=xi*y;Ai=A[i]
            for j in range(k):Ai[j]+=xi*x[j]
    for i in range(1,k):A[i][i]+=lam*len(R)/1000
    return solve(A,b)
def pred(w,r):return max(3,min(10,w[0]+sum(w[i+1]*r['_f'][f] for i,f in enumerate(FN))))
for r in rows:r['_f']=feats(r)
model={};rep={}
for pos in POS:
    R=[r for r in rows if r['fpos']==pos]
    tr=[r for r in R if r['mid']%5];te=[r for r in R if r['mid']%5==0]
    w=fit(tr)
    e=[abs(pred(w,r)-r['rt']) for r in te];mu=S.mean(r['rt'] for r in te);var=S.mean((r['rt']-mu)**2 for r in te)
    r2=1-S.mean((pred(w,r)-r['rt'])**2 for r in te)/var
    w=fit(R)  # refit on everything for the game
    res=math.sqrt(S.mean((pred(w,r)-r['rt'])**2 for r in R))
    model[pos]={'b0':round(w[0],4),'w':{f:round(w[i+1],4) for i,f in enumerate(FN)},'sd':round(res,3)}
    rep[pos]=dict(n=len(R),test=len(te),mae=round(S.mean(e),3),r2=round(r2,3))
    print(f"{pos:3} n={len(R):6} test MAE {S.mean(e):.3f}  R2 {r2:.3f}  | goal {w[FN.index('g')+1]:+.2f} assist {w[FN.index('a')+1]:+.2f} keypass {w[FN.index('kpx')+1]:+.3f} drib {w[FN.index('drs')+1]:+.3f} tackle {w[FN.index('tk')+1]:+.3f} win {w[FN.index('win')+1]:+.2f} cs {w[FN.index('cs')+1]:+.2f}")
# real distributions for validation (starters, 60+ min)
real={}
for pos in POS:
    R=[r for r in rows if r['fpos']==pos and r['min']>=60]
    if not R:continue
    rt=[r['rt'] for r in R];bl=[r['rt'] for r in R if r['g']==0 and r['a']==0];sc=[r['rt'] for r in R if r['g']>0]
    real[pos]=dict(n=len(R),mean=round(S.mean(rt),3),sd=round(S.pstdev(rt),3),p8=round(sum(x>=8 for x in rt)/len(rt),4),p6=round(sum(x<6 for x in rt)/len(rt),4),blank=round(S.mean(bl),3) if bl else None,scored=round(S.mean(sc),3) if sc else None,
                  sub=round(S.mean(r['rt'] for r in rows if r['fpos']==pos and r['min']<30),3))
    print(pos,real[pos])
# stat generator, in the model's own feature terms: per-90 mean for starters, possession slope, quality slope (per ovr point)
GS=['shoff','sotng','kpx','pas','pmiss','tk','bl','ic','duw','dul','drs','drf','past','fd','fc','off','sv','yc']
gen={}
for pos in POS:
    R=[r for r in rows if r['fpos']==pos and r['min']>=60]
    if not R:continue
    g={};os_=[r['ovr'] for r in R if r['ovr'] is not None];qref=S.mean(os_) if os_ else 75
    for s_ in GS:
        val=lambda r:r['_f'][s_]
        mins=sum(r['min'] for r in R)/90;m=sum(val(r) for r in R)/mins
        hi=[r for r in R if r['poss']>=.5];lo=[r for r in R if r['poss']<.5]
        rate=lambda L:(sum(val(r) for r in L)+.5)/(sum(r['min'] for r in L)/90)
        kp_=math.log(rate(hi)/rate(lo))/(S.mean(r['poss'] for r in hi)-S.mean(r['poss'] for r in lo)) if hi and lo else 0
        agg=collections.defaultdict(lambda:[0,0,None])
        for r in R:
            if r['ovr'] is None:continue
            a_=agg[(r['pid'],r['season'])];a_[0]+=val(r);a_[1]+=r['min'];a_[2]=r['ovr']
        pts=[(o,math.log((t+.5)/(mn/90))) for t,mn,o in agg.values() if mn>=900]
        if len(pts)>20:
            mo=S.mean(p[0] for p in pts);my=S.mean(p[1] for p in pts)
            kq=sum((o-mo)*(y-my) for o,y in pts)/max(1e-9,sum((o-mo)**2 for o,_ in pts))
        else:kq=0
        # over-dispersion: variance/mean of per-match counts for full-match starters
        F=[val(r) for r in R if r['min']>=85];mu=S.mean(F) if F else 0;vr=S.pvariance(F) if len(F)>1 else 0
        g[s_]=[round(m,4),round(max(-4,min(4,kp_)),3),round(max(-.06,min(.06,kq)),4),round(max(1,vr/mu) if mu>0 else 1,3)]
    g['qref']=round(qref,2);gen[pos]=g
json.dump({'model':model,'feats':FN,'real':real,'gen':gen,'report':rep},open(os.path.join(ROOT,'data','rating.json'),'w'),indent=1)
print('saved data/rating.json')
