# True Log

**English** · [한국어](README.ko.md)

A Korean-language technical blog that builds Markdown into static pages. It runs on the Next.js App Router, but **the part that handles posts knows nothing about the framework** — there is no MDX, and the pipeline is isolated as pure modules that take a string and return a string.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Node 22 or later. The pnpm version comes from the `packageManager` field in `package.json` via corepack.

Posts live in `content/posts/<slug>.md`, where the filename is the URL. The dev server also shows posts marked `draft: true` and posts dated in the future. See [CONTENT.md](CONTENT.md) for the frontmatter rules.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Static export to `out/`, then `postbuild` builds the search index |
| `pnpm test` | Vitest |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome autofix |

All four gates — lint, typecheck, test, build — run on every pull request in [CI](.github/workflows/ci.yml).

## Layout

```
content/posts/       Posts (Markdown)
src/
  app/               Routes. The (site) group wraps the shared layout
  lib/markdown/      Markdown pipeline — host independent
  lib/               App layer: file IO, caching, RSS, SEO
  features/          post-toc · post-diagram · search · theme
  components/        UI. ui/ is shadcn, typography.tsx holds the type primitives
  config/            site · navigation · integrations
deploy/nginx.conf    nginx configuration for deployment
```

## Design

**The Markdown pipeline does not know its host.** `src/lib/markdown/` uses only the unified ecosystem and imports no `next`, `react`, `node:*` or `@/*`. That is not a convention but an [enforced test](tests/markdown-boundary.test.ts) — an allowlist, so imports nobody anticipated fail too. Type checking alone does not catch this, because resolution walks up to the parent `node_modules`.

MDX is absent for the same reason. The moment a post contains JSX, it cannot be rendered without React.

**Everything is a static export.** `output: "export"` means there is no server, and that constraint decides several things: CSP nonces are impossible (see [DEPLOY.md](DEPLOY.md)), the RSS feed is a `force-static` route, and the search index runs in `postbuild` because it has to read the built HTML.

**Diagrams render on the client, and only when needed.** Rendering Mermaid on the server would require a headless browser. Instead the module loads only on posts that contain a diagram, and only once that diagram scrolls into view via `IntersectionObserver`.

**Post HTML passes through `rehype-sanitize`.** The value accepted by `dangerouslySetInnerHTML` is narrowed to a `SanitizedHtml` branded type, so a string that skipped sanitization fails type checking.

## Configuration

Every value is optional and is baked into the bundle at build time. Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base for absolute URLs in canonical tags, Open Graph, sitemap and RSS |
| `NEXT_PUBLIC_GISCUS_*` | Comments. Set all five values or leave all five empty |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |

## Documentation

| Document | Contents |
| --- | --- |
| [DESIGN.md](DESIGN.md) | Color, typography, spacing and component rules |
| [CONTENT.md](CONTENT.md) | Frontmatter schema and authoring rules |
| [DEPLOY.md](DEPLOY.md) | Container deployment, cache policy, security headers |

## Third-party assets

Pretendard and Geist Mono are served directly from `public/fonts/` rather than through Google Fonts or a CDN. The KaTeX stylesheet and fonts live in `public/katex/`. Each ships with its license file.
