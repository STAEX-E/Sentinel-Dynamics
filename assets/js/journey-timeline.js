/* ============================================================
   Business Model page — "Eight stages" horizontal journey timeline.
   Vanilla-JS port of a GSAP ScrollTrigger component: the section
   pins, the track slides sideways, and each stage's stem, dot and
   copy reveal as it reaches centre. Loads gsap/ScrollTrigger/SplitText
   from assets/vendor/gsap/ (no bundler — plain <script> includes).
   ============================================================ */
(function () {
  "use strict";

  const section = document.getElementById("gsap-journey");
  if (!section || typeof window.gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  const slider = document.getElementById("gsap-journey-slider");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Visual/scroll order of the 8 stages (top row holds the odd steps,
  // bottom row the even steps — matches the markup in business-model.html).
  const STAGES = [
    { id: "step-01" },
    { id: "step-02" },
    { id: "step-03" },
    { id: "step-04" },
    { id: "step-05" },
    { id: "step-06" },
    { id: "step-07" },
    { id: "step-08" },
  ];

  function setup() {
    const isMobile = window.innerWidth < 600;
    const slidePercent = isMobile ? -64 : -76;
    const lineWidth = isMobile ? "65%" : "98%";
    const lineStart = isMobile ? "top 30%" : "top 25%";
    const slideEnd = isMobile ? "85% 50%" : "94% bottom";
    const lineEnd = isMobile ? "83% 50%" : "94% bottom";

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: slideEnd,
        scrub: true,
      },
      defaults: { ease: "none" },
    });

    tl.fromTo(slider, { xPercent: 0 }, { xPercent: slidePercent });

    if (reducedMotion) {
      gsap.set(".journey-line", { width: lineWidth });
    } else {
      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: lineStart,
          end: lineEnd,
          scrub: true,
        },
      });
    }

    if (reducedMotion) {
      STAGES.forEach((stage) => {
        gsap.set(`.jl-${stage.id}`, { scaleY: 1 });
        gsap.set(`.jd-${stage.id}`, { scale: 1 });
        gsap.set(`.title-${stage.id}`, { opacity: 1, clearProps: "transform" });
        gsap.set(`.description-${stage.id}`, { opacity: 1, clearProps: "transform" });
      });
      return;
    }

    STAGES.forEach((stage) => {
      gsap.set(`.jl-${stage.id}`, { scaleY: 0 });
      gsap.set(`.jd-${stage.id}`, { scale: 0 });
      gsap.set(`.title-${stage.id}`, { opacity: 1 });
      gsap.set(`.description-${stage.id}`, { opacity: 1 });
    });

    const titleSplits = {};
    const descriptionSplits = {};

    STAGES.forEach((stage) => {
      titleSplits[stage.id] = new SplitText(`.title-${stage.id}`, {
        type: "chars, words, lines",
        mask: "lines",
      });
      descriptionSplits[stage.id] = new SplitText(`.description-${stage.id}`, {
        type: "chars, words, lines",
        mask: "lines",
      });
    });

    const duration = 1.1;

    const positions = isMobile
      ? [
          [20, 30], [27, 37], [34, 44], [41, 51],
          [48, 58], [55, 65], [62, 72], [69, 79],
        ]
      : [
          [4, 22], [13, 31], [22, 40], [31, 49],
          [40, 58], [49, 67], [58, 76], [67, 85],
        ];

    STAGES.forEach((stage, index) => {
      const [startPos, endPos] = positions[index];
      const titleLines = titleSplits[stage.id]?.lines || [];
      const descriptionLines = descriptionSplits[stage.id]?.lines || [];

      const itemTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: `${startPos}% 30%`,
          end: `${endPos}% 50%`,
          scrub: true,
        },
      });

      itemTl
        .to(`.jl-${stage.id}`, { scaleY: 1, duration: duration * 0.4 })
        .to(`.jd-${stage.id}`, { scale: 1, duration: duration * 0.4 }, "<")
        .fromTo(
          titleLines,
          { y: 100 },
          { y: 0, delay: -0.8 * duration, duration, stagger: 0.02, ease: "power2.out" },
        )
        .fromTo(
          descriptionLines,
          { y: 100 },
          { y: 0, duration, stagger: 0.02, ease: "power2.out" },
          "<",
        );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.addEventListener("resize", () => ScrollTrigger.refresh());
})();
