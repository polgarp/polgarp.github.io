---
title: "User archetypes with agents at both ends"
date: 2026-02-01
sidebar:
  - title: "Role"
    image: /assets/images/portfolio/canonical-logo.svg
    image_alt: "Canonical logo"
    text: "Lead Experience Designer <br>@Canonical ⊂ 2024 - "
  - title: "Scope"
    text: "Lead the design for the Ubuntu Pro portfolio."
---

Canonical has over 60 deeply technical products, with users ranging from hobbyists running a home server to CTOs running large fleets. Individual teams knew their own users well, through community engagement and plenty of dogfooding. What broke down was **moving that understanding between teams**. It showed up in how sales engaged with customers, and in journeys that didn't line up from one product to the next.

## From one segment to a framework

This looked like a valuable problem to take on, so I picked it up as a side project: working with the marketing team to describe a single audience segment using jobs to be done, and running workshops with senior stakeholders to gather feedback. It gained enough momentum to become a design team project after the first results. We built **a framework for positioning products and measuring how they perform**, which tied user types to the jobs they are trying to do, and those jobs to the product journeys that serve them.

{% include diagram name="archetype-framework"
   alt="A persona panel on the left, outlined in red, feeding two main-job columns. Each column breaks into individual jobs, then user needs, then job to product fit, then the customer journeys of the products that serve it." %}

The scope grew with each stakeholder we talked to, so we looked for an artifact team could start from. Across conversations with 10+ teams the same answer kept coming up: we were missing **a shared description of who we build for**. Sales would know which customers to pursue, marketing could plan campaigns precisely, product managers could write more targeted content, and design would have a clear target.

## Archetypes, not personas

We understood early that classical personas wouldn't work. They get built for one product at one moment, capturing behaviour as a snapshot tied to the context that produced it. Sixty products would leave us maintaining overlapping descriptions of the same person, with no way to reconcile them.

What we needed was **a more generic schema**: an archetype describing behaviour that recurs right across the portfolio, broad enough for several products to share one.

So we built two tiers. Archetypes sit at the top, portfolio-wide and maintained centrally. Underneath, product teams own contextual personas, enriching an archetype with their own detail. **Alignment at the top, detail at the edge**, which stops teams redrawing the DevOps engineer three others have already described.

{% include diagram name="archetype-card-template"
   alt="The layout of an archetype card: name and journey stage at the top, then job titles and a quote, then three columns for main job and day in their life, how to spot and pain points, and push and pull. A footer carries the last updated date and links to the spec and changelog." %}

{% include pullquote text="This had to be a system that evolves as teams learn, not a set of static artifacts that go stale." %}

## Why not just ask a model

The obvious shortcut was to generate them. A model will produce a Site Reliability Engineer instantly and fluently, but a generic one, unattached to our products or our strategy. It averages everything ever written about the role, which is the failure A List Apart named [the cut-n-paste persona](https://alistapart.com/article/beware-the-cut-n-paste-persona/) years ago.

So we set a guardrail to use models as pipeline helpers to work from actual data sources. The pipeline synthesises material we gathered, every claim traces back to a research highlight with a link, and anything extrapolated is labelled as such.

## Five steps and a human gate

Personas decay because new learning never returns to the document once the project is finished. A dozen archetypes across 60 products could not be kept current by hand, so I built them as a repeatable pipeline. **Agents do the gathering, synthesis and publishing, and a person signs off at every gate**:

{% include diagram name="archetype-pipeline"
   alt="Five boxes left to right: gather, map jobs, synthesise, curate, publish. Curate is outlined in red and labelled a human gate. A dashed line returns from publish to gather, marked re-run as we learn." %}

The tradeoff is how we build our own intuition. Synthesising research by hand builds an internal feel for the people you design for, and delegating it puts that at risk. We treated **losing that tacit knowledge as the real danger**, more than any single factual error, which is why people curate at each gate rather than approving a finished draft at the end.

## The loop that keeps them current

The archetypes are now the shared description of our users across the commercial organisation. Sales picked them up first, and we have been building onboarding and training artifacts to bring them further into daily practice. Marketing used them to update battlecards and steer messaging workshops. Product teams start their acceptance criteria, research screeners and contextual personas from them.

{% include diagram name="archetype-refresh-loop"
   alt="Four boxes left to right: teams contribute, agents synthesise, people curate, archetypes update. A dashed line returns from the last to the first, marked refreshed archetypes flow back to every team." %}

Adoption runs both directions, which is what keeps the set current. **A finding in one team reaches every other team.** The archetypes live in internal repos colleagues can read, question and contribute to, and I open-sourced [the pipeline that produces them](https://github.com/canonical/archetype-pipeline) so other teams can run the same approach on their own research.

{% comment %} TODO: link the two-part archetypes blog post here as an additional source, once it clears review. {% endcomment %}

{% include stats items="60+|products in one portfolio;;10+ teams|aligned through discovery;;Sales & marketing|working from one vocabulary" %}

## The part I didn't design for

Everything the pipeline emits is structured, cited and versioned, because that is the only way to produce it repeatedly. That turned out to matter beyond the maintenance problem it was built for. **The properties that made the archetypes maintainable also made them machine-readable**, so a product team can point its own agent at a file we stand behind rather than at a model's guess about who an SRE is.

That leaves agents at both ends of the system. The ones in the pipeline draft and cite, the ones in the teams consume, and **the human gates in between are what make either end trustworthy**.
