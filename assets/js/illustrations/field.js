// The generic substrate: an OBJECT held on the grid, with a per-point
// "settled" value from 0 (chaotic) to 1 (resolved) that the verbs read and
// write. Most posts should need nothing more than this plus a verb.
//
// Subjects are deliberately abstract. A dot-matrix person reads as a smudge,
// but a rectangle reads as a rectangle at any size — and an abstract object
// carrying a verb ("a container whose contents get revealed") says more than a
// literal picture of the thing anyway. Concrete diagrams belong in a figure.
(function () {
  "use strict";
  if (!window.Illo) return;

  var CELL = 8;
  var JITTER = 13;     // how far a fully unsettled point strays from its cell
  var K = 40;
  var DAMP = 0.82;
  var ARRIVE = 2.4;

  var SHAPES = {
    rect:    "M14 22 H86 V78 H14 Z",
    frame:   "M10 20 H90 V80 H10 Z M20 30 V70 H80 V30 Z",
    band:    "M6 40 H94 V60 H6 Z",
    disc:    "M50 50 m -32 0 a 32 32 0 1 0 64 0 a 32 32 0 1 0 -64 0 Z",
    columns: "M14 18 H32 V82 H14 Z M41 18 H59 V82 H41 Z M68 18 H86 V82 H68 Z",
    split:   "M8 20 H46 V80 H8 Z M54 20 H92 V80 H54 Z"
  };

  Illo.rule("field", function (sim, opts) {
    var jx = null, jy = null, delays = null, clock = 0;

    return {
      seed: function () {
        var t;
        if (opts.shape && SHAPES[opts.shape]) {
          t = Illo.pathTargets(SHAPES[opts.shape], 100, 100, sim.w, sim.h, CELL);
        } else {
          var font = getComputedStyle(document.documentElement)
            .getPropertyValue("--font-mono").trim() || "monospace";
          t = Illo.textTargets(opts.text || "INTENTION", sim.w, sim.h, CELL, font);
        }
        var n = t.length / 2;
        sim.alloc(n);
        sim.cell = CELL;
        if (!jx || jx.length < n) { jx = new Float32Array(n); jy = new Float32Array(n); }
        if (!delays || delays.length < n) delays = new Float32Array(n);
        clock = 0;

        var rnd = sim.rng;
        for (var i = 0; i < n; i++) {
          sim.txs[i] = t[i * 2];
          sim.tys[i] = t[i * 2 + 1];
          // Each point's personal direction of disorder, fixed so the chaos is
          // stable rather than seething.
          var a = rnd() * Math.PI * 2;
          jx[i] = Math.cos(a) * JITTER;
          jy[i] = Math.sin(a) * JITTER;
          sim.aux[i] = opts.settled ? 1 : 0;
          sim.landed[i] = 0;
          sim.hard[i] = 0;
          delays[i] = (sim.txs[i] / sim.w) * ARRIVE * 0.72 + rnd() * ARRIVE * 0.28;
          sim.xs[i] = sim.txs[i] + jx[i] * 3 + (rnd() - 0.5) * sim.w * 0.5;
          sim.ys[i] = sim.tys[i] + jy[i] * 3 + (rnd() - 0.5) * sim.h * 0.5;
          sim.vxs[i] = sim.vys[i] = 0;
        }
      },

      step: function (dt) {
        clock += dt;
        sim.busy = clock < ARRIVE + 0.5;
        var n = sim.n;
        for (var i = 0; i < n; i++) {
          if (clock < delays[i]) {
            sim.xs[i] += sim.vxs[i] * dt;
            sim.ys[i] += sim.vys[i] * dt;
            continue;
          }
          // Rest position is the cell, displaced by however unsettled the
          // point still is. No cursor force at all — a verb changes `aux`, and
          // the geometry follows. This is what stops the cursor carving a hole
          // in the picture it is supposed to be resolving.
          var u = 1 - sim.aux[i];
          var tx = sim.txs[i] + jx[i] * u;
          var ty = sim.tys[i] + jy[i] * u;
          var vx = (sim.vxs[i] + (tx - sim.xs[i]) * K * dt) * DAMP;
          var vy = (sim.vys[i] + (ty - sim.ys[i]) * K * dt) * DAMP;
          sim.vxs[i] = vx; sim.vys[i] = vy;
          sim.xs[i] += vx * dt;
          sim.ys[i] += vy * dt;
        }
      }
    };
  });

  Illo.shapes = SHAPES;
})();
