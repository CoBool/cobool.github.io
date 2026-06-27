---
title: "Reading Time Heuristics"
description: "Reading time is an estimate, not a promise, but it helps readers choose what to open."
date: "2026-06-19"
tags: ["content", "markdown"]
category: "notes"
draft: false
pinned: false
---

Reading time gives a quick sense of commitment before a reader opens a post.

The calculation can stay simple for now: count words, divide by an average reading speed, and round up.

## Heuristic table

| Content length | Display | Notes |
| --- | --- | --- |
| 1-220 words | 1분 읽기 | Never show zero minutes |
| 221-440 words | 2분 읽기 | Round up |
| 441+ words | More minutes | Keep it approximate |

The estimate does not need to be perfect. It only needs to be stable and honest enough to help a reader choose.

```ts
const minutes = Math.max(1, Math.ceil(wordCount / 220))
```

For Korean-heavy posts, this may need adjustment later. The first version keeps the rule simple and visible.
