import type { TableOfContentsItem } from "@/lib/markdown"
import { MobileToc } from "./mobile-toc"

type PostTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

export function DesktopToc({ items }: PostTocProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="글 목차"
        className="sticky top-8 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs"
      >
        <h2 className="text-sm font-semibold leading-[1.55] text-foreground">목차</h2>
        <ol className="mt-3 grid gap-2">
          {items.map((item) => (
            <li className={item.level === 3 ? "pl-4" : undefined} key={item.id}>
              <a
                className="block rounded-sm text-sm leading-[1.55] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={`#${item.id}`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  )
}

export function PostToc({ items }: PostTocProps) {
  return <MobileToc items={items} />
}
