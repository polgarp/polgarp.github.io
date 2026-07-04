---
title: "The Designer's Arcana"
header:
  image: /assets/images/playground/arcana-header.png
---

[The Designer's Arcana](https://polgarp.com/the-designers-arcana/) is a tarot deck where every card is a moment from a designer's life, mapped onto the traditional 78 card deck with the [Rider-Waite-Smith](https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot) meanings intact underneath.

I've always been interested in symbolism, and tarot decks have an especially deep and layered meaning rooted in tradition. Product design is the domain I live in every day, so it sounded like an interesting project to make a tarot deck focused on designers.

A thing to note: I don't think shuffling cards predicts anything about next quarter. What it _might_ give you is 78 prompts to reflect on your own situation. That's the frame I built this from. If you see the cards differently, that's yours to keep.

{% include figure alt="The Stakeholder Review card" caption="The Stakeholder Review (VIII). [Strength](https://en.wikipedia.org/wiki/Strength_(tarot_card)), traditionally: a figure calmly holding a lion's jaw open." image_path="/assets/images/playground/arcana-stakeholder-review.png" width="300px" %}

The tempting version of this project is a Fool card, a Death card, and a nice Instagram post. I didn't want that one. What gives tarot its power is that it's a complete system: 78 cards that cross-reference each other, allowing for emergent patterns. So the deck had to be all 78 or it wasn't tarot, just a t-shirt.

That ambition resulted in a few fascinating aspects. Each idea has to earn its place, since the deck has a fixed number of slots, and needs to pass a test asking whether the traditional meaning actually fits better than whatever it would replace. Getting 78 cards to read as one system (a coherent career for the major arcana, and the four suits as four domains of the job) took far more iteration than a few nice illustrations would have. Creating a system early helped: writing the rule set down first, then arguing with every card whether it follows the rules.

The visual side went through its own argument with itself. I started with a naive decorative idea ([Marseille](https://en.wikipedia.org/wiki/Tarot_of_Marseilles)-meets-[Bauhaus](https://en.wikipedia.org/wiki/Bauhaus) mood boards), then took a detour into trying to hand-author figures in SVG for pure consistency. Finally I stepped back and figured out a philosophy for the illustrations: a style I call Atelier Arcana, an instrument manual drawn like scripture. Confident, varied-weight ink, and colour used like enamel. Every card stages a collision of an old symbol and a modern design artefact: a crescent moon holding a pair of headphones, a lion made of Slack notifications.

{% include figure alt="The Researcher card" caption="The Researcher (II). [The High Priestess](https://en.wikipedia.org/wiki/The_High_Priestess), holding a truth the team isn't ready to hear yet." image_path="/assets/images/playground/arcana-researcher.png" width="300px" %}

The generation side was its own fight. I use Recraft's vector model for the linework: it draws an intricate woodcut line I couldn't hand-author at this pace across 78 cards. Generated images have their own issues, and they drift. Colours wander off palette, and style consistency erodes at such scale.

What worked was moving the discipline out of the prompt and into a pipeline. Generate the inner art loose, retouch (sometimes redraw) by hand, run a script that crops it, snaps the palette back to the six locked hex values, composites it into a hand-authored [Art Deco](https://en.wikipedia.org/wiki/Art_Deco) frame, and sets the type. The generator gets to be expressive. The palette and the frame don't get a vote.

That split is a workflow lesson of this project. The doctrine docs (the visual philosophy, the palette, the rules for what a card can and can't be) work like a constitution that both I and the tools I'm directing read from. I built the pipeline working with Claude Code: fast on scaffolding, and iterating to fix issues. This only worked because the rules existed before any code did. Once the doctrine is set, delegating execution, to a generator or to a coding agent, stops being a gamble and starts being a judgement call.

{% include figure alt="The VP of CX card" caption="The VP of CX ([King of Cups](https://en.wikipedia.org/wiki/King_of_Cups)). Composure as an executive function." image_path="/assets/images/playground/arcana-vp-of-cx.png" width="300px" %}

Once all the cards are finished, I'll want another pass over the full set: later cards will teach the pipeline things the early ones didn't know, and coherence across 78 cards only really shows once they all exist. The [showcase](https://polgarp.com/the-designers-arcana/) reveals the deck one plate at a time as I progress.
