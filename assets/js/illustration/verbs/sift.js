// Verb: sift
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
  // SIFT — the cursor removes the easy marks; what survives is heavier.
  // Removed marks scatter outward as they fade and drift back as they return,
  // so the field visibly reorganises rather than just dimming. Survivors are
  // pushed to full resolve through sim.aux, which means the field rule's own
  // revert returns them to base and clears the accent — the illustration
  // recovers on its own, like every other verb here.
  // ---------------------------------------------------------------
  var SIFT_R = 70, REGROW = 0.13, SCATTER = 26;
  var gone = null, goneFor = -1;

  function sift(ctx, sim, ink) {
    var n = sim.n, i, dt = 1 / 60, live = 0;
    if (!gone || goneFor !== n) { gone = new Float32Array(n); goneFor = n; }
    var r2 = SIFT_R * SIFT_R;

    for (i = 0; i < n; i++) {
      var inReach = sim.moving && near2(sim, i) < r2;
      if (inReach && !sim.hard[i]) {
        gone[i] = 1;                       // easy work: automated away
      } else if (gone[i] > 0) {
        gone[i] -= REGROW * dt;            // and it comes back, slowly
        if (gone[i] < 0) gone[i] = 0;
      }
      // Only harden marks with real coverage: an accent in the faint halo
      // draws too pale to register as accent at all.
      if (inReach && sim.hard[i] && sim.wt[i] > 0.55) {
        // What survives hardens. Written into aux so the field rule reverts
        // it, rather than latching forever.
        sim.aux[i] = 1;
        sim.landed[i] = 1;
      }
      if (gone[i] > 0) live = 1;
    }
    if (live) sim.busy = true;

    // A departing mark drifts off its cell, which is what makes the removal
    // read as movement rather than as a dimmer switch.
    var cell = sim.cell || 8;
    for (i = 0; i < n; i++) {
      if (gone[i] > 0) {
        sim.xs[i] += (hash(i) - 0.5) * SCATTER * gone[i] * dt;
        sim.ys[i] += (hash(i * 7.3) - 0.5) * SCATTER * gone[i] * dt;
      }
    }

    render(ctx, sim, ink,
      function (i) {
        var present = 1 - gone[i];
        return (0.12 + sim.aux[i] * 0.88) * present;
      },
      isLanded(sim));
  }

  Illo.renderer("sift", sift);
})();
