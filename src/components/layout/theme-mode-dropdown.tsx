"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { parseThemeMode, THEME_MODES, THEME_STORAGE_KEY, type ThemeMode } from "@/app/theme"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeLabels: Record<ThemeMode, string> = {
  system: "시스템",
  light: "라이트",
  dark: "다크",
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
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Theme mode"
          className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsOpen(true)}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          {mode === "dark" ? (
            <MoonIcon aria-hidden="true" className="size-4" />
          ) : mode === "light" ? (
            <SunIcon aria-hidden="true" className="size-4" />
          ) : (
            <MonitorIcon aria-hidden="true" className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 border border-sidebar-border bg-popover shadow-lg"
        side="top"
        sideOffset={8}
      >
        <DropdownMenuRadioGroup onValueChange={handleModeChange} value={mode}>
          {THEME_MODES.map((themeMode) => (
            <DropdownMenuRadioItem key={themeMode} value={themeMode}>
              {themeLabels[themeMode]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
