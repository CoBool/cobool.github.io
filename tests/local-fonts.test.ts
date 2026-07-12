import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("local font delivery", () => {
  it("Given repository-owned fonts When configuring the root layout Then it does not use a font package", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8")

    expect(layout).not.toContain('from "geist/font/mono"')
    expect(layout).not.toContain('from "next/font/google"')
    expect(layout).not.toContain("GeistMono.variable")
  })

  it("Given repository-owned font files When declaring font faces Then CSS references public font URLs", () => {
    expect(existsSync("src/app/fonts.css")).toBe(true)
    expect(existsSync("public/fonts/pretendard/OFL.txt")).toBe(true)
    expect(existsSync("public/fonts/pretendard/PretendardVariable.woff2")).toBe(true)
    expect(existsSync("public/fonts/geist-mono/OFL.txt")).toBe(true)

    const fontsCss = readFileSync("src/app/fonts.css", "utf8")
    const globalsCss = readFileSync("src/app/globals.css", "utf8")
    const fontUrls = Array.from(
      fontsCss.matchAll(/url\("?(\/fonts\/[^"')]+\.woff2)"?\)/g),
      (match) => match[1],
    ).filter((fontUrl) => fontUrl !== undefined)

    expect(fontUrls).toEqual([
      "/fonts/pretendard/PretendardVariable.woff2",
      "/fonts/geist-mono/GeistMono-Variable.woff2",
    ])
    for (const fontUrl of fontUrls) expect(existsSync(`public${fontUrl}`)).toBe(true)
    expect(fontsCss).toContain('font-family: "Pretendard Variable";')
    expect(fontsCss).toContain("font-weight: 45 920;")
    expect(globalsCss).toContain('@import "./fonts.css";')
    expect(globalsCss).toContain('--font-sans: "Pretendard Variable", ui-sans-serif')
    expect(globalsCss).toContain('--font-mono: "Geist Mono Variable", ui-monospace')
  })

  it("Given repository-owned font files When installing dependencies Then no font package is required", () => {
    const packageJson = readFileSync("package.json", "utf8")

    expect(packageJson).not.toContain('"@fontsource-variable/noto-sans-kr"')
    expect(packageJson).not.toContain('"geist"')
  })

  it("Given the mono font role When styling non-code UI Then components inherit the sans font", () => {
    const sansUiFiles = [
      "src/components/post-tags.tsx",
      "src/components/taxonomy-list.tsx",
      "src/components/layout/profile-sidebar.tsx",
      "src/app/not-found.tsx",
      "src/app/(site)/page.tsx",
      "src/app/(site)/tags/page.tsx",
      "src/app/(site)/tags/[tag]/page.tsx",
      "src/app/(site)/posts/posts-page-view.tsx",
      "src/app/(site)/posts/[slug]/page.tsx",
      "src/features/post-toc/post-mobile-toc.tsx",
      "src/features/post-toc/post-table-of-contents.tsx",
      "src/app/(site)/categories/page.tsx",
      "src/app/(site)/categories/[category]/page.tsx",
      "src/app/(site)/about/page.tsx",
    ]

    for (const filePath of sansUiFiles) {
      expect(readFileSync(filePath, "utf8"), filePath).not.toContain("font-mono")
    }
    expect(readFileSync("src/components/markdown-content.tsx", "utf8")).toContain(
      "prose-code:font-mono",
    )
  })
})
