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
    expect(existsSync("public/fonts/noto-sans-kr/OFL.txt")).toBe(true)
    expect(existsSync("public/fonts/geist-mono/OFL.txt")).toBe(true)

    const fontsCss = readFileSync("src/app/fonts.css", "utf8")
    const globalsCss = readFileSync("src/app/globals.css", "utf8")
    const fontUrls = Array.from(
      fontsCss.matchAll(/url\("?(\/fonts\/[^"')]+\.woff2)"?\)/g),
      (match) => match[1],
    ).filter((fontUrl) => fontUrl !== undefined)
    const notoFaces = fontsCss
      .split("@font-face")
      .slice(1)
      .filter((fontFace) => fontFace.includes("/fonts/noto-sans-kr/"))

    expect(fontUrls).toHaveLength(125)
    expect(new Set(fontUrls).size).toBe(125)
    for (const fontUrl of fontUrls) expect(existsSync(`public${fontUrl}`)).toBe(true)
    expect(notoFaces).toHaveLength(124)
    for (const fontFace of notoFaces) expect(fontFace).toContain("unicode-range:")
    expect(globalsCss).toContain('@import "./fonts.css";')
    expect(globalsCss).toContain('--font-sans: "Noto Sans KR Variable", ui-sans-serif')
    expect(globalsCss).toContain('--font-mono: "Geist Mono Variable", ui-monospace')
  })

  it("Given repository-owned font files When installing dependencies Then no font package is required", () => {
    const packageJson = readFileSync("package.json", "utf8")

    expect(packageJson).not.toContain('"@fontsource-variable/noto-sans-kr"')
    expect(packageJson).not.toContain('"geist"')
  })
})
