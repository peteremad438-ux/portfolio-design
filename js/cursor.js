/* ==========================================================================
   Custom cursor + magnetic buttons
   ========================================================================== */
(function () {
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 900;
  if (isTouch) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let ringScale = 1;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function loop() {
    // Dot: snaps straight to the cursor, but via transform (composited only,
    // no layout reflow) instead of left/top which was forcing a reflow on
    // every single mousemove event.
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;

    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('[data-cursor="link"]').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('link'));
    el.addEventListener('mouseleave', () => ring.classList.remove('link'));
  });

  document.addEventListener('mousedown', () => { ringScale = 0.85; });
  document.addEventListener('mouseup', () => { ringScale = 1; });

  /* Magnetic buttons */
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
  });
})();