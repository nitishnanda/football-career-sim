"""Minimal API-Football v3 client. Reads API_FOOTBALL_KEY from .env (never printed). Uses curl (system certs)."""
import json, os, subprocess, time
ROOT = os.path.join(os.path.dirname(__file__), '..')
def key():
    for line in open(os.path.join(ROOT, '.env')):
        if line.startswith('API_FOOTBALL_KEY='): return line.split('=', 1)[1].strip()
    raise SystemExit('Put API_FOOTBALL_KEY=... in .env')
K = None; USED = 0
def get(path, **params):
    global K, USED
    K = K or key()
    q = '&'.join('%s=%s' % (a, b) for a, b in params.items())
    for i in range(6):
        out = subprocess.run(['curl', '-s', '-m', '60', '-H', 'x-apisports-key: ' + K, 'https://v3.football.api-sports.io/' + path + ('?' + q if q else '')], capture_output=True)
        USED += 1; time.sleep(0.3)
        try: return json.loads(out.stdout)
        except Exception: time.sleep(5 * (i + 1))
    return {}
