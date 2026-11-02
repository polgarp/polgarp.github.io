---
title: "Open intent software"
categories:
  - Blog
tags:
  - Software industry
  - AI design
---

I'm seeing a new class of software emerging, which I call Open Intent Software (OIS). Open intent means software shipped as a description of what it would do, and instructions for a coding agent to build it.

For a long time we basically had two types of software to work with: closed source and open source software.

Closed source is usually paid, an individual or more often a company developing the software, packaging it for certain platforms and cases, and maintaining various services around it. Open source is different, at the most basic level only the source is available, though most developers maintain various packaging, like a Windows installer or a Linux binary.

In theory open source is more flexible, since people could change the source code, or bring the software to their own platform. In practice changing code needs almost as much knowledge as creating the original source, while packaging needs at the minimum some tinkering and technical knowledge. So to most people it's almost as closed as closed source.

With coding agents we might see a new category rising, where not only the packaging, but also the code is easier to change. Code can also be recreated if someone has access to the original binaries, as the [recent trend of recreating games on new platforms](https://www.reddit.com/r/macgaming/comments/1wz5wpp/ai_can_now_reverse_engineer_games_and_software/?rdt=63300) shows. In a lot of cases not even the code is necessary, but a good description of the original software can be enough.

Open intent would typically carry a detailed description of the original problem, an approach to solve it, with some trade-offs and technical problems explained, plus some high level conceptual designs to guide the user experience. Agents are flexible, but some additional data will help both the agents and the people requesting it: metadata like versions and references, and an estimated token or compute cost that would guide decisions like "is it worth building it / how much effort will this take".

{% include diagram name="open-intent-handover" alt="A three-row diagram titled 'What crosses the line', with a dashed vertical line separating what the author ships from what the user does. Closed: the author ships a binary, packaged per platform; the user runs it as shipped, with no way to change it. Open source: the author ships source and binaries, with packaging mostly on the author; the user runs it, or changes it if they can read the code and build it. Open intent, highlighted in red: the author ships a description of the problem, approach, trade-offs and cost; a coding agent builds it, on the user's platform, with their changes and their token spend." %}

To give a more concrete example, a couple of months ago I made [Ration]({% post_url Blog/2026/2026-08-28-ration-claude-usage-in-your-menubar %}), a small app to track my Claude Code spending, and also [released the source for it](https://github.com/polgarp/ration). But making the tool redistributable took ~80% of the work. I could have just provided a detailed spec that other people would replicate. Trading some of my own token spend and possibly less storage to host the source, for a more focused side project. I wrote now [Ration's open intent](https://github.com/polgarp/ration/blob/main/INTENT.md) to illustrate.

Users of open intent software would be getting the benefit of a well-structured solution description, and an option to customise the software out of the box, when they ask their coding agent to "make something like this". Authors still need to create the software via the description, but get to do more horizontal polishing (covering more use cases, better interactions), instead of focusing on technical details.

This might only work for small (personal) and mid-sized software, where there is no need for extensive infrastructure, so for projects which a single person can reasonably direct. Following the same intent might produce different and more personal apps, without extensive preparations for personalisation. An issue might be the lower impact of a shared upstream. While the common intent might get updates, the codebases would need to rely on their own agents to get bugfixes. Trust in what's built shifts: there is less exposure to supply chain attacks (everything is built locally), but attacks on key libraries or on coding agents become more dangerous.

As we have more and more on-demand software, the importance of having well-written definitions will rise. Which means designing and describing software will become a more critical craft.