"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import { siteNavigationItems } from "@/config/navigation"

type BreadcrumbItem = Readonly<{
  label: string
  href?: string
}>

type MainBreadcrumbsProps = Readonly<{
  currentLabel?: string | undefined
}>

const navigationLabelByPath = new Map(
  siteNavigationItems.map((item) => [normalizePath(item.href), item.label]),
)

export function MainBreadcrumbs({ currentLabel }: MainBreadcrumbsProps) {
  const pathname = usePathname() ?? "/"
  const items = buildBreadcrumbItems(pathname, currentLabel)

  return (
    <nav aria-label="현재 위치" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold leading-[1.4] text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li className="flex min-w-0 items-center gap-1" key={item.href ?? item.label}>
              {index > 0 ? (
                <Icons.chevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 translate-y-px opacity-60"
                />
              ) : null}
              {isLast || item.href === undefined ? (
                <span aria-current="page" className="truncate text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  className="truncate underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={item.href}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function buildBreadcrumbItems(
  pathname: string,
  currentLabel?: string,
): readonly BreadcrumbItem[] {
  const normalizedPath = normalizePath(pathname)

  if (normalizedPath === "/") {
    return [{ label: getNavigationLabel("/") }]
  }

  if (normalizedPath.startsWith("/posts/page/")) {
    return [{ label: getNavigationLabel("/"), href: "/" }, { label: getNavigationLabel("/posts") }]
  }

  const segments = normalizedPath.split("/").filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: getNavigationLabel("/"), href: "/" }]

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1
    const mappedLabel = navigationLabelByPath.get(href)
    const label = isLast && currentLabel !== undefined ? currentLabel : (mappedLabel ?? segment)

    items.push(isLast ? { label } : { href, label })
  })

  return items
}

function getNavigationLabel(path: string): string {
  return navigationLabelByPath.get(normalizePath(path)) ?? path
}

function normalizePath(pathname: string): string {
  if (pathname === "/") {
    return pathname
  }

  return pathname.replace(/\/+$/, "")
}
