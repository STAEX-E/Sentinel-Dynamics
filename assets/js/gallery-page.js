/* ============================================================
   Sentinel Dynamics — Gallery
   Real photography is used where supplied (e.g. the 7-inch
   Interceptor); everything else uses icon+gradient placeholder
   tiles ready to swap in as more photography is supplied.
   Full filtering, hover reveal and lightbox viewer are functional.
   ============================================================ */

(function () {
  "use strict";

  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const CATEGORY_ICON = {
    uav: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    vtol: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 12l2 2 4-4"/>',
    fpv: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    interceptor: '<path d="M12 2v9M12 2l-3 4M12 2l3 4"/><path d="M4 13h16l-2 3H6Z"/><path d="M9 16v4M15 16v4"/>',
    "counter-uas": '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7" stroke-dasharray="2 3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    development: '<path d="M12 2v14M12 2l4 4M12 2 8 6"/><path d="M5 14a7 7 0 0 0 14 0"/>',
    "flight-ops": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="M9 12l2 2 4-4"/>',
    exhibition: '<path d="M12 2 2 8h20L12 2Z"/><path d="M4 8v12M20 8v12M9 8v12M15 8v12"/><path d="M2 20h20"/>',
  };

  const CATEGORY_LABEL = {
    uav: "UAVs",
    vtol: "VTOL",
    fpv: "FPV",
    interceptor: "Interceptors",
    "counter-uas": "Counter-UAS",
    development: "Development",
    "flight-ops": "Flight Operations",
    exhibition: "Exhibition & Events",
  };

  const ITEMS = [
    { id: 1, category: "uav", title: "VIEW VTOL — Full Assembly" },
    { id: 2, category: "uav", title: "ATLAS VTOL — Cargo Configuration" },
    { id: 3, category: "vtol", title: "ANIKETRA VTOL — Spatian Aviation Collaboration" },
    { id: 4, category: "vtol", title: "Tail-Sitter VTOL — Transition Test" },
    { id: 5, category: "vtol", title: "SENTRY VTOL — ISR Payload Bay" },
    { id: 6, category: "fpv", title: "FPV 5\" — Bench Build" },
    { id: 7, category: "fpv", title: "FPV 7\" — Racing Configuration" },
    { id: 8, category: "fpv", title: "FPV 3.5\" — Micro Build" },
    { id: 9, category: "interceptor", title: "Interceptor 7\" — Handheld", image: "assets/img/products/interceptor-7-1.jpg" },
    { id: 10, category: "interceptor", title: "Interceptor 7\" — In Flight", image: "assets/img/products/interceptor-7-2.jpg" },
    { id: 11, category: "interceptor", title: "Interceptor 5\" — Enclosed Body" },
    { id: 12, category: "counter-uas", title: "Counter-UAS Jammer — Field Deployment" },
    { id: 13, category: "counter-uas", title: "RF Detection System — Mobile Mount" },
    { id: 14, category: "counter-uas", title: "Laser Range Finder — Targeting Trial" },
    { id: 15, category: "development", title: "Airframe Design Review" },
    { id: 16, category: "development", title: "Avionics Bench Integration" },
    { id: 17, category: "flight-ops", title: "Flight-Control Validation" },
    { id: 18, category: "flight-ops", title: "High-Speed Interceptor Test Run" },
    { id: 19, category: "exhibition", title: "HITEX Drone Expo, 2025" },
    { id: 20, category: "exhibition", title: "DPS IT Fest Drone Competition, 2025" },
  ];

  function svg(cat) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (CATEGORY_ICON[cat] || "") + "</svg>";
  }

  function visual(item) {
    return item.image ? `<img src="${window.escapeHtml(item.image)}" alt="${window.escapeHtml(item.title)}">` : svg(item.category);
  }

  const filtersEl = document.getElementById("gallery-filters");
  const categories = ["all", "uav", "vtol", "fpv", "interceptor", "counter-uas", "development", "flight-ops", "exhibition"];
  let active = "all";
  let visibleItems = ITEMS;
  let lightboxIndex = 0;

  function renderFilters() {
    filtersEl.innerHTML = categories
      .map((c) => `<button type="button" class="forge-pill${c === active ? " is-selected" : ""}" data-cat="${c}">${c === "all" ? "All" : CATEGORY_LABEL[c]}</button>`)
      .join("");
    filtersEl.querySelectorAll(".forge-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.cat;
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    visibleItems = active === "all" ? ITEMS : ITEMS.filter((i) => i.category === active);
    grid.innerHTML = visibleItems
      .map(
        (item, i) => `<div class="gallery-tile reveal" data-index="${i}">
          <div class="gallery-tile__bg">${visual(item)}</div>
          <div class="gallery-tile__overlay">
            <span class="gallery-tile__cat">${CATEGORY_LABEL[item.category]}</span>
            <span class="gallery-tile__title">${window.escapeHtml(item.title)}</span>
          </div>
        </div>`
      )
      .join("");
    grid.querySelectorAll(".gallery-tile").forEach((tile) => {
      tile.addEventListener("click", () => openLightbox(Number(tile.dataset.index)));
    });
  }

  const lightbox = document.getElementById("gallery-lightbox");
  const stage = document.getElementById("lightbox-stage");
  const caption = document.getElementById("lightbox-caption");

  function renderLightbox() {
    const item = visibleItems[lightboxIndex];
    if (!item) return;
    stage.innerHTML = visual(item);
    caption.textContent = CATEGORY_LABEL[item.category] + " — " + item.title;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    renderLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
  }
  function step(delta) {
    lightboxIndex = (lightboxIndex + delta + visibleItems.length) % visibleItems.length;
    renderLightbox();
  }

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", () => step(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  renderFilters();
  renderGrid();
})();
