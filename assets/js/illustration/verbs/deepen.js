// Verb: deepen
//
// Registered with Illo.renderer(name, fn) and selected per illustration via
// data-illo-render. Loaded only on pages that use it.
//
//   fn(ctx, sim, ink)
//
// A verb reads pointer state (sim.px, sim.py, sim.pspeed, sim.pointerOn),
// writes per-point state (sim.aux 0..1, sim.landed) and draws through
// Illo.marks.render. It must NOT write sim.xs/sim.ys: the `field` rule owns
// geometry and derives it from sim.aux. Set sim.busy while state is still
// settling, or the engine stops the loop mid-transition.
(function () {
  "use strict";
  if (!window.Illo || !Illo.marks) return;

  var clamp01 = Illo.marks.clamp01;
  var hash = Illo.marks.hash;
  var near2 = Illo.marks.near2;
  var render = Illo.marks.render;
  var isLanded = Illo.marks.isLanded;

  // ---------------------------------------------------------------
  // DEEPEN — covering the ground always produces something; covering it at a
  // considered pace is the only thing that produces something solid.
  //
  // SHALLOW is reached by any pass at any speed: the mark exists, thin. Depth
  // beyond that accrues per unit of GROUND COVERED, weighted by care — not per
  // unit of time. That distinction is the whole verb: if depth accrued with
  // time, holding the cursor still would be the optimal strategy, which is the
  // opposite of practice. You have to actually work through the material.
  //
  // The result is a sweet spot rather than a slope: effort peaks at half of
  // SLOW and falls off either side. Rushing covers ground without care;
  // dawdling shows care without covering ground. Neither is practice.
  //
  // Distinct from `pace`, which takes resolve AWAY at speed. Here speed is not
  // punished, it just yields less — the artefact still gets made either way.
  // ---------------------------------------------------------------
  var DEEPEN_R = 74;
  var SLOW = 420;        // px/s above which a pass is pure haste
  var SHALLOW = 0.66;    // resolve any pass reaches, however fast
  var RATE = 1.8;        // resolve per second at the ideal pace
  var DEEP = 0.9;        // above this a mark counts as understood

  function deepen(ctx, sim, ink) {
    if (sim.moving) {
      var r2 = DEEPEN_R * DEEPEN_R, dt = 1 / 60;
      var rel = clamp01(sim.pspeed / SLOW);
      var care = 1 - rel;          // attention: highest when slow
      var travel = rel;            // ground covered: highest when fast
      // Product peaks at 0.25 when rel is 0.5, so x4 normalises the ideal
      // pace to full effort. Zero at a standstill and zero at a sprint.
      var effort = care * travel * 4;
      for (var i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        var falloff = 1 - q / r2;
        // The artefact appears at once, whatever the speed.
        if (sim.aux[i] < SHALLOW) sim.aux[i] = SHALLOW;
        // Depth has no ceiling short of full: effort alone decides how fast
        // it accrues. A rushed pass gains nothing because its effort is zero,
        // not because a cap forbids it — capping by care as well would put the
        // ceiling out of reach of the very pace that gains fastest.
        sim.aux[i] = clamp01(sim.aux[i] + RATE * effort * falloff * dt);
        sim.landed[i] = sim.aux[i] > DEEP ? 1 : 0;
      }
    }
    render(ctx, sim, ink,
      function (i) { return 0.1 + sim.aux[i] * 0.9; },
      isLanded(sim));
  }

  Illo.renderer("deepen", deepen);
})();
