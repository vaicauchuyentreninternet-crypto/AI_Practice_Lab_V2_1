import {data,el,esc,title,option,state,save,notify} from './core.js';
let stop=null;export function leaveLab(){stop?.();stop=null}
const sample=v=>JSON.stringify(v);
export async function labPage(id){
 const labs=await data('labs');const lab=labs.find(l=>l.id===id)||labs[0];
 el('main').innerHTML=title('Coding studio / '+lab.id,'Phòng lập trình','Viết hàm solve(x), chạy thử và so sánh kết quả với từng ca kiểm thử.')+'<div class="filters"><label>Chuyên đề<select id="category">'+['Python','NumPy','Pandas'].map(k=>option(k,k,k===lab.track)).join('')+'</select></label><label>Bài thực hành<select id="pick">'+labs.filter(q=>q.track===lab.track).map(q=>option(q.id,q.title,q.id===lab.id)).join('')+'</select></label></div><div class="layout"><section class="panel stack"><span class="eyebrow">'+lab.id+' / '+lab.track+'</span><h2>'+esc(lab.title)+'</h2><p>'+esc(lab.task)+'</p><label>Mã Python<span class="editor-shell"><pre class="highlight" id="highlight" aria-hidden="true"></pre><textarea aria-label="Mã Python" class="editor" id="code" spellcheck="false" maxlength="65000"></textarea></span></label><div class="actions"><button id="run" class="primary">▷ Chạy kiểm thử</button><button id="halt" disabled>Dừng chạy</button><button id="reset">Khôi phục mã đầu</button></div><div id="console" role="status">Console sẵn sàng. Lần chạy đầu cần tải Python qua mạng.</div></section><aside class="panel stack"><h3>Dữ liệu kiểm thử</h3>'+lab.tests.map(([x,v],i)=>'<small>Ca '+(i+1)+'</small><pre>'+esc(sample(x))+'\n→ '+esc(sample(v))+'</pre>').join('')+'<details><summary>Gợi ý & lời giải mẫu</summary><p>Đối chiếu kiểu của đầu ra và trường hợp biên trong ca thứ hai.</p><pre>'+esc(lab.solution)+'</pre></details></aside></div>';
 function highlight(){
  const code=el('code'),layer=el('highlight');
  const tokens=code.value.match(/#[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b(?:def|for|return|if|else|in|None|True|False|import|from|as|and|or|not|while|class|try|except|pass|with|raise|break|continue)\b|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|[^\S\n]+|[\s\S]/g)||[];
  layer.innerHTML=tokens.map(t=>{const cls=t[0]==='#'?'comment':/^['"]/.test(t)?'str':/^\d/.test(t)?'num':/^(def|for|return|if|else|in|None|True|False|import|from|as|and|or|not|while|class|try|except|pass|with|raise|break|continue)$/.test(t)?'kw':'';return cls?'<span class="'+cls+'">'+esc(t)+'</span>':esc(t)}).join('')+'\n';layer.scrollTop=code.scrollTop;layer.scrollLeft=code.scrollLeft;
 }
  el('code').value=state.drafts[lab.id]??lab.starter;highlight();el('code').onscroll=()=>{el('highlight').scrollTop=el('code').scrollTop;el('highlight').scrollLeft=el('code').scrollLeft};el('code').oninput=()=>{highlight();state.drafts[lab.id]=el('code').value;save()};el('reset').onclick=()=>{if(confirm('Khôi phục mã khởi đầu của bài này?')){el('code').value=lab.starter;el('code').oninput()}};el('pick').onchange=()=>location.hash='lab/'+el('pick').value;el('category').onchange=()=>location.hash='lab/'+labs.find(q=>q.track===el('category').value).id;
 el('run').onclick=async()=>{
  el('run').disabled=true;el('halt').disabled=false;el('console').textContent='Đang tải trình thông dịch Python…';
  let frame=document.createElement('iframe'),timeout;frame.hidden=true;frame.sandbox='allow-scripts';const channel=new MessageChannel();
  const finish=()=>{clearTimeout(timeout);channel.port1.close();frame.remove();if(el('run')){el('run').disabled=false;el('halt').disabled=true}stop=null};stop=finish;
  const limit=(ms,msg)=>{clearTimeout(timeout);timeout=setTimeout(()=>{finish();el('console').textContent=msg},ms)};
  el('halt').onclick=()=>{finish();el('console').textContent='Đã dừng môi trường Python.'};
  try{
   const source=await fetch('./lab-worker.js').then(r=>{if(!r.ok)throw Error('Không tải được worker.');return r.text()});if(stop!==finish)return;
   const userCode=el('code').value;
   frame.srcdoc=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net; worker-src blob:; connect-src https://cdn.jsdelivr.net; child-src blob:"><script>onmessage=e=>{if(e.source!==parent)return;const p=e.ports[0],d=e.data;const w=new Worker(URL.createObjectURL(new Blob([d.source],{type:'application/javascript'})));p.onmessage=()=>w.terminate();w.onmessage=m=>p.postMessage(m.data);w.onerror=m=>p.postMessage({kind:'error',message:m.message});w.postMessage(d.payload)}<\/script>`;
   frame.onload=()=>{if(stop===finish)frame.contentWindow.postMessage({source,payload:{code:userCode,tests:lab.tests,track:lab.track}},'*',[channel.port2])};document.body.append(frame);
   limit(90000,'Tải Python quá thời hạn. Kiểm tra kết nối đến cdn.jsdelivr.net rồi chạy lại.');
   channel.port1.onmessage=async({data:d})=>{if(d.kind==='ready'){el('console').textContent='Đang thực thi trong worker…';limit(8000,'Đã dừng sau giới hạn thực thi 8 giây.');return}
    finish();if(d.kind==='error'){el('console').textContent='Không thực thi được Python: '+d.message;return}
    const passed=d.rows.every(r=>r.ok);el('console').innerHTML='<h3>'+d.rows.filter(r=>r.ok).length+'/'+lab.tests.length+' ca đạt</h3>'+d.rows.map((r,i)=>'<p>Ca '+(i+1)+' · '+(r.ok?'Đạt':'Chưa đạt')+'</p><pre>'+esc(r.actual)+'</pre>').join('')+(d.output?'<pre>'+esc(d.output)+'</pre>':'');
    if(passed){state.labs[lab.id]=Date.now();await save();notify('Đã ghi nhận hoàn thành '+lab.id)}
   }
  }catch(e){finish();el('console').textContent=e.message}
 }
}
