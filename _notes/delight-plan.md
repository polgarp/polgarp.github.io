# Delight round — working notes

Process: one item per round, quick feedback after each. (Numbers from the idea list.)

## Rounds

- [x] **R1 — Home header consistency + #1 9:26 club** *(shipped; club tested with a faked clock)*
  - Home lede `h1` switches to the shared `post__title` component (same as other pages).
  - 9:26 club: when the visitor's local clock reads 9:26 (am — it's 9am26 after all),
    a third footer line appears: "it's 9:26 — drink up ☕".
    Detail: the colophon's ☕ is grayscaled; the club line's ☕ is the only
    full-color emoji on the site, one minute per day.
- [x] **R2 — #2 switch tumble** *(shipped; two revisions per feedback)*:
  Standing rectangle (1:2) that tips like a domino — **bottom-edge pivot**
  (`transform-origin: 50% 100%`, block sits on the box floor) so it stays grounded and
  inside the box instead of spinning about its centre and poking out. Tip is **mirrored
  to travel direction**: `tip-right` (rotate 0→90→180) going to dark, `tip-left`
  (0→-90→-180) going to light, set via JS direction class. Visible text label **removed**
  — target mode lives in the tooltip/aria-label only ("Switch to … mode"). Plain
  action-labelled button (no role=switch). Rejected: square-knob squash (cartoonish,
  overflowed); centre-pivot rotate (swung out of the box, wrong corner).
- [ ] **R3 — #3 view-source banner**: ASCII `[P` logo in an HTML comment at the top of every page.
- [ ] **R4 — #5 404 logo**: the P's red bowl tipped off the glyph, fallen to the baseline.
- [ ] **R5 — #6 search seeds**: empty overlay shows "try: …" with 3 rotating suggestions.
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
