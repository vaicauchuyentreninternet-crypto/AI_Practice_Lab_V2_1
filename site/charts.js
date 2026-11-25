import {esc} from './core.js';
export function bars(name,points,unit,max){
 const ceiling=max||Math.max(1,...points.map(p=>p[1]));
 return '<section class="panel stack"><h3>'+esc(name)+'</h3>'+points.map(([label,value])=>'<div class="chart-row"><span>'+esc(label)+'</span><i aria-hidden="true"><span style="width:'+Math.max(0,Math.min(100,value/ceiling*100))+'%"></span></i><b>'+esc(value)+esc(unit)+'</b></div>').join('')+'</section>';
}
