---
title: "Post Taxonomy Shape"
description: "Tags and categories should stay boring enough to support filtering without becoming a second content model."
date: "2026-06-21"
tags: ["content", "architecture"]
category: "workflow"
draft: false
pinned: false
---

Taxonomy works best when it is predictable. Categories are broad buckets, while tags describe the technologies and concerns inside a post.

This shape should support simple archive pages before any advanced search is introduced.

## Category shape

| Category | Purpose | Example tag |
| --- | --- | --- |
| `build-log` | Chronological implementation notes | `nextjs` |
| `engineering` | Decisions and technical contracts | `typescript` |
| `notes` | Design and editorial observations | `design` |
| `workflow` | QA and project process | `qa` |

Tags can be more specific because they are not the primary navigation model. A post can have no tags, but it should always have one category.

Good tags:

- Name a tool or library.
- Name a recurring concern.
- Stay lowercase and URL-friendly.

Avoid tags that only make sense once. They create maintenance without helping readers.
