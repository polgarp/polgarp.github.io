# Illustration Configuration Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the illustration engine common and each illustration's setup — including its character size — wholly its own, so work on one illustration cannot change another.

**Architecture:** One precedence rule (`attribute > scoped CSS > engine default`) implemented in a single pure module, `assets/js/illustration/config.js`. Each illustration becomes a named profile in `_data/illustrations.yml`; the include emits its style keys as `data-illo-*` attributes; the engine collects them generically and never enumerates the style parameters it supports. Resolved config is attached to `sim.opts` so rules and renderers both reach it.

**Tech Stack:** Jekyll (Liquid, Sass), vanilla ES5 browser JS, Node 22 built-in `node:test`. No new runtime or build dependencies.

**Spec:** `docs/superpowers/specs/2026-09-02-illustration-config-architecture-design.md`

## Global Constraints

- **Precedence, exactly:** `attribute > scoped CSS > engine default`. Nothing outside `config.js` reads configuration.
- **Sentinel convention:** a registered custom property's `initial-value` is always `0` / `0px`, never a real value. **A resolved CSS value of `0` means "unset".** No style parameter has a legitimate zero (`base: 0` would violate "legible at rest").
- **Scoped means scoped.** No engine-readable `--illo-*` property may be defined on `:root`. A property on `:root` inherits to every element and reproduces the original defect under a new name. The only `--illo-*` tokens allowed on `:root` are the colours `--illo-ink` and `--illo-accent`, which `readTokens` reads and `config.js` never sees.
- **Naming transform**, applied mechanically, no lookup table:
  `mark_scale` (YAML profile) → `data-illo-mark-scale` (DOM) → `markScale` (JS opts) → `--illo-mark-scale` (CSS).
- **Browser JS is ES5** — `var`, no arrow functions, no `const`/`let`, no template literals. Match the surrounding files. Node scripts and tests may use modern syntax.
- **Doctrine held** (commit `6788201`): weighted monospace glyphs; legible at rest; accent scarce (~18%); state refreshes. `ACCENT_SHARE`, `REVERT`, `HOLD`, `K`, `DAMP`, `JITTER`, `RAMP` stay engine-owned and are **not** per-illustration parameters.
- **`density` is replaced by numeric `cell`.** The named steps `light`/`lighter`/`lightest` (11/14/20) are removed.
- **Every task is behaviour-neutral except Task 2**, which restores the two posts. If a browser check moves any illustration other than as stated, stop.
- Commit after every task.

---

## File Structure

| File | Responsibility |
|---|---|
| `assets/js/illustration/config.js` | **new.** The precedence rule and naming transform. Pure: takes an attribute map and a CSS lookup function, returns resolved opts. No DOM access, so it is testable in plain Node. |
| `test/config.test.cjs` | **new.** Unit tests for the precedence rule. |
| `scripts/check-illustrations.mjs` | **new.** Three structural assertions over the built site: sentinel `initial-value`s, no engine-readable property on `:root`, and every figure declaring its own pitch. |
| `_data/illustrations.yml` | **new.** One profile per illustration — the durable record of what each one is. |
| `_includes/illustration` | Profile lookup by `name`; emits style keys as attributes. |
| `assets/js/illustration/core.js` | Builds the attribute map and CSS lookup from the DOM, calls `config.js`, attaches `sim.opts`. |
| `assets/js/illustration/field.js` | Reads resolved opts; module constants become defaults only. |
| `assets/js/illustration/marks.js` | Reads `markScale` from `sim.opts`. |
| `_sass/_tokens.scss` | Sentinel `initial-value`s; documents the convention; no longer defines `--illo-cell`. |
| `_sass/_components.scss` | `.illo--bg` owns `--illo-cell` and keeps only viewport-responsive values. |
| `_layouts/home.html`, two post files | Call sites become `name=` plus content. |
| `_config.yml`, `_layouts/default.html` | Drop `illo_tune`; load `config.js`. |
| `assets/js/illustration/tune.js` | Deleted. |

---

### Task 1: The precedence rule as a pure, tested module

**Files:**
- Create: `assets/js/illustration/config.js`
- Test: `test/config.test.cjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `Illo.config.resolve(attrs, cssLookup, cssReadable)` → plain object of resolved opts.
  - `attrs`: `{ "data-illo-cell": "8", ... }` — raw attribute name → string value.
  - `cssLookup`: `function(propertyName) -> string`, e.g. `"--illo-cell"` → `"20px"`.
  - `cssReadable`: array of camelCase keys the engine may fall back to CSS for.
  - Returns: `{ cell: 8, markScale: 0.7, ... }`. Numeric strings become numbers; everything else stays a string.
  - Also exports `Illo.config.RESERVED` — attribute suffixes read as structure, not style.

- [ ] **Step 1: Write the failing test**

Create `test/config.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert");
const config = require("../assets/js/illustration/config.js");

const CSS_READABLE = ["cell", "base", "arrive", "markScale", "fadeTop", "fadeBottom"];
const noCss = () => "";

test("attribute wins over CSS", () => {
  const opts = config.resolve({ "data-illo-cell": "8" }, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 8);
});

test("CSS is used when the attribute is absent", () => {
  const opts = config.resolve({}, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 20);
});

test("a CSS value of zero means unset, not zero", () => {
  // The regression: @property --illo-density had initial-value 20px, so an
  // unset property resolved to a real number and overrode every attribute.
  const opts = config.resolve({}, () => "0px", CSS_READABLE);
  assert.strictEqual(opts.cell, undefined);
});

test("an unparseable CSS value is ignored, not taken literally", () => {
  // Where @property is unsupported the raw calc() string arrives instead.
  const opts = config.resolve({}, () => "calc(1rem * 0.285)", CSS_READABLE);
  assert.strictEqual(opts.cell, undefined);
});

test("kebab attributes become camelCase keys", () => {
  const opts = config.resolve({ "data-illo-mark-scale": "0.7" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.markScale, 0.7);
});

test("camelCase keys are looked up as kebab custom properties", () => {
  const seen = [];
  config.resolve({}, (name) => { seen.push(name); return ""; }, ["markScale"]);
  assert.ok(seen.includes("--illo-mark-scale"));
});

test("structural attributes are not style options", () => {
  const opts = config.resolve(
    { "data-illo-path": "M0 0 H10", "data-illo-seed": "4", "data-illo-render": "sift" },
    noCss, CSS_READABLE
  );
  assert.strictEqual(opts.path, undefined);
  assert.strictEqual(opts.seed, undefined);
  assert.strictEqual(opts.render, undefined);
});

test("unknown parameters pass through without an engine change", () => {
  const opts = config.resolve({ "data-illo-future-knob": "3" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.futureKnob, 3);
});

test("non-numeric attribute values stay strings", () => {
  const opts = config.resolve({ "data-illo-mood": "brisk" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.mood, "brisk");
});

test("CSS is only consulted for declared readable keys", () => {
  const opts = config.resolve({}, () => "5", ["cell"]);
  assert.strictEqual(opts.cell, 5);
  assert.strictEqual(opts.base, undefined);
});

test("an empty attribute does not shadow CSS", () => {
  // The include emits nothing for an absent profile key; if it ever emits an
  // empty string, that must still mean "ask the stylesheet".
  const opts = config.resolve({ "data-illo-cell": "" }, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 20);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/*.test.cjs`
Expected: FAIL — `Cannot find module '../assets/js/illustration/config.js'`

- [ ] **Step 3: Write minimal implementation**

Create `assets/js/illustration/config.js`:

```js
// The precedence rule, and nothing else.
//
//   attribute  >  scoped CSS  >  engine default
//
// An illustration states its own setup in `data-illo-*` attributes, emitted by
// _includes/illustration from its profile in _data/illustrations.yml. CSS is a
// fallback for values that must answer the viewport, and is consulted ONLY for
// keys the illustration left unset.
//
// This module is pure — it takes an attribute map and a lookup function, never
// the DOM — so the rule can be tested without a browser. core.js supplies both.
//
// WHY THE ZERO SENTINEL: a custom property registered with @property resolves
// on every element in the document, whether or not any rule sets it. There is
// no "absent" to detect. So an unset property must resolve to a value this
// module rejects, and 0 is that value: no style parameter has a legitimate
// zero. Registering a property with a real initial-value silently makes the
// CSS fallback unconditional and overrides every illustration's own setup —
// which is what f716aa1 did, resizing two posts' glyphs from 11px and 15px to
// 27px. The same goes for defining an engine-readable property on :root, which
// inherits everywhere. Both are enforced by scripts/check-illustrations.mjs.
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.Illo = root.Illo || {}).config = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var PREFIX = "data-illo-";

  // Read as structure by the Instance itself, never passed through as style.
  var RESERVED = ["render", "path", "fit", "seed"];

  function camel(kebab) {
    return kebab.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  function kebab(camelName) {
    return camelName.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
  }

  // A usable number, or undefined. Rejects NaN (an unparseable calc() string
  // where @property is unsupported) and 0 (the unset sentinel).
  function num(raw) {
    var n = parseFloat(raw);
    if (!isFinite(n) || n === 0) return undefined;
    return n;
  }

  function resolve(attrs, cssLookup, cssReadable) {
    var opts = {};
    var name, suffix, value, n, i;

    for (name in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, name)) continue;
      if (name.indexOf(PREFIX) !== 0) continue;
      suffix = name.slice(PREFIX.length);
      if (RESERVED.indexOf(suffix) !== -1) continue;
      value = attrs[name];
      if (value === "" || value == null) continue;
      // A numeric string becomes a number; anything else stays as written, so
      // a future parameter can be a keyword without an engine change.
      n = parseFloat(value);
      opts[camel(suffix)] = (isFinite(n) && String(n) === String(value).trim())
        ? n : value;
    }

    for (i = 0; i < cssReadable.length; i++) {
      if (opts[cssReadable[i]] !== undefined) continue;   // the illustration spoke
      n = num(cssLookup("--illo-" + kebab(cssReadable[i])));
      if (n !== undefined) opts[cssReadable[i]] = n;
    }

    return opts;
  }

  return { resolve: resolve, RESERVED: RESERVED };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/*.test.cjs`
Expected: PASS, 11/11.

- [ ] **Step 5: Commit**

```bash
git add assets/js/illustration/config.js test/config.test.cjs
git commit -m "Illustration config: one precedence rule, in one testable module"
```

---

### Task 2: Sentinel initial-values, and the check that enforces them

This task restores the two posts. Everything after it is refactoring under a green check.

**Files:**
- Modify: `_sass/_tokens.scss:15-40`
- Create: `scripts/check-illustrations.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `node scripts/check-illustrations.mjs` — exits non-zero with a readable message. Reads `_site/`, so a Jekyll build must precede it.

- [ ] **Step 1: Write the failing check**

Create `scripts/check-illustrations.mjs`:

```js
#!/usr/bin/env node
// Guards the three structural invariants that keep one illustration from
// changing another. Run after `bundle exec jekyll build`:
//
//   node scripts/check-illustrations.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS = "_site/assets/css/main.css";
const SITE = "_site";
const failures = [];

const css = readFileSync(CSS, "utf8");
const rules = css.replace(/\n/g, "").split("}");

// ---- 1. Every registered custom property uses a sentinel initial-value.
//
// A registered property resolves on EVERY element in the document, so a real
// initial-value makes the engine's CSS fallback unconditional and overrides
// each illustration's own setup. Zero is the only value config.js rejects.
let registered = 0;
for (const [, name, body] of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
  registered++;
  const initial = /initial-value:\s*([^;]+)/.exec(body)?.[1].trim();
  if (initial === undefined) {
    failures.push(`${name}: no initial-value; @property needs one for a non-universal syntax`);
  } else if (parseFloat(initial) !== 0) {
    failures.push(
      `${name}: initial-value is "${initial}", must be a zero sentinel.\n` +
      `    A registered property resolves on every element, so a non-zero initial\n` +
      `    value silently overrides every illustration's own setup.`
    );
  }
}
if (registered === 0) failures.push(`no @property blocks found in ${CSS} — did the build run?`);

// ---- 2. No engine-readable property is defined on :root.
//
// :root inherits to every element, which is the same defect wearing a
// different name. Only the colour tokens readTokens() consumes may live there.
const COLOUR_TOKENS = ["--illo-ink", "--illo-accent"];
for (const rule of rules) {
  const [selector, body] = rule.split("{");
  if (!selector || !body) continue;
  if (!/(^|,)\s*:root\s*$/.test(selector.trim())) continue;
  for (const [, prop] of body.matchAll(/(--illo-[\w-]+)\s*:/g)) {
    if (!COLOUR_TOKENS.includes(prop)) {
      failures.push(
        `${prop} is defined on :root, so it inherits to every element.\n` +
        `    Move it to the selector of the illustration that needs it.`
      );
    }
  }
}

// ---- 3. Every figure declares its own pitch.
//
// An illustration relying on an implicit default is one another illustration's
// stylesheet can reach. The background layer is exempt: its pitch is derived
// from type metrics in .illo--bg on purpose.
function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (entry.endsWith(".html")) yield path;
  }
}

let figures = 0;
for (const file of htmlFiles(SITE)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("data-illo=")) continue;
  for (const [tag] of html.matchAll(/<(?:figure|div)[^>]*data-illo=[^>]*>/g)) {
    figures++;
    if (tag.includes("illo--bg")) continue;
    if (!/data-illo-cell="[^"]+"/.test(tag)) {
      failures.push(`${file}: a figure declares no data-illo-cell, so its pitch is an implicit default`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} illustration config violation(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ ${registered} registered properties use sentinels; :root is clean; ${figures} figures declare their own setup`);
```

- [ ] **Step 2: Run it to verify it fails**

```bash
bundle exec jekyll build --quiet
node scripts/check-illustrations.mjs
```

Expected: FAIL, exit 1, reporting `--illo-cell` (`20px`) and `--illo-density` (`20px`) as non-sentinel, `--illo-cell` on `:root`, and both post figures lacking `data-illo-cell`. Checks 2 and 3 are fixed in Task 4; this task fixes check 1.

- [ ] **Step 3: Fix the sentinels**

In `_sass/_tokens.scss`, replace the comment above the `@property` blocks (lines 13-14) with:

```scss
// Registered so the engine can read a length the stylesheet computes — a grid
// pitch that answers fluid type, a fade distance that answers a breakpoint.
//
// THE INITIAL VALUE IS ALWAYS A ZERO SENTINEL, NEVER A REAL VALUE.
//
// A registered custom property resolves on EVERY element in the document,
// whether or not any rule sets it, so there is no "absent" for the engine to
// detect. Zero is the value config.js rejects, and so is the only way to say
// "nothing set this — use the illustration's own attribute". A real initial
// value here makes the CSS fallback unconditional and silently overrides every
// illustration's setup: that is what f716aa1 did, resizing two posts' glyphs
// from 11px and 15px to 27px. Enforced by scripts/check-illustrations.mjs.
```

Set `initial-value: 0px` on all four registered properties: `--illo-cell`,
`--illo-char-fade-top`, `--illo-char-fade-bottom`, `--illo-density`.

Leave everything else — including `--illo-cell` on `:root` and the
`--illo-density` block — in place for now. Task 4 removes them as part of the
rename, so that this task changes behaviour in exactly one way.

- [ ] **Step 4: Verify check 1 passes and the posts are restored**

```bash
bundle exec jekyll build --quiet && node scripts/check-illustrations.mjs
```
Expected: still exit 1, but **no remaining `initial-value` failures** — only the `:root` and `data-illo-cell` ones, which Task 4 fixes.

Now confirm the glyph sizes in a browser. Serve `_site` and, for each post, record `ctx.font` by patching `fillText` before page scripts run:

```js
window.__fonts = new Set();
const _ft = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function (...a) {
  window.__fonts.add(this.font); return _ft.apply(this, a);
};
```

Expected: `brain-fry` draws at **11px**, `Deliberate-design-practice` at **15px** — both were 27px. The home background is unchanged: `.illo--bg` still sets `--illo-density: var(--illo-cell)` and `:root` still defines `--illo-cell`.

- [ ] **Step 5: Commit**

```bash
git add _sass/_tokens.scss scripts/check-illustrations.mjs
git commit -m "Registered illustration properties use zero sentinels

A registered custom property resolves on every element, so --illo-density's
20px initial value made the CSS fallback unconditional and overrode both
posts' own pitch — 11px and 15px glyphs became 27px. Zero is the only value
the engine reads as unset. Guarded by scripts/check-illustrations.mjs."
```

---

### Task 3: Engine reads config through the module

Behaviour-neutral plumbing. Parameter names do not change here; Task 4 renames them.

**Files:**
- Modify: `assets/js/illustration/core.js:201-212` (constructor), `:262-305` (the CSS block added in f716aa1)
- Modify: `assets/js/illustration/marks.js:42`
- Modify: `_layouts/default.html` (load `config.js` before `core.js`)

**Interfaces:**
- Consumes: `Illo.config.resolve(attrs, cssLookup, cssReadable)` from Task 1.
- Produces: `sim.opts` — the resolved config, readable by rules **and renderers**.

- [ ] **Step 1: Load config.js before core.js**

In `_layouts/default.html`, immediately above the `core.js` script line, add:

```liquid
  <script src="{{ '/assets/js/illustration/config.js' | relative_url }}" defer></script>
```

`config.js` must come first: `core.js` calls `Illo.config` at rule construction.

- [ ] **Step 2: Declare the CSS-readable list in core.js**

Near the top of the IIFE, beside the other module-level declarations, add:

```js
  // The only place in the engine a style parameter is named. A parameter absent
  // from this list is attribute-only, which is the right default: CSS should be
  // consulted solely for values that must answer the viewport.
  var CSS_READABLE = ["density", "base", "arrive", "markScale",
                      "fadeTop", "fadeBottom", "arriveX", "arriveY"];
```

- [ ] **Step 3: Replace the f716aa1 CSS block**

In `Instance.prototype` where the rule is constructed, delete everything from
`var cs = getComputedStyle(this.el);` through the `arriveX`/`arriveY` block and
the `this.sim.markScale = ...` line, and replace with:

```js
    // Every data-illo-* attribute the include emitted, as written. The engine
    // does NOT enumerate the style parameters it supports: a new one is a key
    // in the profile plus a read in the rule, with nothing to change here.
    var attrs = {}, list = this.el.attributes, i;
    for (i = 0; i < list.length; i++) attrs[list[i].name] = list[i].value;

    // Read at rule construction rather than at mount: resize already re-seeds
    // whenever the box changes, which is exactly when a breakpoint or a fluid
    // size changes what these should be.
    var cs = getComputedStyle(this.el);
    function fromCss(prop) { return cs.getPropertyValue(prop); }

    var opts = Illo.config.resolve(attrs, fromCss, CSS_READABLE);
    opts.path = this.path;
    opts.fit = this.fit;
    opts.seed = this.seed;

    // Renderers get (ctx, sim, ink) and would otherwise have no way to reach
    // configuration. Hanging it on the sim is what lets a verb take a
    // per-illustration parameter without touching the include or this file.
    this.sim.opts = opts;
    this.rule = factory(this.sim, opts);
```

Also delete `this.density = el.getAttribute("data-illo-density") || "";` from the
constructor — `density` now arrives through `opts`.

- [ ] **Step 4: Point marks.js at the resolved config**

In `assets/js/illustration/marks.js:42`, replace:

```js
    var size = Math.round(cell * SIZE_RATIO * (sim.markScale || 1));
```

with:

```js
    var size = Math.round(cell * SIZE_RATIO * ((sim.opts && sim.opts.markScale) || 1));
```

- [ ] **Step 5: Verify nothing moved**

```bash
bundle exec jekyll build --quiet && node --test test/*.test.cjs && node scripts/check-illustrations.mjs
```
Then re-run the browser glyph probe from Task 2 Step 4.
Expected: **11px** and **15px** unchanged; the home background visually identical.

- [ ] **Step 6: Commit**

```bash
git add assets/js/illustration/core.js assets/js/illustration/marks.js _layouts/default.html
git commit -m "Engine resolves config through one module, exposed as sim.opts"
```

---

### Task 4: Illustrations become named profiles, and `density` becomes `cell`

The rename touches the include, the profiles, the engine default and the
stylesheet together because they are one interface; splitting them would leave
the config channel half-renamed.

**Files:**
- Create: `_data/illustrations.yml`
- Modify: `_includes/illustration`, `assets/js/illustration/core.js` (`CSS_READABLE`), `assets/js/illustration/field.js:16-70`, `_sass/_tokens.scss`, `_sass/_components.scss`
- Modify: `_layouts/home.html:38`, `_posts/Blog/2026/2026-03-15-brain-fry-and-the-automation-trap.md:15`, `_posts/Blog/2026/2026-06-15-Deliberate-design-practice.md:19`

**Interfaces:**
- Consumes: the naming transform from Task 1 — profile key `mark_scale` emits as `data-illo-mark-scale`.
- Produces: `{% include illustration name="<profile>" %}`. Inline params override the profile. `alt` and `caption` stay at the call site.

- [ ] **Step 1: Write the profiles**

Create `_data/illustrations.yml`:

```yaml
# One entry per illustration. This is the durable record of what an
# illustration IS: its object, its verb, and the style that makes it look like
# itself. An illustration does not change over time except by a deliberate edit
# here — no other illustration's stylesheet can reach it.
#
# `style:` keys become data-illo-* attributes, snake_case to kebab-case:
#   mark_scale  ->  data-illo-mark-scale  ->  opts.markScale  ->  --illo-mark-scale
#
# A style key that is ABSENT means "ask the stylesheet": the engine falls back
# to the scoped CSS custom property, then to its own default. Absence is how an
# illustration says a value must answer the viewport rather than be fixed here.

brain-fry:
  object: band
  verb: sift
  seed: 4
  height: 11rem
  width: wide
  svg: brain-fry-and-the-automation-trap
  style:
    cell: 8          # the engine default, stated outright rather than inherited

deliberate-practice:
  object: rect
  verb: deepen
  seed: 6
  height: 12rem
  width: wide
  svg: deliberate-design-practice
  style:
    cell: 11

home-bg:
  object: plate
  verb: range
  seed: 7
  background: true
  style:
    # `cell` is deliberately absent. The background's pitch is derived from the
    # hero's own type metrics (--illo-cell in .illo--bg), so the lattice is made
    # of the type it sits behind and follows it as that type goes fluid.
    mark_scale: 0.7
    base: 0.24
    arrive: 1.5
    arrive_x: 0.28
    arrive_y: 0.3
```

- [ ] **Step 2: Teach the include to read a profile**

In `_includes/illustration`, replace the object/shape resolution block (the
`_object` / `_shape` / `_path` / `_fit` / `_id` assignments) with:

```liquid
{%- assign _p = site.data.illustrations[include.name] -%}
{%- assign _background = include.background | default: _p.background -%}
{%- assign _object = include.object | default: _p.object -%}
{%- if _background and _object == nil -%}{%- assign _object = "plate" -%}{%- endif -%}
{%- assign _verb = include.verb | default: _p.verb | default: "order" -%}
{%- assign _seed = include.seed | default: _p.seed | default: 1 -%}
{%- assign _height = include.height | default: _p.height -%}
{%- assign _width = include.width | default: _p.width -%}
{%- assign _svg = include.svg | default: _p.svg -%}
{%- assign _shape = site.data.illo_shapes[_object] -%}
{%- assign _path = _shape.d -%}
{%- assign _fit = include.fit | default: _p.fit | default: _shape.fit | default: "contain" -%}
{%- assign _id = _object | append: "-" | append: _verb | append: "-" | append: _seed -%}
{%- capture _style -%}
{%- for pair in _p.style %} data-illo-{{ pair[0] | replace: "_", "-" }}="{{ pair[1] }}"{% endfor -%}
{%- endcapture -%}
```

In **both** branches, emit `{{ _style }}` on the element and delete the
`data-illo-density="..."` attribute. Replace every remaining `include.verb`,
`include.seed`, `include.height`, `include.width`, `include.svg` and
`include.background` reference with `_verb`, `_seed`, `_height`, `_width`,
`_svg`, `_background`.

- [ ] **Step 3: Update the include's header docs**

Replace the parameter list in the opening comment with:

```
  name     the illustration's profile in _data/illustrations.yml. Carries its
           object, verb, seed, svg and style. One line is the whole call.
  alt      required for a figure. Describes what the illustration shows and
           does. Content, so it stays at the call site, not in the profile.
  caption  optional. Visible, and carries the argument in words.

  Any profile field may be overridden inline for a one-off: object, verb, seed,
  fit, height, width, svg, background.

  STYLE lives in the profile's `style:` map, never here and never in a post.
  Each key becomes a data-illo-* attribute the engine reads, and an absent key
  means "ask the stylesheet". See _data/illustrations.yml.
```

Delete the `density`, `object` and `verb` vocabulary lists — objects are listed
in `_data/illo_shapes.yml` and verbs in `assets/js/illustration/verbs/`.

- [ ] **Step 4: Rename the parameter in the engine**

In `core.js`, change the first entry of `CSS_READABLE` from `"density"` to `"cell"`.

In `field.js`, replace the density chain:

```js
        var cell = opts.density === "light" ? 11
                 : opts.density === "lighter" ? 14
                 : opts.density === "lightest" ? 20
                 : parseFloat(opts.density) > 0 ? parseFloat(opts.density)
                 : CELL;
```

with:

```js
        // Grid pitch in px. The illustration states it in its profile; CELL is
        // the engine's default for one that does not state a pitch.
        var cell = opts.cell > 0 ? opts.cell : CELL;
```

Delete the block comment above it describing the named steps.

- [ ] **Step 5: Scope the stylesheet**

In `_sass/_tokens.scss`: delete the `@property --illo-density` block, and delete
`--illo-cell: calc(var(--hero-fs) * 0.285);` from `:root` along with its two
comment lines about mark count. `--illo-cell` is one illustration's setting, not
a site token.

In `_sass/_components.scss`, inside `.illo--bg`: delete
`--illo-density: var(--illo-cell);` and the five static declarations that have
moved into the `home-bg` profile —

```scss
  --illo-arrive: 1.5;
  --illo-mark-scale: 0.7;
  --illo-base: 0.24;
  --illo-arrive-x: 0.28;
  --illo-arrive-y: 0.3;
```

— and add `--illo-cell`, with the comment explaining what stays:

```scss
  // These stay in CSS because they must answer the viewport, which a profile
  // cannot. Everything static about this illustration lives in
  // _data/illustrations.yml under `home-bg`; an absent style key there means
  // "read it from here". Nothing here may move to :root: it would inherit to
  // every illustration on the site.
  //
  // The pitch is the hero's own type metrics, so the lattice is made of the
  // type it sits behind. Marks cost one fillText each and the count grows with
  // area, so a finer pitch is expensive — buy smaller marks with mark_scale.
  --illo-cell: calc(var(--hero-fs) * 0.285);
  --illo-char-fade-top: 9rem;
  --illo-char-fade-bottom: 15rem;
```

Leave the `@media (max-width: 47.99rem)` block overriding the two fade
distances exactly as it is.

- [ ] **Step 6: Update the three call sites**

`_layouts/home.html:38`:

```liquid
  {% include illustration name="home-bg" %}
```

`_posts/Blog/2026/2026-03-15-brain-fry-and-the-automation-trap.md:15` — replace
the whole include with this, preserving the `alt` and `caption` strings byte for
byte:

```liquid
{% include illustration name="brain-fry"
   alt="A wide band of marks with soft, smudged edges. Sweeping the cursor across it clears away the lighter marks; the heavier ones that survive darken and a few turn red. The cleared marks drift back over the following seconds."
   caption="Automation takes the easy decisions first. What's left is less work, and also only the hard work." %}
```

`_posts/Blog/2026/2026-06-15-Deliberate-design-practice.md:19`:

```liquid
{% include illustration name="deliberate-practice"
   alt="A loose rectangular field of marks. Moving the cursor across it fills the marks in solidly at any speed, so the field looks finished. Pausing over a spot, or working across the ground at a steady pace, brings out a scattering of red marks underneath it. Rushing through leaves none."
   caption="The output arrives and looks finished. Rushing costs the invisible work." %}
```

- [ ] **Step 7: Verify all three checks and the glyph sizes**

```bash
bundle exec jekyll build --quiet && node --test test/*.test.cjs && node scripts/check-illustrations.mjs
grep -o 'data-illo-[a-z-]*="[^"]*"' _site/blog/brain-fry-and-the-automation-trap/index.html
```
Expected: the check now **passes all three assertions**; the grep shows
`data-illo-cell="8"` and no `data-illo-density`.

Re-run the browser glyph probe. Expected: **11px** and **15px**; the home
background visually identical to `main` — same pitch, same character size, same
arrival from the statement outward.

- [ ] **Step 8: Commit**

```bash
git add _data/illustrations.yml _includes/illustration assets/js/illustration/ _sass/ _layouts/home.html _posts/Blog/2026/
git commit -m "Each illustration is a named profile carrying its own setup

density becomes a numeric cell stated by each illustration, and --illo-cell
moves off :root into .illo--bg. A property on :root inherits to every element,
which is the defect that resized the posts wearing a different name."
```

---

### Task 5: Remove the tuning panel

**Files:**
- Delete: `assets/js/illustration/tune.js`
- Modify: `_config.yml:64`, `_layouts/default.html`

**Interfaces:** none.

- [ ] **Step 1: Delete the file and its wiring**

```bash
git rm assets/js/illustration/tune.js
```

Remove `illo_tune: false` from `_config.yml`, and the `{%- if site.illo_tune %}`
block with its `<script>` from `_layouts/default.html`.

- [ ] **Step 2: Verify nothing referenced it**

```bash
grep -rn "illo_tune\|tune\.js" . --exclude-dir=_site --exclude-dir=.git || echo "clean"
bundle exec jekyll build --quiet && node --test test/*.test.cjs && node scripts/check-illustrations.mjs
```
Expected: `clean`, then all checks pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Drop the temporary tuning panel; its numbers now live in the profile"
```

---

### Task 6: Record the amendment

**Files:**
- Modify: `docs/superpowers/specs/2026-09-02-illustration-config-architecture-design.md`

**Interfaces:** none.

- [ ] **Step 1: Mark the spec implemented**

Change `**Status:** approved, not yet implemented` to
`**Status:** implemented 2026-09-02`, and append:

```markdown
## Doctrine amendment, as built

Commit 6788201 locked "one style, six verbs". One style previously implied one
character size. It no longer does: character size (`cell` × `mark_scale`) is a
per-illustration style parameter declared in `_data/illustrations.yml`. The
style *vocabulary* — weighted monospace glyphs on a grid, character carrying
coarse tone and weight carrying fine tone — remains single and engine-owned,
along with the three substrate invariants (legible at rest, accent scarce,
state refreshes).

## What actually keeps illustrations independent

Two defects of the same shape were found, one shipped and one latent:

- `@property --illo-density` with `initial-value: 20px` — a registered property
  resolves on every element, so the CSS fallback became unconditional.
- `--illo-cell` defined on `:root` — inherits to every element, and would have
  done the same thing under a new name as soon as `cell` became CSS-readable.

Both are now impossible to reintroduce silently: `scripts/check-illustrations.mjs`
fails the build if a registered property carries a non-zero `initial-value`, if
any engine-readable `--illo-*` property is defined on `:root`, or if a figure
relies on an implicit pitch. The reasoning lives beside each rule — in
`assets/js/illustration/config.js` and in `_sass/_tokens.scss`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-09-02-illustration-config-architecture-design.md
git commit -m "Spec: mark implemented, record the one-style amendment"
```

---

## Verification summary

After every task:

```bash
bundle exec jekyll build --quiet && node --test test/*.test.cjs && node scripts/check-illustrations.mjs
```

After Tasks 2, 3 and 4, additionally confirm in a browser that each illustration
draws at its declared size:

| Illustration | declared | expected `ctx.font` |
|---|---|---|
| brain-fry | `cell: 8`, no `mark_scale` | `11px` — `round(8 × 1.35 × 1)` |
| deliberate-practice | `cell: 11`, no `mark_scale` | `15px` — `round(11 × 1.35 × 1)` |
| home-bg | `--illo-cell` from type metrics, `mark_scale: 0.7` | unchanged from `main` |

Both posts read **27px** before Task 2. If either reads 27px after it, the
sentinel change did not take effect.
