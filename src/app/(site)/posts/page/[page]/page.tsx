import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPaginatedPosts, getPostPageNumbers } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { STATIC_EXPORT_PLACEHOLDER, withStaticExportPlaceholder } from "@/lib/static-export"
import { PostsPageView } from "../../posts-page-view"

type PaginatedPostsPageProps = Readonly<{
  params: Promise<{
    page: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  const pages = getPostPageNumbers()
    .filter((page) => page > 1)
    .map((page) => ({ page: String(page) }))

  return withStaticExportPlaceholder(pages, { page: STATIC_EXPORT_PLACEHOLDER })
}

export async function generateMetadata({ params }: PaginatedPostsPageProps): Promise<Metadata> {
  const page = parsePageNumber((await params).page)

  if (page === undefined) {
    notFound()
  }

  return createPageMetadata({
    title: `전체 글 ${page}페이지`,
    description: `True Log에 공개된 Markdown 글 ${page}페이지입니다.`,
    path: `/posts/page/${page}/`,
  })
}

export default async function PaginatedPostsPage({ params }: PaginatedPostsPageProps) {
  const page = parsePageNumber((await params).page)
  const pagination = page === undefined ? undefined : getPaginatedPosts(page)

  if (pagination === undefined) {
    notFound()
  }

  return <PostsPageView pagination={pagination} />
}

function parsePageNumber(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) {
    return undefined
  }

  const page = Number(value)

  return Number.isSafeInteger(page) && page > 1 ? page : undefined
}
