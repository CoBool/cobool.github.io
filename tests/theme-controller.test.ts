// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { THEME_STORAGE_KEY } from "../src/features/theme/theme"
import {
  applyThemeMode,
  getResolvedTheme,
  getStoredThemeMode,
  observeResolvedTheme,
  resolveThemeMode,
} from "../src/features/theme/theme-controller"

describe("theme controller", () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ""
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("Given a stored mode When reading Then malformed values fall back to system", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark")
    expect(getStoredThemeMode()).toBe("dark")

    window.localStorage.setItem(THEME_STORAGE_KEY, "neon")
    expect(getStoredThemeMode()).toBe("system")
  })

  it("Given explicit modes When resolving Then system consults the media query", () => {
    stubPrefersDark(true)

    expect(resolveThemeMode("light")).toBe("light")
    expect(resolveThemeMode("dark")).toBe("dark")
    expect(resolveThemeMode("system")).toBe("dark")
  })

  it("Given applyThemeMode When called Then it persists and toggles the document class", () => {
    stubPrefersDark(false)

    applyThemeMode("dark")
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(getResolvedTheme()).toBe("dark")

    applyThemeMode("system")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(getResolvedTheme()).toBe("light")
  })

  it("Given an observer When the document class changes Then it reports the resolved theme once per change", async () => {
    const seen: string[] = []
    const stop = observeResolvedTheme((theme) => seen.push(theme))

    document.documentElement.classList.add("dark")
    await waitForMutationObservers()
    expect(seen).toEqual(["dark"])

    stop()
    document.documentElement.classList.remove("dark")
    await waitForMutationObservers()
    expect(seen).toEqual(["dark"])
  })
})

// MutationObserver 콜백은 마이크로태스크로 배달되므로 한 틱 기다린다.
function waitForMutationObservers(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function stubPrefersDark(prefersDark: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(prefers-color-scheme: dark)" && prefersDark,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  )
}
