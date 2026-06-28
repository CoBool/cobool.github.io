import Link from "next/link"

type PaginationNavProps = Readonly<{
  currentPage: number
  totalPages: number
}>

export function PaginationNav({ currentPage, totalPages }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null
  }

  const previousHref = currentPage === 2 ? "/posts/" : `/posts/page/${currentPage - 1}/`
  const nextHref = `/posts/page/${currentPage + 1}/`

  return (
    <nav
      aria-label="글 페이지"
      className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-semibold leading-[1.55] text-muted-foreground">
        {currentPage} / {totalPages}
      </p>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium leading-[1.55] text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={previousHref}
          >
            이전
          </Link>
        ) : null}
        {currentPage < totalPages ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium leading-[1.55] text-primary-foreground shadow-xs transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={nextHref}
          >
            다음
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
