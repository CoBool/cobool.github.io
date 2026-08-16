import { siteConfig } from "@/config/site"
import type { PostSummary } from "@/lib/posts"

type PostMetaProps = Readonly<{
  post: Pick<PostSummary, "category" | "date" | "pinned" | "readingMinutes">
}>

// 날짜는 시각이 아니라 달력상의 하루라, 표준시를 UTC 로 고정해 하루가 밀리지 않게 한다.
const postDateFormat = new Intl.DateTimeFormat(siteConfig.language, {
  dateStyle: "long",
  timeZone: "UTC",
})

export function PostMeta({ post }: PostMetaProps) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold leading-[1.4] text-muted-foreground">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span>{post.readingMinutes}분 읽기</span>
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

function formatPostDate(date: string): string {
  return postDateFormat.format(new Date(`${date}T00:00:00Z`))
}
