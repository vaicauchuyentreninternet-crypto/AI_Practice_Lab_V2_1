import * as cloud from './cloud.js';
import {literalEqual} from './answers.js';
export const names={A:'Toán học & định lượng',B:'Lập trình & dữ liệu',C:'AI & tư duy sản phẩm',D:'Logic & đạo đức'};
export const links={home:'Tổng quan',exam:'Luyện thi',bank:'Ngân hàng câu hỏi',learn:'Lộ trình học',lab:'Phòng lập trình',dataset:'Phòng dữ liệu',review:'Ôn tập hôm nay',analytics:'Phân tích kết quả',plan:'Kế hoạch học',settings:'Cài đặt'};
export const el=id=>document.getElementById(id);
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ink=v=>'<span data-ink>'+esc(v).split(' ').map(w=>'<span class="ink-word">'+w+'</span>').join(' ')+'</span>';
export const title=(a,b,c='')=>'<div class="eyebrow">'+esc(a)+'</div><h1>'+ink(b)+'</h1>'+(c?'<p class="lead">'+esc(c)+'</p>':'');
export const row=(href,a,b,meta='↗')=>'<a class="row" href="#'+esc(href)+'"><div><strong>'+esc(a)+'</strong><small>'+esc(b)+'</small></div><span class="arrow">'+esc(meta)+'</span></a>';
export const button=(href,label,primary=false)=>'<a class="btn '+(primary?'primary':'')+'" href="#'+esc(href)+'">'+esc(label)+'</a>';
export const option=(v,t,selected=false)=>'<option value="'+esc(v)+'" '+(selected?'selected':'')+'>'+esc(t)+'</option>';
export function mix(xs,random=Math.random){let a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function day(ts=Date.now()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(ts))}
export const dateAfter=n=>day(Date.now()+n*86400000);
export const seconds=n=>Math.floor(n/60)+' phút '+Math.floor(n%60)+' giây';
export const blank=()=>({version:1,essays:{},history:[],reviews:{},done:{},labs:{},drafts:{},session:null,plan:{date:'2026-11-28',minutes:60,start:'19:00',target:80,priority:'B',level:'Cơ bản'},theme:'light'});
const storageScope=new URL('.',import.meta.url).pathname;const journalKey='apl-active:'+storageScope;export const state=blank(); let db;
export async function init(){db=await new Promise((ok,fail)=>{let r=indexedDB.open('ai-practice-lab-v1:'+storageScope,1);r.onupgradeneeded=()=>r.result.createObjectStore('personal');r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error)});const stored=await new Promise((ok,fail)=>{let r=db.transaction('personal').objectStore('personal').get('profile');r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error)});await cloud.connect();if(cloud.user){const profile=await cloud.restore();if(profile)Object.assign(state,profile);const active=sessionStorage.getItem(journalKey+':'+cloud.user.id);if(active)state.session=JSON.parse(active);return}if(stored)Object.assign(state,stored);try{const backup=JSON.parse(localStorage.getItem(journalKey)||'null');if(backup&&state.session&&backup.start===state.session.start)state.session=backup}catch{}}
export function guestProfile(){return new Promise((ok,fail)=>{const r=db.transaction('personal').objectStore('personal').get('profile');r.onsuccess=()=>ok(r.result??blank());r.onerror=()=>fail(r.error)})}
export function save(){if(cloud.user){const k=journalKey+':'+cloud.user.id;if(state.session)sessionStorage.setItem(k,JSON.stringify(state.session));else sessionStorage.removeItem(k);cloud.queue(state);return Promise.resolve()}try{if(state.session)localStorage.setItem(journalKey,JSON.stringify(state.session));else localStorage.removeItem(journalKey)}catch{}const tx=db.transaction('personal','readwrite');tx.objectStore('personal').put(structuredClone(state),'profile');return new Promise((ok,fail)=>{tx.oncomplete=ok;tx.onerror=()=>{notify('Không lưu được tiến độ. Hãy xuất bản sao trong Cài đặt.');fail(tx.error)}})}
export function rate(id,right,confidence=right?3:1){const old=state.reviews[id]||{ok:0,miss:0,run:0};const run=right?old.run+1:0;state.reviews[id]={ok:old.ok+(right?1:0),miss:old.miss+(right?0:1),run,confidence,last:day(),due:dateAfter(right?[1,3,7,14,30][Math.min(4,Math.max(0,run-1))]:0),status:right?(run>=4?'Mastered':'Reviewing'):'Learning'}}
let toastTimer;export function notify(s){el('toast').textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el('toast').textContent='',3200)}
const cache={};export function data(k){return cache[k]??=(fetch('./data/'+k+'.json').then(r=>{if(!r.ok)throw Error('Thiếu học liệu '+k);return r.json()}).catch(e=>{delete cache[k];throw e}))}
export async function bank(m=''){return m?data(m):(await Promise.all(Object.keys(names).map(data))).flat()}
export function download(filename,content,type){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
export function validateImport(s,ids,labIds,lessonCount){
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v),num=v=>Number.isFinite(v)&&v>=0,iso=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)&&!isNaN(Date.parse(v));
 const validReview=id=>ids.has(id)||(/^F\d+$/.test(id)&&Number(id.slice(1))<lessonCount);
 const result=r=>obj(r)&&ids.has(r.id)&&typeof r.right==='boolean'&&typeof r.blank==='boolean'&&num(r.time)&&((Number.isInteger(r.choice)&&r.choice>=-1&&r.choice<=3)||(typeof r.choice==='string'&&r.choice.length<=100));
 if(!obj(s)||s.version!==1||!['dark','light'].includes(s.theme)||!Array.isArray(s.history)||!['reviews','labs','done','drafts','plan'].every(k=>obj(s[k])))return false;
 if(!s.history.every(h=>obj(h)&&Array.isArray(h.rows)&&h.rows.length&&h.rows.every(result)&&num(h.score)&&h.score<=100&&num(h.at)&&h.at<=8.64e15&&num(h.duration)&&typeof h.mode==='string'))return false;
 if(!Object.entries(s.reviews).every(([id,r])=>validReview(id)&&obj(r)&&['ok','miss','run','confidence'].every(k=>num(r[k]))&&iso(r.due)&&iso(r.last)))return false;
 if(!Object.entries(s.labs).every(([id,v])=>labIds.has(id)&&num(v))||!Object.entries(s.done).every(([id,v])=>/^\d+$/.test(id)&&+id<lessonCount&&num(v))||!Object.entries(s.drafts).every(([id,v])=>labIds.has(id)&&typeof v==='string'&&v.length<100000))return false;
 const p=s.plan;if(!iso(p.date)||!num(p.minutes)||p.minutes<10||p.minutes>720||!Object.keys(names).includes(p.priority)||!/^\d\d:\d\d$/.test(p.start)||!num(p.target)||p.target>100||typeof p.level!=='string')return false;
 if(s.essays!==undefined&&(!obj(s.essays)||!Object.entries(s.essays).every(([k,v])=>/^E0[1-4]$/.test(k)&&obj(v)&&typeof v.text==='string'&&v.text.length<=12000&&Array.isArray(v.scores)&&v.scores.length<=4&&v.scores.every(n=>n===null||[0,1,2].includes(n)))))return false;
 return s.session===null;
}
export const written=q=>!q.options.length;
export const isAnswered=v=>v!==-1&&String(v??'').trim()!=='';
export function correct(q,v){if(!isAnswered(v))return false;if(!written(q))return v===q.key;if(q.type==='Đọc code')return literalEqual(v,q.key);if(q.type==='Số'){const s=String(v).trim().replace(',','.');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Math.abs(Number(s)-q.key)<1e-8}return String(v).trim().toLowerCase()===String(q.key).toLowerCase()}
export const answerText=(q,v)=>isAnswered(v)?(written(q)?String(v):q.options[v]):'Bỏ trống';

export const keyText=q=>written(q)?String(q.key):q.options[q.key];
