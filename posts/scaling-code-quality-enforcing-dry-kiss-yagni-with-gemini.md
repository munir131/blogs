---
title: "Scaling Code Quality: Enforcing DRY, KISS, and YAGNI with Gemini AI"
description: "Can AI actually improve code quality? A deep dive into my GDG Cloud Rajkot talk on using Gemini CLI to enforce engineering principles and build production-ready event-driven systems."
date: 2025-12-14
tags:
  - code quality
  - gemini
  - ai
  - software architecture
  - event driven architecture
  - gdg
layout: layouts/post.njk
image: /img/IMG_0233.jpg
---

![Speaking at GDG Cloud Rajkot](/img/IMG_0233.jpg)

On December 14th, I had the privilege of speaking at **GDG Cloud Rajkot**. The topic wasn't just about "how to use AI" - it was about **how to maintain engineering rigor in the age of AI**.

We are in a gold rush of generative coding tools. But as any senior engineer knows, writing code is easy. Reading, maintaining, and scaling it is the hard part. If we aren't careful, AI becomes a high-speed conveyor belt for technical debt.

In my session, I demonstrated how to flip this dynamic: using Gemini not just as a "coder," but as a **quality gatekeeper** that enforces the fundamental laws of software engineering.

## The Triad of Code Quality

I anchored the talk on three timeless principles that often get lost in the noise of "auto-complete":

1.  **DRY (Don't Repeat Yourself):** AI models are stateless by default; they love to regenerate the same logic. We need systems that detect duplication across files.
2.  **KISS (Keep It Simple, Stupid):** LLMs often over-engineer. They'll give you a Factory strategy pattern when a simple function would do. We must prompt for simplicity.
3.  **YAGNI (You Aren't Gonna Need It):** Generative AI hallucinates "future requirements," adding parameters and abstractions for use cases that don't exist yet.

## The Solution: Gemini CLI as an Engineering Partner

I didn't just talk theory. I demonstrated a live workflow using the **Gemini CLI**, customized with specific agent personas to handle different parts of the SDLC.

This feedback loop catches "working but bad" code before it ever hits a pull request.

## Live Demo: Building a Production-Grade Event-Driven System

To prove this works for more than just "Hello World," I did a live coding session building an **Event-Driven Architecture (EDA)** using **Google Cloud Pub/Sub**.

You can find the production-grade demo code here:
[**github.com/munir131/pubsub-eda**](https://github.com/munir131/pubsub-eda)

## Resources

For those who want to dive deeper into the prompts I discussed, the slides are available here:
[**Code Quality with Gemini - Slides**](https://optimizewithmunir.com/code-quality-with-gemini-slides)

## Final Thoughts

AI will not replace engineers. It will replace engineers who refuse to leverage it to increase their quality bar. The future belongs to those who use these tools to strictly enforce best practices, automating the "boring" parts of code review so we can focus on system design and reliability.

*Special thanks to the GDG Cloud Rajkot team for hosting an incredible event.*
