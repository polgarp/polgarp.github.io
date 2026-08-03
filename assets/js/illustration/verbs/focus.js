// Verb: focus
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
  // FOCUS — resolve is rewritten from cursor distance every frame rather than
  // accumulated, so nothing persists and no accent is drawn. Low resolve both
  // drives tone toward per-point noise and lets the field rule drift points
  // off their cells, so the outline softens along with the fill.
  // ---------------------------------------------------------------
  var FOCUS_R = 168;

  function focus(ctx, sim, ink) {
    sim.pinned = true;
    var r2 = FOCUS_R * FOCUS_R;
    for (var i = 0; i < sim.n; i++) {
      var sharp = sim.pointerOn ? clamp01(1 - near2(sim, i) / r2) : 0;
      sharp *= sharp;
      // Written directly rather than accumulated: focus is a state of the
      // cursor, not something the reader builds up.
      sim.aux[i] = sim.base * 0.55 + sharp * (1 - sim.base * 0.55);
    }
    render(ctx, sim, ink,
      function (i) {
        var t = sim.aux[i];
        // Noise dominates where unresolved, truth where sharp.
        return t * t + hash(i) * 0.42 * (1 - t);
      },
      function () { return false; });
  }

  Illo.renderer("focus", focus);
})();
