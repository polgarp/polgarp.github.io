---
title: "e25 Hypothesis driven design"
categories:
  - Newsletter
tags:
  - Product design
  - Design process
  - 9am26
header:
  overlay_image: /assets/images/.jpg
  overlay_filter: rgba(255, 63, 49, 0.8)
  show_overlay_excerpt: false
---

{% include figure image_path="/assets/images/.jpg" alt=", generated with DiffusionBee" caption=", generated with DiffusionBee" %}

# ☕ Writing useful hypotheses

Hypothesis! Gotta love them. They provide scaffolding to how we think about our process and what we want to achieve. Also, since hypothesis is a term scientist also use, stating one must also mean our team is data-driven, almost doing science.

Well, as it often goes, hearing about, or even using a term doesn't mean it's understood well. Or used the right way. Just writing a statement and calling it a hypothesis, doesn't make it a hypothesis. Much less science. 

I've written earlier how stating a [**design intent**]({% post_url 2023-02-20-Design-intent-describes-what-the-we-set-out-to-achieve %}) helps in articulating shared goals not only for the designer but the whole product team. While hypotheses are great in stating the intent, their role goes beyond, as they give a broader clarity to the product design process.

In the context of product development, a hypothesis refers to a proposed explanation or assumption that can be tested to validate or invalidate a specific product-related idea or belief. While it's use is based on the scientific method, it's more of an inspiration than an actual implementation of the scientific process.

Because of this, the more years pass, the less I like the terms hypothesis (and also assumptions). While they are scientific terminology and carry some similarity, but also people might misunderstand them. So recently I started to use terms like bets and beliefs.

Still, hypotheses are incredibly useful to clarify the thinking of the product team, if defined well. A couple of years ago one of my ex-colleagues, Jonas came up with a pretty neat framework that I've been using since:
- We observe …
- We believe that (assumption) …, because (evidence) …
- If we (do this) …, we’ll observe (result) ...

**We observe…**: First, we start with a business problem. This is something we observe in our systems or in the world that we think is worth solving. 
- Business problems should be understood. If it’s data, there needs to be some exploration what it means, user research to figure out how does it affect our user’s behavior, market research to understand what other companies and the broader industry is doing to address the problem.
- This allows to transform the business problem into something that's connected to what the users are doing, which puts it into the space where product development can do something about it.
- End result should be a list of user problems we identified, connected to the business problems, complied into a single observation statement.

**We believe that (assumption) …, because (evidence) …**: Second, we write a list of hypothesis, beliefs based on what we know at this point. Our knowledge is still not certain. We want to solve the problem, but still need to figure out the right way to solve it and also solve it the right way.
- Beliefs should be about what we think of the user problems and a list of supporting evidence. This is the most important part, as the solutions should be ultimately about solving user problems that drive the right business outcomes.
- Beliefs and evidence might be lacking, which points to more research might be necessary.
- Based on this list we can prioritize which of the user problems we found can we also solve, and seems we can come up with effective ways of solving.
- Based on this list we can clarify the design intent, what is the problem and constraints of the problem we will work with.

**If we (do this) …, we’ll observe (result) ...**: Third, based on the beliefs we can create a list of bets for each beliefs, possible ways that reflects our beliefs and ultimately solves the initial problems.
- Each bet is a possible solution to the users’ problem that we also think would drive the initial business problem.
- Since we don’t know yet which bet has the best potential (in the most rough sense for example impact / effort), we need to learn about each of the bet.
- Sometimes a list of small impact / small effort bets are better than a large one, but usually it should be clear which bet(s) are the most lucrative ones.
- To learn about a bet, further discovery is needed - this mostly means explorations, experiments, anything that lets us learn about the bet and the belief, and helps us prove, we made the right the prediction with the bet.

This structure is also similar to the formulation of Teresa Torres's opportunity solution trees, and gives a high level framework to product discovery and a hypothesis-driven design process.

One way I found the above structure really helpful, how earlier I often struggled on hypothesis writing sessions. It turns out, generating is hard if there is not enough data about the problem space. "Just writing something" in these cases won't lead to useful statements, only to muddy design processes where there is too much obsessive UI detail iterations.

Another way this formulation helps, is that it encourages for more actively looking to disprove the beliefs. Often product teams are focused on progress, validating their ideas fast and start building, rather than looking for signs they might be wrong. By actively looking for evidence and not just justification for beliefs, solution ideas will be less likely become wishful thinking.

I also liked using the terms beliefs and bets, since it allows for a simpler way of teaching hypothesis-driven design to the team. Beliefs highlight how the team might not have enough data, while bets show that outcomes might be uncertain. This fosters culture safer for taking risks, experimenting, making data-informed decisions, and most importantly critical thinking about what the team knows.

### 🥤 To recap
- Hypotheses provide scaffolding and clarity to the product design process, helping teams articulate shared goals and think in a data-driven manner.
- A hypothesis in the context of product development refers to a proposed explanation or assumption that can be tested to validate or invalidate a specific product-related idea or belief.
- A framework for writing hypothesis is "We observe..., We believe that (assumption)..., because (evidence)..., If we (do this)..., we'll observe (result)...".
- This framework emphasizes the importance of understanding business problems, connecting them to user problems, and prioritizing them based on beliefs and supporting evidence.
- Using hypotheses encourages a mindset of actively looking to disprove beliefs, fostering critical thinking, experimentation, and a culture of taking risks and making data-informed decisions.

> This is a post from my newsletter, **[9am26](https://polgarp.com/categories/newsletter/)**, subscribe here:
> {% include newsletter-signup.html %}

# 🍪 Things to snack on

Already at its third edition, **Jeff Gothelf** and **Josh Seiden**'s [**Lean UX**](https://jeffgothelf.com/books/#lean-ux) book is a good way to get started with hypothesis-driven design and product development and is generally a recommended read to product designers. This edition describes the Lean UX process based on the [Lean UX Canvas](https://jeffgothelf.com/blog/leanuxcanvas-v2/). 

<p style="text-align: center;">🁄</p>

I loved **Tal Raviv**'s [**That’s Not a Hypothesis**](https://medium.com/@talraviv/thats-not-a-hypothesis-25666b01d5b4), as it gives a pretty good critique of some of the cargo-cult usage of hypothesis and describes a good way of thinking about them. The most important point is to separate the problem (the objective), the hypothesis (the thing we believe to be true), and the prediction (the thing that will happen). 

<p style="text-align: center;">🁄</p>

[**Thinking your design with hypotheses**](https://blog.prototypr.io/thinking-your-design-with-hypotheses-6d486910d214) is a nice overview of how to formulate hypotheses starting from the scientific process, also showing a good framework. There is also a good discussion on the definition of success, that is what result the teams hopes from the proposed solution.

<p style="text-align: center;">🁄</p>

**Andrew Duckworth** writes about how hypotheses can act as the articulation of intent in [**Hypothesis driven design**](https://grillopress.github.io/2017/12/10/hypothesis-driven-design.html). The simple presumption here is, that most designers are already thinking as if they would have a hypothesis, but as it's not explicit, it's not becoming something to learn from. The article also describes a simple way of working with hypotheses.

<p style="text-align: center;">🁄</p>

One challenge with hypotheses is, that while it's easy to generate more, validating them takes time and resources. This is where **Jeff Gothelf**'s [**The Hypothesis Prioritization Canvas**](https://jeffgothelf.com/blog/the-hypothesis-prioritization-canvas/) helps, as it gives a simple way to decide what to do with each hypothesis. The canvas is a simple matrix around risk and perceived value, and the resulting quadrants are: Test, Ship & Measure, Don't Test. Usually Don't Build, and Discard.

<p style="text-align: center;">🁄</p>

One way to group research activities is how they relate to hypotheses, as **Laura Klein** writes in [**Hypothesis Generation vs. Validation**](https://www.usersknow.com/blog/2011/08/hypothesis-generation-vs-validation.html). Generation happens after collecting data about users and the team has an idea what needs to be done. Validation follows once there is a tangible solution to the problems found that need to be tested in some way.




