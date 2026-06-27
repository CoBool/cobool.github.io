---
title: "Metadata for Search Later"
description: "The same title, description, tags, and category fields can later feed local search."
date: "2026-06-11"
tags: ["content", "architecture", "performance"]
category: "engineering"
draft: false
pinned: false
---

Search does not need to exist yet for the content model to prepare for it.

Clean summaries and predictable taxonomy will make a later search index easier to build.

## Future index shape

| Field | Source | Search use |
| --- | --- | --- |
| `title` | Frontmatter | Primary result label |
| `description` | Frontmatter or excerpt | Result summary |
| `category` | Frontmatter | Filter |
| `tags` | Frontmatter | Facets |
| `content` | Markdown body | Full-text matching |

The current implementation should avoid search-specific abstractions. It only needs to keep the data clean enough that a generated index can be added later.

```json
{
  "slug": "metadata-for-search-later",
  "title": "Metadata for Search Later",
  "category": "engineering"
}
```

That shape is intentionally flat because static search data should be easy to serialize.
