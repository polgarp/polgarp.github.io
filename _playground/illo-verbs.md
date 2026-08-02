---
title: "Illustration engine — cursor verbs"
sitemap: false
---

One visual family — grid-bound monospace glyphs, the direction you picked. The
variable here is **what the cursor does**, because the open question isn't how
this looks, it's whether "move the mouse and the picture comes right" is one
idea or a family of them.

Five verbs below, in rough order of how far they reach. **Move your cursor
anywhere on this page**, including outside the figures — the engine now tracks
the pointer at window level, so nothing waits to be hovered.

<div class="bake">

  <section class="bake__panel">
    <h2 class="bake__name">A · Resolve <span class="bake__verb">local · moves matter</span></h2>
    <p class="bake__note">Round two's verb, kept for comparison. Attention lets an unfinished mark reach where it belongs, and it locks there. The one you said feels like a flashlight.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="glyph" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="0"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">B · Focus <span class="bake__verb">local · moves nothing</span></h2>
    <p class="bake__note">Your blur idea. Nothing moves at all — away from the cursor each glyph is drawn from noise instead of from truth, so the image is present but won't resolve. The reading flips: the picture was always finished, you just weren't looking. Compare directly against A; they feel related and argue opposite things.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="focus" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="1"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">C · Light <span class="bake__verb">global</span></h2>
    <p class="bake__note">The cursor is a light source, not a torch beam. Every mark shades by how much it faces you, so moving anywhere re-lights the <em>whole</em> image at once. This is the verb that answers your range question most directly — the illustration responds as one surface rather than as a set of neighbourhoods.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="light" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="2"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">D · Depth <span class="bake__verb">global · parallax</span></h2>
    <p class="bake__note">Your 3D question, kept flat. Three planes offset against each other by where the cursor sits. Deliberately tiny — about two cells at the extreme. Enough to feel like looking <em>around</em> the image rather than at it, without pretending to be dimensional.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="depth" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="3"></p>
  </section>

  <section class="bake__panel">
    <h2 class="bake__name">E · Ignite <span class="bake__verb">persistent · has memory</span></h2>
    <p class="bake__note">Heat where you pass, spreading to neighbours and cooling slowly. The only verb here that <em>remembers</em>: the image records where you've been rather than only reflecting where you are. Note this one keeps running until it has cooled — the engine holds it awake instead of freezing mid-glow.</p>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="ignite" data-illo-seed="7" data-illo-text="INTENTION"></figure>
    <p class="bake__stat" data-stat="4"></p>
  </section>

</div>

## Subjects other than words

You said illustrations need to be a person, a book, a computer — not only text.
These are **vector path data in the rule file**, a few hundred bytes each,
sampled onto the same grid a word is. The engine can't tell the difference, so
anything you can draw as a simple path is a subject.

<div class="bake bake--trio">
  <section class="bake__panel">
    <h2 class="bake__name">Person</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="glyph" data-illo-seed="2" data-illo-shape="person"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Book</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="light" data-illo-seed="4" data-illo-shape="book"></figure>
  </section>
  <section class="bake__panel">
    <h2 class="bake__name">Computer</h2>
    <figure class="illo" data-illo="intention-rendering" data-illo-render="focus" data-illo-seed="6" data-illo-shape="computer"></figure>
  </section>
</div>

## One-word labels

For comparisons. Real DOM text in monospace caps — selectable, screen-readable,
and styled from the tokens, so it sits *with* the illustration rather than being
drawn into it. Nothing is baked into the canvas.

<div class="bake bake--pair">
  <section class="bake__panel">
    <figure class="illo illo--labelled" data-illo="intention-rendering" data-illo-render="light" data-illo-seed="11" data-illo-shape="person">
      <figcaption class="illo__label">Intention</figcaption>
    </figure>
  </section>
  <section class="bake__panel">
    <figure class="illo illo--labelled" data-illo="intention-rendering" data-illo-render="light" data-illo-seed="12" data-illo-shape="computer">
      <figcaption class="illo__label">Rendering</figcaption>
    </figure>
  </section>
</div>

## As a background

Proof that the same engine runs behind text. Contrast is suppressed hard and
the canvas is inert to the mouse, so the words stay the thing you're reading —
but move the cursor and the field is alive underneath.

<div class="illo-bg-demo">
  <figure class="illo illo--bg" data-illo="intention-rendering" data-illo-render="light" data-illo-seed="21" data-illo-text="CLARITY" aria-hidden="true"></figure>
  <div class="illo-bg-demo__text">
    <p>Product design boils down to two main activities: creating a shared intention and rendering the intention. As AI tools get better at rendering, there will always be parts where someone needs to craft things by hand.</p>
    <p>The Pareto principle applies: eighty per cent of the experience gets done much faster, but the remaining twenty will need a systematic design effort. That's precisely where clarity of intention matters most.</p>
  </div>
</div>

<style>
.bake { display: grid; gap: var(--section); margin: var(--section) 0; }
.bake__name { font-size: var(--text-sm); text-transform: uppercase;
  letter-spacing: var(--tracking-caps); margin: 0 0 .5rem; }
.bake__verb { color: var(--ink-muted); text-transform: none;
  letter-spacing: 0; font-weight: 400; }
.bake__note { font-size: var(--text-sm); color: var(--ink-muted);
  max-width: 60ch; margin: 0 0 1rem; }
.bake .illo { position: relative; margin: 0; height: 280px;
  border: 1px solid var(--rule); background: var(--paper); }
.bake .illo__canvas { display: block; }
.bake__stat { font-size: var(--text-xs); color: var(--ink-muted);
  margin: .5rem 0 0; font-variant-numeric: tabular-nums; }
.bake--trio { grid-template-columns: repeat(3, 1fr); gap: var(--gap); }
.bake--trio .illo { height: 200px; }
.bake--pair { grid-template-columns: repeat(2, 1fr); gap: var(--gap); }
.bake--pair .illo { height: 220px; }

.illo__label { font-family: var(--font-mono); font-size: var(--text-xs);
  text-transform: uppercase; letter-spacing: var(--tracking-caps);
  color: var(--ink-muted); position: absolute; left: 0; bottom: -1.6rem; }
.illo--labelled { overflow: visible; margin-bottom: 2rem !important; }

.illo-bg-demo { position: relative; margin: var(--section) 0;
  padding: var(--gap) 0; }
.illo-bg-demo .illo--bg { position: absolute; inset: 0; height: auto;
  border: 0; background: none; pointer-events: none; opacity: .16; }
.illo-bg-demo__text { position: relative; }
.illo-bg-demo__text p { max-width: 60ch; }
</style>

<script>
(function () {
  var out = document.querySelectorAll("[data-stat]");
  setInterval(function () {
    if (!window.Illo) return;
    out.forEach(function (el) {
      var inst = Illo.instances[+el.getAttribute("data-stat")];
      if (!inst) return;
      el.textContent = inst.sim.n + " points · " +
        inst.frameCost.toFixed(2) + " ms/frame · " +
        (inst.running ? "running" : "at rest — 0 ms");
    });
  }, 250);
})();
</script>
