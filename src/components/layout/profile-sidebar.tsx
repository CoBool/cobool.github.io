"use client"

import { ChevronDownIcon, MailIcon, RssIcon } from "lucide-react"
import { type ReactNode, useId, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteNavigationItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { GithubMarkIcon } from "./github-mark-icon"
import { SidebarNavigation } from "./sidebar-navigation"
import { ThemeModeDropdown } from "./theme-mode-dropdown"

export function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  return (
    <aside
      aria-label="사이트 프로필"
      className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm lg:sticky lg:top-8"
    >
      <ProfileSummary />
      <Button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="group mt-5 w-full justify-between rounded-md border-transparent bg-transparent text-sidebar-foreground hover:bg-transparent hover:text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground lg:hidden"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        size="lg"
        type="button"
        variant="ghost"
      >
        탐색
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-aria-expanded:rotate-180"
        />
      </Button>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out lg:hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={contentId}
        inert={!isOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <SidebarContent />
        </div>
      </div>
      <div className="hidden lg:block">
        <SidebarContent />
      </div>
    </aside>
  )
}

function ProfileSummary() {
  const avatarFallback = getAvatarFallback(siteConfig.author.name)

  return (
    <div className="flex items-start gap-4 lg:flex-col">
      <Avatar className="size-14 rounded-lg border border-sidebar-border shadow-xs">
        <AvatarImage alt={siteConfig.author.name} src={siteConfig.author.avatar} />
        <AvatarFallback className="rounded-lg bg-card font-mono text-base font-semibold text-foreground">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight text-foreground">{siteConfig.name}</p>
        <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">
          {siteConfig.description}
        </p>
      </div>
    </div>
  )
}

function getAvatarFallback(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("ko-KR") || "?"
}

function SidebarContent() {
  return (
    <>
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
    </>
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
      className="inline-flex size-9 items-center justify-center rounded-lg bg-transparent text-sidebar-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
      href={href}
    >
      <span className="sr-only">{label}</span>
      {children}
    </a>
  )
}
