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
tags: ["markdown"]
category: "build-log"
---
```

Optional fields can be added when needed:

```md
description: "Short summary for lists and previews."
draft: true
pinned: true
ogImage: "/images/post-preview.png"
```

## Field Rules

- `title`: required, non-empty.
- `date`: required, ISO date in `YYYY-MM-DD` format. Production builds include dates up to the current `Asia/Seoul` calendar day and exclude future dates.
- `category`: required, non-empty.
- `description`: optional, non-empty when present. Used as the list excerpt and meta description.
- `tags`: required array containing at least one non-empty string. Duplicate values are removed before taxonomy indexes are generated.
- `draft`: optional boolean. Defaults to `false`; draft posts are excluded from production builds.
- `pinned`: optional boolean. Defaults to `false`; pinned posts sort before unpinned posts.
- `ogImage`: optional root-relative path to an image file under `public`. Remote URLs, path traversal, query strings, and fragments are rejected. A missing file falls back to `siteConfig.defaultOgImage`.

Development serves draft and future-dated posts as previews. A future-dated post is not published automatically when its date arrives because this is a static site; run a new production build on or after that date.

Production builds require at least one publishable post. A missing directory, an empty directory, or a collection containing only drafts and future-dated posts fails the build instead of generating an empty site.

When `description` is omitted, the content pipeline derives it from the first plain-text sentence of the Markdown body. Math, display equations, fenced code, images, and raw HTML are excluded from the generated description. This follows the Chirpy-style direction where a manual description is an override, not a required field.

Mathematical notation is detected automatically from `$...$` and `$$...$$` Markdown math syntax. Escape currency and other literal dollar signs (`\\$`) so they remain ordinary text instead of being parsed as math. A fenced `math` code block remains code and is not rendered by KaTeX.

Diagrams are detected automatically from fenced `mermaid` code blocks. The static HTML keeps the escaped Mermaid source as a readable fallback, and the browser replaces it with an SVG. Invalid diagram syntax keeps the source visible instead of failing the build or removing the content.

## Rendering

Markdown is parsed with `vfile-matter` for YAML frontmatter and rendered through a unified pipeline:

- `remark-parse`
- `remark-gfm`
- `remark-math`
- math and Mermaid detection
- `remark-rehype`
- `rehype-slug`
- Mermaid fallback preparation
- `rehype-sanitize`
- table-of-contents collection
- `rehype-autolink-headings`
- `rehype-external-links`
- `rehype-katex`
- `rehype-pretty-code`
- `rehype-stringify`

Raw HTML passthrough is not enabled. The same parsed document produces sanitized HTML and the H2/H3 table of contents, so heading links and TOC entries share the same IDs.

Math is rendered to static HTML and MathML during the SSG build. Pages without detected math do not reference KaTeX CSS, fonts, or browser JavaScript. KaTeX CSS and fonts are owned under `public/katex` and served directly rather than copied after the build or loaded from a CDN.

Mermaid diagrams are rendered in the browser with strict security settings. Pages without detected Mermaid blocks do not request the Mermaid runtime.

## Sorting

Post lists sort pinned posts first, then by newest `date`, and finally by slug when both values match.

## Category Taxonomy

Categories are open-ended, route-safe, non-empty strings. They are not restricted to an enum or
allowlist: published post frontmatter is collected automatically to generate the category index and
static category routes. Use an existing category when its meaning fits, or introduce a new one when
it does not.

Current conventions:

- `build-log`: projects built directly and the journey of implementing them.
- `engineering`: architecture, implementation, performance, and technical design decisions.
- `workflow`: development environments, tool usage, and working practices.
- `notes`: general or personal records.
- `industry`: product, policy, pricing, company strategy, and ecosystem change analysis.

The values above describe the categories currently in use; they are not a fixed list of allowed
values.

## Current Tags

Tags are also collected automatically from published post frontmatter. Current values:

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
