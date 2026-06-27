---
title: "Design System Notes"
description: "A short record of how the True Log design tokens guide surfaces, typography, and interaction states."
date: "2026-06-27"
tags: ["design", "tailwind", "architecture"]
category: "notes"
draft: false
pinned: true
---

The design system keeps the page neutral and deliberate. Surfaces use tonal shifts, borders, and restrained shadows instead of decorative effects.

This makes the writing easier to scan and gives future components a narrow set of choices.

## Token decisions

The system leans on a small set of repeated roles. A blog can become visually noisy very quickly if every card, badge, and post body invents its own contrast level.

| Token family | Used for | Constraint |
| --- | --- | --- |
| `--background` | Page base | Never used as an elevated panel |
| `--card` | Main reading surfaces | Paired with border and subtle shadow |
| `--muted` | Metadata and chips | Keeps labels secondary |
| `--primary` | Active controls | Reserved for state, not decoration |

### Component notes

1. Reading panels should remain wider than cards but narrower than archive grids.
2. Metadata should be compact and scannable.
3. Tag chips should look useful, not celebratory.

```css
:root {
  --space-4: 1rem;
  --space-8: 2rem;
}
```

The values are not meant to be clever. They are meant to be repeatable.

> A quiet interface still needs rhythm. It just should not announce every beat.
