"""Pulls API-Football evidence: league fixtures/results (all 16 divisions, 2023-2026) and player season stats (top five leagues, 2023-2026). Resumable; own compact cache."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import apif
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'data', 'evidence'); os.makedirs(OUT, exist_ok=True)
LEAGUES = {39:'PL',40:'CH',41:'L1E',42:'L2E',140:'LL',141:'LL2',435:'PF1',436:'PF2',78:'BL',79:'BL2',80:'3L',135:'SA',136:'SB',61:'F1',62:'F2',63:'F3'}
TOP5 = [39, 140, 78, 135, 61]
def have(name): return os.path.exists(os.path.join(OUT, name))
def save(name, obj): json.dump(obj, open(os.path.join(OUT, name), 'w'), ensure_ascii=False, separators=(',', ':'))
# 1) fixtures with scores
for season in (2023, 2024, 2025, 2026):
    for lid, short in LEAGUES.items():
        n = 'fix_%d_%s.json' % (season, short)
        if have(n): continue
        d = apif.get('fixtures', league=lid, season=season).get('response', [])
        save(n, [dict(id=f['fixture']['id'], d=f['fixture']['date'][:10], h=f['teams']['home']['name'], a=f['teams']['away']['name'], hg=f['goals']['home'], ag=f['goals']['away'], st=f['fixture']['status']['short']) for f in d])
        print('fixtures', season, short, len(d), 'requests', apif.USED, flush=True)
# 2) player season stats, top five leagues
for season in (2025, 2024, 2023, 2026):
    for lid in TOP5:
        n = 'pl_%d_%s.json' % (season, LEAGUES[lid])
        if have(n): continue
        out, page = [], 1
        while True:
            d = apif.get('players', league=lid, season=season, page=page)
            for r in d.get('response', []):
                p = r['player']; s = (r.get('statistics') or [{}])[0]
                g, sh, pa, dr, tk, du, pe, cd = s.get('goals') or {}, s.get('shots') or {}, s.get('passes') or {}, s.get('dribbles') or {}, s.get('tackles') or {}, s.get('duels') or {}, s.get('penalty') or {}, s.get('cards') or {}
                gm = s.get('games') or {}
                out.append(dict(id=p['id'], n=p['name'], age=p.get('age'), dob=(p.get('birth') or {}).get('date'), club=(s.get('team') or {}).get('name'), pos=gm.get('position'), ap=gm.get('appearences'), st=gm.get('lineups'), min=gm.get('minutes'), rt=gm.get('rating'), g=g.get('total'), a=g.get('assists'), sv=g.get('saves'), ga=g.get('conceded'), sh=sh.get('total'), sot=sh.get('on'), kp=pa.get('key'), pas=pa.get('total'), dr=dr.get('success'), tk=tk.get('total'), du=du.get('total'), duw=du.get('won'), pw=pe.get('won'), ps=pe.get('scored'), pm=pe.get('missed'), y=cd.get('yellow'), r=cd.get('red')))
            tot = (d.get('paging') or {}).get('total', 1)
            if page >= tot: break
            page += 1
        save(n, out); print('players', season, LEAGUES[lid], len(out), 'pages', page, 'requests', apif.USED, flush=True)
print('done; requests used', apif.USED)
