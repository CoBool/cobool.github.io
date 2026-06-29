import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GiscusComments } from "@/components/giscus-comments"
import { AppShell, MainFrame } from "@/components/layout"
import { MarkdownContent } from "@/components/markdown-content"
import { PostMeta } from "@/components/post-meta"
import { PostTags } from "@/components/post-tags"
import { getPublicIntegrations } from "@/config/integrations"
import {
  extractTableOfContents,
  renderMarkdownToHtml,
  type SanitizedHtml,
  type TableOfContentsItem,
} from "@/lib/markdown"
import { findPostBySlug, getAllPosts, getPostSlugs } from "@/lib/posts"
import { createPageMetadata, createPostMetadata } from "@/lib/seo"
import { type AdjacentPost, PostNavigation } from "./_components/post-navigation"

type PostPageProps = Readonly<{
  params: Promise<{
    slug: string
  }>
}>

type PostReadingContent = Readonly<{
  html: SanitizedHtml
  toc: readonly TableOfContentsItem[]
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = findPostBySlug(slug)

  if (post === undefined) {
    return createPageMetadata({
      title: "글을 찾을 수 없습니다",
      description: "요청한 글을 찾을 수 없습니다.",
      path: `/posts/${slug}/`,
    })
  }

  return createPostMetadata(post)
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = findPostBySlug(slug)

  if (post === undefined) {
    notFound()
  }

  const readingContent = await renderPostReadingContent(post.content)
  const posts = getAllPosts()
  const postIndex = posts.findIndex((candidate) => candidate.slug === post.slug)
  const previousPost = postIndex > 0 ? toAdjacentPost(posts[postIndex - 1]) : undefined
  const nextPost = postIndex >= 0 ? toAdjacentPost(posts[postIndex + 1]) : undefined
  const integrations = getPublicIntegrations()

  return (
    <AppShell>
      <MainFrame as="article" labelledBy="post-title">
        <div className="flex items-start justify-between gap-6">
          <a
            className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/posts/"
          >
            목록으로
          </a>
        </div>

        <header>
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            True Log
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="post-title"
          >
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

        <PostBody readingContent={readingContent} />
        <PostNavigation nextPost={nextPost} previousPost={previousPost} />
        <GiscusComments config={integrations.giscus} />
      </MainFrame>
    </AppShell>
  )
}

async function renderPostReadingContent(content: string): Promise<PostReadingContent> {
  return {
    html: await renderMarkdownToHtml(content),
    toc: extractTableOfContents(content),
  }
}

function PostBody({ readingContent }: Readonly<{ readingContent: PostReadingContent }>) {
  return <MarkdownContent html={readingContent.html} />
}

function toAdjacentPost(post: AdjacentPost | undefined): AdjacentPost | undefined {
  return post === undefined
    ? undefined
    : {
        title: post.title,
        slug: post.slug,
      }
}
