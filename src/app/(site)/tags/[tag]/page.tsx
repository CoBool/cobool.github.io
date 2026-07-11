import { notFound } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { getPostsByTag, getTagIndex } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { STATIC_EXPORT_PLACEHOLDER, withStaticExportPlaceholder } from "@/lib/static-export"

type TagPageProps = Readonly<{
  params: Promise<{
    tag: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return withStaticExportPlaceholder(
    getTagIndex().map((tag) => ({ tag: tag.name })),
    { tag: STATIC_EXPORT_PLACEHOLDER },
  )
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
    <section aria-labelledby="tag-title">
      <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">Tag</p>
      <h1
        className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
        id="tag-title"
      >
        {tagName}
      </h1>
      <p className="mt-4 text-base leading-[1.65] text-muted-foreground sm:text-lg">
        {posts.length}개 글
      </p>

      <ol className="mt-8 grid gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ol>
    </section>
  )
}
