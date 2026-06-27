---
title: "Pinned Posts Policy"
description: "Pinned posts should rise to the top without changing the date model of the archive."
date: "2026-06-14"
tags: ["content", "architecture"]
category: "workflow"
draft: false
pinned: false
---

Pinned posts are a light editorial tool. They let important notes stay visible while preserving normal dates.

Within the pinned group, normal date ordering still applies.

## Sorting rule

| Pinned | Date order | Result |
| --- | --- | --- |
| Yes | Newest first | Top group |
| No | Newest first | Normal group |

The date should never be rewritten just to keep a post visible. Pinning exists so editorial priority and chronology can stay separate.

```ts
const sorted = posts.toSorted((left, right) => {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.date.localeCompare(left.date)
})
```

Checklist for using a pin:

- [x] The post explains an important project decision
- [ ] The post is still relevant to new readers
- [ ] The pin can be removed when the archive exists
