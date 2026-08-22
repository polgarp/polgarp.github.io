---
title: "e52 "
categories:
  - Newsletter
tags:
  - Product discovery
  - Product design
  - AI design
---

{% include figure image_path="/assets/images/.jpg" alt="" caption="" %}

# ☕ Assumptions draw the edge of the solution space, and agents draw it tighter

Whenever we start working on a project or on a piece of software, we have some ideas what we are getting into. We believe certain things about who is going to use the thing, how they are going to use it, why we work on this, and how we are going to progress. These beliefs or assumptions set the initial stage.

Holding the wrong beliefs, as in getting assumptions wrong is bad of course, since we fail, the product fails in one way or another. So we usually set out to both declare assumptions and do some testing to manage these risks. We usually start optimistic, so at the beginning we mostly think of reasons on why it will work.

In a good environment, we write with the product team the [list of assumptions]({% post_url 9am26/2023/2023-06-12-Writing-useful-hypotheses %}) we have, and how risky they are. If we are right about these the product will succeed. To account for limited time and resources the usual approach would be to construct tests and experiments to collect evidence about the riskiest of the assumptions. This works, and I've never regretted putting discipline to this.

But what about the things not on the list, we just took for granted?

Recognizing assumptions and collecting some data to make sure what we believe is the right thing is just one side of the puzzle, but **assumptions also bound the [solution space]({% post_url 9am26/2023/2023-06-05-Problem-space-solution-space %}), limiting what results are achievable**. 

Designers and more broadly product teams often fall into this trap, as they believe all problems will be addressed with their solution. Testing is of course right, as it tells us if the solution works and more broadly teaches something about the assumptions we stated. But it rarely talks about the problem space and the deeper assumptions about whether a problem is solvable. Product teams are especially bad at this, since we mostly believe we are already on the right track to solve the problem.

Considering a narrower problem space removes risky solutions. And it also removes things the framing hid, cutting both risky and potentially more innovative ideas.

**We can't test things we haven't even considered**, if they were deeply held beliefs.

I call this kind of belief dogma.

This is the difference between dogma and beliefs. Beliefs got articulated, the team talked about it, wrote it down, argued about it, and made it testable. Dogma has never been stated, but appears in options selected, ideas sketched, questions asked, in the visible shape of the problem. **It's not that a designer believes the answer is the screen, they just open Figma.**

Can't we just think about our beliefs harder? We need a different vantage point from outside of the frame. 

**A longer list is still the same list.** And often we don't even start from our own frame, but one set up by the organizations and structures around us. Figma already decided it thinks in screens even before we opened it.

Testing the riskiest assumption is not enough, if the tests only address beliefs and don't touch dogma. Early in discovery there's no easy way to check if we work on the right problem, good tests should talk about both problems and solutions.

This was the goal of making MVPs, not smaller versions of the product, but telling us about if the problem is worth solving. If a team tests only whether the solution works, it only asks the easier and less useful question.

This is why I also like Teresa Torres's opportunity solution trees. It shows how we need different problem versions, not only different solution versions. As she puts it, a tree that grows deep at the cost of breadth means fixating on one opportunity, one solution, one experiment. 

My worry is that with agents, cheaper depth puts even higher cost to breadth. Running one more experiment against the opportunity we already like is nearly free now. Finding a different opportunity has the same cost as before, while speed on the first solution adds its own tax.

But also if you are building faster, the risks and also this specific risk must be lower? 

Not really, since if we don't know why something failed, we won't know how to change course, even if we learn this faster. **Building more things from the same dogma will lead to the same region in the solution space**, we need to break out of that.

When building was slow, teams spent time thinking, arguing about their assumptions, committing to a direction was an experiment. Dogma had a chance of surfacing in these discussions. A wrong frame cost the team six months, and people were concerned enough to start asking questions early. 

With building becoming fast, we still need to have these arguments, but they need to be more purposeful.

One way we arrive at dogma is the context we are working in, for example the tools we choose. Many designers have been starting their design work in Figma, which defaults work to working with UI elements on screens. This bounds potential solutions into UI, often discounting other interaction methods or even alternative services. 

Another source of dogma is ownership. Teams who have a certain ownership will ignore solutions outside of their domains. The checkout team will find checkout answers and ignore other parts of the user flow. This is where design must think holistically.

Even generating solutions with agents has this. They come up with ideas which are more generic or default solutions to the problem, which limits potential new solutions. 

There is already not-so-surprising research on this. In a crowdsourcing challenge run across a couple of hundred solutions, the ones developed with AI scored higher than the human crowd's on viability and on financial and environmental value. The human ones scored higher on novelty — on average, and especially at the far end. Not worse answers, then. **Good answers with the tail cut off.**

In short, having dogma doesn't necessarily result in bad solutions, but it is also less likely to produce great solutions. This is a major challenge with asking LLMs to assist in discovery.

There are two reasons for it. First, how people often work with agents is already defined by their own dogma. Second, how LLMs answer based on the average of their training data.

Agents can be used to help with common assumptions, opening up new ideas, but average answers also mean the further away we are, the worse answers we get. It shows you the things you almost missed, but for things farther out, you'll need [people in the room]({% post_url 9am26/2026/2026-08-09-Discovery-artifacts-are-vacation-photos %}) to be able to articulate different assumptions, keeping in mind [groupthink]({% post_url 9am26/2025/2025-08-25-Combating-groupthink %}) problems. 

Average is often not wrong, considering [Jakob's law](https://lawsofux.com/jakobs-law/). People spend most of their time with other people's products, so following convention is often the right call and the agent will be right. So narrowing doesn't produce bad work, it'll be defensible work, but stops anything better.

While closer attention doesn't fix this, we need more purposeful argument in the process.

How to get out of it: don't skip the [planning of discovery]({% post_url 9am26/2025/2025-05-26-Discovery-is-more-than-user-research %}), it has to stretch out, so we know what directions to take. In the past when I still worked in an office, we often had project kickoffs at an offsite, or at least in a meeting room to show something new is possible. 

Start with assumptions before you involve the agent, this removes some bias, and also helps you to make better judgement on the agentic output.

Besides planning experiments, also think about opportunities. If you are on your fourth test on the same problem, maybe the problem is not in depth, but in breadth. There is an opportunity cost of running more experiments and going deeper.

For every assumption you have, think not only about confidence, but also think about what other doors the assumption opens. If it's wrong, what other thing would we build instead? Confidence just tells what to test, but this question talks about different opportunities.

Agents make very plausible artifacts, which also keeps us from thinking deeper about our assumptions. This includes also ready-made assumption lists, for which we need a solid ground to pass judgement on.

If you lead designers, testing is not the important part to protect, since testing is getting cheaper now. It's the discussions leading to a test, where team members can ask whether this is the right problem at all. This is not slowing down, but making sure we are taking the right direction.

Agents get us to the same region of the solution space faster, and help us to design better experiments there. But being faster doesn't imply being right more often, if we don't update our beliefs and don't explore our dogmas. 

**Going faster doesn't mean we need less process. It means the parts we used to get for free now have to be paid for.**

### 🚲 Questions to consider

- What did we decide, and what did the tool decide for us?
- Which solutions stopped being candidates before anyone evaluated them?
- How many versions of the problem are still on the board, and when did we last add one?

> This is a post from my newsletter, **[9am26]({% link _pages/newsletter.md %})**, subscribe here:
{% include newsletter-signup.html %}

# 🍪 Things to snack on

[An AI that argues back?](https://udanium.substack.com/p/an-ai-that-argues-back) by **Uday Gajendar**

Describes blindspots as a different type of assumption. While assumptions are known, unverified, and testable beliefs, blindspots never entered the frame at all. A framework to manage these is FADE: facts, assumptions, dependencies and expectations. AI tools can help with blindspots, but relocate them from human cognitive limits to human–AI interaction patterns.

_A blindspot is something else entirely. It's not a belief you're holding loosely. It's a consideration that hasn't entered the frame at all._

<p style="text-align: center;">🀁</p>

[Problem Space and Solution Space](https://solutionspace.blog/2021/10/29/problem-space-and-solution-space/) by **Daniel Mescheder**
 
Formalises what an assumption actually does to the option set. Solutions map onto problems as projections, and narrowing the problem set narrows the candidate solution set. An assumption doesn't make a candidate risky, it deletes the candidate. Also notes the mapping is not continuous, so a small shift in problem framing can move you to a completely disjoint set of solutions.

_Clearly, the narrower we define a subset of the problem space P, the smaller the set of candidate solutions S(P)._

<p style="text-align: center;">🀁</p>

[Introducing the Riskiest Assumption Canvas](https://uxdesign.cc/riskiest-assumption-canvas-73ec0e2e0abc) by **Ioannis Nousis**

A workshop format for mapping assumptions across six themes (customers, problem, solution, MVP, competition, sales channels), then scoring each on probability of being wrong × impact to produce a ranked list for risks. The probability score is "like an inverse confidence rating", so the less confident you are the higher the number.

_Risk = impact × probability._

<p style="text-align: center;">🀁</p>

[Illusory correlation: how to identify your hidden assumptions](https://nesslabs.com/illusory-correlations) by **Anne-Laure Le Cunff**

There is a cognitive mechanism under hidden assumptions, we overestimate relationships between variables where none exist (especially under time pressure), and when we look at events, we only notice the cases where cause and effect co-occur. The key point for this issue is that illusory correlations are powerful because they are easy to rationalise.

_Illusory correlations are powerful because it's easy to rationalise them._

<p style="text-align: center;">🀁</p>

[The Crowdless Future? Generative AI and Creative Problem-Solving](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4533642) by **Léonard Boussioux, Jacqueline N. Lane, Miaomiao Zhang, Vladimir Jacimovic and Karim R. Lakhani**

A circular-economy crowdsourcing challenge with 125 solvers produced 234 solutions, judged across 3,900 evaluator-solution pairs. Human-AI solutions won on strategic viability and financial/environmental value, while human crowd solutions won on novelty, both on average and at the extreme. The loss is specifically at the right tail of the novelty distribution, which the authors attribute to the model aligning with central patterns in its training.

_Human crowd solutions exhibited higher novelty — both on average and for highly novel outcomes — while human-AI solutions demonstrated superior strategic viability, financial and environmental value._

<p style="text-align: center;">🀁</p>

[Evaluating Solutions](https://www.producttalk.org/five-types-of-assumptions/) by **Teresa Torres**

Defines assumptions as beliefs that must be true for an idea to succeed, and gives the five categories for assumptions (desirability, viability, feasibility, usability, ethical).

_It can be hard to see our own assumptions. Oftentimes they are core beliefs that we rarely think to question. It's a bit like asking a fish about water._
