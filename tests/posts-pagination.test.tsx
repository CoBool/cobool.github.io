import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import PaginatedPostsPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "../src/app/(site)/posts/page/[page]/page"
import { PostsPageView } from "../src/app/(site)/posts/posts-page-view"
import sitemap from "../src/app/sitemap"
import { PaginationNav } from "../src/components/pagination-nav"
import { absoluteUrl, siteConfig } from "../src/config/site"
import { getPageNumbers, paginatePosts } from "../src/lib/post-collections"
import { getPostPageNumbers, type Post } from "../src/lib/posts"

describe("post pagination policy", () => {
  it("Given site configuration When reading the page-size policy Then exposes six posts per page", () => {
    expect(siteConfig).toHaveProperty("postsPerPage", 6)
  })

  it("Given no public posts When paginating the archive Then returns one empty canonical page", () => {
    expect(paginatePosts([], 1, siteConfig.postsPerPage)).toEqual({
      page: 1,
      posts: [],
      totalPages: 1,
    })
    expect(paginatePosts([], 2, siteConfig.postsPerPage)).toBeUndefined()
  })

  it("Given a custom page size When calculating pages Then uses the supplied policy", () => {
    expect(getPageNumbers(createPosts(3), 2)).toEqual([1, 2])
  })

  it("Given one post beyond the configured page size When paginating Then creates a one-post second page", () => {
    const posts = createPosts(siteConfig.postsPerPage + 1)
    const firstPage = paginatePosts(posts, 1, siteConfig.postsPerPage)
    const secondPage = paginatePosts(posts, 2, siteConfig.postsPerPage)

    expect(firstPage?.posts).toHaveLength(siteConfig.postsPerPage)
    expect(firstPage?.totalPages).toBe(2)
    expect(secondPage?.posts).toHaveLength(1)
    expect(getPageNumbers(posts, siteConfig.postsPerPage)).toEqual([1, 2])
    expect(paginatePosts(posts, 0, siteConfig.postsPerPage)).toBeUndefined()
    expect(paginatePosts(posts, 3, siteConfig.postsPerPage)).toBeUndefined()
  })

  it("Given static export When generating pagination params Then keeps page one canonical", () => {
    const expectedParams = getPostPageNumbers()
      .filter((page) => page > 1)
      .map((page) => ({ page: String(page) }))

    expect(dynamicParams).toBe(false)
    expect(generateStaticParams()).toEqual(expectedParams)
    expect(expectedParams).not.toContainEqual({ page: "1" })
  })

  it("Given generated pagination pages When building the sitemap Then lists the same page routes", () => {
    const paginationUrls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("/posts/page/"))
    const expectedUrls = getPostPageNumbers()
      .filter((page) => page > 1)
      .map((page) => absoluteUrl(`/posts/page/${page}/`))

    expect(paginationUrls).toEqual(expectedUrls)
  })

  it("Given page two metadata When resolving the route Then uses a page-specific canonical URL", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ page: "2" }) })

    expect(metadata.title).toBe("전체 글 2페이지")
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/posts/page/2/`)
  })

  it("Given non-canonical or unavailable page numbers When rendering Then returns not found", async () => {
    await expect(PaginatedPostsPage({ params: Promise.resolve({ page: "1" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
    await expect(PaginatedPostsPage({ params: Promise.resolve({ page: "2.5" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
    await expect(PaginatedPostsPage({ params: Promise.resolve({ page: "999" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
  })

  it("Given first and second pages When rendering navigation Then links use canonical archive URLs", () => {
    const firstPage = renderToStaticMarkup(
      createElement(PaginationNav, { currentPage: 1, totalPages: 2 }),
    )
    const secondPage = renderToStaticMarkup(
      createElement(PaginationNav, { currentPage: 2, totalPages: 2 }),
    )

    expect(firstPage).toContain('href="/posts/page/2"')
    expect(firstPage).not.toContain('href="/posts/page/1"')
    expect(secondPage).toContain('href="/posts"')
    expect(secondPage).not.toContain('href="/posts/page/3"')
  })

  it("Given no public posts When rendering the archive Then shows an empty state without list navigation", () => {
    const markup = renderToStaticMarkup(
      createElement(PostsPageView, {
        pagination: { page: 1, posts: [], totalPages: 1 },
      }),
    )

    expect(markup).toContain("아직 공개된 글이 없습니다.")
    expect(markup).toContain("첫 글이 발행되면 이곳에 표시됩니다.")
    expect(markup).not.toContain("<ol")
    expect(markup).not.toContain('aria-label="글 페이지"')
  })
})

function createPosts(count: number): readonly Post[] {
  return Array.from({ length: count }, (_, index) => ({
    category: "notes",
    content: "Body",
    date: "2026-07-01",
    description: `Post ${index + 1}`,
    draft: false,
    excerpt: `Post ${index + 1}`,
    pinned: false,
    readingTime: "1분 읽기",
    slug: `post-${index + 1}`,
    tags: [],
    title: `Post ${index + 1}`,
    toc: true,
  }))
}
