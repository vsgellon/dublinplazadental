// Homepage hero rotation (approved in prototype v5, carried into full site v1).
// Serves responsive WebP (828, 1440, 2880 wide). Sources live in _src/images.
// Cycles Consult → In the Chair → The Scan → Under the Light via localStorage.
// If storage is missing or unreadable, picks one at random, then continues the cycle.
// Only the chosen image is preloaded. There is no cross-fade (reduced motion is fine).
(function (global) {
  'use strict';
  var KEY = 'desaidpd-v5-hero-index';
  var HEROES = [
    {
      id: 'consult',
      base: 'images/hero-consult',
      alt: 'A patient in a dental chair talking with a clinician in a treatment room with wood hexagon tile'
    },
    {
      id: 'chair',
      base: 'images/hero-in-the-chair',
      alt: 'A patient seen from behind, reclined in a dental chair in a bright treatment room'
    },
    {
      id: 'scan',
      base: 'images/hero-the-scan',
      alt: 'A clinician showing a dental scan on a monitor to a patient seated in the chair, seen from behind'
    },
    {
      id: 'light',
      base: 'images/hero-under-the-light',
      alt: 'A male dentist in profile treating a young patient under the operatory light'
    }
  ];

  var SIZES = '(max-width: 640px) 160vh, 100vw';
  function srcset(h) {
    return h.base + '-828.webp 828w, ' + h.base + '-1440.webp 1440w, ' + h.base + '-2880.webp 2880w';
  }

  function pick() {
    try {
      var params = new URLSearchParams(global.location.search);
      var q = params.get('hero');
      if (q) {
        for (var n = 0; n < HEROES.length; n++) {
          if (HEROES[n].id === q) return HEROES[n];
        }
      }
    } catch (ignore) {}
    var i, next;
    try {
      i = parseInt(global.localStorage.getItem(KEY), 10);
      if (isNaN(i) || i < 0 || i >= HEROES.length) {
        next = Math.floor(Math.random() * HEROES.length);
      } else {
        next = (i + 1) % HEROES.length;
      }
      global.localStorage.setItem(KEY, String(next));
    } catch (err) {
      next = Math.floor(Math.random() * HEROES.length);
    }
    return HEROES[next];
  }

  var hero = pick();
  global.__DPD_HERO = hero;

  if (document.head) {
    var link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = hero.base + '-1440.webp';
    link.setAttribute('imagesrcset', srcset(hero));
    link.setAttribute('imagesizes', SIZES);
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }
  document.documentElement.setAttribute('data-hero', hero.id);

  global.dpdWriteHero = function () {
    var h = global.__DPD_HERO || HEROES[0];
    var alt = String(h.alt).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    document.write(
      '<img id="hero-photo" src="' + h.base + '-1440.webp" srcset="' + srcset(h) +
      '" sizes="' + SIZES + '" alt="' + alt + '" width="2880" height="1632" fetchpriority="high">'
    );
    var section = document.getElementById('hero') || document.querySelector('.hero');
    if (section) section.setAttribute('data-hero', h.id);
  };
})(window);
