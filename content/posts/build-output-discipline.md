---
title: "Build Output Discipline"
description: "A static blog should keep generated output separate from source content and tests."
date: "2026-06-10"
tags: ["static-export", "qa", "performance"]
category: "workflow"
draft: false
pinned: false
---

Generated output should stay out of source control unless it is intentionally published.

That keeps diffs focused on the content and code that explain the change.

## What stays ignored

| Path | Reason |
| --- | --- |
| `.next/` | Framework build cache |
| `out/` | Generated static export |
| `.omo/` | Local agent evidence and cache |
| `node_modules/` | Package install output |

The repository should make source changes easy to review. Generated files are useful evidence during QA, but they should not become the main diff.

```gitignore
.next/
out/
.omo/
node_modules/
```

The exception is deliberate publication output. If deployment ever requires committing generated files, that rule should be documented before changing the ignore policy.
