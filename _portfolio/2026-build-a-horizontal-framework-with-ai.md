---
title: "User archetypes as agent context"
date: 2026-02-01
sidebar:
  - title: "Role"
    image: /assets/images/portfolio/canonical-logo.svg
    image_alt: "Canonical logo"
    text: "Lead Experience Designer <br>@Canonical ⊂ 2024 - "
  - title: "Scope"
    text: "Lead the design for the Ubuntu Pro portfolio."
---

Canonical has over 60 deeply technical products, for users ranging from hobbyists with a home server to CTOs running large fleets. Individual teams understood their own users well, through community engagement and plenty of dogfooding. What broke down was **moving that understanding between teams**, which showed up when sales engaged with customers and journeys that didn't line up across products. 

## From one segment to a framework

No one had asked for this. It looked like the most valuable problem I could reach, so I picked it up as a side project: working with the marketing team to describe a single audience segment using jobs to be done, and running workshops with senior stakeholders to gather the data. It worked well enough to become a funded project team, building **a framework for positioning products and measuring how they perform**.

The project could have sprawled, so we looked for the leverage point. Across conversations with 10+ teams, one artifact kept coming up: **a shared description of who we build for** would help the widest range of them. Sales would know which customers to pursue, marketing could plan campaigns precisely, product managers could write more targeted content, and design would finally have a clear target.

{% include diagram name="archetype-framework"
   alt="A persona panel on the left, outlined in red, feeding two main-job columns. Each column breaks into individual jobs, then user needs, then job to product fit, then the customer journeys of the products that serve it." %}

## Archetypes, not personas

Personas usually describe a job title. I designed the system around **behaviour instead**: an archetype is a pattern of motivations, pressures and workflows that recurs across research participants, which is what lets one description hold across a portfolio this wide.

That made a two-tier system possible. Archetypes sit at the top, portfolio-wide and maintained centrally. Underneath, product teams build contextual personas by enriching an archetype with their own detail, owned by the team using it. **Alignment at the top, detail at the edge**, and nobody redrawing from scratch the DevOps engineer three other teams already have.

{% include diagram name="archetype-card-template"
   alt="The layout of an archetype card: name and journey stage at the top, then job titles and a quote, then three columns for main job and day in their life, how to spot and pain points, and push and pull. A footer carries the last updated date and links to the spec and changelog." %}

{% include pullquote text="This had to be a system that evolves as teams learn, not a set of static artifacts that go stale." %}

## Why not just ask a model

The obvious shortcut was to generate them. A model will produce a Site Reliability Engineer instantly and fluently, and it will describe nobody we actually serve. What comes back is an average of everything ever written about the role, the failure the industry named the cut-n-paste persona long before any of this tooling existed.

So the constraint was that **the model never gets to be a source**. It synthesises material we gathered, every claim traces back to a research highlight with a link, and anything extrapolated is labelled as extrapolation.

## A pipeline, not a write-up

Personas decay because new learning never makes it back into the document. So I built the archetypes as a repeatable pipeline instead, five steps with **a person signing off at every gate**:

{% include diagram name="archetype-pipeline"
   alt="Five boxes left to right: gather, map jobs, synthesise, curate, publish. Curate is outlined in red and labelled a human gate. A dashed line returns from publish to gather, marked re-run as we learn." %}

The honest cost is intuition. Synthesising research by hand builds an internal feel for the people you design for, and delegating it puts that at risk. We treat **losing that tacit knowledge as the real danger**, more than any individual factual error, which is why people curate at each gate rather than approving a finished draft at the end.

## The loop that keeps it honest

The archetypes are now the shared description of our users across the commercial organisation. Sales picked them up first, and we have been building onboarding and training artifacts to bring them further into daily practice. Marketing used them to update battlecards and steer messaging workshops. Product teams start their acceptance criteria, research screeners and contextual personas from them.

{% include diagram name="archetype-refresh-loop"
   alt="Four boxes left to right: teams contribute, agents synthesise, people curate, archetypes update. A dashed line returns from the last to the first, marked refreshed archetypes flow back to every team." %}

Adoption runs both directions, and that is what keeps the set honest: **a finding in one team stops dying in that team's notes**. The [pipeline and a set of example skills](https://github.com/canonical/archetype-pipeline) are open, so anyone can trace a claim, disagree with it, or build on the work.

{% comment %} TODO: link the two-part archetypes blog post here as an additional source, once it clears review. {% endcomment %}

{% include stats items="60+|products in one portfolio;;10+ teams|aligned through discovery;;Sales & marketing|working from one vocabulary" %}

The wider lesson was about agents, not personas. They are only as good as the context and process you give them, so **maintained, sourced knowledge with human oversight is now a requirement**, not a nice-to-have. The archetypes became exactly that: a foundation other teams point their own agents at, instead of each guessing at our users from scratch.
