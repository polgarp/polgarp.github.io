---
title: "Murmur"
excerpt: ""
header:
  image: /assets/images/playground/murmur.png
  teaser: /assets/images/playground/murmur.png
---

> a toaster gives advice <br>
> the city is a mirror <br>
> the mirror is the joy <br>


[Murmur](https://murmur-7f0.pages.dev/) creates haikus with a small AI language model directly in the browser.

Built with Astro on Cloudflare, running Qwen3-0.6B in-browser via Transformers.js, with Stripe and Printful for the print-on-demand side.

Besides having fun with the branding details, designing a full experience, and playing with haiku formats, I had the goal to test LLMs in two ways. 

First, how well central ideas translate to individual technical decisions with coding agents. This round I've mostly used Opus 4.5 and 4.6, current frontier models. While generated details are fine or sometimes actually good, the result just lacks the attention to connect execution decisions to the broader vision (with a few interesting exceptions like offering interesitng phrases in the copy) which I'd expect from a motivated human engineer to do. For example a small details is the loading animation which initially was more generic and technical, and needed to more directly follow the mood of the flow. Which just means that attention to details still mostly means human attention is expected.

My second goal was to see how capable an LLM could be in the browser, running on the user's machine in a realistic use scenario. The haiku are mostly good. The model hyperfixates on certain examples (like toasters appear constantly) but it's surprisingly usable for a 0.6B model running client-side.

> toaster hums in the shadow <br>
> while my hands are already on fire <br>
> the past has turned me into a pixel <br>


