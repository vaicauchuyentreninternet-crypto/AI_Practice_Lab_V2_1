// Largest-remainder allocation; a shortage is reported before a session is created.
export function allocateDifficulty(count,weights){
 if(!Number.isInteger(count)||count<1||weights.length!==5||
    weights.some(w=>!Number.isInteger(w)||w<0)||weights.reduce((a,b)=>a+b,0)!==100)
   throw Error('Năm tỷ lệ độ khó phải là số nguyên không âm và có tổng 100%.');
 const quotas=weights.map(w=>count*w/100);
 const result=quotas.map(Math.floor);
 const order=quotas.map((q,i)=>({i,f:q-result[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
 const left=count-result.reduce((a,b)=>a+b,0);
 for(const {i} of order.slice(0,left))result[i]++;
 return result;
}
export function selectLevels(pool,count,weights,shuffle){
 if(count>pool.length)throw Error('Chỉ có '+pool.length+' câu phù hợp.');
 if(!weights)return shuffle(pool).slice(0,count);
 const picked=allocateDifficulty(count,weights).flatMap((n,i)=>{
  const candidates=pool.filter(q=>q.level===i+1);
  if(n>candidates.length)throw Error('Cấp '+(i+1)+' cần '+n+' câu nhưng chỉ có '+candidates.length+'. Hãy đổi tỷ lệ hoặc số câu.');
  return shuffle(candidates).slice(0,n);
 });
 return shuffle(picked);
}
