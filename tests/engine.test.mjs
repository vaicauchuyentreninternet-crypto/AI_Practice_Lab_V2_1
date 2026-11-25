import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCSV,serialize} from '../site/dataset.js';
import {correct,mix,rate,state,blank,day,validateImport} from '../site/core.js';
import {literalEqual} from '../site/answers.js';
const read=n=>JSON.parse(readFileSync(new URL('../site/data/'+n+'.json',import.meta.url)));
test('CSV parses BOM, quoted delimiter, multiline, escaped quote, empty trailing field and CRLF',()=>{
 const tbl=parseCSV('\uFEFFa,b,c\r\n"x,y","q""t",\r\n"u\nv",0,1\n');assert.deepEqual(tbl.body,[['x,y','q"t',''],['u\nv','0','1']]);assert.deepEqual(parseCSV(serialize(tbl)),tbl);
});
test('invalid CSV is rejected before replacing current table',()=>{for(const bad of ['a,a\n1,2','a,b\nx','x\n"open','x\n"a"x',',b\n1,2'])assert.throws(()=>parseCSV(bad))});
test('all canonical answer keys grade correctly and blank inputs never pass',()=>{for(const m of 'ABCD')for(const q of read(m)){assert.ok(correct(q,q.options.length?q.key:String(q.key)),q.id);for(const blank of [-1,'','  '])assert.equal(correct(q,blank),false,q.id)}});
test('numeric locale and Python literal whitespace',()=>{assert.ok(correct({options:[],type:'Số',key:.5},'0,5'));assert.ok(literalEqual('[1,2]', '[1, 2]'));assert.ok(literalEqual('"Ab"',"'Ab'"));assert.equal(literalEqual("'ABC'","'abc'"),false);assert.equal(literalEqual('False','false'),false);assert.equal(literalEqual('0garbage','0'),false)});
test('shuffle preserves membership and returns independent copies',()=>{let src=[1,2,3,4];let runs=Array.from({length:30},()=>mix(src));assert.ok(new Set(runs.map(JSON.stringify)).size>1);for(const r of runs)assert.deepEqual(r.toSorted(),src)});
test('spaced repetition advances and relapses',()=>{for(let i=0;i<4;i++)rate('A001',true);assert.equal(state.reviews.A001.status,'Mastered');rate('A001',false);assert.equal(state.reviews.A001.due,day());assert.equal(state.reviews.A001.run,0)});
test('study day respects the Vietnam midnight boundary',()=>{assert.equal(day(Date.parse('2026-11-24T17:00:00Z')),'2026-11-25')});
test('import rejects damaged or incompatible backup',()=>{const q=new Set(['A001']),l=new Set(['L001']);assert.ok(validateImport(blank(),q,l,18));for(const patch of [{version:9},{done:{999:1}},{drafts:{L099:'unknown'}},{history:[{}]},{plan:{date:'broken'}}])assert.equal(validateImport({...blank(),...patch},q,l,18),false)});
import {retrieve,verifyClaims,verifyGrade} from '../site/inquiry.js';
test('RAG retrieves relevant sources and abstains on unknown terms',()=>{const ls=read('lessons');assert.equal(retrieve('keepdims broadcasting',ls)[0].topic,undefined);assert.match(retrieve('keepdims broadcasting',ls)[0].title,/Broadcasting/);assert.deepEqual(retrieve('xyzzy12345',ls),[])});
test('rejects fabricated references and quotations',()=>{const docs=[{id:'L1',text:'Bằng chứng nguyên văn của bài học.'}];const c={claim:'Một ý',source:'L1',quote:'Bằng chứng nguyên văn'};assert.equal(verifyClaims({claims:[c]},docs).length,1);for(const patch of [{source:'L2'},{quote:'không có trong bài'}])assert.throws(()=>verifyClaims({claims:[{...c,...patch}]},docs))});
test('rubric rejects scores without evidence and missing dimensions',()=>{const essay=read('essays')[0],text='Dùng mẫu số là lượt ghé.';const items=essay.criteria.map((_,i)=>({id:i+1,points:1,feedback:'Cần thêm phép tính.',quote:'lượt ghé'}));assert.equal(verifyGrade({items},essay,text).length,4);assert.throws(()=>verifyGrade({items:items.slice(1)},essay,text));assert.throws(()=>verifyGrade({items:items.map(x=>({...x,quote:'bịa'}))},essay,text))});

import {mountCorrections} from '../site/corrections.js';
test('saved reviews filter, preserve numbering, show answer-specific reasoning, render old histories', () => {
  const buttons = ['all','wrong','blank','flag'].map(filter => ({
    dataset:{filter}, setAttribute(k,v){this[k]=v}, closest(){return this}
  }));
  const controls = {querySelectorAll:()=>buttons, insertAdjacentHTML(p,html){this.notice=html}};
  const count = {}, list = {};
  globalThis.document = {getElementById:id=>({'correction-list':list,'correction-count':count,'correction-filters':controls})[id]};
  try {
    const q = read('B').find(q=>q.options.length);
    const code = read('B').find(q=>!q.options.length && q.type==='Đọc code');
    const choice = (q.key+1)%q.options.length;
    const rows = [{id:q.id,choice:q.key,right:true,blank:false},{id:q.id,choice,right:false,blank:false,flagged:true},
      {id:code.id,choice:'<tag>',right:false,blank:false},{id:code.id,choice:-1,right:false,blank:true}];
    mountCorrections(rows,new Map([[q.id,q],[code.id,code]]));
    assert.match(controls.notice,/Lịch sử cũ/);
    for(const [i,n] of [4,2,1,1].entries()){
      controls.onclick({target:buttons[i]});
      assert.equal(count.textContent,'Hiển thị '+n+' / 4 câu.');
      assert.equal(buttons[i]['aria-pressed'],'true');
      if(i===1){
        assert.match(list.innerHTML,/Câu 2 · Sai/);
        assert.ok(list.innerHTML.includes(q.reasons[choice]));
        assert.ok(list.innerHTML.includes(q.reasons[q.key]));
        assert.match(list.innerHTML,/&lt;tag&gt;/);
        assert.match(list.innerHTML,/Luyện tiếp/);
      }
      if(i===2) assert.match(list.innerHTML,/Câu 4 · Bỏ trống/);
    }
    mountCorrections(rows.slice(0,1),new Map([[q.id,q]]));
    controls.onclick({target:buttons[3]});
    assert.match(count.textContent,/Không có câu/);
  } finally {delete globalThis.document}
});

import {releaseCard,discovery} from '../site/discovery.js';
test('discovery loads newest releases first, tolerates unavailable sources and caches results',async()=>{
 const original=globalThis.fetch;
 let offline=true,calls=0;
 globalThis.fetch=async url=>{
  calls++;
  if(offline||url.includes('scikit-learn'))throw Error();
  return {ok:true,json:async()=>({tag_name:'v1',published_at:url.includes('pytorch')?'2025-03-01':'2025-02-01'})};
 };
 const news={isConnected:true},host={insertAdjacentHTML(_,html){this.html=html},querySelector(){return news}};
 try{
  discovery(host);await new Promise(setImmediate);
  assert.match(news.innerHTML,/Bài đọc lưu trữ/);
  assert.match(host.html,/Repo nổi bật|Repo<\/span>/);
  offline=false;discovery(host);await new Promise(setImmediate);
  assert.ok(news.innerHTML.indexOf('pytorch ·')<news.innerHTML.indexOf('transformers ·'));
  assert.match(news.innerHTML,/github.com\/pytorch\/pytorch\/releases\/tag\/v1/);
  discovery(host);await new Promise(setImmediate);assert.equal(calls,6);
  assert.equal(releaseCard('org/repo',{draft:true,tag_name:'x',published_at:'2025-03-01'}),null);
 }finally{globalThis.fetch=original}
});
