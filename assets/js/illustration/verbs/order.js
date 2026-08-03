// Verb: order
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
  // ORDER — resolve accumulates near the cursor and holds until the field
  // rule reverts it. ORDER_R is the influence radius in px, ORDER_RATE the
  // resolve gained per second at the centre of it.
  // ---------------------------------------------------------------
  var ORDER_R = 78, ORDER_RATE = 7;

  function order(ctx, sim, ink) {
    if (sim.moving) {
      var r2 = ORDER_R * ORDER_R;
      for (var i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        sim.aux[i] = clamp01(sim.aux[i] + (1 - q / r2) * ORDER_RATE * (1 / 60));
        if (sim.aux[i] > 0.6) sim.landed[i] = 1;
      }
    }
    render(ctx, sim, ink,
      function (i) { return 0.1 + sim.aux[i] * 0.9; },
      isLanded(sim));
  }

  Illo.renderer("order", order);
})();
