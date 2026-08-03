// The `field` rule: an object sampled onto the monospace grid, plus the
// per-point resolve value (sim.aux, 0..1) that verbs read and write.
//
// This rule owns geometry. A point's rest position is its grid cell displaced
// by (1 - resolve), so a verb changes only resolve and the shape follows.
//
// The tunables below set three behaviours every illustration inherits: BASE is
// the resolve level at rest (high enough that the object reads before any
// interaction), ACCENT_SHARE bounds how many points can ever draw accent, and
// REVERT returns reader-created state to BASE so a field recovers after being
// worked over.
(function () {
  "use strict";
  if (!window.Illo) return;

  var CELL = 8;
  var BASE = 0.46;        // resolve level at rest: clearly legible, unresolved
  var JITTER = 15;        // how far a fully unresolved point strays from cell
  var ACCENT_SHARE = 0.18;
  var REVERT = 0.07;      // resolve units per second back toward base
  var HOLD = 4.5;         // seconds of stillness before any decay begins, so
                          // what a reader just did stays put long enough to
                          // look at
  var K = 32;             // softer spring: settling stays visible
  var DAMP = 0.86;
  var ARRIVE = 3.4;       // slower assembly: it should not demand a look

  // Shape geometry is NOT duplicated here. The include emits the path from
  // _data/illo_shapes.yml into both the static SVG and a data attribute, and
  // the engine reads it from the DOM — one source, so the live and fallback
  // versions cannot drift apart.

  Illo.rule("field", function (sim, opts) {
    var jx = null, jy = null, delays = null, clock = 0, holdUntil = 0;
    var base = typeof opts.base === "number" ? opts.base : BASE;

    return {
      seed: function () {
        if (!opts.path) return;
        var t = Illo.pathTargets(opts.path, 100, 100, sim.w, sim.h, CELL, opts.fit);
        var n = t.length / 3;
        if (!n) return;
        sim.alloc(n);
        sim.cell = CELL;
        sim.base = base;
        if (!jx || jx.length < n) { jx = new Float32Array(n); jy = new Float32Array(n); }
        if (!delays || delays.length < n) delays = new Float32Array(n);
        clock = 0;

        var rnd = sim.rng;
        for (var i = 0; i < n; i++) {
          sim.txs[i] = t[i * 3];
          sim.tys[i] = t[i * 3 + 1];
          sim.wt[i] = t[i * 3 + 2];
          // Marks in the faint halo outside the object sit looser, so the
          // edge reads as smudge rather than as a second, softer outline.
          var loose = 1 + (1 - sim.wt[i]) * 1.6;
          // A fixed per-point offset direction, so the unresolved state is
          // static rather than seething.
          var a = rnd() * Math.PI * 2;
          jx[i] = Math.cos(a) * JITTER * loose;
          jy[i] = Math.sin(a) * JITTER * loose;
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
        // Pointer MOTION restarts the hold, not mere presence — a cursor
        // parked on the page stays "on" indefinitely, so keying off presence
        // would renew the hold forever and nothing would ever decay.
        if (sim.pspeed > 6) holdUntil = clock + HOLD;
        var decaying = clock >= holdUntil;
        var settling = clock < ARRIVE + 0.5;
        var n = sim.n, live = 0;

        for (var i = 0; i < n; i++) {
          if (clock < delays[i]) {
            sim.xs[i] += sim.vxs[i] * dt;
            sim.ys[i] += sim.vys[i] * dt;
            live = 1;
            continue;
          }

          // Verbs push resolve away from BASE; this pulls it back, and
          // clears `landed` once a point has fully returned. Skipped when a
          // verb sets sim.pinned, meaning it rewrites resolve every frame and
          // owns it outright — reverting under such a verb would fight it and
          // keep the field marked live forever, so it would never rest.
          if (sim.pinned || !decaying) {
            // verb owns resolve, or we are still holding what the reader did
            if (sim.aux[i] !== base) live = 1;
          } else if (sim.aux[i] > base) {
            sim.aux[i] -= REVERT * dt;
            if (sim.aux[i] <= base) { sim.aux[i] = base; sim.landed[i] = 0; }
            else live = 1;
          } else if (sim.aux[i] < base) {
            sim.aux[i] += REVERT * dt;
            if (sim.aux[i] >= base) { sim.aux[i] = base; sim.landed[i] = 0; }
            else live = 1;
          }

          // Geometry follows resolve: an unresolved point sits off its cell
          // by its own fixed offset. There is no cursor force here at all.
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
