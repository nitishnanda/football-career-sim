"""Out-of-sample test of the player model: profiles from 2023-24..2025-26 only, predict each player's 2026-27 goals and assists so far."""
import glob, json, math, os, collections
ROOT = os.path.join(os.path.dirname(__file__), '..'); EV = os.path.join(ROOT, 'data', 'evidence')
W = {2025: .85, 2024: .55, 2023: .3}
world = json.load(open(os.path.join(ROOT, 'data', 'world.json')))
pos_of = {p[9]: p[2] for c in world['clubs'] for p in c['players'] if len(p) > 9 and p[9]}
tg = {}
for f in glob.glob(os.path.join(EV, 'fix_*_*.json')):
    s = int(os.path.basename(f).split('_')[1]); div = os.path.basename(f).split('_')[2][:-5]
    for m in json.load(open(f)):
        if m['st'] in ('FT', 'AET', 'PEN') and m['hg'] is not None:
            for t, gf in ((m['h'], m['hg']), (m['a'], m['ag'])):
                x = tg.setdefault((s, div, t), [0, 0]); x[0] += gf; x[1] += 1
rows = collections.defaultdict(list)
for f in glob.glob(os.path.join(EV, 'pl_*_*.json')):
    s = int(os.path.basename(f).split('_')[1]); div = os.path.basename(f).split('_')[2][:-5]
    for r in json.load(open(f)):
        mn = r.get('min') or 0; t = tg.get((s, div, r['club']))
        if mn < 1 or not t or t[1] == 0 or r['id'] not in pos_of: continue
        rows[s].append(dict(id=r['id'], div=div, min=mn, g=r.get('g') or 0, a=r.get('a') or 0, E=t[0] * mn / (90.0 * t[1]), pos=pos_of[r['id']], n=r['n']))
# priors from the training seasons only
tot = collections.defaultdict(lambda: [0, 0, 0.0])
for s in W:
    for r in rows[s]:
        if r['min'] >= 600: x = tot[r['pos']]; x[0] += r['g']; x[1] += r['a']; x[2] += r['E']
mg = {p: x[0] / x[2] for p, x in tot.items()}; ma = {p: x[1] / x[2] for p, x in tot.items()}
ev = collections.defaultdict(lambda: [0.0, 0.0, 0.0])
for s in W:
    for r in rows[s]: x = ev[r['id']]; x[0] += W[s] * r['g']; x[1] += W[s] * r['a']; x[2] += W[s] * r['E']
def post(pid, pos, which, a):
    G, A, E = ev[pid] if pid in ev else (0, 0, 0); mu = (mg if which == 'g' else ma)[pos]
    return ((G if which == 'g' else A) + a) / (E + a / max(mu, .004))
def corr(x, y):
    mx, my = sum(x) / len(x), sum(y) / len(y); sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)
def loglik(pred, act): return sum(a * math.log(max(p, 1e-6)) - p for p, a in zip(pred, act)) / len(pred)
test = [r for r in rows[2026] if r['min'] >= 270 and r['pos'] != 'GK']
print('players tested', len(test), '(>=270 minutes in 2026-27, outfield)')
for which, key, strength in (('goals', 'g', 3.0), ('assists', 'a', 4.0)):
    act = [r[key] for r in test]
    base = [(mg if key == 'g' else ma)[r['pos']] * r['E'] for r in test]
    prof = [post(r['id'], r['pos'], key, strength) * r['E'] for r in test]
    has = [r['id'] in ev for r in test]
    print('%-8s | corr: position-average %.2f -> player profile %.2f | log-likelihood per player: %.3f -> %.3f | players with history %d%%' % (which, corr(act, base), corr(act, prof), loglik(base, act), loglik(prof, act), 100 * sum(has) // len(has)))
    # who does it pick as the leaders?
    for div in ('PL', 'LL', 'BL', 'SA', 'F1'):
        sub = [(post(r['id'], r['pos'], key, strength) * r['E'], r[key], r['n']) for r in test if r['div'] == div]
        topp = sorted(sub, reverse=True)[:5]; topa = sorted(sub, key=lambda x: -x[1])[:5]
        ov = len({x[2] for x in topp} & {x[2] for x in topa})
        print('   %s predicted top5: %s | actual top5: %s | overlap %d/5' % (div, ', '.join(x[2] for x in topp), ', '.join('%s %d' % (x[2], x[1]) for x in topa), ov))
