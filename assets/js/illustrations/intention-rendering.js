// "AI and clarity of intentions" — the rule is the argument.
//
// Points converge on a target form. Most of them snap into place quickly and
// cheaply. A minority never land on their own: they come to rest a few pixels
// off, close enough that the whole reads as finished at a glance. Only the
// cursor can seat them, and a seated mark turns accent red — so the red is
// exactly the share of the work a human had to do by hand.
//
// Nothing announces this. Noticing the gap is the point.
(function () {
  "use strict";
  if (!window.Illo) return;

  var CELL = 8;           // logical px between grid cells
  var HARD_SHARE = 0.2;   // the stubborn 20%
  var K_EASY = 46;        // spring constant, seats in well under a second
  var K_HARD = 9;         // approaches slowly, and only to its offset
  var K_LANDED = 90;      // once seated, rigid
  var DAMP = 0.82;
  var SNAP = 5;           // seat the point once this close to its target
  // An unseated hard point rests on a circle of this radius around where it
  // belongs. It must stay clear of SNAP or points would seat themselves, which
  // is the one thing this rule must never do.
  var OFFSET_MIN = SNAP + 2.5;
  var OFFSET_MAX = SNAP + 9;
  var REACH = 44;         // how far the cursor's attention carries
  var K_ATTEND = 55;      // an attended point can finally reach its target

  Illo.rule("intention-rendering", function (sim, opts) {
    var offsets = null;

    return {
      seed: function () {
        var font = getComputedStyle(document.documentElement)
          .getPropertyValue("--font-mono").trim() || "monospace";
        var t = Illo.textTargets(opts.text, sim.w, sim.h, CELL, font);
        var n = t.length / 2;
        sim.alloc(n);
        // Publish the grid the targets were built on, so a grid-snapping
        // renderer uses the rule's cell rather than a duplicated constant.
        sim.cell = CELL;
        if (!offsets || offsets.length < n) offsets = new Float32Array(n);

        var rnd = sim.rng;
        for (var i = 0; i < n; i++) {
          sim.txs[i] = t[i * 2];
          sim.tys[i] = t[i * 2 + 1];
          // Start scattered, with a bias toward the edges so the convergence
          // reads as material being gathered rather than a fade-in.
          var a = rnd() * Math.PI * 2;
          var r = 0.55 + rnd() * 0.75;
          sim.xs[i] = sim.w / 2 + Math.cos(a) * sim.w * 0.5 * r;
          sim.ys[i] = sim.h / 2 + Math.sin(a) * sim.h * 0.9 * r;
          sim.vxs[i] = sim.vys[i] = 0;
          sim.landed[i] = 0;
          sim.hard[i] = rnd() < HARD_SHARE ? 1 : 0;
          offsets[i] = OFFSET_MIN + rnd() * (OFFSET_MAX - OFFSET_MIN);
        }
      },

      step: function (dt) {
        var n = sim.n;
        var px = sim.px, py = sim.py, on = sim.pointerOn;
        var reach2 = REACH * REACH;

        for (var i = 0; i < n; i++) {
          var dx = sim.txs[i] - sim.xs[i];
          var dy = sim.tys[i] - sim.ys[i];
          var d = Math.sqrt(dx * dx + dy * dy) || 1e-6;

          var k, rest;
          if (sim.landed[i]) {
            k = K_LANDED; rest = 0;
          } else if (sim.hard[i]) {
            // The cursor is attention, not force. Nothing gets dragged: while
            // you are looking here, this point is simply able to reach where it
            // belongs. Look away and it relaxes back to almost-right.
            var cx = px - sim.xs[i];
            var cy = py - sim.ys[i];
            if (on && cx * cx + cy * cy < reach2) { k = K_ATTEND; rest = 0; }
            else { k = K_HARD; rest = offsets[i]; }
          } else {
            k = K_EASY; rest = 0;
          }

          // Spring toward the target, but only as far as `rest`. An unattended
          // hard point therefore has a stable equilibrium on a small circle
          // around where it belongs — near enough to look right, wrong enough
          // to be wrong.
          var f = k * (d - rest) / d;
          var vx = (sim.vxs[i] + dx * f * dt) * DAMP;
          var vy = (sim.vys[i] + dy * f * dt) * DAMP;
          sim.vxs[i] = vx;
          sim.vys[i] = vy;
          sim.xs[i] += vx * dt;
          sim.ys[i] += vy * dt;

          if (!sim.landed[i] && sim.hard[i]) {
            var ndx = sim.txs[i] - sim.xs[i];
            var ndy = sim.tys[i] - sim.ys[i];
            if (ndx * ndx + ndy * ndy < SNAP * SNAP) sim.landed[i] = 1;
          }
        }
      }
    };
  });
})();
