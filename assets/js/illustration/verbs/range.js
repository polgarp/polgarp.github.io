// Verb: range
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
  var hash = Illo.marks.hash;
  var pass = Illo.marks.pass;

  // ---------------------------------------------------------------
  // RANGE — the same act at every altitude, at the scale that altitude asks
  // for. High in the field the cursor works wide and shallow; low in it, tight
  // and deep.
  //
  // The point is that NEITHER is the better way to work. A verb where one
  // height paid better would argue the opposite of what it is here to say, so
  // reach and rate trade off inversely: along a sweep a point's exposure time
  // is proportional to the radius, which makes REACH x RATE the quantity that
  // decides how deep a pass goes. Hold that constant and a pass leaves the same
  // depth at any height — and can reach the accent at any height. What changes
  // is only the shape of what is left behind: a broad thin band, or a small
  // dense patch.
  //
  //   260 x 2.4 = 624        64 x 9.75 = 624
  //
  // This is `order` with a scale term, and it is a separate verb rather than a
  // parameter on that one for the same reason `deepen` is separate from `pace`:
  // they key off the same input and say different things. `order` argues that
  // attention produces structure. `range` argues that it does so at whatever
  // altitude you work at.
  // ---------------------------------------------------------------
  var R_HIGH = 260, R_LOW = 64;         // influence radius, px
  var RATE_HIGH = 2.4, RATE_LOW = 9.75; // resolve per second at the centre

  // Altitude is measured over the middle of the field, not its full height. A
  // background fades at both ends — by coverage, so the marks there step down
  // the ramp to nothing — and mapping 0..1 across the whole box would spend
  // most of the range where nothing is drawn, putting the most extreme
  // behaviour exactly where it cannot be seen.
  var BAND_TOP = 0.12, BAND_BOTTOM = 0.88;

  // What is left behind should say what altitude it was made at, and rule 9 is
  // clear that the contrast has to be categorical rather than tonal: two shades
  // of red would read as one smudge. So the accent splits into two passes with
  // two glyphs the ramp never produces — a mark that shows red also shows
  // WHICH altitude produced it.
  //
  //   ~  worked high: open and horizontal, a mark with breadth in it
  //   @  worked low: closed and dense, a mark with depth in it
  //
  // Altitude at the moment of landing is held privately here, the way `deepen`
  // holds depth. It is only ever read where sim.landed is set, so a stale value
  // behind a reverted mark cannot show.
  var HIGH_GLYPH = "~", LOW_GLYPH = "@";
  var madeAt = null;

  // ---- The terrain the altitudes are read against.
  //
  // The split between the two glyphs is dithered rather than thresholded — a
  // hard cut at mid-band gives two flat zones and a switch between them, which
  // says "high" and "low" and nothing about the ground in between. But the
  // dither has to be SPATIALLY COHERENT or it says nothing either.
  //
  // Dithering against each point's own hash is white noise: neighbouring marks
  // draw independent values and land on opposite sides of the line, so the
  // result is salt and pepper. Correct on average, and it reads as randomness.
  // Sampling a smooth field instead makes neighbours agree, and the boundary
  // between the two glyphs becomes a CONTOUR.
  //
  // What that turns altitude into is a water level. The `@` regions grow out of
  // the field's valleys as the reader works lower and recede as they work
  // higher, and the edge between the glyphs is the line where their altitude
  // cuts the terrain. So the picture is the intersection of where someone
  // worked and how high they were standing — the map is only ever visible where
  // it has been worked, which is the whole argument. Exploring it and making it
  // are the same gesture.
  //
  // Three sines rather than a noise library: smooth by construction, stable
  // without storage, allocation-free, and the wavelengths (about 480px, 370px
  // and 200px) put a few features inside one screen.
  var terrain = null;
  var terrainFor = { n: -1, w: -1, h: -1 };

  function buildTerrain(sim) {
    if (terrainFor.n === sim.n && terrainFor.w === sim.w && terrainFor.h === sim.h) return;
    if (!terrain || terrain.length < sim.n) terrain = new Float32Array(sim.n);
    for (var i = 0; i < sim.n; i++) {
      var x = sim.txs[i], y = sim.tys[i];
      var v = Math.sin(x * 0.011 + y * 0.006) * 0.52
            + Math.sin(x * 0.005 - y * 0.014 + 1.7) * 0.32
            + Math.sin(x * 0.019 + y * 0.015 + 4.1) * 0.16;
      // Expanded past the usual 0.5 scaling. Summed sines cluster hard around
      // their midpoint, so mapping straight to 0..1 leaves the water level only
      // biting near altitude 0.5 — work high or low and the contour barely
      // moves. Widening the spread makes more of the altitude range change what
      // is on screen, at the cost of clipping the extremes flat, which is what
      // a plateau and a basin look like anyway.
      //
      // A little white noise on top, so the contour has a frayed edge instead
      // of a drawn one — the same reason the character fade is jittered.
      terrain[i] = clamp01(v * 0.72 + 0.5 + (hash(i) - 0.5) * 0.08);
    }
    terrainFor.n = sim.n; terrainFor.w = sim.w; terrainFor.h = sim.h;
  }

  function workedHigh(i) {
    return madeAt[i] < terrain[i];
  }

  // Accent asserts itself only where there is enough coverage to carry it.
  //
  // Rule 7 already sets this bar — "red in the faint halo is too pale to read
  // as accent" — and it matters twice as much with a forced glyph, because
  // `pass` overrides the ramp character for every mark it draws. Without this,
  // an accent inside the character fade draws as a light-weight `@` while
  // everything around it has stepped down to `.`, so the accents are the one
  // thing that refuses to fade. Below the bar they fall through to the ink pass
  // and thin down the ramp like the rest of the field.
  var ACCENT_COVER = 0.55;

  function range(ctx, sim, ink) {
    if (!madeAt || madeAt.length < sim.n) madeAt = new Float32Array(sim.n);
    buildTerrain(sim);
    if (sim.moving) {
      // The reader chooses the altitude by where they hold the cursor; the
      // field answers at that scale.
      var alt = clamp01(
        (sim.py / (sim.h || 1) - BAND_TOP) / (BAND_BOTTOM - BAND_TOP)
      );
      var r = R_HIGH + (R_LOW - R_HIGH) * alt;
      var rate = RATE_HIGH + (RATE_LOW - RATE_HIGH) * alt;
      var r2 = r * r;
      for (var i = 0; i < sim.n; i++) {
        var q = near2(sim, i);
        if (q >= r2) continue;
        sim.aux[i] = clamp01(sim.aux[i] + (1 - q / r2) * rate * (1 / 60));
        // Recorded on the TRANSITION into landed, never while landed.
        //
        // Writing it every frame a mark is in reach means the cursor's current
        // height overwrites the height the mark was made at, so moving up and
        // down flips every mark in the patch between `~` and `@` at once — it
        // reads as flashing, and it destroys the thing the glyph is for. A mark
        // keeps the altitude that first brought it into order, until it reverts
        // to base and the field rule clears `landed` again.
        //
        // The consequence is the good one: work a patch high and then low and
        // it holds BOTH glyphs, because each mark records when it crossed. The
        // ground remembers how it was worked, not just what happened last.
        if (sim.aux[i] > 0.6 && !sim.landed[i]) {
          sim.landed[i] = 1;
          madeAt[i] = alt;
        }
      }
    }

    // Three passes rather than Illo.marks.render, which draws a single accent.
    // Tone is scaled by coverage here exactly as render would, so the character
    // fade still walks these marks down the ramp at the field's edges — an
    // accent near the top thins to `.` like everything else.
    function toned(i) { return (0.1 + sim.aux[i] * 0.9) * sim.wt[i]; }
    function marked(i) {
      return sim.landed[i] && sim.hard[i] && sim.wt[i] > ACCENT_COVER;
    }

    pass(ctx, sim, ink.fg, function (i) { return !marked(i); }, toned);
    pass(ctx, sim, ink.accent,
      function (i) { return marked(i) && workedHigh(i); }, toned, HIGH_GLYPH);
    pass(ctx, sim, ink.accent,
      function (i) { return marked(i) && !workedHigh(i); }, toned, LOW_GLYPH);
  }

  Illo.renderer("range", range);
})();
