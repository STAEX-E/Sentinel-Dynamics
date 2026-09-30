/* ============================================================
   Sentinel Dynamics — Products page: render + category filter
   Runs synchronously at parse time (script sits after #products-grid
   in the DOM) so the grid is populated before main.js's
   DOMContentLoaded reveal-observer runs.
   ============================================================ */

(function () {
  "use strict";

  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const countEl = document.getElementById("products-count");
  const select = document.getElementById("category-filter");
  const products = window.SENTINEL_PRODUCTS || [];

  // The nav's "UAS" / "CUAS" links use ?type=; deep links from elsewhere
  // (the homepage network diagram, etc.) still use ?category=<exact
  // category>, including ?category=counter-uas — both are honored below.
  function paramCategory() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "uas" || type === "cuas") return type;
    const category = params.get("category");
    if (category === "counter-uas") return "cuas";
    return category || "uas";
  }

  function render(category) {
    let filtered;
    if (category === "uas") filtered = products.filter((p) => p.category !== "counter-uas");
    else if (category === "cuas") filtered = products.filter((p) => p.category === "counter-uas");
    else filtered = products.filter((p) => p.category === category);
    grid.innerHTML = filtered.map((p) => window.renderProductTile(p)).join("");
    if (countEl) countEl.textContent = filtered.length;
  }

  const initial = paramCategory();
  if (select) {
    select.value = initial;
    select.addEventListener("change", () => render(select.value));
  }
  render(initial);
})();
