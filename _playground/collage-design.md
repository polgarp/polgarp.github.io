---
title: "collage-design"
header:
  image: /assets/images/playground/collage-design.jpg
---

[collage-design](https://github.com/polgarp/collage-design) is a Claude skill that makes cut-and-layer collage art. You describe the picture you want in a sentence or two, and it sources real open licensed photographs and printed material from public archives, cuts them, reconciles them into one palette, and composes a finished piece.

The four above came from four sentences. I've written separately about [how it works]({% post_url Blog/2026/2026-07-28-collage-design %}). What interested me building it was a different problem.

With [The Designer's Arcana](/playground/the-designers-arcana/) I wrote the doctrine and the tools executed inside it. That worked because I knew what all 78 cards had to look like before I made any of them.

Here I didn't. A collage skill has to make a picture I've never seen, out of material I've never seen, in a register I haven't chosen. So the doctrine couldn't be a fixed constitution. It had to be a rule for writing constitutions.

What the skill does first, before downloading a single image, is write a philosophy for that one piece: an invented aesthetic movement naming its register, its palette, how the edges get cut, and what reconciles sources that were never meant to sit together. Everything after it answers to that document, and it ships alongside the artwork. It's the part I spent longest specifying, because it's the only place where a piece gets an argument rather than a style.

{% include figure alt="Detail of the Strike Anywhere collage showing overlapping matchbox labels with die-cut, torn and scissor-trimmed edges" caption="Detail from *Strike Anywhere*. Three edge languages record how each label entered the collection, and they never blur into each other." image_path="/assets/images/playground/collage-strike-detail.jpg" width="300px" %}

The second layer is what keeps that honest. An invented philosophy will cheerfully justify a bad picture, so the run ends against four checks that don't care what the philosophy says, covering occlusion, canvas-edge escape, treatment coverage and scale variance. The philosophy can be as strange as it likes and still has to pass them.

That split is the part I'd carry into other work. Invented rules per piece, invariants that outrank them. In the Arcana the constitution was mine and fixed; here I had to write the rules for how rules get made, then hold them to standards that don't negotiate.

Licensing turned out to be a design constraint rather than a legal footnote, which I hadn't expected. A collage is a derivative of every fragment in it, so the most restrictive source sets the terms for the whole piece: CC BY-SA is viral and makes your finished artwork copyleft, ND is disqualifying. Once that's true, licence filtering decides what a picture can be made of, and so it shapes the aesthetic before any composition decision happens. Open archives skew heavily towards particular eras and particular kinds of printing, and the work looks like that whether you planned it or not.

{% include figure alt="The Mauve poster, Victorian studio portraits in grey overlaid with fluorescent magenta squares and colour calibration charts" caption="*Mauve*, where the brief asked for the seam to show. The skill's default is to unify the sources, so this piece overrides it by name and replaces it with something more disciplined." image_path="/assets/images/playground/collage-mauve.jpg" width="300px" %}

Where it still needs a person is taste. The checks catch drift, they can't catch boring. It finds something genuinely good often enough to be worth the twenty to forty minutes a piece takes, and something merely random the rest of the time, and I can't yet tell in advance which run will be which. What helps is that the build script comes out parametric, so a piece that nearly works is something you argue with rather than regenerate from scratch.

The next thing I want is more cutting and treatment tools, since that's where a piece gets its material character. Both take drop-in files, so an invented edge or a new treatment is a first-class citizen rather than a fork of the whole thing.
