---
title: "AI and clarity of intentions"
categories:
  - Blog
tags:
  - AI design
  - Automation
  - Idea
  - Product design
header:
  overlay_color: rgba(255, 63, 49, 0.8)
  show_overlay_excerpt: false
---

While working on my side project, [Tilecraft](https://polgarp.com/tilecraft/) I've been thinking a lot about the rendering of intentions, and how they influence the outcomes in vibe-coded software.

Obviously just telling a coding tool to go and build something is not enough to solve any kind of real problem, there needs to be a clear intention. On the highest level, there should be a clear goal. As a thing gets built, the solution space gains more granularity and the rendering of intention (translating what you want into something concrete) should infuse each of the decisions. Rendering the intention also updates how we think about the initial intention, creating the iterative nature of design. 

In the case of Tilecraft I had a clear high level intention (create a tool to explore pattern making), and a fairly well described solution space (in the form of a book describing each of the pattern operations). But even in this case, a lot of the finer interaction details (like canvas navigation, the drag and drop interactions of the pipeline or the snapping on the controls) needed a lot of back and forth and multiple iterations. Seeing the interactions in action also helped me to better understand what a pattern making tool should do.

But intention is just half the equation. Using a coding tool well is not just about having clear intentions, it's also about how the intention gets rendered into a concrete thing. The tool sometimes needs us getting into the weeds and creating very specific examples or definitions it can absorb. Intention sets the direction, but we also need to update it to make progress. Like I needed to have almost specification-like descriptions for some of the geometric transformations, to get the outcomes I was after

Product design boils down to two main activities: creating a shared intention and rendering the intention. AI tools can definitely help in [some of the activities]({% post_url Blog/2025/2025-10-28-AI-lacks-intentionality %}) supporting these.

As AI tools are getting better and better at rendering intentions, there will always be parts where someone needs to craft things by hand. Like creating core primitives of a visual language, writing an important library for the code base, or making sure a user flow is coherent. The Pareto principle applies: 80% of the experience gets done much faster by an AI tool, but the remaining 20% will need a systematic design effort. **That's precisely where clarity of intention matters most.**

Creating a shared intention is still not something these tools can do well. Even in a small team, getting the right understanding of the problem space (even if research is sped up), and developing a shared intention takes effort. People need to watch the same TV channel, so to speak, to be able to create things that fit together. 

With Tilecraft, I didn't even need a shared intention, but clarifying my own intentions took time. In creating a shared intention both "shared" and "creating intention" are both important and hard parts, and AI tools don't solve these fundamental challenges of design.

Some shared intention can be developed while working on the project, we understand the problem space as we work on the solution space. But initial assumptions about the problems limit the solution space, plus the almost ready feeling of the output also makes it harder to step back and restart with a completely new approach.

So to make sure we do have a clarity of intention, we need to approach the outcomes of vibe-coded software with extra mindfulness. External validation (like usability testing) gets even more important. We will need new ways to treat "almost done" prototypes as "barely 10% there" products. The speed of AI-generated output can trick us into thinking we're further along than we are. Slowing down to question whether the output matches the intention (not just whether it looks finished) is a real skill to be developed.