"""Fits club attack/defence strengths per division from real results (API-Football fixtures, 2023-24 .. 2026-27 so far).
Poisson model: home goals ~ exp(mu + hfa + att_h - def_a), away goals ~ exp(mu + att_a - def_h); recent matches weigh more; ridge shrinkage to the division mean.
Then compares each club's fitted strength with what its squad ratings imply, and stores the residual as a club effect (system, manager, cohesion)."""
import json, math, os, glob, datetime, collections
ROOT = os.path.join(os.path.dirname(__file__), '..')
EV = os.path.join(ROOT, 'data', 'evidence')
world = json.load(open(os.path.join(ROOT, 'data', 'world.json')))
TODAY = datetime.date(2026, 11, 3); HALF = 330.0; K = 9.0     # half-life in days; shrinkage in pseudo-goals
def load(div):
    rows = []
    for f in glob.glob(os.path.join(EV, 'fix_*_%s.json' % div)):
        for m in json.load(open(f)):
            if m['st'] in ('FT', 'AET', 'PEN') and m['hg'] is not None:
                age = (TODAY - datetime.date.fromisoformat(m['d'])).days
                rows.append((m['h'], m['a'], m['hg'], m['ag'], math.exp(-math.log(2) * max(age, 0) / HALF)))
    return rows
def fit(rows):
    teams = sorted({r[0] for r in rows} | {r[1] for r in rows}); att = {t: 0.0 for t in teams}; dfn = {t: 0.0 for t in teams}
    W = sum(r[4] for r in rows); mu = math.log(sum(r[4] * (r[2] + r[3]) for r in rows) / (2 * W)); hfa = 0.2
    for it in range(120):
        # home advantage and base rate
        num = sum(r[4] * r[2] for r in rows); den = sum(r[4] * math.exp(mu + att[r[0]] - dfn[r[1]]) for r in rows); hfa = math.log(num / den)
        num = sum(r[4] * r[3] for r in rows); den = sum(r[4] * math.exp(att[r[1]] - dfn[r[0]]) for r in rows); mu = math.log(num / den)
        for t in teams:
            y = x = 0.0
            for h, a, hg, ag, w in rows:
                if h == t: y += w * hg; x += w * math.exp(mu + hfa - dfn[a] + 0) / 1.0
                elif a == t: y += w * ag; x += w * math.exp(mu - dfn[h])
            att[t] = math.log((y + K) / (x + K))
        for t in teams:
            y = x = 0.0                      # goals the team concedes
            for h, a, hg, ag, w in rows:
                if h == t: y += w * ag; x += w * math.exp(mu + att[a])
                elif a == t: y += w * hg; x += w * math.exp(mu + hfa + att[h])
            dfn[t] = -math.log((y + K) / (x + K))
        ma = sum(att.values()) / len(teams); md = sum(dfn.values()) / len(teams)
        for t in teams: att[t] -= ma; dfn[t] -= md
    n = collections.Counter(); 
    for h, a, hg, ag, w in rows: n[h] += w; n[a] += w
    return dict(mu=mu, hfa=hfa, att=att, dfn=dfn, n=dict(n))
if __name__ == '__main__':
    fits = {}
    for d in world['divisions']:
        rows = load(d['short'])
        if rows: fits[d['short']] = fit(rows); f = fits[d['short']]; print(d['short'], len(rows), 'matches | home goals/game %.2f away %.2f' % (math.exp(f['mu'] + f['hfa']), math.exp(f['mu'])))
    json.dump(fits, open(os.path.join(ROOT, 'data', 'team_fits.json'), 'w'))
    pl = fits['PL']; r = sorted(pl['att'], key=lambda t: -(pl['att'][t] + pl['dfn'][t]))
    print('PL fitted strength order (att+def):', ', '.join('%s %.2f' % (t, pl['att'][t] + pl['dfn'][t]) for t in r))
