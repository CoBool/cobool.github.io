import { notFound } from "next/navigation"
import { MainBreadcrumbs } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { Eyebrow, Lead, PageTitle } from "@/components/typography"
import { getPostsByTag, getTagIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"

type TagPageProps = Readonly<{
  params: Promise<{
    tag: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getTagIndex().map((tag) => ({ tag: tag.name }))
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params
  const tagName = decodeURIComponent(tag)

  return createPageMetadata({
    title: `${tagName} 태그`,
    description: `${tagName} 태그가 붙은 True Log 글 목록입니다.`,
    path: `/tags/${encodeURIComponent(tagName)}/`,
  })
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const tagName = decodeURIComponent(tag)
  const posts = getPostsByTag(tagName)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <>
      <MainBreadcrumbs currentLabel={tagName} pathname={`/tags/${encodeURIComponent(tagName)}/`} />
      <section aria-labelledby="tag-title">
        <Eyebrow>Tag</Eyebrow>
        <PageTitle className="mt-4 max-w-3xl" id="tag-title">
          {tagName}
        </PageTitle>
        <Lead className="mt-4">{posts.length}개 글</Lead>

        <ol className="mt-8 grid gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostCard headingLevel={2} post={post} />
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
