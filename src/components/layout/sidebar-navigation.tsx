"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "@/config/navigation"

type SidebarNavigationProps = Readonly<{
  items: readonly NavigationItem[]
}>

export function SidebarNavigation({ items }: SidebarNavigationProps) {
  const pathname = normalizePath(usePathname() ?? "/")

  return (
    <nav aria-label="주요 탐색" className="mt-5 border-t border-sidebar-border pt-5">
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className="block rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-[1.55] text-muted-foreground transition-colors duration-150 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring aria-current:border-primary aria-current:bg-primary aria-current:text-primary-foreground"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
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
