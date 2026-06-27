---
title: "Tailwind Token Mapping"
description: "A note on mapping CSS variables into Tailwind utilities without losing the design system contract."
date: "2026-06-23"
tags: ["tailwind", "design"]
category: "notes"
draft: false
pinned: false
---

Tailwind utilities are most useful here when they point back to named design tokens.

That keeps component classes compact while avoiding one-off colors or arbitrary visual decisions.

## Mapping examples

| Intent | Utility | Token path |
| --- | --- | --- |
| Page background | `bg-background` | `--background` |
| Primary text | `text-foreground` | `--foreground` |
| Panel border | `border-border` | `--border` |
| Muted label | `text-muted-foreground` | `--muted-foreground` |

The point is not to avoid Tailwind. The point is to keep Tailwind connected to the design system.

```tsx
<article className="rounded-lg border border-border bg-card p-6 text-card-foreground">
  <h1 className="text-4xl font-bold leading-[1.15] text-foreground">
    Token-backed component
  </h1>
</article>
```

Checklist for new component styles:

- [x] Prefer utility classes in the component
- [x] Use token-backed color aliases
- [ ] Add a new token only when repeated usage proves it belongs
