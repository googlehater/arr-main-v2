import { projects, scenes } from './content/projects.js';

const grid=document.querySelector('#project-grid');
let currentFilter='all';
function renderProjects(filter='all'){
 currentFilter=filter;const visible=projects.filter(p=>filter==='all'||p.category===filter);
 grid.classList.toggle('filtered',filter!=='all');
 grid.innerHTML=visible.map(p=>`<article class="project-card"><a href="#project/${p.id}"><div class="cover"><img src="assets/${p.cover}" alt="${p.alt}" width="1200" height="800" loading="lazy"><span class="view">Посмотреть проект</span></div><div class="card-copy"><div class="card-meta"><span>${p.label}</span><span>${p.year}</span></div><h3>${p.title}</h3><p>${p.short}</p></div></a></article>`).join('');
 document.querySelector('#filter-status').textContent=`Показано проектов: ${visible.length}`;
}
renderProjects();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button)});renderProjects(button.dataset.filter);
}));

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let sceneRequest=0;
document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',async()=>{
 const request=++sceneRequest,scene=scenes[Number(button.dataset.scene)];
 const image=document.querySelector('#hero-image'),figure=document.querySelector('.hero-photo');
 const preview=new Image();preview.src=`assets/${scene.img}`;figure.setAttribute('aria-busy','true');
 try{await preview.decode()}catch{if(request===sceneRequest)figure.setAttribute('aria-busy','false');return}
 if(request!==sceneRequest)return;
 image.getAnimations().forEach(animation=>animation.cancel());
 image.src=preview.src;image.alt=scene.alt;
 if(!reducedMotion.matches)image.animate([{opacity:.35},{opacity:1}],{duration:420,easing:'ease-out'});
 document.querySelector('#hero-caption').textContent=scene.caption;document.querySelector('#hero-year').textContent=scene.year;
 document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button)});
 figure.setAttribute('aria-busy','false');
}));
const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-menu');
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',!menu.hidden);menuButton.textContent=menu.hidden?'Меню':'Закрыть'});
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.textContent='Меню'}
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches)closeMenu()});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header')&&!menu.hidden)closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus()}});
const lightbox=document.querySelector('#lightbox');
document.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
function route(){
 closeMenu();
 const id=location.hash.startsWith('#project/')?location.hash.slice(9):null;
 const project=projects.find(p=>p.id===id);const page=document.querySelector('#case');
 document.querySelector('#home').hidden=!!id;page.hidden=!id;
 if(id&&!project){page.innerHTML='<a class="back" href="#projects">Все проекты</a><h1 id="case-title">Проект не найден</h1>';window.scrollTo(0,0);return}
 if(project){
  document.title=`${project.title} — АРР Медиа`;
  page.innerHTML=`<a class="back" href="#projects">Все проекты</a><h1 id="case-title" tabindex="-1">${project.title}</h1><p class="case-meta">${project.label} / ${project.year}</p><p class="lead">${project.description}</p><img class="case-cover" src="assets/${project.cover}" alt="${project.alt}"><div class="gallery">${project.gallery.map(([src,alt])=>`<button class="gallery-photo" aria-label="Увеличить: ${alt}"><img src="assets/${src}" alt="${alt}" loading="lazy"></button>`).join('')}</div><div class="case-cta"><p>Обсудим ваше событие?</p><a class="button blue" href="https://vk.com/arrmedia" target="_blank" rel="noopener noreferrer">Написать в VK</a></div>`;
  page.querySelectorAll('.gallery-photo').forEach(button=>button.addEventListener('click',()=>{const img=button.querySelector('img');lightbox.querySelector('img').src=img.src;lightbox.querySelector('img').alt=img.alt;lightbox.showModal()}));
  window.scrollTo({top:0,behavior:'instant'});document.querySelector('#case-title').focus({preventScroll:true});
 }else{document.title='АРР Медиа — события, которые объединяют';const target=document.getElementById(location.hash.slice(1));if(target)requestAnimationFrame(()=>target.scrollIntoView());else window.scrollTo(0,0)}
}
window.addEventListener('hashchange',route);route();

// Keep native scrolling; one scheduled update covers the header and section indication.
const stickyHeader=document.querySelector('.site-header');
const sectionLinks=[...document.querySelectorAll('.header nav a, #mobile-menu a')];
const trackedSections=['projects','agency','contact'].map(id=>document.getElementById(id));
let scrollFrame=0;
function updateNavigation(){
 scrollFrame=0;
 const isCase=location.hash.startsWith('#project/');
 let active=isCase?'projects':null;
 if(!isCase)for(const section of trackedSections){if(section.getBoundingClientRect().top<=innerHeight*.34)active=section.id}
 stickyHeader.classList.toggle('scrolled',scrollY>12);
 sectionLinks.forEach(link=>{if(link.hash===`#${active}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
}
function scheduleNavigation(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateNavigation)}
window.addEventListener('scroll',scheduleNavigation,{passive:true});
window.addEventListener('resize',scheduleNavigation,{passive:true});
window.addEventListener('hashchange',scheduleNavigation);
updateNavigation();

