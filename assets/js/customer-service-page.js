/* ============================================================
   Sentinel Dynamics — Customer Service: FAQ accordion + request form
   ============================================================ */

(function () {
  "use strict";

  const faqList = document.getElementById("faq-list");
  if (!faqList) return;

  const FAQS = [
    {
      q: "Are the CONCEPT platforms available to purchase?",
      a: "CONCEPT platforms represent our forward-looking design work and are not yet in production. Use Forge Lab or the contact form to discuss timelines and feasibility for a specific mission requirement.",
    },
    {
      q: "How accurate are the prices shown on the site?",
      a: "Every price on the site is an estimate for planning purposes. Final pricing depends on configuration, quantity and procurement route, and is confirmed directly with our team before any commitment.",
    },
    {
      q: "Can I get help building a Forge Lab configuration?",
      a: "Yes — use the Configuration Assistance category on the request form below, or reach out with your Forge Lab configuration link and we'll review it with you.",
    },
    {
      q: "How does the procurement process work?",
      a: "See the Business Model page for the full journey. In short: requirement, engineering, demonstration, eligibility verification, direct procurement, production and delivery, training and deployment, and lifetime support.",
    },
    {
      q: "Do you offer support after delivery?",
      a: "Yes — every delivered platform includes warranty coverage, spare parts access, maintenance support and 24/7 technical assistance for the operational life of the system.",
    },
    {
      q: "Can I compare multiple platforms before deciding?",
      a: "Yes — use the Compare Systems page to view up to four platforms side by side across specifications, configurability and estimated price.",
    },
  ];

  faqList.innerHTML = FAQS.map(
    (f, i) => `<div class="faq-item reveal" data-index="${i}">
      <button type="button" class="faq-item__q">
        <span>${window.escapeHtml(f.q)}</span>
        <span class="chev">▼</span>
      </button>
      <div class="faq-item__a"><p>${window.escapeHtml(f.a)}</p></div>
    </div>`
  ).join("");

  faqList.querySelectorAll(".faq-item__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".faq-item").classList.toggle("is-open");
    });
  });

  const form = document.getElementById("cs-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ref = "SD-CS-" + Date.now().toString(36).toUpperCase().slice(-6);
      document.getElementById("cs-form-panel").style.display = "none";
      const received = document.getElementById("cs-received");
      received.style.display = "";
      document.getElementById("cs-ref").textContent = "Reference: " + ref;
      received.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
