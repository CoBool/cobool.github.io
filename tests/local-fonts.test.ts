import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("local font delivery", () => {
  it("Given the root layout When configuring fonts Then it uses only local font packages", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8")

    expect(layout).toContain('import { GeistMono } from "geist/font/mono"')
    expect(layout).not.toContain('from "next/font/google"')
    expect(layout).not.toContain("Noto_Sans_KR")
    expect(layout).toContain("GeistMono.variable")
  })

  it("Given local font packages When mapping typography tokens Then it preserves sans and mono roles", () => {
    const css = readFileSync("src/app/globals.css", "utf8")

    expect(css).toContain('@import "@fontsource-variable/noto-sans-kr";')
    expect(css).toContain('--font-sans: "Noto Sans KR Variable", ui-sans-serif')
    expect(css).toContain("--font-mono: var(--font-geist-mono), ui-monospace")
  })

  it("Given a clean install When resolving font dependencies Then it pins both local font packages", () => {
    const packageJson = readFileSync("package.json", "utf8")

    expect(packageJson).toContain('"@fontsource-variable/noto-sans-kr"')
    expect(packageJson).toContain('"geist"')
  })
})
