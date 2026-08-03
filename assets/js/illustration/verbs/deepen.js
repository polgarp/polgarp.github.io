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
  var near2 = Illo.marks.near2;
  var render = Illo.marks.render;

  // ---------------------------------------------------------------
  // DEEPEN — any pass finishes the artefact; only worked ground has anything
  // underneath it.
  //
  // Two separate quantities. Resolve (sim.aux) is the artefact: a pass at any
  // speed drives it to full, so the field goes solid and looks done. Depth is
  // held privately here and accrues only per unit of GROUND COVERED weighted
  // by care, so it peaks at a considered pace and is zero at both a standstill
  // and a sprint. Where depth passes DEEP, an accent-eligible mark shows red.
  //
  // The contrast is therefore categorical rather than tonal: rushing leaves a
  // finished-looking field with nothing in it, working leaves the same
  // finished field with something showing through. A purely tonal difference
  // between the two barely read; presence or absence of accent reads at a
  // glance.
  //
  // Distinct from `pace`, which takes resolve AWAY at speed. Speed isn't
  // punished here at all — it just produces nothing but the surface.
  // ---------------------------------------------------------------
  var DEEPEN_R = 74;
  var SLOW = 420;        // px/s above which a pass is pure haste
  var FINISH = 0.55;     // reach fraction beyond which a pass completes a mark
  var RATE = 2.4;        // depth per second at the ideal pace
  var DEEP = 0.5;        // depth above which a mark shows through
  var FADE = 0.07;       // depth lost per second, so the field renews

  var depth = null, depthFor = -1;

  function deepen(ctx, sim, ink) {
    var n = sim.n, i, dt = 1 / 60, live = 0;
    if (!depth || depthFor !== n) { depth = new Float32Array(n); depthFor = n; }

    if (sim.moving) {
      var r2 = DEEPEN_R * DEEPEN_R;
      var rel = clamp01(sim.pspeed / SLOW);
      var care = 1 - rel;          // attention: highest when slow
      var travel = rel;            // ground covered: highest when fast
      // Product peaks at 0.25 when rel is 0.5, so x4 normalises the ideal
      // pace to full effort. Zero at a standstill and zero at a sprint.
      var effort = care * travel * 4;
      for (i = 0; i < n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        var falloff = 1 - q / r2;
        // The artefact gets finished outright, whatever the speed. Assigned
        // rather than accumulated: a fast flick is only in reach of a given
        // mark for two or three frames, so any per-second rate would make
        // haste produce LESS surface, which is the opposite of the claim.
        if (falloff > FINISH && sim.aux[i] < 1) sim.aux[i] = 1;
        // What lies under it only accrues if the ground was actually worked.
        if (effort > 0) depth[i] = clamp01(depth[i] + RATE * effort * falloff * dt);
      }
    }

    for (i = 0; i < n; i++) {
      if (depth[i] > 0) {
        depth[i] -= FADE * dt;
        if (depth[i] < 0) depth[i] = 0; else live = 1;
      }
      sim.landed[i] = depth[i] > DEEP ? 1 : 0;
    }
    if (live) sim.busy = true;

    render(ctx, sim, ink,
      function (i) { return 0.1 + sim.aux[i] * 0.9; },
      function (i) { return !!sim.landed[i]; });
  }

  Illo.renderer("deepen", deepen);
})();
