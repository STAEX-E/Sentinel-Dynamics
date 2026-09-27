/* ============================================================
   Sentinel Dynamics — Particle systems
   1) Ambient background field (all pages)
   2) Hero twin-formation field (home page only)
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

  /* ---------------- Hero twin-formation field ----------------
     Two independent silhouettes assemble on either side of the
     hero title (never behind it) and slowly counter-rotate in
     place. Each side picks a random shape — plane, one of several
     drone variants, or a helicopter — fresh on every page load. */

  const SHAPE_POOL = ["plane", "quad", "hexa", "fpv", "octo", "heli"];
  function pickShape() {
    return SHAPE_POOL[Math.floor(Math.random() * SHAPE_POOL.length)];
  }

  const DRONE_ARM_DEFS = {
    quad: { count: 4, angleOffset: Math.PI / 4, armLen: 0.4, armW: 0.05, podR: 0.095, bodyR: 0.11 },
    hexa: { count: 6, angleOffset: 0, armLen: 0.4, armW: 0.045, podR: 0.078, bodyR: 0.12 },
    fpv: { count: 4, angleOffset: Math.PI / 4, armLen: 0.27, armW: 0.06, podR: 0.08, bodyR: 0.1 },
    octo: { count: 8, angleOffset: Math.PI / 8, armLen: 0.4, armW: 0.04, podR: 0.062, bodyR: 0.13 },
  };

  function drawDroneShape(octx, cx, cy, s, variant) {
    const def = DRONE_ARM_DEFS[variant] || DRONE_ARM_DEFS.quad;
    octx.fillStyle = "#fff";

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

  // Stylized top-down fixed-wing silhouette (normalized -0.5..0.5)
  const PLANE_SHAPE = [
    [0, -0.5], [0.045, -0.28], [0.05, -0.05],
    [0.52, 0.1], [0.52, 0.17], [0.07, 0.08],
    [0.09, 0.27], [0.24, 0.4], [0.24, 0.46],
    [0.05, 0.37], [0.04, 0.5], [-0.04, 0.5],
    [-0.05, 0.37], [-0.24, 0.46], [-0.24, 0.4],
    [-0.09, 0.27], [-0.07, 0.08], [-0.52, 0.17],
    [-0.52, 0.1], [-0.05, -0.05], [-0.045, -0.28],
  ];

  function drawPlaneShape(octx, cx, cy, s) {
    octx.fillStyle = "#fff";
    octx.beginPath();
    octx.moveTo(cx + PLANE_SHAPE[0][0] * s, cy + PLANE_SHAPE[0][1] * s);
    for (let i = 1; i < PLANE_SHAPE.length; i++) {
      octx.lineTo(cx + PLANE_SHAPE[i][0] * s, cy + PLANE_SHAPE[i][1] * s);
    }
    octx.closePath();
    octx.fill();
  }

  // Top-down helicopter: rotor cross + hub, fuselage, tail boom, tail rotor.
  function drawHelicopterShape(octx, cx, cy, s) {
    octx.fillStyle = "#fff";
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

  function drawShape(octx, cx, cy, s, shapeKey) {
    if (shapeKey === "plane") drawPlaneShape(octx, cx, cy, s);
    else if (shapeKey === "heli") drawHelicopterShape(octx, cx, cy, s);
    else drawDroneShape(octx, cx, cy, s, shapeKey);
  }

  function buildShapePoints(width, height, count, cx, cy, size, shapeKey) {
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const octx = off.getContext("2d");

    drawShape(octx, cx, cy, size, shapeKey);

    const data = octx.getImageData(0, 0, width, height).data;
    const candidates = [];
    const step = 3;
    const minX = Math.max(0, Math.floor(cx - size * 0.6));
    const maxX = Math.min(width, Math.ceil(cx + size * 0.6));
    const minY = Math.max(0, Math.floor(cy - size * 0.6));
    const maxY = Math.min(height, Math.ceil(cy + size * 0.6));
    for (let y = minY; y < maxY; y += step) {
      for (let x = minX; x < maxX; x += step) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] > 128) candidates.push({ x, y });
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(candidates[i % candidates.length] || { x: cx, y: cy });
    }
    return points;
  }

  function initHeroField() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const COUNT = window.innerWidth < 640 ? 240 : 480;

    // Rotation directions differ so the two sides don't mirror each other.
    const leftShape = pickShape();
    const rightShape = pickShape();
    const leftSpin = 1;
    const rightSpin = -1;

    let leftCenter = { x: 0, y: 0 };
    let rightCenter = { x: 0, y: 0 };

    function layout() {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      const narrow = window.innerWidth < 768;
      const size = Math.min(w, h) * (narrow ? 0.24 : 0.32);
      const cy = h * 0.46;
      const leftCx = w * (narrow ? 0.12 : 0.16);
      const rightCx = w * (narrow ? 0.88 : 0.84);
      leftCenter = { x: leftCx, y: cy };
      rightCenter = { x: rightCx, y: cy };

      const half = Math.round(COUNT / 2);
      const leftTargets = buildShapePoints(w, h, half, leftCx, cy, size, leftShape);
      const rightTargets = buildShapePoints(w, h, COUNT - half, rightCx, cy, size, rightShape);

      function toParticle(t, center, spin) {
        return {
          tx: t.x,
          ty: t.y,
          ox: t.x - center.x,
          oy: t.y - center.y,
          cx: center.x,
          cy: center.y,
          spin,
          sx: Math.random() * w,
          sy: Math.random() * h,
          r: (Math.random() * 1.5 + 0.7) * DPR,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 0.8,
          hue: Math.random() > 0.75 ? "o" : "y",
        };
      }

      particles = leftTargets.map((t) => toParticle(t, leftCenter, leftSpin))
        .concat(rightTargets.map((t) => toParticle(t, rightCenter, rightSpin)));
    }

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 26;
      my = (e.clientY / window.innerHeight - 0.5) * 26;
    });

    // Formations assemble automatically right after load — no scroll required.
    const ASSEMBLE_MS = 1800;
    let assembleStart = null;

    function progress(t) {
      if (assembleStart === null) assembleStart = t;
      return Math.max(0, Math.min(1, (t - assembleStart) / ASSEMBLE_MS));
    }

    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    // Slow continuous rotation once assembled — a full turn takes ~100s.
    const ROT_SPEED = (Math.PI * 2) / 100000;

    function tick(t) {
      const p = ease(progress(t));
      ctx.clearRect(0, 0, w, h);
      for (const pt of particles) {
        const idleX = Math.sin(t * 0.0006 * pt.speed + pt.phase) * 3 * DPR;
        const idleY = Math.cos(t * 0.0007 * pt.speed + pt.phase) * 3 * DPR;

        const theta = t * ROT_SPEED * pt.spin;
        const cosT = Math.cos(theta), sinT = Math.sin(theta);
        const rtx = pt.cx + pt.ox * cosT - pt.oy * sinT;
        const rty = pt.cy + pt.ox * sinT + pt.oy * cosT;

        const baseX = pt.sx + (rtx - pt.sx) * p;
        const baseY = pt.sy + (rty - pt.sy) * p;
        const px = baseX + idleX * p + mx * DPR * (0.4 + p * 0.6);
        const py = baseY + idleY * p + my * DPR * (0.4 + p * 0.6);

        ctx.beginPath();
        const alpha = 0.35 + 0.5 * p;
        ctx.fillStyle = pt.hue === "o"
          ? `rgba(255,122,26,${alpha})`
          : `rgba(244,197,24,${alpha})`;
        ctx.arc(px, py, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(tick);
    }

    layout();
    window.addEventListener("resize", layout);
    requestAnimationFrame(tick);
    if (reduceMotion) {
      // snap straight to the formed (unrotated) silhouettes for reduced-motion users
      for (const pt of particles) { pt.sx = pt.cx + pt.ox; pt.sy = pt.cy + pt.oy; }
      tick(0);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundField();
    initHeroField();
  });
})();
