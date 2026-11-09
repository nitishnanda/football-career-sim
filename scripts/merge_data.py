"""Merges API-Football squads (2026-27, end of summer window) with Wikipedia (positions/caps) and Transfermarkt (market values) into data/world.json."""
import csv, json, os, re, unicodedata, collections
ROOT = os.path.join(os.path.dirname(__file__), '..')
TM = os.path.expanduser('~/Downloads/archive 2')
def norm(x):
    x = unicodedata.normalize('NFKD', x or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z ]', ' ', re.sub(r'\(.*?\)', '', x))
def toks(x): return {t for t in norm(x).split() if len(t) >= 3}

api = json.load(open(os.path.join(ROOT, 'data', 'apif_world.json')))
wiki = json.load(open(os.path.join(ROOT, 'data', 'world_wiki.json')))
# Wikipedia players by birth year
wy = collections.defaultdict(list)
for c in wiki['clubs']:
    for p in c['players']: wy[p[3]].append(p)
# Transfermarkt: by date of birth, latest valuation
tp = collections.defaultdict(list)
tpy = collections.defaultdict(list)
val = {}
for r in csv.DictReader(open(os.path.join(TM, 'player_valuations.csv'), encoding='utf8')):
    if r['market_value_in_eur']: val[r['player_id']] = (r['date'], float(r['market_value_in_eur']))
for r in csv.DictReader(open(os.path.join(TM, 'players.csv'), encoding='utf8')):
    if r['date_of_birth']:
        tp[r['date_of_birth'][:10]].append(r); tpy[int(r['date_of_birth'][:4])].append(r)
SUB = {'goalkeeper': 'GK', 'centre-back': 'CB', 'left-back': 'FB', 'right-back': 'FB', 'defensive midfield': 'DM', 'central midfield': 'CM', 'attacking midfield': 'AM', 'left midfield': 'W', 'right midfield': 'W', 'left winger': 'W', 'right winger': 'W', 'second striker': 'AM', 'centre-forward': 'ST'}
def pick(cands, nameset, key):
    best, bs, tie = None, 0, False
    for c in cands:
        s = len(nameset & toks(key(c)))
        if s > bs: best, bs, tie = c, s, False
        elif s == bs and s > 0: tie = True   # two equally good candidates: ambiguous, so no match
    return None if tie else (best if bs else None)
def heur(pos, no):
    if pos == 'Goalkeeper': return 'GK'
    if pos == 'Defender': return 'FB' if no in (2, 3) else 'CB'
    if pos == 'Midfielder': return 'DM' if no in (4, 5, 6) else 'AM' if no == 10 else 'W' if no in (7, 11) else 'CM'
    return 'W' if no in (7, 11, 17) else 'AM' if no == 10 else 'ST'
ALIAS = {'wolves': 'wolverhampton wanderers', 'qpr': 'queens park rangers', 'west brom': 'west bromwich albion', 'rennes': 'stade rennais', 'paris saint germain': 'paris saint germain', 'sheffield utd': 'sheffield united', 'atletico madrid': 'atletico madrid', 'ac milan': 'milan'}
def wtoks(x):
    x = ALIAS.get(norm(x).strip(), norm(x))
    return {t for t in x.replace('-', ' ').split() if len(t) >= 3 and t not in ('club', 'football', 'fc', 'afc', 'cf')}
def wiki_club(c):
    best, bs = None, 0
    for w in wiki['clubs']:
        if w['div'] != c['div']: continue
        a, b = wtoks(c['name']), wtoks(w['name']) | wtoks(w['title'])
        s = len(a & b) * 2 - len(a ^ (a & b)) * 0.01
        if (w['ground'] and c['ground'] and norm(w['ground']).strip() == norm(c['ground']).strip()): s += 5
        if s > bs: best, bs = w, s
    return best if bs > 0 else None
# extra player info (birth dates for players with no 2026 appearances yet)
extra = json.load(open(os.path.join(ROOT, 'data', 'apif_extra.json'))) if os.path.exists(os.path.join(ROOT, 'data', 'apif_extra.json')) else {}
# players listed at two clubs (loans, B-teams): keep him where his latest dated transfer put him, else at the lowest-tier club
CUT = '2026-09-03'
cache = json.load(open(os.path.join(ROOT, 'data', 'apif_cache.json')))
last = {}
for k, v in cache.items():
    if k.startswith('transfers?team='):
        for item in (v.get('response') or []):
            pid = item['player']['id']
            for x_ in item.get('transfers', []):
                d, to = x_.get('date'), (x_['teams'].get('in') or {}).get('id')
                if d and d <= CUT and to and (pid not in last or d > last[pid][0]): last[pid] = (d, to)
tier_of_div = {d['short']: d['tier'] for d in wiki['divisions']}
tier_of = {c['id']: tier_of_div[c['div']] for c in api}
holders = collections.defaultdict(list)
for c in api:
    for p in c['players']: holders[p['id']].append(c['id'])
drop = set()
for pid, cl in holders.items():
    if len(cl) < 2: continue
    keep = last[pid][1] if pid in last and last[pid][1] in cl else max(cl, key=lambda cid: tier_of[cid])
    for cid in cl:
        if cid != keep: drop.add((cid, pid))
st = collections.Counter(); out = dict(divisions=wiki['divisions'], clubs=[])
for c in api:
    pls = []
    wc = wiki_club(c)
    wcy = collections.defaultdict(list)
    for pl_ in (wc['players'] if wc else []): wcy[pl_[3]].append(pl_)
    for p in c['players']:
        if (c['id'], p['id']) in drop: st['duplicates dropped'] += 1; continue
        x_ = extra.get(str(p['id']))
        if x_ and not p.get('dob'): p['dob'] = x_['dob']; p['full'] = p['full'] or x_['full']; p['nat'] = p['nat'] or x_['nat']
        names = toks(p['full'] or '') | toks(p['name'])
        dobk = bool(p.get('dob'))
        by = int(p['dob'][:4]) if dobk else (2026 - int(p['age'])) if p.get('age') else None
        if not by: st['no age'] += 1; continue
        tol = 0 if dobk else 1
        ini = norm(p['name']).strip()[:1] if re.match(r'^[A-Z]\. ', p['name']) and not p['full'] else None
        cw = [y_ for yr in range(by - tol, by + tol + 1) for y_ in wcy.get(yr, []) if not ini or norm(y_[0]).strip()[:1] == ini]
        w = pick(cw, names, lambda y_: y_[0])
        if w and len(names & toks(w[0])) < 2 and not (norm(w[0]).split()[-1:] and norm(w[0]).split()[-1] in names): w = None
        ct = tp.get(p['dob'][:10], []) if dobk else [r for yr in range(by - 1, by + 2) for r in tpy.get(yr, []) if not ini or norm(r['name']).strip()[:1] == ini]
        t = pick(ct, names, lambda r: r['name'])
        v = val.get(t['player_id'], (None, 0))[1] / 1e6 if t else 0
        pos = (w[2] if w else None) or (SUB.get((t or {}).get('sub_position', '').lower()) if t else None) or heur(p['pos'], p['no'])
        name = (w[0].replace(' (footballer)', '') if w else None) or ((t or {}).get('name')) or p['full'] or p['name']
        caps = (w[5] if w else 0) or (int(float(t['international_caps'])) if t and t['international_caps'] else 0)
        nat = (w[4] if w else '') or ((t or {}).get('country_of_citizenship') or '') or p['nat']
        st['wiki'] += bool(w); st['tm'] += bool(t); st['value'] += v > 0; st['n'] += 1
        pls.append([name, name.split()[-1], pos, by, nat, caps, p['no'], round(v, 2), 0, p['id']])
    wc = wiki_club(c)
    mg = (wc or {}).get('manager') or ''
    if not mg or mg.lower() in ('vacant', 'caretaker', 'interim'): mg = c['manager']; st['manager from API'] += 1; print('manager fallback to API:', c['name'], '->', mg)
    if not wc: print('no wiki club match:', c['name'])
    out['clubs'].append(dict(title=c['name'], div=c['div'], name=c['name'], ground=c['ground'] or (wc or {}).get('ground', ''), manager=mg, squad=[], players=pls))
# ---- FBref 2026-27 (top five leagues): authoritative club for anyone with minutes, adds regulars we lacked, fixes impossible positions, records minutes
CT = {'Premier League': 'PL', 'La Liga': 'LL', 'Bundesliga': 'BL', 'Serie A': 'SA', 'Ligue 1': 'F1'}
FBA = {'brest': 'stade brestois 29', 'paris s-g': 'paris saint germain', 'paris sg': 'paris saint germain', 'gladbach': 'borussia monchengladbach', 'manchester utd': 'manchester united', 'newcastle utd': 'newcastle', "nott'ham forest": 'nottingham forest', 'wolves': 'wolverhampton wanderers'}
FBA = {norm(k).strip(): v for k, v in FBA.items()}
def cset(x): x = FBA.get(norm(x).strip(), norm(x)); return {t for t in x.replace('-', ' ').split() if len(t) >= 2}
def fb_club(div, sq):
    a = cset(sq); best, bs = None, 0
    for c in out['clubs']:
        if c['div'] != div: continue
        b = cset(c['name']) | cset(c['title']); sc = len(a & b) / len(a | b)
        if sc > bs: best, bs = c, sc
    return best
def fpos(s):
    f, _, sec = s.partition(',')
    if f == 'GK': return 'GK'
    if f == 'DF': return 'FB' if sec == 'MF' else 'CB'
    if f == 'MF': return 'AM' if sec == 'FW' else 'DM' if sec == 'DF' else 'CM'
    return 'W' if sec == 'MF' else 'ST'
COMPAT = {'GK': {'GK'}, 'DF': {'CB', 'FB'}, 'MF': {'DM', 'CM', 'AM', 'W', 'FB'}, 'FW': {'ST', 'W', 'AM'}}
ISO = {'ENG': 'England', 'SCO': 'Scotland', 'ESP': 'Spain', 'FRA': 'France', 'GER': 'Germany', 'ITA': 'Italy', 'POR': 'Portugal', 'BRA': 'Brazil', 'ARG': 'Argentina', 'NED': 'Netherlands', 'BEL': 'Belgium', 'CRO': 'Croatia', 'URU': 'Uruguay', 'COL': 'Colombia', 'MAR': 'Morocco', 'SEN': 'Senegal', 'NGA': 'Nigeria', 'GHA': 'Ghana', 'USA': 'USA', 'MEX': 'Mexico', 'JPN': 'Japan', 'KOR': 'South Korea', 'DEN': 'Denmark', 'SUI': 'Switzerland', 'NOR': 'Norway', 'TUR': 'Turkey'}
fbrows = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'fbref', 'players_data_light-2026_2027.csv'), encoding='utf8')))
fs = collections.Counter()
for r in fbrows:
    mins = int(float(r['Min'] or 0))
    if mins < 1 or not r['Born']: continue
    div = CT[r['Comp'].split(' ', 1)[1]]; c = fb_club(div, r['Squad'])
    if not c: continue
    names, by = toks(r['Player']), int(r['Born']); first = r['Pos'].split(',')[0]
    mine = [p for p in c['players'] if p[3] == by and names & toks(p[0])]
    if mine:
        p = mine[0]; fs['at right club'] += 1
        p[8] = mins
        if p[2] not in COMPAT[first]: p[2] = fpos(r['Pos']); fs['position corrected'] += 1
        continue
    other = None
    for cc in out['clubs']:
        if cc is c: continue
        for p in cc['players']:
            if p[3] == by and (len(names & toks(p[0])) >= 2 or (names and norm(p[0]).split()[-1:] == norm(r['Player']).split()[-1:] and names & toks(p[0]))): other = (cc, p); break
        if other: break
    nat = ISO.get(r['Nation'].split()[-1], '')
    if other:
        cc, p = other; cc['players'].remove(p); p = p[:8] + [mins] + p[9:]
        if p[2] not in COMPAT[first]: p[2] = fpos(r['Pos'])
        c['players'].append(p); fs['moved to FBref club'] += 1
    else:
        c['players'].append([r['Player'], r['Player'].split()[-1], fpos(r['Pos']), by, nat, 0, 0, 0, mins, 0]); fs['added (was missing)'] += 1
print('FBref merge:', dict(fs))
json.dump(out, open(os.path.join(ROOT, 'data', 'world.json'), 'w'), ensure_ascii=False)
print(dict(st), 'clubs', len(out['clubs']))
