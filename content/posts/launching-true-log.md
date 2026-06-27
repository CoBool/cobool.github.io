---
title: "Launching True Log"
description: "The first public note for a static Markdown blog built around clear writing and small technical decisions."
date: "2026-06-28"
tags: ["nextjs", "markdown", "design"]
category: "build-log"
draft: false
pinned: true
---

True Log starts as a quiet place for implementation notes, decisions, and small lessons learned while building the blog itself.

The first goal is not a complex publishing system. It is a reliable content path where a Markdown file can become structured data without a manual step.

## What this blog should prove

The first version has a narrow job: keep writing cheap and keep publishing predictable. A post should begin as a Markdown file, move through the content loader, and land on the page with no hidden editing step.

| Area | Current decision | Reason |
| --- | --- | --- |
| Content | Markdown files in `content/posts` | Easy to review in pull requests |
| Routing | Static post pages | Works with static export |
| Design | Neutral reading panel | Keeps attention on the writing |
| Validation | Typed metadata | Catches broken posts before deploy |

The rule of thumb is simple:

> If a feature makes writing feel heavier, it needs a very clear reason to exist.

## Launch checklist

- [x] Create the first static shell
- [x] Load posts from local Markdown
- [x] Render a post detail page
- [ ] Add archive filtering
- [ ] Add table of contents after the prose shape is stable

The checklist is intentionally visible in the content because task lists are common in build notes. It also gives the Markdown renderer a practical fixture for GitHub Flavored Markdown.

```ts
type LaunchRule = {
  name: string
  mustStayStatic: boolean
}

const rule: LaunchRule = {
  name: "Markdown first",
  mustStayStatic: true,
}
```

That tiny type captures the tone of the project: boring data, predictable output, and just enough structure to avoid future confusion.
