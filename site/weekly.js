import {configured,user,weeklyRpc} from './cloud.js';
import {esc,button,title,el} from './core.js';

export async function showWeekly(host,play=false){
 if(!configured){host.textContent='Bảng xếp hạng sẽ mở khi kết nối dịch vụ lớp học.';return}
 try{
  const s=await weeklyRpc('weekly_status');
  if(!host.isConnected)return;
  const total=s.total??5;
  const board=s.leaders.map(r=>'<p>Hạng '+r.rank+' · Sinh viên #'+r.alias+' · '+r.points+'/'+total+'</p>').join('');
  host.innerHTML='<p>Tuần bắt đầu '+esc(s.week)+' · Giờ Việt Nam</p>'+(board||'<p>Chưa có bài nộp tuần này.</p>');
  if(s.mine!=null){host.insertAdjacentHTML('beforeend','<strong>Điểm của bạn · '+s.mine+'/'+total+'</strong>');return}
  if(!play||!user){host.insertAdjacentHTML('beforeend',button(user?'weekly':'account',user?'Làm thử thách 45 phút':'Đăng nhập để tham gia'));return}
  if(!s.deadline){
   host.insertAdjacentHTML('beforeend','<p>'+total+' câu · 45 phút từ lúc bắt đầu. Đề đóng khi sang tuần mới. Hãy nộp đủ '+total+' câu trước khi hết giờ.</p><button class="primary">Bắt đầu 45 phút</button>');
   const start=host.querySelector('button');
   start.onclick=async()=>{start.disabled=true;try{await weeklyRpc('weekly_start');await showWeekly(host,true)}catch(err){start.disabled=false;start.title=err.message;alert(err.message)}};
   return;
  }
  const end=performance.now()+Date.parse(s.deadline)-Date.parse(s.now);
  if(end<=performance.now()){host.insertAdjacentHTML('beforeend','<p>Đã hết giờ làm bài tuần này.</p>');return}
  const form=document.createElement('form');
  form.innerHTML='<p>Mỗi tài khoản nộp một lần trong tuần. Mỗi câu đúng được một điểm. Các bạn bằng điểm cùng hạng.</p>'+s.questions.map((q,i)=>'<fieldset><legend>'+ (i+1)+'. '+esc(q.prompt)+'</legend>'+q.options.map((v,j)=>'<label><input required type="radio" name="'+esc(q.id)+'" value="'+j+'"> '+esc(v)+'</label>').join('')+'</fieldset>').join('')+'<button class="primary">Nộp bài xếp hạng</button><p role="status"></p>';
  host.append(form);
  const clock=document.createElement('strong');
  form.prepend(clock);
  const tick=()=>{
   if(!form.isConnected)return;
   const sec=Math.max(0,Math.ceil((end-performance.now())/1000));
   clock.textContent='Còn lại '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
   if(sec)setTimeout(tick,500);
   else form.replaceChildren(document.createTextNode('Đã hết giờ làm bài tuần này.'));
  };
  tick();
  form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;
   try{const answers=Object.fromEntries([...new FormData(form)].map(([id,v])=>[id,Number(v)]));await weeklyRpc('weekly_submit',{w:s.week,answers});await showWeekly(host,true)}
   catch(err){if(b.isConnected){form.querySelector('[role=status]').textContent=err.message;b.disabled=false}}
  };
 }catch{host.innerHTML='<p>Chưa tải được thử thách tuần.</p><button>Thử lại</button>';host.querySelector('button').onclick=()=>showWeekly(host,play)}
}
export function weekly(){el('main').innerHTML=title('Thử thách chung','Xếp hạng tuần này')+'<section id="weekly-board"></section>';return showWeekly(el('weekly-board'),true)}
