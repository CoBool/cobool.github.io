import { MailIcon, RssIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { siteNavigationItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { GithubMarkIcon } from "./github-mark-icon"
import { ProfileSidebarDisclosure } from "./profile-sidebar-disclosure"
import { SidebarNavigation } from "./sidebar-navigation"
import { ThemeModeDropdown } from "./theme-mode-dropdown"

export function ProfileSidebar() {
  return (
    <ProfileSidebarDisclosure
      summary={
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
      }
    >
      <Separator className="my-5 bg-sidebar-border" />
      <SidebarNavigation items={siteNavigationItems} />
      <Separator className="my-5 bg-sidebar-border" />
      <div className="flex flex-wrap items-center gap-2">
        <ThemeModeDropdown />
        <SidebarActionLink href={siteConfig.author.github} label="GitHub">
          <GithubMarkIcon className="size-4" />
        </SidebarActionLink>
        <SidebarActionLink href={`mailto:${siteConfig.author.email}`} label="메일">
          <MailIcon aria-hidden="true" className="size-4" />
        </SidebarActionLink>
        <SidebarActionLink href={siteConfig.rssPath} label="RSS">
          <RssIcon aria-hidden="true" className="size-4" />
        </SidebarActionLink>
      </div>
    </ProfileSidebarDisclosure>
  )
}

type SidebarActionLinkProps = Readonly<{
  href: string
  label: string
  children: ReactNode
}>

function SidebarActionLink({ href, label, children }: SidebarActionLinkProps) {
  return (
    <a
      className="inline-flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
      href={href}
    >
      <span className="sr-only">{label}</span>
      {children}
    </a>
  )
}
