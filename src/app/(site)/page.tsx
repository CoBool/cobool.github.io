import { MainBreadcrumbs } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { TaxonomyList } from "@/components/taxonomy-list"
import { Eyebrow, Lead, PageTitle, SectionTitle } from "@/components/typography"
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
          <Eyebrow>True Log</Eyebrow>
          <PageTitle className="mt-4" id="home-title">
            정적 Markdown 기술 블로그
          </PageTitle>
          <Lead className="mt-4 max-w-2xl">
            콘텐츠 파이프라인, 정적 export, UI 토큰처럼 작은 구현 결정을 기록합니다. 고정 글과 최신
            글, 카테고리와 태그를 한 화면에서 빠르게 훑을 수 있게 구성했습니다.
          </Lead>
        </div>

        <section className="border-t border-border pt-8" aria-labelledby="pinned-posts-title">
          <div className="flex flex-col gap-2">
            <Eyebrow>Pinned</Eyebrow>
            <SectionTitle id="pinned-posts-title">고정 글</SectionTitle>
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
            <Eyebrow>Latest</Eyebrow>
            <SectionTitle id="latest-posts-title">최신 글</SectionTitle>
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
            <SectionTitle id="top-categories-title">주요 카테고리</SectionTitle>
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
            <SectionTitle id="top-tags-title">주요 태그</SectionTitle>
            <div className="mt-4">
              <TaxonomyList ariaLabel="주요 태그" basePath="/tags" items={tags} limit={8} />
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
