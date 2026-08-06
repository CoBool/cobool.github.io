import { notFound } from "next/navigation"
import { MainBreadcrumbs } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { Eyebrow, Lead, PageTitle } from "@/components/typography"
import { getCategoryIndex, getPostsByCategory } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"

type CategoryPageProps = Readonly<{
  params: Promise<{
    category: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getCategoryIndex().map((category) => ({ category: category.name }))
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
    <>
      <MainBreadcrumbs
        currentLabel={categoryName}
        pathname={`/categories/${encodeURIComponent(categoryName)}/`}
      />
      <section aria-labelledby="category-title">
        <Eyebrow>Category</Eyebrow>
        <PageTitle className="mt-4 max-w-3xl" id="category-title">
          {categoryName}
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
