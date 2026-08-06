import { MainBreadcrumbs } from "@/components/layout"
import { TaxonomyList } from "@/components/taxonomy-list"
import { Eyebrow, Lead, PageTitle } from "@/components/typography"
import { getTagIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "태그",
  description: "True Log의 공개 글을 세부 기술과 관심사별로 묶은 태그 목록입니다.",
  path: "/tags/",
})

export default function TagsPage() {
  const tags = getTagIndex()

  return (
    <>
      <MainBreadcrumbs pathname="/tags/" />
      <section aria-labelledby="tags-title">
        <Eyebrow>Tags</Eyebrow>
        <PageTitle className="mt-4 max-w-3xl" id="tags-title">
          태그
        </PageTitle>
        <Lead className="mt-4 max-w-2xl">
          세부 기술과 관심사를 태그로 모았습니다. 태그 숫자는 발행된 글만 기준으로 합니다.
        </Lead>
        <div className="mt-8">
          <TaxonomyList ariaLabel="태그 목록" basePath="/tags" items={tags} />
        </div>
      </section>
    </>
  )
}
