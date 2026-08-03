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
  // DEEPEN — passing over the field always produces something; only passing
  // slowly produces something solid.
  //
  // SHALLOW is reached immediately at any speed: the mark exists, thin. Above
  // that, gain scales with how slowly the pointer is moving, so a careful pass
  // carries a mark to full resolve and an accent-eligible one goes red.
  //
  // Distinct from `pace`, which takes resolve AWAY at speed. Here speed is not
  // punished, it just yields less — the artefact still gets made either way.
  // ---------------------------------------------------------------
  var DEEPEN_R = 74;
  var SLOW = 340;        // px/s at which no depth is gained at all
  var SHALLOW = 0.66;    // resolve any pass reaches, however fast
  var RATE = 1.5;        // resolve per second gained at a crawl
  var DEEP = 0.9;        // above this a mark counts as understood

  function deepen(ctx, sim, ink) {
    if (sim.moving) {
      var r2 = DEEPEN_R * DEEPEN_R, dt = 1 / 60;
      // 1 when barely moving, 0 at SLOW and beyond.
      var care = 1 - clamp01(sim.pspeed / SLOW);
      var target = SHALLOW + care * (1 - SHALLOW);
      for (var i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        var falloff = 1 - q / r2;
        // The artefact appears at once, whatever the speed.
        if (sim.aux[i] < SHALLOW) sim.aux[i] = SHALLOW;
        // Understanding accrues only as fast as attention allows.
        if (sim.aux[i] < target) {
          sim.aux[i] = clamp01(sim.aux[i] + RATE * falloff * dt);
        }
        sim.landed[i] = sim.aux[i] > DEEP ? 1 : 0;
      }
    }
    render(ctx, sim, ink,
      function (i) { return 0.1 + sim.aux[i] * 0.9; },
      isLanded(sim));
  }

  Illo.renderer("deepen", deepen);
})();
