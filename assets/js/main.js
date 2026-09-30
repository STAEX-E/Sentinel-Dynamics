/* ============================================================
   Sentinel Dynamics — Core interactions: nav state, scroll progress, reveals
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".nav");
    const progress = document.getElementById("scroll-progress");

    function onScroll() {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (nav) nav.classList.toggle("scrolled", scrollY > 24);
      if (progress && docH > 0) {
        progress.style.width = `${Math.min(100, (scrollY / docH) * 100)}%`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Log Out — only shown once a defense-personnel attestation has been
    // completed (see verify.js); clears it and returns to the homepage.
    const logoutBtn = document.getElementById("nav-logout-btn");
    if (logoutBtn && window.SentinelVerify) {
      if (window.SentinelVerify.isVerified()) logoutBtn.style.display = "";
      logoutBtn.addEventListener("click", () => {
        window.SentinelVerify.clearVerified();
        window.location.href = "index.html";
      });
    }

    // Reveal-on-scroll
    const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("in-view"));
    }

    // Smooth in-page anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Business Model journey: scroll-fill line + active-step tracking
    const journey = document.getElementById("journey-track");
    if (journey) {
      const fill = document.getElementById("journey-fill");
      const steps = Array.from(journey.querySelectorAll(".journey__step"));
      const tracker = document.getElementById("journey-tracker");
      const trackerNum = document.getElementById("journey-tracker-num");
      const trackerLabel = document.getElementById("journey-tracker-label");

      function updateJourney() {
        const rect = journey.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height;
        const passed = Math.min(Math.max(vh / 2 - rect.top, 0), total);
        const pct = total > 0 ? (passed / total) * 100 : 0;
        if (fill) fill.style.height = pct + "%";

        let activeStep = null;
        steps.forEach((step) => {
          const r = step.getBoundingClientRect();
          const isActive = r.top < vh * 0.6 && r.bottom > vh * 0.25;
          step.classList.toggle("is-active", isActive);
          if (isActive) activeStep = step;
        });

        if (tracker) {
          const sectionInView = rect.top < vh && rect.bottom > 0;
          tracker.classList.toggle("is-visible", sectionInView && !!activeStep);
          if (activeStep && trackerNum && trackerLabel) {
            trackerNum.textContent = activeStep.dataset.step || "";
            trackerLabel.textContent = activeStep.dataset.label || "";
          }
        }
      }

      window.addEventListener("scroll", updateJourney, { passive: true });
      window.addEventListener("resize", updateJourney);
      updateJourney();
    }
  });
})();
