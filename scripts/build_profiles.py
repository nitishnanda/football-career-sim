"""Builds evidence-based player profiles from real API-Football season stats (top five leagues, 2023-24 .. 2026-27 so far) and adds them to data/world.json:
   gs  = share of his team's goals while on the pitch (shrunk towards his position's mean)
   as  = share of his team's assists
   pf  = performance z-score: average match rating vs his position, over recent seasons, shrunk by minutes
   evm = recency-weighted minutes behind these numbers (how much evidence there is)"""
import json, glob, os, math, collections
ROOT = os.path.join(os.path.dirname(__file__), '..'); EV = os.path.join(ROOT, 'data', 'evidence')
W = {2026: 1.0, 2025: .85, 2024: .55, 2023: .3}
world = json.load(open(os.path.join(ROOT, 'data', 'world.json')))
pos_of = {p[9]: p[2] for c in world['clubs'] for p in c['players'] if len(p) > 9 and p[9]}
# team goals and games per (season, division, club)
tg = {}
for f in glob.glob(os.path.join(EV, 'fix_*_*.json')):
    s = int(os.path.basename(f).split('_')[1]); div = os.path.basename(f).split('_')[2][:-5]
    for m in json.load(open(f)):
        if m['st'] in ('FT', 'AET', 'PEN') and m['hg'] is not None:
            for t, gf in ((m['h'], m['hg']), (m['a'], m['ag'])):
                x = tg.setdefault((s, div, t), [0, 0]); x[0] += gf; x[1] += 1
rows = []                                          # (player id, season, minutes, goals, assists, rating, exposure)
for f in glob.glob(os.path.join(EV, 'pl_*_*.json')):
    s = int(os.path.basename(f).split('_')[1]); div = os.path.basename(f).split('_')[2][:-5]
    for r in json.load(open(f)):
        mn = r.get('min') or 0
        t = tg.get((s, div, r['club']))
        if mn < 1 or not t or t[1] == 0: continue
        rows.append(dict(id=r['id'], s=s, min=mn, g=r.get('g') or 0, a=r.get('a') or 0, rt=float(r['rt']) if r.get('rt') else None, E=t[0] * mn / (90.0 * t[1]), pos=pos_of.get(r['id'])))
print('player-seasons', len(rows), '| matched to our world', sum(1 for r in rows if r['pos']))
# position priors from pooled data (players with real minutes)
pr = collections.defaultdict(lambda: [0, 0, 0, 0, 0.0, 0.0, 0])      # G, A, E, n, sum rating*min, sum min, ...
for r in rows:
    if r['pos'] and r['min'] >= 600:
        x = pr[r['pos']]; x[0] += r['g']; x[1] += r['a']; x[2] += r['E']
        if r['rt']: x[4] += r['rt'] * r['min']; x[5] += r['min']
mu_g = {p: x[0] / x[2] for p, x in pr.items() if x[2]}; mu_a = {p: x[1] / x[2] for p, x in pr.items() if x[2]}; mu_r = {p: x[4] / x[5] for p, x in pr.items() if x[5]}
sd = collections.defaultdict(list)
for r in rows:
    if r['pos'] and r['min'] >= 900 and r['rt']: sd[r['pos']].append(r['rt'])
sd_r = {p: max(.2, math.sqrt(sum((v - mu_r[p]) ** 2 for v in a) / len(a))) for p, a in sd.items()}
print('goal share by position (mean):', {p: round(v, 3) for p, v in mu_g.items()}); print('assist share:', {p: round(v, 3) for p, v in mu_a.items()}); print('rating mean/sd:', {p: (round(mu_r[p], 2), round(sd_r[p], 2)) for p in sd_r})
by = collections.defaultdict(list)
for r in rows: by[r['id']].append(r)
AG, AA, AR = 8.0, 8.0, 900.0
prof = {}
for pid, rs in by.items():
    pos = rs[0]['pos']
    if not pos or pos not in mu_g: continue
    G = sum(W[r['s']] * r['g'] for r in rs); A = sum(W[r['s']] * r['a'] for r in rs); E = sum(W[r['s']] * r['E'] for r in rs); M = sum(W[r['s']] * r['min'] for r in rs)
    gs = (G + AG) / (E + AG / max(mu_g[pos], .004)); as_ = (A + AA) / (E + AA / max(mu_a[pos], .004))
    rr = [(W[r['s']] * r['min'], r['rt']) for r in rs if r['rt'] and r['min'] >= 180]
    sw = sum(w for w, _ in rr); R = (sum(w * v for w, v in rr) + AR * mu_r.get(pos, 6.8)) / (sw + AR) if rr else mu_r.get(pos, 6.8)
    prof[pid] = [round(gs, 4), round(as_, 4), round((R - mu_r.get(pos, 6.8)) / sd_r.get(pos, .3), 2), round(M)]
n = 0
for c in world['clubs']:
    for p in c['players']:
        while len(p) < 14: p.append(None)
        x = prof.get(p[9]) if p[9] else None
        if x: p[10], p[11], p[12], p[13] = x; n += 1
world['priors'] = dict(g={k: round(v, 4) for k, v in mu_g.items()}, a={k: round(v, 4) for k, v in mu_a.items()}, r={k: round(v, 3) for k, v in mu_r.items()}, sd={k: round(v, 3) for k, v in sd_r.items()})
json.dump(world, open(os.path.join(ROOT, 'data', 'world.json'), 'w'), ensure_ascii=False)
print('profiles attached to', n, 'players')
top = sorted(((v[0], pid) for pid, v in prof.items() if v[3] >= 1500 and pos_of.get(pid) in ('ST', 'W', 'AM')), reverse=True)[:8]
names = {p[9]: p[0] for c in world['clubs'] for p in c['players'] if len(p) > 9 and p[9]}
print('highest goal shares (>=1500 weighted min):', ', '.join('%s %.2f' % (names.get(pid, pid), v) for v, pid in top))
