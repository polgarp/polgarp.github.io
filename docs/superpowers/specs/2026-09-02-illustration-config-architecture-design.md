# Illustration configuration architecture

**Date:** 2026-09-02
**Status:** implemented 2026-09-02

## Problem

The illustration system is meant to be one common engine driving illustrations
that each carry their own setup and do not change over time, except through
deliberate rendering changes. It stopped working that way.

Commit `f716aa1` ("Home page rework") added a background layer to the home page
and, with it, a second way to configure an illustration: CSS custom properties
read by the engine. `--illo-density` was registered with `@property` and given
`initial-value: 20px`. A registered custom property resolves on *every* element
in the document, so `getComputedStyle(el).getPropertyValue("--illo-density")`
returned `20px` on figures nothing had targeted. The guard in `core.js` —
`cssCell > 0 ? cssCell : this.density` — could therefore never fall back, and
the `data-illo-density` attribute became dead on every illustration.

Measured effect, by patching `fillText` and reading `ctx.font` on builds either
side of the commit:

| Illustration | declared density | cell before → after | glyph before → after |
|---|---|---|---|
| brain-fry-and-the-automation-trap | *(none)* → `CELL` = 8 | 8 → 20 | 11px → 27px |
| Deliberate-design-practice | `light` → 11 | 11 → 20 | 15px → 27px |

Both posts rendered at the home background's pitch. The live canvas also drifted
from the committed static SVG exports in `_includes/illustrations/`, which were
generated at the old pitch — contradicting the promise in `_includes/illustration`
that the two "can never drift apart".

## Root cause

Not the `initial-value` alone. The system has three parallel configuration
channels and no declared precedence between them:

| Channel | Carries | Scope |
|---|---|---|
| Include params → `data-illo-*` | `path`, `fit`, `seed`, `render`, `density` | per-illustration |
| CSS custom properties | `--illo-density`, `--illo-base`, `--illo-arrive`, `--illo-mark-scale`, `--illo-char-fade-*`, `--illo-arrive-x/y` | per-class |
| `field.js` module constants | `CELL`, `BASE`, `ARRIVE`, `JITTER`, `ACCENT_SHARE`, `REVERT`, `HOLD`, `K`, `DAMP`, `RAMP` | global |

`density` lives in two of them, with CSS silently winning. Style parameters such
as `mark-scale` and `base` live *only* in the CSS channel, which is how home page
styling could reach the posts at all. The `@property` initial value was the
trigger; the absent precedence rule is the defect.

## Goals

1. One engine, common to every illustration.
2. Each illustration carries its own complete setup, including style.
3. Adding a new per-illustration parameter later is a one-line change. Which
   parameters will be wanted is not known now, so the surface must not be
   hard-coded in three places.
4. An illustration's appearance cannot be changed by work done on another one.

## Non-goals

- Changing how any illustration currently *looks*, other than restoring the two
  posts to their pre-`f716aa1` appearance.
- Making the locked invariants configurable (see "Doctrine" below).
- Reworking verbs, renderers, or the physics model.

## Doctrine held

Commit `6788201` locks these; the design preserves them:

- Style is weighted monospace glyphs — character carries coarse tone, font
  weight carries fine tone.
- Legible at rest, accent is scarce (~18%), reader-created state refreshes.
  These stay engine-owned and are not per-illustration parameters.
- `_data/illo_shapes.yml` is the single source of shape geometry; the include
  emits each path into both the static SVG fallback and the engine's attribute.
- Authoring is one include line.

**Amendment:** "one style" previously implied one character size. It no longer
does. Character size is a per-illustration style parameter. The style vocabulary
(weighted monospace glyphs on a grid) remains single.

## Design

### 1. Precedence

One rule, applied to every parameter:

```
attribute  >  scoped CSS  >  engine default
```

Resolved in a single function in `core.js`. Nothing else may read configuration.

**Sentinel convention:** a registered custom property's `initial-value` is always
a value that reads as "unset" (`0` / `0px`), never a real one. This is the rule
that was violated; it is stated in `_tokens.scss` and asserted by a check.

### 2. Illustrations are named profiles

New `_data/illustrations.yml`. One entry per illustration — the durable record of
what that illustration is:

```yaml
brain-fry:
  object: band
  verb: sift
  seed: 4
  height: 11rem
  width: wide
  style:
    cell: 8

deliberate-practice:
  object: rect
  verb: deepen
  seed: 6
  height: 12rem
  width: wide
  style:
    cell: 11

home-bg:
  object: plate
  verb: range
  seed: 7
  background: true
  # `cell` is deliberately absent: the background's pitch derives from type
  # metrics via --illo-cell in .illo--bg. Absent here means "ask CSS".
  style:
    mark_scale: 0.7
    base: 0.24
    arrive: 1.5
    arrive_x: 0.28
    arrive_y: 0.3
```

Authoring stays one line:

```liquid
{% include illustration name="brain-fry" %}
```

Inline include params remain supported for one-offs and override the profile.
`alt` and `caption` stay at the call site — they are content, not setup.

**`density` is replaced by `cell`, numeric only.** The named steps (`light` =
11, `lighter` = 14, `lightest` = 20) were a vocabulary for picking a pitch
without stating it. Under explicit profiles they are indirection over a number
that each illustration now declares outright, and keeping both a named and a
numeric channel for one value reproduces the confusion this design removes. The
three current call sites are the only callers. `field.js`'s `CELL` remains the
default for an illustration that declares no pitch.

**Naming transform**, fixed and applied mechanically:

```
profile key   mark_scale   (snake_case, YAML)
attribute     data-illo-mark-scale   (kebab-case, DOM)
opts key      markScale    (camelCase, JS)
CSS property  --illo-mark-scale
```

### 3. The engine stops knowing the parameter list

`core.js` collects **every** `data-illo-*` attribute into an `opts` object,
converting kebab-case to camelCase. A small reserved set — `data-illo` (rule),
`-render`, `-path`, `-fit`, `-seed` — is read as structure and consumed by the
`Instance` itself; everything else is style and passes through untouched. A new
parameter therefore needs no engine change: the engine never enumerates the
style parameters it supports.

It then fills keys the illustration left unset from scoped CSS, using one
declared array of CSS-readable names — the only place a parameter name appears
twice. Values that do not parse to a usable number are ignored, so an
unsupported `@property` degrades to the attribute rather than to a wrong pitch.

The resolved configuration is attached as **`sim.opts`**, making it available to
renderers as well as rules. Renderers currently receive `(ctx, sim, ink)` and
have no access to configuration; this is what lets a future per-illustration
knob be read by a verb without touching the include or `core.js`.

### 4. Where configuration lives afterwards

- **Profile** — static setup: object, verb, seed, and style values that do not
  change with the viewport.
- **Scoped CSS** — only genuinely responsive values, and only under a selector
  belonging to one illustration. After this change that is `.illo--bg`:
  `--illo-cell: calc(var(--hero-fs) * 0.285)`, which keeps the lattice made of
  the type's own metrics, and the mobile `--illo-char-fade-*` overrides.
  Everything static moves out of SCSS into the profile.
- **`field.js` constants** — engine defaults and the locked invariants.

### 5. Restoring the posts

`cell: 8` and `cell: 11` become explicit in the two profiles rather than relying
on an implicit engine default. Expected result: glyphs return to 11px and 15px,
and the live canvas re-aligns with the committed SVG exports. No re-export
needed.

### 6. Verification

A script that, for each illustration, loads its page and asserts the drawn glyph
size equals `round(cell × 1.35 × mark_scale)` for that illustration's declared
setup — the check that would have caught this regression. It also asserts that
every `@property` block in the compiled CSS uses a sentinel `initial-value`.

### 7. Cleanup

`assets/js/illustration/tune.js` (178 lines) is marked temporary — *"deleted
along with that flag once the numbers are settled"*. `illo_tune` is `false` and
the numbers are settled in SCSS. It reaches into engine internals deliberately
and would break under this refactor. It is removed, along with the `illo_tune`
flag in `_config.yml` and its script block in `_layouts/default.html`.

## Files touched

| File | Change |
|---|---|
| `_data/illustrations.yml` | new — illustration profiles |
| `_includes/illustration` | look up profile by `name`, emit style keys as attributes |
| `assets/js/illustration/core.js` | generic attribute collection, one `resolve()`, `sim.opts` |
| `assets/js/illustration/field.js` | read from `sim.opts`; keep constants as defaults |
| `_sass/_tokens.scss` | sentinel `initial-value`s, document the convention |
| `_sass/_components.scss` | `.illo--bg` keeps only responsive values |
| `_layouts/home.html` | `name="home-bg"` |
| two post files | `name="brain-fry"` / `name="deliberate-practice"` |
| `_config.yml`, `_layouts/default.html` | drop `illo_tune` |
| `assets/js/illustration/tune.js` | deleted |
| verification script | new |

## Risks

- **Profile lookup failure is silent.** A typo in `name` yields an empty shape
  and no figure. The include already guards on `_path`; it must fail loudly
  enough to notice in the build. A missing include breaks the whole build, which
  is the existing behaviour and acceptable.
- **Generic attribute collection widens the surface.** Any stray `data-illo-*`
  attribute becomes an option. Acceptable: the include is the only thing that
  writes them.
- **The two posts' SVG exports are assumed correct for the restored pitch.**
  Verified by comparing against the pre-`f716aa1` build, not assumed.

## Doctrine amendment, as built

Commit 6788201 locked "one style, six verbs". One style previously implied one
character size. It no longer does: character size (`cell` × `mark_scale`) is a
per-illustration style parameter declared in `_data/illustrations.yml`. The
style *vocabulary* — weighted monospace glyphs on a grid, character carrying
coarse tone and weight carrying fine tone — remains single and engine-owned,
along with the three substrate invariants (legible at rest, accent scarce,
state refreshes).

## What actually keeps illustrations independent

Four defects of the same shape were found, one shipped and three latent:

- `@property --illo-density` with `initial-value: 20px` — a registered property
  resolves on every element, so the CSS fallback became unconditional. This is
  the one that shipped, taking both posts' glyphs from 11px and 15px to 27px.
- `--illo-cell` defined on `:root` — inherits to every element, and would have
  done the same thing under a new name as soon as `cell` became CSS-readable.
- `core.js` assigned `window.Illo` wholesale, dropping the `config` object
  attached by `config.js`. Invisible in development, because a cached copy of
  `core.js` still worked.
- The include hardcoded a `lightest` density default on the background branch.
  Harmless while CSS outranked attributes; under the precedence rule a default
  baked into the include beat the stylesheet and took the home layer from a
  9.576px pitch to 20px. A default written into the include is not the
  illustration speaking, so it is now emitted only when one is passed.

The first two are now impossible to reintroduce silently:
`scripts/check-illustrations.mjs` fails the build if a registered property
carries a non-zero `initial-value`, if any engine-readable `--illo-*` property
is defined on `:root`, or if a figure relies on an implicit pitch. The
reasoning lives beside each rule — in `assets/js/illustration/config.js` and in
`_sass/_tokens.scss`.

## Deviations from the design as specified

- **The precedence rule became its own module** (`assets/js/illustration/config.js`)
  rather than a function inside `core.js`, so it is pure and unit-testable in
  plain Node with no DOM. `test/config.test.cjs`, 11 cases.
- **The check script asserts structure, not drawn pixels.** Measuring glyph size
  in CI needs a headless browser, and this repo has no `package.json` and no
  runtime dependencies. Glyph size is a pure function of the resolved config,
  so the unit tests pin the resolution and the three structural assertions pin
  the inputs. The browser probe — patching `fillText` and reading `ctx.font` —
  stays a manual step, run against a `master` build for comparison after every
  task that touched rendering.
- **`_config.yml` gained an `exclude` list.** Not in the design: it turned out
  Jekyll was processing `docs/` as site content, and a Liquid tag quoted in the
  plan's prose failed the whole build.
