---
title: "How I ended up fine-tuning a language model"
categories:
  - Blog
tags:
  - AI design
  - Side project
---

Fine-tuning a language model for your own purposes is easier than it has ever been. The technical side is a couple of hours of understanding and a few minutes of compute. While your friendly neighborhood agent handles most of the process, it needs some babysitting and course corrections.

Agents won't solve some of the meatier parts, however. Knowing what you're trying to make, and being able to tell whether you got there. Both are design problems.

## Nobody makes small models any more

[murmur](https://murmur.polgarp.com) is a haiku generator with a t-shirt shop attached. You type a situation, a small language model writes you a haiku, and you can put it on a shirt. The model runs in your browser rather than on a server, so it runs locally, does no data-center inference, and has a relatively small download.

I started the next iterations, since the haikus weren't interesting or diverse enough. My assumption was that some time had passed, so there was probably a newer and better model, and while I was in there I could improve prompting too.

**That turned out not to be true.** We ran nine configurations of three models against the same topics. Most of them failed to keep even the basic format.

Worse, the new releases were all trending up in size, which bumped straight into the constraint I had. A browser app can't ask you to download gigabytes before it says anything:

| model | released | download |
|---|---|---|
| LFM2.5-350M | Mar 2026 | 258 MB |
| SmolLM2-360M, the base murmur uses now | Oct 2024 | 273 MB |
| **murmur's fine-tune** | **Aug 2026** | **312 MB** |
| Qwen3-0.6B, what murmur used to ship | Apr 2025 | 570 MB |
| Qwen3.5-0.8B | Feb 2026 | ~600 MB |

I didn't want to go for larger models because of the size constraint. And the reason they are that big is that small stopped meaning small. Qwen3.5's 0.8B includes a vision encoder. A wry English haiku generator doesn't need that many model features. Meanwhile Gemma 3's 270M was dropped rather than replaced, and what still gets published in the 200–400M range is fine-tuned for narrow jobs with small target spaces, like function calling, classification and extraction.

**So that tier is a fine-tuning tier** rather than a prompting one.

That makes fine-tuning the next thing to try, instead of a better model and better prompting. It's not complicated at my scale, and the agent takes care of the execution. But you do need a general understanding of the process, which takes a couple of hours, learning to do it yourself would take weeks.

## The corpus is where the voice gets decided

Fine-tuning is simple: you show the model a few hundred examples of what you want, and it adjusts its own weights so that becomes its default, rather than you describing what you want each time. It needs input data, and that data is also where the judgement lives.

I used Claude Code with Opus 5 to do the finetuning. The frontier model wrote the candidate haikus, since it can work from a much more sophisticated brief than the small model in the browser.

Then every candidate needed reviewing by hand. I reviewed 688 haikus over nine batches, each taking 20-30 minutes.

{% include figure image_path="assets/images/2026-08-15-finetuning-curation.png" alt="The curation tool showing one haiku about a job interview, set large in Space Grotesk with the syllable count of each line in the margin. It is marked CUT in red, and a note underneath reads 'the cut in the last line is not super inspiring a bit nihilistic'. A dashed box at the bottom restates the voice rules." caption="The curation tool, on batch 01. One haiku at a time, with the syllable count in the margin and the voice rules pinned at the bottom. The review notes are the input to the prompt for the next batch." %}

The keep rate went **57%, 70%, 79%**, and then sat between 85% and 98% for the rest of the project. I'm probably not the most mindful chooser, but generally would select in a consistent way. The batch approach also allowed me to find the method and dimensions for good coverage, so the first rounds were more explorative.

I'd described the tone at the start as wry, urban, nerdy, satirical, which was true and completely insufficient. Batch 01 came back technically competent and reading like one long sigh:

```
where do you see yourself
in five years — I look up, past
his head, at nothing
```

My note on that one was "the cut in the last line is not super inspiring a bit nihilistic". That can be translated to a more concrete rule, point the cynicism at systems and warmth at people. Institutions, software, landlords and corporate language get the cynicism. Friends, animals, strangers being briefly kind, and small physical pleasures get the warmth. 

Then the correction overshot, and batch 02 came back legible and dull:

```
keys, phone, wallet, keys
I check the same pocket
four times. we leave late
```

That's an anecdote with line breaks. So image versus explanation became another test to evaluate against.

I ended up with nine rules like that, informed by the judgement rounds. This is how an explorative approach was helpful, these couldn't have been written in advance, because the difference between wry and bleak only becomes visible when you look at forty examples at once.

**On timescales**: generating a batch takes minutes, training takes minutes, and curating to a taste standard takes hours for each round. The whole project ran over five evening sessions, and most of that was me reading. As a general takeaway, plan timeframes around human availability rather than compute. Judging haikus also gets tedious, so even in focus time I took a lot of breaks and read other stuff to reset.

## The metrics measured shape, I was judging sense

To steer finetuning you need a measurement, and I had no obvious one for "is this a good haiku". So the agent built a suite of proxies: three lines or not, syllable shape, is it about the topic that was typed, does it repeat itself, how often does it open with "the" (which was a weird artifact of early batches).

Then we did a bakeoff between models, and I judged 96 generations blind, with no indication of which model wrote what.

| | the metric suite said | I said |
|---|---|---|
| Qwen3-0.6B | 61% on topic, 98% three lines | **25% keep** |
| SmolLM2-360M | 70% on topic, 98% three lines | **19% keep** |

The numbers track, the model did produce three lines almost every time, and on topic about two thirds of the time. Those are just not the properties that decide whether a haiku works. Three lines, syllables, topic words, repetition: all countable, and all of them about form. What I was judging was whether the thing made sense. Of the seventy notes I wrote in that round, fifty-one were about coherence, and none of those is countable.

So I ran the test that should have come first: do these metrics separate the haikus I kept from the ones I cut? Nearly six hundred labelled judgements were sitting there to check against. We tested the six metrics we had, and the best scored 0.58 at telling a keep from a cut, where 0.5 is a coin flip and 0.7 would be a reasonable bar.

"Opens with the" is the clearest case. The agent spent four rounds driving that number down because it was trivially countable and produced a result. It turns out to run backwards, my cuts open with "the" more often than my keeps do. It only stopped when I read a report and said the cut in the third line mattered more.

There's a name for this, the McNamara fallacy: measure what is easy to measure, then treat what you couldn't measure as if it didn't matter. A suite of proxies is an efficient way to commit it, because every one of them returns a number on demand.

**A metric that can't separate your keeps from your cuts isn't measuring quality**, whatever else it happens to be measuring. Validate it against your own judgement before you let it steer anything.

## Two settings, tuned against the wrong thing

Once I revised the metrics, decoding remained the knob to tune against a real judgement, that's how the model picks its next word.

We set the temperature to 0.8 earlier to optimize topicality. So I generated the same topics at four settings and judged them blind:

{% include figure image_path="assets/images/2026-08-15-finetuning-blind-ab.png" alt="The same tool in blind A/B mode, showing a generated haiku about morning coffee reading 'the coffee is hot / I take it. it is not hot / I do not know why', with keep, borderline and cut buttons and nothing indicating which model produced it." caption="The same tool in blind mode, comparing four decoding settings. Variants are interleaved and stripped of labelling to help fair comparison." %}

| | keep rate |
|---|---|
| temperature 0 (greedy) | 31% |
| **temperature 0.4** | **50%** |
| temperature 0.6 | 28% |
| temperature 0.8, where we started | 19% |

Later rounds pushed lower still. 0.3 scored 79% on the first set of topics and stayed ahead when I pooled every round after, and then swapping how the sampler trims its options, `min_p` instead of `top_k`, added roughly another 30 points.

**These two took the model from 19% to around 70%**, with no retraining and download size staying the same.

So it pays to play with the settings early. A decoding sweep takes minutes where a batch of corpus takes hours, and I ran them in the wrong order: 0.8 was set once, against the metrics that turned out not to work.

## What the corpus actually bought

Going into this I assumed that more data equals better results, but that turned out to be wrong.

**Corpus size does nothing measurable.** I trained on 114, 228 and 455 examples, and scored all three against the same set of topics. None of them was significantly better at staying on topic than the smallest. More examples did improve the form, the three lines and the syllable counts, but the form was already at 98% accuracy.

**Nor does more variety.** Blind judging had shown certain topics were failing almost every time, while others almost always worked. So a whole batch of 104 haikus tried to improve this. But testing against fresh prompts, it moved nothing.

**And a well-written prompt ties the fine-tune.** Beating my old bad prompt proves very little, so we re-ran the original setup with a better written one and put it against the fine-tuned model, blind, on identical topics. 57% against 50%, which is close enough to be a tie.

So what did 688 curated haikus buy? Not better haikus. They bought the voice, plus half the download and a tenth of the wait in generation speed. The prompted model passes "is this a good haiku" while producing generic workshop poetry, just not my target _murmurs_.

Which also proved to be the limit of my own judging. The main metric has been the keep rate, which guided other questions in this project. But it also measured a different question, whether a haiku is good, not whether it's a murmur.

## Small models repeat whatever you hand them

The old prompt ended with an instruction to think of a toaster giving advice, gravity filing taxes, your inbox growing teeth, these were supposed to give more flavor and create interesting output. However, a model this small can't tell "here is the style I mean" from "output this", so in the test thirteen of fourteen generations echoed those images back, two of them as verbatim copies of the example list, on completely unrelated topics.

Replacing them with blander examples didn't fix it either, it moved the echo onto the new words. Prompting a small model is handing it vocabulary to repeat, while a prompt has to contain some words. That's the argument for fine-tuning stated as a measurement rather than a preference, and it explains why every richer system prompt we tried on the fine-tuned model made things worse. Telling a 0.6B model not to do something doubled how often it did it.

One more thing only reading caught: phrases like "we both know" turn up constantly, and the model reaches for one of its eight rhetorical moves three times as often as the corpus does. Neither is a defect in any single haiku, which is why no metric could see it: this can be seen when looking at a larger set. I noticed because I had read hundreds in a row. There's an experience tradeoff here for showing something nice to a single user, while being aware that on scale patterns will show. This is also a general problem with LLM output.

These models are very good at executing, and what they execute is exactly what you told them. So your intention matters, and so does how you express that intention with the tools you have.

## What shipped

SmolLM2-360M with a LoRA fine-tune, exported and quantized to 312 MB against the 570 MB the site used to ship. It loads in about 2.5 seconds and writes a haiku in about 1.4s, where the old path took over 14s. It runs entirely in your browser, so there's no server, no inference cost, and nothing leaves your device. The model is also [published openly](https://huggingface.co/polgarp/murmur-360m), basically my taste for murmur compressed into an LLM model.

```
monday                monday arrives in the
                      same place, at the same time
                      I know it by heart

doomscrolling         doomscrolling, I say
                      it is the thing that happens
                      when you have not done it
```

Still not perfect, about a third of generations are worth keeping. So, the "Generate another" button is part of the expected experience.

## What I'd tell a designer starting this

**Lean on your agent for technical questions, but verify and push back.** Agents are pretty good at exploring options, but can box themselves into technical decisions that don't make sense after all.

**Validate your metric against your own judgement before you let it steer anything.** If it can't separate your keeps from your cuts, it isn't measuring quality.

**Tune the cheap knobs first.** Two decoding parameters were worth more than 600 curated examples.

**The corpus buys voice, not competence.** Work out which one you're short of before you spend a week on it.

The reason I think designers should try to finetune their models (beyond it being interesting), is that all of the above is design work. Choosing which constraint binds, deciding what "good" means to reject things against it, noticing that your instrument measures the wrong property, and knowing when a lever is exhausted. The agent did all the work with Python in this project, but it couldn't have told me that a haiku was a bit nihilistic.