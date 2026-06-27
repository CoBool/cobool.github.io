import { THEME_MODES, type ThemeMode } from "./theme"

const themeLabels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
}

export function ThemeModeControls() {
  return (
    <fieldset className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-input p-1 shadow-xs">
      <legend className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
        Theme mode
      </legend>
      {THEME_MODES.map((themeMode) => (
        <button
          aria-pressed={themeMode === "system"}
          className="min-h-9 cursor-pointer rounded-sm border-0 bg-transparent px-3 text-sm font-medium leading-[1.55] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-xs"
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
