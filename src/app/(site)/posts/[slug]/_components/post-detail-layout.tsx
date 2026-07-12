import type { ReactNode } from "react"
import { PostMobileToc } from "@/features/post-toc/post-mobile-toc"
import { PostTableOfContents } from "@/features/post-toc/post-table-of-contents"
import type { TableOfContentsItem } from "@/lib/markdown"

type PostDetailLayoutProps = Readonly<{
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
  title: string
  tocItems: readonly TableOfContentsItem[]
}>

export function PostDetailLayout({
  header,
  children,
  footer,
  title,
  tocItems,
}: PostDetailLayoutProps) {
  const hasTableOfContents = tocItems.length > 0
  const bodyClassName = hasTableOfContents
    ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start"
    : "grid gap-10"

  return (
    <>
      {header}
      <PostMobileToc items={tocItems} title={title} />
      <div className={bodyClassName}>
        <div className="min-w-0">{children}</div>
        {hasTableOfContents ? (
          <aside className="hidden self-stretch pt-0 xl:block">
            <div className="sticky top-6">
              <PostTableOfContents items={tocItems} />
            </div>
          </aside>
        ) : null}
      </div>
      {footer}
    </>
  )
}
