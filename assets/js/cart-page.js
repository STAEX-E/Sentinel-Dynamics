/* ============================================================
   Sentinel Dynamics — My Cart page
   ============================================================ */

(function () {
  "use strict";

  const itemsEl = document.getElementById("cart-items");
  if (!itemsEl) return;

  const emptyEl = document.getElementById("cart-empty");
  const summaryEl = document.getElementById("cart-summary");
  const totalEl = document.getElementById("cart-total");
  const titleEl = document.getElementById("cart-title");
  const subtitleEl = document.getElementById("cart-subtitle");

  const CUSTOM_BUILD_ICON =
    '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z"/>';

  function iconFor(item) {
    if (item.productId) {
      const product = (window.SENTINEL_PRODUCTS || []).find((p) => p.id === item.productId);
      if (product) return window.SentinelIcons.svg(product.icon);
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + CUSTOM_BUILD_ICON + "</svg>";
  }

  function render() {
    const cart = window.SentinelCart.readCart();
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

    if (cart.length === 0) {
      emptyEl.style.display = "";
      summaryEl.style.display = "none";
      itemsEl.innerHTML = "";
      titleEl.textContent = "Your Cart";
      subtitleEl.textContent = "Your cart is currently empty.";
      return;
    }

    emptyEl.style.display = "none";
    summaryEl.style.display = "";
    titleEl.textContent = "Your Cart";
    subtitleEl.textContent = count + (count === 1 ? " item" : " items") + " ready for procurement.";

    itemsEl.innerHTML = cart
      .map((item) => {
        const lineTotal = (item.unitPriceINR || 0) * (item.qty || 1);
        const editHref = item.config
          ? "forge-lab.html?restore=" + encodeURIComponent(item.cartItemId)
          : item.productId
          ? "product-detail.html?id=" + encodeURIComponent(item.productId)
          : null;
        return `
        <article class="panel cart-item" data-cart-item-id="${item.cartItemId}">
          <div class="cart-item__visual">${iconFor(item)}</div>
          <div class="cart-item__body">
            <h4>${window.escapeHtml(item.name)}</h4>
            <div class="cart-item__config">${window.escapeHtml(item.configLabel || "Standard Configuration")}</div>
            <div class="cart-item__price">${window.formatINR(item.unitPriceINR)} × ${item.qty} = <strong>${window.formatINR(lineTotal)}</strong></div>
          </div>
          <div class="cart-item__actions">
            <div class="rslider rslider--compact" id="qty-slider-${item.cartItemId}"></div>
            <div class="cart-item__links">
              ${editHref ? `<a href="${editHref}">Edit Configuration</a>` : ""}
              <button type="button" data-action="remove">Remove</button>
              <a href="procurement.html?buyNow=cartitem&id=${encodeURIComponent(item.cartItemId)}">Buy Now</a>
            </div>
          </div>
        </article>`;
      })
      .join("");

    totalEl.textContent = window.formatINR(window.SentinelCart.getTotal());

    cart.forEach((item) => {
      const product = item.productId ? (window.SENTINEL_PRODUCTS || []).find((p) => p.id === item.productId) : null;
      const isSwarm = product && product.category === "swarm";
      const max = isSwarm ? 100 : 20;
      window.SentinelSlider.mount(document.getElementById("qty-slider-" + item.cartItemId), {
        min: 1,
        max,
        step: 1,
        value: item.qty || 1,
        label: isSwarm ? "Number of Drones" : "Quantity",
        format: (v) => (v < 10 ? "0" + v : String(v)),
        onChange: (v) => {
          window.SentinelCart.updateQty(item.cartItemId, v);
          const priceLine = document.querySelector(`[data-cart-item-id="${item.cartItemId}"] .cart-item__price`);
          if (priceLine) {
            priceLine.innerHTML = `${window.formatINR(item.unitPriceINR)} × ${v} = <strong>${window.formatINR(item.unitPriceINR * v)}</strong>`;
          }
          totalEl.textContent = window.formatINR(window.SentinelCart.getTotal());
        },
      });
    });
  }

  itemsEl.addEventListener("click", (e) => {
    const card = e.target.closest("[data-cart-item-id]");
    if (!card) return;
    if (e.target.closest('[data-action="remove"]')) {
      window.SentinelCart.removeItem(card.dataset.cartItemId);
      render();
    }
  });

  render();
})();
