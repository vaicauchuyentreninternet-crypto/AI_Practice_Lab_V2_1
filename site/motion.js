const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const animations=new WeakMap();
function count(button){
 const end=Number(button.dataset.count),suffix=button.dataset.suffix||'';
 if(reduced.matches){button.textContent=end+suffix;return}
 cancelAnimationFrame(animations.get(button));const start=performance.now();
 function step(now){const t=Math.min(1,(now-start)/580);button.textContent=Math.round(end*(1-(1-t)**3))+suffix;if(t<1)animations.set(button,requestAnimationFrame(step))}
 animations.set(button,requestAnimationFrame(step));
}
export function mountCounts(root){for(const b of root.querySelectorAll('[data-count]')){b.onclick=()=>count(b);count(b)}}
