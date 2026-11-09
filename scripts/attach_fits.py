"""Adds division scoring baselines and each club's fitted attack/defence strength (from real results) to data/world.json."""
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
fits = json.load(open(os.path.join(ROOT, 'data', 'team_fits.json'))); w = json.load(open(os.path.join(ROOT, 'data', 'world.json')))
for d in w['divisions']:
    f = fits.get(d['short'])
    if f: d['mu'] = round(f['mu'], 4); d['hfa'] = round(f['hfa'], 4)
own = other = none = 0
for c in w['clubs']:
    f = fits.get(c['div']); c.pop('fit', None)
    if f and f['n'].get(c['name'], 0) >= 10: c['fit'] = [round(f['att'][c['name']], 3), round(f['dfn'][c['name']], 3), round(f['n'][c['name']], 1), c['div']]; own += 1; continue
    for sh, ff in fits.items():                        # promoted/relegated: evidence from the old division counts for much less
        if sh != c['div'] and ff['n'].get(c['name'], 0) >= 10:
            c['fit'] = [round(ff['att'][c['name']], 3), round(ff['dfn'][c['name']], 3), round(ff['n'][c['name']], 1), sh]; other += 1; break
    else: none += 1
json.dump(w, open(os.path.join(ROOT, 'data', 'world.json'), 'w'), ensure_ascii=False)
print('clubs with own-division evidence', own, '| from another division', other, '| no evidence', none)
