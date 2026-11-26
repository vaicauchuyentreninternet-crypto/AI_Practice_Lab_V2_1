import {esc} from './core.js';
export const defaults=Object.freeze({total:100,objectivePercent:90,minutes:90,perModule:4});
export function breakdown(percent,policy,review=null){
 const objectiveMax=policy.total*policy.objectivePercent/100;
 const essayMax=policy.total-objectiveMax;
 const objective=percent*objectiveMax/100;
 const essay=review===null?null:essayMax*review.reduce((a,b)=>a+b,0)/(2*review.length);
 return {objective,objectiveMax,essayMax,essay,confirmed:objective+(essay??0),official:essay===null?null:objective+essay};
}
export function essayEditor(q,value,max,showCriteria=true){
 return '<section class="panel"><h3>Tự luận · '+max+' điểm</h3><label>'+esc(q.task)+'<textarea id="essay-answer" maxlength="12000" rows="5">'+esc(value)+'</textarea></label>'+(showCriteria?'<p>Tiêu chí: '+q.criteria.map(c=>esc(c[0])).join(' · ')+'</p>':'')+'</section>';
}
export function reportEssay(h){
 const q=h.essay.question,b=breakdown(h.objectivePercent,h.policy,h.essay.review);
 return '<section class="panel"><h2>Điểm thành phần</h2><p>Trắc nghiệm: '+b.objective.toFixed(2)+' / '+b.objectiveMax+'</p><p>Tự luận: '+(b.essay===null?'Pending Review · chờ đánh giá':b.essay.toFixed(2))+' / '+b.essayMax+'</p><p>Điểm đã xác nhận: '+b.confirmed.toFixed(2)+'</p><p>Tổng chính thức: '+(b.official===null?'Chờ chấm tự luận':b.official.toFixed(2))+'</p><details><summary>Xem bài tự luận và rubric</summary><p>'+esc(q.task)+'</p><p>Bài làm: '+esc(h.essay.text||'Bỏ trống')+'</p><p>Mỗi tiêu chí: 0 = thiếu hoặc sai, 1 = đúng một phần, 2 = đầy đủ và có lập luận.</p>'+q.criteria.map(([k,v])=>'<p><b>'+esc(k)+'</b> · '+esc(v)+'</p>').join('')+'<p>Đáp án tham khảo: '+esc(q.criteria.map(c=>c[1]).join(' '))+'</p><p>Lỗi thường gặp: '+esc(q.pitfall)+'</p><p>'+esc(h.essay.feedback||'')+'</p></details></section>';
}
