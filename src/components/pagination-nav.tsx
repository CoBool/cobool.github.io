import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationNextDisabled,
  PaginationPrevious,
  PaginationPreviousDisabled,
} from "@/components/ui/pagination"

type PaginationNavProps = Readonly<{
  currentPage: number
  totalPages: number
}>

export function PaginationNav({ currentPage, totalPages }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = getPaginationWindow(currentPage, totalPages)

  return (
    <Pagination aria-label="글 페이지" className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious href={getPostsPageHref(currentPage - 1)} />
          ) : (
            <PaginationPreviousDisabled />
          )}
        </PaginationItem>
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              aria-label={`${page}페이지`}
              href={getPostsPageHref(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext href={getPostsPageHref(currentPage + 1)} />
          ) : (
            <PaginationNextDisabled />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function getPaginationWindow(currentPage: number, totalPages: number): readonly number[] {
  const visiblePageCount = Math.min(5, totalPages)
  const maximumStartPage = totalPages - visiblePageCount + 1
  const startPage = Math.min(Math.max(currentPage - 2, 1), maximumStartPage)

  return Array.from({ length: visiblePageCount }, (_, index) => startPage + index)
}

function getPostsPageHref(page: number): string {
  return page === 1 ? "/posts/" : `/posts/page/${page}/`
}
