"""Ten release checks. Run from any folder with the QA dependencies installed."""
from pathlib import Path
from collections import Counter
import json,re,sys,subprocess,zipfile,tempfile,urllib.request,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
root=Path(__file__).resolve().parents[1];site=root/'site'
read=lambda n:json.loads((site/'data'/(n+'.json')).read_text())
def run(*cmd):subprocess.run(cmd,check=True,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
def check(n,fn):
    fn()
    print('PASS',n)
def inventory():
    assert [len(read(m)) for m in 'ABCD']==[160,240,220,180]
    assert Counter(l['track'] for l in read('labs'))=={'Python':40,'NumPy':30,'Pandas':30}
def module_graph():
    for p in site.glob('*.js'):
        run('node','--check',str(p))
        for ref in re.findall(r"from ['\"](\./[^'\"]+)['\"]",p.read_text()):assert (p.parent/ref).is_file(),ref
def links():
    assert {l['lab'] for l in read('lessons')} <= {l['id'] for l in read('labs')}
    for ref in re.findall(r'(?:src|href)="(\./[^"]+)"',(site/'index.html').read_text()):assert (site/ref).is_file()
def subpath():
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=root))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    try:
        op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        for name in ['','app.js','lab-worker.js','data/B.json','assets/portfolio.css','assets/loss-field.webp']:
            with op.open('http://127.0.0.1:%s/site/%s'%(srv.server_port,name)) as r:assert r.status==200 and r.read()
    finally:srv.shutdown()
def deployment():
    s=(root/'.github/workflows/pages.yml').read_text()
    assert 'needs: verify' in s and 'path: site' in s
    for path in re.findall(r'(?:python|--test) ((?:tests|site)/[\w./-]+)',s):assert (root/path).is_file(),path
check('01 inventory',inventory)
check('02 schemas, duplicates and 200 exercise cases',lambda:run(sys.executable,'tests/content.py'))
check('03 math, Python outputs and lesson examples',lambda:run(sys.executable,'tests/knowledge.py'))
check('04 seven project integrations',lambda:run(sys.executable,'site/projects/projects_test.py'))
check('05 JS module graph and syntax',module_graph)
check('06 grading, selection, storage schema and CSV edge cases',lambda:run('node','--test','tests/engine.test.mjs'))
check('07 curriculum references and shell assets',links)
check('08 HTTP project subdirectory',subpath)
check('09 Pages deployment dependencies',deployment)
def packaged():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/'bundle.zip'
        with zipfile.ZipFile(p,'w') as z:
            for f in site.rglob('*'):
                if f.is_file() and '__pycache__' not in f.parts:z.write(f,f.relative_to(root))
        with zipfile.ZipFile(p) as z:assert z.testzip() is None and 'site/index.html' in z.namelist()
check('10 packaged site integrity',packaged)
