import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownContent } from "@/components/markdown-content"
import { PostMeta } from "@/components/post-meta"
import { PostTags } from "@/components/post-tags"
import { renderMarkdownToHtml } from "@/lib/markdown"
import { findPostBySlug, getPostSlugs } from "@/lib/posts"
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

  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <article className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <a
            className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
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

        <MarkdownContent html={html} />
      </article>
    </main>
  )
}
