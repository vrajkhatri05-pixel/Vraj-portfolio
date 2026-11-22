const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const root=document.documentElement,tg=$('#tg');
let ink='#0d2236';

/* Theme toggle (light is the default, choice is remembered) */
function setT(t){
  root.dataset.theme=t;
  tg.textContent=t==='dark'?'☀':'☾';
  tg.setAttribute('aria-label','Switch to '+(t==='dark'?'light':'dark')+' mode');
  ink=getComputedStyle(root).getPropertyValue('--ink').trim();
  try{localStorage.setItem('t',t)}catch(e){}
}
setT(root.dataset.theme);
tg.onclick=()=>{tg.classList.add('spin');setTimeout(()=>tg.classList.remove('spin'),500);setT(root.dataset.theme==='dark'?'light':'dark')};

/* Name letters */
$$('[data-split]').forEach(el=>{
  let i=0;const txt=el.textContent.trim();
  el.setAttribute('aria-label',txt);
  el.innerHTML=txt.split(' ').map(w=>`<span class="w" aria-hidden="true">${[...w].map(c=>`<span class="l" style="--i:${i++}">${c}</span>`).join('')}</span>`).join(' ');
});

/* Typing roles */
const roles=["Computer Engineering at Waterloo","Looking for a Summer 2027 co-op","AI and machine learning explorer","Mental math competitor","Rubik's cube solver"];
const ty=$('#type');let ri=0,ci=0,del=false;
(function tick(){
  if(rm){ty.textContent=roles[0];return}
  const r=roles[ri];ci+=del?-1:1;ty.textContent=r.slice(0,ci);
  let d=del?30:65;
  if(!del&&ci===r.length){del=true;d=1500}
  else if(del&&ci===0){del=false;ri=(ri+1)%roles.length;d=350}
  setTimeout(tick,d);
})();

/* Marquees */
$$('.mq div').forEach(d=>d.innerHTML+=d.innerHTML);

/* Scroll reveal + counters */
function count(el){
  const n=+el.dataset.n,s=el.dataset.s||'';
  if(rm){el.textContent=n+s;return}
  const t0=performance.now();
  (function step(t){
    const p=Math.min((t-t0)/1600,1),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(n*e)+s;
    if(p<1)requestAnimationFrame(step);
  })(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');io.unobserve(e.target);
  $$('[data-n]',e.target).forEach(count);
}),{threshold:.15});
$$('.rv').forEach(el=>{
  el.style.setProperty('--i',[...el.parentElement.children].filter(c=>c.classList.contains('rv')).indexOf(el));
  io.observe(el);
});

/* Scroll progress */
const pb=$('.pb');
addEventListener('scroll',()=>{pb.style.transform=`scaleX(${scrollY/Math.max(1,document.body.scrollHeight-innerHeight)})`},{passive:true});

/* Cursor ring */
if(matchMedia('(pointer:fine)').matches&&!rm){
  const c=$('.cur');let x=0,y=0,tx=0,ty2=0;
  addEventListener('mousemove',e=>{tx=e.clientX;ty2=e.clientY;c.style.opacity=1});
  (function f(){x+=(tx-x)*.18;y+=(ty2-y)*.18;c.style.transform=`translate(${x}px,${y}px)`;requestAnimationFrame(f)})();
  $$('a,button,.card,.aw').forEach(el=>{
    el.addEventListener('mouseenter',()=>c.classList.add('big'));
    el.addEventListener('mouseleave',()=>c.classList.remove('big'));
  });
}

/* 3D tilt on cards */
$$('.tilt').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    el.style.setProperty('--ry',x*12+'deg');el.style.setProperty('--rx',-y*12+'deg');
  });
  el.addEventListener('mouseleave',()=>{el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')});
});

/* Mouse parallax for hero shapes */
if(!rm){
  const sh=$$('.shape');
  addEventListener('mousemove',e=>{
    const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    sh.forEach(s=>{const d=+s.dataset.d;s.style.translate=`${x*d}px ${y*d}px`});
  });
}

/* Floating circuit network in the background */
const cv=$('#net'),cx=cv.getContext('2d'),m={x:-999,y:-999};
let W,H,P=[];
function rs(){
  W=cv.width=innerWidth;H=cv.height=innerHeight;
  P=Array.from({length:Math.min(70,W/18|0)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6}));
}
rs();addEventListener('resize',rs);
addEventListener('mousemove',e=>{m.x=e.clientX;m.y=e.clientY});
function draw(){
  cx.clearRect(0,0,W,H);
  P.forEach((p,i)=>{
    if(!rm){p.x+=p.vx;p.y+=p.vy}
    if(p.x<0||p.x>W)p.vx*=-1;
    if(p.y<0||p.y>H)p.vy*=-1;
    cx.globalAlpha=.85;cx.fillStyle=i%2?'#ff5a6e':'#19b98c';
    cx.beginPath();cx.arc(p.x,p.y,2.6,0,6.3);cx.fill();
    cx.strokeStyle=ink;
    for(let j=i+1;j<P.length;j++){
      const q=P[j],l=Math.hypot(p.x-q.x,p.y-q.y);
      if(l<130){cx.globalAlpha=(1-l/130)*.25;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}
    }
    const d=Math.hypot(p.x-m.x,p.y-m.y);
    if(d<170){cx.globalAlpha=(1-d/170)*.6;cx.strokeStyle='#2f8fff';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(m.x,m.y);cx.stroke()}
  });
  if(!rm)requestAnimationFrame(draw);
}
draw();
