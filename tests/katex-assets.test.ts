import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const katexDirectory = join(process.cwd(), "public", "katex")
const stylesheetPath = join(katexDirectory, "katex.min.css")
const licensePath = join(katexDirectory, "LICENSE")

describe("local KaTeX assets", () => {
  it("Given repository-owned KaTeX assets When checking the public directory Then includes CSS and its license", () => {
    expect(existsSync(stylesheetPath)).toBe(true)
    expect(existsSync(licensePath)).toBe(true)
  })

  it("Given the local KaTeX stylesheet When resolving font URLs Then every referenced font exists", () => {
    const stylesheet = readFileSync(stylesheetPath, "utf8")
    const fontPaths = Array.from(
      stylesheet.matchAll(/url\((fonts\/[^)]+)\)/g),
      (match) => match[1],
    ).filter((fontPath): fontPath is string => fontPath !== undefined)

    expect(fontPaths.length).toBeGreaterThan(0)

    for (const fontPath of new Set(fontPaths)) {
      expect(existsSync(join(katexDirectory, fontPath)), fontPath).toBe(true)
    }
  })

  it("Given repository-owned KaTeX assets When checking package scripts Then does not copy them after build", () => {
    const packageJson = readFileSync(join(process.cwd(), "package.json"), "utf8")

    expect(packageJson).not.toMatch(/^\s*"katex":/m)
    expect(packageJson).not.toContain("copy-katex-assets")
  })
})
