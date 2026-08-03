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
    // Mask coverage 0..1 at each point's cell. Renderers multiply tone by it,
    // so partly covered cells at an object's edge read as a soft falloff.
    this.wt = new Float32Array(n);
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
  // Returns flat triples: x, y, coverage. Coverage is the mask's alpha at that
  // cell, so a cell the shape only partly covers yields a faint mark rather
  // than none — which is what gives an object soft edges instead of a hard
  // fill, and lets marks carry on past its boundary.
  var COVER_MIN = 0.09;
  var HALO = 0.62;      // how strongly the blurred halo contributes
  var HALO_PASSES = 3;  // box-blur passes; each is roughly one cell of spread

  function maskTargets(w, h, cell, paint, bleed) {
    var cols = Math.max(1, Math.floor(w / cell));
    var rows = Math.max(1, Math.floor(h / cell));
    var off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    var c = off.getContext("2d", { willReadFrequently: true });
    c.fillStyle = "#000";
    paint(c, cols, rows);

    var data = c.getImageData(0, 0, cols, rows).data;
    var n = cols * rows, i;
    var src = new Float32Array(n);
    for (i = 0; i < n; i++) src[i] = data[i * 4 + 3] / 255;

    // Halo by box-blurring the coverage in CELL space. Doing it here rather
    // than by stroking the path keeps the spread isotropic — a stroke inside
    // an anisotropic scale is wide on one axis and thin on the other, which
    // swallows a stretched object entirely.
    var cov = src;
    if (bleed !== 0) {
      var a = new Float32Array(src), b2 = new Float32Array(n), p, x, y;
      for (p = 0; p < HALO_PASSES; p++) {
        for (y = 0; y < rows; y++) {
          for (x = 0; x < cols; x++) {
            var sum = 0, cnt = 0;
            for (var dy = -1; dy <= 1; dy++) {
              var yy = y + dy;
              if (yy < 0 || yy >= rows) continue;
              for (var dx = -1; dx <= 1; dx++) {
                var xx = x + dx;
                if (xx < 0 || xx >= cols) continue;
                sum += a[yy * cols + xx]; cnt++;
              }
            }
            b2[y * cols + x] = sum / cnt;
          }
        }
        a.set(b2);
      }
      cov = new Float32Array(n);
      for (i = 0; i < n; i++) {
        // Solid where the shape is; the blur only adds the surrounding smudge.
        cov[i] = Math.min(1, src[i] + a[i] * HALO);
      }
    }

    var out = [];
    for (var yy2 = 0; yy2 < rows; yy2++) {
      for (var xx2 = 0; xx2 < cols; xx2++) {
        var v = cov[yy2 * cols + xx2];
        if (v > COVER_MIN) out.push((xx2 + 0.5) * cell, (yy2 + 0.5) * cell, v);
      }
    }
    return out;
  }

  function pathTargets(d, vbW, vbH, w, h, cell, fit, bleed, fillRatio) {
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
    }, bleed);
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
    this.density = el.getAttribute("data-illo-density") || "";
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
    this.started = false; // has it been properly in view at least once?
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
      path: this.path, fit: this.fit, density: this.density, seed: this.seed
    });
    this.rule.seed();
    this.restCount = 0;
    // Show the seeded state straight away. The loop itself still waits until
    // the figure is properly in view (see maybeStart).
    this.paint();
    if (this.started) this.wake();
  };

  // Draw the current state without advancing it. Used once at mount so the
  // canvas takes over from the static plate immediately, showing the
  // animation's start point rather than swapping to it later mid-scroll.
  Instance.prototype.paint = function () {
    if (!this.ctx || !this.rule) return;
    var draw = renderers[this.rendererName] || renderers.order;
    if (!draw.noClear) this.ctx.clearRect(0, 0, this.sim.w, this.sim.h);
    draw(this.ctx, this.sim, this.ink);
    if (!this.shown) {
      this.shown = true;
      this.el.classList.add("illo--live");
      // Disarms the failsafe in default.html: something has drawn, so the
      // fallback does not need to be brought back.
      document.documentElement.setAttribute("data-illo-painted", "1");
    }
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
    // A parked cursor is present but not acting. Verbs that ACCUMULATE state
    // must gate on this, or a mouse left resting over a figure keeps feeding
    // it forever and the loop never reaches rest. Verbs that merely reflect
    // where the pointer is (focus, light) use pointerOn instead.
    s.moving = s.pointerOn && s.pspeed > 6;
    // Milliseconds since the pointer last actually moved. A verb that wants to
    // respond to someone pausing over it uses this with a bounded window, so
    // it still stops accruing and the loop still reaches rest — a parked
    // cursor must never be able to feed a verb indefinitely.
    s.pidle = s.pointerOn ? performance.now() - ptr.t : Infinity;
    // A parked cursor is present but not acting. Verbs that ACCUMULATE state
    // must gate on this, or a mouse left resting over a figure keeps feeding
    // it forever and the loop never reaches rest. Verbs that merely reflect
    // the pointer's position (focus, light) use pointerOn instead.
    s.moving = s.pointerOn && s.pspeed > 6;
    // Milliseconds since the pointer last actually moved. A verb that wants to
    // respond to someone pausing over it uses this with a bounded window, so
    // it still stops accruing and the loop still reaches rest — a parked
    // cursor must never be able to feed a verb indefinitely.
    s.pidle = s.pointerOn ? performance.now() - ptr.t : Infinity;

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
        // rest of the page. The plate is hidden globally by .illo-js, so it
        // has to be un-hidden for this figure specifically.
        if (inst.canvas && inst.canvas.parentNode) {
          inst.canvas.parentNode.removeChild(inst.canvas);
        }
        el.classList.remove("illo--live");
        el.classList.add("illo--fallback");
      }
    });
    if (!instances.length) return;

    // Two separate questions, deliberately:
    //
    //   Has it STARTED? Only once the whole figure has cleared the bottom
    //   tenth of the viewport, so the arrival animation doesn't play out below
    //   the fold where nobody sees it. A figure too tall to fit that band
    //   falls back to its top edge being on screen.
    //
    //   Should it KEEP RUNNING? Any overlap at all, which is what the observer
    //   below answers. Using the strict test for both would stop and restart
    //   the loop every time the figure drifted a few pixels past the line.
    //
    // The start test is geometric and changes continuously with scroll, so it
    // is evaluated in the scroll handler rather than in the observer callback:
    // an observer only fires when a listed threshold is crossed, and a figure
    // can go from mostly visible to fully clear without crossing one.
    var START_INSET = 0.10;

    function maybeStart(inst) {
      if (inst.started || !inst.visible || !inst.rect) return;
      var vh = window.innerHeight || 0;
      var line = vh * (1 - START_INSET);
      var r = inst.rect;
      var ok = r.height > line
        ? (r.top >= 0 && r.top < line)     // too tall to fit above the line
        : (r.top >= 0 && r.bottom <= line);
      if (ok) { inst.started = true; inst.wake(); }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var inst = null;
        for (var i = 0; i < instances.length; i++) {
          if (instances[i].el === entry.target) { inst = instances[i]; break; }
        }
        if (!inst) return;
        inst.visible = entry.isIntersecting;
        if (!entry.isIntersecting) { inst.sleep(); return; }
        inst.rect = (inst.stage || inst.el).getBoundingClientRect();
        if (inst.started) inst.wake();
        else maybeStart(inst);
      });
    }, { rootMargin: "0px" });

    instances.forEach(function (i) { io.observe(i.el); });

    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        instances.forEach(function (i) { i.resize(); maybeStart(i); });
      }, 150);
    }, { passive: true });

    // Scrolling moves every figure relative to the viewport, so cached rects
    // must follow. Coalesced into one frame, never measured per event.
    var rectTick = false;
    function refreshRects() {
      instances.forEach(function (i) {
        if (!i.visible) return;
        i.rect = (i.stage || i.el).getBoundingClientRect();
        maybeStart(i);
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

  // ---- Export the current frame as SVG, for the static fallback.
  //
  // Run against a settled illustration; the result is committed to
  // _includes/illustrations/ and inlined by the include, so a reader without
  // JavaScript sees the idle state rather than a generic plate. It records an
  // actual draw pass, so it cannot disagree with what the engine renders.
  function exportSVG(index) {
    var inst = instances[index || 0];
    if (!inst || !Illo.marks.record) return "";
    var s = inst.sim;
    Illo.marks.record(true);
    inst.paint();
    var marks = Illo.marks.recorded() || [];
    Illo.marks.record(false);
    inst.paint();

    // Group by weight so the file is a handful of <g>s rather than a few
    // hundred fully-specified elements; gzip does the rest.
    var groups = {}, i, m;
    for (i = 0; i < marks.length; i++) {
      m = marks[i];
      var key = m[3] + "|" + m[4];
      (groups[key] = groups[key] || []).push(m);
    }
    var body = "";
    Object.keys(groups).forEach(function (key) {
      var g = groups[key], parts = key.split("|");
      // currentColor for ink so the fallback follows the theme; accent marks
      // keep their own colour, which is the token value at export time.
      var isInk = parts[1] === inst.ink.fg;
      body += '<g font-weight="' + parts[0] + '"' +
              (isInk ? "" : ' fill="' + parts[1] + '"') + ">";
      for (i = 0; i < g.length; i++) {
        body += '<text x="' + Math.round(g[i][0]) + '" y="' + Math.round(g[i][1]) +
                '">' + g[i][2] + "</text>";
      }
      body += "</g>";
    });

    // No role or label here: the include wraps this and owns the accessible
    // name, so the alt text lives in one place next to the caption.
    return '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"' +
      ' viewBox="0 0 ' + Math.round(s.w) + " " + Math.round(s.h) + '"' +
      ' preserveAspectRatio="xMidYMid meet"' +
      ' font-family="var(--font-mono), monospace" font-size="' +
      Illo.marks.size(s.cell) + '" fill="currentColor" text-anchor="middle"' +
      ' dominant-baseline="central">' + body + "</svg>";
  }

  window.Illo = {
    rule: function (name, factory) { rules[name] = factory; },
    renderer: function (name, fn) { renderers[name] = fn; },
    pathTargets: pathTargets,
    maskTargets: maskTargets,
    mulberry32: mulberry32,
    instances: instances,
    boot: boot,
    exportSVG: exportSVG
  };

  // Deferred scripts run while readyState is already "interactive", so
  // anything short of "complete" still has DOMContentLoaded ahead of it.
  // Waiting for it guarantees every rule and renderer file has registered.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
