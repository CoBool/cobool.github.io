# Dependency security

The production artifact is `out/`. GitHub Pages and the nginx image serve static
files; they do not run a Next.js server. Browser libraries and build tools still
need security updates.

Run `pnpm audit` after dependency updates. Review browser, build-time, and unused
server paths separately; do not silently ignore all findings for a package.

## Review of 2026-09-05

- Updated Mermaid beyond the 11.16.1 security fixes and Next.js to 16.2.11.
- Refreshed compatible dependencies and transitive resolutions in the lockfile.
- Kept `shadcn` as a development dependency: `src/app/globals.css` imports its
  Tailwind stylesheet during the build.
- Set temporary same-major floors for PostCSS 8.5.23 and Browserslist 4.28.7 in
  `pnpm-workspace.yaml`. Remove the overrides once upstream constraints resolve
  to patched versions without them.

### Remaining finding: sharp / libvips

`next > sharp@0.34.5` is reported by
[GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj).
The fix starts at sharp 0.35.0, outside Next.js's declared 0.34.x range. We do not
force a native-library upgrade across that range without upstream support.

For the current deployment, `output: "export"` and `images.unoptimized: true`
disable the Next image optimization endpoint. The runner contains only nginx
and static output, not sharp. This is a documented deployment-specific exposure
assessment, not a claim that the installed package is patched. Revisit this
finding when updating Next.js, enabling image optimization, adding image build
processing, or moving to a Node server. Review it again by 2026-10-05 if still open.

## Update validation

Use `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
and a production `pnpm build`. Test Markdown code, math and diagrams after
renderer updates. Review new advisories even when CI remains green.
