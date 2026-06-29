import Link from "next/link"

export type AdjacentPost = Readonly<{
  title: string
  slug: string
}>

type PostNavigationProps = Readonly<{
  previousPost: AdjacentPost | undefined
  nextPost: AdjacentPost | undefined
}>

export function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  if (previousPost === undefined && nextPost === undefined) {
    return null
  }

  return (
    <nav
      aria-label="이전 글과 다음 글"
      className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {previousPost ? (
        <Link
          className="rounded-md border border-border bg-background p-4 text-sm leading-[1.55] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={`/posts/${previousPost.slug}/`}
        >
          <span className="block font-semibold text-foreground">이전 글</span>
          {previousPost.title}
        </Link>
      ) : (
        <span />
      )}
      {nextPost ? (
        <Link
          className="rounded-md border border-border bg-background p-4 text-sm leading-[1.55] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-right"
          href={`/posts/${nextPost.slug}/`}
        >
          <span className="block font-semibold text-foreground">다음 글</span>
          {nextPost.title}
        </Link>
      ) : null}
    </nav>
  )
}
