"""Pull per-match player stats + ratings (API-Football /fixtures/players) for top-5 leagues.
Resumable: one JSON per fixture in data/apif_mp/. Usage: python3 scripts/pull_match_players.py SEASONS WORKER NWORKERS"""
import json,os,sys,time,subprocess
sys.path.insert(0,os.path.dirname(__file__));import apif
class _A:
    @staticmethod
    def get(path,**params):
        K=apif.key();q='&'.join('%s=%s'%kv for kv in params.items())
        for i in range(5):
            out=subprocess.run(['curl','-s','-m','12','-H','x-apisports-key: '+K,'https://v3.football.api-sports.io/'+path+'?'+q],capture_output=True)
            try:return json.loads(out.stdout)
            except Exception:time.sleep(2)
        return {}
apif_get=_A.get
ROOT=os.path.join(os.path.dirname(__file__),'..');OUT=os.path.join(ROOT,'data','apif_mp')
seasons=sys.argv[1].split(',');w=int(sys.argv[2]);nw=int(sys.argv[3])
fx=[]
for s in seasons:
    for lg in ['PL','LL','BL','SA','F1']:
        for f in json.load(open(os.path.join(ROOT,'data','evidence',f'fix_{s}_{lg}.json'))):
            if f.get('st') in('FT','AET','PEN'):fx.append((s,lg,f))
fx=[x for i,x in enumerate(fx) if i%nw==w]
n=0
def v(x):return 0 if x in(None,'') else x
for s,lg,f in fx:
    fp=os.path.join(OUT,f"{f['id']}.json")
    if os.path.exists(fp):continue
    d=apif_get('fixtures/players',fixture=f['id'])
    if not d.get('response'):
        if d.get('errors'):print('err',d['errors']);time.sleep(30)
        continue
    rows=[]
    for side,t in enumerate(d['response']):
        for p in t['players']:
            st=p['statistics'][0];gm=st['games']
            if not gm.get('minutes'):continue
            rows.append(dict(pid=p['player']['id'],n=p['player']['name'],tm=t['team']['name'],side=side,min=gm['minutes'],pos=gm.get('position'),rt=float(gm['rating']) if gm.get('rating') else None,sub=1 if gm.get('substitute') else 0,
              g=v(st['goals']['total']),a=v(st['goals']['assists']),gc=v(st['goals']['conceded']),sv=v(st['goals']['saves']),sh=v(st['shots']['total']),sot=v(st['shots']['on']),
              kp=v(st['passes']['key']),pas=v(st['passes']['total']),acc=int(v(st['passes']['accuracy']) or 0),tk=v(st['tackles']['total']),bl=v(st['tackles']['blocks']),ic=v(st['tackles']['interceptions']),
              du=v(st['duels']['total']),duw=v(st['duels']['won']),dra=v(st['dribbles']['attempts']),drs=v(st['dribbles']['success']),past=v(st['dribbles']['past']),
              fd=v(st['fouls']['drawn']),fc=v(st['fouls']['committed']),yc=v(st['cards']['yellow']),rc=v(st['cards']['red']),pw=v(st['penalty']['won']),pcm=v(st['penalty']['commited']),pm=v(st['penalty']['missed']),psv=v(st['penalty']['saved']),off=v(st['offsides'])))
    home=d['response'][0]['team']['name'] if d['response'] else None
    json.dump(dict(id=f['id'],season=s,lg=lg,h=f['h'],a=f['a'],hg=f['hg'],ag=f['ag'],home=home,p=rows),open(fp,'w'))
    n+=1
    if n%20==0:print(w,"done",n,time.strftime("%X"),flush=True)
print('worker',w,'finished',n,flush=True)
