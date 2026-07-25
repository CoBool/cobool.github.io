import { MainBreadcrumbs } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { TaxonomyList } from "@/components/taxonomy-list"
import { siteConfig } from "@/config/site"
import { getCategoryIndex, getLatestPosts, getPinnedPosts, getTagIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
})

export default function HomePage() {
  const pinnedPosts = getPinnedPosts(3)
  const latestPosts = getLatestPosts(5)
  const categories = getCategoryIndex()
  const tags = getTagIndex()

  return (
    <>
      <MainBreadcrumbs pathname="/" />
      <section aria-labelledby="home-title" className="flex flex-col gap-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            True Log
          </p>
          <h1
            className="mt-4 text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="home-title"
          >
            정적 Markdown 기술 블로그
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
            콘텐츠 파이프라인, 정적 export, UI 토큰처럼 작은 구현 결정을 기록합니다. 고정 글과 최신
            글, 카테고리와 태그를 한 화면에서 빠르게 훑을 수 있게 구성했습니다.
          </p>
        </div>

        <section className="border-t border-border pt-8" aria-labelledby="pinned-posts-title">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
              Pinned
            </p>
            <h2
              className="text-2xl font-bold leading-tight text-foreground"
              id="pinned-posts-title"
            >
              고정 글
            </h2>
          </div>

          <ol className="mt-6 grid gap-4">
            {pinnedPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border pt-8" aria-labelledby="latest-posts-title">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
              Latest
            </p>
            <h2
              className="text-2xl font-bold leading-tight text-foreground"
              id="latest-posts-title"
            >
              최신 글
            </h2>
          </div>

          <ol className="mt-6 grid gap-4">
            {latestPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-8 border-t border-border pt-8 md:grid-cols-2">
          <section aria-labelledby="top-categories-title">
            <h2
              className="text-2xl font-bold leading-tight text-foreground"
              id="top-categories-title"
            >
              주요 카테고리
            </h2>
            <div className="mt-4">
              <TaxonomyList
                ariaLabel="주요 카테고리"
                basePath="/categories"
                items={categories}
                limit={4}
              />
            </div>
          </section>

          <section aria-labelledby="top-tags-title">
            <h2 className="text-2xl font-bold leading-tight text-foreground" id="top-tags-title">
              주요 태그
            </h2>
            <div className="mt-4">
              <TaxonomyList ariaLabel="주요 태그" basePath="/tags" items={tags} limit={8} />
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
