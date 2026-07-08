import type { TableOfContentsItem } from "@/lib/markdown"
import { PostTableOfContents } from "./post-table-of-contents"

type PostMobileTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

export function PostMobileToc({ items }: PostMobileTocProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <details className="rounded-md border border-border bg-background p-4 shadow-xs xl:hidden">
      <summary className="cursor-pointer font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground marker:text-muted-foreground">
        목차 열기
      </summary>
      <div className="mt-4 border-t border-border pt-4">
        <PostTableOfContents items={items} />
      </div>
    </details>
  )
}
