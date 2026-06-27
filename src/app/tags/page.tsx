import { TaxonomyList } from "@/components/taxonomy-list"
import { getTagIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { ThemeModeControls } from "../theme-mode-controls"

export const metadata = createPageMetadata({
  title: "태그",
  description: "True Log의 공개 글을 세부 기술과 관심사별로 묶은 태그 목록입니다.",
  path: "/tags/",
})

export default function TagsPage() {
  const tags = getTagIndex()

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

        <section aria-labelledby="tags-title">
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            Tags
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="tags-title"
          >
            태그
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
            세부 기술과 관심사를 태그로 모았습니다. 태그 숫자는 발행된 글만 기준으로 합니다.
          </p>
          <div className="mt-8">
            <TaxonomyList ariaLabel="태그 목록" basePath="/tags" items={tags} />
          </div>
        </section>
      </section>
    </main>
  )
}
