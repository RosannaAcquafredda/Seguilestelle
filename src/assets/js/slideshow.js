(function () {
  'use strict';
  var box = document.querySelector('[data-tlr-slideshow]');
  var cfg = (window.TLR_CONFIG || {}).slideshow;
  if (!box || !cfg || !cfg.slides || !cfg.slides.length) { return; }

  var pista = box.querySelector('.tlr-slide-pista'), dots = box.querySelector('.tlr-slide-dots');
  var btnPausa = box.querySelector('[data-tlr-pausa]');
  var riduci = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = cfg.slides.length, i = 0, timer = null, inPausa = riduci;

  cfg.slides.forEach(function (item, k) {
    var f = document.createElement('figure');
    f.className = 'tlr-slide-f';
    f.setAttribute('role', 'group');
    f.setAttribute('aria-roledescription', 'slide');
    f.setAttribute('aria-label', (k + 1) + ' di ' + n);

    if (item.type === 'video') {
      var vid = document.createElement('video');
      vid.src = item.src;
      if (item.poster) { vid.poster = item.poster; }
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      vid.setAttribute('aria-label', '');
      vid.setAttribute('aria-hidden', 'true');
      
      // Avanza al termine del video
      vid.addEventListener('ended', function () {
        if (!inPausa && i === k) {
          vai(i + 1);
          parti();
        }
      });
      f.appendChild(vid);
    } else {
      var img = new Image();
      img.src = item.src;
      img.alt = item.alt || '';
      img.decoding = 'async';
      if (k) { img.loading = 'lazy'; }
      f.appendChild(img);
    }

    pista.appendChild(f);

    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'tlr-slide-dot';
    d.setAttribute('aria-label', 'Vai alla slide ' + (k + 1));
    d.addEventListener('click', function () { vai(k); riavvia(); });
    dots.appendChild(d);
  });

  function vai(k) {
    i = (k + n) % n;
    Array.prototype.forEach.call(pista.children, function (f, j) {
      var attiva = j === i;
      f.classList.toggle('is-attiva', attiva);
      f.setAttribute('aria-hidden', attiva ? 'false' : 'true');

      var vid = f.querySelector('video');
      if (vid) {
        if (attiva && !inPausa) {
          vid.currentTime = 0;
          vid.play().catch(function () {});
        } else {
          vid.pause();
        }
      }
    });

    Array.prototype.forEach.call(dots.children, function (d, j) {
      d.classList.toggle('is-attiva', j === i);
      if (j === i) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
    });
  }

  function ferma() {
    clearTimeout(timer);
    timer = null;
    var vid = pista.children[i] && pista.children[i].querySelector('video');
    if (vid) { vid.pause(); }
  }

  function parti() {
    clearTimeout(timer);
    timer = null;
    if (inPausa || n <= 1) { return; }

    var slideCorrente = cfg.slides[i];
    if (slideCorrente.type === 'video') {
      var vid = pista.children[i] && pista.children[i].querySelector('video');
      if (vid) { vid.play().catch(function () {}); }
      // Nessun timer: ci pensa l'evento 'ended' del video
    } else {
      timer = setTimeout(function () {
        vai(i + 1);
        parti();
      }, cfg.intervallo || 6000);
    }
  }

  function riavvia() { if (!inPausa) { parti(); } }

  function stato() {
    btnPausa.setAttribute('aria-label', inPausa ? 'Avvia lo scorrimento automatico' : 'Metti in pausa lo scorrimento');
    btnPausa.classList.toggle('is-pausa', inPausa);
  }

  box.querySelector('.is-prev').addEventListener('click', function () { vai(i - 1); riavvia(); });
  box.querySelector('.is-next').addEventListener('click', function () { vai(i + 1); riavvia(); });
  btnPausa.addEventListener('click', function () {
    inPausa = !inPausa;
    stato();
    if (inPausa) { ferma(); } else { parti(); }
  });
  box.addEventListener('mouseenter', ferma);
  box.addEventListener('mouseleave', riavvia);
  box.addEventListener('focusin', ferma);
  box.addEventListener('focusout', riavvia);
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { vai(i - 1); riavvia(); } else if (e.key === 'ArrowRight') { vai(i + 1); riavvia(); }
  });

  box.classList.add('is-pronta');
  stato();
  vai(0);
  parti();
})();