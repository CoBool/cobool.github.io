import Link from "next/link"
import { Icons } from "@/components/icons"
import { JsonLd } from "@/components/json-ld"
import { siteNavigationItems } from "@/config/navigation"
import { absoluteUrl } from "@/config/site"

type BreadcrumbItem = Readonly<{
  label: string
  href?: string
}>

type MainBreadcrumbsProps = Readonly<{
  pathname: string
  currentLabel?: string | undefined
}>

const navigationLabelByPath = new Map(
  siteNavigationItems.map((item) => [normalizePath(item.href), item.label]),
)

export function MainBreadcrumbs({ pathname, currentLabel }: MainBreadcrumbsProps) {
  const items = buildBreadcrumbItems(pathname, currentLabel)

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(items)} />
      <nav aria-label="현재 위치" className="min-w-0">
        <ol className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden whitespace-nowrap text-xs font-semibold leading-[1.4] text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li
                className={
                  isLast
                    ? "flex min-w-0 items-center gap-1 overflow-hidden"
                    : "flex shrink-0 items-center gap-1"
                }
                key={item.href ?? item.label}
              >
                {index > 0 ? (
                  <Icons.chevronRight
                    aria-hidden="true"
                    className="size-3.5 shrink-0 translate-y-px opacity-60"
                  />
                ) : null}
                {isLast || item.href === undefined ? (
                  <span aria-current="page" className="min-w-0 truncate text-foreground">
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
    </>
  )
}

function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href === undefined ? undefined : absoluteUrl(item.href),
    })),
  }
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
    const label = (isLast ? currentLabel : undefined) ?? mappedLabel ?? segment

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
