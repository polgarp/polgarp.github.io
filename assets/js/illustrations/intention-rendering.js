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
  var ARRIVE = 2.6;       // seconds over which the form assembles, left to right
  var REACH = 78;         // how far the cursor's attention carries
  var K_ATTEND = 62;      // an attended point can finally reach its target
  var WAKE = 150;         // how hard a moving cursor shoves the settled 80%
  var WAKE_SPEED = 1200;  // ...scaled by how fast you're moving, up to here

  // Subjects are vectors, not assets: simple path data in a 100x100 box. A
  // post about tools gets a computer, one about reading gets a book. Sampled to
  // the same grid as a word is, so the engine never learns the difference.
  var SHAPES = {
    computer: "M8 16 H92 V72 H8 Z M16 24 V64 H84 V24 Z" +
              "M44 72 H56 V84 H44 Z M30 84 H70 V91 H30 Z",
    book: "M8 30 L48 22 L48 78 L8 86 Z M52 22 L92 30 L92 86 L52 78 Z",
    person: "M50 12 m -13 0 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0 Z" +
            "M20 92 C20 64, 33 54, 50 54 C67 54, 80 64, 80 92 Z"
  };

  Illo.rule("intention-rendering", function (sim, opts) {
    var offsets = null;
    var delays = null;
    var clock = 0;

    return {
      seed: function () {
        var t;
        if (opts.shape && SHAPES[opts.shape]) {
          t = Illo.pathTargets(SHAPES[opts.shape], 100, 100, sim.w, sim.h, CELL);
        } else {
          var font = getComputedStyle(document.documentElement)
            .getPropertyValue("--font-mono").trim() || "monospace";
          t = Illo.textTargets(opts.text, sim.w, sim.h, CELL, font);
        }
        var n = t.length / 2;
        sim.alloc(n);
        // Publish the grid the targets were built on, so a grid-snapping
        // renderer uses the rule's cell rather than a duplicated constant.
        sim.cell = CELL;
        if (!offsets || offsets.length < n) offsets = new Float32Array(n);
        if (!delays || delays.length < n) delays = new Float32Array(n);
        clock = 0;

        var rnd = sim.rng;
        for (var i = 0; i < n; i++) {
          sim.txs[i] = t[i * 2];
          sim.tys[i] = t[i * 2 + 1];
          // Assemble left to right rather than all at once. Slower is calmer:
          // the picture resolves at reading pace instead of snapping into
          // being and demanding a look.
          delays[i] = (sim.txs[i] / sim.w) * ARRIVE * 0.72 + rnd() * ARRIVE * 0.28;
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
        clock += dt;
        // Hold off rest detection until everything has at least set out,
        // otherwise the not-yet-departed points read as a settled system.
        sim.busy = clock < ARRIVE + 0.5;
        var n = sim.n;
        var px = sim.px, py = sim.py, on = sim.pointerOn;
        var reach2 = REACH * REACH;
        // A fast pass shoves harder than a slow one. Capped, so a flick can't
        // fling the picture apart.
        var wake = WAKE * (0.35 + 0.65 * Math.min(sim.pspeed / WAKE_SPEED, 1));

        for (var i = 0; i < n; i++) {
          if (clock < delays[i]) {
            // Not yet under way. Drifting, not held.
            sim.xs[i] += sim.vxs[i] * dt;
            sim.ys[i] += sim.vys[i] * dt;
            continue;
          }
          var dx = sim.txs[i] - sim.xs[i];
          var dy = sim.tys[i] - sim.ys[i];
          var d = Math.sqrt(dx * dx + dy * dy) || 1e-6;

          var cx = px - sim.xs[i];
          var cy = py - sim.ys[i];
          var c2 = cx * cx + cy * cy;
          var near = on && c2 < reach2;

          var k, rest;
          if (sim.landed[i]) {
            // Seated by hand, and it stays that way. The part you finished is
            // the part that stops moving when you poke at it.
            k = K_LANDED; rest = 0;
          } else if (sim.hard[i]) {
            // The cursor is attention, not force. Nothing gets dragged: while
            // you are looking here, this point is simply able to reach where it
            // belongs. Look away and it relaxes back to almost-right.
            if (near) { k = K_ATTEND; rest = 0; }
            else { k = K_HARD; rest = offsets[i]; }
          } else {
            k = K_EASY; rest = 0;
          }

          // Spring toward the target, but only as far as `rest`. An unattended
          // hard point therefore has a stable equilibrium on a small circle
          // around where it belongs — near enough to look right, wrong enough
          // to be wrong.
          var f = k * (d - rest) / d;
          var ax = dx * f;
          var ay = dy * f;

          // The settled 80% gets shoved aside by a moving cursor and springs
          // back. Disturbing finished work is easy; only the unfinished part
          // needs you.
          if (near && !sim.landed[i] && !sim.hard[i]) {
            var cd = Math.sqrt(c2) || 1e-6;
            var falloff = 1 - c2 / reach2;
            ax -= (cx / cd) * wake * falloff * falloff * 60;
            ay -= (cy / cd) * wake * falloff * falloff * 60;
          }

          var vx = (sim.vxs[i] + ax * dt) * DAMP;
          var vy = (sim.vys[i] + ay * dt) * DAMP;
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
