// Mark rendering. One style: weighted monospace glyphs, where the character
// carries coarse tone and the font weight carries fine tone.
//
//   Illo.marks.pass(ctx, sim, colour, use, tone)
//
// `use(i)` selects which points this pass draws, `tone(i)` returns 0..1.
// Call once per colour; a tone of 0 draws nothing.
//
// Varying weight is safe on the grid because a monospace face keeps its
// advance across weights. Rejected alternatives are in the doctrine.
(function () {
  "use strict";
  if (!window.Illo) return;

  var GLYPHS = " .:-=+*#";
  // Only weights the loaded face actually has (head.html loads 400/600/700).
  // A synthesised bold would smear the cell.
  var WEIGHTS = [400, 400, 400, 600, 600, 700, 700, 700];
  var SIZE_RATIO = 1.35;

  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function snap(v, cell) {
    return Math.round((v - cell / 2) / cell) * cell + cell / 2;
  }

  // Draw one pass over the field: `use(i)` selects points, `tone(i)` gives
  // 0..1. Glyphs are grouped by ramp step so the canvas font is set once per
  // step rather than once per mark — the difference is roughly 3x.
  // When recording, a pass also appends what it drew. The exporter uses this
  // so a generated fallback is exactly what the renderer produced — whatever
  // verb drew it — rather than a second implementation of each verb's tone.
  var rec = null;

  // `glyph`, if given, overrides the ramp character for every mark in the
  // pass. Weight still comes from tone, so an overridden mark keeps the
  // field's tonal structure while reading as a different KIND of mark.
  function pass(ctx, sim, colour, use, tone, glyph) {
    var cell = sim.cell || 8;
    var mono = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono").trim() || "monospace";
    var size = Math.round(cell * SIZE_RATIO);

    ctx.fillStyle = colour;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Bucket indices by ramp step. Reused across frames, never reallocated.
    var buckets = pass._b || (pass._b = []);
    var s, i;
    for (s = 1; s < GLYPHS.length; s++) {
      if (!buckets[s]) buckets[s] = [];
      buckets[s].length = 0;
    }
    for (i = 0; i < sim.n; i++) {
      if (!use(i)) continue;
      s = Math.round(clamp01(tone(i)) * (GLYPHS.length - 1));
      if (s > 0) buckets[s].push(i);
    }
    for (s = 1; s < GLYPHS.length; s++) {
      var b = buckets[s];
      if (!b.length) continue;
      ctx.font = WEIGHTS[s] + " " + size + "px " + mono;
      var g = glyph || GLYPHS.charAt(s);
      for (i = 0; i < b.length; i++) {
        var k = b[i];
        var mx = snap(sim.xs[k], cell), my = snap(sim.ys[k], cell);
        ctx.fillText(g, mx, my);
        if (rec) rec.push([mx, my, g, WEIGHTS[s], colour]);
      }
    }
  }


  // ---- Helpers every verb needs.

  // Stable per-point noise: same value every frame, no storage.
  function hash(i) {
    var x = Math.sin(i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  // Squared distance from the cursor to a point, in logical px.
  function near2(sim, i) {
    var dx = sim.px - sim.xs[i], dy = sim.py - sim.ys[i];
    return dx * dx + dy * dy;
  }

  // Two passes: ink, then accent. A point draws accent only when it is both
  // changed by the reader (`changed`) and accent-eligible (sim.hard, a fixed
  // subset chosen at seed) — which is what bounds how much red can appear.
  // Verbs with no persistent state pass a constant-false `changed`.
  // Every tone is scaled by mask coverage, so objects fade at their edges
  // without each verb having to handle it.
  function render(ctx, sim, ink, tone, changed, accentGlyph) {
    function toned(i) { return tone(i) * sim.wt[i]; }
    pass(ctx, sim, ink.fg,
      function (i) { return !(changed(i) && sim.hard[i]); }, toned);
    pass(ctx, sim, ink.accent,
      function (i) { return changed(i) && sim.hard[i]; }, toned, accentGlyph);
  }

  function isLanded(sim) {
    return function (i) { return !!sim.landed[i]; };
  }

  Illo.marks = { pass: pass, snap: snap, clamp01: clamp01, glyphs: GLYPHS,
                 size: function (cell) { return Math.round(cell * SIZE_RATIO); },
                 record: function (on) { rec = on ? [] : null; return rec; },
                 recorded: function () { return rec; },
                 hash: hash, near2: near2, render: render, isLanded: isLanded };
})();
