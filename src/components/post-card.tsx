import Link from "next/link"
import type { PostSummary } from "@/lib/posts"
import { PostMeta } from "./post-meta"
import { PostTags } from "./post-tags"

type PostCardProps = Readonly<{
  post: PostSummary
  /** 카드가 놓인 자리의 바로 위 제목 다음 단계여야 문서 개요에 구멍이 생기지 않는다. */
  headingLevel?: 2 | 3
}>

export function PostCard({ post, headingLevel = 3 }: PostCardProps) {
  const titleId = `post-${post.slug}`
  const Heading = `h${headingLevel}` as const

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-md border border-border bg-background p-4 transition-colors duration-150 hover:bg-accent/60"
    >
      <PostMeta post={post} />
      <Heading className="mt-3 text-xl font-bold leading-[1.35] text-foreground" id={titleId}>
        <Link
          className="outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href={`/posts/${post.slug}/`}
        >
          {post.title}
        </Link>
      </Heading>
      <p className="mt-2 max-w-2xl text-sm leading-[1.55] text-muted-foreground">{post.excerpt}</p>
      <PostTags ariaLabel={`${post.title} 태그`} tags={post.tags} />
    </article>
  )
}
