// Verb: pace
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
  // PACE — resolve gains while the pointer is slow and drops while it is
  // fast. SLOW is the speed in px/s at which the effect crosses zero; above
  // it, passing over the field costs resolve instead of adding it.
  // ---------------------------------------------------------------
  var PACE_R = 72, SLOW = 260;

  function pace(ctx, sim, ink) {
    if (sim.moving) {
      var r2 = PACE_R * PACE_R, dt = 1 / 60;
      // +1 when barely moving, -1 when sweeping.
      var care = 1 - 2 * clamp01(sim.pspeed / SLOW);
      for (var i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        sim.aux[i] = clamp01(sim.aux[i] + care * (1 - q / r2) * 2.2 * dt);
        sim.landed[i] = sim.aux[i] > 0.8 ? 1 : 0;
      }
    }
    render(ctx, sim, ink,
      function (i) { return 0.08 + sim.aux[i] * 0.92; },
      isLanded(sim));
  }

  Illo.renderer("pace", pace);
})();
