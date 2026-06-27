---
title: "Markdown Content Pipeline"
description: "How frontmatter, slug generation, and post summaries form the data layer for the blog."
date: "2026-06-25"
tags: ["markdown", "content", "typescript"]
category: "build-log"
draft: false
pinned: false
---

The Markdown content pipeline begins with frontmatter. Each file must describe its title, date, and category; descriptions, tags, and publication flags can stay optional.

From there, the loader derives the slug from the filename, fills safe defaults, and exposes a typed post object for pages to consume.

## Pipeline stages

| Stage | Input | Output |
| --- | --- | --- |
| Matter parsing | Raw Markdown file | Metadata and body |
| Schema validation | Unknown metadata | Typed frontmatter |
| Slug derivation | File name | URL-safe slug |
| Markdown rendering | Body text | Sanitized HTML |

The important boundary is between parsing and rendering. Metadata becomes application data; the body stays author-controlled text until the unified pipeline converts it.

```ts
const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify)
```

## Supported writing patterns

- Paragraphs and headings for normal posts
- Links for references
- Tables for compact comparisons
- Task lists for implementation notes
- Code fences for examples

- [x] Raw HTML is not passed through unchecked
- [x] GFM syntax is part of the renderer
- [ ] Syntax highlighting is intentionally saved for a later step

> The renderer should be boring in the best way: predictable input, predictable output, no surprise HTML.
