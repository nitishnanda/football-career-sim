"""Build real top-flight data for a 2013-start career from the Transfermarkt Kaggle dump (read-only; nothing in it
is executed). Two stages:
  1. Per league-season dumps (data/hist/<TMcode>_<season>.json) -- kept for inspection/debugging.
  2. data/historical.json: those dumps matched against today's club list (data/world.json) and trimmed to just
     what the game engine needs, keyed by the in-game club id. Embedded into the game bundle by scripts/build.py.

Coverage: England/Spain/Germany/Italy/France TOP FLIGHT ONLY, seasons 2013-14 through 2025-26 (the Kaggle dump's
lineup/appearance detail starts in 2013-14; 2010-12 only have results, no squads, so a real 2010 start isn't
possible from this source). Lower divisions are not covered and keep today's single real snapshot, as agreed.

Run with: python3 -I scripts/build_historical.py
"""
import csv, json, os, re, unicodedata, collections, bisect

SRC = '/Users/nitishnandakumar/Downloads/archive 2'
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT_RAW = os.path.join(ROOT, 'data', 'hist')
os.makedirs(OUT_RAW, exist_ok=True)
LEAGUES = ['GB1', 'ES1', 'L1', 'IT1', 'FR1']
LGDIV = {'GB1': 'PL', 'ES1': 'LL', 'L1': 'BL', 'IT1': 'SA', 'FR1': 'F1'}
SEASONS = range(2013, 2026)  # 2013 = the 2013-14 season ... 2025 = 2025-26 (the last full real season we have)

POSMAP = {
    'Goalkeeper': 'GK', 'Centre-Back': 'CB', 'Sweeper': 'CB',
    'Right-Back': 'FB', 'Left-Back': 'FB',
    'Defensive Midfield': 'DM', 'Central Midfield': 'CM', 'Attacking Midfield': 'AM',
    'Right Winger': 'W', 'Left Winger': 'W', 'Right Midfield': 'W', 'Left Midfield': 'W',
    'Centre-Forward': 'ST', 'Second Striker': 'ST',
}
BROADMAP = {'Goalkeeper': 'GK', 'Defender': 'CB', 'Midfield': 'CM', 'Attack': 'ST', 'Missing': 'CM'}
MIN_MINUTES = 90  # drop one-cameo-appearance fringe players to keep the embed small


def rd(fn):
    with open(os.path.join(SRC, fn), encoding='utf-8') as f:
        r = csv.reader(f)
        header = next(r)
        idx = {h: i for i, h in enumerate(header)}
        for row in r:
            yield row, idx


def stage1_extract():
    print('stage 1: extracting per-season dumps from the Kaggle CSVs')
    print('  pass 1/5: games.csv')
    game_meta = {}
    club_name = {}
    mgr_hist = collections.defaultdict(list)
    ground_cnt = collections.defaultdict(collections.Counter)
    season_clubs = collections.defaultdict(set)
    for row, idx in rd('games.csv'):
        comp = row[idx['competition_id']]
        if comp not in LEAGUES:
            continue
        try:
            season = int(row[idx['season']])
        except ValueError:
            continue
        if season not in SEASONS:
            continue
        gid = row[idx['game_id']]
        hcid, acid = row[idx['home_club_id']], row[idx['away_club_id']]
        game_meta[gid] = (comp, season, hcid, acid)
        club_name[hcid] = row[idx['home_club_name']]
        club_name[acid] = row[idx['away_club_name']]
        season_clubs[(comp, season)].add(hcid)
        season_clubs[(comp, season)].add(acid)
        if row[idx['home_club_manager_name']]:
            mgr_hist[(comp, season, hcid)].append((row[idx['date']], row[idx['home_club_manager_name']]))
        if row[idx['away_club_manager_name']]:
            mgr_hist[(comp, season, acid)].append((row[idx['date']], row[idx['away_club_manager_name']]))
        if row[idx['stadium']]:
            ground_cnt[(comp, season, hcid)][row[idx['stadium']]] += 1

    print('  pass 2/5: players.csv')
    bio = {}
    for row, idx in rd('players.csv'):
        pid = row[idx['player_id']]
        dob = row[idx['date_of_birth']][:4] if row[idx['date_of_birth']] else None
        bio[pid] = dict(name=row[idx['name']], nat=row[idx['country_of_citizenship']] or row[idx['country_of_birth']],
                         by=int(dob) if dob else None, broad=row[idx['position']])

    print('  pass 3/5: player_valuations.csv')
    val_hist = collections.defaultdict(list)
    for row, idx in rd('player_valuations.csv'):
        val_hist[row[idx['player_id']]].append((row[idx['date']], int(row[idx['market_value_in_eur']] or 0)))
    for pid in val_hist:
        val_hist[pid].sort()

    def value_at(pid, season_start):
        L = val_hist.get(pid)
        if not L:
            return None
        i = bisect.bisect_right([d for d, v in L], season_start) - 1
        return L[i][1] if i >= 0 else L[0][1]

    print('  pass 4/5: game_lineups.csv')
    pos_cnt = collections.defaultdict(collections.Counter)
    played = collections.defaultdict(set)
    for row, idx in rd('game_lineups.csv'):
        meta = game_meta.get(row[idx['game_id']])
        if not meta:
            continue
        comp, season, hcid, acid = meta
        cid, pid = row[idx['club_id']], row[idx['player_id']]
        pos_cnt[(comp, season, cid, pid)][row[idx['position']]] += 1
        played[(comp, season, cid)].add(pid)

    print('  pass 5/5: appearances.csv (minutes only)')
    mins = collections.defaultdict(int)
    for row, idx in rd('appearances.csv'):
        meta = game_meta.get(row[idx['game_id']])
        if not meta:
            continue
        comp, season, hcid, acid = meta
        cid = row[idx['player_club_id']]
        if cid != hcid and cid != acid:
            continue
        mins[(comp, season, cid, row[idx['player_id']])] += int(row[idx['minutes_played']] or 0)

    print('  writing per-season dumps...')
    written = 0
    for comp in LEAGUES:
        for season in SEASONS:
            clubs_here = season_clubs.get((comp, season))
            if not clubs_here:
                continue
            season_start = '%d-07-01' % season
            out_clubs = []
            for cid in sorted(clubs_here):
                mh = sorted(mgr_hist.get((comp, season, cid), []))
                mgr = mh[-1][1] if mh else None
                gc = ground_cnt.get((comp, season, cid))
                ground = gc.most_common(1)[0][0] if gc else None
                players = []
                for pid in played.get((comp, season, cid), ()):
                    b = bio.get(pid)
                    if not b or not b['by']:
                        continue
                    mn = mins.get((comp, season, cid, pid), 0)
                    if mn < MIN_MINUTES:
                        continue
                    pc = pos_cnt[(comp, season, cid, pid)]
                    pos = POSMAP.get(pc.most_common(1)[0][0]) if pc else None
                    if not pos:
                        pos = BROADMAP.get(b['broad'], 'CM')
                    v = value_at(pid, season_start)
                    players.append(dict(n=b['name'], pos=pos, by=b['by'], nat=b['nat'], mn=mn,
                                         v=round((v or 0) / 1e6, 2)))
                if players:
                    out_clubs.append(dict(name=club_name.get(cid, cid), ground=ground, mgr=mgr, players=players))
            if out_clubs:
                path = os.path.join(OUT_RAW, '%s_%d.json' % (comp, season))
                json.dump(dict(league=comp, season=season, clubs=out_clubs), open(path, 'w', encoding='utf-8'),
                           ensure_ascii=False, separators=(',', ':'))
                written += 1
    print('  wrote', written, 'league-season dumps to', OUT_RAW)


# a handful of names the generic rules below can't untangle on their own (two Milan clubs sharing the word
# "milan", British/German/French club names that differ a lot from their Transfermarkt long form, etc.)
RAW_ALIAS = [
    ('internazionale milano', 'inter'), ('inter milan', 'inter'),
    ('munich', 'munchen'),
    ('stade rennais', 'rennes'),
    ('societa sportiva lazio', 'lazio'), ('ss lazio', 'lazio'),
    ('associazione sportiva roma', 'as roma'),
    ('brighton hove albion', 'brighton'),
    ('tottenham hotspur', 'tottenham'), ('wolverhampton wanderers', 'wolves'),
    ('newcastle united', 'newcastle'), ('west ham united', 'west ham'),
    ('nottingham forest', 'nottm forest'),
    ('espanyol barcelona', 'espanyol'),
]


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower().replace('&', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    for a, b in RAW_ALIAS:
        s = s.replace(a, b)
    s = re.sub(r'\b(fc|cf|afc|sc|ac|as|ss|ssc|us|ud|cd|rc|sv|vfb|vfl|tsg|bv|fsv|1\.|club|de|calcio|football|'
               r'futbol|sad|ogc|rcd|ca|sd|ad|ca|real|racing|olympique|u\.s\.|c\.f\.|spa|s\.p\.a|societa|sportiva|'
               r'associazione|balompie|cfc)\b', '', s)
    return set(t for t in re.split(r'[^a-z0-9]+', s) if len(t) > 2)


def match_score(a, b):
    if not a or not b:
        return 0
    return len(a & b) / len(a | b)


def stage2_match():
    print('stage 2: matching historic clubs to today\'s club list')
    world = json.load(open(os.path.join(ROOT, 'data', 'world.json'), encoding='utf-8'))
    clubs = world['clubs']
    by_div = collections.defaultdict(list)
    for i, c in enumerate(clubs):
        by_div[c['div']].append((i, norm(c['name'])))

    hist = {}  # season -> { club_id (str) : {p:[[n,pos,by,nat,v,mn],...], gd, mgr} }
    matched_total = 0
    for comp in LEAGUES:
        div = LGDIV[comp]
        today = by_div[div]
        for season in SEASONS:
            path = os.path.join(OUT_RAW, '%s_%d.json' % (comp, season))
            if not os.path.exists(path):
                continue
            d = json.load(open(path, encoding='utf-8'))
            claimed = {}  # today-club index -> (score, historic club name) already written this season, for conflict detection
            for hc in d['clubs']:
                hn = norm(hc['name'])
                scores = sorted(((match_score(hn, tn), i) for i, tn in today), reverse=True)
                best_score, best = (scores[0][0], scores[0][1]) if scores else (0, None)
                second_score = scores[1][0] if len(scores) > 1 else 0
                if best is None or best_score < 0.5:
                    continue
                if best_score - second_score < 0.05:
                    print('   SKIP (ambiguous, %.2f vs %.2f): %r in %s %d' % (best_score, second_score, hc['name'], comp, season))
                    continue
                if best in claimed:
                    prev_score, prev_name = claimed[best]
                    print('   CONFLICT on slot %d: %r (%.2f) vs %r (%.2f) in %s %d -- keeping the higher score' %
                          (best, prev_name, prev_score, hc['name'], best_score, comp, season))
                    if best_score <= prev_score:
                        continue
                claimed[best] = (best_score, hc['name'])
                matched_total += 1
                hist.setdefault(str(season), {})[str(best)] = dict(
                    gd=hc['ground'], mgr=hc['mgr'],
                    p=[[p['n'], p['pos'], p['by'], p['nat'], p['v'], p['mn']] for p in hc['players']],
                )
    out_path = os.path.join(ROOT, 'data', 'historical.json')
    json.dump(hist, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    seasons_n = len(hist)
    print('  matched', matched_total, 'club-seasons across', seasons_n, 'seasons ->', out_path,
          '(%.1f MB)' % (os.path.getsize(out_path) / 1e6))
    # coverage report: how many of today's 100 top-flight clubs got a real entry in each season
    want = sum(len(v) for v in by_div.values() if False) or sum(1 for c in clubs if c['div'] in LGDIV.values())
    for season in SEASONS:
        got = len(hist.get(str(season), {}))
        print('   season %d: %d / %d top-flight clubs matched' % (season, got, want))


if __name__ == '__main__':
    stage1_extract()
    stage2_match()
