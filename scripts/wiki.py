import json, time, subprocess, urllib.parse, urllib.request, os, re
UA = 'football-career-sim/0.1 (personal hobby project; nitishnanda13@gmail.com)'
API = 'https://en.wikipedia.org/w/api.php'
CACHE = os.path.join(os.path.dirname(__file__), '..', 'data', 'cache')
os.makedirs(CACHE, exist_ok=True)

def call(params, tries=4):
    q = urllib.parse.urlencode(dict(params, format='json', formatversion=2))
    for i in range(tries):
        try:
            out = subprocess.run(['curl', '-s', '-m', '60', '-A', UA, API + '?' + q], capture_output=True, timeout=90)
            return json.loads(out.stdout)
        except Exception as e:
            time.sleep(2 + 3 * i)
    return {}

def fetch(titles, section0=False):
    """Return {requested title: wikitext or None}; follows redirects. 50 titles per request."""
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        p = dict(action='query', prop='revisions', rvprop='content', rvslots='main', redirects=1, titles='|'.join(chunk))
        if section0: p['rvsection'] = 0
        d = call(p).get('query', {})
        norm = {n['from']: n['to'] for n in d.get('normalized', [])}
        red = {n['from']: n['to'] for n in d.get('redirects', [])}
        pages = {pg['title']: pg for pg in d.get('pages', [])}
        for t in chunk:
            tt = norm.get(t, t); tt = red.get(tt, tt)
            pg = pages.get(tt)
            txt = None
            if pg and 'revisions' in pg:
                txt = pg['revisions'][0]['slots']['main']['content']
            out[t] = txt
        time.sleep(0.4)
    return out

def fetch_at(title, ts):
    """Wikitext of the revision of `title` that was current at timestamp ts (UTC ISO), or None."""
    d = call(dict(action='query', prop='revisions', rvprop='content|timestamp', rvslots='main', rvlimit=1, rvstart=ts, rvdir='older', redirects=1, titles=title)).get('query', {})
    pg = d.get('pages', [])
    if pg and 'revisions' in pg[0]:
        return pg[0]['revisions'][0]['slots']['main']['content']
    return None
