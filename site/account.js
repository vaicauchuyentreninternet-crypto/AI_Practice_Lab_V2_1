import {el,esc,title,button,state,blank,save,guestProfile} from './core.js';
import * as cloud from './cloud.js';
const counts=s=>s.history.length+' bài đã nộp · '+Object.keys(s.done).length+' bài đọc · '+Object.keys(s.labs).length+' bài code · '+Object.keys(s.essays||{}).length+' bài tự luận';
export async function account(){
 const main=el('main');
 main.innerHTML=title('Hồ sơ sinh viên','Tài khoản',cloud.user?'Tiến độ được lưu theo tài khoản email của bạn.':'Dùng tài khoản để mở lại tiến độ trên thiết bị khác.');
 if(!cloud.configured){main.innerHTML+='<p class="note">Bản cài đặt này đang chạy ở chế độ khách. Quản trị viên cần kết nối Supabase để mở đăng nhập cho sinh viên.</p>'+button('settings','Sao lưu tiến độ khách');return}
 if(!cloud.user){
  main.innerHTML+='<form class="panel stack" id="login"><label>Email sinh viên<input id="email" type="email" autocomplete="email" required></label><button class="primary">Nhận mã qua email</button></form><form class="panel stack" id="verify" hidden><label>Mã xác nhận<input id="otp" inputmode="numeric" autocomplete="one-time-code" required></label><button>Xác nhận đăng nhập</button></form><p id="feedback" role="status"></p>';
  let sent='';el('login').onsubmit=e=>{e.preventDefault();const address=el('email').value.trim();perform(e.target.querySelector('button'),async()=>{await cloud.requestCode(address);sent=address;el('verify').hidden=false;el('feedback').textContent='Kiểm tra hộp thư của '+address})};
  el('verify').onsubmit=e=>{e.preventDefault();perform(e.target.querySelector('button'),()=>cloud.verify(sent,el('otp').value.trim()))};return
 }
 const guest=await guestProfile();if(location.hash!=='#account')return;
 main.innerHTML+='<section class="panel stack"><strong>'+esc(cloud.user.email)+'</strong><p>'+counts(state)+'</p><p id="syncStatus" role="status">'+esc(cloud.status)+'</p><div class="actions"><button id="sync">Đồng bộ ngay</button><button id="pull">Tải hồ sơ từ máy chủ</button><button id="exitAccount">Đăng xuất</button></div>'+button('settings','Xuất bản sao JSON')+'</section><section class="panel section stack"><h3>Tiến độ khách trên máy này</h3><p>'+counts(guest)+'</p><p>Chỉ nhập nếu đây là tiến độ của bạn. Thao tác này áp dụng cho tài khoản còn trống.</p><button id="adopt">Nhập tiến độ khách</button></section><p id="feedback" role="status"></p>';
 el('sync').onclick=e=>perform(e.target,()=>cloud.flush());
 el('pull').onclick=()=>{if(state.session){el('feedback').textContent='Hãy nộp bài đang làm trước.';return}if(!cloud.hasPending()||confirm('Thay đổi chưa đồng bộ trong tab sẽ bị bỏ. Bạn đã xuất bản sao cần giữ?'))perform(el('pull'),()=>cloud.discardAndReload())};
 el('exitAccount').onclick=e=>perform(e.target,async()=>{if(state.session)throw Error('Hãy nộp bài đang làm trước khi đăng xuất.');await cloud.logout()});
 el('adopt').onclick=e=>perform(e.target,async()=>{const empty=blank();if(state.session||['history','reviews','done','labs','drafts','essays','plan'].some(k=>JSON.stringify(state[k])!==JSON.stringify(empty[k])))throw Error('Tài khoản đã có tiến độ hoặc kế hoạch riêng. Bạn có thể xuất hồ sơ khách thành JSON.');if(!confirm('Nhập các bài đã hoàn thành và bản nháp từ hồ sơ khách trên máy này?'))return;Object.assign(state,cloud.cloudPayload(guest));await save();await cloud.flush();await account()});
}
async function perform(btn,fn){btn.disabled=true;try{await fn()}catch(e){if(el('feedback'))el('feedback').textContent=e.message}finally{btn.disabled=false}}
window.addEventListener('apl-sync',()=>{if(el('syncStatus'))el('syncStatus').textContent=cloud.status});
