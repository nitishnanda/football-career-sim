"""Pulls 2026-27 squads, player details, managers, venues and dated transfers for all 324 clubs from API-Football.
Squad as at the end of the summer window = current squad - arrivals after CUT + departures after CUT."""
import json, os, sys, time, threading
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
import apif
ROOT = os.path.join(os.path.dirname(__file__), '..')
CP = os.path.join(ROOT, 'data', 'apif_cache.json')
CUT = '2026-09-03'
cache = json.load(open(CP)) if os.path.exists(CP) else {}
lock = threading.Lock()
LEAGUES = [(39,'PL'),(40,'CH'),(41,'L1E'),(42,'L2E'),(140,'LL'),(141,'LL2'),(435,'PF1'),(436,'PF2'),(78,'BL'),(79,'BL2'),(80,'3L'),(135,'SA'),(136,'SB'),(61,'F1'),(62,'F2'),(63,'F3')]

def A(path, **p):
    k = path + '?' + '&'.join('%s=%s' % (a, p[a]) for a in sorted(p))
    if k in cache: return cache[k]
    for i in range(5):
        d = apif.get(path, **p)
        e = d.get('errors')
        if e and isinstance(e, dict) and any('rate' in str(v).lower() for v in e.values()):
            time.sleep(15); continue
        break
    with lock: cache[k] = d
    return d

def save():
    with lock: json.dump(cache, open(CP, 'w'))

def team_job(t):
    tid = t['id']
    sq = A('players/squads', team=tid).get('response', [])
    sq = sq[0]['players'] if sq else []
    co = A('coachs', team=tid).get('response', [])
    det, page = {}, 1
    while True:
        d = A('players', team=tid, season=2026, page=page)
        for r in d.get('response', []):
            det[r['player']['id']] = r['player']
        if page >= (d.get('paging') or {}).get('total', 1): break
        page += 1
    tr = A('transfers', team=tid).get('response', [])
    return tid, sq, co, det, tr

def main():
    teams = []
    for lid, short in LEAGUES:
        for r in A('teams', league=lid, season=2026).get('response', []):
            teams.append(dict(id=r['team']['id'], name=r['team']['name'], ground=(r.get('venue') or {}).get('name') or '', div=short))
    print('teams', len(teams), flush=True)
    res = {}
    with ThreadPoolExecutor(2) as ex:
        for i, out in enumerate(ex.map(team_job, teams)):
            res[out[0]] = out
            if i % 25 == 0: print('teams done', i, 'requests', apif.USED, flush=True); save()
    save()
    # transfers after the cut-off
    arrivals, leavers = {}, {}   # team id -> set of player ids
    for tid, sq, co, det, tr in res.values():
        for item in tr:
            pid = item['player']['id']
            for x in item.get('transfers', []):
                if not x.get('date') or x['date'] <= CUT: continue
                ti, to = (x['teams'].get('in') or {}).get('id'), (x['teams'].get('out') or {}).get('id')
                if ti == tid: arrivals.setdefault(tid, set()).add(pid)
                if to == tid: leavers.setdefault(tid, set()).add((pid, item['player']['name']))
    print('arrivals after cut', sum(len(v) for v in arrivals.values()), 'leavers after cut', sum(len(v) for v in leavers.values()), flush=True)
    out = []
    for t in teams:
        tid, sq, co, det, tr = res[t['id']]
        coach = None
        for c in co:
            for job in c.get('career') or []:
                if (job.get('team') or {}).get('id') == tid and not job.get('end'): coach = c['name']
        coach = coach or (co[0]['name'] if co else '')
        players, seen = [], set()
        for p in sq:
            if p['id'] in arrivals.get(tid, ()): continue
            d = det.get(p['id'], {})
            players.append(dict(id=p['id'], name=p['name'], full=((d.get('firstname') or '') + ' ' + (d.get('lastname') or '')).strip(), age=p.get('age') or d.get('age'), dob=(d.get('birth') or {}).get('date'), nat=d.get('nationality') or '', pos=p.get('position') or '', no=p.get('number') or 0))
            seen.add(p['id'])
        for pid, nm in leavers.get(tid, ()):
            if pid in seen: continue
            d = A('players', id=pid, season=2026).get('response', [])
            pl = d[0]['player'] if d else {}
            pos = ((d[0].get('statistics') or [{}])[0].get('games') or {}).get('position') if d else ''
            players.append(dict(id=pid, name=pl.get('name') or nm, full=((pl.get('firstname') or '') + ' ' + (pl.get('lastname') or '')).strip(), age=pl.get('age'), dob=(pl.get('birth') or {}).get('date'), nat=pl.get('nationality') or '', pos=pos or '', no=0, back=1))
        out.append(dict(id=tid, name=t['name'], ground=t['ground'], div=t['div'], manager=coach, players=players))
    save()
    json.dump(out, open(os.path.join(ROOT, 'data', 'apif_world.json'), 'w'), ensure_ascii=False)
    print('clubs', len(out), 'players', sum(len(c['players']) for c in out), 'requests used', apif.USED)
main()
