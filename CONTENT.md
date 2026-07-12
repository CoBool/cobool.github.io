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
ogImage: "/images/post-preview.png"
```

## Field Rules

- `title`: required, non-empty.
- `date`: required, ISO date in `YYYY-MM-DD` format. Production builds include dates up to the current `Asia/Seoul` calendar day and exclude future dates.
- `category`: required, non-empty.
- `description`: optional, non-empty when present. Used as the list excerpt and meta description.
- `tags`: optional array of non-empty strings. Defaults to `[]`; duplicate values are removed before taxonomy indexes are generated.
- `draft`: optional boolean. Defaults to `false`; draft posts are excluded from production builds.
- `pinned`: optional boolean. Defaults to `false`; pinned posts sort before unpinned posts.
- `ogImage`: optional root-relative path to an image file under `public`. Remote URLs, path traversal, query strings, and fragments are rejected. A missing file falls back to `siteConfig.defaultOgImage`.

Development serves draft and future-dated posts as previews. A future-dated post is not published automatically when its date arrives because this is a static site; run a new production build on or after that date.

When `description` is omitted, the content pipeline derives it from the first plain-text sentence of the Markdown body. Math, display equations, fenced code, images, and raw HTML are excluded from the generated description. This follows the Chirpy-style direction where a manual description is an override, not a required field.

Mathematical notation is detected automatically from `$...$` and `$$...$$` Markdown math syntax. Escape currency and other literal dollar signs (`\\$`) so they remain ordinary text instead of being parsed as math. A fenced `math` code block remains code and is not rendered by KaTeX.

## Rendering

Markdown is parsed with `vfile-matter` for YAML frontmatter and rendered through a unified pipeline:

- `remark-parse`
- `remark-gfm`
- `remark-math`
- `remark-rehype`
- `rehype-slug`
- `rehype-sanitize`
- table-of-contents collection
- `rehype-autolink-headings`
- `rehype-external-links`
- `rehype-katex`
- `rehype-pretty-code`
- `rehype-stringify`

Raw HTML passthrough is not enabled. The same parsed document produces sanitized HTML and the H2/H3 table of contents, so heading links and TOC entries share the same IDs.

Math is rendered to static HTML and MathML during the SSG build. Pages without detected math do not reference KaTeX CSS, fonts, or browser JavaScript. KaTeX CSS and fonts are served as local static assets rather than loaded from a CDN.

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
