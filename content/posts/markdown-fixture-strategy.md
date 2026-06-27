---
title: "Markdown Fixture Strategy"
description: "Real Markdown fixtures make parser tests more honest than hand-built objects."
date: "2026-06-13"
tags: ["markdown", "qa"]
category: "workflow"
draft: false
pinned: false
---

The content folder doubles as a realistic fixture set.

Tests can read the same files the app reads, which catches frontmatter mistakes earlier.

## Fixture coverage

The sample posts should not all look identical. Real writing contains short paragraphs, dense tables, lists, links, and code examples in awkward combinations.

| Markdown feature | Covered by samples | Why it matters |
| --- | --- | --- |
| Tables | Yes | Checks GFM rendering and prose spacing |
| Task lists | Yes | Common in implementation notes |
| Code fences | Yes | Validates mono surfaces |
| Blockquotes | Yes | Tests long-form reading rhythm |

Useful fixture rules:

- Keep examples realistic enough to read.
- Avoid lorem ipsum because it hides layout problems.
- Include Korean and English text over time.
- Add one new syntax shape when the renderer changes.

```md
- [x] Fixture includes a task item
- [ ] Fixture includes the next missing shape
```

That final code block is itself part of the fixture: it should render as code, not as a real checklist.
