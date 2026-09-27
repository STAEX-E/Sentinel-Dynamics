/* ============================================================
   Sentinel Dynamics — Compare Systems
   Select 2-4 platforms and compare category, status, price and
   every spec attribute across the selection.
   ============================================================ */

(function () {
  "use strict";

  const pickersEl = document.getElementById("compare-pickers");
  if (!pickersEl) return;

  const products = window.SENTINEL_PRODUCTS || [];
  const emptyEl = document.getElementById("compare-empty");
  const tableWrap = document.getElementById("compare-table-wrap");
  const tableEl = document.getElementById("compare-table");
  const chartWrap = document.getElementById("compare-chart-wrap");
  const chartEl = document.getElementById("compare-chart");

  const SLOT_COUNT = 4;
  const slots = new Array(SLOT_COUNT).fill("");

  function optionsMarkup(selected) {
    const byCategory = {};
    products.forEach((p) => {
      byCategory[p.category] = byCategory[p.category] || [];
      byCategory[p.category].push(p);
    });
    let html = `<option value="">— Select a platform —</option>`;
    Object.keys(byCategory).forEach((cat) => {
      html += `<optgroup label="${window.escapeHtml(window.SENTINEL_CATEGORY_LABELS[cat] || cat)}">`;
      html += byCategory[cat]
        .map((p) => `<option value="${p.id}"${p.id === selected ? " selected" : ""}>${window.escapeHtml(p.name)}</option>`)
        .join("");
      html += "</optgroup>";
    });
    return html;
  }

  function renderPickers() {
    pickersEl.innerHTML = slots
      .map(
        (val, i) => `<div class="forge-field">
          <label for="compare-slot-${i}">Platform ${i + 1}</label>
          <div class="select-field"><select id="compare-slot-${i}" data-slot="${i}">${optionsMarkup(val)}</select></div>
        </div>`
      )
      .join("");
    pickersEl.querySelectorAll("select").forEach((sel) => {
      sel.addEventListener("change", () => {
        slots[Number(sel.dataset.slot)] = sel.value;
        renderTable();
      });
    });
  }

  function labelize(key) {
    const spaced = key.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  function truncateName(name, max) {
    return name.length > max ? name.slice(0, max - 1) + "…" : name;
  }

  function renderChart(selected) {
    const W = 640, H = 260;
    const padL = 66, padR = 60, padT = 20, padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = selected.length;

    const maxPrice = Math.max(...selected.map((p) => p.priceINR)) * 1.15 || 1;
    const points = selected.map((p, i) => {
      const x = padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
      const y = padT + plotH - (p.priceINR / maxPrice) * plotH;
      return { x, y, p };
    });

    const linePath = points.map((pt, i) => (i === 0 ? "M" : "L") + pt.x.toFixed(1) + " " + pt.y.toFixed(1)).join(" ");
    const areaPath = linePath + ` L ${points[points.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    const gridCount = 4;
    let gridSvg = "";
    for (let i = 0; i <= gridCount; i++) {
      const y = padT + (plotH / gridCount) * i;
      const val = maxPrice - (maxPrice / gridCount) * i;
      gridSvg += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${padL + plotW}" y2="${y.toFixed(1)}" stroke="var(--c-border)" stroke-width="1"/>`;
      gridSvg += `<text x="${padL - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="compare-chart__axis-label">${window.escapeHtml(window.formatINR(val))}</text>`;
    }

    const xLabels = points
      .map((pt) => `<text x="${pt.x.toFixed(1)}" y="${(padT + plotH + 20).toFixed(1)}" text-anchor="middle" class="compare-chart__axis-label">${window.escapeHtml(truncateName(pt.p.name, 11))}</text>`)
      .join("");

    const dots = points
      .map((pt, i) => `<circle class="compare-chart__dot" data-idx="${i}" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="5"/>`)
      .join("");

    chartEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="compare-chart__svg">
        <defs>
          <linearGradient id="compareChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--c-yellow)" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="var(--c-yellow)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridSvg}
        <path d="${areaPath}" fill="url(#compareChartFill)" stroke="none"/>
        <path d="${linePath}" fill="none" stroke="var(--c-yellow)" stroke-width="2"/>
        ${dots}
        ${xLabels}
      </svg>
      <div class="compare-chart__tooltip" id="compare-chart-tooltip" style="display:none;"></div>`;

    const tooltip = document.getElementById("compare-chart-tooltip");
    const svgEl = chartEl.querySelector("svg");
    chartEl.querySelectorAll(".compare-chart__dot").forEach((dot) => {
      dot.addEventListener("mouseenter", () => {
        const pt = points[Number(dot.dataset.idx)];
        tooltip.innerHTML = `<strong>${window.escapeHtml(pt.p.name)}</strong><br>${window.escapeHtml(window.formatINR(pt.p.priceINR))}`;
        tooltip.style.display = "";
        const svgRect = svgEl.getBoundingClientRect();
        const chartRect = chartEl.getBoundingClientRect();
        const scaleX = svgRect.width / W;
        const scaleY = svgRect.height / H;
        tooltip.style.left = (svgRect.left - chartRect.left + pt.x * scaleX) + "px";
        tooltip.style.top = (svgRect.top - chartRect.top + pt.y * scaleY) + "px";
      });
      dot.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });
    });
  }

  function renderTable() {
    const selected = slots.map((id) => products.find((p) => p.id === id)).filter(Boolean);

    if (selected.length < 2) {
      emptyEl.style.display = "";
      tableWrap.style.display = "none";
      chartWrap.style.display = "none";
      return;
    }
    emptyEl.style.display = "none";
    tableWrap.style.display = "";
    chartWrap.style.display = "";
    renderChart(selected);

    const specKeys = [];
    selected.forEach((p) => {
      Object.keys(p.specs || {}).forEach((k) => {
        if (!specKeys.includes(k)) specKeys.push(k);
      });
    });

    let html = "<thead><tr><th>Attribute</th>";
    html += selected
      .map(
        (p, i) =>
          `<th><span class="compare-name">${window.escapeHtml(p.name)}</span><button class="compare-remove" type="button" data-clear="${slots.indexOf(p.id)}" title="Remove">✕</button></th>`
      )
      .join("");
    html += "</tr></thead><tbody>";

    const rows = [
      ["Category", (p) => window.SENTINEL_CATEGORY_LABELS[p.category] || p.category],
      ["Status", (p) => (p.status === "concept" ? "CONCEPT" : "ACTIVE")],
      ["Estimated Price", (p) => window.formatINR(p.priceINR)],
      ["Configurable", (p) => (p.configurable ? "Yes — via Forge Lab" : "No — Request Info")],
    ];
    specKeys.forEach((k) => rows.push([labelize(k), (p) => (p.specs && p.specs[k] != null ? String(p.specs[k]) : "—")]));

    html += rows
      .map(
        ([label, fn]) =>
          `<tr><th scope="row">${window.escapeHtml(label)}</th>${selected.map((p) => `<td${label === "Estimated Price" ? ' class="compare-name"' : ""}>${window.escapeHtml(fn(p))}</td>`).join("")}</tr>`
      )
      .join("");

    html += "</tbody>";
    tableEl.innerHTML = html;

    tableEl.querySelectorAll("[data-clear]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.clear);
        slots[idx] = "";
        renderPickers();
        renderTable();
      });
    });
  }

  function init() {
    const params = new URLSearchParams(window.location.search);
    const ids = (params.get("ids") || "").split(",").filter(Boolean);
    ids.slice(0, SLOT_COUNT).forEach((id, i) => { slots[i] = id; });
    renderPickers();
    renderTable();
  }

  init();
})();
