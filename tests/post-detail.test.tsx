import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import PostPage, { dynamicParams, generateStaticParams } from "../src/app/posts/[slug]/page"
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

  it("Given a long post When rendering detail Then it shows prose, linked taxonomy, and heading anchors", async () => {
    const page = await PostPage({
      params: Promise.resolve({ slug: "markdown-content-pipeline" }),
    })
    const markup = renderToStaticMarkup(page)

    expect(markup).toContain("prose")
    expect(markup).toContain('href="/categories/build-log/"')
    expect(markup).toContain('href="/tags/content/"')
    expect(markup).toContain('id="pipeline-stages"')
    expect(markup).not.toContain('href="#markdown-content-pipeline"')
  })

  it("Given posts with or without h2 and h3 When rendering detail Then it does not render TOC UI", async () => {
    const noTocPage = await PostPage({
      params: Promise.resolve({ slug: "short-reader-note" }),
    })
    const noTocMarkup = renderToStaticMarkup(noTocPage)
    const tocPage = await PostPage({
      params: Promise.resolve({ slug: "markdown-content-pipeline" }),
    })
    const tocMarkup = renderToStaticMarkup(tocPage)

    expect(noTocMarkup).toContain("짧은 읽기 메모")
    expect(noTocMarkup).not.toContain("목차 열기")
    expect(noTocMarkup).not.toContain('aria-label="글 목차"')
    expect(noTocMarkup).not.toContain('href="#"')
    expect(tocMarkup).not.toContain("목차 열기")
    expect(tocMarkup).not.toContain('aria-label="글 목차"')
  })

  it("Given an invalid slug When rendering detail Then it renders not found instead of crashing", async () => {
    await expect(PostPage({ params: Promise.resolve({ slug: "missing-post" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
  })
})
