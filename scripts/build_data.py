"""Builds data/world.json from Wikipedia: clubs per division, managers, grounds, squads, player details."""
import json, re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wiki import fetch, fetch_at
from concurrent.futures import ThreadPoolExecutor
TS = '2026-09-03T00:00:00Z'  # after the end-of-window clean-up edits on 2 Sept; nothing later
from divs import DIVS, strategies

ROOT = os.path.join(os.path.dirname(__file__), '..')
CACHE = os.path.join(ROOT, 'data', 'cache.json')
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

def get(titles, key, section0=False):
    need = [t for t in titles if (key + '|' + t) not in cache]
    if need:
        for i in range(0, len(need), 50):
            part = fetch(need[i:i + 50], section0)
            for t, x in part.items(): cache[key + '|' + t] = x
            json.dump(cache, open(CACHE, 'w'))
            print(key, min(i + 50, len(need)), '/', len(need), flush=True)
    return {t: cache[key + '|' + t] for t in titles}

def hist(titles, key):
    need = [t for t in titles if (key + '|' + t) not in cache]
    if need:
        with ThreadPoolExecutor(4) as ex:
            for i, (t, x) in enumerate(zip(need, ex.map(lambda t: fetch_at(t, TS), need))):
                cache[key + '|' + t] = x
        json.dump(cache, open(CACHE, 'w'))
        print(key, 'fetched', len(need), flush=True)
    return {t: cache[key + '|' + t] for t in titles}

def clubs_of(div, x):
    s = strategies(x); name = div[2]
    if name == 'La Liga':
        m = re.search(r'Stadiums and locations===(.*?)\n\|\}', x, re.S)
        l = []
        for row in m.group(1).split('\n|-')[1:]:
            a = re.search(r'\[\[([^\]|#]+)', row)
            if a: l.append(a.group(1).strip())
        return l
    if name == 'Ligue 1': return [t for t in s['label'] if t != 'Paris'] + ['Paris Saint-Germain F.C.', 'Paris FC']
    if name == 'Ligue 2': return s['label']
    if name == 'Ligue 3': return s['name'] + ['Football Bourg-en-Bresse Péronnas 01']
    if name == 'Serie B': return s['name'] + ['FC Südtirol']
    if name == 'Primera Federación':
        l = [t for t in s['name'] if t != 'Real Murcia']
        return l
    return s['name'] or s['label']

def clean(v):
    v = re.sub(r'<ref.*?(</ref>|/>)', '', v, flags=re.S)
    v = re.sub(r'\{\{[^{}]*\}\}', '', v)
    m = re.search(r'\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', v)
    return (m.group(1) if m else re.sub(r"[\[\]']", '', v)).strip()

def field(x, names):
    for n in names:
        m = re.search(r'\|\s*' + n + r'\s*=\s*(.*?)(?=\n\s*\||\n\}\})', x, re.S)
        if m and m.group(1).strip(): return m.group(1)
    return None

POS = [('goalkeeper', 'GK'), ('centre-back', 'CB'), ('center-back', 'CB'), ('centre back', 'CB'), ('sweeper', 'CB'), ('wing-back', 'FB'), ('wingback', 'FB'), ('leftback', 'FB'), ('rightback', 'FB'), ('fullback', 'FB'), ('right-back', 'FB'), ('left-back', 'FB'), ('defensive midfield', 'DM'), ('attacking midfield', 'AM'), ('central midfield', 'CM'), ('centre-half', 'CB'), ('center-half', 'CB'), ('midfield', 'CM'), ('wing back', 'FB'), ('full-back', 'FB'), ('full back', 'FB'), ('right back', 'FB'), ('left back', 'FB'), ('defensive midfielder', 'DM'), ('holding midfielder', 'DM'), ('attacking midfielder', 'AM'), ('second striker', 'AM'), ('central midfielder', 'CM'), ('centre midfielder', 'CM'), ('winger', 'W'), ('wide midfielder', 'W'), ('right midfielder', 'W'), ('left midfielder', 'W'), ('centre-forward', 'ST'), ('centre forward', 'ST'), ('striker', 'ST'), ('forward', 'ST'), ('defender', 'CB'), ('midfielder', 'CM')]
CODES = {'gk': 'GK', 'cb': 'CB', 'rb': 'FB', 'lb': 'FB', 'rwb': 'FB', 'lwb': 'FB', 'dm': 'DM', 'cm': 'CM', 'am': 'AM', 'cam': 'AM', 'rw': 'W', 'lw': 'W', 'rm': 'W', 'lm': 'W', 'st': 'ST', 'cf': 'ST', 'fw': 'ST', 'df': 'CB', 'mf': 'CM'}
def pos_of(txt):
    if not txt: return None
    c = CODES.get(re.sub(r'[^a-z]', '', txt.lower().split('<')[0]))
    if c: return c
    links = re.findall(r'\[\[(?:[^\]|]*\|)?([^\]]+)\]\]', txt) or [txt]
    for l in links:
        l = l.lower()
        for k, v in POS:
            if k in l: return v
    return None

MONTHS = {m: i + 1 for i, m in enumerate('jan feb mar apr may jun jul aug sep oct nov dec'.split())}
def player_info(x):
    if not x: return None
    pos = pos_of(field(x, ['position', 'positions']))
    bd = re.search(r'birth[ _-]?date[^|{}]*\|\s*(?:df=\w+\|)?(\d{4})\s*\|\s*([A-Za-z]+|\d{1,2})', x, re.I)
    nat, caps = None, 0
    for i in range(1, 13):
        t = field(x, ['national_team%d' % i, 'nationalteam%d' % i])
        if not t: continue
        low = t.lower()
        m = re.search(r'\[\[([^\]|]*?) national (?:football|under|olympic|youth|team)', t, re.I) or re.search(r'\[\[([A-Z][^\]|]*?) national', t)
        country = m.group(1).strip() if m else None
        senior = 'national football team' in low and not re.search(r'under|u-?\d\d|olympic|b team|amateur', low)
        if country and nat is None: nat = country
        if senior and country:
            nat = country
            c = field(x, ['national_caps%d' % i, 'nationalcaps%d' % i])
            mm = re.search(r'\d+', re.sub(r'<!--.*?-->|<ref.*?(</ref>|/>)', '', c, flags=re.S)) if c else None
            caps = int(mm.group(0)) if mm else 0
            break
    return {'pos': pos, 'by': int(bd.group(1)) if bd else None, 'bm': (int(bd.group(2)) if bd.group(2).isdigit() else MONTHS.get(bd.group(2)[:3].lower(), 6)) if bd else 6, 'nat': nat, 'caps': caps}

def main():
    arts = get([d[4] for d in DIVS], 'art')
    divisions = []
    for d in DIVS:
        l = clubs_of(d, arts[d[4]])
        if d[2] == 'Primera Federación':
            divisions.append(dict(country=d[0], tier=d[1], name='Primera Federación G1', short='PF1', titles=l[:20]))
            divisions.append(dict(country=d[0], tier=d[1], name='Primera Federación G2', short='PF2', titles=l[20:40]))
        else:
            divisions.append(dict(country=d[0], tier=d[1], name=d[2], short=d[3], titles=l))
        print(d[2], len(l), '(expected %d)' % d[5])
    titles = [t for dv in divisions for t in dv['titles']]
    pages = get(titles, 'clubm', True)  # fetched fresh: managers and grounds as of now
    # squad templates
    sq_titles = ['Template:%s squad' % t for t in titles]
    sq = hist(sq_titles, 'sqh2')          # squad templates as at the 2026 deadline
    sqc = get(sq_titles, 'squad')        # current templates, only a fallback
    miss = [t for t in titles if not sq['Template:%s squad' % t]]
    print('missing squad templates:', len(miss), miss[:25])
    short = [t for t in titles if len(re.findall(r'football squad2? player|Fs player', re.sub(r'<!--.*?-->', '', (sq['Template:%s squad' % t] or sqc['Template:%s squad' % t] or ''), flags=re.S), re.I)) < 18]
    print('clubs needing article fallback:', len(short))
    full = hist(short, 'fullh2')
    clubs = []
    for dv in divisions:
        for t in dv['titles']:
            x = pages[t] or ''
            sqx = re.sub(r'<!--.*?-->', '', (sq['Template:%s squad' % t] or sqc['Template:%s squad' % t] or ''), flags=re.S)
            players = []
            for m in re.finditer(r'\{\{\s*(?:football squad2? player|Fs player)\s*\|([^{}]*(?:\{\{[^{}]*\}\}[^{}]*)*)\}\}', sqx, re.I):
                body = m.group(1)
                no = re.search(r'no\s*=\s*(\d+)', body); nm = re.search(r'name\s*=\s*\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]', body)
                if nm: players.append({'t': nm.group(1).strip(), 'd': (nm.group(2) or nm.group(1)).strip(), 'no': int(no.group(1)) if no else 0})
            if len(players) < 18 and full.get(t):
                fx = re.sub(r'<!--.*?-->', '', full[t], flags=re.S); have = {p['t'] for p in players}
                for m in re.finditer(r'\{\{\s*(?:football squad2? player|Fs player|football squad player)\s*\|([^{}]*(?:\{\{[^{}]*\}\}[^{}]*)*)\}\}', fx, re.I):
                    body = m.group(1); no = re.search(r'no\s*=\s*(\d+)', body); nm = re.search(r'name\s*=\s*\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]', body)
                    if nm and nm.group(1).strip() not in have:
                        have.add(nm.group(1).strip()); players.append({'t': nm.group(1).strip(), 'd': (nm.group(2) or nm.group(1)).strip(), 'no': int(no.group(1)) if no else 0})
            clubs.append(dict(title=t, div=dv['short'], name=clean(field(x, ['clubname', 'name']) or t), ground=clean(field(x, ['ground', 'stadium']) or ''), manager=clean(field(x, ['manager', 'head coach', 'coach']) or ''), squad=players))
    ptitles = sorted({p['t'] for c in clubs for p in c['squad']})
    print('unique players', len(ptitles))
    pp = get(ptitles, 'pl', True)
    info = {t: player_info(pp[t]) for t in ptitles}
    bad = [t for t in ptitles if not info[t] or not info[t]['pos'] or not info[t]['by']]
    print('players missing pos/birth:', len(bad), bad[:20])
    out = dict(divisions=[{k: v for k, v in dv.items() if k != 'titles'} for dv in divisions], clubs=[])
    for c in clubs:
        pl = []
        for p in c['squad']:
            i = info.get(p['t'])
            if not i or not i['pos'] or not i['by']: continue
            pl.append([p['t'].replace(' (footballer)', '').replace(' (soccer)', ''), p['d'], i['pos'], i['by'], i['nat'] or '', i['caps'], p['no']])
        c['players'] = pl; del c['squad']; out['clubs'].append(c)
    json.dump(out, open(os.path.join(ROOT, 'data', 'world.json'), 'w'), ensure_ascii=False)
    print('clubs', len(out['clubs']), 'players', sum(len(c['players']) for c in out['clubs']))

main()
