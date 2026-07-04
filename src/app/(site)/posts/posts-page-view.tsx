import { PaginationNav } from "@/components/pagination-nav"
import { PostCard } from "@/components/post-card"
import type { PaginatedPosts } from "@/lib/post-collections"

type PostsPageViewProps = Readonly<{
  pagination: PaginatedPosts
}>

export function PostsPageView({ pagination }: PostsPageViewProps) {
  return (
    <section aria-labelledby="posts-title">
      <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
        Posts
      </p>
      <h1
        className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
        id="posts-title"
      >
        전체 글
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
        공개된 Markdown 글을 고정 글과 최신순 기준으로 나누어 읽습니다.
      </p>

      <ol className="mt-8 grid gap-4">
        {pagination.posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ol>
      <PaginationNav currentPage={pagination.page} totalPages={pagination.totalPages} />
    </section>
  )
}
