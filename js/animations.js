/* ==========================================================================
   Animations (GSAP + ScrollTrigger)
   ========================================================================== */
(function () {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero entrance ---------- */
  function heroEntrance() {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to('.hero-title .word', {
      y: 0, opacity: 1, stagger: 0.045, duration: 1, ease: 'power4.out',
      from: { y: '110%', opacity: 0 },
    }, 0);
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2);
    tl.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.5);
    tl.to('.hero-cta', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.65);
    tl.to('.hero-stats', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.8);
  }
  // set initial state for words
  gsap.set('.hero-title .word', { y: '110%', opacity: 0 });

  /* ---------- Generic scroll reveal ---------- */
  function initReveals() {
    const gridSelectors = '.services-grid, .why-grid, .team-grid, .pricing-grid, .work-grid';
    document.querySelectorAll('.reveal-up').forEach((el) => {
      if (el.closest('.hero')) return; // hero handled separately
      let delay = parseFloat(el.dataset.delay || 0);
      const grid = el.closest(gridSelectors);
      if (grid) {
        const idx = Array.prototype.indexOf.call(grid.children, el);
        delay += Math.min(idx, 4) * 0.08;
      }
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, delay, ease: 'power3.out',
        scrollTrigger: { trigger: grid || el, start: 'top 88%' },
      });
    });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val); },
          });
        },
      });
    });
  }

  /* ---------- Process progress line ---------- */
  function initProcessProgress() {
    const bar = document.getElementById('processProgress');
    const line = document.querySelector('.process-line');
    if (!bar || !line) return;
    gsap.to(bar, {
      width: '100%', ease: 'none',
      scrollTrigger: { trigger: line, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
    });
  }

  /* ---------- Timeline items ---------- */
  function initTimeline() {
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0, x: -30, duration: 0.8, delay: i * 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 88%' },
      });
    });
  }

  /* ---------- Card tilt effect ---------- */
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.tilt').forEach((card) => {
      gsap.set(card, { transformPerspective: 800 });
      // quickTo reuses a single tween per property instead of spawning a new
      // one on every mousemove event — this is what was causing the lag.
      const setRotX = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power2.out' });
      const setRotY = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power2.out' });

      let rafId = null;
      let pendingEvent = null;

      function applyTilt() {
        rafId = null;
        if (!pendingEvent) return;
        const rect = card.getBoundingClientRect();
        const x = pendingEvent.clientX - rect.left;
        const y = pendingEvent.clientY - rect.top;
        setRotX(((y / rect.height) - 0.5) * -8);
        setRotY(((x / rect.width) - 0.5) * 8);
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      }

      card.addEventListener('mousemove', (e) => {
        pendingEvent = e;
        if (rafId === null) rafId = requestAnimationFrame(applyTilt);
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        pendingEvent = null;
        setRotX(0);
        setRotY(0);
      });
    });
  }

  /* ---------- Work filters ---------- */
  function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const show = filter === 'all' || card.dataset.category === filter;
          if (show) {
            card.classList.remove('filtered-out');
            gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
          } else {
            card.classList.add('filtered-out');
          }
        });
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach((other) => {
          other.classList.remove('active');
          other.querySelector('.faq-answer').style.maxHeight = null;
        });
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Testimonials marquee (infinite) ---------- */
  function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;
    // duplicate content once for seamless loop
    track.innerHTML += track.innerHTML;
    const distance = track.scrollWidth / 2;
    if (reduceMotion) return;
    gsap.to(track, {
      x: -distance, duration: 32, ease: 'none', repeat: -1,
    });
    track.addEventListener('mouseenter', () => gsap.to(track, { timeScale: 0.25, duration: 0.4 }));
    track.addEventListener('mouseleave', () => gsap.to(track, { timeScale: 1, duration: 0.4 }));
  }

  /* ---------- Section fade/scale on scroll (subtle) ---------- */
  function initSectionScale() {
    document.querySelectorAll('.section-head').forEach((head) => {
      gsap.from(head.children, {
        opacity: 0, y: 30, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 88%' },
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    heroEntrance();
    initReveals();
    initCounters();
    initProcessProgress();
    initTimeline();
    initTilt();
    initFilters();
    initFaq();
    initMarquee();
  });

  window.NebulaAnimations = { initSectionScale };
})();