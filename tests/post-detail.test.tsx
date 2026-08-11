import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import PostPage, { dynamicParams, generateStaticParams } from "../src/app/(site)/posts/[slug]/page"
import { siteConfig } from "../src/config/site"
import { shouldRenderTableOfContents } from "../src/features/post-toc/toc-policy"
import type { TableOfContentsItem } from "../src/lib/markdown"
import { getAllPosts } from "../src/lib/posts"

describe("post detail reading experience", () => {
  it("Given published posts When generating static params Then every public slug is emitted", () => {
    const generatedSlugs = generateStaticParams()
      .map((params) => params.slug)
      .sort()
    const publishedSlugs = getAllPosts()
      .map((post) => post.slug)
      .sort()

    expect(dynamicParams).toBe(false)
    expect(generatedSlugs).toEqual(publishedSlugs)
  })

  it("Given a post without headings When rendering detail Then it shows prose, linked taxonomy, and suppresses the TOC", async () => {
    const page = await PostPage({
      params: Promise.resolve({ slug: "markdown-posts-as-build-snapshot" }),
    })
    const markup = renderToStaticMarkup(page)

    expect(markup).toContain("prose")
    expect(markup).toContain('href="/categories/engineering/"')
    expect(markup).toContain('href="/tags/markdown/"')
    expect(markup).not.toContain('data-slot="sheet-trigger"')
    expect(markup).not.toContain('aria-label="목차"')
    expect(countArticleLandmarks(markup)).toBe(1)
  })

  it("Given a post date When rendering meta Then displays it in Korean while keeping the machine-readable value", async () => {
    const page = await PostPage({
      params: Promise.resolve({ slug: "markdown-posts-as-build-snapshot" }),
    })
    const markup = renderToStaticMarkup(page)

    expect(markup).toContain('<time dateTime="2026-08-10">2026년 8월 10일</time>')
  })

  it("Given an invalid slug When rendering detail Then it renders not found instead of crashing", async () => {
    await expect(PostPage({ params: Promise.resolve({ slug: "missing-post" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
  })
})

describe("post table of contents render policy", () => {
  it("Given site TOC is disabled When evaluating policy Then it suppresses TOC", () => {
    const shouldRender = shouldRenderTableOfContents({
      siteEnabled: false,
      postToc: true,
      minHeadings: siteConfig.toc.minHeadings,
      toc: createTocItems(siteConfig.toc.minHeadings),
    })

    expect(shouldRender).toBe(false)
  })

  it("Given post TOC is disabled When evaluating policy Then it suppresses TOC", () => {
    const shouldRender = shouldRenderTableOfContents({
      siteEnabled: true,
      postToc: false,
      minHeadings: siteConfig.toc.minHeadings,
      toc: createTocItems(siteConfig.toc.minHeadings),
    })

    expect(shouldRender).toBe(false)
  })

  it("Given fewer headings than the site threshold When evaluating policy Then it suppresses TOC", () => {
    const shouldRender = shouldRenderTableOfContents({
      siteEnabled: true,
      postToc: true,
      minHeadings: siteConfig.toc.minHeadings,
      toc: createTocItems(siteConfig.toc.minHeadings - 1),
    })

    expect(shouldRender).toBe(false)
  })

  it("Given headings meet the site threshold When evaluating policy Then it renders TOC", () => {
    const shouldRender = shouldRenderTableOfContents({
      siteEnabled: true,
      postToc: true,
      minHeadings: siteConfig.toc.minHeadings,
      toc: createTocItems(siteConfig.toc.minHeadings),
    })

    expect(shouldRender).toBe(true)
  })
})

function createTocItems(count: number): readonly TableOfContentsItem[] {
  return Array.from({ length: count }, (_, index): TableOfContentsItem => {
    const itemNumber = index + 1

    return {
      id: `section-${itemNumber}`,
      level: 2,
      text: `Section ${itemNumber}`,
    }
  })
}

function countArticleLandmarks(markup: string): number {
  return markup.match(/<article[\s>]/g)?.length ?? 0
}
