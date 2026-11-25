"""Exercise the packaged site below a project subpath, as on GitHub Pages."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect
import json
import re

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/site/'
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        errors = []
        page.on('pageerror',lambda e: errors.append(str(e)))
        routes = {
            'home': 'Học về AI', 'bank': 'Ngân hàng câu hỏi', 'exam': 'Luyện thi AI',
            'learn': 'Lộ trình học', 'lab': 'Phòng lập trình', 'dataset': 'Phòng dữ liệu',
            'review': 'Ôn tập hôm nay', 'analytics': 'Tiến độ học tập', 'plan': 'Kế hoạch học',
            'settings': 'Cài đặt dữ liệu', 'inquiry': 'Hỏi học liệu', 'essay': 'Luyện tự luận',
            'tutor': 'Trợ giảng', 'weekly': 'Xếp hạng tuần này', 'account': 'Tài khoản',
        }
        for width in (1440,768,390):
            page.set_viewport_size({'width':width,'height':850})
            for route, heading in routes.items():
                page.goto(base+'#'+route)
                expect(page.locator('main h1')).to_contain_text(heading)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,route)
        page.goto(base+'#exam/mock')
        page.locator('#count').fill('1')
        page.locator('#setup button').click()
        expect(page.locator('#clock')).to_be_visible()
        page.locator('#flag').click()
        expect(page.locator('#flag')).to_have_attribute('aria-pressed','true')
        page.reload()
        expect(page.locator('#flag')).to_have_attribute('aria-pressed','true')
        page.locator('#submit').click()
        page.locator('#finish').click()
        expect(page.locator('h1')).to_have_text('Kết quả của bạn')
        labs=json.loads((root/'site/data/labs.json').read_text())
        for track in ('Python','NumPy','Pandas'):
            exercise=next(x for x in labs if x['track']==track)
            page.goto(base+'#lab/'+exercise['id'])
            page.locator('#code').fill(exercise['solution'])
            page.locator('#run').click()
            expect(page.locator('#console')).to_contain_text('2/2 ca đạt',timeout=100000)

        page.goto(base+'#exam/mock')
        page.clock.install()
        page.locator('#count').fill('1')
        page.locator('#setup button').click()
        expect(page.locator('#clock')).to_have_text(re.compile(r'^(90:00|89:59)$'))
        page.clock.fast_forward(90 * 60 * 1000 + 1000)
        expect(page.locator('main h1')).to_have_text('Kết quả của bạn')
        page.reload()
        expect(page.locator('main h1')).to_have_text('Kết quả của bạn')
        assert not errors,errors
        browser.close()
finally:
    server.shutdown()
