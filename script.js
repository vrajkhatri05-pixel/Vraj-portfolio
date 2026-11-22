const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const root=document.documentElement,tg=$('#tg');
let tc='#7cc9ac',sc='#00a7c4',bgc='#f1f9f5';

/* Theme switch (light is the default, choice is remembered) */
function setT(t){
  root.dataset.theme=t;
  tg.setAttribute('aria-checked',t==='dark');
  const cs=getComputedStyle(root);
  tc=cs.getPropertyValue('--tr').trim();sc=cs.getPropertyValue('--sig').trim();bgc=cs.getPropertyValue('--bg').trim();
  try{localStorage.setItem('t2',t)}catch(e){}
}
setT(root.dataset.theme);
tg.onclick=()=>setT(root.dataset.theme==='dark'?'light':'dark');

/* Name letters boot up one by one */
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

/* Counters */
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

/* Power on: chips light up, then their contents appear */
$$('.rv').forEach(el=>el.style.setProperty('--i',[...el.parentElement.children].filter(c=>c.classList.contains('rv')).indexOf(el)));
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const c=e.target;c.classList.add('on');io.unobserve(c);
  $$('.rv',c).forEach(r=>r.classList.add('in'));
  $$('[data-n]',c).forEach(count);
}),{threshold:.12});
$$('.chip').forEach(c=>io.observe(c));

/* Scroll progress */
const pb=$('.pb');
addEventListener('scroll',()=>{pb.style.transform=`scaleX(${scrollY/Math.max(1,document.body.scrollHeight-innerHeight)})`},{passive:true});

/* 3D tilt on cards */
$$('.tilt').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    el.style.setProperty('--ry',x*10+'deg');el.style.setProperty('--rx',-y*10+'deg');
  });
  el.addEventListener('mouseleave',()=>{el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')});
});

/* Circuit traces with signals running along them */
const cv=$('#bg'),cx=cv.getContext('2d'),R=n=>Math.floor(Math.random()*n);
let W,H,T=[];
function build(){
  W=cv.width=innerWidth;H=cv.height=innerHeight;const g=44;T=[];
  const n=Math.min(26,Math.round(W*H/60000)+6);
  for(let i=0;i<n;i++){
    let x=R(W/g)*g,y=R(H/g)*g,dir=R(2);const p=[[x,y]];
    for(let k=0;k<4+R(3);k++){
      const l=(2+R(6))*g*(R(2)?1:-1);
      if(dir)y+=l;else x+=l;
      x=Math.max(0,Math.min(W,x));y=Math.max(0,Math.min(H,y));p.push([x,y]);
      if(!R(3)){const s=R(2)?g:-g;x+=g;y+=s;p.push([x,y])}
      dir^=1;
    }
    let L=0;const c=[0];
    for(let k=1;k<p.length;k++){L+=Math.hypot(p[k][0]-p[k-1][0],p[k][1]-p[k-1][1]);c.push(L)}
    T.push({p,c,L:L||1,s:Math.random()*L,v:.8+Math.random()*1.6});
  }
}
function at(t,s){
  let k=1;while(k<t.c.length-1&&t.c[k]<s)k++;
  const a=t.p[k-1],b=t.p[k],u=(s-t.c[k-1])/((t.c[k]-t.c[k-1])||1);
  return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
}
function draw(){
  cx.clearRect(0,0,W,H);cx.lineWidth=3;cx.lineJoin='round';
  T.forEach(t=>{
    cx.strokeStyle=tc;cx.globalAlpha=.55;cx.beginPath();
    t.p.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.stroke();
    [t.p[0],t.p[t.p.length-1]].forEach(q=>{
      cx.globalAlpha=.9;cx.fillStyle=tc;cx.beginPath();cx.arc(q[0],q[1],7,0,6.3);cx.fill();
      cx.fillStyle=bgc;cx.beginPath();cx.arc(q[0],q[1],3,0,6.3);cx.fill();
    });
    if(!rm)t.s=(t.s+t.v)%t.L;
    for(let k=0;k<8;k++){
      const d=t.s-k*7;if(d<0)continue;
      const q=at(t,d);cx.globalAlpha=(1-k/8)*.9;cx.fillStyle=sc;
      cx.beginPath();cx.arc(q[0],q[1],5-k*.4,0,6.3);cx.fill();
    }
  });
  if(!rm)requestAnimationFrame(draw);
}
build();draw();
addEventListener('resize',()=>{build();if(rm)draw()});
