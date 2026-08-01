---
title: "Illustration engine — bake-off"
sitemap: false
---

Eight candidate vocabularies for the signature look, all drawing the
**identical simulation**, so the only variable is the marks.

The rule is `intention-rendering`: points converge on a form, ~80% seat
themselves, the remaining 20% come to rest a few pixels off. **Attention is
what finishes them** — while the cursor is near an unseated mark, that mark can
finally reach where it belongs, and it locks there in accent red. Move fast
across the settled 80% and you shove it aside; it springs back. What you
finished by hand is the only part that doesn't flinch.

Sweep each one slowly, then flick across it fast. Then reload and look at it
*without* touching it — that untouched state is what most readers see, and
whether it reads as finished is the whole argument.

## Round two

<div class="bake">

  <section class="bake__panel">
    <h2 class="bake__name">5 · Glyph field</h2>
    <p class="bake__note">The mark stays on its cell; the <em>glyph</em> carries how far the point still is from home — <code>. : - = + * #</code>. So an unfinished mark isn't displaced, it's thinner. The word is complete in silhouette and visibly under-resolved in texture, which is the only register here that can show "almost done" without moving anything.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="glyph" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="0"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">6 · Halftone cells</h2>
    <p class="bake__note">The same idea made continuous: on-grid, but the dot's <em>radius</em> carries how settled the point is. Reads as printed halftone rather than as screen — the closest of the eight to a black/red/white printed register.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="halftone" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="1"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">7 · Plotter path</h2>
    <p class="bake__note">One continuous pen stroke through consecutive points, lifting between runs. Unlike the mesh this is sequence-based rather than proximity-based, so it reads as <em>drawing</em> rather than as network — and it sidesteps the particles.js resemblance entirely.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="plotter" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="2"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">8 · Error ticks</h2>
    <p class="bake__note">Every mark draws a hairline from where it belongs to where it actually is. The picture draws its own defect. The most literal of the eight — and the only one where the gap is impossible to miss rather than easy to.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="ticks" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="3"></p>
  </section>

</div>

## Round one, kept for reference

Same simulation, same cursor behaviour. Not deleted — noted.

<div class="bake">

  <section class="bake__panel">
    <h2 class="bake__name">1 · Grid-bound marks</h2>
    <p class="bake__note">Marks snap to the cell grid, so an unseated point is <em>one cell wrong</em>. Cheapest of the eight, but grid snapping has no middle register: error is either invisible or a whole cell. Superseded by 5 and 6, which keep the grid and move the signal into the mark.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="grid" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="4"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">2 · Point + link mesh</h2>
    <p class="bake__note">Dots plus a hairline under a distance threshold. Most expressive per rule, and the closest to the Thinkable reference — but also the most-copied studio look of the last five years.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="mesh" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="5"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">3 · Point + decay trace</h2>
    <p class="bake__note">The marks are almost invisible; the picture is the fading record of where they've been. A single frame can't hold a history, so the SVG fallback would be a genuinely different artefact.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="trace" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="6"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">4 · Point + field ring <span class="bake__out">— you ruled this out</span></h2>
    <p class="bake__note">Kept only as a record. Rings of influence darkening where they overlap; the expressive range is narrow and most rules end up as ripples.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="rings" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="7"></p>
  </section>

</div>

## The other tone, and a smaller size

Round two only, locally inverted at figure-in-a-column width. The canvases read
their colour from the tokens on the nearest ancestor, so this is genuinely the
other palette — not a filter. Toggle the site theme and this row flips with it,
staying opposite.

<div class="bake bake--small bake--invert">
  <section class="bake__panel">
    <h2 class="bake__name">Glyph</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="glyph" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Halftone</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="halftone" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Plotter</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="plotter" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Ticks</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="ticks" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
</div>

## What each one would cost to ship

Renderer source measured from the live function; engine and rule measured from
the served files. Gzip is what actually travels. The engine and rule are shared
by every candidate — only the renderer row changes with your choice.

<div id="sizes" class="bake__sizes">measuring…</div>

<style>
.bake { display: grid; gap: var(--section); margin: var(--section) 0; }
.bake__name { font-size: var(--text-sm); text-transform: uppercase;
  letter-spacing: var(--tracking-caps); margin: 0 0 .5rem; }
.bake__out { color: var(--ink-muted); text-transform: none; letter-spacing: 0; }
.bake__note { font-size: var(--text-sm); color: var(--ink-muted);
  max-width: 60ch; margin: 0 0 1rem; }
.bake .illo { position: relative; margin: 0; height: 280px;
  border: 1px solid var(--rule); background: var(--paper); }
.bake .illo__canvas { display: block; touch-action: none; }
.bake__stat { font-size: var(--text-xs); color: var(--ink-muted);
  margin: .5rem 0 0; font-variant-numeric: tabular-nums; }
.bake--small { grid-template-columns: repeat(2, 1fr); gap: var(--gap); }
.bake--small .illo { height: 150px; }
.bake--invert { padding: var(--gap); background: var(--paper); }
:root .bake--invert { --paper: #161616; --ink: #d9d9d9; --ink-muted: #8f8f8f;
  --accent: #ef4444; --rule: #2b2b2b; }
:root[data-theme="dark"] .bake--invert { --paper: #ffffff; --ink: #000000;
  --ink-muted: #6e6e6e; --accent: #d62828; --rule: #e4e4e4; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .bake--invert { --paper: #ffffff;
    --ink: #000000; --ink-muted: #6e6e6e; --accent: #d62828; --rule: #e4e4e4; }
}
.bake--invert .bake__name { color: var(--ink); }
.bake__sizes table { width: 100%; font-size: var(--text-sm);
  font-variant-numeric: tabular-nums; border-collapse: collapse; }
.bake__sizes th, .bake__sizes td { text-align: right; padding: .35rem .5rem;
  border-bottom: 1px solid var(--rule); }
.bake__sizes th:first-child, .bake__sizes td:first-child { text-align: left; }
.bake__sizes tr.is-shared td { color: var(--ink-muted); }
</style>

<script>
// Bake-off readout only. Never ships.
(function () {
  var out = document.querySelectorAll("[data-stat]");
  setInterval(function () {
    if (!window.Illo) return;
    out.forEach(function (el) {
      var inst = Illo.instances[+el.getAttribute("data-stat")];
      if (!inst) return;
      var seated = 0, hard = 0;
      for (var i = 0; i < inst.sim.n; i++) {
        if (inst.sim.hard[i]) { hard++; if (inst.sim.landed[i]) seated++; }
      }
      el.textContent = inst.sim.n + " points · " +
        inst.frameCost.toFixed(2) + " ms/frame · " +
        (inst.running ? "running" : "at rest — 0 ms") + " · " +
        seated + "/" + hard + " seated by attention";
    });
  }, 250);

  // ---- Byte cost. Gzip via CompressionStream, which is baseline in every
  // browser we target, so no library and no build step to measure this.
  async function gz(str) {
    var cs = new CompressionStream("gzip");
    var w = cs.writable.getWriter();
    w.write(new TextEncoder().encode(str)); w.close();
    var buf = await new Response(cs.readable).arrayBuffer();
    return buf.byteLength;
  }
  function kb(n) { return (n / 1024).toFixed(2) + " KB"; }

  // This inline script parses before the deferred engine loads, so the size
  // pass has to wait for DOMContentLoaded or window.Illo isn't there yet.
  window.addEventListener("DOMContentLoaded", async function () {
    if (!window.Illo || !window.CompressionStream) return;
    var names = ["glyph","halftone","plotter","ticks","grid","mesh","trace","rings"];
    var rows = [];
    for (var i = 0; i < names.length; i++) {
      var src = Illo._src(names[i]);
      rows.push({ label: names[i], raw: new Blob([src]).size, gzip: await gz(src), shared: false });
    }
    var files = [
      ["illo-core.js (engine, shared)", "{{ '/assets/js/illo-core.js' | relative_url }}"],
      ["intention-rendering.js (rule, per post)", "{{ '/assets/js/illustrations/intention-rendering.js' | relative_url }}"]
    ];
    for (var f = 0; f < files.length; f++) {
      var text = await fetch(files[f][1]).then(function (r) { return r.text(); });
      rows.push({ label: files[f][0], raw: new Blob([text]).size, gzip: await gz(text), shared: true });
    }
    var html = "<table><thead><tr><th>Component</th><th>Raw</th><th>Gzipped</th></tr></thead><tbody>";
    rows.forEach(function (r) {
      html += "<tr" + (r.shared ? " class='is-shared'" : "") + "><td>" + r.label +
        "</td><td>" + kb(r.raw) + "</td><td>" + kb(r.gzip) + "</td></tr>";
    });
    html += "</tbody></table><p class='bake__stat'>Renderer sizes are unminified source read from the live function, so treat them as an upper bound — the shipped file keeps one renderer, not eight.</p>";
    document.getElementById("sizes").innerHTML = html;
  });
})();
</script>
