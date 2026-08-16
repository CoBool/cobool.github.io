import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { GiscusComments } from "@/components/giscus-comments"
import { JsonLd } from "@/components/json-ld"
import { MainBreadcrumbs, ReadingProgressBar } from "@/components/layout"
import { MarkdownContent } from "@/components/markdown-content"
import { PostMeta } from "@/components/post-meta"
import { PostShare } from "@/components/post-share"
import { PostTags } from "@/components/post-tags"
import { Lead, PageTitle, typography } from "@/components/typography"
import { getPublicIntegrations } from "@/config/integrations"
import { absoluteUrl, siteConfig } from "@/config/site"
import { shouldRenderTableOfContents } from "@/features/post-toc/toc-policy"
import { type RenderedMarkdown, renderMarkdown } from "@/lib/markdown"
import { findPostBySlug, getAdjacentPosts, getPostSlugs } from "@/lib/posts"
import { createBlogPostingJsonLd, createPageMetadata, createPostMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"
import { PostDetailLayout } from "./_components/post-detail-layout"
import { type AdjacentPost, PostNavigation } from "./_components/post-navigation"

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

  const readingContent = await renderMarkdown(post.content, {
    sourcePath: `content/posts/${post.slug}.md`,
  })
  const adjacentPosts = getAdjacentPosts(post.slug)
  const previousPost = toAdjacentPost(adjacentPosts.previous)
  const nextPost = toAdjacentPost(adjacentPosts.next)
  const integrations = getPublicIntegrations()
  const tocItems = shouldRenderTableOfContents({
    siteEnabled: siteConfig.toc.enabled,
    postToc: post.toc,
    minHeadings: siteConfig.toc.minHeadings,
    toc: readingContent.toc,
  })
    ? readingContent.toc
    : []

  return (
    <>
      <ReadingProgressBar />
      <JsonLd data={createBlogPostingJsonLd(post)} />
      <MainBreadcrumbs currentLabel={post.title} pathname={`/posts/${post.slug}/`} />
      <article aria-labelledby="post-title" className="flex flex-col gap-12" data-pagefind-body>
        <PostDetailLayout
          footer={
            <>
              {/* imageWidth/Height는 defaultOgImage 기준이다. 글마다 다른 크기의
                  ogImage를 쓰게 되면 이 값도 그 글의 실제 크기로 바꿔야 한다. */}
              <PostShare
                description={post.description}
                imageHeight={siteConfig.defaultOgImageDimensions.height}
                imageUrl={absoluteUrl(post.ogImage ?? siteConfig.defaultOgImage)}
                imageWidth={siteConfig.defaultOgImageDimensions.width}
                kakao={integrations.kakao}
                title={post.title}
                url={absoluteUrl(`/posts/${post.slug}/`)}
              />
              <PostNavigation nextPost={nextPost} previousPost={previousPost} />
              <GiscusComments config={integrations.giscus} />
            </>
          }
          header={
            <>
              <div className="flex items-start justify-between gap-6">
                <Link
                  className={cn(
                    typography("eyebrow"),
                    "underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  href="/posts/"
                >
                  목록으로
                </Link>
              </div>

              <header>
                <PageTitle className="max-w-3xl" id="post-title">
                  {post.title}
                </PageTitle>
                <Lead className="mt-4 max-w-2xl">{post.description}</Lead>
                <div className="mt-6">
                  <PostMeta post={post} />
                </div>
                <PostTags ariaLabel={`${post.title} 태그`} tags={post.tags} />
              </header>
            </>
          }
          title={post.title}
          tocItems={tocItems}
        >
          <PostBody postSlug={post.slug} readingContent={readingContent} />
        </PostDetailLayout>
      </article>
    </>
  )
}

function PostBody({
  postSlug,
  readingContent,
}: Readonly<{ postSlug: string; readingContent: RenderedMarkdown }>) {
  return (
    <MarkdownContent
      contentKey={postSlug}
      hasDiagram={readingContent.hasDiagram}
      hasMath={readingContent.hasMath}
      html={readingContent.html}
    />
  )
}

function toAdjacentPost(post: AdjacentPost | undefined): AdjacentPost | undefined {
  return post === undefined
    ? undefined
    : {
        title: post.title,
        slug: post.slug,
      }
}
