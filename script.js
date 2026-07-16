
(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  setHeader();
  window.addEventListener('scroll', setHeader, {passive:true});
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded','false');
    }));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = [...slider.querySelectorAll('[data-slide]')];
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    const pause = slider.querySelector('[data-pause]');
    const dots = slider.querySelector('[data-dots]');
    if(slides.length < 2) return;
    let index = 0;
    let timer = null;
    let paused = reduceMotion;

    const show = (newIndex, userInitiated=false) => {
      slides[index].classList.remove('is-active');
      slides[index].setAttribute('aria-hidden','true');
      dots.children[index]?.classList.remove('is-active');
      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      slides[index].setAttribute('aria-hidden','false');
      dots.children[index]?.classList.add('is-active');
      if(userInitiated) restart();
    };
    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type='button';
      dot.setAttribute('aria-label',`Show slide ${i+1} of ${slides.length}`);
      if(i===0) dot.classList.add('is-active');
      dot.addEventListener('click',()=>show(i,true));
      dots.appendChild(dot);
    });
    const stop = () => { if(timer){ clearInterval(timer); timer=null; } };
    const start = () => {
      stop();
      if(!paused) timer=setInterval(()=>show(index+1),6500);
    };
    const restart = () => { stop(); start(); };
    prev?.addEventListener('click',()=>show(index-1,true));
    next?.addEventListener('click',()=>show(index+1,true));
    pause?.addEventListener('click',()=>{
      paused=!paused;
      pause.textContent=paused?'Play':'Pause';
      pause.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');
      paused?stop():start();
    });
    slider.addEventListener('mouseenter',stop);
    slider.addEventListener('mouseleave',start);
    slider.addEventListener('focusin',stop);
    slider.addEventListener('focusout',start);
    start();
  });
})();
