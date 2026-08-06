import { PaginationNav } from "@/components/pagination-nav"
import { PostCard } from "@/components/post-card"
import { Eyebrow, Lead, PageTitle } from "@/components/typography"
import type { PaginatedPosts } from "@/lib/post-collections"

type PostsPageViewProps = Readonly<{
  pagination: PaginatedPosts
}>

export function PostsPageView({ pagination }: PostsPageViewProps) {
  return (
    <section aria-labelledby="posts-title">
      <Eyebrow>Posts</Eyebrow>
      <PageTitle className="mt-4 max-w-3xl" id="posts-title">
        전체 글
      </PageTitle>
      <Lead className="mt-4 max-w-2xl">
        공개된 Markdown 글을 고정 글과 최신순 기준으로 나누어 읽습니다.
      </Lead>

      {pagination.posts.length === 0 ? (
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-base font-semibold leading-[1.65] text-foreground">
            아직 공개된 글이 없습니다.
          </p>
          <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">
            첫 글이 발행되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <>
          <ol className="mt-8 grid gap-4">
            {pagination.posts.map((post) => (
              <li key={post.slug}>
                <PostCard headingLevel={2} post={post} />
              </li>
            ))}
          </ol>
          <PaginationNav currentPage={pagination.page} totalPages={pagination.totalPages} />
        </>
      )}
    </section>
  )
}
