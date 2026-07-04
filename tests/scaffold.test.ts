import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import nextConfig from "../next.config"
import HomePage from "../src/app/(site)/page"
import PostPage, { dynamicParams } from "../src/app/(site)/posts/[slug]/page"
import NotFoundPage from "../src/app/not-found"
import { PostTags } from "../src/components/post-tags"

describe("static Next.js scaffold", () => {
  it("keeps the production build static-exportable with unoptimized images", () => {
    expect(nextConfig.output).toBe("export")
    expect(nextConfig.trailingSlash).toBe(true)
    expect(nextConfig.images?.unoptimized).toBe(true)
  })

  it("Given static export When post slug is not generated Then dynamic params are disabled", () => {
    expect(dynamicParams).toBe(false)
  })

  it("Given an unknown route When rendering not found Then shows recovery links", () => {
    const markup = renderToStaticMarkup(createElement(NotFoundPage))

    expect(markup).toContain("글을 찾을 수 없습니다")
    expect(markup).toContain('href="/"')
    expect(markup).toContain('href="/posts/"')
  })

  it("Given the homepage route When rendering content Then it keeps the expected ordered sections and posts", () => {
    const markup = renderToStaticMarkup(createElement(HomePage))
    const homeTitleIndex = markup.indexOf('id="home-title">정적 Markdown 기술 블로그')
    const pinnedPostsIndex = markup.indexOf('id="pinned-posts-title">고정 글')
    const latestPostsIndex = markup.indexOf('id="latest-posts-title">최신 글')
    const categoriesIndex = markup.indexOf('id="top-categories-title">주요 카테고리')
    const tagsIndex = markup.indexOf('id="top-tags-title">주요 태그')

    expect(markup).toMatch(/<section\b[^>]*aria-labelledby="home-title"[^>]*>/)
    expect(homeTitleIndex).toBeGreaterThanOrEqual(0)
    expect(homeTitleIndex).toBeLessThan(pinnedPostsIndex)
    expect(pinnedPostsIndex).toBeLessThan(latestPostsIndex)
    expect(latestPostsIndex).toBeLessThan(categoriesIndex)
    expect(categoriesIndex).toBeLessThan(tagsIndex)
    expect(markup).toContain("글 상세 화면에서 읽기 도구를 배치하는 방법")
    expect(markup).toContain("Launching True Log")
    expect(markup).toContain("Design System Notes")
    expect(markup).toContain("Static Export Checklist")
    expect(markup).toContain("Markdown Content Pipeline")
  })

  it("Given a post tag list When rendering tags Then the accessible prop mirrors aria-label", () => {
    const markup = renderToStaticMarkup(
      createElement(PostTags, { ariaLabel: "Example Post 태그", tags: ["content"] }),
    )

    expect(markup).toContain('aria-label="Example Post 태그"')
    expect(markup).not.toContain("aria-labelledby")
  })

  it("Given a post detail page When rendering local content Then it returns one labelled article with title and body", async () => {
    const page = await PostPage({
      params: Promise.resolve({ slug: "markdown-content-pipeline" }),
    })
    const markup = renderToStaticMarkup(page)
    const articleTags = markup.match(/<article\b/g) ?? []

    expect(articleTags).toHaveLength(1)
    expect(markup).toMatch(/<article\b[^>]*aria-labelledby="post-title"[^>]*>/)
    expect(markup).toContain('id="post-title">Markdown Content Pipeline')
    expect(markup).toContain("The Markdown content pipeline begins with frontmatter")
  })
})
