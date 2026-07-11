import { describe, expect, it } from "vitest"
import { siteConfig } from "../src/config/site"
import { getPageNumbers, paginatePosts } from "../src/lib/post-collections"
import type { Post } from "../src/lib/posts"

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
