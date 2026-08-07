import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { Post } from "../src/lib/posts"

const posts = vi.hoisted(() => ({ pinned: [] as Post[] }))

// 고정 글이 없는 상태는 콘텐츠를 지우지 않고는 만들 수 없어, 조회 지점을 갈아끼운다.
vi.mock("../src/lib/posts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/posts")>()

  return { ...actual, getPinnedPosts: () => posts.pinned }
})

const HomePage = (await import("../src/app/(site)/page")).default

afterEach(() => {
  posts.pinned = []
})

describe("home page", () => {
  it("Given no pinned post When rendering Then the section leaves no empty heading behind", () => {
    const markup = renderToStaticMarkup(HomePage())

    // 인트로 문구에도 "고정 글"이 나오므로 섹션 고유 id 로 확인한다.
    expect(markup).not.toContain("pinned-posts-title")
    // 나머지 구역은 그대로 남는다.
    expect(markup).toContain("latest-posts-title")
  })

  it("Given a pinned post When rendering Then the section appears with that post", () => {
    posts.pinned = [postFixture({ slug: "pinned-one", title: "고정된 글" })]

    const markup = renderToStaticMarkup(HomePage())

    expect(markup).toContain("pinned-posts-title")
    expect(markup).toContain("고정된 글")
  })
})

function postFixture(overrides: Partial<Post>): Post {
  return {
    category: "engineering",
    content: "Body",
    date: "2026-06-28",
    description: "Description",
    draft: false,
    excerpt: "Description",
    pinned: true,
    readingMinutes: 1,
    slug: "sample-post",
    tags: ["content"],
    title: "Sample Post",
    toc: true,
    ...overrides,
  }
}
