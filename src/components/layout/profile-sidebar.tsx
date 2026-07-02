"use client"

import { SearchIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { type FormEvent, type ReactNode, useEffect, useId, useState } from "react"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteNavigationItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SidebarNavigation } from "./sidebar-navigation"
import { ThemeModeDropdown } from "./theme-mode-dropdown"

export function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== null) {
      setIsOpen(false)
    }
  }, [pathname])

  return (
    <aside
      aria-label="사이트 프로필"
      className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm"
    >
      <ProfileSummary />
      <SearchForm />
      <Button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="group mt-5 w-full cursor-pointer justify-between rounded-md border-transparent bg-transparent text-sidebar-foreground hover:bg-transparent hover:text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground xl:hidden"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        size="lg"
        type="button"
        variant="ghost"
      >
        탐색
        <Icons.chevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-aria-expanded:rotate-180"
        />
      </Button>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out xl:hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={contentId}
        inert={!isOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <SidebarContent />
        </div>
      </div>
      <div className="hidden xl:block">
        <SidebarContent />
      </div>
    </aside>
  )
}

function ProfileSummary() {
  const avatarFallback = getAvatarFallback(siteConfig.author.name)

  return (
    <div className="flex items-center gap-3.5">
      <Avatar className="group/avatar size-14 rounded-md border border-sidebar-border shadow-xs">
        <AvatarImage
          alt={siteConfig.author.name}
          className="object-[center_35%] transition-transform duration-300 ease-out group-hover/avatar:scale-125"
          src={siteConfig.author.avatar}
        />
        <AvatarFallback className="rounded-md bg-card font-mono text-sm font-semibold text-foreground">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-base font-bold leading-tight text-foreground">
          {siteConfig.name}
        </p>
        <p className="mt-1 text-xs font-semibold leading-[1.4] text-muted-foreground">
          Technical notebook
        </p>
      </div>
    </div>
  )
}

function getAvatarFallback(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("ko-KR") || "?"
}

function SearchForm() {
  const [query, setQuery] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.alert("검색 테스트 중 입니다.")
  }

  return (
    <search className="mt-5">
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="sidebar-search">
          사이트 검색
        </label>
        <div className="flex h-10 w-full items-center gap-2.5 rounded-md border border-input bg-background px-3 text-sm font-semibold leading-[1.55] text-muted-foreground shadow-xs transition-colors duration-150 focus-within:border-ring focus-within:text-foreground focus-within:ring-2 focus-within:ring-ring/20">
          <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
          <input
            aria-label="사이트 검색"
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            id="sidebar-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search"
            type="search"
            value={query}
          />
        </div>
      </form>
    </search>
  )
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
          <Icons.social.github className="size-4" />
        </SidebarActionLink>
        <SidebarActionLink href={`mailto:${siteConfig.author.email}`} label="메일">
          <Icons.social.mail aria-hidden="true" className="size-4" />
        </SidebarActionLink>
        <SidebarActionLink href={siteConfig.rssPath} label="RSS">
          <Icons.social.rss aria-hidden="true" className="size-4" />
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
