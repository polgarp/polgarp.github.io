// The verbs. What the cursor DOES — orthogonal to how a mark is drawn.
//
// Accent doctrine, applied consistently here: RED MEANS PERSISTENT STATE THE
// READER CAUSED. A verb that leaves a trace uses it; a verb that only reflects
// where the cursor is (light, depth, focus) uses none. That is not a shortage
// of red, it is the signal — accent present means this picture remembers you.
//
// Every verb reads and writes sim.aux (0 chaotic .. 1 resolved) rather than
// pushing points around, so nothing can carve a void in the image.
(function () {
  "use strict";
  if (!window.Illo || !Illo.marks) return;

  var pass = Illo.marks.pass;
  var clamp01 = Illo.marks.clamp01;

  function hash(i) {
    var x = Math.sin(i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  // Squared distance from the cursor, in logical px.
  function near2(sim, i) {
    var dx = sim.px - sim.xs[i], dy = sim.py - sim.ys[i];
    return dx * dx + dy * dy;
  }

  // ---------------------------------------------------------------
  // ORDER — the cursor brings structure to chaos, and the structure stays.
  // Starts genuinely disordered: marks off their cells, tone random. Where you
  // attend, points settle onto the grid and resolve, permanently. The picture
  // is built by where you looked. Red = the ordered part, because that is
  // exactly the state you caused.
  // ---------------------------------------------------------------
  var ORDER_R = 78, ORDER_RATE = 7;

  function order(ctx, sim, ink) {
    var r2 = ORDER_R * ORDER_R, i, hot = 0;
    if (sim.pointerOn) {
      for (i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q < r2) {
          sim.aux[i] += (1 - q / r2) * ORDER_RATE * (1 / 60);
          if (sim.aux[i] > 1) sim.aux[i] = 1;
          if (sim.aux[i] > 0.6) sim.landed[i] = 1;
        }
      }
    }
    for (i = 0; i < sim.n; i++) if (sim.aux[i] > 0.02 && sim.aux[i] < 0.99) { hot = 1; break; }
    sim.busy = !!hot;

    pass(ctx, sim, ink.fg,
      function (i) { return !sim.landed[i]; },
      function (i) { return 0.18 + sim.aux[i] * 0.55 + hash(i) * 0.18; });
    pass(ctx, sim, ink.accent,
      function (i) { return !!sim.landed[i]; },
      function () { return 1; });
  }

  // ---------------------------------------------------------------
  // FOCUS — the cursor is a lens. Nothing moves, nothing persists.
  // Away from the cursor the tone comes from noise, so the image is present
  // but will not resolve; near it, every mark reads true. No accent: this verb
  // leaves nothing behind, and saying so with the absence of red is the point.
  // ---------------------------------------------------------------
  var FOCUS_R = 165;

  function focus(ctx, sim, ink) {
    var r2 = FOCUS_R * FOCUS_R;
    pass(ctx, sim, ink.fg,
      function () { return true; },
      function (i) {
        var sharp = sim.pointerOn ? clamp01(1 - near2(sim, i) / r2) : 0;
        sharp = sharp * sharp;
        // True tone where sharp, per-cell noise where not.
        return 1 * sharp + (0.15 + hash(i) * 0.5) * (1 - sharp);
      });
  }

  // ---------------------------------------------------------------
  // LIGHT — the cursor is a light source. Global, nothing persists.
  // Every mark shades by how much it faces you, so moving anywhere re-lights
  // the whole surface. You liked this one; the only change is that it now
  // draws through the style layer, so it can wear the contrasty rect mark.
  // ---------------------------------------------------------------
  function light(ctx, sim, ink) {
    var cx = sim.w / 2, cy = sim.h / 2;
    var lx = sim.px - cx, ly = sim.py - cy;
    var ll = Math.sqrt(lx * lx + ly * ly) || 1e-6;
    lx /= ll; ly /= ll;
    var lit = sim.pointerOn;
    pass(ctx, sim, ink.fg,
      function () { return true; },
      function (i) {
        if (!lit) return 0.6;
        var ox = sim.xs[i] - cx, oy = sim.ys[i] - cy;
        var ol = Math.sqrt(ox * ox + oy * oy) || 1e-6;
        var face = 0.5 + 0.5 * ((ox / ol) * lx + (oy / ol) * ly);
        return 0.14 + face * 0.96;
      });
  }

  // ---------------------------------------------------------------
  // DEPTH — the cursor is a viewpoint. Global, nothing persists.
  // You said it didn't read on a word: too many small strokes, too few depth
  // steps. Now five planes instead of three, a wider throw, and tone tied to
  // plane so near reads heavy and far reads faint. Wants a simple object.
  // ---------------------------------------------------------------
  var PLANES = 5, THROW = 15;

  function depth(ctx, sim, ink) {
    var sx = sim.pointerOn ? clamp01((sim.px - sim.w / 2) / (sim.w / 2) * 0.5 + 0.5) * 2 - 1 : 0;
    var sy = sim.pointerOn ? clamp01((sim.py - sim.h / 2) / (sim.h / 2) * 0.5 + 0.5) * 2 - 1 : 0;
    var cell = sim.cell || 8;
    var style = Illo.marks.styles[sim.style] || Illo.marks.styles.mark;
    style.begin(ctx, cell);
    ctx.fillStyle = ink.fg;
    if (style.batched) ctx.beginPath();
    for (var i = 0; i < sim.n; i++) {
      var p = (hash(i * 3.7) * PLANES | 0);          // 0..PLANES-1
      var d = p / (PLANES - 1) * 2 - 1;              // -1 far .. 1 near
      style.draw(ctx,
        Illo.marks.snap(sim.xs[i] + sx * THROW * d, cell),
        Illo.marks.snap(sim.ys[i] + sy * THROW * d, cell),
        0.22 + (d * 0.5 + 0.5) * 0.86, cell);
    }
    if (style.batched) ctx.fill();
  }

  // ---------------------------------------------------------------
  // IGNITE — the cursor leaves heat, which spreads and cools.
  // The one you found clearest, kept and strengthened. Persistent, so red.
  // ---------------------------------------------------------------
  var IG_R = 62, IG_GAIN = 3.2, IG_SPREAD = 0.75, IG_DECAY = 0.42;
  var heat = null, nbr = null, nbrFor = -1;

  function buildNeighbours(sim) {
    var cell = sim.cell || 8, n = sim.n, map = {}, i;
    for (i = 0; i < n; i++) {
      map[Math.round(sim.tys[i] / cell) * 1e5 + Math.round(sim.txs[i] / cell)] = i;
    }
    nbr = new Int32Array(n * 4);
    for (i = 0; i < n; i++) {
      var cx = Math.round(sim.txs[i] / cell), cy = Math.round(sim.tys[i] / cell), k;
      k = map[cy * 1e5 + cx - 1]; nbr[i * 4] = k === undefined ? -1 : k;
      k = map[cy * 1e5 + cx + 1]; nbr[i * 4 + 1] = k === undefined ? -1 : k;
      k = map[(cy - 1) * 1e5 + cx]; nbr[i * 4 + 2] = k === undefined ? -1 : k;
      k = map[(cy + 1) * 1e5 + cx]; nbr[i * 4 + 3] = k === undefined ? -1 : k;
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
    }
    for (i = 0; i < n; i++) {
      if (heat[i] < 0.3) continue;
      for (k = 0; k < 4; k++) {
        j = nbr[i * 4 + k];
        if (j >= 0 && heat[j] < heat[i]) heat[j] += (heat[i] - heat[j]) * IG_SPREAD * dt;
      }
    }
    sim.busy = !!hot;

    pass(ctx, sim, ink.fg,
      function (i) { return heat[i] <= 0.15; },
      function () { return 0.62; });
    pass(ctx, sim, ink.accent,
      function (i) { return heat[i] > 0.15; },
      function (i) { return 0.35 + heat[i] * 0.65; });
  }

  // ---------------------------------------------------------------
  // SIFT — the cursor removes the easy marks, and what is left is heavier.
  // For the automation-trap argument: you take work away and the remainder is
  // denser, not lighter. Sweeping deletes the light marks permanently; the
  // survivors are the hard ones, and they go red because the state is yours.
  // ---------------------------------------------------------------
  var SIFT_R = 66;

  function sift(ctx, sim, ink) {
    var r2 = SIFT_R * SIFT_R, i, moving = 0;
    if (sim.pointerOn) {
      for (i = 0; i < sim.n; i++) {
        if (sim.landed[i] || sim.hard[i]) continue;
        if (near2(sim, i) < r2) {
          // Light marks are the easy work: automation takes them first.
          if (hash(i) > 0.34) sim.landed[i] = 1;   // removed
          else sim.hard[i] = 1;                    // survives, and hardens
          moving = 1;
        }
      }
    }
    if (moving) sim.busy = true;

    pass(ctx, sim, ink.fg,
      function (i) { return !sim.landed[i] && !sim.hard[i]; },
      function (i) { return 0.28 + hash(i) * 0.34; });
    pass(ctx, sim, ink.accent,
      function (i) { return !!sim.hard[i]; },
      function () { return 1; });
  }

  // ---------------------------------------------------------------
  // PACE — slowness deepens, speed degrades.
  // For the deliberate-practice argument: the slowness was doing work nobody
  // named. Move the cursor slowly and marks under it gain; sweep fast and they
  // thin out. Uses the pointer velocity the engine already tracks, so it is
  // the one verb that responds to HOW you move rather than where.
  // ---------------------------------------------------------------
  var PACE_R = 72, SLOW = 260;

  function pace(ctx, sim, ink) {
    var r2 = PACE_R * PACE_R, dt = 1 / 60, i, hot = 0;
    if (sim.pointerOn) {
      // 1 when barely moving, -1 when sweeping.
      var care = 1 - 2 * clamp01(sim.pspeed / SLOW);
      for (i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        sim.aux[i] += care * (1 - q / r2) * 2.2 * dt;
        sim.aux[i] = clamp01(sim.aux[i]);
        sim.landed[i] = sim.aux[i] > 0.8 ? 1 : 0;
      }
    }
    for (i = 0; i < sim.n; i++) if (sim.aux[i] > 0.02) { hot = 1; break; }
    sim.busy = !!hot;

    pass(ctx, sim, ink.fg,
      function (i) { return !sim.landed[i]; },
      function (i) { return 0.16 + sim.aux[i] * 0.6; });
    pass(ctx, sim, ink.accent,
      function (i) { return !!sim.landed[i]; },
      function () { return 1; });
  }

  Illo.renderer("order", order);
  Illo.renderer("focus2", focus);
  Illo.renderer("light2", light);
  Illo.renderer("depth2", depth);
  Illo.renderer("ignite2", ignite);
  Illo.renderer("sift", sift);
  Illo.renderer("pace", pace);
})();
