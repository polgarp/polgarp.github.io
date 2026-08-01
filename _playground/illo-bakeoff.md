---
title: "Illustration engine — bake-off"
sitemap: false
---

Four candidate vocabularies for the signature look, all drawing the **identical
simulation**, so the only variable is the marks. Rule is
`intention-rendering`: points converge on a form, ~80% seat themselves, the
remaining 20% come to rest a few pixels off and **only the cursor can seat
them**. A seated mark turns accent red — so the red is exactly the share of the
work a hand had to do.

Sweep the cursor across each one. Then reload and look at it *without*
touching it, and notice how finished it looks.

<div class="bake">

  <section class="bake__panel">
    <h2 class="bake__name">1 · Grid-bound marks</h2>
    <p class="bake__note">Marks snap to the cell grid, so an unseated point isn't blurry — it's <em>one cell wrong</em>. In a grid system that's a legible mistake rather than a smudge. Two batched <code>fill()</code> calls, no neighbour queries: the cheapest of the four.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="grid" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="0"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">2 · Point + link mesh</h2>
    <p class="bake__note">Dots plus a hairline under a distance threshold. Most expressive per rule, and the closest to the Thinkable reference — but also the most-copied studio look of the last five years. Uses a spatial hash; still draws O(n·k) segments per frame.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="mesh" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="1"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">3 · Point + decay trace</h2>
    <p class="bake__note">The marks are almost invisible; the picture is the fading record of where they've been. Note what this does to the static fallback — a single frame can't hold a history, so the SVG would be a genuinely different artefact.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="trace" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="2"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">4 · Point + field ring</h2>
    <p class="bake__note">Each point draws a faint ring of influence; overlaps darken. You read the forces rather than the objects. Quiet and unusual, but the expressive range is narrow — most rules will end up looking like ripples.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="rings" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="3"></p>
  </section>

</div>

## The other tone, and a smaller size

Same four, locally inverted and at figure-in-a-column width. The canvases read
their colour from the tokens on the nearest ancestor, so this panel is genuinely
running the other palette — not a filter. Toggle the site theme too: this row
flips with it, staying opposite.

<div class="bake bake--small bake--invert">
  <section class="bake__panel">
    <h2 class="bake__name">Grid</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="grid" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Mesh</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="mesh" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Trace</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="trace" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Rings</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="rings" data-illo-seed="3" data-illo-text="AI"></figure>
  </section>
</div>

<style>
.bake { display: grid; gap: var(--section); margin: var(--section) 0; }
.bake__name { font-size: var(--text-sm); text-transform: uppercase;
  letter-spacing: var(--tracking-caps); margin: 0 0 .5rem; }
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
        seated + "/" + hard + " seated by hand";
    });
  }, 250);
})();
</script>
