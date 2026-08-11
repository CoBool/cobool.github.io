import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import PostPage, { dynamicParams, generateStaticParams } from "../src/app/(site)/posts/[slug]/page"
import { siteConfig } from "../src/config/site"
import { shouldRenderTableOfContents } from "../src/features/post-toc/toc-policy"
import { renderMarkdown, type TableOfContentsItem } from "../src/lib/markdown"
import { getAllPosts } from "../src/lib/posts"

const postDateFormat = new Intl.DateTimeFormat(siteConfig.language, {
  dateStyle: "long",
  timeZone: "UTC",
})

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

  it("Given a published post When rendering detail Then it shows prose, linked taxonomy, and TOC per policy", async () => {
    const [post] = getAllPosts()
    const [tag] = post?.tags ?? []

    if (post === undefined || tag === undefined) {
      throw new Error("Expected at least one published post with a tag")
    }

    const page = await PostPage({ params: Promise.resolve({ slug: post.slug }) })
    const markup = renderToStaticMarkup(page)
    const readingContent = await renderMarkdown(post.content, {
      sourcePath: `content/posts/${post.slug}.md`,
    })
    const expectsToc = shouldRenderTableOfContents({
      siteEnabled: siteConfig.toc.enabled,
      postToc: post.toc,
      minHeadings: siteConfig.toc.minHeadings,
      toc: readingContent.toc,
    })

    expect(markup).toContain("prose")
    expect(markup).toContain(`href="/categories/${post.category}/"`)
    expect(markup).toContain(`href="/tags/${tag}/"`)
    expect(markup.includes('data-slot="sheet-trigger"')).toBe(expectsToc)
    expect(markup.includes('aria-label="목차"')).toBe(expectsToc)
    expect(countArticleLandmarks(markup)).toBe(1)
  })

  it("Given a post date When rendering meta Then displays it in Korean while keeping the machine-readable value", async () => {
    const [post] = getAllPosts()

    if (post === undefined) {
      throw new Error("Expected at least one published post")
    }

    const page = await PostPage({ params: Promise.resolve({ slug: post.slug }) })
    const markup = renderToStaticMarkup(page)
    const expectedDate = postDateFormat.format(new Date(`${post.date}T00:00:00Z`))

    expect(markup).toContain(`<time dateTime="${post.date}">${expectedDate}</time>`)
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
