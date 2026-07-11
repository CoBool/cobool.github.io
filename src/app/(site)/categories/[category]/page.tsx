import { notFound } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { getCategoryIndex, getPostsByCategory } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { STATIC_EXPORT_PLACEHOLDER, withStaticExportPlaceholder } from "@/lib/static-export"

type CategoryPageProps = Readonly<{
  params: Promise<{
    category: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return withStaticExportPlaceholder(
    getCategoryIndex().map((category) => ({ category: category.name })),
    { category: STATIC_EXPORT_PLACEHOLDER },
  )
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryName = decodeURIComponent(category)

  return createPageMetadata({
    title: `${categoryName} 카테고리`,
    description: `${categoryName} 카테고리에 속한 True Log 글 목록입니다.`,
    path: `/categories/${encodeURIComponent(categoryName)}/`,
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryName = decodeURIComponent(category)
  const posts = getPostsByCategory(categoryName)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <section aria-labelledby="category-title">
      <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
        Category
      </p>
      <h1
        className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
        id="category-title"
      >
        {categoryName}
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
