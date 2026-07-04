import { notFound } from "next/navigation"
import { getPaginatedPosts, getPostPageNumbers } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { PostsPageView } from "../../posts-page-view"

const CANONICAL_PAGE_NUMBER = /^[1-9]\d*$/

type PostsPageNumberProps = Readonly<{
  params: Promise<{
    page: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getPostPageNumbers()
    .filter((page) => page > 1)
    .map((page) => ({ page: String(page) }))
}

export async function generateMetadata({ params }: PostsPageNumberProps) {
  const { page } = await params

  return createPageMetadata({
    title: `전체 글 ${page}페이지`,
    description: `True Log에 공개된 Markdown 글 목록 ${page}페이지입니다.`,
    path: `/posts/page/${page}/`,
  })
}

export default async function PostsPageNumber({ params }: PostsPageNumberProps) {
  const { page } = await params
  const pageNumber = Number(page)

  if (!CANONICAL_PAGE_NUMBER.test(page) || !Number.isSafeInteger(pageNumber) || pageNumber <= 1) {
    notFound()
  }

  const pagination = getPaginatedPosts(pageNumber)

  if (pagination === undefined) {
    notFound()
  }

  return <PostsPageView pagination={pagination} />
}
