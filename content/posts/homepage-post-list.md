---
title: "Homepage Post List"
description: "A small latest-posts list makes the first screen useful before the full archive exists."
date: "2026-06-09"
tags: ["nextjs", "design", "content"]
category: "build-log"
draft: false
pinned: false
---

The homepage does not need a complete archive in this step.

Showing five current posts is enough to prove the Markdown pipeline reaches a visible route.

## What the list should communicate

- The project is active.
- Posts have stable metadata.
- Pinned writing can stay visible.
- Readers can jump into detail pages quickly.

| Item | Visible on card | Why |
| --- | --- | --- |
| Title | Yes | Primary navigation target |
| Description | Yes | Helps readers choose |
| Date | Yes | Shows recency |
| Tags | Optional | Adds scan hints |

The homepage should not become an archive too early. A small list keeps the first screen focused while the archive route grows separately.

> Five posts is enough to test the loop without pretending the homepage is the whole product.
