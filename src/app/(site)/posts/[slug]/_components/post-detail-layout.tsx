import type { ReactNode } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"
import { PostMobileToc } from "./post-mobile-toc"
import { PostTableOfContents } from "./post-table-of-contents"

type PostDetailLayoutProps = Readonly<{
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
  tocItems: readonly TableOfContentsItem[]
}>

export function PostDetailLayout({ header, children, footer, tocItems }: PostDetailLayoutProps) {
  const hasTableOfContents = tocItems.length > 0
  const bodyClassName = hasTableOfContents
    ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start"
    : "grid gap-10"

  return (
    <>
      {header}
      <PostMobileToc items={tocItems} />
      <div className={bodyClassName}>
        <div className="min-w-0">{children}</div>
        {hasTableOfContents ? (
          <aside className="hidden self-stretch pt-24 xl:block">
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
