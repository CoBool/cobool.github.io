// @vitest-environment happy-dom
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { THEME_STORAGE_KEY } from "../src/features/theme/theme"
import { ThemeScript } from "../src/features/theme/theme-script"

type SystemPreference = Readonly<{
  setPrefersDark: (prefersDark: boolean) => void
}>

const themeScriptSource = renderToStaticMarkup(createElement(ThemeScript))
  .replace(/^<script>/, "")
  .replace(/<\/script>$/, "")

describe("theme bootstrap script", () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ""
    document.documentElement.removeAttribute("data-theme-mode")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("Given a stored dark mode When booting Then marks the document as dark", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark")
    stubSystemPreference(false)

    runThemeScript()

    expect(isDark()).toBe(true)
  })

  it("Given a stored light mode When booting Then leaves the document light", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light")
    stubSystemPreference(true)

    runThemeScript()

    expect(isDark()).toBe(false)
  })

  it("Given system mode When booting Then follows the operating system preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "system")
    stubSystemPreference(true)

    runThemeScript()

    expect(isDark()).toBe(true)
  })

  it("Given nothing stored When booting Then falls back to system and persists the choice", () => {
    stubSystemPreference(false)

    runThemeScript()

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system")
    expect(isDark()).toBe(false)
  })

  it("Given a malformed stored value When booting Then treats it as system instead of throwing", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "neon")
    stubSystemPreference(true)

    expect(() => runThemeScript()).not.toThrow()
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system")
    expect(isDark()).toBe(true)
  })

  it("Given system mode When the operating system preference changes Then the document follows", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "system")
    const preference = stubSystemPreference(false)

    runThemeScript()
    expect(isDark()).toBe(false)

    preference.setPrefersDark(true)

    expect(isDark()).toBe(true)
  })

  it("uses the system theme and keeps listening when localStorage is blocked", () => {
    blockStorage("getItem")
    blockStorage("setItem")
    const preference = stubSystemPreference(true)
    expect(() => runThemeScript()).not.toThrow()
    expect(isDark()).toBe(true)
    preference.setPrefersDark(false)
    expect(isDark()).toBe(false)
  })

  it("keeps an explicit tab preference after a failed storage write", () => {
    blockStorage("setItem")
    const preference = stubSystemPreference(false)
    runThemeScript()
    document.documentElement.setAttribute("data-theme-mode", "dark")
    document.documentElement.classList.add("dark")
    preference.setPrefersDark(false)
    expect(isDark()).toBe(true)
  })

  it("Given an explicit mode When the operating system preference changes Then the choice is kept", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light")
    const preference = stubSystemPreference(false)

    runThemeScript()
    preference.setPrefersDark(true)

    expect(isDark()).toBe(false)
  })
})

function runThemeScript(): void {
  new Function(themeScriptSource)()
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark")
}

function stubSystemPreference(initiallyPrefersDark: boolean): SystemPreference {
  let prefersDark = initiallyPrefersDark
  const listeners = new Set<() => void>()

  vi.spyOn(window, "matchMedia").mockImplementation(
    () =>
      ({
        get matches() {
          return prefersDark
        },
        addEventListener: (_event: string, listener: () => void) => {
          listeners.add(listener)
        },
        removeEventListener: (_event: string, listener: () => void) => {
          listeners.delete(listener)
        },
      }) as unknown as MediaQueryList,
  )

  return {
    setPrefersDark: (next: boolean) => {
      prefersDark = next

      for (const listener of listeners) {
        listener()
      }
    },
  }
}

function blockStorage(method: "getItem" | "setItem") {
  const storage = window.localStorage
  vi.spyOn(window, "localStorage", "get").mockReturnValue({
    length: 0,
    clear: () => {},
    key: () => null,
    removeItem: () => {},
    getItem: storage.getItem.bind(storage),
    setItem: storage.setItem.bind(storage),
    [method]: () => {
      throw new Error("Storage unavailable")
    },
  })
}
