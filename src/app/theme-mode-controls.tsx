import { THEME_MODES, type ThemeMode } from "./theme"

const themeLabels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
}

export function ThemeModeControls() {
  return (
    <fieldset className="theme-control">
      <legend className="theme-control__legend">Theme mode</legend>
      {THEME_MODES.map((themeMode) => (
        <button
          aria-pressed={themeMode === "system"}
          className="theme-control__button"
          data-theme-mode={themeMode}
          key={themeMode}
          type="button"
        >
          {themeLabels[themeMode]}
        </button>
      ))}
    </fieldset>
  )
}
