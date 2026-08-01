// Bake-off only. Four candidate vocabularies for the signature look, all
// drawing the identical simulation so the comparison is about the marks and
// nothing else. Exactly one of these survives to become illo-draw.js; the rest
// get deleted, and the reasoning recorded in the design doc.
//
// Shared rules for all four: colour comes from the tokens, a seated point is
// accent, an unseated one is ink. No shadows, no filters, no compositing
// beyond source-over.
(function () {
  "use strict";
  if (!window.Illo) return;

  // ---------------------------------------------------------------
  // 1. GRID-BOUND MARKS
  // Every mark snaps to the cell grid, so an unseated point doesn't read as
  // "slightly off" — it reads as one cell wrong, which in a grid system is a
  // legible mistake rather than a blur. Cheapest of the four: two batched
  // fill() calls, no neighbour queries, no per-point state.
  // ---------------------------------------------------------------
  function grid(ctx, sim, ink) {
    var cell = sim.cell || 8;
    var m = Math.max(2, Math.round(cell * 0.68));
    var o = (cell - m) / 2;
    var i, gx, gy;

    ctx.fillStyle = ink.fg;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + o;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + o;
      ctx.rect(gx, gy, m, m);
    }
    ctx.fill();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + o;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + o;
      ctx.rect(gx, gy, m, m);
    }
    ctx.fill();
  }

  // ---------------------------------------------------------------
  // 2. POINT + LINK MESH
  // Dots plus a hairline between any two points closer than LINK. Reads as a
  // dot field when sparse and a mesh when dense. Needs a spatial hash or it is
  // O(n squared); even with one it is by far the most expensive candidate,
  // because it draws O(n*k) segments every frame.
  // ---------------------------------------------------------------
  var LINK = 15;
  var head = null, next = null, hcols = 0, hrows = 0;

  function mesh(ctx, sim, ink) {
    var n = sim.n;
    var cols = Math.max(1, Math.ceil(sim.w / LINK));
    var rows = Math.max(1, Math.ceil(sim.h / LINK));
    if (!head || hcols !== cols || hrows !== rows) {
      head = new Int32Array(cols * rows);
      hcols = cols; hrows = rows;
    }
    if (!next || next.length < n) next = new Int32Array(n);
    head.fill(-1);

    var i, cx, cy, ci;
    for (i = 0; i < n; i++) {
      cx = sim.xs[i] / LINK | 0;
      cy = sim.ys[i] / LINK | 0;
      if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
      if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
      ci = cy * cols + cx;
      next[i] = head[ci];
      head[ci] = i;
    }

    ctx.strokeStyle = ink.muted;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    var lim = LINK * LINK;
    for (i = 0; i < n; i++) {
      cx = sim.xs[i] / LINK | 0;
      cy = sim.ys[i] / LINK | 0;
      if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
      if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
      // Only forward neighbours, so each pair is visited once.
      for (var oy = 0; oy <= 1; oy++) {
        for (var ox = -1; ox <= 1; ox++) {
          if (oy === 0 && ox < 0) continue;
          var nx = cx + ox, ny = cy + oy;
          if (nx < 0 || nx >= cols || ny >= rows) continue;
          for (var j = head[ny * cols + nx]; j !== -1; j = next[j]) {
            if (j <= i) continue;
            var dx = sim.xs[i] - sim.xs[j];
            var dy = sim.ys[i] - sim.ys[j];
            if (dx * dx + dy * dy > lim) continue;
            ctx.moveTo(sim.xs[i], sim.ys[i]);
            ctx.lineTo(sim.xs[j], sim.ys[j]);
          }
        }
      }
    }
    ctx.stroke();

    ctx.fillStyle = ink.fg;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      if (sim.landed[i]) continue;
      ctx.moveTo(sim.xs[i] + 1.5, sim.ys[i]);
      ctx.arc(sim.xs[i], sim.ys[i], 1.5, 0, 6.283185);
    }
    ctx.fill();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      if (!sim.landed[i]) continue;
      ctx.moveTo(sim.xs[i] + 2, sim.ys[i]);
      ctx.arc(sim.xs[i], sim.ys[i], 2, 0, 6.283185);
    }
    ctx.fill();
  }

  // ---------------------------------------------------------------
  // 3. POINT + DECAY TRACE
  // The marks are nearly invisible; the picture is the fading record of where
  // they have been. Manages its own fade instead of clearing, which means the
  // canvas is never empty — and which is exactly why a single exported frame
  // cannot represent it.
  // ---------------------------------------------------------------
  function trace(ctx, sim, ink) {
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = ink.paper;
    ctx.fillRect(0, 0, sim.w, sim.h);
    ctx.globalAlpha = 1;

    var i;
    ctx.fillStyle = ink.fg;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      ctx.rect(sim.xs[i] - 0.75, sim.ys[i] - 0.75, 1.5, 1.5);
    }
    ctx.fill();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.rect(sim.xs[i] - 1.25, sim.ys[i] - 1.25, 2.5, 2.5);
    }
    ctx.fill();
  }
  trace.noClear = true;

  // ---------------------------------------------------------------
  // 4. POINT + FIELD RING
  // Each point draws a faint ring of influence; overlaps darken. You read the
  // forces rather than the objects. Middling cost — one arc per point, but
  // stroked arcs are pricier than filled rects.
  // ---------------------------------------------------------------
  function rings(ctx, sim, ink) {
    var i;
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = ink.fg;
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      ctx.moveTo(sim.xs[i] + 7, sim.ys[i]);
      ctx.arc(sim.xs[i], sim.ys[i], 7, 0, 6.283185);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.moveTo(sim.xs[i] + 7, sim.ys[i]);
      ctx.arc(sim.xs[i], sim.ys[i], 7, 0, 6.283185);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------
  // 5. GLYPH FIELD
  // The mark stays on its cell; the GLYPH encodes how far the point still is
  // from home. So an unfinished mark isn't displaced, it's thinner — the word
  // is complete in silhouette and visibly under-resolved in texture. This is
  // the one register where "almost done" can be shown without moving anything.
  // ---------------------------------------------------------------
  var RAMP = ".:-=+*#";
  var ERR_FULL = 16;   // error at which a mark reads as barely there

  function err(sim, i) {
    var dx = sim.txs[i] - sim.xs[i];
    var dy = sim.tys[i] - sim.ys[i];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function glyph(ctx, sim, ink) {
    var cell = sim.cell || 8;
    var mono = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono").trim() || "monospace";
    ctx.font = Math.round(cell * 1.35) + "px " + mono;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var i, gx, gy, e, ri;
    ctx.fillStyle = ink.fg;
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + cell / 2;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + cell / 2;
      e = err(sim, i);
      ri = Math.round((1 - Math.min(e / ERR_FULL, 1)) * (RAMP.length - 1));
      ctx.fillText(RAMP.charAt(ri), gx, gy);
    }

    ctx.fillStyle = ink.accent;
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + cell / 2;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + cell / 2;
      ctx.fillText("#", gx, gy);
    }
  }

  // ---------------------------------------------------------------
  // 6. HALFTONE CELLS
  // The same idea made continuous: on-grid, but the dot's RADIUS carries how
  // settled the point is. Reads as printed halftone rather than as a screen —
  // closest of the eight to the black/red/white printed register. Arcs of
  // different radii share one path, so it is still a single fill().
  // ---------------------------------------------------------------
  function halftone(ctx, sim, ink) {
    var cell = sim.cell || 8;
    var rmax = cell * 0.52;
    var i, gx, gy, r;

    ctx.fillStyle = ink.fg;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + cell / 2;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + cell / 2;
      r = rmax * (0.18 + 0.82 * (1 - Math.min(err(sim, i) / ERR_FULL, 1)));
      ctx.moveTo(gx + r, gy);
      ctx.arc(gx, gy, r, 0, 6.283185);
    }
    ctx.fill();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      gx = Math.round((sim.xs[i] - cell / 2) / cell) * cell + cell / 2;
      gy = Math.round((sim.ys[i] - cell / 2) / cell) * cell + cell / 2;
      ctx.moveTo(gx + rmax, gy);
      ctx.arc(gx, gy, rmax, 0, 6.283185);
    }
    ctx.fill();
  }

  // ---------------------------------------------------------------
  // 7. PLOTTER PATH
  // One continuous pen stroke through consecutive points, broken between runs
  // so the pen lifts rather than dragging across gaps. Unlike the mesh this is
  // sequence-based, not proximity-based: it reads as drawing rather than as
  // network. Cheapest possible draw — one path, one stroke.
  // ---------------------------------------------------------------
  function plotter(ctx, sim, ink) {
    var cell = sim.cell || 8;
    var i, run = false;

    ctx.strokeStyle = ink.fg;
    ctx.lineWidth = 1.1;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (i = 0; i < sim.n - 1; i++) {
      // Adjacent in the target grid? Then the pen stays down.
      var sameRow = Math.abs(sim.tys[i + 1] - sim.tys[i]) < 0.5;
      var nextCol = Math.abs(sim.txs[i + 1] - sim.txs[i] - cell) < 0.5;
      if (sameRow && nextCol) {
        if (!run) { ctx.moveTo(sim.xs[i], sim.ys[i]); run = true; }
        ctx.lineTo(sim.xs[i + 1], sim.ys[i + 1]);
      } else {
        run = false;
      }
    }
    ctx.stroke();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.moveTo(sim.xs[i] + 1.8, sim.ys[i]);
      ctx.arc(sim.xs[i], sim.ys[i], 1.8, 0, 6.283185);
    }
    ctx.fill();
  }

  // ---------------------------------------------------------------
  // 8. ERROR TICKS
  // Every mark draws a hairline from where it belongs to where it actually is.
  // The picture draws its own defect: a finished mark is a dot, an unfinished
  // one trails a visible little vector. The most literal of the eight, and the
  // only one where the gap is impossible to miss rather than easy to.
  // ---------------------------------------------------------------
  function ticks(ctx, sim, ink) {
    var i;
    ctx.strokeStyle = ink.muted;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      ctx.moveTo(sim.txs[i], sim.tys[i]);
      ctx.lineTo(sim.xs[i], sim.ys[i]);
    }
    ctx.stroke();

    ctx.fillStyle = ink.fg;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (sim.landed[i]) continue;
      ctx.rect(sim.xs[i] - 1, sim.ys[i] - 1, 2, 2);
    }
    ctx.fill();

    ctx.fillStyle = ink.accent;
    ctx.beginPath();
    for (i = 0; i < sim.n; i++) {
      if (!sim.landed[i]) continue;
      ctx.rect(sim.xs[i] - 1.5, sim.ys[i] - 1.5, 3, 3);
    }
    ctx.fill();
  }

  Illo.renderer("grid", grid);
  Illo.renderer("mesh", mesh);
  Illo.renderer("trace", trace);
  Illo.renderer("rings", rings);
  Illo.renderer("glyph", glyph);
  Illo.renderer("halftone", halftone);
  Illo.renderer("plotter", plotter);
  Illo.renderer("ticks", ticks);
})();
