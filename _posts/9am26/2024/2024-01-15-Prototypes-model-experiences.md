---
title: "e40 Prototypes model experiences"
categories:
  - Newsletter
tags:
  - Product design
  - Design practice
  - 9am26
header:
  overlay_image: /assets/images/2024-01-15-Prototypes-model-experiences.jpg
  overlay_filter: rgba(255, 63, 49, 0.8)
  show_overlay_excerpt: false
---

Since we design interactive systems, prototypes are the most important artifacts we can produce in our work. Prototypes expand what we can create, model the real experience, and allow faster learning.

{% include figure image_path="/assets/images/2024-01-15-Prototypes-model-experiences.jpg" alt="A model car parking in a real town, expressionist digital art, generated with DiffusionBee" caption="A model car parking in a real town, expressionist digital art, generated with DiffusionBee" %}

# ☕ Prototypes model experiences

(With InVision closing doors, I thought it was a good idea to look at prototyping, as it was one of the first tools that offered quick design-to-prototype capabilities for many of us. The few years I've been using InVision solidified some of the ideas I'm focusing on in this episode.)

Maybe this is familiar. The designer presents the new screens proudly. Things are sleek. But as soon as the team starts to ask questions it's apparent the details are not that well-thought-out after all, it's unclear what happens when the user does certain actions and what the overall experience will look like. The screens the team and the designer looking at just don't contain enough details to imagine the full experience.

An inherent challenge of designing software is the gaps between the output of our tools, what software is capable of, and what the users will experience. 

If we use vector drawing software (like Figma, Sketch, or pretty much most design tools), the tool itself will determine the limits of what we are capable of designing. It pushes us to create a system made of single screens, connected by links and actions. The issue is that we try to create interactive software, and what we can create this way is fairly limited compared to what software is capable of. We are cutting off large parts of the solution space. Designing in code solves this, but introduces efficiency trade-offs most projects can't budget for.

Also, what we are designing will be always just a model of the experience. Since all models are lying, but some are useful, we want to create useful models, which often means more closely approximating what the users will see. Having a clear idea of what the users will see helps us to learn more (and has other benefits, like communicating ideas, figuring out further problems, etc.). So there are trade-offs to consider, how much time we spend on creating something close to the experience and how much we learn.

To cover both of these gaps, thinking in prototypes is more useful for product designers than thinking in screens. 

Prototypes come in all shapes and forms. On an abstract level, almost everything we do is a prototype (like the first version of an interview guide, the first sketch we draw, and the first line of code we create). Everything we do simply approximates the next iteration we intend to do. Prototypes are a way to try out something to see what we will need to change later. We create them to learn something, so prototypes (just as all artifacts) should have a clear reason for being.

Prototypes in product design are usually things we create to simulate what the users will experience. Designers might be stitching together screens and adding transitions and simple animations to make things more real. How real the prototype gets is usually described as fidelity, how close the simple thing is to the real thing.

A common confusion is to describe high-fidelity as something more visual (sketch vs finished UI) and maybe as something more interactive (static screens vs full interaction). But fidelity can refer to a few other attributes of a prototype, like how close the copy is to the final one, how real the content is, and how good is the performance (both speed and AI apps accuracy). A hi-fi prototype focused on experience might not be something that looks visually ready. This also means most prototypes don't need to be pixel-perfect.

Figuring out the right fidelity (besides making the right trade-offs on how much time and effort to spend on a prototype) also helps in thinking about what is the necessary level of interaction in a prototype. There will always be a difference between a prototype and a real product, so what is the acceptable level of what we want to learn is the key question to answer.

So why thinking in prototypes is more useful for product designers than thinking in screens? 

For the experience gap, the advantage is clear. Getting closer to the real experience helps uncover issues in the flow, enables better rendering of the intent, allows for easier communicating ideas, and makes for better usability testing. So in short speeds up learning and increases confidence.

For the interactivity gap, prototypes help to imagine more than what's readily visible on our screens, getting ideas and inspiration beyond the immediate rectangles on the screen. While we might use the same design tools with their limitations, working toward a prototype rather than a screen allows us to imagine more and deeper interactions. 

### 🥤 To recap

- Traditional design tools like Figma and Sketch set a barrier to what is easy to design, as they focus on individual screens rather than the overall user experience.
- Prototypes offer a more realistic representation of the user experience, allowing for better identification of usability issues, clearer communication of ideas, and more effective usability testing.
- High-fidelity prototypes do not necessarily need to be visually polished; the focus should be on accurately simulating the user's interactions and experience.
- Prototyping encourages exploration beyond static screens, enabling designers to envision more complex and engaging interactions.
- Thinking in prototypes rather than screens empowers designers to create more user-centered and innovative products.

> This is a post from my newsletter, **[9am26](https://polgarp.com/categories/newsletter/)**, subscribe here:
> {% include newsletter-signup.html %}

# 🍪 Things to snack on

While **Todd Zaki Warfel**'s book,  [**Prototyping**](https://rosenfeldmedia.com/books/prototyping/) is dated for the tools introduced, there are a few great chapters for getting into prototypes, understanding the overall mindset, and getting some good tips. And to be honest, paper and Keynote are still good ways to do a lot of the prototype work. 

<p style="text-align: center;">🁍</p>

Prototypes are a way to learn, as **Jared Spool** writes in [**# Exploring the Problem Space Through Prototyping**](https://articles.centercentre.com/four_phases_prototyping/). This is a key difference between mockups (used to show a possible solution), as prototypes explore the problem we are trying to solve while designing. This also shows how prototypes are not that valuable if they are created, but not used for measuring, using the prototype as an instrument to understand how the design performs. 

<p style="text-align: center;">🁍</p>

With Basecamp's sort of unique approach to product development, it's interesting to see how prototypes fit into their process. In [**The Fidelity Curve: How to weigh the costs and benefits of creating UI mockups**](https://medium.com/signal-v-noise/the-fidelity-curve-weighing-the-costs-and-benefits-of-interface-design-mockups-b259634807e2), **Ryan Singer** writes about the trade-off between getting more confidence and taking the time to build. If confidence gained from building a proto is similar to the time it takes to build (compared to creating something in real code), it's better to go create in real code. This highlights the inherent challenge with prototypes too, the closer they simulate the real experience, the closer the effort is to just creating the real thing.

<p style="text-align: center;">🁍</p>

[**4 Powerful Ways to Use Rapid Prototyping to Drive Product Success**](https://www.producttalk.org/2018/01/rapid-prototyping/) is a nice short overview of how prototypes help the overall product design process by **Teresa Torres**. Besides the obvious usability testing, prototypes also help you think, answer questions, communicate, and make better decisions.

<p style="text-align: center;">🁍</p>

While fidelity is often described as an attribute of prototypes, it's rarely useful if we want to use prototypes to test how an idea will perform. [**Prototype for a story-of-use, not fidelity**](https://uxplanet.org/prototype-for-a-story-of-use-not-fidelity-f931bf8ceab1#.qhx4g8cyk) by **George Abraham** explores this idea, and gives some nice arguments how focusing on experience instead of fidelity allows for more efficient prototyping.