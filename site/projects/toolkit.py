"""Seven inspectable mini-projects. Python 3.10+ standard library."""
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parent

def read_orders(path=ROOT.parent/'data'/'orders.csv'):
    with path.open(encoding='utf-8', newline='') as handle:
        return list(csv.DictReader(handle))

def clean(rows):
    """Retain the first complete receipt per ID and record exclusions."""
    accepted, rejected, seen = [], [], set()
    for row in rows:
        try:
            amount = float(row['amount'])
            if not math.isfinite(amount) or amount < 0 or not row['order_id']:
                raise ValueError
            if row['order_id'] in seen:
                rejected.append((row['order_id'], 'duplicate'))
                continue
            seen.add(row['order_id'])
            accepted.append({**row, 'amount': amount})
        except (ValueError, KeyError, TypeError):
            rejected.append((row.get('order_id'), 'invalid'))
    return accepted, rejected

def analyze(rows):
    totals = defaultdict(float)
    for row in rows:
        totals[row['channel']] += row['amount']
    return dict(totals)

def fit(points):
    """Fit y = a*x + b by least squares on training points only."""
    x, y = zip(*points)
    mx, my = mean(x), mean(y)
    denom = sum((v-mx)**2 for v in x)
    if not denom:
        raise ValueError('Feature has zero variance')
    a = sum((i-mx)*(j-my) for i,j in points) / denom
    return a, my-a*mx

def retrieve(query, docs):
    tokens=set(query.lower().split())
    ranked=sorted(((len(tokens.intersection(t.lower().split())),i,t) for i,t in docs.items()),reverse=True)
    return [(i,t) for score,i,t in ranked if score]

def answer(query, docs):
    hits=retrieve(query,docs)
    return {'answer':hits[0][1],'source':hits[0][0]} if hits else {'answer':'Chưa có bằng chứng','source':None}

def execute(call, rows):
    if call.get('name')!='total' or set(call)!= {'name','channel'}:
        raise ValueError('Unsupported tool schema')
    if call['channel'] not in {r['channel'] for r in rows}:
        raise ValueError('Unknown channel')
    return analyze(rows)[call['channel']]

def assistant(question, rows):
    """A deterministic baseline emitting a validated structured call."""
    words=question.lower().replace('?','').split()
    channels=[c for c in analyze(rows) if c.lower() in words]
    if 'doanh thu' not in ' '.join(words) or len(channels)!=1:
        return {'message':'Hãy ghi doanh thu và đúng một tên kênh.'}
    call={'name':'total','channel':channels[0]}
    return {'tool':call,'result':execute(call,rows)}

def report():
    rows,rejected=clean(read_orders())
    return {'valid':len(rows),'rejected':rejected,'by_channel':analyze(rows),
            'answer':assistant('Doanh thu Web?',rows)}

if __name__=='__main__':
    print(json.dumps(report(),ensure_ascii=False,indent=2))
