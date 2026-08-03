// How a mark is drawn, independent of what the cursor does.
//
// Every renderer draws through this, so style and verb are separate choices:
// the contrasty rectangle mark can wear the evolving verb, and the glyph mark
// can wear the static one. Four styles, all grid-bound, all mono-derived.
//
// A style takes a TONE, 0 (barely there) to 1 (fully resolved), and an accent
// flag. Accent marks always draw at full weight whatever their tone — red is
// never faint, because in this system red means something definite: state the
// reader caused, which persists.
(function () {
  "use strict";
  if (!window.Illo) return;

  var GLYPHS = " .:-=+*#";
  // Weight ramp for the weighted style. IBM Plex Mono ships 400/600/700 on
  // this site, so these are real weights, not synthesised ones — a synthesised
  // bold would smear the grid.
  var WEIGHTS = [400, 400, 400, 600, 600, 700, 700, 700];

  function mono() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono").trim() || "monospace";
  }

  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function idx(t) { return Math.round(clamp01(t) * (GLYPHS.length - 1)); }

  // ---- 1. MARK — filled rectangles, area carries tone.
  // The strongest and most contrasty, and it rhymes with the rectangles
  // already in the site's furniture. No text rendering at all, so it is also
  // the cheapest: two batched fills for a whole field.
  var mark = {
    begin: function (ctx, cell) { this.cell = cell; },
    // Rect marks batch into a path, so they are collected and filled per pass.
    draw: function (ctx, x, y, tone, cell) {
      var m = clamp01(tone) * cell * 0.86;
      if (m < 0.6) return;
      ctx.rect(x - m / 2, y - m / 2, m, m);
    },
    batched: true
  };

  // ---- 2. GLYPH — one weight, character carries tone.
  // Evolves as it resolves, which is the quality the rect mark lacks, but the
  // ramp is line art so its darkest step is far lighter than a filled cell.
  var glyphStyle = {
    begin: function (ctx, cell) {
      ctx.font = Math.round(cell * 1.35) + "px " + mono();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    },
    draw: function (ctx, x, y, tone, cell) {
      var g = GLYPHS.charAt(idx(tone));
      if (g !== " ") ctx.fillText(g, x, y);
    },
    batched: false
  };

  // ---- 3. WEIGHTED — character AND font weight carry tone.
  // Your suggestion, and it works: pairing the glyph ramp with a weight ramp
  // roughly doubles the usable tonal range, so the dark end gets close to a
  // filled cell while the light end stays as delicate as ASCII. It does not
  // break any rule — a monospace face keeps its advance across weights, so the
  // grid holds. Costs a font switch per tone step, hence the sort by tone.
  var weighted = {
    begin: function (ctx, cell) {
      this.cell = cell;
      this.font = mono();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      this.last = -1;
    },
    draw: function (ctx, x, y, tone, cell) {
      var i = idx(tone);
      var g = GLYPHS.charAt(i);
      if (g === " ") return;
      if (i !== this.last) {
        ctx.font = WEIGHTS[i] + " " + Math.round(cell * 1.35) + "px " + this.font;
        this.last = i;
      }
      ctx.fillText(g, x, y);
    },
    batched: false
  };

  // ---- 4. HYBRID — glyphs for the light half, filled cells for the dark half.
  // Resolves the tension directly: the delicate evolving texture where the
  // image is unresolved, full rectangle contrast where it is. The seam is at
  // the midpoint of the ramp and is deliberately not disguised.
  var hybrid = {
    begin: function (ctx, cell) {
      ctx.font = Math.round(cell * 1.35) + "px " + mono();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    },
    draw: function (ctx, x, y, tone, cell) {
      var t = clamp01(tone);
      if (t > 0.5) {
        var m = ((t - 0.5) / 0.5) * cell * 0.86;
        ctx.fillRect(x - m / 2, y - m / 2, m, m);
      } else {
        var g = GLYPHS.charAt(Math.round((t / 0.5) * 4));
        if (g !== " ") ctx.fillText(g, x, y);
      }
    },
    batched: false
  };

  var STYLES = { mark: mark, glyph: glyphStyle, weighted: weighted, hybrid: hybrid };

  // ---- The pass helper every renderer uses.
  //
  // `tone(i)` returns 0..1 for point i, `use(i)` says whether this pass draws
  // it. Two passes per frame: ink, then accent. Batched styles collect into one
  // path and fill once; unbatched ones draw as they go.
  function pass(ctx, sim, colour, use, tone) {
    var style = STYLES[sim.style] || mark;
    var cell = sim.cell || 8;
    style.begin(ctx, cell);
    ctx.fillStyle = colour;
    if (style.batched) ctx.beginPath();
    for (var i = 0; i < sim.n; i++) {
      if (!use(i)) continue;
      style.draw(ctx, snap(sim.xs[i], cell), snap(sim.ys[i], cell), tone(i), cell);
    }
    if (style.batched) ctx.fill();
  }

  function snap(v, cell) {
    return Math.round((v - cell / 2) / cell) * cell + cell / 2;
  }

  Illo.marks = { pass: pass, snap: snap, styles: STYLES, clamp01: clamp01 };
})();
