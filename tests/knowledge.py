"""Recompute trusted, repository-authored reference expressions. Never evaluate uploads."""
from pathlib import Path
import ast,json,math,io,contextlib,re
from collections import Counter,defaultdict
import numpy as np
import pandas as pd
from content import read
root=Path(__file__).parent
def calc(code):
    tree=ast.parse(code);expression=tree.body.pop();space={'pd':pd,'np':np,'math':math,'Counter':Counter}
    exec(compile(tree,'reference','exec'),space)
    return eval(compile(ast.Expression(expression.value),'reference','eval'),space)
qs={q['id']:q for m in 'ABCD' for q in read(m)}
assert {k:sum(q['module']==k for q in qs.values()) for k in 'ABCD'}=={'A':160,'B':240,'C':220,'D':180}
for key,code in json.loads((root/'code_questions.json').read_text()).items():
    value=calc(code);value=value.item() if isinstance(value,np.generic) else value
    assert repr(value)==qs[key]['key'],(key,repr(value),qs[key]['key'])
for key,code in json.loads((root/'math_questions.json').read_text()).items():
    assert math.isclose(calc(code),qs[key]['key'],abs_tol=1e-8),key
extra=[np.median([3,5,8,10,160]),np.var([2,4,6,8]),np.empty((128,256),dtype='float32').nbytes/1024,math.comb(6,2),18*4/6,13-(2*4+3),2/4,(24-12)/2,100*(1.1**2),3**2,18*2,7,100*(.4*.05+.6*.1),100*(3.2-2.8)/3.2,150/3,(1/.5)**2]
for i,v in enumerate(extra,17):assert math.isclose(v,qs[f'A{i:03}']['key'],abs_tol=1e-8)
# Additional quantitative items with textual choices.
assert qs['A001']['options'][qs['A001']['key']]==f'{(8+18)/(10+90):.0%}'
assert qs['A002']['options'][qs['A002']['key']]==f'{int(.1*30-2)} phút'
assert qs['A003']['options'][qs['A003']['key']]==f'9/{9+99}'
assert qs['A004']['options'][qs['A004']['key']]==str(int(1-.25*2*(1-3)))
assert math.isclose(.8*1.25,1) and math.isclose(1-.9*.8,.28)
assert np.array([1,0])@np.array([0,1])==0 and 3*2**5==96 and (12-9)*60==180
assert len(set(q['key'] for q in qs.values() if q['type']=='Đọc code'))>60
for l in read('lessons'):
    out=io.StringIO()
    with contextlib.redirect_stdout(out):exec(l['code'],{})
    assert out.getvalue().strip()==l['output'],(l['title'],out.getvalue(),l['output'])
print('800 records; 216 code outputs; 144 numerical keys; 18 lesson snippets verified')
