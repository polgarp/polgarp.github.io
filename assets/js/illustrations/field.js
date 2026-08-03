// The substrate every illustration is built on: an abstract OBJECT held on the
// monospace grid, plus a per-point resolve value the verbs read and write.
//
// Three rules encoded here, and they apply to every illustration:
//
//   1. LEGIBLE AT REST. A reader who never moves the cursor still sees the
//      object. The base state is soft and loose, never noise.
//   2. ACCENT IS SCARCE. Only a fixed minority of points can ever go red, so
//      the accent marks a few important things however hard the reader sweeps.
//   3. IT REFRESHES. State the reader creates decays back to base over about
//      ten seconds, so the illustration stays live rather than becoming a
//      finished, spent thing.
(function () {
  "use strict";
  if (!window.Illo) return;

  var CELL = 8;
  var BASE = 0.46;        // resolve level at rest: clearly legible, unresolved
  var JITTER = 6;         // how far a fully unresolved point strays from cell
  var ACCENT_SHARE = 0.18;
  var REVERT = 0.11;      // resolve units per second back toward base
  var K = 40;
  var DAMP = 0.82;
  var ARRIVE = 2.4;

  // Shape geometry is NOT duplicated here. The include emits the path from
  // _data/illo_shapes.yml into both the static SVG and a data attribute, and
  // the engine reads it from the DOM — one source, so the live and fallback
  // versions cannot drift apart.

  Illo.rule("field", function (sim, opts) {
    var jx = null, jy = null, delays = null, clock = 0;
    var base = typeof opts.base === "number" ? opts.base : BASE;

    return {
      seed: function () {
        if (!opts.path) return;
        var t = Illo.pathTargets(opts.path, 100, 100, sim.w, sim.h, CELL, opts.fit);
        var n = t.length / 2;
        if (!n) return;
        sim.alloc(n);
        sim.cell = CELL;
        sim.base = base;
        if (!jx || jx.length < n) { jx = new Float32Array(n); jy = new Float32Array(n); }
        if (!delays || delays.length < n) delays = new Float32Array(n);
        clock = 0;

        var rnd = sim.rng;
        for (var i = 0; i < n; i++) {
          sim.txs[i] = t[i * 2];
          sim.tys[i] = t[i * 2 + 1];
          // A fixed personal direction of disorder, so the unresolved state is
          // soft rather than seething.
          var a = rnd() * Math.PI * 2;
          jx[i] = Math.cos(a) * JITTER;
          jy[i] = Math.sin(a) * JITTER;
          sim.aux[i] = base;
          sim.landed[i] = 0;
          sim.hard[i] = rnd() < ACCENT_SHARE ? 1 : 0;   // accent-eligible
          delays[i] = (sim.txs[i] / sim.w) * ARRIVE * 0.72 + rnd() * ARRIVE * 0.28;
          sim.xs[i] = sim.txs[i] + (rnd() - 0.5) * sim.w * 0.55;
          sim.ys[i] = sim.tys[i] + (rnd() - 0.5) * sim.h * 0.55;
          sim.vxs[i] = sim.vys[i] = 0;
        }
      },

      step: function (dt) {
        clock += dt;
        var settling = clock < ARRIVE + 0.5;
        var n = sim.n, live = 0;

        for (var i = 0; i < n; i++) {
          if (clock < delays[i]) {
            sim.xs[i] += sim.vxs[i] * dt;
            sim.ys[i] += sim.vys[i] * dt;
            live = 1;
            continue;
          }

          // Revert toward base. Verbs push aux away from it; this pulls it
          // back, so an illustration a reader worked over recovers and stays
          // worth returning to.
          if (sim.aux[i] > base) {
            sim.aux[i] -= REVERT * dt;
            if (sim.aux[i] <= base) { sim.aux[i] = base; sim.landed[i] = 0; }
            else live = 1;
          } else if (sim.aux[i] < base) {
            sim.aux[i] += REVERT * dt;
            if (sim.aux[i] >= base) { sim.aux[i] = base; sim.landed[i] = 0; }
            else live = 1;
          }

          // Geometry follows resolve: an unresolved point sits off its cell.
          // No cursor force anywhere — a verb changes state, never position,
          // which is what stops the cursor carving a hole in the picture.
          var u = 1 - sim.aux[i];
          var tx = sim.txs[i] + jx[i] * u;
          var ty = sim.tys[i] + jy[i] * u;
          var vx = (sim.vxs[i] + (tx - sim.xs[i]) * K * dt) * DAMP;
          var vy = (sim.vys[i] + (ty - sim.ys[i]) * K * dt) * DAMP;
          sim.vxs[i] = vx; sim.vys[i] = vy;
          sim.xs[i] += vx * dt;
          sim.ys[i] += vy * dt;
        }

        sim.busy = settling || !!live;
      }
    };
  });

})();
