/* ============================================================
   Sentinel Dynamics — Defense Personnel ID Verification
   Gates the Cart and Procurement pages behind an identity/
   organization attestation. Client-side only: this is not a
   real government ID check, and is stated as such in the UI.
   ============================================================ */

(function () {
  "use strict";

  const KEY = "sentinelVerifiedPersonnel.v1";

  function isVerified() {
    try {
      return !!JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return false;
    }
  }

  function setVerified(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.assign({ verifiedAt: Date.now() }, data)));
    } catch (e) { /* storage unavailable */ }
  }

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "id-verify-overlay";
    overlay.innerHTML =
      '<div class="id-verify-panel panel">' +
        '<div class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M13.5 10h4M13.5 14h3"/></svg></div>' +
        "<h2>Defense Personnel Verification</h2>" +
        '<p class="lead" style="margin:0 0 1.2rem;">Checkout is restricted to verified defense, government and authorized procurement personnel. Complete the details below to unlock your cart and continue to direct, tender-free procurement.</p>' +
        '<form id="id-verify-form">' +
          '<div class="form-field"><label for="iv-name">Full Name</label><input type="text" id="iv-name" autocomplete="name" required></div>' +
          '<div class="form-field"><label for="iv-org">Organization / Unit</label><input type="text" id="iv-org" required></div>' +
          '<div class="form-field"><label for="iv-id">Service / Employee ID</label><input type="text" id="iv-id" required></div>' +
          '<div class="form-field"><label for="iv-email">Official Email</label><input type="email" id="iv-email" autocomplete="email" required></div>' +
          '<label class="id-verify-attest"><input type="checkbox" id="iv-attest" required> I confirm I am authorized defense, government, or approved procurement personnel and the information above is accurate.</label>' +
          '<p class="id-verify-error" id="iv-error" style="display:none;">Please complete every field and confirm the attestation to continue.</p>' +
          '<button type="submit" class="btn btn--primary btn--block" id="iv-submit">Verify &amp; Continue</button>' +
          '<p style="font-size:.72rem; color:var(--c-gray); margin-top:1rem;">This is an identity attestation, not a government ID check. Sentinel Dynamics may request further verification before final procurement approval.</p>' +
        "</form>" +
      "</div>";
    document.body.appendChild(overlay);

    const form = overlay.querySelector("#id-verify-form");
    const errorEl = overlay.querySelector("#iv-error");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = overlay.querySelector("#iv-name").value.trim();
      const org = overlay.querySelector("#iv-org").value.trim();
      const serviceId = overlay.querySelector("#iv-id").value.trim();
      const email = overlay.querySelector("#iv-email").value.trim();
      const attested = overlay.querySelector("#iv-attest").checked;

      if (!name || !org || !serviceId || !email || !attested) {
        errorEl.style.display = "";
        return;
      }

      errorEl.style.display = "none";
      setVerified({ name, org, serviceId, email });
      document.body.classList.remove("id-verify-locked");
      overlay.remove();
    });
  }

  function lockPageUntilVerified() {
    if (isVerified()) return;
    document.body.classList.add("id-verify-locked");
    buildOverlay();
  }

  window.SentinelVerify = { isVerified, lockPageUntilVerified };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lockPageUntilVerified);
  } else {
    lockPageUntilVerified();
  }
})();
