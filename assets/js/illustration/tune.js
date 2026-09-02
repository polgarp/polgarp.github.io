// TEMPORARY — a tuning panel for the background layer, not part of the site.
//
// Loaded only when `illo_tune: true` is set in _config.yml, and deleted along
// with that flag once the numbers are settled. Nothing else may depend on it:
// it reaches into engine internals on purpose, which is exactly why it must
// not ship.
//
// It drives four CSS custom properties on the layer, reseeds the field at a
// new grid pitch, and re-registers the `order` renderer with adjustable
// constants — so every number that matters can be found by looking rather
// than by guessing, and read off at the end.
(function () {
  "use strict";

  function start() {
    var layer = document.querySelector(".illo--bg");
    if (!layer || !window.Illo || !Illo.marks) return;

    var inst = null;
    for (var i = 0; i < Illo.instances.length; i++) {
      if (Illo.instances[i].el === layer) inst = Illo.instances[i];
    }
    if (!inst) return;

    // ---- Re-registered `order`, identical to verbs/order.js except that the
    // two constants and the accent are live. Reading these back at the end is
    // the point of the exercise.
    var clamp01 = Illo.marks.clamp01;
    var near2 = Illo.marks.near2;
    var render = Illo.marks.render;

    // Seeded from what the stylesheet actually computes, never from constants
    // written in here. A tuner that asserts its own defaults on load writes
    // them as INLINE styles, which outrank every rule in the sheet — so the
    // moment the real CSS changes, the panel silently becomes the source of
    // truth and the design you edited never appears. Read, then offer.
    var cs = getComputedStyle(layer);
    function num(prop, fallback) {
      var v = parseFloat(cs.getPropertyValue(prop));
      return isNaN(v) ? fallback : v;
    }

    var state = {
      opacity: num("--illo-bg-opacity", 0.14),
      fade: num("--illo-bg-fade", 55),
      // The height resolves through --hero-h, so read the box rather than the
      // property and express it the way the slider does.
      height: Math.round(100 * layer.getBoundingClientRect().height / window.innerHeight),
      cell: inst.sim.cell || 20,
      radius: 78,
      rate: 7,
      accent: true
    };

    var never = function () { return false; };
    var landed = function (i) { return !!inst.sim.landed[i]; };

    Illo.renderer("order", function (ctx, sim, ink) {
      if (sim.moving) {
        var r2 = state.radius * state.radius;
        for (var i = 0; i < sim.n; i++) {
          var q = near2(sim, i);
          if (q >= r2) continue;
          sim.aux[i] = clamp01(sim.aux[i] + (1 - q / r2) * state.rate * (1 / 60));
          if (sim.aux[i] > 0.6) sim.landed[i] = 1;
        }
      }
      render(ctx, sim, ink,
        function (i) { return 0.1 + sim.aux[i] * 0.9; },
        state.accent ? landed : never);
    });

    function applyCSS() {
      layer.style.setProperty("--illo-bg-opacity", state.opacity);
      layer.style.setProperty("--illo-bg-fade", state.fade + "%");
      layer.style.setProperty("--illo-h", state.height + "vh");
    }

    // Reseeding is the only way to change the grid pitch: the pitch is fixed
    // when the field is seeded. resize() bails when the box has not changed
    // size, so the cached width is cleared to force it through.
    function reseed() {
      inst.density = String(state.cell);
      inst.sim.w = 0;
      inst.resize();
    }

    // ---- Panel
    var panel = document.createElement("div");
    panel.id = "illo-tune";
    panel.innerHTML =
      '<style>' +
      '#illo-tune{position:fixed;top:.75rem;right:.75rem;z-index:9999;' +
      'font:11px/1.5 var(--font-mono),monospace;background:var(--paper);' +
      'color:var(--ink);border:1px solid var(--ink);padding:.6rem .7rem;' +
      'width:16rem;box-shadow:0 2px 12px rgb(0 0 0 / .12)}' +
      '#illo-tune h4{margin:0 0 .5rem;font-size:11px;text-transform:uppercase;' +
      'letter-spacing:.08em}' +
      '#illo-tune label{display:grid;grid-template-columns:5.2rem 1fr 2.6rem;' +
      'align-items:center;gap:.35rem;margin:.2rem 0}' +
      '#illo-tune input[type=range]{width:100%;margin:0}' +
      '#illo-tune output{text-align:right;font-variant-numeric:tabular-nums}' +
      '#illo-tune .row{display:flex;gap:.5rem;align-items:center;margin:.45rem 0 0}' +
      '#illo-tune pre{margin:.5rem 0 0;padding:.4rem;background:rgb(128 128 128 / .12);' +
      'white-space:pre-wrap;font:10px/1.45 var(--font-mono),monospace;' +
      'user-select:all;cursor:text}' +
      '#illo-tune .stat{margin:.45rem 0 0;color:var(--ink-muted);' +
      'font-variant-numeric:tabular-nums}' +
      '</style><h4>Background tuner</h4><div class="fields"></div>' +
      '<div class="row"><label style="display:flex;gap:.4rem;width:auto">' +
      '<input type="checkbox" id="illo-accent" checked> accent (red)</label></div>' +
      '<p class="stat"></p><pre></pre>';

    var fields = panel.querySelector(".fields");
    var specs = [
      ["opacity", "opacity", 0.02, 0.45, 0.005],
      ["fade", "bottom fade %", 0, 95, 1],
      ["height", "height vh", 20, 120, 1],
      ["cell", "grid pitch", 10, 40, 1],
      ["radius", "reach px", 20, 400, 2],
      ["rate", "rate/s", 1, 20, 0.5]
    ];

    specs.forEach(function (sp) {
      var key = sp[0];
      var l = document.createElement("label");
      l.innerHTML = "<span>" + sp[1] + "</span>" +
        '<input type="range" min="' + sp[2] + '" max="' + sp[3] +
        '" step="' + sp[4] + '" value="' + state[key] + '">' +
        "<output>" + state[key] + "</output>";
      var input = l.querySelector("input");
      var out = l.querySelector("output");
      input.addEventListener("input", function () {
        state[key] = parseFloat(input.value);
        out.textContent = state[key];
        if (key === "cell") { reseed(); }
        else if (key === "height") { applyCSS(); reseed(); }
        else { applyCSS(); }
        inst.wake();
        report();
      });
      fields.appendChild(l);
    });

    panel.querySelector("#illo-accent").addEventListener("change", function (e) {
      state.accent = e.target.checked;
      if (!state.accent) inst.sim.landed.fill(0);
      inst.wake();
    });

    var pre = panel.querySelector("pre");
    function report() {
      pre.textContent =
        "--illo-bg-opacity: " + state.opacity + ";\n" +
        "--illo-bg-fade: " + state.fade + "%;\n" +
        "--illo-h: " + state.height + "vh;\n" +
        "cell " + state.cell + " · ORDER_R " + state.radius +
        " · ORDER_RATE " + state.rate +
        " · accent " + (state.accent ? "on" : "off");
    }

    var stat = panel.querySelector(".stat");
    setInterval(function () {
      stat.textContent = inst.sim.n + " marks · " +
        inst.frameCost.toFixed(2) + " ms/frame · " +
        (inst.running ? "running" : "at rest, 0 ms");
    }, 250);

    document.body.appendChild(panel);
    // No applyCSS() here on purpose: see the note on `state` above. The panel
    // starts showing what the page already does, and writes nothing until a
    // slider moves.
    report();
  }

  if (document.readyState === "complete") setTimeout(start, 60);
  else window.addEventListener("load", function () { setTimeout(start, 60); });
})();
