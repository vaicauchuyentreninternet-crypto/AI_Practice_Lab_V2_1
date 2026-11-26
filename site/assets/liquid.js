/* Liquid ink: frame-rate independent damped flow, continuous multi-source color field. */
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const supported=CSS.supports('background-clip','text')||CSS.supports('-webkit-background-clip','text');
 if(!supported)return;
 const ink=new Map(), art=new Map(), touch=new Map();
 const maxWaves=5, maxTrails=5;
 let hover=null, hoverArt=null, raf=0, last=0, geometryDirty=false;
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
 const approach=(x,y,dt,tau)=>y+(x-y)*Math.exp(-dt/tau);
 const rnd=n=>Math.round(n*10)/10;
 const rgba=(c,a)=>`rgba(${c.join(',')},${clamp(a,0,1).toFixed(3)})`;
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
 const inView=el=>el.isConnected&&!el.closest('[hidden]')&&el.getClientRects().length>0;
 function measure(s){
   const r=s.el.getBoundingClientRect(),pad=12;
   s.rect={left:r.left+scrollX-pad,top:r.top+scrollY-pad,w:r.width+pad*2,h:r.height+pad*2};
   // Compute colors before enabling the background layer. The actual color is never changed.
   for(const w of s.words){const b=w.getBoundingClientRect();w.style.setProperty('--liquid-base',getComputedStyle(w).color);w.style.setProperty('--liquid-offset-x',`${rnd(s.rect.left-b.left-scrollX)}px`);w.style.setProperty('--liquid-offset-y',`${rnd(s.rect.top-b.top-scrollY)}px`)}
   s.el.style.setProperty('--liquid-width',`${rnd(s.rect.w)}px`);s.el.style.setProperty('--liquid-height',`${rnd(s.rect.h)}px`);
   s.radius=clamp(parseFloat(getComputedStyle(s.el).fontSize)*1.42,85,245);
   const c=getComputedStyle(s.words[0]||s.el).color.match(/[\d.]+/g)?.map(Number)||[20,45,83];
   const light=.2126*c[0]+.7152*c[1]+.0722*c[2]>145;
   s.palette=light?[[161,207,255],[119,181,250],[220,237,255],[103,160,230]]:[[38,83,144],[20,53,106],[57,104,170],[19,40,80]];
 }
 function getInk(el,x,y){
   let s=ink.get(el);if(s)return s;
   s={el,words:[...el.querySelectorAll('.ink-word')],rect:null,radius:100,palette:[],x:x+scrollX,y:y+scrollY,tx:x+scrollX,ty:y+scrollY,amp:0,target:0,trail:[],waves:[],vx:0,vy:0,phase:0,lastStamp:0};
   for(let i=0;i<maxTrails;i++)s.trail.push({x:s.x,y:s.y});
   measure(s);ink.set(el,s);return s;
 }
 function setPoint(s,x,y){s.tx=x+scrollX;s.ty=y+scrollY;}
 function enter(el,x,y){if(hover&&hover.el!==el)hover.target=0;
   if(!el){hover=null;wake();return;}hover=getInk(el,x,y);setPoint(hover,x,y);hover.target=1;wake();}
 function leave(){if(hover)hover.target=0;hover=null;if(hoverArt)hoverArt.target=0;hoverArt=null;wake();}
 function artPoint(el,x,y){
   if(hoverArt&&hoverArt.el!==el)hoverArt.target=0;
   if(!el){hoverArt=null;return;}
   let s=art.get(el);if(!s){s={el,x:0,y:0,tx:0,ty:0,amp:0,target:0};art.set(el,s);}
   let r=el.getBoundingClientRect();s.tx=clamp((x-r.left)/r.width-.5,-.5,.5)*13;s.ty=clamp((y-r.top)/r.height-.5,-.5,.5)*13;s.target=1;hoverArt=s;wake();
 }
 function pulse(el,x,y,strength=1){let s=getInk(el,x,y);let px=x+scrollX,py=y+scrollY;let far=Math.hypot(Math.max(Math.abs(px-s.rect.left),Math.abs(px-s.rect.left-s.rect.w)),Math.max(Math.abs(py-s.rect.top),Math.abs(py-s.rect.top-s.rect.h)));
   s.waves.push({x:px,y:py,t:0,max:Math.min(far+100,1300),strength,seed:Math.random()*Math.PI*2});if(s.waves.length>maxWaves)for(const old of s.waves.slice(0,-maxWaves))old.retire=true;
   wake();return s;
 }
 function blob(x,y,rx,ry,col,a,soft=.55){return `radial-gradient(ellipse ${rnd(rx)}px ${rnd(ry)}px at ${rnd(x)}px ${rnd(y)}px,${rgba(col,a)} 0%,${rgba(col,a*.66)} ${Math.round(soft*100)}%,${rgba(col,a*.12)} 83%,${rgba(col,0)} 100%)`;}
 function ring(x,y,r,aspect,col,a,width){const inner=Math.max(0,r-width),end=r+width*1.25;return `radial-gradient(ellipse ${rnd(end)}px ${rnd(end*aspect)}px at ${rnd(x)}px ${rnd(y)}px,${rgba(col,0)} ${rnd(inner/end*100)}%,${rgba(col,a*.72)} ${rnd(Math.max(inner,r-width*.35)/end*100)}%,${rgba(col,a)} ${rnd(r/end*100)}%,${rgba(col,a*.12)} 91%,${rgba(col,0)} 100%)`;}
 function advance(s,dt){
   const beforeX=s.x,beforeY=s.y;
   // A gently lagging head, followed by a chain of differently damped ink droplets.
   if(s.target===0&&s.amp>.025){s.tx+=clamp(s.vx*dt*.26,-8,8);s.ty+=clamp(s.vy*dt*.26,-8,8);}
   s.x=approach(s.x,s.tx,dt,68);s.y=approach(s.y,s.ty,dt,68);
   s.vx=approach(s.vx,(s.x-beforeX)/dt,dt,75);s.vy=approach(s.vy,(s.y-beforeY)/dt,dt,75);
   s.amp=approach(s.amp,s.target,dt,s.target>s.amp?78:230);
   s.phase+=dt*.0022;
   for(let i=0;i<s.trail.length;i++){const p=s.trail[i],lead=i?s.trail[i-1]:s;p.x=approach(p.x,lead.x,dt,44+i*15);p.y=approach(p.y,lead.y,dt,44+i*15);}
   for(const w of s.waves){w.t+=dt;if(w.retire)w.strength=approach(w.strength,0,dt,100)}
   s.waves=s.waves.filter(w=>w.t<1400&&w.strength>.006);
 }
 // Rasterize a low-resolution domain-warped ink surface, then sample the same surface through every glyph.
 // The grid never touches layout; bilinear interpolation keeps the curves soft at display resolution.
 function liquidTexture(s){
   const R=s.radius,L=s.rect.left,T=s.rect.top,W=s.rect.w,H=s.rect.h;
   const res=clamp(Math.ceil(Math.max(W,H)/6),60,155),scale=res/Math.max(W,H),nx=Math.max(8,Math.round(W*scale)),ny=Math.max(8,Math.round(H*scale));
   if(!s.surface||s.surface.width!==nx||s.surface.height!==ny){
     s.surface=document.createElement('canvas');s.surface.width=nx;s.surface.height=ny;
     s.ctx=s.surface.getContext('2d',{alpha:true});if(!s.ctx)return null;s.pixels=s.ctx.createImageData(nx,ny);
   }
   if(!s.ctx)return null;
   let data=s.pixels.data,phase=s.phase,p=s.palette,amp=s.amp,flow=clamp(Math.hypot(s.vx,s.vy)*.85,0,1);
   const sources=[];
   if(amp>.003){
     sources.push([s.x-L,s.y-T,R*.72*(1+flow*.35),R*.62,1.0]);
     for(let i=0;i<s.trail.length;i++){let q=s.trail[i];sources.push([q.x-L+Math.sin(phase+i*.9)*R*.12,q.y-T+Math.cos(phase+i*.8)*R*.115,R*(.89-i*.065),R*(.67-i*.045),.68-i*.067]);}
   }
   const waves=s.waves.map(w=>{let t=w.t/1400,rad=12+w.max*(1-Math.pow(1-t,1.55)),fade=(1-smooth((t-.38)/.62))*smooth(t/.07)*w.strength;return [w.x-L,w.y-T,rad,clamp(R*.31+rad*.055,22,100),fade,w.seed]});
   // Coherent spatial warp: two low-frequency streams carry pigment around the trail.
   let ax=new Float32Array(nx),ay=new Float32Array(nx),bx=new Float32Array(ny),by=new Float32Array(ny);
   const f=1/Math.max(55,R*.65);
   for(let i=0;i<nx;i++){let x=(i+.5)*W/nx;ax[i]=Math.sin(x*f*1.55-phase*.9);ay[i]=Math.cos(x*f*.95+phase*.64);}
   for(let j=0;j<ny;j++){let y=(j+.5)*H/ny;bx[j]=Math.sin(y*f*1.6+phase*.85);by[j]=Math.cos(y*f*.9-phase*.75);}
   for(let j=0,k=0;j<ny;j++)for(let i=0;i<nx;i++,k+=4){
     let x=(i+.5)*W/nx,y=(j+.5)*H/ny,dx=x+R*(.24*bx[j]+.13*ay[i]*by[j]),dy=y+R*(.20*ax[i]+.12*bx[j]*ay[i]);
     let density=0,peak=0;
     for(let a of sources){let u=(dx-a[0])/a[2],v=(dy-a[1])/a[3],v2=1-(u*u+v*v);if(v2>0){let d=v2*v2*a[4];density+=d;peak=Math.max(peak,d);}}
     // A marbled ribbon bends across the flowing pigment instead of drawing a static round highlight.
     let blend=clamp(density*.8,0,1),fold=.5+.5*Math.sin((dx-dy*.77)*f*2.1+phase*1.35+bx[j]*1.8+ay[i]*.8),sheen=Math.pow(fold,4)*.74;
     let a=clamp(blend*amp*1.15,0,.96),m=clamp(.26+fold*.52+peak*.19,0,1);
     let red=p[1][0]*(1-m)+p[0][0]*m,green=p[1][1]*(1-m)+p[0][1]*m,blue=p[1][2]*(1-m)+p[0][2]*m;
     red=red*(1-sheen)+p[2][0]*sheen;green=green*(1-sheen)+p[2][1]*sheen;blue=blue*(1-sheen)+p[2][2]*sheen;
     // Each impulse has a wobbled leading crest and a softer trailing wake. Overlapping impulses composite.
     for(let w of waves){let u=dx-w[0],v=(dy-w[1])*1.08,dist=Math.sqrt(u*u+v*v),z=(dist-w[2])/w[3],crest=1-z*z;if(crest<=0)continue;
       let wa=crest*crest*w[4]*.92,wm=clamp(.52+z*.35+.14*fold,0,1),rr=p[1][0]*(1-wm)+p[2][0]*wm,gg=p[1][1]*(1-wm)+p[2][1]*wm,bb=p[1][2]*(1-wm)+p[2][2]*wm;
       let out=wa+a*(1-wa);if(out>.0001){red=(rr*wa+red*a*(1-wa))/out;green=(gg*wa+green*a*(1-wa))/out;blue=(bb*wa+blue*a*(1-wa))/out;a=out;}
     }
     data[k]=red;data[k+1]=green;data[k+2]=blue;data[k+3]=Math.round(a*255);
   }
   s.ctx.putImageData(s.pixels,0,0);
   return `url("${s.surface.toDataURL('image/png')}")`;
 }

 function paint(s){
   let texture=liquidTexture(s);if(texture){s.el.style.setProperty('--liquid-field',texture);if(!s.el.classList.contains('liquid-live'))s.el.classList.add('liquid-live');return;}
   const p=s.palette,r=s.radius,L=s.rect.left,T=s.rect.top,amp=s.amp,sp=clamp(Math.hypot(s.vx,s.vy)*.9,0,1),layers=[];
   // Each tap adds an expanding, asymmetric pair of transparent rings. They overlap rather than replacing hover.
   for(const w of [...s.waves].reverse()){
     let t=w.t/1400,fade=(1-smooth((t-.43)/.57))*smooth(t/.07)*w.strength,rad=16+w.max*(1-Math.pow(1-t,1.65)),width=clamp(r*.28+rad*.045,23,85),stretch=.82+.07*Math.sin(w.seed+t*5);
     if(fade>.004){layers.push(ring(w.x-L+Math.sin(w.seed+t*4)*rad*.035,w.y-T,rad,stretch,p[2],fade*.78,width));layers.push(ring(w.x-L,w.y-T+Math.cos(w.seed+t*4)*rad*.045,Math.max(8,rad-width*.85),1.05,p[1],fade*.55,width*1.15));}
   }
   if(amp>.003){
     const x=s.x-L,y=s.y-T,t=s.phase,stretch=1+sp*.42;
     // A light core and offset, breathing lobes create an uneven flowing ink edge, not a hard circular highlight.
     layers.push(blob(x+Math.sin(t*1.3)*r*.13,y+Math.cos(t*.9)*r*.09,r*.58*stretch,r*.39,p[2],amp*.92,.34));
     layers.push(blob(x-r*.18+Math.cos(t)*r*.18,y+r*.15,r*.98,r*.63*stretch,p[0],amp*.9,.46));
     layers.push(blob(x+r*.28,y-r*.17+Math.sin(t)*r*.14,r*.85,r*.73,p[1],amp*.85,.47));
     for(let i=0;i<s.trail.length;i++){const q=s.trail[i];let a=amp*(.54-i*.071),scale=1.05-i*.085;layers.push(blob(q.x-L+Math.cos(t+i*.8)*r*.095,q.y-T+Math.sin(t+i*.9)*r*.105,r*scale*(1+sp*.25),r*scale*.75,p[i%2===0?0:3],a,.46));}
   }
   if(!layers.length)layers.push('linear-gradient(transparent,transparent)');
   s.el.style.setProperty('--liquid-field',layers.join(','));
   if(!s.el.classList.contains('liquid-live'))s.el.classList.add('liquid-live');
 }
 function release(s){s.el.classList.remove('liquid-live');s.el.style.removeProperty('--liquid-field');ink.delete(s.el);if(hover===s)hover=null;}
 function releaseArt(s){s.el.style.removeProperty('--img-x');s.el.style.removeProperty('--img-y');s.el.style.removeProperty('--img-scale');art.delete(s.el);if(hoverArt===s)hoverArt=null;}
 function stop(){for(const s of [...ink.values()])release(s);for(const s of [...art.values()])releaseArt(s);touch.clear();hover=null;hoverArt=null;if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
 function wake(){if(!raf&&!reduced.matches&&(ink.size||art.size)){last=performance.now();raf=requestAnimationFrame(tick)}}
 function tick(now){raf=0;if(reduced.matches||document.hidden){stop();return;}let dt=clamp(now-last,1,40);last=now;
   // Geometry only changes on layout/scroll, not on each pointer frame.
   if(geometryDirty){for(const s of ink.values())if(inView(s.el))measure(s);geometryDirty=false;}
   for(const s of [...ink.values()]){if(!inView(s.el)){release(s);continue;}advance(s,dt);if(s.target===0&&s.amp<.0035&&!s.waves.length){release(s);continue;}paint(s);}
   for(const s of [...art.values()]){if(!inView(s.el)){releaseArt(s);continue;}s.amp=approach(s.amp,s.target,dt,s.target?130:230);s.x=approach(s.x,s.target?s.tx:0,dt,115);s.y=approach(s.y,s.target?s.ty:0,dt,115);if(!s.target&&s.amp<.003&&Math.hypot(s.x,s.y)<.04){releaseArt(s);continue;}s.el.style.setProperty('--img-x',`${rnd(s.x)}px`);s.el.style.setProperty('--img-y',`${rnd(s.y)}px`);s.el.style.setProperty('--img-scale',(1.035+.055*s.amp).toFixed(4));}
   if(ink.size||art.size)raf=requestAnimationFrame(tick);else last=0;
 }
 document.addEventListener('pointermove',e=>{if(reduced.matches)return;
   if(e.pointerType==='touch'){const s=touch.get(e.pointerId);if(s){setPoint(s,e.clientX,e.clientY);wake();}return;}
   const el=e.target.closest('[data-ink]');enter(el,e.clientX,e.clientY);artPoint(e.target.closest('.hero-art,.chapter-art'),e.clientX,e.clientY);
 },{passive:true});
 document.addEventListener('pointerdown',e=>{if(reduced.matches||e.button!==0)return;const el=e.target.closest('[data-ink]');if(!el)return;let s=pulse(el,e.clientX,e.clientY,e.pointerType==='touch'?.91:1);if(e.pointerType==='touch'){setPoint(s,e.clientX,e.clientY);s.target=.8;touch.set(e.pointerId,s);}else enter(el,e.clientX,e.clientY);},{passive:true});
 const endTouch=e=>{const s=touch.get(e.pointerId);if(s){touch.delete(e.pointerId);if(hover!==s)s.target=0;wake();}};
 window.addEventListener('pointerup',endTouch,{passive:true});window.addEventListener('pointercancel',endTouch,{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)leave()},{passive:true});document.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
 // Scrolling fades the active ink instead of resetting it; document coordinates keep trails attached to letters.
 window.addEventListener('scroll',()=>{leave();for(const s of touch.values())s.target=0;touch.clear();geometryDirty=true;wake();},{passive:true});
 window.addEventListener('resize',()=>{geometryDirty=true;wake();},{passive:true});
 document.fonts?.ready.then(()=>{geometryDirty=true;wake()});
 document.addEventListener('click',e=>{if(e.target.closest('[data-page]'))leave()});window.addEventListener('hashchange',leave);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});reduced.addEventListener?.('change',()=>{if(reduced.matches)stop()});
})();

