"""Enforce objective-bank invariants; list editorial risks separately."""
import json
import statistics
import argparse
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--module', choices='ABCD')
parser.add_argument('--ids', nargs='+', help='Validate only these question IDs')
args = parser.parse_args()
modules = args.module or 'ABCD'
items = [q for m in modules for q in json.loads((root/'site/data'/f'{m}.json').read_text(encoding='utf-8'))]
if args.ids:
    wanted = set(args.ids)
    items = [q for q in items if q['id'] in wanted]
    assert {q['id'] for q in items} == wanted, f'missing IDs: {wanted - {q["id"] for q in items}}'
risks = []
for q in items:
    options = q['options']
    normalize = (lambda s: s.strip()) if q.get('type') == 'Đọc code' else (lambda s: s.strip().casefold())
    assert len(options) == len(set(normalize(s) for s in options)) == 4, q['id']
    assert type(q['key']) is int and 0 <= q['key'] < 4, q['id']
    assert len(q['reasons']) == 4 and all(x.strip() for x in q['reasons']), q['id']
    lengths = [len(x.split()) for x in options]
    key = q['key']
    if lengths[key] > max(6,1.8*statistics.median(lengths[:key]+lengths[key+1:])):
        risks.append(q['id'])
print(f'{len(items)} records validated; flagged correct-answer length: {risks}')
assert not risks
