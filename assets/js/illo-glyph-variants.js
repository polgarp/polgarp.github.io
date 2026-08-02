// Round three. All grid-bound, all monospace glyphs, one visual family — the
// variable is what the CURSOR DOES, because that is the open question: whether
// "move the mouse and the picture comes right" is one idea or a family of them.
//
// Five verbs, in rough order of how far they reach:
//   resolve  (round two) local, moves matter — attention lets a mark find home
//   focus    local, moves nothing — attention makes a mark legible
//   light    global — the cursor is a light source and the whole field shades
//   depth    global — the cursor is a viewpoint and the field parallaxes
//   ignite   persistent — the cursor leaves heat that spreads and stays
//
// A renderer is allowed to read sim.px/py: the cursor is part of what is being
// drawn, not an input to the physics only.
(function () {
  "use strict";
  if (!window.Illo) return;

  var RAMP = " .:-=+*#";
  var ERR_FULL = 16;

  function monoFont(cell) {
    var mono = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono").trim() || "monospace";
    return Math.round(cell * 1.35) + "px " + mono;
  }

  function setupText(ctx, cell) {
    ctx.font = monoFont(cell);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  function snap(v, cell) {
    return Math.round((v - cell / 2) / cell) * cell + cell / 2;
  }

  // Cheap deterministic per-index noise, so "random" is stable frame to frame.
  function hash(i) {
    var x = Math.sin(i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  function ramp(t) {
    var i = Math.round(Math.max(0, Math.min(1, t)) * (RAMP.length - 1));
    return RAMP.charAt(i);
  }

  // ---------------------------------------------------------------
  // FOCUS — the cursor is a lens.
  // Nothing moves. Away from the cursor the marks are mush: the glyph is
  // chosen from noise rather than from truth, so the image is *there* but
  // won't resolve. Near the cursor each mark snaps to its real value.
  // The reading: the picture was always finished; you weren't looking.
  // ---------------------------------------------------------------
  var FOCUS_R = 150;

  function focus(ctx, sim, ink) {
    var cell = sim.cell || 8;
    setupText(ctx, cell);
    var r2 = FOCUS_R * FOCUS_R;
    var i, gx, gy, dx, dy, sharp, e, val;

    ctx.fillStyle = ink.fg;
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      gx = snap(sim.xs[i], cell);
      gy = snap(sim.ys[i], cell);
      dx = sim.px - gx; dy = sim.py - gy;
      sharp = sim.pointerOn ? Math.max(0, 1 - (dx * dx + dy * dy) / r2) : 0;
      dx = sim.txs[i] - sim.xs[i]; dy = sim.tys[i] - sim.ys[i];
      e = 1 - Math.min(Math.sqrt(dx * dx + dy * dy) / ERR_FULL, 1);
      // Blend the true value with per-cell noise by how sharp we are here.
      val = e * sharp + hash(i) * 0.62 * (1 - sharp);
      ctx.fillText(ramp(val), gx, gy);
    }

    ctx.fillStyle = ink.accent;
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.fillText("#", snap(sim.xs[i], cell), snap(sim.ys[i], cell));
    }
  }

  // ---------------------------------------------------------------
  // LIGHT — the cursor is a light source.
  // Global, not local: every mark shades by how much it faces the cursor, so
  // moving anywhere on the page re-lights the whole image. This is the verb
  // that proves the idea isn't stuck being a flashlight — the illustration
  // responds as a single surface rather than a set of neighbourhoods.
  // ---------------------------------------------------------------
  function light(ctx, sim, ink) {
    var cell = sim.cell || 8;
    setupText(ctx, cell);
    var cxm = sim.w / 2, cym = sim.h / 2;
    var lx = sim.px - cxm, ly = sim.py - cym;
    var ll = Math.sqrt(lx * lx + ly * ly) || 1e-6;
    lx /= ll; ly /= ll;
    var lit = sim.pointerOn ? 1 : 0;
    var i, gx, gy, ox, oy, ol, face, e, dx, dy;

    ctx.fillStyle = ink.fg;
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      gx = snap(sim.xs[i], cell);
      gy = snap(sim.ys[i], cell);
      ox = gx - cxm; oy = gy - cym;
      ol = Math.sqrt(ox * ox + oy * oy) || 1e-6;
      // How much this cell faces the light, -1..1 -> 0..1
      face = 0.5 + 0.5 * ((ox / ol) * lx + (oy / ol) * ly);
      dx = sim.txs[i] - sim.xs[i]; dy = sim.tys[i] - sim.ys[i];
      e = 1 - Math.min(Math.sqrt(dx * dx + dy * dy) / ERR_FULL, 1);
      ctx.fillText(ramp(e * (0.42 + 0.58 * (lit ? face : 0.5))), gx, gy);
    }

    ctx.fillStyle = ink.accent;
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.fillText("#", snap(sim.xs[i], cell), snap(sim.ys[i], cell));
    }
  }

  // ---------------------------------------------------------------
  // DEPTH — the cursor is a viewpoint.
  // Three flat planes, offset against each other by where the cursor sits
  // relative to centre. Deliberately tiny: a couple of cells at the extreme.
  // Enough to feel like looking around the image rather than at it, without
  // pretending to be 3D or breaking the flatness of the site.
  // ---------------------------------------------------------------
  var PARALLAX = 9;

  function depth(ctx, sim, ink) {
    var cell = sim.cell || 8;
    setupText(ctx, cell);
    var sx = sim.pointerOn ? (sim.px - sim.w / 2) / (sim.w / 2) : 0;
    var sy = sim.pointerOn ? (sim.py - sim.h / 2) / (sim.h / 2) : 0;
    sx = Math.max(-1, Math.min(1, sx));
    sy = Math.max(-1, Math.min(1, sy));
    var i, plane, px, py, e, dx, dy;

    ctx.fillStyle = ink.fg;
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      plane = (hash(i * 3.7) * 3 | 0) - 1;   // -1, 0 or 1
      px = snap(sim.xs[i] + sx * PARALLAX * plane, cell);
      py = snap(sim.ys[i] + sy * PARALLAX * plane, cell);
      dx = sim.txs[i] - sim.xs[i]; dy = sim.tys[i] - sim.ys[i];
      e = 1 - Math.min(Math.sqrt(dx * dx + dy * dy) / ERR_FULL, 1);
      // Nearer planes read heavier, which is what sells the separation.
      ctx.fillText(ramp(e * (plane > 0 ? 1 : plane < 0 ? 0.55 : 0.78)), px, py);
    }

    ctx.fillStyle = ink.accent;
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      plane = (hash(i * 3.7) * 3 | 0) - 1;
      ctx.fillText("#", snap(sim.xs[i] + sx * PARALLAX * plane, cell),
                        snap(sim.ys[i] + sy * PARALLAX * plane, cell));
    }
  }

  // ---------------------------------------------------------------
  // IGNITE — the cursor leaves something behind.
  // Heat where you pass, spreading to grid neighbours and decaying slowly.
  // The only verb here with memory: the image records where you have been
  // instead of only reflecting where you are. Neighbours are precomputed once
  // from the static targets, so the spread costs one pass, not a search.
  // ---------------------------------------------------------------
  var IG_R = 60, IG_GAIN = 2.6, IG_SPREAD = 0.55, IG_DECAY = 0.55;
  var heat = null, nbr = null, nbrFor = null;

  function buildNeighbours(sim) {
    var cell = sim.cell || 8, n = sim.n;
    var map = {}, i, key;
    for (i = 0; i < n; i++) {
      key = Math.round(sim.tys[i] / cell) * 100000 + Math.round(sim.txs[i] / cell);
      map[key] = i;
    }
    nbr = new Int32Array(n * 4);
    for (i = 0; i < n; i++) {
      var cx = Math.round(sim.txs[i] / cell), cy = Math.round(sim.tys[i] / cell);
      var k = map[cy * 100000 + (cx - 1)]; nbr[i * 4] = k === undefined ? -1 : k;
      k = map[cy * 100000 + (cx + 1)]; nbr[i * 4 + 1] = k === undefined ? -1 : k;
      k = map[(cy - 1) * 100000 + cx]; nbr[i * 4 + 2] = k === undefined ? -1 : k;
      k = map[(cy + 1) * 100000 + cx]; nbr[i * 4 + 3] = k === undefined ? -1 : k;
    }
    nbrFor = n;
  }

  function ignite(ctx, sim, ink) {
    var cell = sim.cell || 8, n = sim.n, i, j, k;
    if (!heat || heat.length < n) heat = new Float32Array(n);
    if (nbrFor !== n) buildNeighbours(sim);

    var r2 = IG_R * IG_R, dt = 1 / 60;
    for (i = 0; i < n; i++) {
      if (sim.pointerOn) {
        var dx = sim.px - sim.xs[i], dy = sim.py - sim.ys[i];
        var q = dx * dx + dy * dy;
        if (q < r2) heat[i] += IG_GAIN * (1 - q / r2) * dt * 60 * 0.06;
      }
      heat[i] -= IG_DECAY * dt;
      if (heat[i] < 0) heat[i] = 0; else if (heat[i] > 1) heat[i] = 1;
    }
    // Heat has to finish cooling even after the points stop moving, so hold
    // the instance awake while any is left rather than freezing mid-glow.
    var hot = 0;
    for (i = 0; i < n; i++) if (heat[i] > 0.02) { hot = 1; break; }
    sim.busy = !!hot;

    // One spread pass along precomputed grid neighbours.
    for (i = 0; i < n; i++) {
      if (heat[i] < 0.35) continue;
      for (k = 0; k < 4; k++) {
        j = nbr[i * 4 + k];
        if (j >= 0 && heat[j] < heat[i]) heat[j] += (heat[i] - heat[j]) * IG_SPREAD * dt;
      }
    }

    setupText(ctx, cell);
    var gx, gy, e, ex, ey;
    ctx.fillStyle = ink.fg;
    for (i = 0; i < n; i++) {
      if (heat[i] > 0.12 || sim.landed[i]) continue;
      gx = snap(sim.xs[i], cell); gy = snap(sim.ys[i], cell);
      ex = sim.txs[i] - sim.xs[i]; ey = sim.tys[i] - sim.ys[i];
      e = 1 - Math.min(Math.sqrt(ex * ex + ey * ey) / ERR_FULL, 1);
      ctx.fillText(ramp(e), gx, gy);
    }
    ctx.fillStyle = ink.accent;
    for (i = 0; i < n; i++) {
      if (!(heat[i] > 0.12) && !sim.landed[i]) continue;
      gx = snap(sim.xs[i], cell); gy = snap(sim.ys[i], cell);
      ctx.fillText(ramp(sim.landed[i] ? 1 : 0.3 + heat[i] * 0.7), gx, gy);
    }
  }

  Illo.renderer("focus", focus);
  Illo.renderer("light", light);
  Illo.renderer("depth", depth);
  Illo.renderer("ignite", ignite);
})();
