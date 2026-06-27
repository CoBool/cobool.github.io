---
title: "Frontmatter as Contract"
description: "Frontmatter is where human-friendly Markdown crosses into typed application data."
date: "2026-06-18"
tags: ["markdown", "typescript", "content"]
category: "engineering"
draft: false
pinned: false
---

Frontmatter is a boundary. The blog should parse it once, turn it into typed data, and avoid re-validating the same fields downstream.

That contract keeps page code simple.

## Required and derived fields

| Field | Required in Markdown | Default or derivation |
| --- | --- | --- |
| `title` | Yes | None |
| `date` | Yes | None |
| `category` | Yes | None |
| `tags` | No | Empty list |
| `description` | No | Extracted from body |
| `draft` | No | `false` |
| `pinned` | No | `false` |

The contract is strict where routing and identity need certainty, and soft where authors should not repeat themselves.

```yaml
title: "Frontmatter as Contract"
date: "2026-06-18"
category: "engineering"
tags:
  - markdown
  - typescript
```

Validation should fail loudly when a required field is missing. Optional fields should be filled in one place so every page sees the same shape.
