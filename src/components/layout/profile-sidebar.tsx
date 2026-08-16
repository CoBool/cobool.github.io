import Link from "next/link"
import type { ReactNode } from "react"
import { iconActionVariants } from "@/components/icon-action"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { siteNavigationItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { SidebarMobileDisclosure } from "./sidebar-mobile-disclosure"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarSearchForm } from "./sidebar-search-form"
import { ThemeModeDropdown } from "./theme-mode-dropdown"

// 이 컴포넌트는 모든 페이지의 루트 셸에서 렌더된다. 프로필·링크처럼 정적인 부분까지
// 클라이언트 번들로 보내지 않도록 서버 컴포넌트로 두고, 상태가 필요한 조각
// (모바일 접기, 검색 폼, 테마 드롭다운, 활성 내비게이션)만 클라이언트 섬으로 남긴다.
export function ProfileSidebar() {
  return (
    <aside
      aria-label="사이트 프로필"
      className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm"
    >
      <ProfileSummary />
      <SidebarSearchForm />
      <SidebarMobileDisclosure>
        <SidebarContent />
      </SidebarMobileDisclosure>
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
        <AvatarFallback className="rounded-md bg-card text-sm font-semibold text-foreground">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <Link
          className="block truncate rounded-sm text-base font-bold leading-tight text-foreground underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
          href="/"
        >
          {siteConfig.name}
        </Link>
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
    <a className={iconActionVariants({ tone: "sidebar" })} href={href}>
      <span className="sr-only">{label}</span>
      {children}
    </a>
  )
}
