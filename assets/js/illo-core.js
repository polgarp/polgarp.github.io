// Illustration engine. Points, a rule that moves them, a renderer that draws
// them. The engine knows nothing about any particular post: a rule supplies the
// targets and the forces, a renderer supplies the marks.
//
// Contract:
//   Illo.rule(name, factory)      factory(sim, opts) -> { seed, step }
//   Illo.renderer(name, fn)       fn(ctx, sim, ink)
//
// Everything runs on typed arrays and allocates nothing per frame, so a settled
// illustration costs exactly zero.
(function () {
  "use strict";

  var STEP = 1 / 60;          // fixed physics timestep, independent of refresh
  var MAX_CATCHUP = 5;        // don't spiral after a backgrounded tab
  var REST_ENERGY = 0.05;     // mean squared speed (px/s) below which we stop —
                              // ~0.2 px/s average, i.e. 0.003 px per frame
  var REST_FRAMES = 20;       // ...sustained this long
  var MAX_DPR = 2;            // 3x buys nothing at these mark sizes

  var rules = {};
  var renderers = {};
  var instances = [];

  // ---- Colour: read from the design tokens, never hard-coded here. Resolved
  // against the figure itself rather than the root, because custom properties
  // inherit — so a locally inverted section gets a correctly inverted
  // illustration for free.
  function readTokens(el, ink) {
    var cs = getComputedStyle(el);
    function tok(name, fallback) {
      var v = cs.getPropertyValue(name);
      return v ? v.trim() : fallback;
    }
    ink.fg = tok("--ink", "#000");
    ink.muted = tok("--ink-muted", "#6e6e6e");
    ink.accent = tok("--accent", "#d62828");
    ink.paper = tok("--paper", "#fff");
    return ink;
  }

  // ---- The simulation: structure-of-arrays, sized once, reused forever.
  function Sim() {
    this.n = 0;
    this.cap = 0;
    this.xs = this.ys = this.vxs = this.vys = null;
    this.txs = this.tys = null;
    this.hard = null;    // Uint8Array: 1 = resists settling
    this.landed = null;  // Uint8Array: 1 = seated by hand, locked
    this.w = 0;
    this.h = 0;
    this.px = -1e6;      // pointer, in logical px
    this.py = -1e6;
    this.pvx = 0;        // pointer velocity, px/s, smoothed
    this.pvy = 0;
    this.pspeed = 0;
    this.pointerOn = false;
    this.rng = null;
    this.cell = 8;
  }

  Sim.prototype.alloc = function (n) {
    if (n <= this.cap) { this.n = n; return; }
    this.cap = n;
    this.n = n;
    this.xs = new Float32Array(n);
    this.ys = new Float32Array(n);
    this.vxs = new Float32Array(n);
    this.vys = new Float32Array(n);
    this.txs = new Float32Array(n);
    this.tys = new Float32Array(n);
    this.hard = new Uint8Array(n);
    this.landed = new Uint8Array(n);
  };

  // ---- Deterministic RNG so an instance looks the same on every load, and so
  // the SVG exporter can reproduce the exact frame the browser would draw.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---- Sample text into grid-aligned target points. Shared by every rule that
  // wants marks to assemble into a word, and grid-aligned by construction so
  // the grid-bound renderer gets exact cells for free.
  function textTargets(text, w, h, cell, font) {
    var cols = Math.max(1, Math.floor(w / cell));
    var rows = Math.max(1, Math.floor(h / cell));
    var off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    var c = off.getContext("2d", { willReadFrequently: true });

    // Fit the word to the box by binary-searching the size in grid units.
    var lo = 1, hi = rows * 2, size = 1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      c.font = "700 " + mid + "px " + font;
      if (c.measureText(text).width <= cols * 0.92 && mid <= rows * 0.8) {
        size = mid; lo = mid + 1;
      } else { hi = mid - 1; }
    }

    c.clearRect(0, 0, cols, rows);
    c.font = "700 " + size + "px " + font;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#000";
    c.fillText(text, cols / 2, rows / 2);

    var data = c.getImageData(0, 0, cols, rows).data;
    var out = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (data[(y * cols + x) * 4 + 3] > 110) {
          out.push((x + 0.5) * cell, (y + 0.5) * cell);
        }
      }
    }
    return out;
  }

  // ---- One live illustration bound to one <figure>.
  function Instance(el) {
    this.el = el;
    this.ruleName = el.getAttribute("data-illo");
    this.rendererName = el.getAttribute("data-illo-render") || "grid";
    this.seed = parseInt(el.getAttribute("data-illo-seed"), 10) || 1;
    this.text = el.getAttribute("data-illo-text") || "INTENTION";
    this.sim = new Sim();
    this.rule = null;
    this.ctx = null;
    this.canvas = null;
    this.raf = 0;
    this.acc = 0;
    this.last = 0;
    this.restCount = 0;
    this.running = false;
    this.visible = false;
    this.frameCost = 0;   // rolling ms, for the bake-off readout
    this.ink = { fg: "#000", muted: "#6e6e6e", accent: "#d62828", paper: "#fff" };
  }

  Instance.prototype.mount = function () {
    var cv = document.createElement("canvas");
    cv.className = "illo__canvas";
    cv.setAttribute("aria-hidden", "true");
    this.el.appendChild(cv);
    this.canvas = cv;
    this.ctx = cv.getContext("2d", { alpha: true });
    this.el.classList.add("illo--live");
    readTokens(this.el, this.ink);

    var self = this;
    var lastT = 0;
    // Position and velocity only; all the work happens in the frame. Velocity
    // is what lets a rule respond to how you move, not just where you are —
    // a slow considered pass and a fast swipe should not feel the same.
    cv.addEventListener("pointermove", function (e) {
      var s = self.sim;
      var r = cv.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var now = e.timeStamp || performance.now();
      var dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0;
      if (dt > 0 && s.pointerOn) {
        // Smooth hard enough to ignore jitter, lightly enough to stay live.
        s.pvx = s.pvx * 0.6 + ((x - s.px) / dt) * 0.4;
        s.pvy = s.pvy * 0.6 + ((y - s.py) / dt) * 0.4;
        s.pspeed = Math.sqrt(s.pvx * s.pvx + s.pvy * s.pvy);
      }
      lastT = now;
      s.px = x;
      s.py = y;
      s.pointerOn = true;
      self.wake();
    }, { passive: true });

    cv.addEventListener("pointerleave", function () {
      var s = self.sim;
      s.pointerOn = false;
      s.px = s.py = -1e6;
      s.pvx = s.pvy = s.pspeed = 0;
      lastT = 0;
    }, { passive: true });

    this.resize();
  };

  Instance.prototype.resize = function () {
    var rect = this.el.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    if (w === this.sim.w && h === this.sim.h) return;

    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.sim.w = w;
    this.sim.h = h;
    this.sim.rng = mulberry32(this.seed);

    var factory = rules[this.ruleName];
    if (!factory) return;
    this.rule = factory(this.sim, { text: this.text, seed: this.seed });
    this.rule.seed();
    this.restCount = 0;
    this.wake();
  };

  Instance.prototype.wake = function () {
    this.restCount = 0;
    if (this.running || !this.visible) return;
    this.running = true;
    this.last = 0;
    this.acc = 0;
    var self = this;
    this.raf = requestAnimationFrame(function (t) { self.frame(t); });
  };

  Instance.prototype.sleep = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };

  Instance.prototype.frame = function (t) {
    var t0 = performance.now();
    if (!this.last) this.last = t;
    var dt = Math.min((t - this.last) / 1000, MAX_CATCHUP * STEP);
    this.last = t;
    this.acc += dt;

    // No pointermove events arrive while the cursor is held still, so decay
    // its velocity here — otherwise a stopped cursor would read as still
    // moving at whatever speed it last had.
    var s = this.sim;
    s.pvx *= 0.88;
    s.pvy *= 0.88;
    s.pspeed = Math.sqrt(s.pvx * s.pvx + s.pvy * s.pvy);

    var steps = 0;
    while (this.acc >= STEP && steps < MAX_CATCHUP) {
      this.rule.step(STEP);
      this.acc -= STEP;
      steps++;
    }

    var draw = renderers[this.rendererName] || renderers.grid;
    // A trail-based renderer fades the previous frame itself rather than
    // losing it to a clear.
    if (!draw.noClear) this.ctx.clearRect(0, 0, this.sim.w, this.sim.h);
    draw(this.ctx, this.sim, this.ink);

    this.frameCost = this.frameCost * 0.9 + (performance.now() - t0) * 0.1;

    // Rest detection: mean squared speed, sustained. A cursor resting on a
    // settled field is genuinely at rest, so this keys off pointer *motion*
    // rather than mere presence.
    var e = 0;
    for (var i = 0; i < s.n; i++) e += s.vxs[i] * s.vxs[i] + s.vys[i] * s.vys[i];
    if (s.n && e / s.n < REST_ENERGY && s.pspeed < 6) this.restCount++;
    else this.restCount = 0;

    if (this.restCount > REST_FRAMES) { this.sleep(); return; }

    var self = this;
    this.raf = requestAnimationFrame(function (n) { self.frame(n); });
  };

  // ---- Boot
  function boot() {
    if (!document.createElement("canvas").getContext) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var els = document.querySelectorAll("[data-illo]");
    if (!els.length) return;

    els.forEach(function (el) {
      var inst = new Instance(el);
      if (!rules[inst.ruleName]) return;
      inst.mount();
      instances.push(inst);
    });
    if (!instances.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var inst = null;
        for (var i = 0; i < instances.length; i++) {
          if (instances[i].el === entry.target) { inst = instances[i]; break; }
        }
        if (!inst) return;
        inst.visible = entry.isIntersecting;
        if (entry.isIntersecting) inst.wake();
        else inst.sleep();
      });
    }, { rootMargin: "120px" });
    instances.forEach(function (i) { io.observe(i.el); });

    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        instances.forEach(function (i) { i.resize(); });
      }, 150);
    }, { passive: true });

    // Theme: theme.js writes data-theme on <html>; the OS query covers the
    // rest. No change to theme.js needed — it already writes what we watch.
    function reink() {
      instances.forEach(function (i) { readTokens(i.el, i.ink); i.wake(); });
    }
    new MutationObserver(reink).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", reink);
  }

  window.Illo = {
    rule: function (name, factory) { rules[name] = factory; },
    renderer: function (name, fn) { renderers[name] = fn; },
    textTargets: textTargets,
    mulberry32: mulberry32,
    instances: instances,
    boot: boot,
    // Bake-off only: lets the harness weigh each candidate's own source.
    _src: function (name) { return renderers[name] ? renderers[name].toString() : ""; }
  };

  // Deferred scripts run while readyState is already "interactive", so
  // anything short of "complete" still has DOMContentLoaded ahead of it — and
  // waiting for it is what guarantees every rule file has registered first.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
