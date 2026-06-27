---
title: "TypeScript Content Errors"
description: "Content errors should point to the broken slug so invalid Markdown is easy to repair."
date: "2026-06-15"
tags: ["typescript", "qa"]
category: "engineering"
draft: false
pinned: false
---

When a post has invalid metadata, the error should name the file-derived slug.

That keeps the feedback loop short for the person editing Markdown.

## Useful error shape

| Error case | Helpful message |
| --- | --- |
| Missing title | `Post "example-slug" is missing title` |
| Invalid date | `Post "example-slug" has an invalid date` |
| Bad category | `Post "example-slug" has an unsupported category` |

Errors should name the post and the field. They should not force the author to inspect a stack trace before knowing which file broke.

```ts
throw new Error(`Post "${slug}" has invalid frontmatter`)
```

Validation is not just for type safety. It is part of the authoring experience.
