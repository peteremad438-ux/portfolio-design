/* ==========================================================================
   Main
   ========================================================================== */
(function () {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Loading screen ---------- */
  const loader = document.getElementById("loader");
  const loaderProgress = document.getElementById("loaderProgress");
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
    }
    if (loaderProgress) loaderProgress.style.width = progress + "%";
  }, 140);

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (loaderProgress) loaderProgress.style.width = "100%";
      setTimeout(() => {
        loader && loader.classList.add("hidden");
        document.body.style.overflow = "";
      }, 350);
    }, 300);
  });

  /* ---------- Lenis smooth scroll + GSAP sync ---------- */
  let lenis;
  if (typeof Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Smooth anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById("navbar");
  function onScroll() {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    // back to top visibility
    if (window.scrollY > window.innerHeight) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  }
  window.addEventListener("scroll", onScroll);
  if (lenis) lenis.on("scroll", onScroll);

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  function closeMobileMenu() {
    navToggle.classList.remove("active");
    mobileMenu.classList.remove("active");
  }
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById("backToTop");
  backToTop.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Contact form (demo submit) ---------- */
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      formNote.textContent =
        "Thanks — I'll get back to you within one business day.";
      contactForm.reset();
    });
  }

  /* ---------- Newsletter form (demo submit) ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input");
      input.value = "";
      input.placeholder = "You're in — welcome aboard.";
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();