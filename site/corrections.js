import {studyGuide} from './study-guide.js';
import {answerText, button, el, esc, keyText, written} from './core.js';

const filters = [
  ['all', 'Tất cả', () => true],
  ['wrong', 'Sai', r => !r.right && !r.blank],
  ['blank', 'Bỏ trống', r => r.blank],
  ['flag', 'Đã đánh dấu', r => r.flagged === true],
];

function correction(row, q, index) {
  const status = row.blank ? 'Bỏ trống' : row.right ? 'Đúng' : 'Sai';
  const selectedReason = !row.blank && !row.right && !written(q) ? q.reasons[row.choice] : '';
  const practice = button('exam/practice/' + encodeURIComponent(q.topic) + '/' + q.module, 'Luyện tiếp · ' + q.topic);
  return '<details><summary>Câu ' + (index + 1) + ' · ' + status +
    (row.flagged === true ? ' · Đã đánh dấu' : '') + ' — <span class="question">' + esc(q.prompt) + '</span></summary>' +
    '<p>Bạn trả lời: <strong>' + esc(answerText(q, row.choice)) + '</strong></p>' +
    (selectedReason ? '<p><b>Vì sao lựa chọn này sai?</b> ' + esc(selectedReason) + '</p>' : '') +
    '<div class="note"><strong>Đáp án đúng: ' + esc(keyText(q)) + '</strong><p>' +
    esc(q.type==='Chọn nhiều'?q.key.split(',').map(i=>q.reasons[i]).join(' '):q.reasons[written(q) ? 0 : q.key]) + '</p></div>' +
    (written(q) ? '' : '<details><summary>Đối chiếu các lựa chọn</summary>' + (Array.isArray(row.order)&&row.order.length===q.options.length?row.order:q.options.map((_,i)=>i)).map((i,position) =>
      '<p><b>' + String.fromCharCode(65+position)+'. '+esc(q.options[i]) + '</b> — ' + esc(q.reasons[i]) + '</p>').join('') + '</details>') +
    studyGuide(q) + '<p class="actions">' + practice + (q.source ? '<a href="' + esc(q.source) + '" target="_blank" rel="noopener">Tài liệu tham khảo ↗</a>' : '') + '</p></details>';
}

export function mountCorrections(rows, byId) {
  const controls = el('correction-filters');
  controls.innerHTML = filters.map(([id, label, matches]) =>
    '<button type="button" data-filter="' + id + '">' + label + ' (' + rows.filter(matches).length + ')</button>').join('');
  if (rows.some(r => r.flagged === undefined)) {
    controls.insertAdjacentHTML('afterend', '<p class="small">Lịch sử cũ chưa lưu thông tin đánh dấu.</p>');
  }
  function select(id) {
    const [, , matches] = filters.find(([key]) => key === id);
    for (const b of controls.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.filter === id));
    const cards = rows.map((r, i) => matches(r) ? correction(r, byId.get(r.id), i) : '').filter(Boolean);
    el('correction-count').textContent = cards.length ? 'Hiển thị ' + cards.length + ' / ' + rows.length + ' câu.' : 'Không có câu thuộc nhóm này.';
    el('correction-list').innerHTML = cards.join('');
  }
  controls.onclick = e => { const b = e.target.closest('button'); if (b) select(b.dataset.filter); };
  select('all');
}
