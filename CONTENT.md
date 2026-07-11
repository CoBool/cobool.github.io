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
- `date`: required, ISO date in `YYYY-MM-DD` format. Production builds include dates up to the current `Asia/Seoul` calendar day and exclude future dates.
- `category`: required, non-empty.
- `description`: optional, non-empty when present. Used as the list excerpt and meta description.
- `tags`: optional array of non-empty strings. Defaults to `[]`; duplicate values are removed before taxonomy indexes are generated.
- `draft`: optional boolean. Defaults to `false`; draft posts are excluded from production builds.
- `pinned`: optional boolean. Defaults to `false`; pinned posts sort before unpinned posts.

Development serves draft and future-dated posts as previews. A future-dated post is not published automatically when its date arrives because this is a static site; run a new production build on or after that date.

When `description` is omitted, the content pipeline derives it from the first sentence of the Markdown body. This follows the Chirpy-style direction where a manual description is an override, not a required field.

## Rendering

Markdown is parsed with `vfile-matter` for YAML frontmatter and rendered through a unified pipeline:

- `remark-parse`
- `remark-gfm`
- `remark-rehype`
- `rehype-stringify`

Raw HTML passthrough is not enabled. Code highlighting and table of contents are intentionally excluded from this stage.

## Sorting

Post lists sort pinned posts first, then by newest `date`, and finally by slug when both values match.

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
