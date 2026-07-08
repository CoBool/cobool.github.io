import type { TableOfContentsItem } from "@/lib/markdown"

type PostTableOfContentsProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

export function PostTableOfContents({ items }: PostTableOfContentsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="글 목차" className="text-sm leading-[1.55]">
      <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
        글 목차
      </p>
      <ol className="mt-3 space-y-1">
        {items.map((item) => (
          <li className={item.level === 3 ? "pl-3" : undefined} key={item.id}>
            <a
              className="block rounded-sm py-1 text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={`#${item.id}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
