"""Spends ~50 requests: plan status, season access, and per-division squad/coach coverage for 2026-27."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from apif import get
import apif
st = get('status').get('response', {})
if st: print('plan:', st.get('subscription', {}).get('plan'), '| requests today:', st.get('requests', {}).get('current'), '/', st.get('requests', {}).get('limit_day'))
else: print('status failed (bad key?)'); sys.exit(1)
LEAGUES = {'Premier League': 39, 'Championship': 40, 'League One': 41, 'League Two': 42, 'La Liga': 140, 'La Liga 2': 141, 'Primera RFEF G1': 435, 'Primera RFEF G2': 436,
           'Bundesliga': 78, '2. Bundesliga': 79, '3. Liga': 80, 'Serie A': 135, 'Serie B': 136, 'Ligue 1': 61, 'Ligue 2': 62, 'National 1': 63}
for name, lid in LEAGUES.items():
    t = get('teams', league=lid, season=2026)
    if t.get('errors'): print(name, lid, 'ERRORS', t['errors']); continue
    teams = t.get('response', [])
    if not teams: print(name, lid, 'no teams for 2026'); continue
    tid = teams[-1]['team']['id']; tn = teams[-1]['team']['name']
    sq = get('players/squads', team=tid).get('response', [])
    n = len(sq[0]['players']) if sq else 0
    co = get('coachs', team=tid).get('response', [])
    cn = co[0]['name'] if co else None
    print('%-16s id %-4s teams %-3s | sample %-26s squad %-3s coach %s' % (name, lid, len(teams), tn[:26], n, cn))
print('requests used:', apif.USED)
