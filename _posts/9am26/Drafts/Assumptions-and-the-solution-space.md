---
title: "e52 "
categories:
  - Newsletter
tags:
  - Product discovery
  - Product design
  - AI design
---

<!-- ───────── WORKING NOTES — delete before shipping ─────────

Arc issue 2, after e51 *Discovery artifacts are vacation photos*.
Research: ~/Dropbox/Obsidian/Polgarp/Summaries/Assumptions and the Solution Space.md

SPINE: Being wrong got cheap. Being narrow didn't.

TITLE OPTIONS
- Cheap to be wrong, expensive to be narrow
- What your assumptions ruled out
- Assumptions draw the edge of the solution space
- Assumptions are the unit of work (old working title, now a different issue)

DON'T SPEND
- Issue 4 (Almost done is 10% there) — polish vs. decision quality. One sentence, no mechanism
- Issue 5 (The intuition you stop building) — synthesis and tacit learning
- Issue 6 (Discovery knowledge that stays alive) — artifacts as corpus
- Don't land on e51's "speed has to be paid for with rigor". Say WHICH rigor, and why the obvious kind doesn't help

INTERNAL LINKS TO PLACE
- e51 Discovery artifacts are vacation photos — beat 6 callback
- e05 Problem space, solution space — beat 3
- e25 Writing useful hypotheses — beats 1 or 7
- Blog: AI and clarity of intentions — you already wrote "initial assumptions about the
  problems limit the solution space" there as an aside; this issue promotes it to thesis
- e28 Rigor is essential in user research — if beat 6 wants precedent
- Combating groupthink — if the silent-first tip needs support

OPEN DECISION
In e25 you said you'd cooled on "hypothesis" and "assumption" and moved to bets and
beliefs. This issue leans on "assumption" throughout. Either re-earn the word early or
switch vocabulary — the boundary argument might be what makes it worth keeping.

───────────────────────────────────────────────────────────── -->

{% include figure image_path="/assets/images/.jpg" alt="" caption="" %}

# ☕

**1. The old fear**
- Assumptions were dangerous because being wrong was expensive
- Late discovery, months in, org needs it to have been right
- Every tool we have is risk management: RAT, riskiest assumption canvas, assumption testing cadence
- Higham's method worth describing approvingly: work backwards, "what has to be true?", recurse
- Note what that produces — a tree of things that must be true. Never asks what the frame excluded

**2. That fear is receding, and it's good**
- Reversible idea + two prompts = building *is* the test
- Discovery and delivery stop being two phases
- Cheap to be wrong, and cheap to *abandon* — nobody defends six months of spend
- Sunk-cost trap loosens. This is a genuine improvement
- Don't undercut it here. The turn is stronger if this beat stays unqualified
- One clause of concession only: disposable isn't free, throwaway prototypes can't move forward (Paschal)
- ⚠️ No source supports the sunk-cost claim — write it as your argument, not citation

**3. The turn — that was half of what an assumption does**
- Not just a bet that might be wrong. A boundary on what gets considered
- Narrow the problem, you don't make a solution risky — you delete it
- Ball pen isn't a *risky* answer to "notes in zero gravity", it's not an answer
- Narrower problem set → smaller candidate set (Mescheder)
- Gajendar's cut is more usable in a newsletter: risky assumption = live wire you can see and test; blindspot = never entered the frame
- Torres's fish-and-water line fits here or beat 1

**4. Cheap failure does nothing for that half** ← load-bearing
- A failed build tells you the product failed
- It never tells you the boundary was wrong — a deleted candidate doesn't show up in results
- Ten cheap tests inside a wrong frame all come back honest
- Speed multiplies tests *inside* the boundary. Does nothing to the boundary

**5. The tooling pushes the boundary inward**
- Boussioux et al. — frame carefully: AI-assisted won on viability and value, humans won on novelty incl. the extreme tail
- So: not worse answers. Good answers with the right tail cut off
- The tail is what an unexamined assumption removes
- Rink: first draft becomes the invisible cage
- Gajendar: AI relocates blindspots rather than removing them
- Gajendar's *false completeness* — comprehensive-looking list, nobody asks what's missing
- ⚠️ One sentence max on almost-done making restart harder. That mechanism is arc issue 4

**6. What rigor means now**
- Not "test more" — volume is the cheap thing, and testing inside a bad frame is worthless
- Rigor = naming the boundary *before* generating
- After generation you can't separate what you decided from what got filled in
- A generated artifact has no seams
- Callback to e51: artifacts have to work for whoever wasn't there — an unnamed assumption is what an artifact never carries

**7. Tips — making the boundary visible** (pick 4–5)
- Write the ruled-out next to the chosen: *if this were false, what becomes possible?* Not *is this true?*
- Break one dimension on purpose (Cohen's extreme questions, ported): no interface at all / ten seconds / ten times the price
- Assumption pass before you prompt, not after — FADE: Facts, Assumptions, Dependencies, Expectations
- Put the seams back in: mark which lines the team decided, which the tool supplied
- Write alone before the group converges (Murphy's silent-first). Once someone says "the model suggested this", it's the anchor
- Optional: use the model as adversary not producer — ask it for blindspots and risky assumptions

**8. Close**
- Being wrong got cheap. Being narrow didn't
- The assumption you never named is the only expensive kind now

**Original beat available** (recommended, one para)
- Gajendar wants you to ask the model for your blindspots — and also says it converges on the common and can't see what wasn't in the prompt
- Those are in tension: a blindspot outside your frame is likely outside the training centre too
- He doesn't resolve it. Nobody has
- Implication: model for the near blindspots, people for the far ones

### 🚲 Questions to consider

- What did we decide, and what did the tool decide for us?
- Which solutions stopped being candidates before anyone evaluated them?
- If our riskiest assumption were false, would we know — or would the tests still come back clean?

### 🥤 To recap

<!-- e51 dropped this section; keep or cut. Candidates: -->
- An assumption does two jobs: it carries risk, and it draws the boundary of what counts as a candidate
- Falling execution cost only pays down the first one
- A failed cheap build never tells you the frame was wrong — deleted candidates don't appear in results
- So rigor now means naming the boundary before you generate, not running more tests inside it

> This is a post from my newsletter, **[9am26]({% link _pages/newsletter.md %})**, subscribe here:
{% include newsletter-signup.html %}

# 🍪 Things to snack on

<!-- Pick 6–7. Summaries and pull quotes are in the research brief. -->

- **The Crowdless Future? Generative AI and Creative Problem-Solving** — Boussioux, Lane, Zhang, Jacimovic, Lakhani *(Organization Science, 2024)*. The evidence. Cite the *novelty* finding, not "diversity"
- **An AI that argues back?** — Uday Gajendar *(2026)*. Blindspot vs. risky assumption, FADE, relocation, false completeness
- **Problem Space and Solution Space** — Daniel Mescheder. The narrowing mechanism
- **Design Fixation: Why Your First Idea Is Your Worst Enemy** — Alexander Rink *(2026)*. Anchoring on AI output; the invisible cage line
- **The MVP is dead. Long live the RAT.** — Rik Higham. The risk framing at its best, before you show its blind side
- **Extreme brainstorming questions** — Jason Cohen. Source for tip two
- **The hidden cost of AI prototypes that are made to die** — Allie Paschal *(2026)*. The counterweight, if beat 2's concession needs backing
- **Introducing the Riskiest Assumption Canvas** — Ioannis Nousis. Probability × impact, "inverse confidence rating"
- **How to Run a Pre-Mortem** — Ant Murphy. Silent-first
- **Illusory correlation** — Anne-Laure Le Cunff. Hidden assumptions are dangerous because they're easy to rationalise

<!-- Spent in e51's snacks: Patton, Wodtke, Ramsden, Teresa Torres, Bastow, Joca Torres,
Spool. Torres reusable on a different angle (assumption testing, not handoffs), the way
e47 → e51 reused Patton. -->

<p style="text-align: center;">🁃</p>
