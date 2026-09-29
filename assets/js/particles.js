/* ============================================================
   Sentinel Dynamics — Particle systems
   1) Ambient background field (all pages) — dots that just drift,
      never assembling into anything.
   2) Opening sequence (home page only) — a few planes and
      helicopters fly around a full-screen splash before the home
      page is revealed.
   Pure canvas 2D, no dependencies.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- Ambient background field ---------------- */
  function initBackgroundField() {
    const canvas = document.getElementById("bg-field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, dots = [];
    let streaks = [];
    let nextStreakAt = 0;

    function maybeSpawnStreak(t) {
      if (reduceMotion || t < nextStreakAt || streaks.length >= 6) return;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = (3.2 + Math.random() * 2.4) * DPR;
      streaks.push({
        x: dir > 0 ? -40 * DPR : w + 40 * DPR,
        y: Math.random() * h * 0.7,
        vx: dir * speed * (0.65 + Math.random() * 0.35),
        vy: speed * (0.45 + Math.random() * 0.45),
        len: (22 + Math.random() * 22) * DPR,
        life: 0,
        maxLife: 40 + Math.random() * 26,
      });
      nextStreakAt = t + 300 + Math.random() * 700;
    }

    function drawStreaks(t) {
      maybeSpawnStreak(t);
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const lr = s.life / s.maxLife;
        const alpha = lr < 0.18 ? lr / 0.18 : lr > 0.75 ? Math.max(0, (1 - lr) / 0.25) : 1;
        if (s.life > s.maxLife || s.x < -100 * DPR || s.x > w + 100 * DPR || s.y > h + 100 * DPR) {
          streaks.splice(i, 1);
          continue;
        }
        const mag = Math.hypot(s.vx, s.vy) || 1;
        const tailX = s.x - (s.vx / mag) * s.len;
        const tailY = s.y - (s.vy / mag) * s.len;
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, "rgba(244,197,24,0)");
        grad.addColorStop(1, `rgba(255,244,214,${0.55 * alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.9 * DPR;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,250,235,${0.65 * alpha})`;
        ctx.arc(s.x, s.y, 0.8 * DPR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function resize() {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      streaks = [];
      const count = Math.round((window.innerWidth * window.innerHeight) / 22000);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.2 + 0.4) * DPR,
        vx: (Math.random() - 0.5) * 0.06 * DPR,
        vy: (Math.random() - 0.5) * 0.06 * DPR,
        hue: Math.random() > 0.82 ? "y" : "g",
        tw: Math.random() * Math.PI * 2,
      }));
    }

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 18;
      my = (e.clientY / window.innerHeight - 0.5) * 18;
    });

    function tick(t) {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        const flicker = 0.4 + Math.abs(Math.sin(d.tw + t * 0.0006)) * 0.6;
        ctx.beginPath();
        ctx.fillStyle = d.hue === "y"
          ? `rgba(244,197,24,${0.35 * flicker})`
          : `rgba(150,155,160,${0.28 * flicker})`;
        ctx.arc(d.x + mx * DPR, d.y + my * DPR, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      drawStreaks(t);
      if (!reduceMotion) requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(tick);
    if (reduceMotion) tick(0);
  }

  /* ---------------- Shared shape renderers ----------------
     Used by the opening sequence's flying planes and helicopters. */

  // Stylized top-down fixed-wing silhouette (normalized -0.5..0.5), nose at -Y.
  const PLANE_SHAPE = [
    [0, -0.5], [0.045, -0.28], [0.05, -0.05],
    [0.52, 0.1], [0.52, 0.17], [0.07, 0.08],
    [0.09, 0.27], [0.24, 0.4], [0.24, 0.46],
    [0.05, 0.37], [0.04, 0.5], [-0.04, 0.5],
    [-0.05, 0.37], [-0.24, 0.46], [-0.24, 0.4],
    [-0.09, 0.27], [-0.07, 0.08], [-0.52, 0.17],
    [-0.52, 0.1], [-0.05, -0.05], [-0.045, -0.28],
  ];

  function drawPlaneShape(octx, cx, cy, s, fillStyle) {
    octx.fillStyle = fillStyle || "#fff";
    octx.beginPath();
    octx.moveTo(cx + PLANE_SHAPE[0][0] * s, cy + PLANE_SHAPE[0][1] * s);
    for (let i = 1; i < PLANE_SHAPE.length; i++) {
      octx.lineTo(cx + PLANE_SHAPE[i][0] * s, cy + PLANE_SHAPE[i][1] * s);
    }
    octx.closePath();
    octx.fill();
  }

  // Top-down helicopter: rotor cross + hub, fuselage, tail boom, tail rotor.
  // Hub/cockpit faces -Y, tail extends toward +Y (same "front" convention as the plane).
  function drawHelicopterShape(octx, cx, cy, s, fillStyle) {
    octx.fillStyle = fillStyle || "#fff";
    octx.save();
    octx.translate(cx, cy);

    octx.fillRect(-0.42 * s, -0.035 * s, 0.84 * s, 0.07 * s);
    octx.save();
    octx.rotate(Math.PI / 2);
    octx.fillRect(-0.42 * s, -0.035 * s, 0.84 * s, 0.07 * s);
    octx.restore();
    octx.beginPath();
    octx.arc(0, 0, 0.07 * s, 0, Math.PI * 2);
    octx.fill();

    octx.beginPath();
    octx.ellipse(0, 0.16 * s, 0.09 * s, 0.22 * s, 0, 0, Math.PI * 2);
    octx.fill();

    octx.fillRect(-0.02 * s, 0.16 * s, 0.04 * s, 0.34 * s);

    octx.save();
    octx.translate(0, 0.5 * s);
    octx.fillRect(-0.09 * s, -0.015 * s, 0.18 * s, 0.03 * s);
    octx.beginPath();
    octx.arc(0, 0, 0.025 * s, 0, Math.PI * 2);
    octx.fill();
    octx.restore();

    octx.restore();
  }

  function drawFlyerShape(octx, cx, cy, s, shapeKey, fillStyle) {
    if (shapeKey === "heli") drawHelicopterShape(octx, cx, cy, s, fillStyle);
    else drawPlaneShape(octx, cx, cy, s, fillStyle);
  }

  /* ---------------- Opening sequence ----------------
     A handful of planes and helicopters fly around a full-screen
     splash for a couple of seconds, then fade out to reveal the
     actual home page. The home page itself has no special hero
     particles — just the ambient background field drifting behind
     it like every other page. */
  function initIntroSequence() {
    const overlay = document.getElementById("intro-overlay");
    const canvas = document.getElementById("intro-canvas");
    if (!overlay || !canvas) return;

    if (reduceMotion) {
      overlay.remove();
      return;
    }

    const ctx = canvas.getContext("2d");
    let w, h;
    function resize() {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    const FLYER_SHAPES = ["plane", "heli"];
    const DURATION = 2600;
    const FADE = 700;
    let start = null;
    let done = false;

    const flyers = Array.from({ length: 6 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.32 + Math.random() * 0.3) * DPR;
      return {
        shape: FLYER_SHAPES[Math.floor(Math.random() * FLYER_SHAPES.length)],
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (28 + Math.random() * 22) * DPR,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.0018 + Math.random() * 0.0018,
        color: Math.random() > 0.7 ? "rgba(255,122,26,0.92)" : "rgba(244,197,24,0.92)",
      };
    });

    function finish() {
      if (done) return;
      done = true;
      overlay.classList.add("is-hidden");
      window.removeEventListener("resize", resize);
      setTimeout(() => overlay.remove(), FADE + 150);
    }

    function tick(t) {
      if (start === null) start = t;
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);

      for (const d of flyers) {
        d.vx += Math.sin(t * d.wobbleSpeed + d.wobble) * 0.012 * DPR;
        d.vy += Math.cos(t * d.wobbleSpeed + d.wobble) * 0.012 * DPR;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -50 * DPR) d.x = w + 50 * DPR;
        if (d.x > w + 50 * DPR) d.x = -50 * DPR;
        if (d.y < -50 * DPR) d.y = h + 50 * DPR;
        if (d.y > h + 50 * DPR) d.y = -50 * DPR;

        // Nose (both shapes) points toward -Y before rotation, so align
        // it to the velocity vector so each flyer banks toward its heading.
        const heading = Math.atan2(d.vx, -d.vy);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(heading);
        drawFlyerShape(ctx, 0, 0, d.size, d.shape, d.color);
        ctx.restore();
      }

      if (!done && elapsed >= DURATION) finish();
      if (!done) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    overlay.addEventListener("click", finish, { once: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundField();
    initIntroSequence();
  });
})();
