// Verb: ignite
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
  // IGNITE — per-point heat, gained near the cursor, spread to the four grid
  // neighbours and decayed each frame. Heat is local state rather than
  // sim.aux, so geometry is unaffected.
  // ---------------------------------------------------------------
  var IG_R = 62, IG_GAIN = 3.2, IG_SPREAD = 0.75, IG_DECAY = 0.42;
  var heat = null, nbr = null, nbrFor = -1;

  function buildNeighbours(sim) {
    var cell = sim.cell || 8, n = sim.n, map = {}, i, k;
    for (i = 0; i < n; i++) {
      map[Math.round(sim.tys[i] / cell) * 1e5 + Math.round(sim.txs[i] / cell)] = i;
    }
    nbr = new Int32Array(n * 4);
    for (i = 0; i < n; i++) {
      var cx = Math.round(sim.txs[i] / cell), cy = Math.round(sim.tys[i] / cell);
      k = map[cy * 1e5 + cx - 1];       nbr[i * 4] = k === undefined ? -1 : k;
      k = map[cy * 1e5 + cx + 1];       nbr[i * 4 + 1] = k === undefined ? -1 : k;
      k = map[(cy - 1) * 1e5 + cx];     nbr[i * 4 + 2] = k === undefined ? -1 : k;
      k = map[(cy + 1) * 1e5 + cx];     nbr[i * 4 + 3] = k === undefined ? -1 : k;
    }
    nbrFor = n;
  }

  function ignite(ctx, sim, ink) {
    var n = sim.n, i, j, k, dt = 1 / 60;
    if (!heat || heat.length < n) heat = new Float32Array(n);
    if (nbrFor !== n) buildNeighbours(sim);
    var r2 = IG_R * IG_R, hot = 0;

    for (i = 0; i < n; i++) {
      if (sim.moving) {
        var q = near2(sim, i);
        if (q < r2) heat[i] += IG_GAIN * (1 - q / r2) * dt;
      }
      heat[i] -= IG_DECAY * dt;
      if (heat[i] < 0) heat[i] = 0; else if (heat[i] > 1) heat[i] = 1;
      if (heat[i] > 0.02) hot = 1;
      sim.landed[i] = heat[i] > 0.15 ? 1 : 0;
    }
    for (i = 0; i < n; i++) {
      if (heat[i] < 0.3) continue;
      for (k = 0; k < 4; k++) {
        j = nbr[i * 4 + k];
        if (j >= 0 && heat[j] < heat[i]) heat[j] += (heat[i] - heat[j]) * IG_SPREAD * dt;
      }
    }
    if (hot) sim.busy = true;

    render(ctx, sim, ink,
      function (i) { return sim.base + 0.16 + heat[i] * 0.72; },
      isLanded(sim));
  }

  Illo.renderer("ignite", ignite);
})();
