// Exercise the actual queue against an in-memory implementation of the SQL revision contract.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const original=await readFile(new URL('../site/cloud.js',import.meta.url),'utf8');
const rows=new Map();let offline=false;
function clientFor(id){
 return {auth:{async getSession(){return {data:{session:{user:{id}}}}}},from(){
  let action='',record,key=id,expected;
  const query={
   select(){return query},eq(k,v){if(k==='revision')expected=v;else key=v;return query},
   insert(v){action='insert';record=v;return query},update(v){action='update';record=v;return query},
   async maybeSingle(){
    if(offline)return {error:{code:'OFFLINE'}};
    assert.equal(key,id);const current=rows.get(id);
    if(!action)return {data:structuredClone(current)||null};
    if(action==='insert'&&current)return {error:{code:'23505'}};
    if(action==='update'&&expected!==current?.revision)return {data:null};
    rows.set(id,structuredClone(record));return {data:{revision:record.revision}};
   }
  };return query
 }};
}
async function device(id,n){
 globalThis['factory'+n]=()=>clientFor(id);
 const source=original.replace("import {projectUrl,publishableKey} from './cloud-config.js';","const projectUrl='https://example.test',publishableKey='public';")
 .replace("new URL('.',import.meta.url).pathname",JSON.stringify('/test'+n+'/'))
 .replace(/const \{createClient\}=await import\([^;]+;/,'const createClient=globalThis.factory'+n+';');
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 await mod.connect();return mod
}
test('two students, two devices, offline retry, stale revision and private session exclusion',async()=>{
 const cache=new Map();globalThis.sessionStorage={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};globalThis.window=new EventTarget();
 const a=await device('A',1);assert.equal(await a.restore(),null);
 a.queue({history:[1],session:{secret:'active'}});await a.flush();assert.deepEqual(rows.get('A').profile,{history:[1],session:null});
 const a2=await device('A',2);assert.deepEqual((await a2.restore()).history,[1]);
 const b=await device('B',3);assert.equal(await b.restore(),null);b.queue({history:[9]});await b.flush();
 offline=true;a.queue({history:[1,2]});await a.flush();assert.ok(a.hasPending());offline=false;await a.flush();assert.ok(!a.hasPending());
 a2.queue({history:['stale']});await a2.flush();assert.ok(a2.hasPending());assert.match(a2.status,/xung đột/);
 assert.deepEqual(rows.get('A').profile.history,[1,2]);assert.deepEqual(rows.get('B').profile.history,[9]);
});
