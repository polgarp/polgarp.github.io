---
title: "Illustration engine — style × verb"
sitemap: false
---

Three dials now, chosen independently: **object** (what's on the grid),
**verb** (what the cursor does), **style** (how a mark is drawn). You were torn
between grid marks and glyphs partly because I'd welded style to behaviour —
the glyph field evolved and the rect field didn't, but that was an accident of
how I wrote them. Now the contrasty rectangle can wear the evolving verb.

**Accent doctrine, applied throughout:** red means *persistent state you
caused*. Verbs that leave a trace use it; verbs that only reflect where the
cursor is use none at all. The presence of red now tells you whether a picture
remembers you.

## Four mark styles, one verb

Same object, same verb (`order`), four styles. This is the contrast question.

<div class="bake bake--quad">
  <section class="bake__panel">
    <h3 class="bake__name">Mark — filled rects</h3>
    <p class="bake__note">Strongest, most contrasty, rhymes with the site's existing rectangles. No text rendering, so also the cheapest.</p>
    <figure class="illo" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="7" data-illo-shape="rect"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Glyph — one weight</h3>
    <p class="bake__note">Evolves as it resolves, but the ramp is line art so its darkest step is far lighter than a filled cell. Your contrast complaint, isolated.</p>
    <figure class="illo" data-illo="field" data-illo-render="order" data-illo-style="glyph" data-illo-seed="7" data-illo-shape="rect"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Weighted — glyph + weight</h3>
    <p class="bake__note">Your suggestion. Ramping font weight 400 → 600 → 700 alongside the character roughly doubles the tonal range. It breaks no rule: a monospace face keeps its advance across weights, so the grid holds.</p>
    <figure class="illo" data-illo="field" data-illo-render="order" data-illo-style="weighted" data-illo-seed="7" data-illo-shape="rect"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Hybrid — glyph then rect</h3>
    <p class="bake__note">Glyphs for the light half of the ramp, filled cells for the dark half. Delicate evolving texture where the image is unresolved, full rectangle contrast where it is.</p>
    <figure class="illo" data-illo="field" data-illo-render="order" data-illo-style="hybrid" data-illo-seed="7" data-illo-shape="rect"></figure>
  </section>
</div>

## Abstract objects

You were right that person/book/computer read as smudges. These are the
vocabulary instead — shapes that survive being made of cells, and that carry a
verb rather than depicting a thing. No labels: a caption does that job, as alt
text, exactly like a figure insert.

<div class="bake bake--quad">
  <section class="bake__panel">
    <h3 class="bake__name">Frame</h3>
    <figure class="illo illo--sm" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="3" data-illo-shape="frame"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Split</h3>
    <figure class="illo illo--sm" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="4" data-illo-shape="split"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Columns</h3>
    <figure class="illo illo--sm" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="5" data-illo-shape="columns"></figure>
  </section>
  <section class="bake__panel">
    <h3 class="bake__name">Disc</h3>
    <figure class="illo illo--sm" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="6" data-illo-shape="disc"></figure>
  </section>
</div>

## The verbs, reworked

<div class="bake">

  <section class="bake__panel">
    <h3 class="bake__name">Order <span class="bake__verb">was "resolve" · persistent · red</span></h3>
    <p class="bake__note"><strong>Fixed:</strong> the empty circle was a shove I added last round when you asked for more cursor impact — settled marks repelled, carving a void exactly where you were looking. Gone. Now it starts genuinely chaotic and the cursor <em>orders</em> what it passes over, permanently. The picture is built by where you looked.</p>
    <figure class="illo" data-illo="field" data-illo-render="order" data-illo-style="mark" data-illo-seed="7" data-illo-shape="rect"></figure>
    <p class="bake__stat" data-stat="8"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Focus <span class="bake__verb">nothing persists · no red</span></h3>
    <p class="bake__note"><strong>Fixed:</strong> same void, same cause. Nothing moves now at all — away from the cursor the tone comes from noise, near it every mark reads true. No accent, deliberately: this verb leaves nothing behind, and the absence of red says so.</p>
    <figure class="illo" data-illo="field" data-illo-render="focus2" data-illo-style="hybrid" data-illo-seed="7" data-illo-settled="1" data-illo-shape="split"></figure>
    <p class="bake__stat" data-stat="9"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Light <span class="bake__verb">global · no red</span></h3>
    <p class="bake__note">You liked this one, so the only change is that it now draws through the style layer — here on the contrasty rect mark, which it couldn't wear before.</p>
    <figure class="illo" data-illo="field" data-illo-render="light2" data-illo-style="mark" data-illo-seed="7" data-illo-settled="1" data-illo-shape="disc"></figure>
    <p class="bake__stat" data-stat="10"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Depth <span class="bake__verb">global · no red</span></h3>
    <p class="bake__note"><strong>Reworked</strong> per your note: five planes instead of three, a wider throw, tone tied to plane so near reads heavy and far reads faint — and on a simple object rather than a word, which is where it fell apart before.</p>
    <figure class="illo" data-illo="field" data-illo-render="depth2" data-illo-style="mark" data-illo-seed="7" data-illo-settled="1" data-illo-shape="columns"></figure>
    <p class="bake__stat" data-stat="11"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Ignite <span class="bake__verb">persistent · red</span></h3>
    <p class="bake__note">Your favourite for accent use, and the doctrine above is really just this verb's logic generalised. Strengthened spread and slower cooling.</p>
    <figure class="illo" data-illo="field" data-illo-render="ignite2" data-illo-style="mark" data-illo-seed="7" data-illo-settled="1" data-illo-shape="rect"></figure>
    <p class="bake__stat" data-stat="12"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Sift <span class="bake__verb">new · persistent · red</span></h3>
    <p class="bake__note">The cursor removes the easy marks and what survives is <em>heavier</em>. Take work away and the remainder gets denser, not lighter. Built for the automation-trap argument below.</p>
    <figure class="illo" data-illo="field" data-illo-render="sift" data-illo-style="mark" data-illo-seed="7" data-illo-settled="1" data-illo-shape="band"></figure>
    <p class="bake__stat" data-stat="13"></p>
  </section>

  <section class="bake__panel">
    <h3 class="bake__name">Pace <span class="bake__verb">new · persistent · red</span></h3>
    <p class="bake__note">Slowness deepens, speed degrades. Move carefully and marks gain; sweep and they thin. The only verb that responds to <em>how</em> you move rather than where — it uses the pointer velocity the engine already tracks.</p>
    <figure class="illo" data-illo="field" data-illo-render="pace" data-illo-style="weighted" data-illo-seed="7" data-illo-settled="1" data-illo-shape="frame"></figure>
    <p class="bake__stat" data-stat="14"></p>
  </section>

</div>

<style>
.bake { display: grid; gap: var(--section); margin: var(--section) 0; }
.bake__name { font-size: var(--text-sm); text-transform: uppercase;
  letter-spacing: var(--tracking-caps); margin: 0 0 .5rem; }
.bake__verb { color: var(--ink-muted); text-transform: none;
  letter-spacing: 0; font-weight: 400; }
.bake__note { font-size: var(--text-sm); color: var(--ink-muted);
  max-width: 62ch; margin: 0 0 1rem; }
.bake .illo { position: relative; margin: 0; height: 280px;
  border: 1px solid var(--rule); background: var(--paper); }
.bake .illo--sm { height: 170px; }
.bake .illo__canvas { display: block; }
.bake__stat { font-size: var(--text-xs); color: var(--ink-muted);
  margin: .5rem 0 0; font-variant-numeric: tabular-nums; }
.bake--quad { grid-template-columns: repeat(2, 1fr); gap: var(--gap); }
.bake--quad .illo { height: 200px; }
</style>

<script>
(function () {
  var out = document.querySelectorAll("[data-stat]");
  setInterval(function () {
    if (!window.Illo) return;
    out.forEach(function (el) {
      var inst = Illo.instances[+el.getAttribute("data-stat")];
      if (!inst) return;
      el.textContent = inst.sim.n + " points · " + inst.frameCost.toFixed(2) +
        " ms/frame · " + (inst.running ? "running" : "at rest — 0 ms");
    });
  }, 250);
})();
</script>
