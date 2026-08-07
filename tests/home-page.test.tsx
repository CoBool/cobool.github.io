import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { Post } from "../src/lib/posts"

const posts = vi.hoisted(() => ({
  recent: [] as Post[],
}))

vi.mock("../src/lib/posts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/posts")>()

  return { ...actual, getRecentPosts: () => posts.recent }
})

const HomePage = (await import("../src/app/(site)/page")).default

describe("home page", () => {
  // 고정 글과 최신 글이 따로 있던 시절에는 같은 글이 두 번 그려졌다.
  it("Given a pinned post among the recent ones When rendering Then it appears once", () => {
    posts.recent = [
      postFixture({ slug: "pinned-one", title: "고정된 글", pinned: true }),
      postFixture({ slug: "plain-one", title: "그냥 글" }),
    ]

    const markup = renderToStaticMarkup(HomePage())
    // 이 환경의 Link 는 후행 슬래시 없이 렌더한다. 빌드 산출물에는 trailingSlash 로 다시 붙는다.
    const cards = [...markup.matchAll(/href="\/posts\/([a-z0-9-]+)\/?"/g)].map(([, slug]) => slug)

    expect(cards).toEqual(["pinned-one", "plain-one"])
    expect(new Set(cards).size).toBe(cards.length)
  })

  it("Given recent posts When rendering Then the archive stays reachable from the list", () => {
    posts.recent = [postFixture({ slug: "only-one", title: "글 하나" })]

    const markup = renderToStaticMarkup(HomePage())

    expect(markup).toMatch(/href="\/posts\/?"/)
    expect(markup).toContain("전체 보기")
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
    pinned: false,
    readingMinutes: 1,
    slug: "sample-post",
    tags: ["content"],
    title: "Sample Post",
    toc: true,
    ...overrides,
  }
}
