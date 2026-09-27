/* ============================================================
   Sentinel Dynamics — Defense Procurement Eligibility Gate
   Gates the Cart and Procurement pages behind an eligibility check:
   1. Defense PSU / R&D organization (DRDO, BEL, HAL, BDL, etc.) —
      completes an identity/organization attestation to unlock
      online checkout.
   2. Army / Air Force / Navy personnel — cannot self-checkout
      online; directed to call/contact Sentinel Dynamics directly.
   3. Anyone else — blocked, directed to Customer Service.
   Client-side only: this is an attestation, not a real government
   ID or organization check, and is stated as such in the UI.
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
    overlay.innerHTML = '<div class="id-verify-panel panel" id="iv-panel"></div>';
    document.body.appendChild(overlay);
    const panel = overlay.querySelector("#iv-panel");

    function renderStep1() {
      panel.innerHTML =
        '<div class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M13.5 10h4M13.5 14h3"/></svg></div>' +
        "<h2>Defense Procurement Eligibility</h2>" +
        '<p class="lead" style="margin:0 0 1.2rem;">Checkout is restricted to eligible defense customers. Which of these describes you?</p>' +
        '<div class="iv-options">' +
          '<button type="button" class="iv-option" data-choice="org">' +
            '<strong>Defense organization under the MoD</strong>' +
            '<span>DRDO, BEL, HAL, BDL and similar defense PSU / R&amp;D organizations</span>' +
          "</button>" +
          '<button type="button" class="iv-option" data-choice="forces">' +
            '<strong>Army, Air Force, or Navy personnel</strong>' +
            '<span>Serving personnel of the Indian Armed Forces</span>' +
          "</button>" +
          '<button type="button" class="iv-option" data-choice="none">' +
            '<strong>None of the above</strong>' +
            '<span>Not affiliated with a defense organization or the armed forces</span>' +
          "</button>" +
        "</div>";
      panel.querySelectorAll(".iv-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.choice === "org") renderOrgForm();
          else if (btn.dataset.choice === "forces") renderForcesMessage();
          else renderBlockedMessage();
        });
      });
    }

    function backLink() {
      return '<button type="button" class="text-link iv-back" id="iv-back" style="margin-top:1.4rem;"><span class="arrow">←</span> Back</button>';
    }

    function wireBack() {
      const back = panel.querySelector("#iv-back");
      if (back) back.addEventListener("click", renderStep1);
    }

    function renderOrgForm() {
      panel.innerHTML =
        '<div class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M13.5 10h4M13.5 14h3"/></svg></div>' +
        "<h2>Organization Verification</h2>" +
        '<p class="lead" style="margin:0 0 1.2rem;">Complete the details below to unlock your cart and continue to direct, tender-free procurement.</p>' +
        '<form id="id-verify-form">' +
          '<div class="form-field"><label for="iv-name">Full Name</label><input type="text" id="iv-name" autocomplete="name" required></div>' +
          '<div class="form-field"><label for="iv-org">Organization</label><input type="text" id="iv-org" placeholder="e.g. DRDO, BEL, HAL, BDL" required></div>' +
          '<div class="form-field"><label for="iv-id">Employee / Service ID</label><input type="text" id="iv-id" required></div>' +
          '<div class="form-field"><label for="iv-email">Official Email</label><input type="email" id="iv-email" autocomplete="email" required></div>' +
          '<label class="id-verify-attest"><input type="checkbox" id="iv-attest" required> I confirm I am an authorized member of a defense organization under the Ministry of Defence and the information above is accurate.</label>' +
          '<p class="id-verify-error" id="iv-error" style="display:none;">Please complete every field and confirm the attestation to continue.</p>' +
          '<button type="submit" class="btn btn--primary btn--block" id="iv-submit">Verify &amp; Continue</button>' +
          '<p style="font-size:.72rem; color:var(--c-gray); margin-top:1rem;">This is an organization attestation, not a government ID check. Sentinel Dynamics may request further verification before final procurement approval.</p>' +
        "</form>" +
        backLink();

      wireBack();
      const form = panel.querySelector("#id-verify-form");
      const errorEl = panel.querySelector("#iv-error");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = panel.querySelector("#iv-name").value.trim();
        const org = panel.querySelector("#iv-org").value.trim();
        const serviceId = panel.querySelector("#iv-id").value.trim();
        const email = panel.querySelector("#iv-email").value.trim();
        const attested = panel.querySelector("#iv-attest").checked;

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

    function renderForcesMessage() {
      panel.innerHTML =
        '<div class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg></div>' +
        "<h2>Please Call to Complete Checkout</h2>" +
        '<p class="lead" style="margin:0 0 1rem;">Online self-checkout isn\'t available for Army, Air Force or Navy personnel. Please contact our Defense Procurement Desk directly and our team will complete your order over the phone.</p>' +
        '<p style="margin:0 0 1.4rem;">Reach us through the <a class="text-link" href="customer-service.html">Customer Service</a> page and select "Procurement Assistance" — a member of our team will call you back to arrange payment-free, verified checkout.</p>' +
        '<a class="btn btn--primary btn--block" href="customer-service.html">Go to Customer Service</a>' +
        backLink();
      wireBack();
    }

    function renderBlockedMessage() {
      panel.innerHTML =
        '<div class="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="m4.9 4.9 14.2 14.2"/></svg></div>' +
        "<h2>Checkout Restricted</h2>" +
        '<p class="lead" style="margin:0 0 1.4rem;">This procurement channel is restricted to defense organizations under the Ministry of Defence and serving armed forces personnel. For general inquiries, please visit Customer Service.</p>' +
        '<a class="btn btn--primary btn--block" href="customer-service.html">Go to Customer Service</a>' +
        backLink();
      wireBack();
    }

    renderStep1();
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
