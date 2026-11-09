"""Downloads football-data.co.uk results/odds CSVs for the divisions it covers."""
import csv, io, os, subprocess
ROOT = os.path.join(os.path.dirname(__file__), '..')
SEASONS = ['2122', '2223', '2324', '2425', '2526', '2627']
CODES = {'E0': 'PL', 'E1': 'CH', 'E2': 'L1E', 'E3': 'L2E', 'SP1': 'LL', 'SP2': 'LL2', 'D1': 'BL', 'D2': 'BL2', 'I1': 'SA', 'I2': 'SB', 'F1': 'F1', 'F2': 'F2'}
for s in SEASONS:
    for code in CODES:
        path = os.path.join(ROOT, 'data', 'fd', '%s_%s.csv' % (s, code))
        if not os.path.exists(path):
            out = subprocess.run(['curl', '-sL', '-m', '40', '-A', 'Mozilla/5.0', 'https://football-data.co.uk/mmz4281/%s/%s.csv' % (s, code)], capture_output=True).stdout
            if len(out) > 500 and b'<html' not in out[:200].lower(): open(path, 'wb').write(out)
        if os.path.exists(path):
            rows = list(csv.DictReader(open(path, encoding='utf-8-sig', errors='replace')))
            rows = [r for r in rows if r.get('HomeTeam')]
            print(s, code, CODES[code], len(rows), 'matches', '| shots' if 'HS' in rows[0] else '| no shots', '| odds' if 'B365H' in rows[0] or 'AvgH' in rows[0] else '| no odds', '| last', rows[-1].get('Date'))
        else: print(s, code, 'not available')
