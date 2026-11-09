"""Fills in birth date, full name and nationality for squad players the bulk pull lacked (no 2026 appearances yet). Sequential, resumable."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import apif
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'data', 'apif_extra.json')
api = json.load(open(os.path.join(ROOT, 'data', 'apif_world.json')))
ids = sorted({p['id'] for c in api for p in c['players'] if not p.get('dob')})
old = json.load(open(os.path.join(ROOT, 'data', 'apif_cache.json')))
info = json.load(open(OUT)) if os.path.exists(OUT) else {}
done = set(info) | set(json.load(open(OUT + '.tried')) if os.path.exists(OUT + '.tried') else [])
todo = [i for i in ids if str(i) not in done]
print('to fetch', len(todo), 'of', len(ids), flush=True)
tried = list(done)
for n, pid in enumerate(todo):
    pl = None
    for season in (2026, 2025):
        k = 'players?id=%s&season=%s' % (pid, season)
        r = (old[k] if k in old else apif.get('players', id=pid, season=season)).get('response', [])
        if r: pl = r[0]['player']; break
    tried.append(str(pid))
    if pl: info[str(pid)] = dict(dob=(pl.get('birth') or {}).get('date'), full=((pl.get('firstname') or '') + ' ' + (pl.get('lastname') or '')).strip(), nat=pl.get('nationality') or '')
    if n % 100 == 99 or n == len(todo) - 1:
        json.dump(info, open(OUT, 'w'), ensure_ascii=False); json.dump(tried, open(OUT + '.tried', 'w'))
        print('fetched', n + 1, '/', len(todo), 'found', len(info), 'requests', apif.USED, flush=True)
print('done', len(info), 'enriched of', len(ids))
