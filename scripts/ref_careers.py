import statistics as S,collections as C
R=[]
for l in open(__import__('os').path.join(__import__('os').path.dirname(__file__),'../data/ref_careers.txt')):
    if l.startswith('#') or not l.strip(): continue
    n,pos,t,b,d,c,br,pk=l.strip().split('|');R.append(dict(n=n,pos=pos,t=t,born=int(b),d=int(d),c=c,br=int(br),pk=int(pk)))
for r in R: r['lag']=r['br']-r['d']; r['pkm']=r['pk']
def med(x):return S.median(x) if x else None
def row(lbl,xs):
    if not xs:return
    print(f"{lbl:14} n={len(xs):3} debut={med([r['d'] for r in xs]):5.1f} break={med([r['br'] for r in xs]):5.1f} lag={med([r['lag'] for r in xs]):4.1f} breakby19={sum(r['br']<=19 for r in xs)/len(xs)*100:3.0f}% breakby20={sum(r['br']<=20 for r in xs)/len(xs)*100:3.0f}% peak={med([r['pk'] for r in xs]):5.1f}")
print('== by position (peak age, break age)')
for p in ['ST','W','AM','CM','DM','FB','CB','GK']: row(p,[r for r in R if r['pos']==p])
print('\n== by debut context');
for c in ['PL','T5','TF','LL']: row(c,[r for r in R if r['c']==c])
print('\n== by tier')
for t in ['gen','wk','pr','gr']: row(t,[r for r in R if r['t']==t])
print('\n== tier x context (break age / lag)')
for t in ['gen','wk','pr','gr']:
    for c in ['PL','T5','TF','LL']: row(t+'/'+c,[r for r in R if r['t']==t and r['c']==c])
print('\n== debut<=17 only, by context');
for c in ['PL','T5','TF','LL']: row('d<=17 '+c,[r for r in R if r['c']==c and r['d']<=17])
print('\n== pos x ctx')
for p in ['ST','W','AM','CM','DM','FB','CB','GK']:
    for c in ['T5','TF','LL']: row(p+'/'+c,[r for r in R if r['pos']==p and r['c']==c])
print('\nPL debuts:',[(r['n'],r['d'],r['br']) for r in R if r['c']=='PL'])
print('\npeak-age spread by pos (p25,p75):')
for p in ['ST','W','AM','CM','DM','FB','CB','GK']:
    x=sorted(r['pk'] for r in R if r['pos']==p and r['pk']>17); print(p,x[len(x)//4],x[3*len(x)//4],min(x),max(x))
print('\n=== top-two tiers only (gen+wk), by context')
top=[r for r in R if r['t'] in('gen','wk')]
for c in ['PL','T5','TF','LL']: row('gen+wk '+c,[r for r in top if r['c']==c])
print('=== gen+wk attackers (ST/W/AM) by context')
for c in ['T5','TF','LL']: row('att '+c,[r for r in top if r['c']==c and r['pos'] in('ST','W','AM')])
print('=== gen+wk defenders/mids/GK by context')
for c in ['T5','TF','LL']: row('def '+c,[r for r in top if r['c']==c and r['pos'] in('CM','DM','FB','CB','GK')])
print('=== earliest breakers (<=18):',[(r['n'],r['d'],r['c'],r['br']) for r in R if r['br']<=18])
print('=== late peaks >=29:',[(r['n'],r['pos'],r['pk']) for r in R if r['pk']>=29])
