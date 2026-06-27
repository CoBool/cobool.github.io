# Content Guide

## Post Location

Markdown posts live in `content/posts`.

Each file name becomes the post slug:

```txt
content/posts/markdown-content-pipeline.md
```

The generated slug is `markdown-content-pipeline`.

## Frontmatter

Every post must include this minimum frontmatter shape:

```md
---
title: "Post title"
date: "2026-06-28"
category: "build-log"
---
```

Optional fields can be added when needed:

```md
description: "Short summary for lists and previews."
tags: ["nextjs", "markdown"]
draft: true
pinned: true
```

## Field Rules

- `title`: required, non-empty.
- `date`: required, ISO date in `YYYY-MM-DD` format.
- `category`: required, non-empty.
- `description`: optional, non-empty when present. Used as the list excerpt and meta description.
- `tags`: optional array of non-empty strings. Defaults to `[]`.
- `draft`: optional boolean. Defaults to `false`; draft posts are excluded from public lists.
- `pinned`: optional boolean. Defaults to `false`; pinned posts sort before unpinned posts.

When `description` is omitted, the content pipeline derives it from the first sentence of the Markdown body. This follows the Chirpy-style direction where a manual description is an override, not a required field.

## Rendering

Markdown is parsed with `vfile-matter` for YAML frontmatter and rendered through a unified pipeline:

- `remark-parse`
- `remark-gfm`
- `remark-rehype`
- `rehype-stringify`

Raw HTML passthrough is not enabled. Code highlighting and table of contents are intentionally excluded from this stage.

## Sorting

Post lists sort pinned posts first, then by newest `date`.

## Current Taxonomy

Categories:

- `build-log`
- `engineering`
- `notes`
- `workflow`

Tags:

- `architecture`
- `content`
- `design`
- `markdown`
- `nextjs`
- `performance`
- `qa`
- `static-export`
- `tailwind`
- `typescript`
