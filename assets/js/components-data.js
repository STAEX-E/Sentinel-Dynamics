/* ============================================================
   Sentinel Dynamics — FORGE LAB component catalog + compatibility engine
   Pure data + pure functions. No DOM access here — forge-lab.js
   consumes this to render the configurator UI.
   ============================================================ */

(function () {
  "use strict";

  const PLATFORMS = [
    { id: "fixed-wing", label: "Fixed Wing", frameIds: ["fw-1200", "fw-1800"], hasPayload: true },
    { id: "vtol", label: "VTOL", frameIds: ["vt-compact", "vt-extended"], hasPayload: true },
    { id: "fpv", label: "FPV", frameIds: [], hasPayload: false, hasFpvFramePicker: true },
    { id: "cinelifter", label: "Cinelifter", frameIds: ["cl-10", "cl-13"], hasPayload: true },
    { id: "hexacopter", label: "Hexacopter", frameIds: ["hx-15", "hx-18"], hasPayload: true },
    { id: "octacopter", label: "Octacopter", frameIds: ["oc-20", "oc-24"], hasPayload: true },
    { id: "interceptor", label: "Interceptor", frameIds: ["int-6", "int-7"], hasPayload: false },
  ];

  const FRAMES = [
    { id: "fw-1200", label: "FW-1200 Wing (1200mm)", style: "Fixed Wing", sizeIn: null, motorCount: 1, maxPropIn: 11, baseWeightG: 900, weightBudgetG: 1800, recommendedS: [4, 6], priceINR: 45000 },
    { id: "fw-1800", label: "FW-1800 Wing (1800mm)", style: "Fixed Wing", sizeIn: null, motorCount: 1, maxPropIn: 13, baseWeightG: 1600, weightBudgetG: 3200, recommendedS: [6, 8], priceINR: 78000 },
    { id: "vt-compact", label: "VT-Compact VTOL Frame", style: "VTOL", sizeIn: null, motorCount: 5, maxPropIn: 10, baseWeightG: 1400, weightBudgetG: 2600, recommendedS: [6, 8], priceINR: 95000 },
    { id: "vt-extended", label: "VT-Extended VTOL Frame", style: "VTOL", sizeIn: null, motorCount: 5, maxPropIn: 13, baseWeightG: 2200, weightBudgetG: 7400, recommendedS: [8, 12], priceINR: 165000 },
    { id: "cl-10", label: "CL-10 Cinelifter Frame", style: "Long X", sizeIn: 10, motorCount: 4, maxPropIn: 10, baseWeightG: 1100, weightBudgetG: 2400, recommendedS: [6, 8], priceINR: 52000 },
    { id: "cl-13", label: "CL-13 Cinelifter Frame", style: "H-Frame", sizeIn: 13, motorCount: 6, maxPropIn: 13, baseWeightG: 1800, weightBudgetG: 6200, recommendedS: [8, 10], priceINR: 88000 },
    { id: "hx-15", label: "HX-15 Hexacopter Frame", style: "Straight X", sizeIn: 15, motorCount: 6, maxPropIn: 15, baseWeightG: 1700, weightBudgetG: 6200, recommendedS: [8, 10], priceINR: 72000 },
    { id: "hx-18", label: "HX-18 Hexacopter Frame", style: "Straight X", sizeIn: 18, motorCount: 6, maxPropIn: 18, baseWeightG: 2500, weightBudgetG: 9000, recommendedS: [10, 12], priceINR: 118000 },
    { id: "oc-20", label: "OC-20 Octacopter Frame", style: "H-Frame", sizeIn: 20, motorCount: 8, maxPropIn: 20, baseWeightG: 3600, weightBudgetG: 11200, recommendedS: [10, 12], priceINR: 185000 },
    { id: "oc-24", label: "OC-24 Octacopter Frame", style: "H-Frame", sizeIn: 24, motorCount: 8, maxPropIn: 24, baseWeightG: 5200, weightBudgetG: 15700, recommendedS: [12, 14], priceINR: 265000 },
    { id: "int-6", label: "INT-6 Interceptor Frame", style: "Deadcat", sizeIn: 6, motorCount: 4, maxPropIn: 6, baseWeightG: 140, weightBudgetG: 950, recommendedS: [6, 6], priceINR: 22000 },
    { id: "int-7", label: "INT-7 Interceptor Frame", style: "Deadcat", sizeIn: 7, motorCount: 4, maxPropIn: 7, baseWeightG: 190, weightBudgetG: 1050, recommendedS: [6, 6], priceINR: 28000 },
  ];

  /* ---------------- FPV Frames: style + size component library ----------------
     Practical frame library covering the standard FPV frame styles across the
     standard size chart. Weight/price are approximate, size-scaled figures. */
  const FPV_FRAME_STYLES = [
    { id: "true-x", label: "True X", desc: "Symmetric X arms with equal spacing — balanced, predictable freestyle handling.", weightFactor: 1.0 },
    { id: "straight-x", label: "Straight X", desc: "Flat X arm mount with a wide, unobstructed camera view — the standard racing layout.", weightFactor: 0.95 },
    { id: "deadcat", label: "Deadcat", desc: "Front arms swept forward to keep props out of the camera's field of view.", weightFactor: 1.05 },
    { id: "stretch-x", label: "Stretch X", desc: "Elongated wheelbase with a shorter front and longer rear for smooth, stable flight.", weightFactor: 1.15 },
    { id: "long-x", label: "Long X", desc: "Extended arms with extra deck space for long-range batteries and antennas.", weightFactor: 1.2 },
    { id: "h-frame", label: "H-Frame", desc: "Parallel side rails in an H layout — simple, rigid and easy to repair.", weightFactor: 1.1 },
    { id: "cinewhoop", label: "Cinewhoop", desc: "Ducted props for safe, stable close-proximity and indoor cinematic flying.", weightFactor: 1.3 },
  ];
  const FPV_FRAME_SIZES = [2, 3, 3.5, 4, 5, 6, 7, 8];

  function fpvFrameId(styleId, sizeIn) {
    return "fpv-" + styleId + "-" + String(sizeIn).replace(".", "p");
  }
  function buildFpvFrame(style, sizeIn) {
    const weightG = Math.round((16 + sizeIn * sizeIn * 3.1) * style.weightFactor);
    const priceINR = Math.round(((850 + sizeIn * sizeIn * 55) * (0.9 + style.weightFactor * 0.2)) / 10) * 10;
    return {
      id: fpvFrameId(style.id, sizeIn),
      label: `${style.label} ${sizeIn}″`,
      style: style.label,
      styleId: style.id,
      sizeIn,
      motorCount: 4,
      maxPropIn: sizeIn,
      baseWeightG: weightG,
      // A real avionics + battery stack (FC, GPS, video, camera, receiver,
      // power module, and a frame-matched battery) adds a fairly constant
      // ~250-350g overhead on top of the airframe itself, which dwarfs a
      // small frame's own weight — so the budget needs a much bigger
      // multiplier than the frame's structural weight alone would suggest.
      weightBudgetG: Math.round(weightG * 14),
      recommendedS: sizeIn <= 3.5 ? [2, 4] : sizeIn <= 5 ? [4, 6] : [6, 6],
      priceINR,
    };
  }
  const FPV_FRAMES = FPV_FRAME_STYLES.reduce((all, style) => all.concat(FPV_FRAME_SIZES.map((size) => buildFpvFrame(style, size))), []);
  FRAMES.push.apply(FRAMES, FPV_FRAMES);
  byId(PLATFORMS, "fpv").frameIds = FPV_FRAMES.map((f) => f.id);

  const MOTORS = [
    { id: "m-1404", label: "M-1404 Micro", kv: 3800, recommendedS: [4, 6], typicalPropIn: 5, maxCurrentA: 20, weightG: 11, priceINR: 850 },
    { id: "m-2306", label: "M-2306 Mini", kv: 2400, recommendedS: [4, 6], typicalPropIn: 6, maxCurrentA: 28, weightG: 32, priceINR: 1400 },
    { id: "m-2807", label: "M-2807 Standard", kv: 1300, recommendedS: [6, 8], typicalPropIn: 9, maxCurrentA: 35, weightG: 68, priceINR: 2600 },
    { id: "m-3510", label: "M-3510 Heavy", kv: 700, recommendedS: [8, 12], typicalPropIn: 13, maxCurrentA: 45, weightG: 145, priceINR: 5200 },
    { id: "m-4014", label: "M-4014 X-Heavy", kv: 400, recommendedS: [10, 14], typicalPropIn: 20, maxCurrentA: 60, weightG: 210, priceINR: 8400 },
  ];

  const PROPELLERS = [
    { id: "p-2x2", label: "2x2 (Micro Whoop)", sizeIn: 2, pitchIn: 2, weightG: 1, priceINR: 60 },
    { id: "p-3x3", label: "3x3 (Micro Whoop)", sizeIn: 3, pitchIn: 3, weightG: 2, priceINR: 80 },
    { id: "p-4x4", label: "4x4 (Micro Whoop)", sizeIn: 4, pitchIn: 4, weightG: 3, priceINR: 100 },
    { id: "p-5x4.3", label: "5x4.3", sizeIn: 5, pitchIn: 4.3, weightG: 5, priceINR: 150 },
    { id: "p-7x4", label: "7x4", sizeIn: 7, pitchIn: 4, weightG: 9, priceINR: 220 },
    { id: "p-10x4.5", label: "10x4.5", sizeIn: 10, pitchIn: 4.5, weightG: 18, priceINR: 380 },
    { id: "p-11x5.5", label: "11x5.5 (Fixed-Wing)", sizeIn: 11, pitchIn: 5.5, weightG: 22, priceINR: 420 },
    { id: "p-13x4.5", label: "13x4.5", sizeIn: 13, pitchIn: 4.5, weightG: 32, priceINR: 650 },
    { id: "p-13x6.5", label: "13x6.5 (Fixed-Wing)", sizeIn: 13, pitchIn: 6.5, weightG: 38, priceINR: 680 },
    { id: "p-15x5", label: "15x5", sizeIn: 15, pitchIn: 5, weightG: 48, priceINR: 920 },
    { id: "p-18x6.1", label: "18x6.1", sizeIn: 18, pitchIn: 6.1, weightG: 85, priceINR: 1650 },
    { id: "p-24x7.9", label: "24x7.9", sizeIn: 24, pitchIn: 7.9, weightG: 180, priceINR: 3200 },
  ];

  const ESCS = [
    { id: "esc-30a", label: "ESC-30A", currentA: 30, compatibleS: [4, 6], weightG: 6, priceINR: 900 },
    { id: "esc-45a", label: "ESC-45A", currentA: 45, compatibleS: [6, 8], weightG: 12, priceINR: 1600 },
    { id: "esc-60a", label: "ESC-60A", currentA: 60, compatibleS: [6, 10], weightG: 22, priceINR: 2400 },
    { id: "esc-80a", label: "ESC-80A", currentA: 80, compatibleS: [8, 12], weightG: 38, priceINR: 3800 },
    { id: "esc-120a", label: "ESC-120A", currentA: 120, compatibleS: [10, 14], weightG: 65, priceINR: 6200 },
  ];

  const BATTERIES = [
    { id: "bat-2s-650", label: "2S 650mAh", s: 2, mah: 650, connector: "PH2.0", weightG: 38, priceINR: 450 },
    { id: "bat-3s-1300", label: "3S 1,300mAh", s: 3, mah: 1300, connector: "XT30", weightG: 105, priceINR: 850 },
    { id: "bat-4s-2200", label: "4S 2,200mAh", s: 4, mah: 2200, connector: "XT30", weightG: 240, priceINR: 1800 },
    { id: "bat-5s-1800", label: "5S 1,800mAh", s: 5, mah: 1800, connector: "XT60", weightG: 260, priceINR: 2100 },
    { id: "bat-6s-2500", label: "6S 2,500mAh", s: 6, mah: 2500, connector: "XT60", weightG: 340, priceINR: 2600 },
    { id: "bat-6s-5200", label: "6S 5,200mAh", s: 6, mah: 5200, connector: "XT60", weightG: 680, priceINR: 4400 },
    { id: "bat-8s-10200", label: "8S 10,200mAh", s: 8, mah: 10200, connector: "XT90", weightG: 1850, priceINR: 9800 },
    { id: "bat-10s-12000", label: "10S 12,000mAh", s: 10, mah: 12000, connector: "XT90", weightG: 2600, priceINR: 14500 },
    { id: "bat-12s-16000", label: "12S 16,000mAh", s: 12, mah: 16000, connector: "AS150", weightG: 3800, priceINR: 21000 },
  ];

  /* ---------------- Additional practical component library ---------------- */
  const POWER_MODULES = [
    { id: "pm-standard", label: "Power Module — Standard (90A)", maxCurrentA: 90, weightG: 9, priceINR: 650 },
    { id: "pm-highcurrent", label: "Power Module — High Current (180A)", maxCurrentA: 180, weightG: 14, priceINR: 1200 },
  ];
  const BEC_MODULES = [
    { id: "bec-5v", label: "BEC — 5V / 2A", outputV: 5, weightG: 3, priceINR: 250 },
    { id: "bec-9v", label: "BEC — 9V / 3A (Digital VTX)", outputV: 9, weightG: 4, priceINR: 320 },
    { id: "bec-12v", label: "BEC — 12V / 5A", outputV: 12, weightG: 6, priceINR: 450 },
  ];
  const CURRENT_SENSORS = [
    { id: "cs-90a", label: "Current Sensor — 90A", maxCurrentA: 90, weightG: 2, priceINR: 300 },
    { id: "cs-180a", label: "Current Sensor — 180A", maxCurrentA: 180, weightG: 3, priceINR: 480 },
  ];
  const ANTENNAS = [
    { id: "ant-stubby", label: "Stubby Antenna (Analog)", compatibleVideo: ["vid-analog"], weightG: 3, priceINR: 350 },
    { id: "ant-dipole", label: "Dipole Antenna (Digital)", compatibleVideo: ["vid-digital-hd", "vid-encrypted"], weightG: 4, priceINR: 550 },
    { id: "ant-directional", label: "Directional Patch Antenna (Long-Range)", compatibleVideo: ["vid-digital-hd", "vid-encrypted"], weightG: 22, priceINR: 2200 },
  ];
  const LANDING_GEAR = [
    { id: "lg-none", label: "None — Belly Landing", weightG: 0, priceINR: 0 },
    { id: "lg-fixed-skid", label: "Fixed Skid Legs", weightG: 40, priceINR: 900 },
    { id: "lg-retractable", label: "Retractable Landing Gear", weightG: 150, priceINR: 6200 },
  ];
  const BUZZERS = [
    { id: "bz-none", label: "None", weightG: 0, priceINR: 0 },
    { id: "bz-standard", label: "Lost-Model Buzzer + LED", weightG: 2, priceINR: 180 },
  ];
  const LED_KITS = [
    { id: "led-none", label: "None", weightG: 0, priceINR: 0 },
    { id: "led-orientation", label: "Orientation LED Strip", weightG: 6, priceINR: 420 },
    { id: "led-nav", label: "Nav / Position Light Kit", weightG: 12, priceINR: 950 },
  ];
  const BATTERY_MOUNTING = [
    { id: "mount-strap", label: "Velcro Strap Mount", weightG: 3, priceINR: 90 },
    { id: "mount-tray-lock", label: "Locking Tray Mount", weightG: 14, priceINR: 480 },
    { id: "mount-internal-bay", label: "Internal Battery Bay", weightG: 22, priceINR: 850 },
  ];

  const FLIGHT_CONTROLLERS = [
    { id: "fc-f405", label: "FC-F405", weightG: 8, priceINR: 2200 },
    { id: "fc-f7-hd", label: "FC-F7 HD", weightG: 10, priceINR: 3600 },
    { id: "fc-h743", label: "FC-H743 Heavy", weightG: 14, priceINR: 5800 },
  ];

  const GPS_OPTIONS = [
    { id: "gps-m8n", label: "GPS-M8N", weightG: 14, priceINR: 1200 },
    { id: "gps-m10-rtk", label: "GPS-M10 RTK", weightG: 18, priceINR: 4800 },
    { id: "nav-ins-backup", label: "INS Backup Nav (GPS-Denied)", weightG: 26, priceINR: 9500 },
  ];

  const RECEIVERS = [
    { id: "rx-elrs", label: "RX-ELRS", protocol: "ELRS", weightG: 2, priceINR: 900 },
    { id: "rx-sbus", label: "RX-SBUS", protocol: "SBUS", weightG: 3, priceINR: 650 },
    { id: "rx-ppm", label: "RX-PPM", protocol: "PPM", weightG: 3, priceINR: 450 },
    { id: "rx-pwm", label: "RX-PWM", protocol: "PWM", weightG: 4, priceINR: 400 },
  ];

  const COMMS_PROTOCOLS = ["ELRS", "SBUS", "PPM", "PWM"];

  const VIDEO_SYSTEMS = [
    { id: "vid-analog", label: "Analog FPV", weightG: 12, priceINR: 1400 },
    { id: "vid-digital-hd", label: "Digital HD", weightG: 38, priceINR: 6800 },
    { id: "vid-encrypted", label: "Encrypted Digital", weightG: 52, priceINR: 12500 },
  ];

  const CAMERAS = [
    { id: "cam-standard", label: "Standard FPV Camera", weightG: 8, priceINR: 1800 },
    { id: "cam-eo-ir", label: "EO/IR Camera", weightG: 180, priceINR: 24500 },
    { id: "cam-thermal", label: "Thermal Camera", weightG: 220, priceINR: 38500 },
  ];

  const PAYLOADS = [
    { id: "pay-none", label: "None", weightG: 0, priceINR: 0 },
    { id: "pay-sensor-pod", label: "Sensor Pod", weightG: 350, priceINR: 18500 },
    { id: "pay-cargo-small", label: "Small Cargo Module", weightG: 2000, priceINR: 8500 },
    { id: "pay-cargo-large", label: "Large Cargo Module", weightG: 6000, priceINR: 22000 },
  ];

  function byId(list, id) {
    return list.find((x) => x.id === id) || null;
  }

  function pickClosestInRange(list, getRange, target) {
    let best = null;
    let bestDist = Infinity;
    list.forEach((item) => {
      const [lo, hi] = getRange(item);
      const dist = target < lo ? lo - target : target > hi ? target - hi : 0;
      if (dist < bestDist) {
        bestDist = dist;
        best = item;
      }
    });
    return best;
  }

  /**
   * Given a chosen frame (and platform), pick a sensible default propulsion
   * chain — battery, motor, ESC, propeller — sized to that frame, so the
   * configurator's electronics track the selected frame instead of holding
   * over whatever was previously selected.
   */
  function recommendedComponentsForFrame(frame, platformId) {
    if (!frame) return {};
    const sMid = Math.round((frame.recommendedS[0] + frame.recommendedS[1]) / 2);

    const battery = pickClosestInRange(BATTERIES, (b) => [b.s, b.s], sMid);
    const targetS = battery ? battery.s : sMid;

    // Motor: favor one whose recommended battery range covers the chosen
    // battery, then break ties (or near-ties) toward the motor whose typical
    // prop size best matches this frame — so a 20-inch octo doesn't land on
    // the same micro motor as a 2-inch whoop just because both tolerate the
    // same voltage.
    const motor = MOTORS.reduce((best, m) => {
      const [lo, hi] = m.recommendedS;
      const sDist = targetS < lo ? lo - targetS : targetS > hi ? targetS - hi : 0;
      const propDist = Math.abs((m.typicalPropIn || 10) - frame.maxPropIn);
      const score = sDist * 50 + propDist;
      if (!best || score < best.score) return { part: m, score };
      return best;
    }, null);

    const isFixedWing = platformId === "fixed-wing";
    const propCandidates = PROPELLERS.filter((p) => /Fixed-Wing/.test(p.label) === isFixedWing);
    const propSource = propCandidates.length ? propCandidates : PROPELLERS;
    const propWithinBudget = propSource.filter((p) => p.sizeIn <= frame.maxPropIn);
    const prop = propWithinBudget.length
      ? propWithinBudget.reduce((best, p) => (p.sizeIn > best.sizeIn ? p : best))
      : propSource.reduce((best, p) => (p.sizeIn < best.sizeIn ? p : best));

    const motorPart = motor ? motor.part : null;
    let esc = null;
    if (battery && motorPart) {
      const escCompatible = ESCS.filter((e) => e.compatibleS[0] <= battery.s && battery.s <= e.compatibleS[1]);
      if (escCompatible.length) {
        const sorted = escCompatible.slice().sort((a, b) => a.currentA - b.currentA);
        esc =
          sorted.find((e) => e.currentA >= motorPart.maxCurrentA * 1.15) ||
          sorted.find((e) => e.currentA >= motorPart.maxCurrentA) ||
          sorted[sorted.length - 1];
      } else {
        // No ESC's voltage rating covers this battery (e.g. a 2S/3S whoop
        // build) — fall back to whichever ESC's range sits closest to it,
        // rather than defaulting to the largest one in the catalog.
        esc = pickClosestInRange(ESCS, (e) => e.compatibleS, battery.s);
      }
    }

    return {
      batteryId: battery ? battery.id : null,
      motorId: motorPart ? motorPart.id : null,
      propId: prop ? prop.id : null,
      escId: esc ? esc.id : null,
    };
  }

  function rangeStatus(value, range, softMargin) {
    if (value >= range[0] && value <= range[1]) return "ok";
    if (value >= range[0] - softMargin && value <= range[1] + softMargin) return "check";
    return "bad";
  }

  const STATUS_RANK = { bad: 2, check: 1, ok: 0 };
  const STATUS_LABEL = {
    ok: { icon: "✓", text: "Compatible" },
    check: { icon: "⚠", text: "Check Configuration" },
    bad: { icon: "✕", text: "Incompatible" },
  };

  /**
   * Evaluate a full Forge Lab selection and return compatibility checks,
   * pricing, and simplified/estimated performance figures.
   * All performance numbers are explicitly illustrative estimates.
   */
  function computeConfiguration(sel) {
    const frame = byId(FRAMES, sel.frameId);
    const motor = byId(MOTORS, sel.motorId);
    const prop = byId(PROPELLERS, sel.propId);
    const esc = byId(ESCS, sel.escId);
    const battery = byId(BATTERIES, sel.batteryId);
    const fc = byId(FLIGHT_CONTROLLERS, sel.fcId);
    const gps = byId(GPS_OPTIONS, sel.gpsId);
    const receiver = byId(RECEIVERS, sel.receiverId);
    const video = byId(VIDEO_SYSTEMS, sel.videoId);
    const camera = byId(CAMERAS, sel.cameraId);
    const payload = byId(PAYLOADS, sel.payloadId) || PAYLOADS[0];
    const powerModule = byId(POWER_MODULES, sel.powerModuleId);
    const bec = byId(BEC_MODULES, sel.becId);
    const currentSensor = byId(CURRENT_SENSORS, sel.currentSensorId);
    const antenna = byId(ANTENNAS, sel.antennaId);
    const landingGear = byId(LANDING_GEAR, sel.landingGearId) || LANDING_GEAR[0];
    const buzzer = byId(BUZZERS, sel.buzzerId) || BUZZERS[0];
    const led = byId(LED_KITS, sel.ledId) || LED_KITS[0];
    const mounting = byId(BATTERY_MOUNTING, sel.mountId);

    const checks = [];

    if (frame && prop) {
      const over = prop.sizeIn - frame.maxPropIn;
      const status = over <= 0 ? "ok" : over <= 1 ? "check" : "bad";
      checks.push({
        key: "prop-frame",
        label: "Propeller ↔ Frame",
        status,
        detail:
          status === "ok"
            ? `${prop.label} clears the ${frame.label} max prop size of ${frame.maxPropIn}″.`
            : `${prop.label} exceeds the ${frame.label} max prop size of ${frame.maxPropIn}″.`,
        fix: status !== "ok" ? `Choose a propeller of ${frame.maxPropIn}″ or smaller.` : null,
      });
    }

    if (motor && battery) {
      const status = rangeStatus(battery.s, motor.recommendedS, 1);
      checks.push({
        key: "battery-motor",
        label: "Battery ↔ Motor",
        status,
        detail:
          status === "ok"
            ? `${battery.label} sits within ${motor.label}'s recommended ${motor.recommendedS[0]}S–${motor.recommendedS[1]}S range.`
            : `${battery.label} is outside ${motor.label}'s recommended ${motor.recommendedS[0]}S–${motor.recommendedS[1]}S range.`,
        fix: status !== "ok" ? `Choose a battery between ${motor.recommendedS[0]}S and ${motor.recommendedS[1]}S.` : null,
      });
    }

    if (battery && esc) {
      const status = rangeStatus(battery.s, esc.compatibleS, 1);
      checks.push({
        key: "battery-esc",
        label: "Battery ↔ ESC",
        status,
        detail:
          status === "ok"
            ? `${battery.label} is within ${esc.label}'s ${esc.compatibleS[0]}S–${esc.compatibleS[1]}S voltage rating.`
            : `${battery.label} falls outside ${esc.label}'s ${esc.compatibleS[0]}S–${esc.compatibleS[1]}S voltage rating.`,
        fix: status !== "ok" ? `Choose an ESC rated for ${battery.s}S.` : null,
      });
    }

    if (motor && esc) {
      const status = esc.currentA >= motor.maxCurrentA * 1.15 ? "ok" : esc.currentA >= motor.maxCurrentA ? "check" : "bad";
      checks.push({
        key: "esc-motor",
        label: "ESC ↔ Motor Current",
        status,
        detail:
          status === "ok"
            ? `${esc.label} comfortably covers ${motor.label}'s ${motor.maxCurrentA}A peak draw.`
            : status === "check"
            ? `${esc.label} is right at ${motor.label}'s ${motor.maxCurrentA}A peak draw with little headroom.`
            : `${esc.label} is rated below ${motor.label}'s ${motor.maxCurrentA}A peak draw.`,
        fix: status === "bad" ? `Choose an ESC rated above ${motor.maxCurrentA}A.` : null,
      });
    }

    if (receiver && sel.protocol) {
      const status = receiver.protocol === sel.protocol ? "ok" : "bad";
      checks.push({
        key: "receiver-protocol",
        label: "Receiver ↔ Comms Protocol",
        status,
        detail:
          status === "ok"
            ? `${receiver.label} matches the selected ${sel.protocol} protocol.`
            : `${receiver.label} only supports ${receiver.protocol}, not the selected ${sel.protocol} protocol.`,
        fix: status !== "ok" ? `Choose the ${sel.protocol}-compatible receiver, or switch protocol to ${receiver.protocol}.` : null,
      });
    }

    if (currentSensor && esc) {
      const status = currentSensor.maxCurrentA >= esc.currentA ? "ok" : "check";
      checks.push({
        key: "sensor-esc",
        label: "Current Sensor ↔ ESC",
        status,
        detail:
          status === "ok"
            ? `${currentSensor.label} covers ${esc.label}'s ${esc.currentA}A rating.`
            : `${currentSensor.label} is rated below ${esc.label}'s ${esc.currentA}A rating and may clip readings.`,
        fix: status !== "ok" ? "Choose a higher-rated current sensor or power module." : null,
      });
    }

    if (antenna && video) {
      const status = antenna.compatibleVideo.includes(video.id) ? "ok" : "bad";
      checks.push({
        key: "antenna-video",
        label: "Antenna ↔ Video System",
        status,
        detail:
          status === "ok"
            ? `${antenna.label} matches the selected ${video.label} system.`
            : `${antenna.label} is not intended for the selected ${video.label} system.`,
        fix: status !== "ok" ? "Choose an antenna matched to the selected video system." : null,
      });
    }

    if (bec && video) {
      const needsNine = video.id !== "vid-analog";
      const status = needsNine && bec.outputV < 9 ? "check" : "ok";
      checks.push({
        key: "bec-video",
        label: "BEC ↔ Video System",
        status,
        detail:
          status === "ok"
            ? `${bec.label} supplies enough voltage for ${video.label}.`
            : `${bec.label} may under-supply the selected ${video.label} system, which typically wants 9V+.`,
        fix: status !== "ok" ? "Choose a 9V or 12V BEC for digital video systems." : null,
      });
    }

    // Weight estimate
    const motorCount = frame ? frame.motorCount : 1;
    const partWeights = [
      frame ? frame.baseWeightG : 0,
      motor ? motor.weightG * motorCount : 0,
      prop ? prop.weightG * motorCount : 0,
      esc ? esc.weightG * motorCount : 0,
      battery ? battery.weightG : 0,
      fc ? fc.weightG : 0,
      gps ? gps.weightG : 0,
      receiver ? receiver.weightG : 0,
      video ? video.weightG : 0,
      camera ? camera.weightG : 0,
      payload ? payload.weightG : 0,
      powerModule ? powerModule.weightG : 0,
      bec ? bec.weightG : 0,
      currentSensor ? currentSensor.weightG : 0,
      antenna ? antenna.weightG : 0,
      landingGear.weightG,
      buzzer.weightG,
      led.weightG,
      mounting ? mounting.weightG : 0,
    ];
    const estimatedWeightG = partWeights.reduce((a, b) => a + b, 0);

    if (frame) {
      const over = estimatedWeightG - frame.weightBudgetG;
      const status = over <= 0 ? "ok" : over <= frame.weightBudgetG * 0.1 ? "check" : "bad";
      checks.push({
        key: "weight-budget",
        label: "All-Up Weight ↔ Frame Budget",
        status,
        detail:
          status === "ok"
            ? `Estimated ${estimatedWeightG}g all-up weight is within the ${frame.label} budget of ${frame.weightBudgetG}g.`
            : `Estimated ${estimatedWeightG}g all-up weight exceeds the ${frame.label} budget of ${frame.weightBudgetG}g.`,
        fix: status !== "ok" ? "Choose a lighter battery/payload combination, or move to a larger frame." : null,
      });
    }

    let overallStatus = "ok";
    checks.forEach((c) => {
      if (STATUS_RANK[c.status] > STATUS_RANK[overallStatus]) overallStatus = c.status;
    });

    // Pricing
    const priceParts = [
      frame ? frame.priceINR : 0,
      motor ? motor.priceINR * motorCount : 0,
      prop ? prop.priceINR * motorCount : 0,
      esc ? esc.priceINR * motorCount : 0,
      battery ? battery.priceINR : 0,
      fc ? fc.priceINR : 0,
      gps ? gps.priceINR : 0,
      receiver ? receiver.priceINR : 0,
      video ? video.priceINR : 0,
      camera ? camera.priceINR : 0,
      payload ? payload.priceINR : 0,
      powerModule ? powerModule.priceINR : 0,
      bec ? bec.priceINR : 0,
      currentSensor ? currentSensor.priceINR : 0,
      antenna ? antenna.priceINR : 0,
      landingGear.priceINR,
      buzzer.priceINR,
      led.priceINR,
      mounting ? mounting.priceINR : 0,
    ];
    const totalPriceINR = priceParts.reduce((a, b) => a + b, 0);

    // Simplified, explicitly-estimated performance figures
    const estimatedPayloadHeadroomG = frame ? Math.max(0, frame.weightBudgetG - (estimatedWeightG - (payload ? payload.weightG : 0))) : 0;
    let estimatedEnduranceMin = 0;
    let estimatedTopSpeedKmh = 0;
    if (motor && battery && estimatedWeightG > 0) {
      estimatedEnduranceMin = Math.max(3, Math.round(((battery.mah * battery.s) / (motorCount * 420)) * (1000 / estimatedWeightG) * 10));
      estimatedTopSpeedKmh = Math.max(20, Math.round(motor.kv * battery.s * 0.0095 - estimatedWeightG / 120));
    }
    const estimatedRangeKm = Math.round((estimatedEnduranceMin / 60) * estimatedTopSpeedKmh * 0.55);

    return {
      parts: { frame, motor, prop, esc, battery, fc, gps, receiver, video, camera, payload, powerModule, bec, currentSensor, antenna, landingGear, buzzer, led, mounting },
      motorCount,
      checks,
      overallStatus,
      overallLabel: STATUS_LABEL[overallStatus],
      totalPriceINR,
      estimatedWeightG,
      estimatedPayloadHeadroomG,
      estimatedEnduranceMin,
      estimatedTopSpeedKmh,
      estimatedRangeKm,
    };
  }

  window.SentinelForge = {
    PLATFORMS,
    FRAMES,
    FPV_FRAME_STYLES,
    FPV_FRAME_SIZES,
    FPV_FRAMES,
    fpvFrameId,
    MOTORS,
    PROPELLERS,
    ESCS,
    BATTERIES,
    FLIGHT_CONTROLLERS,
    GPS_OPTIONS,
    RECEIVERS,
    COMMS_PROTOCOLS,
    VIDEO_SYSTEMS,
    CAMERAS,
    PAYLOADS,
    POWER_MODULES,
    BEC_MODULES,
    CURRENT_SENSORS,
    ANTENNAS,
    LANDING_GEAR,
    BUZZERS,
    LED_KITS,
    BATTERY_MOUNTING,
    STATUS_LABEL,
    byId,
    computeConfiguration,
    recommendedComponentsForFrame,
  };
})();
