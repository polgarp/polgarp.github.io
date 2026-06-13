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
- [ ] **R6 — #7 reading progress**: 1px red rule under the masthead fills while reading a post.
- [ ] **R7 — #8 j/k feed navigation** + accessibility review pass (focus order, roles,
  aria on chips/switch/search, reduced motion, contrast re-check).
- [ ] **R8 — #10 /colophon/ page**: short and sweet — stack, typeface, 22KB, design rules,
  **mentions Bauhaus** (per #13 note). Footer "black, red, white & monospace" links to it.
- [ ] **R9 — #12 OG share images**: pre-generated mono cards (title on white, red square)
  committed to assets/og/, wired via front-matter image for jekyll-seo-tag.
  Note: GH Pages classic can't run custom plugins → generation is a local script,
  re-run when new posts are added.
- [ ] **R10 — #13 "bauhaus" easter egg**: typing the word swaps palette to the
  red/yellow/blue triad for ~2s, then settles back.

## Notes / decisions

- (fill in per round)
