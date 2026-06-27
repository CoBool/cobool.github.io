---
title: "Static Export Checklist"
description: "A compact checklist for keeping the blog compatible with static export as the feature set grows."
date: "2026-06-26"
tags: ["static-export", "qa", "nextjs"]
category: "engineering"
draft: false
pinned: true
---

Static export is a useful constraint because it forces pages to be predictable at build time.

Every feature should be checked against the same question: can this be generated from local files without a runtime server?

## Export compatibility matrix

| Feature | Static-safe? | Notes |
| --- | --- | --- |
| Markdown posts | Yes | Source files are read during build |
| Latest posts | Yes | Sort and slice happen at build time |
| Post detail pages | Yes | Slugs come from `generateStaticParams` |
| Search | Later | Can be local JSON if generated ahead |
| Comments | No | Needs an external runtime or embed |

## PR checklist

- [x] `next.config.ts` keeps `output: "export"`
- [x] Dynamic post routes are generated from local content
- [ ] Unknown slugs have a designed 404 page
- [ ] Generated search data is added only when search exists

Static export also changes how errors feel during development. Missing dynamic params are not ordinary runtime misses; they are build-shape problems.

```ts
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}
```

That function is small, but it defines the full set of detail pages the static build knows how to create.
