import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownContent } from "@/components/markdown-content"
import { PostMeta } from "@/components/post-meta"
import { PostTags } from "@/components/post-tags"
import { DesktopToc, PostToc } from "@/components/post-toc"
import { extractTableOfContents, renderMarkdownToHtml } from "@/lib/markdown"
import { findPostBySlug, getAllPosts, getPostSlugs } from "@/lib/posts"
import { ThemeModeControls } from "../../theme-mode-controls"

type PostPageProps = Readonly<{
  params: Promise<{
    slug: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = findPostBySlug(slug)

  if (post === undefined) {
    return {
      title: "글을 찾을 수 없습니다 | True Log",
    }
  }

  return {
    title: `${post.title} | True Log`,
    description: post.description,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = findPostBySlug(slug)

  if (post === undefined) {
    notFound()
  }

  const html = await renderMarkdownToHtml(post.content)
  const toc = extractTableOfContents(post.content)
  const posts = getAllPosts()
  const postIndex = posts.findIndex((candidate) => candidate.slug === post.slug)
  const previousPost = postIndex > 0 ? posts[postIndex - 1] : undefined
  const nextPost = postIndex >= 0 ? posts[postIndex + 1] : undefined

  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <article className="flex min-h-[calc(100dvh-4rem)] flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <a
              className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/posts/"
            >
              목록으로
            </a>
            <ThemeModeControls />
          </div>

          <header>
            <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
              True Log
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
              {post.description}
            </p>
            <div className="mt-6">
              <PostMeta post={post} />
            </div>
            <PostTags labelledBy={`${post.title} 태그`} tags={post.tags} />
          </header>

          <PostToc items={toc} />
          <MarkdownContent html={html} />
          <PostNavigation nextPost={nextPost} previousPost={previousPost} />
        </article>
        <DesktopToc items={toc} />
      </div>
    </main>
  )
}

function PostNavigation({
  nextPost,
  previousPost,
}: Readonly<{
  nextPost: ReturnType<typeof findPostBySlug>
  previousPost: ReturnType<typeof findPostBySlug>
}>) {
  if (previousPost === undefined && nextPost === undefined) {
    return null
  }

  return (
    <nav
      aria-label="이전 글과 다음 글"
      className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {previousPost ? (
        <a
          className="rounded-md border border-border bg-background p-4 text-sm leading-[1.55] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={`/posts/${previousPost.slug}/`}
        >
          <span className="block font-semibold text-foreground">이전 글</span>
          {previousPost.title}
        </a>
      ) : (
        <span />
      )}
      {nextPost ? (
        <a
          className="rounded-md border border-border bg-background p-4 text-sm leading-[1.55] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-right"
          href={`/posts/${nextPost.slug}/`}
        >
          <span className="block font-semibold text-foreground">다음 글</span>
          {nextPost.title}
        </a>
      ) : null}
    </nav>
  )
}
