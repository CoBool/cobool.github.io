---
title: "Markdown Content Pipeline"
description: "How frontmatter, slug generation, and post summaries form the data layer for the blog."
date: "2026-06-25"
tags: ["markdown", "content", "typescript"]
category: "build-log"
draft: false
pinned: false
---

The Markdown content pipeline begins with frontmatter. Each file describes its own title, description, date, tags, category, and publication flags.

From there, the loader can derive the slug from the filename and expose a typed post object for pages to consume.

