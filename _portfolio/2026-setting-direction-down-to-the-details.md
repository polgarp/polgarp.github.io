---
title: "Setting direction, down to the details"
date: 2026-09-01
sidebar:
  - title: "Role"
    image: /assets/images/portfolio/canonical-logo.svg
    image_alt: "Canonical logo"
    text: "Lead Experience Designer <br>@Canonical ⊂ 2024 - "
  - title: "Scope"
    text: "Lead the design for the Ubuntu Pro portfolio."
---

The various services around Ubuntu Pro had been assembled over years by different teams, so it never added up to a coherent experience. After I joined Canonical, I mapped the journey end to end, which made this fragmentation visible, and pitched what a single surface across the portfolio could look like. The decision to build it was already forming, and the pitch became the key perspective on what the UX should be. It became a project, a team, and a product: the next iteration of Ubuntu Pro.

{% comment %} TODO image: the end-to-end journey map, or the hero image used in the pitch. {% endcomment %}

After the initial shaping, we set a three year roadmap till the general release. The first release brings seven services under one surface, and that number grows as we build new ones and adopt existing internal ones. At that size **alignment is the dominant cost**, and much of what I do goes on paying it down.

## The problem is that nothing exists yet

The first phase was argument. What the shared surface should be, what it should never absorb, and which parts were technically reachable. I ran workshops, took part in the architecture discussions, and drew the maps we argued over. The framing that settled the most disputes was deciding it **provides mechanisms, not products**: a shared backplane teams build their services on, which never makes product decisions for them.

A weekly strategy session with the product manager and an architect has run for about ten rounds, and produced the long-term roadmap the delivery work is now sequenced against.

Then it got concrete. More maps, written specifications, permission modelling worked out with the product manager. I direct four designers working on the shared surface itself and collaborate with the wider team as their services come into it, designing some surfaces myself, coordinating the rest, and running the research alongside.

The recurring difficulty is that everyone is being asked to agree about something that does not exist. Words are a poor medium for that, and slide decks age badly.

## Stand-ins, so people argue about the same thing

So I build the thing early, in rough. Working with coding agents, I made a prototype that holds the current state, the next step, and the long-term ideas in one space, with variants sitting side by side and new explorations added as they come up. It runs to about a hundred destinations now and keeps growing, because extending it with coding agents is cheap enough to do inside a conversation. It is not a deliverable that gets handed over and filed. It is where the conversations happen now.

{% include figure image_path="/assets/images/portfolio/2026-setting-direction-down-to-the-details-1.png" alt="Four versions of the same service launcher side by side: a search popover, an icon grid, a labelled list, and a full-height drawer." caption="Four forms of the launcher, built rather than argued about. Service names replaced for publication." %}

Being able to build the variants rather than describe them changed what was worth trying. The launcher exists in four forms with four ways to trigger it, because building all of them and feeling the difference was cheaper than arguing in the abstract. The whole prototype also switches between three versions of the product, today's scope, the next release and the long-term picture, so a conversation can move between them without changing tools. I keep a written record of what we deliberately did not build, and why, so the rejected branches stay part of the argument.

{% include pullquote text="A prototype gives everyone a stand-in to point at, and a stand-in settles arguments that words keep reopening." %}

The second-order effect matters more than the artifact. Once the experience is in front of people, **the decisions behind it get easier to settle**. Questions about identity, tenancy or where a service boundary sits stop being abstract architecture debates and become questions about something visible.

## Coherence needs a layer the design system doesn't have

Working this way surfaced a gap. A design system with good components still produces an incoherent portfolio, because components say nothing about the middle: how a surface is composed, how services sit next to each other, how a journey holds together across products.

So I am contributing that middle upward as **layout patterns**, a new category in the design system alongside the component library. They carry the cross-service layout decisions and the smaller coherence rules, like keeping icons consistent from one service to the next. Coherence at portfolio scale has to be written down somewhere, and until now it was not.

{% include diagram name="pattern-layer"
   alt="Three stacked bands. Journeys at the top, owned by product teams. Patterns in the middle, outlined in red and marked as the new category. Components at the bottom, owned by the design system." %}

## Where it stands

We are preparing the first MVP release, and the alignment machinery is holding. The prototype is the reference teams work from, the specifications are unblocking the teams building against them, and the pattern work is being absorbed into the design system.

{% include stats items="7 services|in the first release;;4 designers|on the shared surface;;3 years|of programme, still running" %}

The MVP is the first delivery against a vision that runs well past it.
