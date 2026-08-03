// How a mark is drawn. One style, deliberately: weighted monospace glyphs.
//
// The character carries coarse tone and the font weight carries fine tone, so
// the ramp has roughly twice the range of glyphs alone while keeping the
// texture that pure rectangles lack. A monospace face holds its advance across
// weights, so varying weight does not disturb the grid.
//
// Alternatives considered and rejected are recorded in the doctrine, not here.
(function () {
  "use strict";
  if (!window.Illo) return;

  var GLYPHS = " .:-=+*#";
  // Real weights only — IBM Plex Mono ships 400/600/700 on this site. A
  // synthesised bold would smear the cell.
  var WEIGHTS = [400, 400, 400, 600, 600, 700, 700, 700];
  var SIZE_RATIO = 1.35;

  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function snap(v, cell) {
    return Math.round((v - cell / 2) / cell) * cell + cell / 2;
  }

  // Draw one pass over the field: `use(i)` selects points, `tone(i)` gives
  // 0..1. Glyphs are grouped by ramp step so the canvas font is set once per
  // step rather than once per mark — the difference is roughly 3x.
  function pass(ctx, sim, colour, use, tone) {
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
      var g = GLYPHS.charAt(s);
      for (i = 0; i < b.length; i++) {
        var k = b[i];
        ctx.fillText(g, snap(sim.xs[k], cell), snap(sim.ys[k], cell));
      }
    }
  }

  Illo.marks = { pass: pass, snap: snap, clamp01: clamp01, glyphs: GLYPHS };
})();
