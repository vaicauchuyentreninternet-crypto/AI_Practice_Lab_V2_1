const base='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
self.onmessage=async ({data:{code,tests,track}})=>{
 try{
  importScripts(base+'pyodide.js');
  const py=await loadPyodide({indexURL:base});
  if(track!=='Python')await py.loadPackage(track==='Pandas'?'pandas':'numpy');
  let output='',truncated=false;
  const append=s=>{if(output.length<6000)output+=(s+'\n').slice(0,6000-output.length);else truncated=true};
  py.setStdout({batched:append});py.setStderr({batched:append});
  self.postMessage({kind:'ready'});
  py.globals.set('_source',code);py.globals.set('_tests_json',JSON.stringify(tests));
  const value=await py.runPythonAsync(`
import json, math, traceback
def _same(a,b):
    if isinstance(b,(int,float)) and not isinstance(b,bool):
        return isinstance(a,(int,float)) and not isinstance(a,bool) and math.isclose(a,b,rel_tol=1e-7,abs_tol=1e-8)
    if isinstance(b,list):
        return isinstance(a,list) and len(a)==len(b) and all(_same(i,j) for i,j in zip(a,b))
    if isinstance(b,dict):
        return isinstance(a,dict) and a.keys()==b.keys() and all(_same(a[k],v) for k,v in b.items())
    return type(a) is type(b) and a==b
_out=[]
for _x,_expected in json.loads(_tests_json):
    _env={}
    try:
        exec(compile(_source,'bai_lam.py','exec'),_env)
        _actual=_env['solve'](_x)
        if hasattr(_actual,'tolist'): _actual=_actual.tolist()
        _out.append({'ok':_same(_actual,_expected),'actual':repr(_actual)[:2000]})
    except Exception:
        _out.append({'ok':False,'actual':traceback.format_exc(limit=3)[-2000:]})
json.dumps(_out,ensure_ascii=False)
`);
  self.postMessage({kind:'result',rows:JSON.parse(value),output:output+(truncated?'…':'')});
 }catch(e){self.postMessage({kind:'error',message:String(e.message||e)})}
};
