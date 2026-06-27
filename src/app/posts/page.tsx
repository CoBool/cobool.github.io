import { notFound } from "next/navigation"
import { getPaginatedPosts } from "@/lib/posts"
import { PostsPageView } from "./posts-page-view"

export default function PostsPage() {
  const pagination = getPaginatedPosts(1)

  if (pagination === undefined) {
    notFound()
  }

  return <PostsPageView pagination={pagination} />
}
