"""Out-of-sample test of the team model: fit on seasons up to 2024-25, predict every 2025-26 match, compare expected vs actual final points."""
import glob, json, math, os, sys, datetime, collections
sys.path.insert(0, os.path.dirname(__file__))
import fit_teams as F
def pois(l, n=9):
    p = [math.exp(-l)]
    for k in range(1, n): p.append(p[-1] * l / k)
    return p
def probs(lh, la):
    ph, pa = pois(lh), pois(la); w = d = 0.0
    for i, a in enumerate(ph):
        for j, b in enumerate(pa):
            if i > j: w += a * b
            elif i == j: d += a * b
    t = sum(ph) * sum(pa); return w / t, d / t
def rows_for(div, seasons):
    out = []
    for s in seasons:
        f = os.path.join(F.EV, 'fix_%d_%s.json' % (s, div))
        if os.path.exists(f):
            for m in json.load(open(f)):
                if m['st'] in ('FT', 'AET', 'PEN') and m['hg'] is not None: out.append(m)
    return out
def pts(ms):
    p = collections.Counter()
    for m in ms:
        if m['hg'] > m['ag']: p[m['h']] += 3
        elif m['hg'] < m['ag']: p[m['a']] += 3
        else: p[m['h']] += 1; p[m['a']] += 1
    return p
def corr(x, y):
    mx, my = sum(x) / len(x), sum(y) / len(y); sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)
print('division | clubs | corr(model) | corr(last-season pts) | RMSE model | RMSE last-season  (points)')
tot = collections.defaultdict(list)
for div in ('PL', 'LL', 'BL', 'SA', 'F1', 'CH', 'L1E', 'L2E', 'LL2', 'BL2', 'SB', 'F2'):
    test = rows_for(div, [2025])
    if not test: continue
    train = []
    TODAY0 = datetime.date(2025, 8, 1)
    for m in rows_for(div, [2023, 2024]):
        age = (TODAY0 - datetime.date.fromisoformat(m['d'])).days
        train.append((m['h'], m['a'], m['hg'], m['ag'], math.exp(-math.log(2) * max(age, 0) / F.HALF)))
    fit = F.fit(train); mu, hfa = fit['mu'], fit['hfa']
    ep = collections.Counter()
    for m in test:
        a = fit['att'].get(m['h'], -.15); d = fit['dfn'].get(m['h'], -.15); a2 = fit['att'].get(m['a'], -.15); d2 = fit['dfn'].get(m['a'], -.15)
        w, dr = probs(math.exp(mu + hfa + a - d2), math.exp(mu + a2 - d))
        ep[m['h']] += 3 * w + dr; ep[m['a']] += 3 * (1 - w - dr) + dr
    act = pts(test); prev = pts(rows_for(div, [2024])); teams = sorted(act)
    base = {t: prev[t] if t in prev else min(prev.values()) * .9 for t in teams}
    scale = sum(act.values()) / sum(base.values()); n = len(teams)
    xa, xe, xb = [act[t] for t in teams], [ep[t] for t in teams], [base[t] * scale for t in teams]
    rm = math.sqrt(sum((a - e) ** 2 for a, e in zip(xa, xe)) / n); rb = math.sqrt(sum((a - e) ** 2 for a, e in zip(xa, xb)) / n)
    print('%-4s | %2d | %.2f | %.2f | %4.1f | %4.1f' % (div, n, corr(xa, xe), corr(xa, xb), rm, rb))
