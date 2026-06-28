import { ThemeModeControls } from "@/app/theme-mode-controls"
import { siteNavigationItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { SidebarNavigation } from "./sidebar-navigation"

export function ProfileSidebar() {
  return (
    <aside
      aria-label="사이트 프로필"
      className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm lg:sticky lg:top-8"
    >
      <div className="flex items-start gap-4 lg:flex-col">
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-card font-mono text-base font-semibold text-foreground shadow-xs"
        >
          TL
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight text-foreground">{siteConfig.name}</p>
          <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-sidebar-border pt-5">
        <p className="text-sm font-semibold leading-[1.55] text-foreground">
          {siteConfig.author.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm leading-[1.55]">
          <a
            className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            href={`mailto:${siteConfig.author.email}`}
          >
            {siteConfig.author.email}
          </a>
          <a
            className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            href={siteConfig.author.github}
          >
            GitHub
          </a>
        </div>
      </div>

      <SidebarNavigation items={siteNavigationItems} />

      <div className="mt-5 border-t border-sidebar-border pt-5">
        <ThemeModeControls />
      </div>
    </aside>
  )
}
