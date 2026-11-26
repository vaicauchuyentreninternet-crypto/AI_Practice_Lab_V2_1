import {esc,ink} from './core.js';

const projects=[
 ['huggingface/transformers','Thử một mô hình xử lý ngôn ngữ với pipeline có sẵn.'],
 ['scikit-learn/scikit-learn','So sánh mô hình phân loại và đọc kết quả đánh giá.'],
 ['pytorch/pytorch','Tìm hiểu tensor, đạo hàm tự động và vòng lặp huấn luyện.']
];
const article=['PyTorch 2.5','Bài đọc lưu trữ · 17/10/2024','https://pytorch.org/blog/pytorch2-5/'];
function link([name,detail,url]){
 return '<a class="row" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><div><strong>'+esc(name)+'</strong><small>'+esc(detail)+'</small></div><span aria-hidden="true">↗</span></a>';
}
export function releaseCard(repo,data){
 if(!data||!data.tag_name||data.draft||data.prerelease||!Number.isFinite(Date.parse(data.published_at)))return null;
 return {date:Date.parse(data.published_at),card:[repo.split('/')[1]+' · '+data.tag_name,
 'Bản phát hành · '+new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(data.published_at)),
 'https://github.com/'+repo+'/releases/tag/'+encodeURIComponent(data.tag_name)]};
}
let cached=null,loading=null;
async function releases(){
 if(cached&&Date.now()-cached.at<300000)return cached.items;
 if(!loading)loading=Promise.allSettled(projects.map(async ([repo])=>{
  const response=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw Error();
  return releaseCard(repo,await response.json());
 })).then(results=>{
  const items=results.flatMap(r=>r.status==='fulfilled'&&r.value?[r.value]:[]).sort((a,b)=>b.date-a.date);
  if(items.length)cached={at:Date.now(),items};
  return items;
 }).finally(()=>{loading=null});
 return loading;
}
export function discovery(host){
 host.insertAdjacentHTML('beforeend','<section class="section"><h2>'+ink('Tin AI và công cụ')+'</h2><div data-news>'+link(article)+'</div></section><section class="section"><h2>'+ink('Repo nổi bật')+'</h2>'+projects.map(([repo,detail])=>link([repo,detail,'https://github.com/'+repo])).join('')+'</section>');
 const news=host.querySelector('[data-news]');
 releases().then(items=>{if(news.isConnected)news.innerHTML=items.length?items.map(x=>link(x.card)).join(''):'<p class="small">Chưa tải được tin phát hành từ GitHub.</p>'+link(article)});
}
