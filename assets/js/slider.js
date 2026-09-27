/* ============================================================
   Sentinel Dynamics — Reusable range slider
   A single styled control used everywhere a number is picked:
   Forge Lab's frame size / budget sliders, product quantity,
   and cart line-item quantity. Pure <input type="range">, styled,
   with a live value readout and optional tick labels.
   ============================================================ */

(function () {
  "use strict";

  function updateFill(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value);
    const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--fill", pct + "%");
  }

  /**
   * Mount a slider into `root` (a container element).
   * opts: {
   *   min, max, step, value,
   *   label,                 // small caption above the value
   *   format(val) -> string, // renders the big value readout (defaults to plain number)
   *   ticks: [{ value, label }],
   *   onChange(val)
   * }
   */
  function mount(root, opts) {
    const format = opts.format || ((v) => String(v));
    root.classList.add("rslider");
    root.innerHTML =
      '<div class="rslider__head">' +
        (opts.label ? `<span class="rslider__label">${opts.label}</span>` : "<span></span>") +
        '<span class="rslider__value"></span>' +
      "</div>" +
      `<input type="range" class="rslider__input" min="${opts.min}" max="${opts.max}" step="${opts.step || 1}" value="${opts.value}">` +
      (opts.ticks && opts.ticks.length
        ? '<div class="rslider__ticks">' + opts.ticks.map((t) => `<span data-value="${t.value}">${t.label}</span>`).join("") + "</div>"
        : "");

    const input = root.querySelector(".rslider__input");
    const valueEl = root.querySelector(".rslider__value");
    const tickEls = root.querySelectorAll(".rslider__ticks span");

    function render() {
      updateFill(input);
      valueEl.textContent = format(Number(input.value));
      tickEls.forEach((t) => t.classList.toggle("is-active", Number(t.dataset.value) === Number(input.value)));
    }

    input.addEventListener("input", () => {
      render();
      if (opts.onChange) opts.onChange(Number(input.value));
    });

    render();

    return {
      get value() { return Number(input.value); },
      setValue(v) {
        input.value = v;
        render();
      },
      input,
    };
  }

  window.SentinelSlider = { mount };
})();
