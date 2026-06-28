"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import type { NavigationItem } from "@/config/navigation"

const navigationIconByHref = {
  "/": Icons.navigation.home,
  "/posts/": Icons.navigation.posts,
  "/categories/": Icons.navigation.categories,
  "/tags/": Icons.navigation.tags,
  "/about/": Icons.navigation.about,
} satisfies Record<string, typeof Icons.navigation.home>

type NavigationHrefWithIcon = keyof typeof navigationIconByHref
type SidebarNavigationItem = NavigationItem & Readonly<{ href: NavigationHrefWithIcon }>

type SidebarNavigationProps = Readonly<{
  items: readonly SidebarNavigationItem[]
}>

export function SidebarNavigation({ items }: SidebarNavigationProps) {
  const pathname = normalizePath(usePathname() ?? "/")

  return (
    <nav aria-label="주요 탐색">
      <ul className="grid gap-1">
        {items.map((item) => {
          const NavigationIcon = navigationIconByHref[item.href]

          return (
            <li key={item.href}>
              <Link
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                className="relative flex h-10 items-center gap-2.5 rounded-md border border-transparent px-3.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors duration-150 before:absolute before:left-2 before:h-4 before:w-0.5 before:rounded-full before:bg-accent-foreground before:opacity-0 before:transition-opacity before:duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring aria-current:bg-accent/80 aria-current:text-accent-foreground aria-current:before:opacity-80"
                href={item.href}
              >
                <NavigationIcon aria-hidden="true" className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function isActivePath(pathname: string, href: string): boolean {
  const normalizedHref = normalizePath(href)

  if (normalizedHref === "/") {
    return pathname === "/"
  }

  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
}

function normalizePath(path: string): string {
  if (path === "/") {
    return path
  }

  return path.replace(/\/+$/, "")
}
