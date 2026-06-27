import { notFound } from "next/navigation"
import { getPaginatedPosts } from "@/lib/posts"
import { createPageMetadata } from "@/lib/seo"
import { PostsPageView } from "./posts-page-view"

export const metadata = createPageMetadata({
  title: "전체 글",
  description: "True Log에 공개된 Markdown 글 목록입니다.",
  path: "/posts/",
})

export default function PostsPage() {
  const pagination = getPaginatedPosts(1)

  if (pagination === undefined) {
    notFound()
  }

  return <PostsPageView pagination={pagination} />
}
