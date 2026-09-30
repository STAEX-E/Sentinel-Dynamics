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

  /* ---------------- 3D wireframe globe math ----------------
     A hand-rolled rotate + perspective-project pipeline for a unit
     sphere — no WebGL/3D library, just sin/cos and a perspective
     divide. Used by the opening sequence below. */

  const GLOBE_TILT = -0.34; // constant tilt around X so we see a 3-quarter view
  const GLOBE_CAM_D = 2.6; // camera distance from a unit-radius sphere

  function rotatePoint(p, rotY, tiltX) {
    // Tilt around X first, then spin around Y.
    let x = p[0], y = p[1], z = p[2];
    const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const x2 = x * cy + z1 * sy;
    const z2 = -x * sy + z1 * cy;
    return [x2, y1, z2];
  }

  function projectPoint(p, rotY, R, cx, cy, zoom) {
    const r = rotatePoint(p, rotY, GLOBE_TILT);
    const scale = (GLOBE_CAM_D / (GLOBE_CAM_D - r[2])) * R * zoom;
    return { x: cx + r[0] * scale, y: cy - r[1] * scale, z: r[2] };
  }

  function sphereFromLatLon(latDeg, lonDeg, elevate) {
    const phi = ((90 - latDeg) * Math.PI) / 180;
    const theta = (lonDeg * Math.PI) / 180;
    const e = elevate || 1;
    return [Math.sin(phi) * Math.cos(theta) * e, Math.cos(phi) * e, Math.sin(phi) * Math.sin(theta) * e];
  }

  function buildGlobeGrid() {
    const rings = [];
    // Latitude rings (fixed lat, sweep longitude).
    for (let lat = -75; lat <= 75; lat += 15) {
      const ring = [];
      for (let i = 0; i <= 48; i++) ring.push(sphereFromLatLon(lat, (i / 48) * 360));
      rings.push(ring);
    }
    // Longitude rings (fixed lon, sweep latitude), half-meridians so poles meet.
    for (let lon = 0; lon < 360; lon += 15) {
      const ring = [];
      for (let i = 0; i <= 48; i++) ring.push(sphereFromLatLon(-90 + (i / 48) * 180, lon));
      rings.push(ring);
    }
    return rings;
  }

  function slerp(a, b, t) {
    const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const omega = Math.acos(dot);
    if (omega < 1e-6) return a.slice();
    const sinO = Math.sin(omega);
    const wa = Math.sin((1 - t) * omega) / sinO;
    const wb = Math.sin(t * omega) / sinO;
    return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
  }

  /* ---------------- Opening sequence ----------------
     A dark, high-tech wireframe globe rotates slowly while a few
     flights arc between cities, leaving fading flight-path trails.
     The globe then spins up and rushes the camera, dissolving into
     a bold "SENTINEL DYNAMICS" reveal before the overlay fades to
     reveal the actual home page underneath — already fully
     rendered, so the hand-off feels seamless. */
  function initIntroSequence() {
    const overlay = document.getElementById("intro-overlay");
    const canvas = document.getElementById("intro-canvas");
    const brand = overlay ? overlay.querySelector(".intro-brand") : null;
    if (!overlay || !canvas) return;

    if (reduceMotion) {
      overlay.remove();
      return;
    }

    const ctx = canvas.getContext("2d");
    let w, h, cx, cy, R;
    function resize() {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.3;
    }
    resize();
    window.addEventListener("resize", resize);

    const GRID = buildGlobeGrid();

    // A dense set of real-world cities marked as glowing dots on the
    // globe, standing in for "global reach" — HQ first.
    const CITIES = [
      sphereFromLatLon(17.4, 78.5), // 0 Hyderabad
      sphereFromLatLon(51.5, -0.1), // 1 London
      sphereFromLatLon(40.7, -74.0), // 2 New York
      sphereFromLatLon(35.7, 139.7), // 3 Tokyo
      sphereFromLatLon(25.2, 55.3), // 4 Dubai
      sphereFromLatLon(-33.9, 151.2), // 5 Sydney
      sphereFromLatLon(55.75, 37.6), // 6 Moscow
      sphereFromLatLon(28.6, 77.2), // 7 Delhi
      sphereFromLatLon(24.45, 54.4), // 8 Abu Dhabi
      sphereFromLatLon(41.85, -87.65), // 9 Chicago
      sphereFromLatLon(19.4, -99.1), // 10 Mexico City
      sphereFromLatLon(48.85, 2.35), // 11 Paris
      sphereFromLatLon(52.52, 13.4), // 12 Berlin
      sphereFromLatLon(41.9, 12.5), // 13 Rome
      sphereFromLatLon(40.4, -3.7), // 14 Madrid
      sphereFromLatLon(41.0, 28.9), // 15 Istanbul
      sphereFromLatLon(30.0, 31.2), // 16 Cairo
      sphereFromLatLon(24.7, 46.7), // 17 Riyadh
      sphereFromLatLon(35.7, 51.4), // 18 Tehran
      sphereFromLatLon(24.86, 67.0), // 19 Karachi
      sphereFromLatLon(19.07, 72.87), // 20 Mumbai
      sphereFromLatLon(12.97, 77.59), // 21 Bangalore
      sphereFromLatLon(13.08, 80.27), // 22 Chennai
      sphereFromLatLon(22.57, 88.36), // 23 Kolkata
      sphereFromLatLon(1.35, 103.82), // 24 Singapore
      sphereFromLatLon(13.75, 100.5), // 25 Bangkok
      sphereFromLatLon(-6.2, 106.85), // 26 Jakarta
      sphereFromLatLon(14.6, 120.98), // 27 Manila
      sphereFromLatLon(39.9, 116.4), // 28 Beijing
      sphereFromLatLon(31.2, 121.47), // 29 Shanghai
      sphereFromLatLon(37.57, 126.98), // 30 Seoul
      sphereFromLatLon(22.32, 114.17), // 31 Hong Kong
      sphereFromLatLon(-26.2, 28.05), // 32 Johannesburg
      sphereFromLatLon(-1.29, 36.82), // 33 Nairobi
      sphereFromLatLon(6.52, 3.38), // 34 Lagos
      sphereFromLatLon(-23.55, -46.63), // 35 São Paulo
      sphereFromLatLon(-34.6, -58.38), // 36 Buenos Aires
      sphereFromLatLon(43.65, -79.38), // 37 Toronto
      sphereFromLatLon(34.05, -118.24), // 38 Los Angeles
      sphereFromLatLon(37.77, -122.42), // 39 San Francisco
      sphereFromLatLon(38.9, -77.04), // 40 Washington, D.C.
    ];
    const ROUTES = [
      [0, 1], [2, 3], [4, 5], [7, 6], [8, 9], [9, 10],
      [1, 7], [11, 16], [24, 28], [38, 30], [35, 37], [20, 31],
    ];

    const CRUISE_ROT_SPEED = 0.00055; // rad/ms during the cruising phase
    const PHASE1_END = 4600; // globe cruising + connections forming
    const PHASE2_END = PHASE1_END + 900; // rapid spin + zoom into camera
    const LOGO_HOLD_END = PHASE2_END + 1700; // hold the bold reveal
    const FADE = 700;

    const ROUTE_LAUNCH_START = 150;
    const ROUTE_LAUNCH_STEP = 280;
    const ROUTE_DRAW_DURATION = 1200;

    let start = null;
    let done = false;
    let brandShown = false;

    function finish() {
      if (done) return;
      done = true;
      overlay.classList.add("is-hidden");
      window.removeEventListener("resize", resize);
      setTimeout(() => overlay.remove(), FADE + 150);
    }

    function drawGlobe(rotY, alpha, zoom) {
      // Canvas strokes a whole path in one color, so per-vertex fading
      // (dimming the grid toward the far side of the sphere) needs each
      // segment stroked individually rather than one path per ring.
      ctx.lineWidth = 1 * DPR;
      for (const ring of GRID) {
        let prev = null;
        for (let i = 0; i < ring.length; i++) {
          const p = projectPoint(ring[i], rotY, R, cx, cy, zoom);
          const depthAlpha = Math.max(0, (p.z + 0.55) / 1.15);
          if (prev && prev.depthAlpha > 0.02 && depthAlpha > 0.02) {
            const segAlpha = (prev.depthAlpha + depthAlpha) / 2;
            ctx.strokeStyle = `rgba(140,168,196,${0.5 * segAlpha * alpha})`;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = { x: p.x, y: p.y, depthAlpha };
        }
      }
    }

    // Every city gets a small glowing marker, faded toward the far side
    // of the sphere just like the grid — there are a lot of these, so
    // keep each draw call cheap (two filled circles, no shadow blur).
    function drawCityDots(rotY, zoom, alpha) {
      for (const city of CITIES) {
        const p = projectPoint(city, rotY, R, cx, cy, zoom);
        const depthAlpha = Math.max(0, (p.z + 0.55) / 1.15);
        if (depthAlpha <= 0.02) continue;
        const a = depthAlpha * alpha;
        ctx.beginPath();
        ctx.fillStyle = `rgba(244,197,24,${0.18 * a})`;
        ctx.arc(p.x, p.y, 3.2 * DPR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,226,150,${0.85 * a})`;
        ctx.arc(p.x, p.y, 1.3 * DPR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Routes connect two cities with a dotted great-circle line that
    // draws itself in over ROUTE_DRAW_DURATION, then stays put — no
    // moving aircraft, just a growing network of dotted connections.
    function drawRoutes(rotY, elapsed, zoom, alpha) {
      ctx.lineWidth = 1.4 * DPR;
      ctx.setLineDash([3.5 * DPR, 4.5 * DPR]);
      ROUTES.forEach((route, idx) => {
        const launchAt = ROUTE_LAUNCH_START + idx * ROUTE_LAUNCH_STEP;
        const t = (elapsed - launchAt) / ROUTE_DRAW_DURATION;
        if (t < 0) return;
        const tc = Math.min(1, t);
        const a = CITIES[route[0]];
        const b = CITIES[route[1]];

        const STEPS = 48;
        const n = Math.max(1, Math.round(STEPS * tc));
        let avgZ = 0;
        let sampleCount = 0;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const ft = (i / STEPS) * tc;
          const elevate = 1 + 0.03 * Math.sin((i / STEPS) * Math.PI);
          const pt = slerp(a, b, Math.min(1, ft)).map((v) => v * elevate);
          const proj = projectPoint(pt, rotY, R, cx, cy, zoom);
          avgZ += proj.z;
          sampleCount++;
          if (i === 0) ctx.moveTo(proj.x, proj.y);
          else ctx.lineTo(proj.x, proj.y);
        }
        avgZ /= sampleCount || 1;
        const depthAlpha = Math.max(0, (avgZ + 0.55) / 1.15);
        if (depthAlpha <= 0.02) return;
        ctx.strokeStyle = `rgba(255,214,120,${0.65 * depthAlpha * alpha})`;
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    function easeInExpo(x) {
      return x <= 0 ? 0 : Math.pow(2, 10 * x - 10);
    }

    function tick(t) {
      if (start === null) start = t;
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);

      if (elapsed <= PHASE1_END) {
        const rotY = elapsed * CRUISE_ROT_SPEED;
        drawGlobe(rotY, 1, 1);
        drawCityDots(rotY, 1, 1);
        drawRoutes(rotY, elapsed, 1, 1);
      } else if (elapsed <= PHASE2_END) {
        // Rapid spin-up + rush toward camera, fading out as it overscales.
        const p = (elapsed - PHASE1_END) / (PHASE2_END - PHASE1_END);
        const eased = easeInExpo(p);
        const rotY = PHASE1_END * CRUISE_ROT_SPEED + eased * 3.4;
        const zoom = 1 + eased * 7;
        const alpha = Math.max(0, 1 - Math.pow(p, 1.6) * 1.15);
        drawGlobe(rotY, alpha, zoom);
        drawCityDots(rotY, zoom, alpha);
        drawRoutes(rotY, PHASE1_END, zoom, alpha);
        // A brief bright flash right at the climax sells the "burst
        // through into the logo" feeling.
        if (p > 0.72) {
          const flash = (p - 0.72) / 0.28;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
          grad.addColorStop(0, `rgba(255,244,214,${0.5 * flash})`);
          grad.addColorStop(1, "rgba(255,244,214,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
        if (!brandShown) {
          brandShown = true;
          if (brand) brand.classList.add("is-visible");
        }
      } else if (elapsed <= LOGO_HOLD_END) {
        // Hold on the bold reveal — nothing more to draw on canvas.
      } else if (!done) {
        finish();
      }

      if (!done) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    overlay.addEventListener(
      "click",
      () => {
        if (brand && !brandShown) {
          brandShown = true;
          brand.classList.add("is-visible");
        }
        finish();
      },
      { once: true }
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundField();
    initIntroSequence();
  });
})();
