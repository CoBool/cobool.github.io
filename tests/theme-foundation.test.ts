import { readFileSync } from "node:fs"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { getThemeClassName, parseThemeMode, THEME_STORAGE_KEY } from "../src/app/theme"
import { ThemeModeControls } from "../src/app/theme-mode-controls"
import { ThemeScript } from "../src/app/theme-script"

describe("theme foundation", () => {
  it("documents the required design system sections", () => {
    const designSystem = readFileSync("DESIGN.md", "utf8")

    expect(designSystem).toContain("## 1. Atmosphere & Identity")
    expect(designSystem).toContain("## 2. Color")
    expect(designSystem).toContain("## 3. Typography")
    expect(designSystem).toContain("## 4. Spacing & Layout")
    expect(designSystem).toContain("## 5. Components")
    expect(designSystem).toContain("## 6. Motion & Interaction")
    expect(designSystem).toContain("## 7. Depth & Surface")
  })

  it("maps Tailwind tokens to the supplied CSS variables", () => {
    const css = readFileSync("src/app/globals.css", "utf8")

    expect(css).toContain("@custom-variant dark (&:is(.dark *));")
    expect(css).toContain("--background: oklch(1 0 0);")
    expect(css).toContain("--color-background: var(--background);")
    expect(css).toContain("--font-sans: var(--font-sans);")
  })

  it("parses persisted theme values and ignores malformed values", () => {
    expect(THEME_STORAGE_KEY).toBe("true-log-theme")
    expect(parseThemeMode("light")).toBe("light")
    expect(parseThemeMode("dark")).toBe("dark")
    expect(parseThemeMode("system")).toBe("system")
    expect(parseThemeMode("broken")).toBe("system")
    expect(parseThemeMode(null)).toBe("system")
    expect(getThemeClassName("dark")).toBe("dark")
    expect(getThemeClassName("light")).toBe("")
    expect(getThemeClassName("system")).toBe("")
  })

  it("renders theme controls with script-readable mode attributes", () => {
    const controls = renderToStaticMarkup(createElement(ThemeModeControls))
    const script = renderToStaticMarkup(createElement(ThemeScript))

    expect(controls).toContain('data-theme-mode="system"')
    expect(controls).toContain('data-theme-mode="light"')
    expect(controls).toContain('data-theme-mode="dark"')
    expect(script).toContain("data-theme-mode")
    expect(script).toContain("addEventListener")
  })
})
