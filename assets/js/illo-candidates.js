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

  Illo.renderer("grid", grid);
  Illo.renderer("mesh", mesh);
  Illo.renderer("trace", trace);
  Illo.renderer("rings", rings);
})();
