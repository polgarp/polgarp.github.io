// Illustration engine. Boots every [data-illo] element on the page, runs a
// fixed-timestep simulation for each, and draws it through a named renderer.
//
//   Illo.rule(name, factory)     factory(sim, opts) -> { seed(), step(dt) }
//   Illo.renderer(name, fn)      fn(ctx, sim, ink)
//   Illo.pathTargets(...)        sample SVG path data onto the grid
//
// Element attributes: data-illo (rule), data-illo-render (renderer),
// data-illo-path, data-illo-fit, data-illo-seed. See _includes/illustration.
//
// A rule owns geometry and sets sim.busy while it still has work; a renderer
// draws and may write per-point state. Both run on typed arrays and must not
// allocate per frame — the loop stops when the field settles, and GC pauses
// are visible in slow motion.
(function () {
  "use strict";

  var STEP = 1 / 60;          // fixed physics timestep, independent of refresh
  var MAX_CATCHUP = 5;        // don't spiral after a backgrounded tab
  var REST_ENERGY = 0.05;     // mean squared speed (px/s) counted as stopped:
                              // ~0.2 px/s average, 0.003 px per frame
  var REST_FRAMES = 20;       // ...sustained this long
  var MAX_DPR = 2;            // 3x buys nothing at these mark sizes

  var rules = {};
  var renderers = {};
  var instances = [];

  // ---- One pointer, tracked at window level and shared by every instance,
  // so an illustration reacts to the cursor anywhere on the page rather than
  // only when it is over the canvas. Required for background-layer instances,
  // which never receive pointer events of their own.
  var ptr = { x: -1e6, y: -1e6, vx: 0, vy: 0, speed: 0, t: 0, on: false };
  var PTR_DECAY = 130;   // ms for a stopped cursor's speed to fall to ~1/e
  var PTR_MARGIN = 220;  // how far outside a figure the cursor still wakes it

  function pointerSpeedNow() {
    if (!ptr.on) return 0;
    var age = performance.now() - ptr.t;
    return ptr.speed * Math.exp(-age / PTR_DECAY);
  }

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
    this.hard = null;    // Uint8Array: 1 = accent-eligible, fixed at seed
    this.landed = null;  // Uint8Array: 1 = changed by the reader
    this.w = 0;
    this.h = 0;
    this.px = -1e6;      // pointer, in logical px
    this.py = -1e6;
    this.pspeed = 0;     // pointer speed, px/s, decayed from the last move
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
    // Generic per-point scalar a rule defines the meaning of. For `field` it
    // is how settled the point is, 0 chaotic to 1 resolved — which is also
    // what most renderers read as tone.
    this.aux = new Float32Array(n);
  };

  // ---- Deterministic RNG, seeded per instance, so an illustration looks the
  // same on every load and data-illo-seed is a stable way to vary it.
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

  // ---- Turn any drawn mask into grid-aligned target points.
  //
  // The subject is whatever `paint` draws into a cols x rows bitmap. Sampling
  // at grid resolution means every target lands on a cell by construction, so
  // the marks are grid-true whatever the shape is.
  function maskTargets(w, h, cell, paint) {
    var cols = Math.max(1, Math.floor(w / cell));
    var rows = Math.max(1, Math.floor(h / cell));
    var off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    var c = off.getContext("2d", { willReadFrequently: true });
    c.fillStyle = "#000";
    paint(c, cols, rows);

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

  // ---- Sample SVG path data onto the grid. The path comes from the include
  // (see _data/illo_shapes.yml), which emits the same string into the static
  // fallback, so both representations are built from one source.
  // `fit` is "contain" (keep the aspect ratio) or "wide" (stretch to fill).
  // A rectangle has no meaningful proportions and reads better filling the
  // column; anything round or angled would look wrong stretched, so the
  // choice belongs to the shape and travels with it in the data file.
  function pathTargets(d, vbW, vbH, w, h, cell, fit, fillRatio) {
    var p = new Path2D(d);
    var ratio = fillRatio || 0.92;
    return maskTargets(w, h, cell, function (c, cols, rows) {
      var kx, ky;
      if (fit === "wide") {
        kx = (cols / vbW) * ratio;
        ky = (rows / vbH) * ratio;
      } else {
        kx = ky = Math.min(cols / vbW, rows / vbH) * ratio;
      }
      c.save();
      c.translate((cols - vbW * kx) / 2, (rows - vbH * ky) / 2);
      c.scale(kx, ky);
      c.fill(p);
      c.restore();
    });
  }

  // ---- One live illustration bound to one <figure>.
  function Instance(el) {
    this.el = el;
    this.ruleName = el.getAttribute("data-illo");
    this.rendererName = el.getAttribute("data-illo-render") || "order";
    this.seed = parseInt(el.getAttribute("data-illo-seed"), 10) || 1;
    // Geometry comes from the include, which emitted the same path into the
    // static SVG. One source, so the live and fallback versions cannot drift.
    this.path = el.getAttribute("data-illo-path") || "";
    this.fit = el.getAttribute("data-illo-fit") || "contain";
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
    this.shown = false;   // has a frame drawn? gates hiding the fallback
    this.frameCost = 0;   // rolling ms, exposed for profiling
    this.ink = { fg: "#000", muted: "#6e6e6e", accent: "#d62828", paper: "#fff" };
  }

  Instance.prototype.mount = function () {
    var stage = this.el.querySelector(".illo__stage") || this.el;
    var cv = document.createElement("canvas");
    cv.className = "illo__canvas";
    cv.setAttribute("aria-hidden", "true");
    stage.appendChild(cv);
    this.stage = stage;
    this.canvas = cv;
    this.ctx = cv.getContext("2d", { alpha: true });
    readTokens(this.el, this.ink);
    // The static fallback stays visible until a frame has actually drawn (see
    // frame()). Anything that throws before then leaves a real picture on the
    // page rather than an empty box.

    this.resize();
  };

  Instance.prototype.resize = function () {
    var rect = (this.stage || this.el).getBoundingClientRect();
    this.rect = rect;
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
    this.rule = factory(this.sim, {
      path: this.path, fit: this.fit, seed: this.seed
    });
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

    // Map the shared page-level pointer into this instance's coordinates.
    // The rect is cached and refreshed on scroll/resize rather than measured
    // per frame, so this triggers no layout.
    var s = this.sim;
    var r = this.rect;
    s.px = ptr.x - r.left;
    s.py = ptr.y - r.top;
    s.pointerOn = ptr.on;
    s.pinside = s.px >= 0 && s.py >= 0 && s.px <= s.w && s.py <= s.h;
    // Speed decays from the last move's timestamp, so a cursor held still
    // reads as still — without any per-instance state to get out of sync.
    s.pspeed = pointerSpeedNow();

    var steps = 0;
    while (this.acc >= STEP && steps < MAX_CATCHUP) {
      this.rule.step(STEP);
      this.acc -= STEP;
      steps++;
    }

    var draw = renderers[this.rendererName] || renderers.order;
    // A renderer may set noClear to fade the previous frame itself.
    if (!draw.noClear) this.ctx.clearRect(0, 0, this.sim.w, this.sim.h);
    draw(this.ctx, this.sim, this.ink);

    this.frameCost = this.frameCost * 0.9 + (performance.now() - t0) * 0.1;

    // Pixels exist now, so it is safe to hide the fallback.
    if (!this.shown) {
      this.shown = true;
      this.el.classList.add("illo--live");
    }

    // Rest detection: mean squared speed, sustained, and gated on sim.busy so
    // a rule can hold the loop open. Keyed on pointer motion rather than
    // presence, so a stationary cursor over a settled field still rests.
    var e = 0;
    for (var i = 0; i < s.n; i++) e += s.vxs[i] * s.vxs[i] + s.vys[i] * s.vys[i];
    if (s.n && !s.busy && e / s.n < REST_ENERGY && s.pspeed < 6) this.restCount++;
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
      try {
        inst.mount();
        instances.push(inst);
      } catch (e) {
        // Leave this figure showing its static fallback and carry on with the
        // rest of the page.
        if (inst.canvas && inst.canvas.parentNode) {
          inst.canvas.parentNode.removeChild(inst.canvas);
        }
        el.classList.remove("illo--live");
      }
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

    // Scrolling moves every figure relative to the viewport, so cached rects
    // must follow. Coalesced into one frame, never measured per event.
    var rectTick = false;
    function refreshRects() {
      instances.forEach(function (i) {
        if (i.visible) i.rect = (i.stage || i.el).getBoundingClientRect();
      });
      rectTick = false;
    }
    window.addEventListener("scroll", function () {
      // Scrolling moves a figure past a stationary cursor, which would
      // otherwise read exactly like sweeping the cursor across the figure —
      // so a reader scrolling the page with the mouse resting over the column
      // would trigger every verb without ever pointing at anything. Treat
      // scrolling as disengaging the pointer until it genuinely moves again.
      ptr.on = false;
      ptr.speed = ptr.vx = ptr.vy = 0;
      if (!rectTick) { rectTick = true; requestAnimationFrame(refreshRects); }
    }, { passive: true });

    // One pointer listener for the whole page, however many figures exist.
    var lastT = 0;
    window.addEventListener("pointermove", function (e) {
      var now = e.timeStamp || performance.now();
      var dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0;
      if (dt > 0 && ptr.on) {   // ptr.on false right after a scroll
        // Smoothed hard enough to ignore jitter, lightly enough to stay live.
        ptr.vx = ptr.vx * 0.6 + ((e.clientX - ptr.x) / dt) * 0.4;
        ptr.vy = ptr.vy * 0.6 + ((e.clientY - ptr.y) / dt) * 0.4;
        ptr.speed = Math.sqrt(ptr.vx * ptr.vx + ptr.vy * ptr.vy);
      }
      lastT = now;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.t = now;
      ptr.on = true;
      // Wake only instances the cursor could plausibly affect.
      instances.forEach(function (i) {
        var r = i.rect;
        if (!r) return;
        if (e.clientX > r.left - PTR_MARGIN && e.clientX < r.right + PTR_MARGIN &&
            e.clientY > r.top - PTR_MARGIN && e.clientY < r.bottom + PTR_MARGIN) {
          i.wake();
        }
      });
    }, { passive: true });

    window.addEventListener("blur", function () {
      ptr.on = false;
      ptr.speed = ptr.vx = ptr.vy = 0;
      lastT = 0;
    });

    // theme.js writes data-theme on <html>; observing the attribute avoids
    // coupling to it. The media query covers the unset-preference case.
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
    pathTargets: pathTargets,
    maskTargets: maskTargets,
    mulberry32: mulberry32,
    instances: instances,
    boot: boot
  };

  // Deferred scripts run while readyState is already "interactive", so
  // anything short of "complete" still has DOMContentLoaded ahead of it.
  // Waiting for it guarantees every rule and renderer file has registered.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
