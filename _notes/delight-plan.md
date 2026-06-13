# Delight round — working notes

Process: one item per round, quick feedback after each. (Numbers from the idea list.)

## Rounds

- [x] **R1 — Home header consistency + #1 9:26 club** *(shipped; club tested with a faked clock)*
  - Home lede `h1` switches to the shared `post__title` component (same as other pages).
  - 9:26 club: when the visitor's local clock reads 9:26 (am — it's 9am26 after all),
    a third footer line appears: "it's 9:26 — drink up ☕".
    Detail: the colophon's ☕ is grayscaled; the club line's ☕ is the only
    full-color emoji on the site, one minute per day.
- [x] **R2 — #2 switch domino roll** *(shipped; three revisions per feedback)*:
  Final = a true two-pivot domino roll. Block ABCD stands on the box floor; rolling
  right it pivots on corner D (origin 100% 100%, rotate 0→90, lies on CD), then at 50%
  the origin jumps to corner C (100% 0%) with a compensating translate(h,h) — derived so
  position is continuous — and rotates 90→180 to stand on CB. Travel = w+h = 1.04rem,
  matching the `is-dark` steady translateX. Left roll = same keyframes `reverse` (mirror).
  Block is now a real `<i>` element (measurable). Verified via WAAPI sampling: bottom
  constant (grounded), inside box, continuous at the 50% pivot switch, lands without jump.
  Earlier attempts (rejected): square squash; centre-`rotate` (swung out of box, wrong
  corner); single bottom-centre pivot (not a real roll).

- [x] ~~**R2 — #2 switch tumble**~~ *(superseded)*:
  Standing rectangle (1:2) that tips like a domino — **bottom-edge pivot**
  (`transform-origin: 50% 100%`, block sits on the box floor) so it stays grounded and
  inside the box instead of spinning about its centre and poking out. Tip is **mirrored
  to travel direction**: `tip-right` (rotate 0→90→180) going to dark, `tip-left`
  (0→-90→-180) going to light, set via JS direction class. Visible text label **removed**
  — target mode lives in the tooltip/aria-label only ("Switch to … mode"). Plain
  action-labelled button (no role=switch). Rejected: square-knob squash (cartoonish,
  overflowed); centre-pivot rotate (swung out of the box, wrong corner).
- [x] **R3 — #3 view-source banner** *(shipped)*: ASCII `[P` mark (box-drawing) + a short
  message in an HTML comment, placed in `<head>` right after `<meta charset>` (so the
  UTF-8 art decodes) — appears near the top of every page's source, pairing with the
  console greeting. Also: sped the switch roll 0.4s → 0.28s per feedback.
- [x] **R4 — #5 404 logo** *(shipped)*: dedicated `_layouts/404.html` with a large `[P`
  mark whose red bowl has tipped off and lies on the baseline (translateY + rotate 90°).
  Drops from the P on load (`bowl-fall` keyframe, slight overshoot; reduced-motion shows it
  already fallen). Title changed to "This page tipped over". 404 link: /404.html.
- [x] **R5 — #6 search seeds** *(shipped)*: empty search overlay shows "Try …" with 3
  clickable starter terms, freshly picked from a 12-term pool each open; clicking one fills
  the query and runs the search. Sits above the existing recent-posts empty state. Verified:
  seeds render on open, click runs search (20 results), hide once typing.
- [x] **R6 — #7 reading progress** *(shipped)*: 2px red hairline fixed at the top of the
  viewport (masthead isn't sticky, so top-of-page is the sensible spot), fills left→right
  with scroll progress. Only on post + case-study layouts (gated by the `.reading-progress`
  element; rAF-throttled scroll/resize). Verified scaleX 0→0.5→1 top/mid/bottom.
  Also tweaked R4: 404 bowl now holds attached ~1s (backwards fill) then falls;
  title is "404 — This page tipped over".
- [x] **R7 — #8 j/k feed navigation + a11y pass** *(shipped)*:
  - j/k moves focus through visible `.feed__item .feed__title a` links (Enter opens);
    additive to Tab, ignores inputs and the open search dialog. Appended as a 2nd IIFE in
    topics.js (runs on any page with a `.feed`).
  - **In-post j/k** (follow-up): on a Blog/9am26 post, j → next (older) post, k → previous
    (newer), in the same mixed feed order. Neighbours computed in post.html via the same
    Blog+Newsletter filter, emitted as `data-post-next/prev`; Garden & other categories get
    no neighbours (no in-post nav). Verified jumps both directions + Garden excluded.
  - Search dialog focus management (Lighthouse can't catch this): stores the opener,
    focuses the input on open, **traps Tab inside** the dialog, and **returns focus** to the
    opener on close/Escape. Verified: open→input, Shift+Tab wraps to last, Esc→toggle.
  - Audit: Lighthouse Accessibility **100** on home + post, in **both light and dark**
    (contrast passes both palettes). Best-Practices dings are only giscus/beehiiv 3rd-party
    cookies. Reduced-motion guard already covers the roll/bowl/transitions.
- [x] **R8 — #10 /colophon/ page** *(shipped)*: short page — type (IBM Plex Mono), colour
  (**Bauhaus** palette), built-with (Jekyll/GH Pages, ~35 KB CSS+JS, no theme/framework/
  analytics), the vanilla scripts + j/k & / hints, GitHub source link. Footer's design
  phrase now links to it; coffee coda kept, ☕ greyed via `.u-emoji` (dropped the
  whole-line grayscale filter so the link's red hover survives). Not in main nav (footer
  discovery only).
- [~] **R9 — #12 OG share images** *(deferred by choice)*: GH Pages classic can't generate
  images; options were a GitHub Action (per-post, robust to direct-on-GitHub commits), a
  single static default card (no CI), or a local script (gaps on direct commits). Peter
  opted to skip for now — OG stays as jekyll-seo-tag text meta. Revisit if link previews matter.
- [x] **R10 — #13 "bauhaus" easter egg** *(shipped)*: global keystroke buffer; typing
  "bauhaus" outside a text field drops a centered composition — yellow triangle, red square,
  blue circle (Kandinsky shape→colour) — fading in/hold/out over ~2s. pointer-events:none,
  z-index above everything. Verified trigger + composition.

---

**Delight series complete (R1–R10).** R9 deferred by choice. All other rounds shipped to
`master`-bound commits on the working branch; remember to push when ready.

## Notes / decisions

- (fill in per round)
