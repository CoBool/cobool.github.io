---
title: "Quality Gates for Small Blogs"
description: "Even a small static blog benefits from typecheck, lint, test, build, and a quick browser pass."
date: "2026-06-20"
tags: ["qa", "typescript", "static-export"]
category: "workflow"
draft: false
pinned: false
---

Quality gates are most useful when they are cheap enough to run often.

For this blog, the baseline is typecheck, lint, tests, and a production build before each PR.

## Gate order

1. Format the changed files.
2. Run unit tests for content parsing and page assumptions.
3. Run TypeScript without emitting files.
4. Build the static export.
5. Open at least one generated page in a browser.

| Gate | Command | Catches |
| --- | --- | --- |
| Format | `pnpm format` | Style drift |
| Test | `pnpm test` | Broken content contracts |
| Typecheck | `pnpm typecheck` | Type and route mistakes |
| Build | `pnpm build` | Static export failures |

```bash
pnpm test
pnpm typecheck
pnpm build
```

> The gates should be boring enough to run before every PR. If they feel ceremonial, they will be skipped.
