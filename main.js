// Dublin Plaza Dental, full site draft v1. Nothing here sends data anywhere.
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header hairline after scrolling
  var hdr=d.querySelector('.hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('scrolled', window.scrollY>8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu: accessible disclosure with Escape, outside click, and focus return
  var btn=d.querySelector('.menu-btn'), nav=d.getElementById('site-nav');
  if(btn && nav){
    var mq=window.matchMedia('(max-width:1024px)');
    function setOpen(open, focusBack){
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.menu-lbl').textContent=open?'Close':'Menu';
      nav.classList.toggle('open', open);
      d.body.classList.toggle('menu-open', open);
      if(open){ var first=nav.querySelector('a'); if(first) first.focus(); }
      else if(focusBack){ btn.focus(); }
    }
    btn.addEventListener('click', function(){ setOpen(btn.getAttribute('aria-expanded')!=='true'); });
    d.addEventListener('keydown', function(e){
      if(btn.getAttribute('aria-expanded')!=='true') return;
      if(e.key==='Escape'){ setOpen(false, true); return; }
      if(e.key==='Tab'){ // keep focus inside the open menu
        var items=[btn].concat([].slice.call(nav.querySelectorAll('a')));
        var i=items.indexOf(d.activeElement);
        if(e.shiftKey && i<=0){ e.preventDefault(); items[items.length-1].focus(); }
        else if(!e.shiftKey && i===items.length-1){ e.preventDefault(); items[0].focus(); }
      }
    });
    nav.addEventListener('click', function(e){ if(e.target.closest('a')) setOpen(false); });
    (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){ if(!mq.matches) setOpen(false); });
  }

  // Fade ins
  var items=[].slice.call(d.querySelectorAll('.rv'));
  if(reduce || !('IntersectionObserver' in window)){ items.forEach(function(e){e.classList.add('in');}); }
  else{
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(e){ io.observe(e); });
  }

  // Map facade: Google Maps loads only after the visitor asks for it
  var mapBtn=d.querySelector('[data-load-map]');
  if(mapBtn){
    mapBtn.addEventListener('click', function(){
      var box=mapBtn.closest('.mapbox');
      var f=d.createElement('iframe');
      f.src=mapBtn.getAttribute('data-load-map');
      f.title='Map showing Dublin Plaza Dental at 7792 Dublin Boulevard, Dublin, CA';
      f.setAttribute('loading','lazy');
      f.setAttribute('referrerpolicy','no-referrer-when-downgrade');
      box.appendChild(f);
      box.querySelector('.facade').remove();
      f.focus();
    });
  }

  // Sample call back form: never submits
  var f=d.querySelector('form[data-sample]');
  if(f){ f.addEventListener('submit', function(e){ e.preventDefault(); var s=f.querySelector('.status'); s.textContent='Preview only. Nothing was sent. On the live site, the office would call you back to confirm a time.'; }); }
})();
