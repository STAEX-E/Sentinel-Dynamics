/* ============================================================
   Sentinel Dynamics — Dynamic product detail page
   Reads ?id= from the URL and renders from window.SENTINEL_PRODUCTS.
   ============================================================ */

(function () {
  "use strict";

  function labelize(key) {
    const spaced = key.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const products = window.SENTINEL_PRODUCTS || [];
  const product = products.find((p) => p.id === id);

  const detailSection = document.getElementById("detail");

  if (!product) {
    if (detailSection) {
      detailSection.innerHTML =
        '<div class="container"><p class="lead">We couldn\'t find that platform. <a class="text-link" href="products.html">Browse the full catalog <span class="arrow">→</span></a></p></div>';
    }
    document.title = "Product Not Found — Sentinel Dynamics";
    return;
  }

  document.title = product.name + " — Sentinel Dynamics";
  const metaDesc = document.getElementById("pd-meta-desc");
  if (metaDesc) metaDesc.setAttribute("content", product.short);

  document.getElementById("pd-tag").textContent = product.tag;
  document.getElementById("pd-name").textContent = product.name;
  document.getElementById("pd-short").textContent = product.short;
  document.getElementById("pd-description").textContent = product.description;

  const visual = document.getElementById("pd-visual");
  const thumbsEl = document.getElementById("pd-gallery-thumbs");

  function showPhoto(src) {
    visual.innerHTML = `<img src="${window.escapeHtml(src)}" alt="${window.escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:contain;padding:4%;">`;
  }

  if (product.photos && product.photos.length) {
    showPhoto(product.photos[0]);
    if (product.photos.length > 1) {
      thumbsEl.innerHTML = product.photos
        .map((src, i) => `<img src="${window.escapeHtml(src)}" data-src="${window.escapeHtml(src)}" class="${i === 0 ? "is-active" : ""}" alt="${window.escapeHtml(product.name)} — view ${i + 1}">`)
        .join("");
      thumbsEl.querySelectorAll("img").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          showPhoto(thumb.dataset.src);
          thumbsEl.querySelectorAll("img").forEach((t) => t.classList.remove("is-active"));
          thumb.classList.add("is-active");
        });
      });
    }
  } else {
    visual.innerHTML = window.SentinelIcons.svg(product.icon);
  }

  const qtyHint = document.getElementById("pd-qty-hint");
  if (product.category === "swarm") {
    qtyHint.textContent = "Priced per drone — set the number of drones you want in your swarm below.";
    qtyHint.style.display = "";
  }

  const statusLine = document.getElementById("pd-status-line");
  const statusClass = product.status === "concept" ? "status-badge--concept" : "status-badge--active";
  const statusLabel = product.status === "concept" ? "CONCEPT" : "ACTIVE";
  let statusHTML = `<span class="status-badge ${statusClass}">${statusLabel}</span>`;
  if (product.partner) {
    statusHTML += `<span class="status-badge" style="color:var(--c-gray-light); border-color:var(--c-border);">Collaboration: ${window.escapeHtml(product.partner)}</span>`;
  }
  statusLine.innerHTML = statusHTML;

  const specRow = document.getElementById("pd-specs");
  specRow.innerHTML = Object.entries(product.specs || {})
    .map(([key, value]) => `<div><strong>${window.escapeHtml(String(value))}</strong><span>${window.escapeHtml(labelize(key))}</span></div>`)
    .join("");

  const priceEl = document.getElementById("pd-price");
  const totalEl = document.getElementById("pd-total");
  let qty = 1;

  function refreshPricing() {
    priceEl.textContent = window.formatINR(product.priceINR);
    totalEl.textContent = "Total: " + window.formatINR(product.priceINR * qty);
  }

  const isSwarm = product.category === "swarm";
  const qtyMax = isSwarm ? 100 : 20;
  const qtyTicks = isSwarm
    ? [{ value: 1, label: "1" }, { value: 25, label: "25" }, { value: 50, label: "50" }, { value: 75, label: "75" }, { value: 100, label: "100" }]
    : [{ value: 1, label: "1" }, { value: 5, label: "5" }, { value: 10, label: "10" }, { value: 15, label: "15" }, { value: 20, label: "20" }];

  window.SentinelSlider.mount(document.getElementById("pd-qty-slider"), {
    min: 1,
    max: qtyMax,
    step: 1,
    value: qty,
    label: isSwarm ? "Number of Drones" : "Quantity",
    format: (v) => (v < 10 ? "0" + v : String(v)),
    ticks: qtyTicks,
    onChange: (v) => {
      qty = v;
      refreshPricing();
    },
  });

  refreshPricing();

  const configureBtn = document.getElementById("pd-configure");
  if (product.configurable) {
    configureBtn.href = "forge-lab.html?product=" + encodeURIComponent(product.id);
    configureBtn.textContent = "Configure";
  } else {
    configureBtn.href = "customer-service.html";
    configureBtn.textContent = "Request Info";
  }

  document.getElementById("pd-add-cart").addEventListener("click", (e) => {
    window.SentinelCart.addItem({
      productId: product.id,
      name: product.name,
      config: null,
      configLabel: "Standard Configuration",
      unitPriceINR: product.priceINR,
      qty: qty,
    });
    const btn = e.currentTarget;
    const original = btn.textContent;
    btn.textContent = "Added ✓";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1300);
  });

  document.getElementById("pd-buy-now").addEventListener("click", () => {
    window.location.href = "procurement.html?buyNow=" + encodeURIComponent(product.id) + "&qty=" + qty;
  });
})();
