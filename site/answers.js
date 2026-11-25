// Compare Python literals without executing learner input. Preserve content inside strings.
export function pythonTokens(text) {
 const tokens=[];let pos=0;
 while(pos<text.length){
  const c=text[pos];if(/\s/.test(c)){pos++;continue}
  if(c==="'"||c==='"'){
   let value='',closed=false;pos++;
   while(pos<text.length){const ch=text[pos++];if(ch===c){closed=true;break}if(ch==='\\'){const next=text[pos++];value+=({n:'\n',t:'\t',r:'\r'}[next]??next)}else value+=ch}
   if(!closed)return null;tokens.push(['str',value]);continue
  }
  const match=text.slice(pos).match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|^[A-Za-z_]+/i);
  if(match){const word=match[0];tokens.push(Number.isFinite(Number(word))?['num',Number(word)]:['name',word]);pos+=word.length;continue}
  tokens.push(['symbol',c]);pos++;
 }
 return tokens;
}
export function literalEqual(left,right){const a=pythonTokens(String(left)),b=pythonTokens(String(right));return !!a&&!!b&&a.length===b.length&&a.every(([t,v],i)=>t===b[i][0]&&(t==='num'?Math.abs(v-b[i][1])<=1e-8:v===b[i][1]))}
