/* ══════════════════════════════════════════════════════════════
   MAULI GO-VARDHAN GOSHALA — SITE SCRIPT
   Handles: navbar, mobile menu, hero video mute toggle,
   product modal, booking modal, gallery lightbox,
   product filters (all-products page), scroll reveal
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var WA_NUMBER = '919870832979';

  /* ── helpers ─────────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }

  /* ── NAVBAR: shrink + tint on scroll ────────────────────────── */
  var navbar = $('#navbar');
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── MOBILE MENU ─────────────────────────────────────────────── */
  var hamburger = $('#hamburger');
  var navLinks = $('#navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    $all('a', navLinks).forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ── HERO VIDEO MUTE TOGGLE ──────────────────────────────────── */
  var heroVideo = $('#heroVideo');
  var muteBtn = $('#muteToggleBtn');
  var iconMuted = $('#iconMuted');
  var iconUnmuted = $('#iconUnmuted');
  var videoMuted = true;

  function postToPlayer(func) {
    if (!heroVideo || !heroVideo.contentWindow) return;
    heroVideo.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: func, args: [] }),
      '*'
    );
  }

  if (muteBtn && heroVideo) {
    muteBtn.addEventListener('click', function () {
      videoMuted = !videoMuted;
      postToPlayer(videoMuted ? 'mute' : 'unMute');
      if (iconMuted && iconUnmuted) {
        iconMuted.style.display = videoMuted ? 'block' : 'none';
        iconUnmuted.style.display = videoMuted ? 'none' : 'block';
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     PRODUCT MODAL  →  openModal(name, tag, price, desc, emoji)
     ══════════════════════════════════════════════════════════════ */
  var modalBackdrop = $('#modalBackdrop');
  var modalBody = $('#modalBody');
  var modalClose = $('#modalClose');

  window.openModal = function (name, tag, price, desc, emoji) {
    if (!modalBackdrop || !modalBody) return;

    var iconHtml = (emoji && emoji.indexOf('http') === 0)
      ? '<img src="' + emoji + '" alt="' + name + '">'
      : (emoji || '');

    var message = 'Namaste Pradip ji \uD83D\uDE4F\n\n' +
      'I am interested in ordering:\n*' + name + '*\n' +
      'Price: ' + price + '\n\n' +
      'Please confirm availability and delivery details. Thank you!';

    modalBody.innerHTML =
      '<div class="pm-icon">' + iconHtml + '</div>' +
      '<span class="pm-tag">' + tag + '</span>' +
      '<h3 class="pm-name">' + name + '</h3>' +
      '<span class="pm-price">' + price + '</span>' +
      '<p class="pm-desc">' + desc + '</p>' +
      '<div class="pm-actions">' +
      '<a class="btn btn-wa" href="' + waLink(message) + '" target="_blank" rel="noopener">\uD83D\uDFE2 Order on WhatsApp</a>' +
      '</div>';

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeProductModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeProductModal();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     BOOKING MODAL  →  openBookingModal(title, emoji, desc, price)
     ══════════════════════════════════════════════════════════════ */
  var bookingBackdrop = $('#bookingBackdrop');
  var bookingModalBody = $('#bookingModalBody');
  var bookingModalClose = $('#bookingModalClose');

  window.openBookingModal = function (title, emoji, desc, price) {
    if (!bookingBackdrop || !bookingModalBody) return;

    var message = 'Namaste Pradip ji \uD83D\uDE4F\n\n' +
      'I would like to book: *' + title + '*\n' +
      'Price: ' + price + '\n\n' +
      'Please guide me on available dates and timing. Thank you!';

    bookingModalBody.innerHTML =
      '<div class="booking-modal-icon">' + emoji + '</div>' +
      '<h3 class="booking-modal-title">' + title + '</h3>' +
      '<span class="booking-modal-price">' + price + '</span>' +
      '<p class="booking-modal-desc">' + desc + '</p>' +
      '<div class="booking-modal-actions">' +
      '<a class="btn btn-primary" href="' + waLink(message) + '" target="_blank" rel="noopener">\uD83D\uDE4F Book via WhatsApp</a>' +
      '</div>';

    bookingBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeBookingModal() {
    if (!bookingBackdrop) return;
    bookingBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (bookingModalClose) bookingModalClose.addEventListener('click', closeBookingModal);
  if (bookingBackdrop) {
    bookingBackdrop.addEventListener('click', function (e) {
      if (e.target === bookingBackdrop) closeBookingModal();
    });
  }

  /* ── ESC key closes any open modal / lightbox ───────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeProductModal();
    closeBookingModal();
    closeLightbox();
  });

  /* ══════════════════════════════════════════════════════════════
     GALLERY LIGHTBOX
     ══════════════════════════════════════════════════════════════ */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var lbClose = $('#lbClose');
  var lbPrev = $('#lbPrev');
  var lbNext = $('#lbNext');
  var galleryGrid = $('#galleryGrid');
  var galleryItems = [];
  var currentLbIndex = 0;

  if (galleryGrid) {
    galleryItems = $all('.g-item', galleryGrid).map(function (item) {
      var img = $('img', item);
      var captionEl = $('.g-overlay span', item);
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        caption: captionEl ? captionEl.textContent : ''
      };
    });

    $all('.g-item', galleryGrid).forEach(function (item, idx) {
      item.addEventListener('click', function () { openLightbox(idx); });
    });
  }

  function openLightbox(idx) {
    if (!lightbox || !galleryItems.length) return;
    currentLbIndex = (idx + galleryItems.length) % galleryItems.length;
    renderLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function renderLightbox() {
    var item = galleryItems[currentLbIndex];
    if (!item || !lbImg) return;
    lbImg.setAttribute('src', item.src);
    lbImg.setAttribute('alt', item.alt);
    if (lbCaption) lbCaption.textContent = item.caption;
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(currentLbIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { openLightbox(currentLbIndex + 1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     PRODUCT FILTERS  (all-products page only)
     ══════════════════════════════════════════════════════════════ */
  var filterBtns = $all('.filter-btn');
  var allProductsGrid = $('#allProductsGrid');

  if (filterBtns.length && allProductsGrid) {
    var cards = $all('.product-card', allProductsGrid);
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tag = btn.getAttribute('data-tag');
        cards.forEach(function (card) {
          var match = tag === 'all' || card.getAttribute('data-tag') === tag;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SCROLL REVEAL
     ══════════════════════════════════════════════════════════════ */
  var revealGroups = [
    '.about-visual', '.about-text',
    '.product-card',
    '.g-item',
    '.booking-card',
    '.testi-card',
    '.locate-info', '.locate-map',
    '.section-header'
  ];

  var revealEls = [];
  revealGroups.forEach(function (sel) {
    $all(sel).forEach(function (el) { revealEls.push(el); });
  });

  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('reveal', 'in-view'); });
  }

})();
