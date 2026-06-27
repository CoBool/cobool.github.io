import type { Post } from "@/lib/posts"

type PostMetaProps = Readonly<{
  post: Pick<Post, "category" | "date" | "pinned" | "readingTime">
}>

export function PostMeta({ post }: PostMetaProps) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
      <time dateTime={post.date}>{post.date}</time>
      <span>{post.readingTime}</span>
      <a
        className="underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={`/categories/${encodeURIComponent(post.category)}/`}
      >
        {post.category}
      </a>
      {post.pinned ? <span>고정됨</span> : null}
    </div>
  )
}
