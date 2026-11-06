const menu=document.querySelector('.menu');
const nav=document.querySelector('nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}});
for(const explorer of document.querySelectorAll('.content-explorer')){
 const buttons=[...explorer.querySelectorAll('[data-filter]')];
 const cards=[...explorer.querySelectorAll('[data-topic]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  for(const item of buttons)item.setAttribute('aria-pressed',String(item===button));
  let count=0;
  for(const card of cards){const show=button.dataset.filter==='all'||card.dataset.topic.split(' ').includes(button.dataset.filter);card.hidden=!show;if(show)count++}
  explorer.querySelector('.filter-status').textContent=`${count} ${count===1?'item':'items'} shown for ${button.textContent}.`;
 });
}
const article=document.querySelector('.article-layout article');
if(article){
 document.body.classList.add('has-article');
 const progress=document.querySelector('.reading-progress');
 const update=()=>{const box=article.getBoundingClientRect();const total=Math.max(1,article.offsetHeight-window.innerHeight);const ratio=Math.max(0,Math.min(1,-box.top/total));progress.style.transform=`scaleX(${ratio})`};
 window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const link of document.querySelectorAll('.article-layout aside a')){const current=link.getAttribute('href')==='#'+entry.target.id;if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}},{rootMargin:'-15% 0px -65% 0px'});
 for(const section of article.querySelectorAll('section[id]'))observer.observe(section);
}
