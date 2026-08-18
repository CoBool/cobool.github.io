import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import nextConfig from "../next.config"
import HomePage from "../src/app/(site)/page"
import PostPage, { dynamicParams } from "../src/app/(site)/posts/[slug]/page"
import NotFoundPage from "../src/app/not-found"
import { PostTags } from "../src/components/post-tags"
import { getAllPosts } from "../src/lib/posts"

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
    const [firstPost] = getAllPosts()

    if (firstPost === undefined) {
      throw new Error("Expected at least one published post")
    }

    const markup = renderToStaticMarkup(createElement(HomePage))
    const homeTitleIndex = markup.indexOf('id="home-title">기술과 문제 해결의 기록')
    const recentPostsIndex = markup.indexOf('id="recent-posts-title">글')
    const browseIndex = markup.indexOf('id="browse-title">둘러보기')

    expect(markup).toMatch(/<section\b[^>]*aria-labelledby="home-title"[^>]*>/)
    expect(homeTitleIndex).toBeGreaterThanOrEqual(0)
    expect(homeTitleIndex).toBeLessThan(recentPostsIndex)
    expect(recentPostsIndex).toBeLessThan(browseIndex)
    expect(markup).toContain(firstPost.title)
    expect(markup).not.toContain("Launching True Log")
  })

  it("Given a post tag list When rendering tags Then the accessible prop mirrors aria-label", () => {
    const markup = renderToStaticMarkup(
      createElement(PostTags, { ariaLabel: "Example Post 태그", tags: ["content"] }),
    )

    expect(markup).toContain('aria-label="Example Post 태그"')
    expect(markup).not.toContain("aria-labelledby")
  })

  it("Given a post detail page When rendering local content Then it returns one labelled article with title and body", async () => {
    const [post] = getAllPosts()

    if (post === undefined) {
      throw new Error("Expected at least one published post")
    }

    const page = await PostPage({
      params: Promise.resolve({ slug: post.slug }),
    })
    const markup = renderToStaticMarkup(page)
    const articleTags = markup.match(/<article\b/g) ?? []

    expect(articleTags).toHaveLength(1)
    expect(markup).toMatch(/<article\b[^>]*aria-labelledby="post-title"[^>]*>/)
    expect(markup).toContain(`id="post-title">${post.title}`)
    expect(markup).toContain(post.description)
  })
})
