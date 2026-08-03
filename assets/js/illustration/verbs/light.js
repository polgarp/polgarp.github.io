// Verb: light
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
  // LIGHT — tone from how far each point faces the cursor, as a dot product
  // measured from the field centre. Global: every point changes on any pointer
  // move, including moves outside the figure.
  // ---------------------------------------------------------------
  function light(ctx, sim, ink) {
    var cx = sim.w / 2, cy = sim.h / 2;
    var lx = sim.px - cx, ly = sim.py - cy;
    var ll = Math.sqrt(lx * lx + ly * ly) || 1e-6;
    lx /= ll; ly /= ll;
    var lit = sim.pointerOn;
    render(ctx, sim, ink,
      function (i) {
        if (!lit) return 0.55;
        var ox = sim.xs[i] - cx, oy = sim.ys[i] - cy;
        var ol = Math.sqrt(ox * ox + oy * oy) || 1e-6;
        var face = 0.5 + 0.5 * ((ox / ol) * lx + (oy / ol) * ly);
        return 0.12 + face * 0.95;
      },
      function () { return false; });
  }

  Illo.renderer("light", light);
})();
