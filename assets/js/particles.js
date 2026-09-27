/* ============================================================
   Sentinel Dynamics — Particle systems
   1) Ambient background field (all pages) — dots that just drift,
      never assembling into anything.
   2) Opening sequence (home page only) — a few swarm drones fly
      around a full-screen splash before the home page is revealed.
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
     Used by the opening sequence's flying swarm drones. */

  const DRONE_ARM_DEFS = {
    quad: { count: 4, angleOffset: Math.PI / 4, armLen: 0.4, armW: 0.05, podR: 0.095, bodyR: 0.11 },
    hexa: { count: 6, angleOffset: 0, armLen: 0.4, armW: 0.045, podR: 0.078, bodyR: 0.12 },
    fpv: { count: 4, angleOffset: Math.PI / 4, armLen: 0.27, armW: 0.06, podR: 0.08, bodyR: 0.1 },
    octo: { count: 8, angleOffset: Math.PI / 8, armLen: 0.4, armW: 0.04, podR: 0.062, bodyR: 0.13 },
  };

  function drawDroneShape(octx, cx, cy, s, variant, fillStyle) {
    const def = DRONE_ARM_DEFS[variant] || DRONE_ARM_DEFS.quad;
    octx.fillStyle = fillStyle || "#fff";

    octx.beginPath();
    octx.arc(cx, cy, def.bodyR * s, 0, Math.PI * 2);
    octx.fill();

    for (let i = 0; i < def.count; i++) {
      const angle = def.angleOffset + (i / def.count) * Math.PI * 2;
      octx.save();
      octx.translate(cx, cy);
      octx.rotate(angle);
      octx.fillRect(0, (-def.armW * s) / 2, def.armLen * s, def.armW * s);
      octx.restore();

      const ex = cx + Math.cos(angle) * def.armLen * s;
      const ey = cy + Math.sin(angle) * def.armLen * s;
      octx.beginPath();
      octx.arc(ex, ey, def.podR * s, 0, Math.PI * 2);
      octx.fill();
    }
  }

  /* ---------------- Opening sequence ----------------
     A handful of swarm drones fly around a full-screen splash for a
     couple of seconds, then fade out to reveal the actual home page.
     The home page itself has no special hero particles — just the
     ambient background field drifting behind it like every other page. */
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

    const DRONE_SHAPES = ["quad", "hexa", "fpv", "octo"];
    const DURATION = 2600;
    const FADE = 700;
    let start = null;
    let done = false;

    const drones = Array.from({ length: 6 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.32 + Math.random() * 0.3) * DPR;
      return {
        shape: DRONE_SHAPES[Math.floor(Math.random() * DRONE_SHAPES.length)],
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (26 + Math.random() * 20) * DPR,
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

      for (const d of drones) {
        d.vx += Math.sin(t * d.wobbleSpeed + d.wobble) * 0.012 * DPR;
        d.vy += Math.cos(t * d.wobbleSpeed + d.wobble) * 0.012 * DPR;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -50 * DPR) d.x = w + 50 * DPR;
        if (d.x > w + 50 * DPR) d.x = -50 * DPR;
        if (d.y < -50 * DPR) d.y = h + 50 * DPR;
        if (d.y > h + 50 * DPR) d.y = -50 * DPR;

        const heading = Math.atan2(d.vy, d.vx) + Math.PI / 2;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(heading);
        drawDroneShape(ctx, 0, 0, d.size, d.shape, d.color);
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
