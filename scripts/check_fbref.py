"""Cross-checks our squads against the FBref 2026-27 player file: who played minutes but is missing, or sits at a different club."""
import csv, json, re, unicodedata, collections, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
def norm(x):
    x = unicodedata.normalize('NFKD', x or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z ]', ' ', re.sub(r'\(.*?\)', '', x))
def toks(x): return {t for t in norm(x).split() if len(t) >= 3}
CT = {'Premier League': 'PL', 'La Liga': 'LL', 'Bundesliga': 'BL', 'Serie A': 'SA', 'Ligue 1': 'F1'}
w = json.load(open(os.path.join(ROOT, 'data', 'world.json')))
fb = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'fbref', 'players_data_light-2026_2027.csv'), encoding='utf8')))
ALIAS = {'brest': 'stade brestois 29', 'paris s-g': 'paris saint germain', 'manchester utd': 'manchester united', 'newcastle utd': 'newcastle', "nott'ham forest": 'nottingham forest', 'wolves': 'wolverhampton', 'brighton': 'brighton', 'paris s-g': 'paris saint germain', 'inter': 'inter', 'milan': 'milan', 'atletico madrid': 'atletico madrid', 'athletic club': 'athletic', 'betis': 'betis', 'leverkusen': 'leverkusen', 'gladbach': 'monchengladbach', 'eint frankfurt': 'frankfurt', 'köln': 'koln', 'mainz 05': 'mainz', 'rb leipzig': 'leipzig', 'st. pauli': 'pauli', 'stuttgart': 'stuttgart', 'heidenheim': 'heidenheim'}
def ct(x): x = ALIAS.get(norm(x).strip(), norm(x)); return {t for t in x.replace('-', ' ').split() if len(t) >= 2}
clubs = [c for c in w['clubs'] if c['div'] in CT.values()]
def find_club(div, squad):
    a = ct(squad); best, bs = None, 0
    for c in clubs:
        if c['div'] != div: continue
        b = ct(c['name']) | ct(c['title'])
        s = len(a & b) / len(a | b)
        if s > bs: best, bs = c, s
    return best
byyear = collections.defaultdict(list)
for c in w['clubs']:
    for p in c['players']: byyear[p[3]].append((c, p))
stats = collections.Counter(); missing = []; wrongclub = []; unmapped = set()
for r in fb:
    mins = int(float(r['Min'] or 0))
    if mins < 90: continue
    div = CT[r['Comp'].split(' ', 1)[1]]; c = find_club(div, r['Squad'])
    if not c: unmapped.add(r['Squad']); continue
    names = toks(r['Player']); by = int(r['Born']) if r['Born'] else None
    here = [(c, p) for p in c['players'] if p[3] == by and names & toks(p[0])]                      # same club: any shared name part + birth year
    cand = here or [(cc, p) for cc, p in byyear.get(by, []) if len(names & toks(p[0])) >= 2 or (names and norm(p[0]).split()[-1:] == norm(r['Player']).split()[-1:])]
    stats['players with >=90 min'] += 1
    if here: stats['found at same club'] += 1
    elif cand: stats['found at a different club'] += 1; wrongclub.append((r['Player'], r['Squad'], mins, [x[0]['name'] for x in cand][:2]))
    else: stats['not in our world at all'] += 1; missing.append((mins, r['Player'], r['Squad'], r['Pos']))
print(dict(stats)); print('unmapped squads:', sorted(unmapped))
missing.sort(reverse=True); print('MISSING (top 25 by minutes):'); [print(' ', *m) for m in missing[:25]]
print('WRONG CLUB (first 20):'); [print(' ', *m) for m in wrongclub[:20]]
