---
title: "Theme Mode Storage"
description: "System, light, and dark modes need a small persistence contract to avoid surprising the reader."
date: "2026-06-22"
tags: ["design", "typescript", "qa"]
category: "engineering"
draft: false
pinned: false
---

Theme mode is part of the reading experience. A selected mode should persist, and the system option should continue to follow operating system changes.

The control stays small, but the behavior needs to be explicit.

## Mode behavior

| Mode | Stored value | Runtime behavior |
| --- | --- | --- |
| System | `system` | Follows `prefers-color-scheme` |
| Light | `light` | Forces light tokens |
| Dark | `dark` | Forces dark tokens |

The selected value should be the user intent, not just the current resolved color scheme. That distinction matters when the operating system changes later.

```ts
type ThemeMode = "system" | "light" | "dark"

function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean) {
  return mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode
}
```

Implementation notes:

- [x] Keep the control as real buttons
- [x] Store the selected mode
- [ ] Add a no-flash inline script if the first paint becomes distracting

The current step is good enough for behavior testing; polish can wait until the route structure settles.
