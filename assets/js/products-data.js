/* ============================================================
   Sentinel Dynamics — Product Database
   Single source of truth for the catalog. Every page (Products,
   Search, Product Detail, Forge Lab, Compare, Cart) reads from
   window.SENTINEL_PRODUCTS.

   Finalized catalog only: VTOL, FPV, Interceptor and Counter-UAS
   systems. No concept-stage or filler platforms.
   ============================================================ */

(function () {
  "use strict";

  const ICONS = {
    vtol: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 12l2 2 4-4"/>',
    "vtol-alt": '<path d="M12 2v14M12 2l-5 5M12 2l5 5"/><path d="M7 20h10"/>',
    fpv: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 8l1.6 4L12 16l-1.6-4Z" fill="currentColor" stroke="none"/>',
    interceptor: '<path d="M12 2v9M12 2l-3 4M12 2l3 4"/><path d="M4 13h16l-2 3H6Z"/><path d="M9 16v4M15 16v4"/>',
    swarm: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    jammer: '<path d="M12 3v6M12 15v6M5 12h4M15 12h4"/><circle cx="12" cy="12" r="3"/><path d="M5.5 5.5l2.6 2.6M15.9 15.9l2.6 2.6M18.5 5.5l-2.6 2.6M8.1 15.9l-2.6 2.6"/>',
    detector: '<path d="M3 12a9 9 0 0 1 18 0"/><path d="M3 12a9 9 0 0 0 18 0" stroke-dasharray="1.5 3"/><path d="M12 12V4"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    rf: '<path d="M2 12h3M6 7v10M10 4v16M14 7v10M18 4v16M22 12h-3"/>',
    lrf: '<path d="M4 20 18 6"/><circle cx="4" cy="20" r="2"/><path d="M13 6h6v6" stroke-dasharray="2 2"/><circle cx="19" cy="6" r="1.4" fill="currentColor" stroke="none"/>',
  };

  function svg(iconKey) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[iconKey] || ICONS.vtol) +
      "</svg>"
    );
  }

  const CATEGORY_LABELS = {
    vtol: "VTOLs",
    fpv: "FPV",
    interceptor: "Interceptors",
    "counter-uas": "Counter-UAS",
    swarm: "Swarm Drones",
  };

  const PRODUCTS = [
    // ---------------- VTOL ----------------
    {
      id: "vtol-view",
      name: "YHUH VTOL",
      category: "vtol",
      status: "active",
      tag: "Fixed-Wing VTOL · Surveillance & Strike",
      icon: "vtol",
      short: "A 4 m, IC-engine VTOL built for 3-hour surveillance and precision-strike missions.",
      description: "YHUH is Sentinel Dynamics' long-endurance fixed-wing VTOL — a 4-metre-wingspan platform powered by an internal-combustion engine for extended time-on-station. It combines persistent surveillance with a precision-strike capability via ULTGMs, operating up to 500 m / 1,640 ft.",
      specs: { wingspan: "4 m", topSpeed: "130 km/h", power: "IC Engine", endurance: "3 h", maxAltitude: "500 m / 1,640 ft", payload: "ULTGMs", role: "Surveillance + Precision Strike", weight: "18 kg MTOW" },
      highlights: ["4 m Wingspan", "3 h Endurance", "130 km/h"],
      priceINR: 15000000,
      configurable: true,
    },
    {
      id: "vtol-aniketra",
      name: "ANIKETRA VTOL",
      category: "vtol",
      status: "active",
      tag: "VTOL · Collaboration",
      icon: "vtol-alt",
      partner: "Spatian Aviation",
      short: "A compact 1.5 m electric VTOL for surveillance and small explosive payloads, built with Spatian Aviation.",
      description: "ANIKETRA is a joint development between Sentinel Dynamics and Spatian Aviation — a compact, 6S electric VTOL sized for rapid deployment. It delivers an hour of surveillance endurance at altitudes up to 200 m / 656 ft, with the option to carry small explosive payloads.",
      specs: { wingspan: "1.5 m", topSpeed: "120 km/h", power: "6S", endurance: "1 h", maxAltitude: "200 m / 656 ft", payload: "Surveillance + Small Explosive Payloads", weight: "4.2 kg MTOW" },
      highlights: ["Spatian Aviation Collab", "1.5 m Wingspan", "120 km/h"],
      priceINR: 2800000,
      configurable: true,
    },
    {
      id: "vtol-sentry",
      name: "SENTRY VTOL",
      category: "vtol",
      status: "active",
      tag: "VTOL · ISR",
      icon: "vtol-alt",
      short: "A 2.4 m electric VTOL built around a dedicated ISR sensor pod for persistent overwatch.",
      description: "SENTRY is a mid-size electric VTOL purpose-built for intelligence, surveillance and reconnaissance. Its 2.4 m wingspan and 12S powertrain deliver 2 hours of on-station time carrying a dedicated ISR sensor pod, at altitudes up to 350 m / 1,148 ft.",
      specs: { wingspan: "2.4 m", topSpeed: "110 km/h", power: "12S", endurance: "2 h", maxAltitude: "350 m / 1,148 ft", payload: "ISR Sensor Pod", weight: "7.5 kg MTOW" },
      highlights: ["2.4 m Wingspan", "2 h Endurance", "ISR Pod"],
      priceINR: 4500000,
      configurable: true,
    },
    {
      id: "vtol-atlas",
      name: "ATLAS VTOL",
      category: "vtol",
      status: "active",
      tag: "VTOL · Logistics",
      icon: "vtol",
      short: "A 3 m hybrid-electric VTOL for forward-position cargo resupply without runway dependency.",
      description: "ATLAS moves supplies into forward positions without any runway or road dependency. Its 3 m wingspan and hybrid-electric powertrain give it 2.5 hours of endurance carrying a cargo resupply payload, operating up to 300 m / 984 ft.",
      specs: { wingspan: "3 m", topSpeed: "95 km/h", power: "Hybrid-Electric", endurance: "2.5 h", maxAltitude: "300 m / 984 ft", payload: "Cargo Resupply", weight: "12 kg MTOW" },
      highlights: ["3 m Wingspan", "2.5 h Endurance", "Cargo Resupply"],
      priceINR: 5500000,
      configurable: true,
    },
    {
      id: "vtol-tailsitter",
      name: "Tail-Sitter VTOL",
      category: "vtol",
      status: "active",
      tag: "Tail-Sitter VTOL",
      icon: "vtol-alt",
      short: "A high-speed tail-sitter VTOL with up to 45 minutes of endurance and an explosive payload.",
      description: "Launches and lands vertically on its tail, then transitions to fast, efficient forward flight. Running on an 8S–12S pack, the tail-sitter reaches 200 km/h with a maximum endurance of 45 minutes while carrying an explosive payload.",
      specs: { frame: "Tail-Sitter", topSpeed: "200 km/h", battery: "8S–12S", enduranceMax: "45 min", payload: "Explosive Payload", weight: "6.5 kg" },
      highlights: ["200 km/h", "45 min Max", "Tail-Sitter"],
      priceINR: 2000000,
      configurable: true,
    },

    // ---------------- FPV ----------------
    {
      id: "fpv-3-5",
      name: "FPV 3.5\"",
      category: "fpv",
      status: "active",
      tag: "FPV · Strike",
      icon: "fpv",
      short: "A compact 3.5-inch FPV strike platform — 100 km/h with a small explosive payload.",
      description: "The smallest platform in the FPV line, sized for tight operating environments. The 3.5-inch frame runs on 3S–4S power for around 12 minutes of flight at up to 100 km/h, carrying a small explosive payload.",
      specs: { frame: "3.5-Inch", topSpeed: "100 km/h", battery: "3S–4S", endurance: "12 min", payload: "Small Explosive Payload", weight: "0.35 kg" },
      highlights: ["3.5-Inch", "100 km/h", "12 min"],
      photos: ["assets/img/products/fpv-3-5-1.png"],
      priceINR: 68000,
      configurable: true,
    },
    {
      id: "fpv-5",
      name: "FPV 5\"",
      category: "fpv",
      status: "active",
      tag: "FPV · Strike",
      icon: "fpv",
      short: "The fleet's balanced 5-inch FPV platform — 200 km/h with 18 minutes of endurance.",
      description: "A balanced, agile 5-inch FPV airframe. Running on 3S–6S power, it reaches up to 200 km/h with roughly 18 minutes of flight time, carrying a small explosive payload.",
      specs: { frame: "5-Inch", topSpeed: "200 km/h", battery: "3S–6S", endurance: "18 min", payload: "Small Explosive Payload", weight: "0.9 kg" },
      highlights: ["5-Inch", "200 km/h", "18 min"],
      coverImage: "assets/img/products/fpv-5-1.png",
      photos: ["assets/img/products/fpv-5-gallery-1.jpg", "assets/img/products/fpv-5-gallery-2.jpg"],
      priceINR: 96000,
      configurable: true,
    },
    {
      id: "fpv-7",
      name: "FPV 7\"",
      category: "fpv",
      status: "active",
      tag: "FPV · Strike",
      icon: "fpv",
      short: "The long-legged 7-inch FPV platform — 220 km/h with 20 minutes of endurance.",
      description: "The largest and longest-legged airframe in the FPV line. On 4S–6S power the 7-inch platform reaches up to 220 km/h with around 20 minutes of flight time, carrying a small explosive payload.",
      specs: { frame: "7-Inch", topSpeed: "220 km/h", battery: "4S–6S", endurance: "20 min", payload: "Small Explosive Payload", weight: "1.6 kg" },
      highlights: ["7-Inch", "220 km/h", "20 min"],
      priceINR: 138000,
      configurable: true,
    },

    // ---------------- Swarm Drones ----------------
    {
      id: "swarm-3-5",
      name: "Swarm Drone 3.5\"",
      category: "swarm",
      status: "active",
      tag: "Swarm · Coordinated Ops",
      icon: "swarm",
      short: "A compact 3.5-inch swarm node — order any number of drones to build your swarm.",
      description: "The smallest platform in the swarm line, sized for dense, coordinated deployments. Priced and sold per drone — choose the quantity to set the size of your swarm, from a handful of nodes to a full formation.",
      specs: { frame: "3.5-Inch", battery: "3S–4S", endurance: "10 min", role: "Coordinated Swarm Node", weight: "0.35 kg" },
      highlights: ["3.5-Inch", "Swarm Node", "Per-Drone Pricing"],
      priceINR: 55000,
      configurable: true,
    },
    {
      id: "swarm-5",
      name: "Swarm Drone 5\"",
      category: "swarm",
      status: "active",
      tag: "Swarm · Coordinated Ops",
      icon: "swarm",
      short: "A balanced 5-inch swarm node — order any number of drones to build your swarm.",
      description: "A balanced, agile 5-inch airframe built for coordinated swarm operations. Priced and sold per drone — choose the quantity to set the size of your swarm.",
      specs: { frame: "5-Inch", battery: "3S–6S", endurance: "15 min", role: "Coordinated Swarm Node", weight: "0.9 kg" },
      highlights: ["5-Inch", "Swarm Node", "Per-Drone Pricing"],
      priceINR: 55000,
      configurable: true,
    },
    {
      id: "swarm-7",
      name: "Swarm Drone 7\"",
      category: "swarm",
      status: "active",
      tag: "Swarm · Coordinated Ops",
      icon: "swarm",
      short: "The long-legged 7-inch swarm node — order any number of drones to build your swarm.",
      description: "The largest and longest-legged airframe in the swarm line. Priced and sold per drone — choose the quantity to set the size of your swarm, from a handful of nodes to a full formation.",
      specs: { frame: "7-Inch", battery: "4S–6S", endurance: "17 min", role: "Coordinated Swarm Node", weight: "1.6 kg" },
      highlights: ["7-Inch", "Swarm Node", "Per-Drone Pricing"],
      priceINR: 55000,
      configurable: true,
    },

    // ---------------- Interceptors (enclosed/body FPV configuration) ----------------
    {
      id: "interceptor-3-5",
      name: "Interceptor 3.5\"",
      category: "interceptor",
      status: "active",
      tag: "Interceptor · Enclosed Body",
      icon: "interceptor",
      short: "An enclosed-body 3.5-inch interceptor — 100 km/h on a 65A ESC.",
      description: "The enclosed-body counterpart to the FPV 3.5-inch platform. A protective airframe shell houses the same high-speed propulsion on a 65A ESC, running 4S power for around 10 minutes at up to 100 km/h.",
      specs: { frame: "3.5-Inch Enclosed", topSpeed: "100 km/h", battery: "4S", endurance: "10 min", esc: "65A ESC", payload: "Small Explosive Payload", weight: "0.5 kg" },
      highlights: ["3.5-Inch", "100 km/h", "65A ESC"],
      photos: ["assets/img/products/fpv-3-5-1.png"],
      priceINR: 145000,
      configurable: true,
    },
    {
      id: "interceptor-5",
      name: "Interceptor 5\"",
      category: "interceptor",
      status: "active",
      tag: "Interceptor · Enclosed Body",
      icon: "interceptor",
      short: "An enclosed-body 5-inch interceptor — 200 km/h on an 80A ESC.",
      description: "The enclosed-body counterpart to the FPV 5-inch platform. Running 6S power through an 80A ESC, it reaches up to 200 km/h with roughly 16 minutes of endurance behind its protective body shell.",
      specs: { frame: "5-Inch Enclosed", topSpeed: "200 km/h", battery: "6S", endurance: "16 min", esc: "80A ESC", payload: "Small Explosive Payload", weight: "1.1 kg" },
      highlights: ["5-Inch", "200 km/h", "80A ESC"],
      priceINR: 210000,
      configurable: true,
      photos: ["assets/img/products/interceptor-5-1.webp"],
    },
    {
      id: "interceptor-7",
      name: "Interceptor 7\"",
      category: "interceptor",
      status: "active",
      tag: "Interceptor · Enclosed Body",
      icon: "interceptor",
      short: "The flagship enclosed-body interceptor — 220 km/h on a 100A ESC.",
      description: "The largest and fastest interceptor in the line. Its enclosed body shell protects the airframe at up to 220 km/h, running 8S power through a 100A ESC for around 18 minutes of high-speed endurance.",
      specs: { frame: "7-Inch Enclosed", topSpeed: "220 km/h", battery: "8S", endurance: "18 min", esc: "100A ESC", payload: "Small Explosive Payload", weight: "1.9 kg" },
      highlights: ["7-Inch", "220 km/h", "100A ESC"],
      priceINR: 285000,
      configurable: true,
      photos: ["assets/img/products/interceptor-7-1.jpg", "assets/img/products/interceptor-7-2.jpg"],
    },

    // ---------------- Counter-UAS ----------------
    {
      id: "cuas-jammer",
      name: "Counter-UAS Jammer",
      category: "counter-uas",
      status: "active",
      tag: "Counter-UAS · Electronic Warfare",
      icon: "jammer",
      short: "A portable RF jammer covering control and GNSS links to deny hostile drones.",
      description: "A handheld or fixed-mount jammer that denies the control, video and GNSS links a hostile drone depends on, breaking its connection to the operator before it reaches protected airspace.",
      specs: { class: "RF Jammer", frequencyBands: "2.4 / 5.8 GHz + GNSS", range: "Up to 2 km", power: "Vehicle / Portable Battery", deployment: "Handheld or Fixed Mount", weight: "3.2 kg" },
      highlights: ["RF Jammer", "Up to 2 km", "Portable"],
      priceINR: 1950000,
      configurable: false,
    },
    {
      id: "cuas-detector",
      name: "Counter-UAS Detector",
      category: "counter-uas",
      status: "active",
      tag: "Counter-UAS · Detection",
      icon: "detector",
      short: "An acoustic + RF fusion detector for early warning of approaching drones.",
      description: "Fuses acoustic and RF sensing to detect small unmanned aircraft well before visual acquisition, cueing a jamming or interceptor response across a 3 km detection radius.",
      specs: { class: "Detection System", range: "3 km Radius", sensor: "Acoustic + RF Fusion", power: "Grid / Battery", weight: "14 kg" },
      highlights: ["3 km Radius", "Acoustic + RF", "Early Warning"],
      priceINR: 4200000,
      configurable: false,
    },
    {
      id: "cuas-rf-detection",
      name: "RF Detection System",
      category: "counter-uas",
      status: "active",
      tag: "Counter-UAS · RF Detection",
      icon: "rf",
      short: "A wide-band RF spectrum monitor that flags drone control and video links.",
      description: "Continuously scans the RF spectrum from 70 MHz to 6 GHz for drone control and video signatures, providing a 5 km detection radius and cueing downstream jamming or interceptor assets.",
      specs: { class: "RF Spectrum Monitor", frequencyRange: "70 MHz – 6 GHz", range: "5 km Radius", power: "Grid / Vehicle", weight: "22 kg" },
      highlights: ["70 MHz – 6 GHz", "5 km Radius", "Spectrum Monitor"],
      priceINR: 6800000,
      configurable: false,
    },
    {
      id: "cuas-lrf",
      name: "Laser Range Finder (LRF)",
      category: "counter-uas",
      status: "active",
      tag: "Counter-UAS · Targeting",
      icon: "lrf",
      short: "A tripod or vehicle-mounted LRF for precise range data out to 10 km.",
      description: "Provides precise range-to-target data for cueing jammers, interceptors and observers — mountable on a tripod or vehicle, with a working range of up to 10 km and metre-level accuracy.",
      specs: { class: "Laser Range Finder", range: "Up to 10 km", accuracy: "±1 m", mount: "Tripod / Vehicle", weight: "2.4 kg" },
      highlights: ["Up to 10 km", "±1 m Accuracy", "Tripod / Vehicle"],
      priceINR: 6500000,
      configurable: false,
      photos: ["assets/img/products/lrf-1.png", "assets/img/products/lrf-2.png"],
    },
  ];

  function formatINR(amount) {
    if (amount == null) return "—";
    return "₹" + Math.round(amount).toLocaleString("en-IN");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function renderProductTile(p) {
    const statusClass = p.status === "concept" ? "status-badge--concept" : "status-badge--active";
    const statusLabel = p.status === "concept" ? "CONCEPT" : "ACTIVE";
    const chips = (p.highlights || []).slice(0, 3).map((h) => `<span class="spec-chip">${escapeHtml(h)}</span>`).join("");
    const configureHref = p.configurable ? `forge-lab.html?product=${encodeURIComponent(p.id)}` : "customer-service.html";
    const configureLabel = p.configurable ? "Configure" : "Request Info";
    const tileImage = p.coverImage || (p.photos && p.photos[0]);
    const visual = tileImage
      ? `<img class="product-tile__photo" src="${tileImage}" alt="${escapeHtml(p.name)}" loading="lazy">`
      : svg(p.icon);
    return `
    <article class="panel product-tile reveal" data-product-id="${p.id}" data-category="${p.category}">
      <div class="product-tile__visual">
        <span class="status-badge ${statusClass} product-tile__status">${statusLabel}</span>
        ${visual}
      </div>
      <div class="product-tile__body">
        <span class="product-tile__category">${escapeHtml(CATEGORY_LABELS[p.category] || p.category)}</span>
        <h3 class="product-tile__name">${escapeHtml(p.name)}</h3>
        <p class="product-tile__desc">${escapeHtml(p.short)}</p>
        <div class="product-tile__specs">${chips}</div>
        <div class="product-tile__price">
          <small>Estimated Price</small>
          ${formatINR(p.priceINR)}
        </div>
        <div class="product-tile__actions">
          <a class="btn btn--outline btn--sm" href="product-detail.html?id=${encodeURIComponent(p.id)}">View Details</a>
          <a class="btn btn--ghost btn--sm" href="${configureHref}">${configureLabel}</a>
          <button type="button" class="btn btn--ghost btn--sm" data-action="add-to-cart" data-id="${p.id}">Add to Cart</button>
          <button type="button" class="btn btn--primary btn--sm" data-action="buy-now" data-id="${p.id}">Buy Now</button>
        </div>
      </div>
    </article>`;
  }

  window.SENTINEL_PRODUCTS = PRODUCTS;
  window.SENTINEL_CATEGORY_LABELS = CATEGORY_LABELS;
  window.SentinelIcons = { svg, ICONS };
  window.formatINR = formatINR;
  window.renderProductTile = renderProductTile;
  window.escapeHtml = escapeHtml;
})();
