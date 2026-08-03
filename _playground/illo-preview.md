---
title: "Illustrations in context"
sitemap: false
published: false
---

<!-- Development harness, deliberately not published: it contains excerpts of
     real posts and is for checking illustrations in context, not for readers.
     To view it:  bundle exec jekyll serve --unpublished  -->

Four illustrations as they'd actually appear, in real post prose at real
measure. This is the check before anything merges: not whether each one is
clever in isolation, but whether it earns its place in a paragraph you're
trying to read.

Every one is one line of markdown. No labels — the caption carries the words,
and the alt text carries the description.

---

## Brain fry and the automation trap

<p>I believe this will be another example of the automation trap. While these agentic systems are great at automating some of the tedious work away, they are also great at automating the <em>easy</em> decisions, leaving only the hard ones for the human part of the centaur.</p>

{% include illustration object="band" verb="sift" seed="4" height="8rem"
   alt="A dense band of marks. Sweeping the cursor removes the light ones, and the heavier marks that survive stand out in red before the field slowly grows back."
   caption="Automation takes the easy decisions first. The remainder isn't smaller, it's denser." %}

<p>Tools like Claude also make it very easy to work on several things in parallel, making the hard part take even more energy. The old rule of thumb of five to six hours of deep work per day is still very much true, even if agents can do more.</p>

---

## Deliberate design practice

<p>The slowness of writing code was doing a kind of work we never named. It forced you to think carefully about each line, and when the slowness left, the thinking left with it. The same is true of design practice.</p>

{% include illustration object="frame" verb="pace" seed="9" height="15rem"
   alt="A rectangular frame of marks. Moving the cursor slowly over it makes the marks resolve and sharpen; sweeping quickly thins them out again."
   caption="Move slowly and the practice deepens. Sweep through and it thins." %}

<p>If a researcher outsources pattern-finding across a repository of interviews, their tacit knowledge doesn't get built. The team's product intuition gets shallow, and less mature teams will not even recognise what they are losing.</p>

---

## AI and clarity of intentions

<p>Product design boils down to two main activities: creating a shared intention, and rendering the intention. As AI tools get better and better at rendering intentions, there will always be parts where someone needs to craft things by hand.</p>

{% include illustration object="rect" verb="order" seed="7" height="15rem"
   alt="A loose rectangular field of marks. Where the cursor passes, the marks settle onto the grid and sharpen, and a few of them lock in red."
   caption="The picture resolves where you attend to it, and only there." %}

<p>The Pareto principle applies: eighty per cent of the experience gets done much faster by an AI tool, but the remaining twenty will need a systematic design effort. That's precisely where clarity of intention matters most.</p>

---

## Streaming UIs

<p>If the interface is generated fresh for each request and then thrown away, the unit of design stops being the screen and becomes the system that decides what screen to make.</p>

{% include illustration object="split" verb="focus" seed="12" height="14rem"
   alt="Two rectangular panels made of marks. Away from the cursor the marks are noisy and the outline is vague; near it they resolve into two clean shapes."
   caption="The screen isn't the artefact. What you can see clearly depends on where you're looking." %}

<p>When somebody designed the system, they made the system of UI elements, and how generated elements should work together. It's not only about the individual elements, but the rules by which complete flows come together.</p>

---

## Light, on its own

<p>Not tied to a post — included because it's the verb with the widest reach, and worth seeing at full width in prose.</p>

{% include illustration object="ring" verb="light" seed="3" height="14rem"
   alt="A ring of marks lit from the direction of the cursor, shading across the whole shape as the pointer moves anywhere on the page."
   caption="The cursor is a light source, not a torch. Moving anywhere re-lights the whole surface." %}
