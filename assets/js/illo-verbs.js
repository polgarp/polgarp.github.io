// The verbs: what the cursor does. The cursor acts AS the verb — it doesn't
// push the picture around, it changes the picture's state and the geometry
// follows. That is why none of these can carve a hole in the image.
//
// Two rules every verb obeys:
//
//   ACCENT IS SCARCE. Red is drawn only where a point is both changed by the
//   reader (`landed`) and accent-eligible (`hard`, a fixed ~18% chosen at
//   seed). However hard a reader sweeps, red marks a few things, never the
//   whole object.
//
//   PERSISTENCE IS HONEST. A verb that leaves a trace uses red; a verb that
//   only reflects where the cursor is (light, focus) uses none. The presence
//   of accent tells a reader whether this picture remembers them.
(function () {
  "use strict";
  if (!window.Illo || !Illo.marks) return;

  var pass = Illo.marks.pass;
  var clamp01 = Illo.marks.clamp01;

  // Stable per-point noise: same value every frame, no storage.
  function hash(i) {
    var x = Math.sin(i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  function near2(sim, i) {
    var dx = sim.px - sim.xs[i], dy = sim.py - sim.ys[i];
    return dx * dx + dy * dy;
  }

  // Shared ink/accent draw. `tone` maps a point to 0..1.
  function render(ctx, sim, ink, tone, changed) {
    pass(ctx, sim, ink.fg,
      function (i) { return !(changed(i) && sim.hard[i]); }, tone);
    pass(ctx, sim, ink.accent,
      function (i) { return changed(i) && sim.hard[i]; }, tone);
  }

  function isLanded(sim) {
    return function (i) { return !!sim.landed[i]; };
  }

  // ---------------------------------------------------------------
  // ORDER — the cursor brings structure, and the structure holds for a while.
  // Where you attend, points resolve onto the grid. A scarce minority of what
  // you ordered goes red, marking what your attention actually produced.
  // ---------------------------------------------------------------
  var ORDER_R = 78, ORDER_RATE = 7;

  function order(ctx, sim, ink) {
    if (sim.pointerOn) {
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

  // ---------------------------------------------------------------
  // FOCUS — the cursor is a lens. Nothing persists, so no accent.
  // Out of focus the outline itself goes vague: resolve drops, so points drift
  // off their cells and the tone comes from noise. The object is present but
  // won't hold still enough to read.
  // ---------------------------------------------------------------
  var FOCUS_R = 168;

  function focus(ctx, sim, ink) {
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

  // ---------------------------------------------------------------
  // LIGHT — the cursor is a light source. Global, nothing persists, no accent.
  // Every mark shades by how much it faces the cursor, so moving anywhere on
  // the page re-lights the whole surface at once.
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

  // ---------------------------------------------------------------
  // IGNITE — the cursor leaves heat, which spreads to neighbours and cools.
  // The clearest case of the accent doctrine: heat is unambiguously state the
  // reader caused, and it fades, so red stays scarce without any cap.
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
      if (sim.pointerOn) {
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

  // ---------------------------------------------------------------
  // SIFT — the cursor removes the easy marks; the remainder is heavier.
  // Removed marks grow back slowly, so the illustration renews itself instead
  // of ending up spent. That is a general principle here, not a concession:
  // an illustration a reader can only exhaust once is a worse illustration.
  // ---------------------------------------------------------------
  var SIFT_R = 66, REGROW = 0.16;
  var gone = null, goneFor = -1;

  function sift(ctx, sim, ink) {
    var n = sim.n, i, dt = 1 / 60, live = 0;
    if (!gone || goneFor !== n) { gone = new Float32Array(n); goneFor = n; }
    var r2 = SIFT_R * SIFT_R;

    for (i = 0; i < n; i++) {
      // Light marks are the easy work — automation takes those first.
      if (sim.pointerOn && !sim.hard[i] && hash(i) > 0.34 && near2(sim, i) < r2) {
        gone[i] = 1;
      } else if (gone[i] > 0) {
        gone[i] -= REGROW * dt;
        if (gone[i] < 0) gone[i] = 0;
      }
      if (gone[i] > 0) live = 1;
      // What survives a sweep hardens: denser, and eligible for accent.
      sim.landed[i] = (sim.pointerOn && near2(sim, i) < r2 && !gone[i]) ||
                      sim.landed[i] ? 1 : 0;
    }
    if (live) sim.busy = true;

    render(ctx, sim, ink,
      function (i) {
        // A removed mark fades out and fades back rather than blinking.
        var present = 1 - gone[i];
        return (sim.landed[i] ? 1 : sim.base + 0.2) * present;
      },
      isLanded(sim));
  }

  // ---------------------------------------------------------------
  // PACE — slowness deepens, speed degrades.
  // The only verb that reads HOW you move rather than where, using the pointer
  // velocity the engine already tracks. Move carefully and marks resolve;
  // sweep through and they thin out.
  // ---------------------------------------------------------------
  var PACE_R = 72, SLOW = 260;

  function pace(ctx, sim, ink) {
    if (sim.pointerOn) {
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

  Illo.renderer("order", order);
  Illo.renderer("focus", focus);
  Illo.renderer("light", light);
  Illo.renderer("ignite", ignite);
  Illo.renderer("sift", sift);
  Illo.renderer("pace", pace);
})();
