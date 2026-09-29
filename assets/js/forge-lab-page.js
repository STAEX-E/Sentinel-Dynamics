/* ============================================================
   Sentinel Dynamics — FORGE LAB configurator logic
   ============================================================ */

(function () {
  "use strict";

  const root = document.getElementById("forge");
  if (!root) return;

  const F = window.SentinelForge;

  const PLATFORM_ICONS = {
    "fixed-wing": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    vtol: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 12l2 2 4-4"/>',
    fpv: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    cinelifter: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>',
    hexacopter: '<path d="M12 2v6M12 16v6M4 7l5 3M15 14l5 3M4 17l5-3M15 10l5-3"/><circle cx="12" cy="12" r="2.4"/>',
    octacopter: '<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    interceptor: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  };

  function svg(key) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (PLATFORM_ICONS[key] || "") + "</svg>";
  }

  const FPV_STYLE_ICONS = {
    "true-x": '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/><circle cx="6" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7"/><circle cx="6" cy="18" r="1.7"/><circle cx="18" cy="18" r="1.7"/>',
    "straight-x": '<line x1="5" y1="8" x2="19" y2="16"/><line x1="19" y1="8" x2="5" y2="16"/><circle cx="5" cy="8" r="1.7"/><circle cx="19" cy="8" r="1.7"/><circle cx="5" cy="16" r="1.7"/><circle cx="19" cy="16" r="1.7"/>',
    deadcat: '<path d="M12 13 6 6M12 13l6-7M12 13 6 19M12 13l6 6"/><circle cx="6" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7"/><circle cx="6" cy="19" r="1.7"/><circle cx="18" cy="19" r="1.7"/>',
    "stretch-x": '<line x1="9" y1="9" x2="17" y2="12"/><line x1="17" y1="12" x2="9" y2="15"/><line x1="9" y1="9" x2="4" y2="7"/><line x1="9" y1="15" x2="4" y2="17"/><circle cx="17" cy="12" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="9" cy="15" r="1.5"/><circle cx="4" cy="7" r="1.2"/><circle cx="4" cy="17" r="1.2"/>',
    "long-x": '<line x1="2" y1="2" x2="22" y2="22"/><line x1="22" y1="2" x2="2" y2="22"/><circle cx="2" cy="2" r="1.5"/><circle cx="22" cy="2" r="1.5"/><circle cx="2" cy="22" r="1.5"/><circle cx="22" cy="22" r="1.5"/>',
    "h-frame": '<path d="M6 5v14M18 5v14M6 12h12"/><circle cx="6" cy="5" r="1.6"/><circle cx="18" cy="5" r="1.6"/><circle cx="6" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/>',
    cinewhoop: '<circle cx="7" cy="7" r="3.1"/><circle cx="17" cy="7" r="3.1"/><circle cx="7" cy="17" r="3.1"/><circle cx="17" cy="17" r="3.1"/><circle cx="12" cy="12" r="2.2"/>',
  };
  function fpvStyleSvg(key) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (FPV_STYLE_ICONS[key] || "") + "</svg>";
  }

  let suppressAutoDefaults = false;

  function applyFrameDefaults() {
    if (suppressAutoDefaults) return;
    const frame = F.byId(F.FRAMES, sel.frameId);
    if (!frame) return;
    Object.assign(sel, F.recommendedComponentsForFrame(frame, sel.platformId));
  }

  const PLATFORM_OVERRIDE = {};
  const CATEGORY_DEFAULT_PLATFORM = { vtol: "vtol", fpv: "fpv", interceptor: "fpv", swarm: "fpv" };

  function defaultPlatformForProduct(p) {
    if (PLATFORM_OVERRIDE[p.id]) return PLATFORM_OVERRIDE[p.id];
    return CATEGORY_DEFAULT_PLATFORM[p.category] || "hexacopter";
  }

  const sel = {
    platformId: null,
    frameId: null,
    fpvStyleId: null,
    fpvSizeIn: null,
    motorId: null,
    propId: null,
    escId: null,
    batteryId: null,
    fcId: null,
    gpsId: null,
    videoId: null,
    cameraId: null,
    payloadId: F.PAYLOADS[0].id,
    protocol: F.COMMS_PROTOCOLS[0],
    receiverId: null,
    powerModuleId: null,
    becId: null,
    currentSensorId: null,
    antennaId: null,
    landingGearId: F.LANDING_GEAR[0].id,
    buzzerId: F.BUZZERS[0].id,
    ledId: F.LED_KITS[0].id,
    mountId: null,
  };

  function fillSelect(el, list, valueOf, labelOf, current) {
    el.innerHTML = list.map((item) => `<option value="${valueOf(item)}">${labelOf(item)}</option>`).join("");
    if (current && list.some((i) => valueOf(i) === current)) {
      el.value = current;
    } else if (list.length) {
      el.value = valueOf(list[0]);
    }
    return el.value;
  }

  const els = {
    platforms: document.getElementById("forge-platforms"),
    frame: document.getElementById("forge-frame"),
    frameField: document.getElementById("forge-frame-field"),
    fpvPicker: document.getElementById("forge-fpv-frame-picker"),
    fpvStyles: document.getElementById("forge-fpv-styles"),
    fpvSizes: document.getElementById("forge-fpv-sizes"),
    motor: document.getElementById("forge-motor"),
    prop: document.getElementById("forge-prop"),
    esc: document.getElementById("forge-esc"),
    battery: document.getElementById("forge-battery"),
    fc: document.getElementById("forge-fc"),
    gps: document.getElementById("forge-gps"),
    video: document.getElementById("forge-video"),
    camera: document.getElementById("forge-camera"),
    payload: document.getElementById("forge-payload"),
    payloadField: document.getElementById("forge-payload-field"),
    powerModule: document.getElementById("forge-power"),
    bec: document.getElementById("forge-bec"),
    currentSensor: document.getElementById("forge-current-sensor"),
    antenna: document.getElementById("forge-antenna"),
    landingGear: document.getElementById("forge-landing-gear"),
    buzzer: document.getElementById("forge-buzzer"),
    led: document.getElementById("forge-led"),
    mount: document.getElementById("forge-mount"),
    protocols: document.getElementById("forge-protocols"),
    receiver: document.getElementById("forge-receiver"),
    checks: document.getElementById("forge-checks"),
    status: document.getElementById("forge-status"),
    price: document.getElementById("forge-price"),
  };

  function renderPlatformCards() {
    els.platforms.innerHTML = F.PLATFORMS.map(
      (p) => `<div class="forge-option-card${p.id === sel.platformId ? " is-selected" : ""}" data-platform="${p.id}">${svg(p.id)}<span>${p.label}</span></div>`
    ).join("");
    els.platforms.querySelectorAll(".forge-option-card").forEach((card) => {
      card.addEventListener("click", () => {
        sel.platformId = card.dataset.platform;
        sel.frameId = null; // force re-default
        renderPlatformCards();
        renderFrame();
        renderStaticLists();
        recompute();
      });
    });
  }

  function renderFrame() {
    const platform = F.byId(F.PLATFORMS, sel.platformId);
    const isFpv = !!(platform && platform.hasFpvFramePicker);
    els.frameField.style.display = isFpv ? "none" : "";
    els.fpvPicker.style.display = isFpv ? "" : "none";

    if (isFpv) {
      if (!sel.fpvStyleId) sel.fpvStyleId = F.FPV_FRAME_STYLES[0].id;
      if (!sel.fpvSizeIn) sel.fpvSizeIn = 5;
      renderFpvStylePicker();
      renderFpvSizePicker();
      updateFpvFrameSelection();
    } else {
      const frames = platform ? platform.frameIds.map((id) => F.byId(F.FRAMES, id)) : F.FRAMES;
      sel.frameId = fillSelect(els.frame, frames, (f) => f.id, (f) => f.label, sel.frameId);
      applyFrameDefaults();
    }
    els.payloadField.style.display = platform && platform.hasPayload ? "" : "none";
  }

  function renderFpvStylePicker() {
    els.fpvStyles.innerHTML = F.FPV_FRAME_STYLES.map(
      (s) => `<div class="forge-option-card${s.id === sel.fpvStyleId ? " is-selected" : ""}" data-style="${s.id}" title="${window.escapeHtml(s.desc)}">${fpvStyleSvg(s.id)}<span>${s.label}</span></div>`
    ).join("");
    els.fpvStyles.querySelectorAll(".forge-option-card").forEach((card) => {
      card.addEventListener("click", () => {
        sel.fpvStyleId = card.dataset.style;
        renderFpvStylePicker();
        updateFpvFrameSelection();
        renderStaticLists();
        recompute();
      });
    });
  }

  function renderFpvSizePicker() {
    const sizes = F.FPV_FRAME_SIZES;
    const currentIndex = Math.max(0, sizes.indexOf(sel.fpvSizeIn));
    window.SentinelSlider.mount(els.fpvSizes, {
      min: 0,
      max: sizes.length - 1,
      step: 1,
      value: currentIndex,
      label: "Frame Size",
      format: (idx) => sizes[idx] + "″",
      ticks: sizes.map((size, idx) => ({ value: idx, label: size + "″" })),
      onChange: (idx) => {
        sel.fpvSizeIn = sizes[idx];
        updateFpvFrameSelection();
        renderStaticLists();
        recompute();
      },
    });
  }

  function updateFpvFrameSelection() {
    sel.frameId = F.fpvFrameId(sel.fpvStyleId, sel.fpvSizeIn);
    const frame = F.byId(F.FRAMES, sel.frameId);
    if (!frame) return;
    document.getElementById("fpv-size").textContent = frame.sizeIn + "″";
    document.getElementById("fpv-weight").textContent = "~" + frame.baseWeightG + " g";
    document.getElementById("fpv-motors").textContent = frame.motorCount;
    document.getElementById("fpv-prop").textContent = frame.maxPropIn + "″ or smaller";
    applyFrameDefaults();
  }

  function renderStaticLists() {
    sel.motorId = fillSelect(els.motor, F.MOTORS, (m) => m.id, (m) => `${m.label} · ${m.kv}KV`, sel.motorId);
    sel.propId = fillSelect(els.prop, F.PROPELLERS, (p) => p.id, (p) => p.label, sel.propId);
    sel.escId = fillSelect(els.esc, F.ESCS, (e) => e.id, (e) => `${e.label} (${e.currentA}A)`, sel.escId);
    sel.batteryId = fillSelect(els.battery, F.BATTERIES, (b) => b.id, (b) => b.label, sel.batteryId);
    sel.fcId = fillSelect(els.fc, F.FLIGHT_CONTROLLERS, (f) => f.id, (f) => f.label, sel.fcId);
    sel.gpsId = fillSelect(els.gps, F.GPS_OPTIONS, (g) => g.id, (g) => g.label, sel.gpsId);
    sel.videoId = fillSelect(els.video, F.VIDEO_SYSTEMS, (v) => v.id, (v) => v.label, sel.videoId);
    sel.cameraId = fillSelect(els.camera, F.CAMERAS, (c) => c.id, (c) => c.label, sel.cameraId);
    sel.payloadId = fillSelect(els.payload, F.PAYLOADS, (p) => p.id, (p) => p.label, sel.payloadId);
    sel.receiverId = fillSelect(els.receiver, F.RECEIVERS, (r) => r.id, (r) => `${r.label} (${r.protocol})`, sel.receiverId);
    sel.powerModuleId = fillSelect(els.powerModule, F.POWER_MODULES, (p) => p.id, (p) => p.label, sel.powerModuleId);
    sel.becId = fillSelect(els.bec, F.BEC_MODULES, (b) => b.id, (b) => b.label, sel.becId);
    sel.currentSensorId = fillSelect(els.currentSensor, F.CURRENT_SENSORS, (c) => c.id, (c) => c.label, sel.currentSensorId);
    sel.antennaId = fillSelect(els.antenna, F.ANTENNAS, (a) => a.id, (a) => a.label, sel.antennaId);
    sel.landingGearId = fillSelect(els.landingGear, F.LANDING_GEAR, (l) => l.id, (l) => l.label, sel.landingGearId);
    sel.buzzerId = fillSelect(els.buzzer, F.BUZZERS, (b) => b.id, (b) => b.label, sel.buzzerId);
    sel.ledId = fillSelect(els.led, F.LED_KITS, (l) => l.id, (l) => l.label, sel.ledId);
    sel.mountId = fillSelect(els.mount, F.BATTERY_MOUNTING, (m) => m.id, (m) => m.label, sel.mountId);
  }

  function renderProtocolPills() {
    els.protocols.innerHTML = F.COMMS_PROTOCOLS.map(
      (proto) => `<button type="button" class="forge-pill${proto === sel.protocol ? " is-selected" : ""}" data-protocol="${proto}">${proto}</button>`
    ).join("");
    els.protocols.querySelectorAll(".forge-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        sel.protocol = btn.dataset.protocol;
        const match = F.RECEIVERS.find((r) => r.protocol === sel.protocol);
        if (match) { sel.receiverId = match.id; els.receiver.value = match.id; }
        renderProtocolPills();
        recompute();
      });
    });
  }

  function statusIcon(status) {
    return status === "ok" ? "✓" : status === "check" ? "⚠" : "✕";
  }
  function statusIconClass(status) {
    return status === "ok" ? "check-icon--ok" : status === "check" ? "check-icon--check" : "check-icon--bad";
  }

  function readSelections() {
    const platform = F.byId(F.PLATFORMS, sel.platformId);
    if (!(platform && platform.hasFpvFramePicker)) {
      sel.frameId = els.frame.value;
    }
    sel.motorId = els.motor.value;
    sel.propId = els.prop.value;
    sel.escId = els.esc.value;
    sel.batteryId = els.battery.value;
    sel.fcId = els.fc.value;
    sel.gpsId = els.gps.value;
    sel.videoId = els.video.value;
    sel.cameraId = els.camera.value;
    sel.payloadId = els.payload.value;
    sel.receiverId = els.receiver.value;
    sel.powerModuleId = els.powerModule.value;
    sel.becId = els.bec.value;
    sel.currentSensorId = els.currentSensor.value;
    sel.antennaId = els.antenna.value;
    sel.landingGearId = els.landingGear.value;
    sel.buzzerId = els.buzzer.value;
    sel.ledId = els.led.value;
    sel.mountId = els.mount.value;
  }

  let lastResult = null;

  function recompute() {
    readSelections();
    const result = F.computeConfiguration(sel);
    lastResult = result;

    els.checks.innerHTML = result.checks
      .map(
        (c) => `<div class="check-item">
          <div class="check-icon ${statusIconClass(c.status)}">${statusIcon(c.status)}</div>
          <div>
            <div class="check-item__label">${window.escapeHtml(c.label)} — ${F.STATUS_LABEL[c.status].text}</div>
            <div class="check-item__detail">${window.escapeHtml(c.detail)}</div>
            ${c.fix ? `<div class="check-item__fix">Suggested fix: ${window.escapeHtml(c.fix)}</div>` : ""}
          </div>
        </div>`
      )
      .join("");

    const st = result.overallStatus;
    els.status.innerHTML = `<div class="check-icon ${statusIconClass(st)}">${statusIcon(st)}</div><span>${F.STATUS_LABEL[st].text}</span>`;
    els.price.textContent = window.formatINR(result.totalPriceINR);

    document.getElementById("est-weight").textContent = result.estimatedWeightG + " g";
    document.getElementById("est-payload").textContent = result.estimatedPayloadHeadroomG + " g";
    document.getElementById("est-endurance").textContent = result.estimatedEnduranceMin + " min";
    document.getElementById("est-speed").textContent = result.estimatedTopSpeedKmh + " km/h";
    document.getElementById("est-range").textContent = result.estimatedRangeKm + " km";
    document.getElementById("est-motors").textContent = result.motorCount;
  }

  function buildConfigLabel() {
    const p = lastResult.parts;
    const platform = F.byId(F.PLATFORMS, sel.platformId);
    return [platform && platform.label, p.frame && p.frame.label, p.motor && p.motor.label, p.battery && p.battery.label, sel.protocol]
      .filter(Boolean)
      .join(" · ");
  }

  function wireActions() {
    document.getElementById("forge-save").addEventListener("click", (e) => {
      try {
        const saved = JSON.parse(localStorage.getItem("sentinelSavedConfigs.v1") || "[]");
        saved.push({ savedAt: Date.now(), selection: Object.assign({}, sel), configLabel: buildConfigLabel(), totalPriceINR: lastResult.totalPriceINR });
        localStorage.setItem("sentinelSavedConfigs.v1", JSON.stringify(saved));
      } catch (err) { /* storage unavailable */ }
      const btn = e.currentTarget;
      const original = btn.textContent;
      btn.textContent = "Saved ✓";
      setTimeout(() => { btn.textContent = original; }, 1300);
    });

    document.getElementById("forge-add-cart").addEventListener("click", (e) => {
      window.SentinelCart.addItem({
        productId: null,
        name: (F.byId(F.PLATFORMS, sel.platformId) || {}).label + " Custom Build",
        config: Object.assign({}, sel),
        configLabel: buildConfigLabel(),
        unitPriceINR: lastResult.totalPriceINR,
      });
      const btn = e.currentTarget;
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(() => { btn.textContent = original; }, 1300);
    });

    document.getElementById("forge-buy-now").addEventListener("click", () => {
      try {
        localStorage.setItem(
          "sentinelBuyNowItem.v1",
          JSON.stringify({
            name: (F.byId(F.PLATFORMS, sel.platformId) || {}).label + " Custom Build",
            configLabel: buildConfigLabel(),
            unitPriceINR: lastResult.totalPriceINR,
            qty: 1,
          })
        );
      } catch (err) { /* storage unavailable */ }
      window.location.href = "procurement.html?buyNow=forge";
    });
  }

  /* ---------------- Mission Profile: guided recommendation ---------------- */
  const MISSION_QUESTIONS = {
    mission: {
      el: "forge-q-mission",
      options: [
        { id: "isr", label: "Surveillance & ISR" },
        { id: "strike", label: "Precision Strike" },
        { id: "counter-uas", label: "Counter-UAS Defense" },
        { id: "logistics", label: "Logistics & Resupply" },
        { id: "training", label: "Training / Recreational" },
      ],
    },
    environment: {
      el: "forge-q-environment",
      options: [
        { id: "urban", label: "Urban / Close-Quarters" },
        { id: "rural", label: "Open Field / Rural" },
        { id: "maritime", label: "Maritime / Coastal" },
        { id: "mountain", label: "High-Altitude / Mountain" },
      ],
    },
    experience: {
      el: "forge-q-experience",
      options: [
        { id: "novice", label: "Novice" },
        { id: "intermediate", label: "Intermediate" },
        { id: "expert", label: "Expert" },
      ],
    },
    budget: {
      el: "forge-q-budget",
      options: [
        { id: "low", label: "Under ₹1L" },
        { id: "mid", label: "₹1L – ₹10L" },
        { id: "high", label: "₹10L – ₹50L" },
        { id: "premium", label: "Above ₹50L" },
      ],
    },
  };

  const mission = { mission: null, environment: null, experience: null, budget: null };

  function renderMissionQuestions() {
    Object.keys(MISSION_QUESTIONS).forEach((key) => {
      const q = MISSION_QUESTIONS[key];
      const el = document.getElementById(q.el);

      if (key === "budget") {
        const currentIndex = Math.max(0, q.options.findIndex((o) => o.id === mission.budget));
        if (!mission.budget) mission.budget = q.options[0].id;
        window.SentinelSlider.mount(el, {
          min: 0,
          max: q.options.length - 1,
          step: 1,
          value: currentIndex,
          label: "Budget Range",
          format: (idx) => q.options[idx].label,
          ticks: q.options.map((o, idx) => ({ value: idx, label: o.label })),
          onChange: (idx) => { mission.budget = q.options[idx].id; },
        });
        return;
      }

      el.innerHTML = q.options
        .map((o) => `<button type="button" class="forge-pill${mission[key] === o.id ? " is-selected" : ""}" data-value="${o.id}">${o.label}</button>`)
        .join("");
      el.querySelectorAll(".forge-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          mission[key] = btn.dataset.value;
          renderMissionQuestions();
        });
      });
    });
  }

  function recommendPlatform() {
    if (mission.mission === "counter-uas") {
      return { platformId: "interceptor", reason: "Counter-UAS defense calls for a fast, dedicated interceptor airframe built to close on and neutralize hostile drones." };
    }
    if (mission.mission === "logistics") {
      return { platformId: "octacopter", reason: "Logistics and resupply work needs the lift capacity and redundancy of a heavy-class multirotor." };
    }
    if (mission.mission === "isr" && mission.environment === "maritime") {
      return { platformId: "fixed-wing", reason: "Maritime ISR favors the range and fuel-efficient endurance of a fixed-wing platform over open water." };
    }
    if (mission.mission === "isr" && mission.environment === "mountain") {
      return { platformId: "vtol", reason: "High-altitude ISR benefits from VTOL's runway-free deployment combined with fixed-wing-class endurance." };
    }
    if (mission.mission === "isr") {
      return { platformId: "hexacopter", reason: "General-purpose ISR is well served by a stable, sensor-friendly hexacopter platform." };
    }
    if (mission.mission === "strike") {
      return { platformId: "fpv", reason: "Precision strike missions are best served by a fast, agile FPV build sized to the target profile." };
    }
    if (mission.mission === "training") {
      return { platformId: "hexacopter", reason: "A hexacopter's stability and motor redundancy make it a forgiving platform for building team proficiency." };
    }
    return { platformId: "fpv", reason: "Without a specific mission selected, a balanced FPV build is a solid general-purpose starting point." };
  }

  function wireMissionProfile() {
    renderMissionQuestions();

    document.getElementById("forge-get-recommendation").addEventListener("click", () => {
      const rec = recommendPlatform();
      const platform = F.byId(F.PLATFORMS, rec.platformId);
      let reason = rec.reason;
      if (mission.experience === "novice") reason += " Novice teams should also lean on the compatibility report before finalizing a build.";
      if (mission.budget === "low") reason += " A lower budget points toward smaller frame sizes and simpler electronics.";
      if (mission.budget === "premium") reason += " A larger budget opens up heavier payloads and redundant electronics.";

      document.getElementById("forge-rec-title").textContent = platform ? platform.label : rec.platformId;
      document.getElementById("forge-rec-reason").textContent = reason;
      document.getElementById("forge-recommendation").style.display = "";
    });

    document.getElementById("forge-use-recommendation").addEventListener("click", () => {
      const rec = recommendPlatform();
      sel.platformId = rec.platformId;
      sel.frameId = null;
      renderPlatformCards();
      renderFrame();
      renderStaticLists();
      recompute();
      document.getElementById("forge-platforms").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function init() {
    const params = new URLSearchParams(window.location.search);
    const restoreId = params.get("restore");
    let restored = false;
    if (restoreId && window.SentinelCart) {
      const cart = window.SentinelCart.readCart();
      const item = cart.find((i) => i.cartItemId === restoreId);
      if (item && item.config) {
        Object.assign(sel, item.config);
        restored = true;
      }
    }

    const productId = params.get("product");
    if (!restored && productId) {
      const product = (window.SENTINEL_PRODUCTS || []).find((p) => p.id === productId);
      if (product) sel.platformId = defaultPlatformForProduct(product);
    }
    if (!sel.platformId) sel.platformId = F.PLATFORMS[0].id;

    // A restored saved build keeps its own exact part selections — don't
    // let the frame-driven auto-defaults below overwrite them on load.
    suppressAutoDefaults = restored;
    renderPlatformCards();
    renderFrame();
    renderStaticLists();
    renderProtocolPills();
    recompute();
    wireActions();
    wireMissionProfile();
    suppressAutoDefaults = false;

    els.frame.addEventListener("change", () => {
      sel.frameId = els.frame.value;
      applyFrameDefaults();
      renderStaticLists();
      recompute();
    });

    [
      els.motor, els.prop, els.esc, els.battery, els.fc, els.gps, els.video, els.camera, els.payload, els.receiver,
      els.powerModule, els.bec, els.currentSensor, els.antenna, els.landingGear, els.buzzer, els.led, els.mount,
    ].forEach((el) => {
      el.addEventListener("change", recompute);
    });
  }

  init();
})();
