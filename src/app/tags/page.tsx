import { AppShell, MainFrame } from "@/components/layout"
import { TaxonomyList } from "@/components/taxonomy-list"
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
    <AppShell>
      <MainFrame labelledBy="tags-title">
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
      </MainFrame>
    </AppShell>
  )
}
