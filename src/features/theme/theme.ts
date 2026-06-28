export const THEME_STORAGE_KEY = "true-log-theme"

export const THEME_MODES = ["system", "light", "dark"] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export function parseThemeMode(value: string | null): ThemeMode {
  switch (value) {
    case "dark":
      return "dark"
    case "light":
      return "light"
    case "system":
      return "system"
    default:
      return "system"
  }
}

export function getThemeClassName(mode: ThemeMode): string {
  return mode === "dark" ? "dark" : ""
}
