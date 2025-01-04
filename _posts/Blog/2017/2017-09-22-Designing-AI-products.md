---
title: "Designing AI products"
categories:
  - Blog
tags:
  - Product design
header:
  overlay_color: rgba(255, 0, 0, 0.8)
  show_overlay_excerpt: false
---

*This story is based on the talk I recently gave on the [UX Budapest Meetup featuring AI topics](https://www.meetup.com/UXbudapest/events/243139012/). Here is [my prezi from the event](https://prezi.com/bn1pvzmeclfu/designing-ai-products/). I’ve added more links and more content here.*

---

AI is the current hype. But what does it actually mean to have an “AI product”, how does this influence the design of the product, and what’s in it for you, a (UX) designer? Even with all the hype going on, I believe AI will have a significant impact on all aspects on how we create products and even what type of products we create.

## What’s leading the AI revolution

In short it’s [machine learning, and more precisely deep learning](https://aminer.org/ai-history), an area of AI where systems are modeled after the human brain. Additional drivers are the available computing power (thank you gamers for the powerful GPUs) and available data (mobile + sensors). There are specific fields that build on this revolution you would meet in products, like robotics, computer vision and natural language processing (NLP).

Also lets highlight, it’s not always clear what counts as AI. Some very basic algorithms working with a large amount of data may be already considered AI by some. I usually refer to AI as a system doing things you’ve not explicitly programmed it to do. This is also one of the more accepted definition of machine learning, but I feel other techniques that may be referred as “intelligent” warrant the same description.

![image-center](/assets/images/2017-09-22-Designing-AI-products.png){: .align-center}

Most of the time we talk now about [weak, narrow or specialist AI](https://uxdesign.cc/you-can-be-an-ai-designer-46a0fd45f47d). Terminator is general / strong AI (or maybe even a superintelligent AI), still far away. Strong AI feels like Sci-Fi at the moment, but all the experience in design we will gather from working with narrow AI products should serve well. [Narrow AI](https://chatbot.fail/) has it’s issues, and most of the time it’s simply due to bad product design and bad development practices. So plenty of opportunities to have a nice impact here.

What was once web-first and later mobile-first, these days is AI-first. Companies scramble to put immense resources into research and development to change into AI-first companies, to have these technologies power their products, the experience and ultimately their business.

![image-center](/assets/images/2017-09-22-Designing-AI-products-google.png){: .align-center}

- [Google](https://ai.google/) strives to be truly AI-first, having projects in hardware, research, experiments, as well as products like Google Assistant or [Google Lens](https://www.recode.net/2017/5/19/15666704/google-lens-key-example-ai-first-computer-vision). They also do their own hardware for machine learning, the Tensor Processing Units, [TPUs](https://ai.google/tools/cloud-tpus/). [PAIR](https://ai.google/pair/) is an ongoing research effort on human-AI interaction.
- Amazon has [Alexa](http://digg.com/2017/amazon-alexa-is-not-your-friend) and [Echo](http://www.theverge.com/2017/4/27/15447834/amazons-echo-look-ai-analysis-concerns), as well as a bunch of [behind the scene](https://www.fastcompany.com/40463313/amazon-promises-good-human-robot-working-relationships-at-first-nyc-fulfillment-center) efforts.
- Facebook: [FAIR](https://research.fb.com/category/facebook-ai-research-fair/) for basic research and product features like [translations](https://www.theverge.com/2017/8/4/16093872/facebook-ai-translations-artificial-intelligence) and [chatbots](https://www.theverge.com/platform/amp/2017/5/15/15640886/facebook-parlai-chatbot-research-ai-chatbot).
- [Apple](https://backchannel.com/an-exclusive-look-at-how-ai-and-machine-learning-work-at-apple-8dbfb131932b): [CoreML](https://developer.apple.com/machine-learning/) as a platform feature, iPhone X’s new [on-device ML chip](https://www.wired.com/story/apples-neural-engine-infuses-the-iphone-with-ai-smarts/), and very much unlike Apple, a blog [dedicated to ML research results](https://machinelearning.apple.com/).
- Microsoft’s [apps](https://play.google.com/store/apps/details?id=com.microsoft.mtutorclientandroidspokenenglish&hl=en) [among](https://www.microsoft.com/en-us/seeing-ai/) [others](https://nautil.us/issue/52/the-hive/your-next-new-best-friend-might-be-a-robot-rp), IBM’s [Watson](https://www.ibm.com/watson/), Salesforce’s [Einstein](https://www.salesforce.com/products/einstein/overview/), or Emarsys’s [AIM initiative](https://www.emarsys.com/en/products/emarsys-aim/).
- Plenty of other results from independent organizations, like [OpenAI](https://openai.com/) whose system owns you in [Dota 2](https://blog.openai.com/dota-2/).
- Amazon, Google, Microsoft, IBM also provide AI (infrastructure) as a Service. Apple provides AI integrated into it’s system and chips. Plenty of other web based APIs and libraries available to experiment with. This means you don’t need to build your own systems, you can use these to quickly create your AI product.

## Products with AI technologies

What is possible with this technology? Some interesting product categories:

- Co-creation products will work with the user to create something together. Like [PianoAI](https://github.com/schollz/PIanoAI) helps you jam together with an AI on your piano
- Assistant products help the user in tasks, automatizing otherwise complicated or time consuming tasks. Like [x.ai](https://x.ai/) or [AhoyAI](http://www.ahoy.ai/) schedules your meetings instead of you.
- Making you smarter by enhancing how you work and think. Like [Writefull](https://writefullapp.com/) helps you to write better sentences.
- And there [100s more apps](https://medium.com/imlyra/a-list-of-artificial-intelligence-tools-you-can-use-today-for-personal-use-1-3-7f1b60b6c94f) and services from personal to business usage…

Any type of functionality which could replace: people’s intuition / experience / tedious work may be a good target for AI, given the sophistication and scale. For simpler problems used in a low scale it’s probably not worth using an AI product due to design challenges and costs.

But to replace these you will need data about them. So a fun activity is to figure out [how you will get (labeled) data](https://thepathforward.io/dos-and-donts-building-ai-startup/) and design for that.

The main feature of AI products is: you don’t just build, also [train your product](http://www.mindtheproduct.com/2017/07/building-products-ai-first-aparna-chennapragada/). Meaning there needs to be a better understanding on the users (or even more generally the people) to create successful products.

## Challenges with designing for AI

The biggest challenge: everybody gets a different product. That is a product trained for just that person or with less sophistication for a group of persons, not just content personalisation based on a segment.

![image-center](/assets/images/2017-09-22-Designing-AI-products-ad.png){: .align-center}

### Conserving

You may have noticed that once you search for a specific product, ads will follow you around the net whether you bought the item or are not even interested anymore.

Learning from [past data](http://reallifemag.com/instant-recall/) also conserves knowledge. This is a though issue to solve, as you need to really understand humans and how they function to be able to design for useful prediction, say for example after somebody bought a nice outdoor jacket, they may wanna get an outdoor shoe.

![image-center](/assets/images/2017-09-22-Designing-AI-products-photos.jpg){: .align-center}

### Bias

When Google Photos came out, it’s image recognition features were pretty awesome. With some “minor” hiccups, like how it misclassified black people as gorillas, which is deeply offensive to say the least. The issue was, that the algorithm was trained on mostly white people, so there was a huge bias included.

[Your](https://www.wired.com/story/machines-taught-by-photos-learn-a-sexist-view-of-women/) [data](https://medium.freecodecamp.org/why-we-desperately-need-women-to-design-ai-72cb061051df) [is](https://www.recode.net/2017/7/13/15967456/women-tech-business-sexual-harassment-discrimination-trump-catriona-perry) [biased](https://joanna-bryson.blogspot.hu/2017/07/three-very-different-sources-of-bias-in.html). One of the most important factor of designing for AI tech is how we handle data bias. As Conway’s law states organisation are only capable to produce software that mirrors them, so design teams should be as diverse as their potential user base. AI’s inherent mechanics magnify this issue. The same goes for collecting data, the organization’s biases will be included in the collected data’s bias, if left unchecked. Many of the bias issues present when working with AI tech is similar to the issues designers face when we create products.

![image-center](/assets/images/2017-09-22-Designing-AI-products-youtube.png){: .align-center}

### Error levels

When YouTube started to show ads from big brands next to hate speech videos, it wasn’t an acceptable error, as it threatened to seriously hurt their business.

Due to the nature of how AI’s are deployed, such errors will be present. You have to plan for your [acceptable level of error](http://www.nesta.org.uk/blog/err-algorithm-algorithmic-fallibility-and-economic-organisation). AI’s scale will magnify this issue.

![image-center](/assets/images/2017-09-22-Designing-AI-products-elite.png){: .align-center}

### Surprising things

Elite’s designers were quite surprised, and not really pleasantly when they realized that the in-game AI could produce weapons they never intended to be included in the game. I’m guessing the players were not really amused.

You will have a hard time figuring out [why an AI system does what it does](https://www.technologyreview.com/s/604087/the-dark-secret-at-the-heart-of-ai/) sometimes [we don’t understand](http://asia.nikkei.com/Tech-Science/Tech/Ben-Horowitz-worries-about-who-will-debug-artificial-intelligence) how it works. May have a significant impact on the UX, surprising users is usually not good sign. We want a product to also follow user’s mental models, and surprising AI behaviors will affect this. Probably not into the right direction.

![image-center](/assets/images/2017-09-22-Designing-AI-products-responsibility.png){: .align-center}

### Responsibility

This is the [trolley](https://www.wired.com/2017/03/make-us-safer-robocars-will-sometimes-kill/) [problem](http://moralmachine.mit.edu/), a way to think about moral issues in self driving vehicles. Even if these cars will be safer, there will be a point in time, when the car will have to to decide whom to kill. In the example is it the pregnant women with the man or the man with the thief with the sack of money. Once such a decision is made, there needs to be an understanding who is responsible in the incident. Is it the original designers, or the owner of the car who input their own data?

Responsibility for AI’s decisions is unclear, so plenty of ethics questions, like the trolley problem or [misdiagnosis in healthcare](https://qz.com/989137/when-a-robot-ai-doctor-misdiagnoses-you-whos-to-blame/). In non-AI medical products the manufacturer clearly takes the blame, as design flaws can be discovered after an incident. Learning technology learns from available data too, so data mistakes can make the designers responsible and also the user. And then there is also the point of: learning systems make different mistakes than humans. If the doctor does the diagnosis, even with the support of an AI assistant it’s still his call.

---

Ultimately it boils down to this: designers of such systems will need to be prepared on how to tackle these issues and still keep focusing in the users. There was a great quote on last year’s [Amuse conference]({% post_url Blog/2016/2016-10-11-amuseconf-2016-impressions %}) on this:

> Algorithmic cruelty is the cruelty of the design team. — Giles Colborne

## AI product design

In a way, designing products with AI tech is very similar to traditional product design. But the design approach also needs to address the specific challenges.

### Interaction styles

Interaction styles, like direct manipulation or wizards are way of describing and modeling how the system should behave in relation to the user. With AI technologies, new interaction styles should be created, as the system can behave in a much more complex way. These [behavior models](http://uniform.net/blog/june-2016/designing-with-ai/) or interactions styles are pretty useful when defining what should be the basic approach of a system in relation to the user.

![image-center](/assets/images/2017-09-22-Designing-AI-products-google-butler.jpg){: .align-center}

The Butler. The [Roomba](http://www.irobot.com/For-the-Home/Vacuuming/Roomba.aspx) an automatized vacuum cleaner is a great example for the butler, the type of AI that will more and more bland into our home and surroundings. The Butler helps the human in tasks, executing commands automagicaly. It doesn’t need detailed command and control. It has little or no UI, so has to be designed for all possible contexts. It chooses within it’s task independently from the user.

![image-center](/assets/images/2017-09-22-Designing-AI-products-google-police.jpg){: .align-center}

The Police. The [Bonjour Smart Alarm Clock](https://www.kickstarter.com/projects/1450781303/bonjour-smart-alarm-clock-with-artificial-intellig) has quite a few features, but in the end it will wake you, whether you like it or no. The Police guides the user to specific outcomes, even preventing some choices. Maybe it enforces rules for environmental considerations, or for example when a car doesn’t start when trying to drunk-drive. It makes choices instead of the user.

![image-center](/assets/images/2017-09-22-Designing-AI-products-buddy.png){: .align-center}

The Buddy. [Chef Watson](https://www.ibmchefwatson.com/) is a nice app from the Watson team, that helps you to cook as cooking alone is not that fun. The Buddy complements and augments the human’s work. The choices remain with the user, it only suggests options.

### Working with machine learning

[Googlers created this framework](https://medium.com/google-design/human-centered-machine-learning-a770d10562cd) that helps to focus on the user while working with machine learning. These guidelines help on how to set up the design flow, and also provide insights on how not the get derailed by the technology.

- Don’t expect machine learning to figure out what problems to solve. Having the technology is nice, but it doesn’t lead to a (good) product. Ideas have to come from basic human needs that’s to be researched.
- Ask yourself if ML will address the problem in a unique way. Using AI for AI’s sake is dumb. Plenty of problems worth solving doesn’t need AI. Good design is as little design as possible and sustainable.
- Fake it with personal examples and wizards. AI systems are hard to prototype, since experiences are based on unique data (the user’s). Wizard of Oz and similar methods for testing rule.
- Weigh the costs of false positives and false negatives. Both can be bad — depending on your context. You need to understand consequences for the users, and how do the results affect their decisions.
- Plan for co-learning and adaptation. Evolve the system with the user’s mental model. There is a feedback loop based on the interactions, build on it, should be a designed experience.
- Teach your algorithm using the right labels. Instead of wireframes to define the systems, you have to label the good way for the systems to behave. Design the way to get the labels.
- Extend your UX family, ML is a creative process. Collaboration is the key, as lot’s of experimentation is needed, engineers need to understand the user’s context.

## UXers in an AI world

One frequent discussion point around AI is how it will change the job market, how it will automatize most white collar work. This will also impact designers, especially those among us who do simpler design work, like creating webpages. I still believe that there is a place for UX designers in the future, but we will need to learn on where to focus our skills.

- Understand human needs, identify problems to solve, make sure there is no bias in the data.
- Focus on the user, design how the data is gathered, design the interactions, and work with algorithms instead of code.
- Less visual, more human.

---

## Some links for further reading

- [https://www.youtube.com/watch?v=WSKi8HfcxEk](https://www.youtube.com/watch?v=WSKi8HfcxEk): While examining the proliferation of AI tech and it’s effect on society from a more broader perspective, as every Kurzgesagt video, this one is also pretty fun.
- [http://aiplaybook.a16z.com/](http://aiplaybook.a16z.com/): Awesome introduction / overview / source on all topics AI by the VC firm Andreessen Horowitz.
- [http://algorithms.design/](http://algorithms.design/): Good collection of links for designers on algorithmic and AI tools by Yury Vetrov.
