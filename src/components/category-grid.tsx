import Link from "next/link"
import { Icons } from "@/components/icons"
import type { TaxonomyItem } from "@/lib/post-collections"

type CategoryGridProps = Readonly<{
  categories: readonly TaxonomyItem[]
  ariaLabel: string
}>

// 카테고리는 글마다 하나만 붙는 배타적 분류라 태그보다 수가 적고 무게감이 있어야 한다.
// 그래서 태그와 같은 칩 목록 대신, 섹션 허브처럼 보이는 카드 그리드를 쓴다.
export function CategoryGrid({ categories, ariaLabel }: CategoryGridProps) {
  return (
    <ul aria-label={ariaLabel} className="grid gap-4 sm:grid-cols-2">
      {categories.map((category) => (
        <li key={category.name}>
          <Link
            className="group flex items-center justify-between gap-4 rounded-md border border-border bg-background p-5 transition-colors duration-150 hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/categories/${encodeURIComponent(category.name)}/`}
          >
            <span className="flex items-center gap-3">
              <Icons.navigation.categories
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
              <span className="flex flex-col">
                <span className="text-lg font-bold leading-[1.35] text-foreground">
                  {category.name}
                </span>
                <span className="text-sm leading-[1.55] text-muted-foreground">
                  {category.count}개 글
                </span>
              </span>
            </span>
            <Icons.chevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
