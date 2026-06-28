import { AppShell, MainFrame } from "@/components/layout"
import { TaxonomyList } from "@/components/taxonomy-list"
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
    <AppShell>
      <MainFrame labelledBy="categories-title">
        <section aria-labelledby="categories-title">
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            Categories
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="categories-title"
          >
            카테고리
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
            넓은 주제별로 공개 글을 묶었습니다. 숫자는 발행된 Markdown 글만 기준으로 합니다.
          </p>
          <div className="mt-8">
            <TaxonomyList ariaLabel="카테고리 목록" basePath="/categories" items={categories} />
          </div>
        </section>
      </MainFrame>
    </AppShell>
  )
}
