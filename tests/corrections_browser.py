"""Exercise the real submit, saved review, filtering and drill-down on Chromium."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
questions = json.loads((root / 'site/data/B.json').read_text())
mc = next(q for q in questions if q['options'])
other = next(q for q in questions if q['options'] and q != mc)
code = next(q for q in questions if q['type'] == 'Đọc code' and not q['options'])
wrong = (mc['key'] + 1) % len(mc['options'])
items = [other, mc, code, next(q for q in questions if q not in (other, mc, code))]
srv = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=root))
Thread(target=srv.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        pg = browser.new_page()
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(f'http://127.0.0.1:{srv.server_port}/site/')
        expect(pg.locator('h1')).to_be_visible()
        pg.evaluate("""async items => {
          const {state,save}=await import('./core.js');
          state.session={mode:'practice',ids:items.map(q=>q.id),orders:items.map(q=>q.options.map((_,i)=>i).reverse()),
            answers:items.map(()=>-1),flags:items.map(()=>false),times:items.map(()=>0),checked:{},weights:{},
            idx:0,start:Date.now(),deadline:0,opened:0};await save();location.hash='session';
        }""", items)
        pg.locator(f'[data-choice="{other["key"]}"]').click()
        pg.locator('#next').click()
        pg.locator(f'[data-choice="{wrong}"]').click()
        pg.locator('#flag').click()
        pg.locator('#next').click()
        pg.locator('#written').fill('<sample>')
        pg.locator('#submit').click()
        pg.locator('#finish').click()
        expect(pg.locator('#correction-count')).to_have_text('Hiển thị 4 / 4 câu.')
        pg.reload()
        cards = pg.locator('#correction-list > details')
        pg.locator('[data-filter=wrong]').click()
        expect(cards).to_have_count(2)
        expect(cards.first.locator('summary').first).to_contain_text('Câu 2 · Sai')
        cards.first.locator('summary').first.click()
        expect(cards.first.locator('p').filter(has_text='Vì sao')).to_contain_text(mc['reasons'][wrong])
        expect(cards.first.locator('.note')).to_contain_text(mc['reasons'][mc['key']])
        cards.last.locator('summary').first.click()
        expect(cards.last).to_contain_text('<sample>')
        expect(cards.last.locator('.note')).to_contain_text(code['reasons'][0])
        pg.locator('[data-filter=blank]').click()
        expect(cards).to_have_count(1)
        expect(cards).to_contain_text('Câu 4 · Bỏ trống')
        pg.locator('[data-filter=flag]').click()
        expect(cards).to_have_count(1)
        cards.locator('summary').first.click()
        for width in [390, 768, 1440]:
            pg.set_viewport_size({'width':width,'height':850})
            assert pg.evaluate('document.documentElement.scrollWidth <= innerWidth')
        cards.get_by_role('link', name='Luyện tiếp', exact=False).click()
        expect(pg.locator('#mod')).to_have_value('B')
        expect(pg.locator('#topic')).to_have_value(mc['topic'])
        pg.go_back()
        expect(cards).to_have_count(4)
        pg.evaluate("""async () => {const {state,save}=await import('./core.js');
          state.history[0].rows.forEach(r=>delete r.flagged);await save()}""")
        pg.reload()
        expect(pg.get_by_text('Lịch sử cũ chưa lưu thông tin đánh dấu.')).to_be_visible()
        pg.locator('[data-filter=flag]').click()
        expect(pg.locator('#correction-count')).to_contain_text('Không có câu')
        assert not errors, errors
        browser.close()
        print('PASS corrections end to end')
finally:
    srv.shutdown()
