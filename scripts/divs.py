import re, sys
sys.path.insert(0, 'scripts')
from wiki import fetch
# country, tier, name, short, article, expected clubs
DIVS = [
 ('England',1,'Premier League','PL','2026–27 Premier League',20),
 ('England',2,'Championship','CH','2026–27 EFL Championship',24),
 ('England',3,'League One','L1E','2026–27 EFL League One',24),
 ('England',4,'League Two','L2E','2026–27 EFL League Two',24),
 ('Spain',1,'La Liga','LL','2026–27 La Liga',20),
 ('Spain',2,'La Liga 2','LL2','2026–27 Segunda División',22),
 ('Spain',3,'Primera Federación','PF','2026–27 Primera Federación',40),
 ('Germany',1,'Bundesliga','BL','2026–27 Bundesliga',18),
 ('Germany',2,'2. Bundesliga','BL2','2026–27 2. Bundesliga',18),
 ('Germany',3,'3. Liga','3L','2026–27 3. Liga',20),
 ('Italy',1,'Serie A','SA','2026–27 Serie A',20),
 ('Italy',2,'Serie B','SB','2026–27 Serie B',20),
 ('France',1,'Ligue 1','F1','2026–27 Ligue 1',18),
 ('France',2,'Ligue 2','F2','2026–27 Ligue 2',18),
 ('France',3,'Ligue 3','F3','2026–27 Ligue 3',18),
]
def uniq(a):
    s=[]
    for t in a:
        t=t.strip()
        if t not in s: s.append(t)
    return s
def strategies(x):
    out={}
    out['name']=uniq(re.findall(r'name_[A-Za-z0-9]+\s*=\s*\[\[([^\]|#]+)',x))
    out['label']=uniq([t for t in re.findall(r'label\d*\s*=\s*(?:\'\'\')?\[\[([^\]|#]+)',x)])
    m=re.search(r'\n=+\s*Stadiums?[^=\n]*=+(.*?)(?=\n==[^=])',x,re.S)
    rows=[]
    if m:
        for row in m.group(1).split('\n|-'):
            l=re.search(r'\[\[([^\]|#]+)',row.split('\n!')[-1] if row.lstrip().startswith('!') else row)
            if l: rows.append(l.group(1))
    out['table']=uniq(rows)
    return out
if __name__=='__main__':
    r=fetch([d[4] for d in DIVS])
    for d in DIVS:
        x=r[d[4]]
        if not x: print(d[2],'MISSING');continue
        s=strategies(x);print(d[2],d[5],{k:len(v) for k,v in s.items()})
