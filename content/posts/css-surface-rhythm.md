---
title: "CSS Surface Rhythm"
description: "Surface rhythm is the difference between a calm reading panel and a pile of disconnected cards."
date: "2026-06-16"
tags: ["design", "tailwind"]
category: "notes"
draft: false
pinned: false
---

Surfaces should feel related to each other. Borders, background tones, and spacing need to repeat without becoming monotonous.

For a blog, restraint is usually more durable than decoration.

## Surface stack

| Surface | Token | Visual role |
| --- | --- | --- |
| Page | `bg-background` | Quiet base |
| Article | `bg-card` | Reading focus |
| Chip | `bg-muted` | Secondary metadata |
| Hover | `bg-accent` | Soft interaction |

The rhythm comes from repeating spacing and depth rules, not from adding more colors.

```tsx
<section className="rounded-lg border border-border bg-card p-6 shadow-sm">
  <p className="text-muted-foreground">A calm surface.</p>
</section>
```

Small surfaces should support the article, not compete with it.
