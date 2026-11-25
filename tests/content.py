from pathlib import Path
import json,math,re,unicodedata
from collections import Counter
root=Path(__file__).resolve().parents[1]/'site'/'data'
read=lambda name:json.loads((root/(name+'.json')).read_text())
def equivalent(a,b):
    if isinstance(b,(int,float)) and not isinstance(b,bool):
        return isinstance(a,(int,float)) and not isinstance(a,bool) and math.isclose(a,b,rel_tol=1e-7,abs_tol=1e-8)
    if isinstance(b,list):
        return isinstance(a,list) and len(a)==len(b) and all(equivalent(i,j) for i,j in zip(a,b))
    if isinstance(b,dict):
        return isinstance(a,dict) and a.keys()==b.keys() and all(equivalent(a[k],v) for k,v in b.items())
    return type(a) is type(b) and a==b
if __name__=='__main__':
    questions=sum([read(m) for m in 'ABCD'],[])
    normalized=lambda s:re.sub(r'[^\w]+',' ',unicodedata.normalize('NFC',s).casefold()).strip()
    assert len(set(q['id'] for q in questions))==len(set(normalized(q['prompt']) for q in questions))==len(questions)
    for q in questions:
        if not q['options']:
            assert q['key'] is not None and len(q['reasons'])==1
            continue
        assert 0<=q['key']<len(q['options'])==len(q['reasons']) and len(set(q['options']))==len(q['options'])
        assert all(q['reasons']) and 1<=q['level']<=5 and q['module'] in 'ABCD'
    labs=read('labs'); passed=0
    for lab in labs:
        ctx={};exec(lab['solution'],ctx)
        for x,expected in lab['tests']:
            assert equivalent(ctx['solve'](x),expected),(lab['id'],x,expected)
            passed+=1
    print(dict(Counter(q['module'] for q in questions)),len(labs),'exercises;',passed,'reference cases passed')
