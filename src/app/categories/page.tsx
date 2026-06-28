import { TaxonomyList } from "@/components/taxonomy-list"
import { getCategoryIndex } from "@/lib/posts"
import { ThemeModeControls } from "../theme-mode-controls"

export default function CategoriesPage() {
  const categories = getCategoryIndex()

  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <a
            className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            홈으로
          </a>
          <ThemeModeControls />
        </div>

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
      </section>
    </main>
  )
}
