---
title: "Static Homepage Data"
description: "The homepage can show real posts without becoming dynamic or adding client-side fetching."
date: "2026-06-17"
tags: ["nextjs", "static-export", "content"]
category: "build-log"
draft: false
pinned: false
---

The homepage should be able to read the latest posts at build time.

That gives readers useful content immediately and keeps the route compatible with static export.

## Data flow

1. Read Markdown files from disk.
2. Validate frontmatter.
3. Sort pinned posts and recent dates.
4. Slice the first five posts for the homepage.

| Step | Runtime location | Client JavaScript needed? |
| --- | --- | --- |
| File read | Build/server | No |
| Sorting | Build/server | No |
| Rendering | Static HTML | No |

```ts
const latestPosts = getLatestPosts(5)
```

This keeps the homepage useful without adding client-side fetching, loading states, or API routes before they are needed.
