import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { MainBreadcrumbs } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { TaxonomyList } from "@/components/taxonomy-list"
import { Eyebrow, Lead, PageTitle, SectionTitle, typography } from "@/components/typography"
import { siteConfig } from "@/config/site"
import { getCategoryIndex, getRecentPosts, getTagIndex } from "@/lib/posts"
import { createPageMetadata, createWebsiteJsonLd } from "@/lib/seo"
import { cn } from "@/lib/utils"

export const metadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
})

export default function HomePage() {
  const recentPosts = getRecentPosts(5)
  const categories = getCategoryIndex()
  const tags = getTagIndex()

  return (
    <>
      <JsonLd data={createWebsiteJsonLd()} />
      <MainBreadcrumbs pathname="/" />
      <section aria-labelledby="home-title" className="flex flex-col gap-12">
        <div className="max-w-2xl">
          <Eyebrow>True Log</Eyebrow>
          <PageTitle className="mt-4" id="home-title">
            기술과 문제 해결의 기록
          </PageTitle>
          <Lead className="mt-4 max-w-2xl">
            소프트웨어 엔지니어링, 웹 아키텍처, 그리고 개발 과정에서 마주한 기술적 고민과 문제 해결
            과정을 깊이 있게 기록합니다.
          </Lead>
        </div>

        <section className="border-t border-border pt-8" aria-labelledby="recent-posts-title">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <SectionTitle id="recent-posts-title">글</SectionTitle>
            <Link
              className="text-sm font-semibold leading-[1.55] text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/posts/"
            >
              전체 보기
            </Link>
          </div>

          {/* 고정 글은 getRecentPosts 의 정렬에서 이미 앞으로 오고, 카드가 '고정됨'을 표시한다. */}
          <ol className="mt-6 grid gap-4">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border pt-8" aria-labelledby="browse-title">
          <SectionTitle id="browse-title">둘러보기</SectionTitle>
          {/* 두 목록의 칩이 같은 모양이라, 라벨이 없으면 어느 쪽인지 눌러봐야 안다. */}
          <dl className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-5 sm:gap-y-3">
            <dt className={cn(typography("eyebrow"), "sm:pt-2.5")}>카테고리</dt>
            <dd>
              <TaxonomyList
                ariaLabel="주요 카테고리"
                basePath="/categories"
                items={categories}
                limit={4}
              />
            </dd>
            <dt className={cn(typography("eyebrow"), "sm:pt-2.5")}>태그</dt>
            <dd>
              <TaxonomyList ariaLabel="주요 태그" basePath="/tags" items={tags} limit={8} />
            </dd>
          </dl>
        </section>
      </section>
    </>
  )
}
