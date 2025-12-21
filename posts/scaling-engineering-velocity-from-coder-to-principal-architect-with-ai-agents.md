---
title: Scaling Engineering Velocity - From Coder to Principal Architect with AI Agents
description: How I used local AI agents to refactor legacy code, hit 88% test coverage, and automate DevOps—shifting the job from typing syntax to managing architecture.
date: 2025-12-21
tags:
  - ai-engineering
  - software architecture
  - devops
  - productivity
  - testing
layout: layouts/post.njk
---

The bottleneck in software engineering isn't syntax; it's context management. As systems grow, we spend more time loading the codebase into our heads than actually shipping value.

I recently took a legacy repo of mine, `attachment-downloader`, and decided to overhaul it. It was a functional but messy monolithic script. Instead of slogging through the manual refactor, I used local context-aware agents—specifically **GEMINI CLI** and **opencode**—to handle the heavy lifting.

The result wasn't just faster code completion. It was a fundamental shift in how I approached the project. I wasn't the one implementing the changes; I was the Principal Architect directing them.

## The Refactor

The codebase suffered from the classic "God Object" anti-pattern in `index.js`. It needed a serious cleanup.

In a traditional workflow, I would have spent hours mapping out dependencies, creating files, and moving logic chunk by chunk. Instead, I gave the agent the architectural constraints:

1.  Move business logic to `core/`.
2.  Isolate external integrations (Gmail, Google Auth) in `integration/`.
3.  Push utilities to `internal/`.

The agent parsed the file structure and executed the move. It didn't just copy-paste; it untangled the requires and set up the exports. My job was to review the PR, not write it.

## 88% Test Coverage

Legacy code is usually untested code. Writing retro-active unit tests is tedious, so it rarely gets done.

I defined the testing strategy—unit tests for the new `AttachmentDownloader` class, mocks for the API calls—and let the agent generate the suites.

We hit **88% coverage** almost immediately. The agent scaffolded the tests, mocked the Gmail API responses, and handled the edge cases. I now have a safety net for a project that was previously brittle, without having to spend a weekend writing boilerplate assertions.

## Automating DevOps

A refactor isn't finished until it's running in CI. I instructed the agent to set up a GitHub Actions workflow.

It generated a `ci.yml` that:
*   Runs the tests on push.
*   Uploads reports to Codecov.
*   Enforces linting.

I didn't have to look up the YAML syntax for the latest Node.js action or debug indentation errors. It just worked.

## The New Role

This workflow changes the job description. I didn't write the majority of the lines in this update, but the system is exactly what I intended it to be.

My role shifted from **Implementer** to **Architect**:
*   **Defining Constraints:** "Use `core/` for logic."
*   **Reviewing Architecture:** Verifying the Single Responsibility Principle.
*   **Managing Agents:** Directing the workflow for implementation, testing, and CI.

The agent handles the implementation details. I own the architecture and the quality standards.

We can now demand higher standards—cleaner architecture, high test coverage, robust pipelines—because the cost of implementation has dropped significantly. The value is no longer in the keystrokes. It's in the vision.
