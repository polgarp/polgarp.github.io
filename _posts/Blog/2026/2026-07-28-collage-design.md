---
title: "collage-design, Claude skill for making collage art"
categories:
  - Blog
tags:
  - AI design
  - Side project
---

I made an agent skill that creates collage images, you can [get it here](https://github.com/polgarp/collage-design).

I've been playing a lot recently with Anthropic's [canvas-design](https://github.com/anthropics/skills/tree/main/skills/canvas-design) skill, it's also a nice example how context and workflow can be embedded into a skill to enhance the agent's harness, rather than just adding a glorified prompt that will probably be improved anyway by a better model.

But algorithmic images only go so far, and I was missing real imagery without the taste of generated photos. So I got the idea of trying to create collages with an algorithm instead.

Creating a collage has a fairly simple approach: decide the topic and format, collect material, cut and compose until you like what you see. Replicating that into an algorithmic skill turned out to be three separate problems.

{% include figure image_path="assets/images/2026-07-28-collage-design-strike-anywhere.jpg" alt="A square sheet packed with hundreds of vintage Indian and Japanese matchbox labels, tidy rows in one corner decaying into an overlapping pile" caption="*Strike Anywhere*, from the brief: “A square print for my kitchen made from old matchbox labels, hundreds of tiny loud pictures. I want it to feel like a collector’s sheet that’s got out of hand.” 244 fragments cut from 179 public domain labels." %}

**Topic and format** needed deeper guidance than just a brief prompt. Here is where I took inspiration from canvas-design and added a philosophy step, which the skill writes for each piece before anything gets downloaded. It's an invented aesthetic movement naming its register, its palette, how the edges are cut, and what reconciles sources that were never meant to sit together. Everything after it has to answer to it.

**Material** is where licensing concerns become real (it's not like you just take a magazine and work with scissors), so building a pipeline serving only open licensed images was necessary. A collage is a derivative of every fragment in it, so the most restrictive source sets the terms for the whole piece. Every run logs each asset with its URL, creator and licence, and says what that means for reuse: CC BY-SA is viral and makes your finished artwork copyleft, ND is disqualifying. That ledger ships next to the finished collage.

{% include figure image_path="assets/images/2026-07-28-collage-design-sodium.jpg" alt="A tall dark poster, a running figure’s silhouette filled with sepia night photography under a sodium streetlamp glow, titled NOCTURNE" caption="*Sodium*, from: “A tall poster for a running club’s night race through the city. Bodies in motion, streetlights, sweat. Should feel like it’s moving.” The city is clipped into the runner’s silhouette." %}

**Cut and compose** was a highly iterative process, I needed to get from simple and vague ideas to a concrete approach. Cutting ended up as seven edge styles, from clean die-cut keylines through to torn paper. Composing has no layout presets at all, because presets are how you end up with a moodboard grid instead of a collage. Instead there's a check at the end that tests four things: whether fragments occlude each other, whether any escape the canvas edge, whether one treatment ran across everything, and whether there's enough variance in fragment scale.

The reconciling treatment is the part I underestimated. Sources arrive from different archives with different exposures, different paper, different centuries, and getting them to read as one object rather than a pile proved to be most of the work. In *Strike Anywhere* above the reconciler is sixty years in the same album rather than any kind of colour grade: fugitive red bleaching where the light hit it, a water bloom, a warmer rectangle where the glue was. The amount of fade is read from a single field sampled at each fragment's position on the finished sheet, so the labels age by where they sat in the book rather than each on their own.

{% include figure image_path="assets/images/2026-07-28-collage-design-mauve.jpg" alt="A portrait poster of Victorian studio portraits in grey with hard-edged fluorescent magenta squares and colour calibration charts laid across them" caption="*Mauve*, from: “A portrait poster where Victorian studio portraiture collides with present-day colour photography. Don’t blend them, I want the seam to show.” Here the unifying treatment is deliberately overridden." %}

You don't need to say any of this to use the skill. You ask for the picture you want in a sentence or two, and mention what it's for if you know, since that decides which licences are acceptable. Interestingly, because of all the steps that go into a collage, a piece takes twenty to forty minutes, most of it spent sourcing rather than rendering.

{% include figure image_path="assets/images/2026-07-28-collage-design-brine.jpg" alt="Square cover art layering Norwegian sardine tin labels, lima bean can wrappers and market produce photography over black" caption="*Brine*, from: “Square cover art for a supper club called Brine. Sardine tins, market stalls, mid-century food packaging. Appetising and slightly grotesque.”" %}

As for the final result, sometimes the output is usable and interesting, other times it just drifts, which I think is right with such algorithmic tools. It does find interesting compositions and pictures often enough to be worth the wait, other times it's just random. Because the final image is generated by a build script (hence it's algorithmic art), adjustments can be also made manually, rather than restarting the whole process.

Probably I'll need to add over time different types of tools to cuts and treatments. Both take drop-in files, so an invented edge or a new treatment is a first-class citizen rather than a fork of the whole thing.