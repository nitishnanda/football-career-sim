import glob, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
read = lambda p: open(p, encoding='utf8').read()
import json
W = json.load(open(root + '/data/world.json', encoding='utf8'))
if os.path.exists(root + '/data/rating.json'): W['rating'] = json.load(open(root + '/data/rating.json'))   # fitted match-rating model
if os.path.exists(root + '/data/wages.json'): W['wages'] = json.load(open(root + '/data/wages.json'))   # real wage curves + contracts (Capology): PL, BL, LL, SA
if os.path.exists(root + '/data/historical.json'): W['hist'] = json.load(open(root + '/data/historical.json'))   # real top-flight squads 2013-2025 for a historic-era career
real = json.dumps(W, ensure_ascii=False, separators=(',', ':'))
js = 'const REAL=' + real + ';\n' + '\n'.join(read(f) for f in sorted(glob.glob(root + '/src/[0-9]*.js')))
html = read(root + '/src/index.html').replace('/*CSS*/', read(root + '/src/style.css')).replace('/*JS*/', js)
os.makedirs(root + '/dist', exist_ok=True)
open(root + '/dist/index.html', 'w', encoding='utf8').write(html)
print('built dist/index.html', len(html), 'bytes')
