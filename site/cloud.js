import {projectUrl,publishableKey} from './cloud-config.js';
export const configured=Boolean(projectUrl&&publishableKey);
export let user=null,status='Chế độ khách';
let client,revision=0,pending=null,running=null,blocked=false,timer;
const scope=new URL('.',import.meta.url).pathname;
const cacheKey=()=> 'apl-cloud:'+scope+':'+projectUrl+':'+user.id;
function report(message){status=message;window.dispatchEvent(new Event('apl-sync'))}
function persist(){sessionStorage.setItem(cacheKey(),JSON.stringify({revision,pending}))}
export function cloudPayload(profile){return {...structuredClone(profile),session:null}}
export async function connect(){
 if(!configured)return;
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm');
 client=createClient(projectUrl,publishableKey,{auth:{storage:sessionStorage,storageKey:'apl-login:'+scope+':'+projectUrl,detectSessionInUrl:false}});
 const {data,error}=await client.auth.getSession();if(error)throw error;
 user=data.session?.user??null;
}
export async function requestCode(email){const {error}=await client.auth.signInWithOtp({email});if(error)throw error}
export async function verify(email,token){const {error}=await client.auth.verifyOtp({email,token,type:'email'});if(error)throw error;location.reload()}
async function read(){const {data,error}=await client.from('student_progress').select('profile,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
export async function restore(){
 const raw=sessionStorage.getItem(cacheKey());const cached=raw?JSON.parse(raw):null;
 if(cached?.pending){revision=cached.revision;pending=cached.pending;report('Có thay đổi đang chờ đồng bộ');schedule();return pending}
 const row=await read();revision=row?.revision??0;report('Đã tải hồ sơ tài khoản');return row?.profile??null;
}
function schedule(){clearTimeout(timer);timer=setTimeout(flush,600)}
export function queue(profile){pending=cloudPayload(profile);persist();report(blocked?'Có xung đột giữa hai phiên':'Đã lưu trong tab · đang chờ đồng bộ');if(!blocked)schedule()}
export async function flush(){
 if(running)return running;if(!user||!pending||blocked)return;
 running=(async()=>{
  while(pending&&!blocked){
   const batch=pending,next=revision+1;
   const table=client.from('student_progress');
   const query=revision===0?table.insert({user_id:user.id,revision:next,profile:batch}):table.update({revision:next,profile:batch}).eq('user_id',user.id).eq('revision',revision);
   const {data,error}=await query.select('revision').maybeSingle();
   if(error&&error.code!=='23505')throw error;
   if(error||!data){blocked=true;report('Có xung đột. Hãy xuất JSON để giữ bản trong tab, rồi tải lại bản trên máy chủ.');break}
   revision=data.revision;if(pending===batch)pending=null;persist();
  }
  if(!pending)report('Đã đồng bộ lên tài khoản')
 })().catch(()=>report('Chưa đồng bộ được. Giữ tab đang mở và thử lại.')).finally(()=>running=null);
 return running;
}
export function hasPending(){return !!pending}
export function discardAndReload(){if(running)throw Error('Hãy chờ yêu cầu đang chạy kết thúc.');sessionStorage.removeItem(cacheKey());location.reload()}
export async function logout(){await flush();if(pending)throw Error('Còn tiến độ chưa đồng bộ. Hãy xuất JSON hoặc đồng bộ trước khi đăng xuất.');const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;sessionStorage.removeItem(cacheKey());location.reload()}

export async function weeklyRpc(name,args={}){
 const {data,error}=await client.rpc(name,args);
 if(error)throw Error(error.message);
 return data;
}
