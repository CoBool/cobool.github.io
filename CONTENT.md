# Content Guide

## Post Location

Markdown posts live in `content/posts`.

Each file name becomes the post slug:

```txt
content/posts/markdown-content-pipeline.md
```

The generated slug is `markdown-content-pipeline`.

## Frontmatter

Every post must include this frontmatter shape:

```md
---
title: "Post title"
description: "Short summary for lists and previews."
date: "2026-06-28"
tags: ["nextjs", "markdown"]
category: "build-log"
draft: false
pinned: false
---
```

## Field Rules

- `title`: required, non-empty.
- `description`: required, non-empty. Used as the list excerpt.
- `date`: required, ISO date in `YYYY-MM-DD` format.
- `tags`: required, one or more non-empty strings.
- `category`: required, non-empty.
- `draft`: required boolean. Draft posts are excluded from public lists.
- `pinned`: required boolean. Pinned posts sort before unpinned posts.

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
