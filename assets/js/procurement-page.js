/* ============================================================
   Sentinel Dynamics — Procurement page
   Handles four entry modes:
   1. ?buyNow=<productId>&qty=N   — single product, built fresh
   2. ?buyNow=forge               — single custom build (Forge Lab)
   3. ?buyNow=cartitem&id=<id>    — single persisted cart item
   4. (no params)                 — full persisted cart
   ============================================================ */

(function () {
  "use strict";

  const itemsEl = document.getElementById("procurement-items");
  if (!itemsEl) return;

  const params = new URLSearchParams(window.location.search);
  const buyNow = params.get("buyNow");

  let items = [];
  let mode = "cart";
  let singleCartItemId = null;

  if (buyNow === "forge") {
    mode = "forge";
    try {
      const raw = localStorage.getItem("sentinelBuyNowItem.v1");
      if (raw) {
        const item = JSON.parse(raw);
        items = [Object.assign({ cartItemId: "buynow-forge" }, item)];
      }
    } catch (e) { /* ignore */ }
  } else if (buyNow === "cartitem") {
    mode = "cartitem";
    singleCartItemId = params.get("id");
    const cart = window.SentinelCart.readCart();
    const found = cart.find((i) => i.cartItemId === singleCartItemId);
    if (found) items = [found];
  } else if (buyNow) {
    mode = "product";
    const product = (window.SENTINEL_PRODUCTS || []).find((p) => p.id === buyNow);
    if (product) {
      const qty = Math.max(1, parseInt(params.get("qty"), 10) || 1);
      const variantId = params.get("variant");
      const variant = variantId && Array.isArray(product.variants) ? product.variants.find((v) => v.id === variantId) : null;
      items = [
        {
          cartItemId: "buynow-product",
          productId: product.id,
          name: variant ? variant.name : product.name,
          config: variant ? variant.id : null,
          configLabel: variant ? variant.name : "Standard Configuration",
          unitPriceINR: variant ? variant.priceINR : product.priceINR,
          qty: qty,
        },
      ];
    }
  } else {
    mode = "cart";
    items = window.SentinelCart.readCart();
  }

  function render() {
    if (items.length === 0) {
      itemsEl.innerHTML = '<p class="lead">Nothing to procure yet. <a class="text-link" href="products.html">Browse the catalog <span class="arrow">→</span></a></p>';
      document.getElementById("procurement-summary").style.display = "none";
      document.getElementById("procurement-form-panel").style.display = "none";
      return;
    }

    itemsEl.innerHTML = items
      .map((item) => {
        const lineTotal = (item.unitPriceINR || 0) * (item.qty || 1);
        return `<div class="panel" style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
          <div>
            <h4 style="margin:0 0 .3rem;">${window.escapeHtml(item.name)}</h4>
            <div style="font-size:.8rem; color:var(--c-gray-light);">${window.escapeHtml(item.configLabel || "Standard Configuration")} · Qty ${item.qty}</div>
          </div>
          <div style="font-weight:800; font-size:1.05rem;">${window.formatINR(lineTotal)}</div>
        </div>`;
      })
      .join("");

    const subtotal = items.reduce((s, i) => s + (i.unitPriceINR || 0) * (i.qty || 1), 0);
    document.getElementById("proc-subtotal").textContent = window.formatINR(subtotal);
    document.getElementById("proc-total").textContent = window.formatINR(subtotal);
  }

  render();

  function genReference() {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    return "SD-" + stamp + "-" + rand;
  }

  const form = document.getElementById("procurement-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (items.length === 0) return;
      if (window.SentinelVerify && !window.SentinelVerify.isVerified()) {
        window.SentinelVerify.lockPageUntilVerified();
        return;
      }

      const ref = genReference();

      if (mode === "cart") {
        window.SentinelCart.clearCart();
      } else if (mode === "cartitem" && singleCartItemId) {
        window.SentinelCart.removeItem(singleCartItemId);
      } else if (mode === "forge") {
        try { localStorage.removeItem("sentinelBuyNowItem.v1"); } catch (err) { /* ignore */ }
      }

      document.getElementById("procurement-items").style.display = "none";
      document.getElementById("procurement-summary").style.display = "none";
      document.getElementById("procurement-form-panel").style.display = "none";
      const received = document.getElementById("request-received");
      received.style.display = "";
      document.getElementById("ref-number").textContent = "Reference: " + ref;
      received.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();
