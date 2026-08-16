import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getKatexStylesheetUrl } from "../src/components/markdown-content"

const katexDirectory = join(process.cwd(), "public", "katex")
const stylesheetPath = join(katexDirectory, "katex.min.css")
const licensePath = join(katexDirectory, "LICENSE")

describe("local KaTeX assets", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

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

    expect(new Set(fontPaths).size).toBe(19)
    expect(fontPaths.every((fontPath) => fontPath.endsWith(".woff2"))).toBe(true)
    expect(fontPaths).not.toContain("fonts/KaTeX_Caligraphic-Bold.woff2")

    for (const fontPath of new Set(fontPaths)) {
      expect(existsSync(join(katexDirectory, fontPath)), fontPath).toBe(true)
    }
  })

  it("Given repository-owned KaTeX assets When checking package scripts Then does not copy them after build", () => {
    const packageJson = readFileSync(join(process.cwd(), "package.json"), "utf8")

    expect(packageJson).not.toMatch(/^\s*"katex":/m)
    expect(packageJson).not.toContain("copy-katex-assets")
  })

  describe("getKatexStylesheetUrl", () => {
    it("Given no NEXT_PUBLIC_BASE_PATH When resolving Then returns root stylesheet path", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      delete process.env["NEXT_PUBLIC_BASE_PATH"]
      expect(getKatexStylesheetUrl()).toBe("/katex/katex.min.css")
    })

    it("Given NEXT_PUBLIC_BASE_PATH When resolving Then prepends base path with normalized slashes", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/my-blog/"
      expect(getKatexStylesheetUrl()).toBe("/my-blog/katex/katex.min.css")
    })
  })
})
