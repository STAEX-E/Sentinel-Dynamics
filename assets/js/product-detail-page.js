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
    visual.innerHTML = `<img src="${window.escapeHtml(src)}" alt="${window.escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;">`;
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
  const qtyInput = document.getElementById("qty-input");
  let qty = 1;

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function refreshPricing() {
    qtyInput.value = pad2(qty);
    priceEl.textContent = window.formatINR(product.priceINR);
    totalEl.textContent = "Total: " + window.formatINR(product.priceINR * qty);
  }
  refreshPricing();

  document.getElementById("qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    refreshPricing();
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty = Math.min(99, qty + 1);
    refreshPricing();
  });

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
