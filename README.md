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
| `pnpm build` | Generate a deployment version, run the static export to `out/`, write versioned PWA artifacts, then build and verify the Pagefind index in `postbuild` |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | Playwright browser smoke tests against the production export |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome autofix |

CI runs lint, typecheck, unit tests, the production build, and Playwright browser smoke tests on every pull request. Failure traces from the browser tests are preserved as workflow artifacts.

## Layout

```
content/posts/       Posts (Markdown)
src/
  app/               Routes. The (site) group wraps the shared layout
  lib/markdown/      Markdown pipeline — host independent
  lib/               Application logic: post IO, collections, deployment paths, RSS, SEO
  features/          post-toc · post-diagram · pwa · search · theme
  components/        UI. ui/ is shadcn, typography.tsx holds the type primitives
  config/            site · navigation · integrations · deployment validation
deploy/nginx.conf    nginx configuration for deployment
```

## Design

**The Markdown pipeline does not know its host.** `src/lib/markdown/` uses only the unified ecosystem and imports no `next`, `react`, `node:*` or `@/*`. That is not a convention but an [enforced test](tests/markdown-boundary.test.ts) — an allowlist, so imports nobody anticipated fail too. Type checking alone does not catch this, because resolution walks up to the parent `node_modules`.

MDX is absent for the same reason. The moment a post contains JSX, it cannot be rendered without React.

**Everything is a static export.** `output: "export"` means there is no application server. That constraint decides several things: CSP nonces are impossible (see [DEPLOY.md](DEPLOY.md)), the RSS feed is a `force-static` route, and the search index runs after the HTML export because Pagefind has to read the built pages.

**The build creates one deployment version for the page bundle, update endpoint and service worker.** `scripts/build.mjs` generates the version, exposes it to the client bundle as `NEXT_PUBLIC_BUILD_VERSION`, writes `out/build-version.json`, and replaces the service worker version marker before `postbuild` creates the search index. The variable is internal build metadata and is not a user configuration value.

**PWA support is part of the production site.** The app ships a web manifest and registers a service worker only in production. The worker provides offline fallback and controlled caching for navigation, immutable Next assets, fonts, KaTeX, Pagefind and RSC payloads. Open tabs periodically compare their embedded deployment version with `build-version.json`; when a new deployment is detected, the UI offers a refresh instead of silently serving a mixed old/new asset set.

**Diagrams render on the client, and only when needed.** Rendering Mermaid on the server would require a headless browser. Instead the module loads only on posts that contain a diagram, and only once that diagram scrolls into view via `IntersectionObserver`.

**Post HTML passes through `rehype-sanitize`.** The value accepted by `dangerouslySetInnerHTML` is narrowed to a `SanitizedHtml` branded type, so a string that skipped sanitization fails type checking.

## Configuration

Configuration values are baked into the bundle at build time. Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Required for production. Base for absolute URLs in canonical tags, Open Graph, sitemap and RSS |
| `NEXT_PUBLIC_BASE_PATH` | Root deployment contract. Leave empty (or `/`); subpath deployments are rejected |
| `NEXT_PUBLIC_GISCUS_*` | Optional comments. Set all five values or leave all five empty |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics 4 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Optional KakaoTalk share button. JavaScript key from a Kakao Developers app |

`NEXT_PUBLIC_BUILD_VERSION` is intentionally not listed as configuration: `pnpm build` generates it internally for PWA update coordination.

## Documentation

| Document | Contents |
| --- | --- |
| [DESIGN.md](DESIGN.md) | Color, typography, spacing and component rules |
| [CONTENT.md](CONTENT.md) | Frontmatter schema and authoring rules |
| [DEPLOY.md](DEPLOY.md) | GitHub Pages and container deployment, PWA/cache policy, security headers and recovery |
| [SECURITY.md](SECURITY.md) | Dependency review status and deployment-specific security assessment |

## Third-party assets

Pretendard and Geist Mono are served directly from `public/fonts/` rather than through Google Fonts or a CDN. The KaTeX stylesheet and fonts live in `public/katex/`. Each ships with its license file.
