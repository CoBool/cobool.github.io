import { CategoryGrid } from "@/components/category-grid"
import { MainBreadcrumbs } from "@/components/layout"
import { Lead, PageTitle } from "@/components/typography"
import { getCategoryIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "카테고리",
  description: "True Log의 공개 글을 넓은 주제별로 묶은 카테고리 목록입니다.",
  path: "/categories/",
})

export default function CategoriesPage() {
  const categories = getCategoryIndex()

  return (
    <>
      <MainBreadcrumbs pathname="/categories/" />
      <section aria-labelledby="categories-title">
        <PageTitle className="max-w-3xl" id="categories-title">
          카테고리
        </PageTitle>
        <Lead className="mt-4 max-w-2xl">
          넓은 주제별로 공개 글을 묶었습니다. 숫자는 발행된 Markdown 글만 기준으로 합니다.
        </Lead>
        <div className="mt-8">
          <CategoryGrid ariaLabel="카테고리 목록" categories={categories} />
        </div>
      </section>
    </>
  )
}
