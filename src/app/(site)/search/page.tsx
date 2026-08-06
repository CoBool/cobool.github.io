import { Suspense } from "react"
import { MainBreadcrumbs } from "@/components/layout"
import { PageTitle } from "@/components/typography"
import { SearchResults } from "@/features/search/search-results"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "검색",
  description: "True Log에 공개된 글을 검색합니다.",
  path: "/search/",
})

export default function SearchPage() {
  return (
    <>
      <MainBreadcrumbs currentLabel="검색" pathname="/search/" />
      <section aria-labelledby="search-title" className="flex flex-col gap-6">
        <PageTitle id="search-title">검색</PageTitle>
        {/* useSearchParams 는 클라이언트에서만 값을 읽으므로 정적 셸에는 경계가 필요하다. */}
        <Suspense fallback={<p className="text-sm text-muted-foreground">검색 준비 중입니다…</p>}>
          <SearchResults />
        </Suspense>
      </section>
    </>
  )
}
