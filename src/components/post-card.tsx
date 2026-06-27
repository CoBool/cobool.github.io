import Link from "next/link"
import type { Post } from "@/lib/posts"
import { PostMeta } from "./post-meta"
import { PostTags } from "./post-tags"

type PostCardProps = Readonly<{
  post: Post
}>

export function PostCard({ post }: PostCardProps) {
  const titleId = `post-${post.slug}`

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-md border border-border bg-background p-4 transition-colors duration-150 hover:bg-accent/60"
    >
      <PostMeta post={post} />
      <h3 className="mt-3 text-xl font-bold leading-[1.35] text-foreground" id={titleId}>
        <Link
          className="outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href={`/posts/${post.slug}/`}
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-[1.55] text-muted-foreground">{post.excerpt}</p>
      <PostTags labelledBy={`${post.title} 태그`} tags={post.tags} />
    </article>
  )
}
