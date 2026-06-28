"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { parseThemeMode, THEME_MODES, THEME_STORAGE_KEY, type ThemeMode } from "@/app/theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const themeLabels: Record<ThemeMode, string> = {
  system: "시스템",
  light: "라이트",
  dark: "다크",
}

const themeIcons: Record<ThemeMode, typeof MonitorIcon> = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") {
    return mode
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeMode(mode: ThemeMode): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  document.documentElement.classList.toggle("dark", resolveTheme(mode) === "dark")
}

export function ThemeModeDropdown() {
  const [mode, setMode] = useState<ThemeMode>("system")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMode(parseThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY)))
  }, [])

  const handleModeChange = (nextMode: string) => {
    const parsedMode = parseThemeMode(nextMode)
    setMode(parsedMode)
    applyThemeMode(parsedMode)
    setIsOpen(false)
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger
        aria-label="Theme mode"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-transparent text-sm font-medium text-sidebar-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        )}
        type="button"
      >
        {mode === "dark" ? (
          <MoonIcon aria-hidden="true" className="size-4" />
        ) : mode === "light" ? (
          <SunIcon aria-hidden="true" className="size-4" />
        ) : (
          <MonitorIcon aria-hidden="true" className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-52 rounded-xl border border-sidebar-border bg-sidebar/95 p-1.5 text-sidebar-foreground shadow-[0_16px_36px_rgb(0_0_0/0.24)] backdrop-blur"
        side="top"
        sideOffset={8}
      >
        <DropdownMenuRadioGroup
          className="flex flex-col gap-1"
          onValueChange={handleModeChange}
          value={mode}
        >
          {THEME_MODES.map((themeMode) => {
            const ThemeIcon = themeIcons[themeMode]

            return (
              <DropdownMenuRadioItem
                className="h-10 gap-2.5 rounded-lg px-3 pr-10 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:bg-accent/80 data-[state=checked]:text-accent-foreground [&_[data-slot=dropdown-menu-radio-item-indicator]]:right-3"
                key={themeMode}
                value={themeMode}
              >
                <ThemeIcon aria-hidden="true" className="size-4 text-current" />
                <span>{themeLabels[themeMode]}</span>
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
