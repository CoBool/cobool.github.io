import Link from "next/link"
import type { TaxonomyItem } from "@/lib/post-collections"

type TaxonomyListProps = Readonly<{
  items: readonly TaxonomyItem[]
  basePath: "/categories" | "/tags"
  ariaLabel: string
  limit?: number
}>

export function TaxonomyList({ items, basePath, ariaLabel, limit }: TaxonomyListProps) {
  const visibleItems = limit === undefined ? items : items.slice(0, limit)

  return (
    <ul aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <li key={item.name}>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold leading-[1.55] text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`${basePath}/${encodeURIComponent(item.name)}/`}
          >
            <span>{item.name}</span>
            <span className="text-xs leading-[1.4] text-muted-foreground">{item.count}개</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
