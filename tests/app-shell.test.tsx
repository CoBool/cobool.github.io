import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppShell, MainBreadcrumbs, MainFrame } from "../src/components/layout"
import { buildBreadcrumbItems } from "../src/components/layout/main-breadcrumbs"
import { isActivePath } from "../src/components/layout/sidebar-navigation"
import { createBreadcrumbLabelMap } from "../src/lib/breadcrumbs"

const mockNavigation = vi.hoisted(() => ({
  pathname: "/posts/example-post",
}))

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
}))

describe("app shell", () => {
  it("Given the posts route When rendering the shared shell Then it exposes compact profile search, active nav, theme controls, and the page main", () => {
    const markup = renderToStaticMarkup(
      createElement(
        AppShell,
        null,
        createElement(
          MainFrame,
          null,
          createElement(MainBreadcrumbs, { breadcrumbLabels: createBreadcrumbLabelMap() }),
          createElement("h1", { id: "page-title" }, "전체 글"),
        ),
      ),
    )

    expect(markup).toContain("<aside")
    expect(markup).toContain("<main")
    expect(markup).toContain("탐색")
    expect(markup).toContain('aria-label="사이트 검색"')
    expect(markup).toContain('placeholder="Search"')
    expect(markup).toContain("Technical notebook")
    expect(markup).toContain("size-14")
    expect(markup).not.toContain("hover:scale-105")
    expect(markup).not.toContain("hover:shadow-md")
    expect(markup).not.toContain(
      "Markdown 글을 정적 페이지로 빌드하는 한국어 중심 기술 블로그입니다.",
    )
    expect(markup).toContain('href="/posts"')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain("Theme mode")
    expect(markup).toContain('href="mailto:hello@example.com"')
    expect(markup).not.toContain(">hello@example.com<")
    expect(markup).toContain('href="/rss.xml"')
    expect(markup).toContain("전체 글")
    expect(markup).toContain(">True Log<")
  })

  it("Given normalized paths When checking active state Then section routes match their detail pages", () => {
    expect(isActivePath("/posts", "/posts/")).toBe(true)
    expect(isActivePath("/posts/example-post", "/posts/")).toBe(true)
    expect(isActivePath("/categories/nextjs", "/categories/")).toBe(true)
    expect(isActivePath("/about", "/posts/")).toBe(false)
    expect(isActivePath("/posts", "/")).toBe(false)
  })

  it("Given routed pages When building breadcrumbs Then it exposes stable main navigation labels", () => {
    expect(buildBreadcrumbItems("/")).toEqual([{ label: "홈" }])
    expect(buildBreadcrumbItems("/about/")).toEqual([{ label: "홈", href: "/" }, { label: "소개" }])
    expect(buildBreadcrumbItems("/posts/page/2/")).toEqual([
      { label: "홈", href: "/" },
      { label: "글" },
    ])
    expect(buildBreadcrumbItems("/posts/example-post/", "Example Post")).toEqual([
      { label: "홈", href: "/" },
      { label: "글", href: "/posts" },
      { label: "Example Post" },
    ])
    expect(buildBreadcrumbItems("/posts/example-post/", { currentLabel: "Example Post" })).toEqual([
      { label: "홈", href: "/" },
      { label: "글", href: "/posts" },
      { label: "Example Post" },
    ])
  })

  it("Given explicit breadcrumb composition When rendering a dynamic route Then it passes mapped labels to breadcrumbs", () => {
    const markup = renderToStaticMarkup(
      createElement(MainBreadcrumbs, {
        breadcrumbLabels: {
          "/posts/example-post": "Example Post",
        },
      }),
    )

    expect(markup).toContain('aria-label="현재 위치"')
    expect(markup).toContain(">Example Post<")
  })

  it("Given the content frame When rendering MainFrame Then breadcrumbs stay outside the frame API", () => {
    const markup = renderToStaticMarkup(
      createElement(MainFrame, null, createElement("h1", { id: "page-title" }, "Post")),
    )

    expect(markup).not.toContain('aria-label="현재 위치"')
    expect(markup).toContain("<div")
    expect(markup).not.toContain("<section")
    expect(markup).toContain(">Post<")
  })

  it("Given current content When rendering explicit breadcrumbs on a post route Then default labels use the post title", () => {
    mockNavigation.pathname = "/posts/markdown-content-pipeline/"

    const markup = renderToStaticMarkup(
      createElement(MainBreadcrumbs, {
        breadcrumbLabels: {
          "/posts/markdown-content-pipeline": "Markdown Content Pipeline",
        },
      }),
    )

    expect(markup).toContain(">Markdown Content Pipeline<")
    expect(markup).not.toContain(">markdown-content-pipeline<")
  })

  it("Given current content When creating breadcrumb labels Then it returns concrete normalized route labels", () => {
    const breadcrumbLabels = createBreadcrumbLabelMap()
    const readingToolbarLabel = breadcrumbLabels["/posts/post-detail-reading-toolbar"]

    expect(readingToolbarLabel).toBeTypeOf("string")
    expect(readingToolbarLabel).toBe("글 상세 화면에서 읽기 도구를 배치하는 방법")
    expect(breadcrumbLabels["/categories/design"]).toBe("design")
    expect(breadcrumbLabels["/tags/toc"]).toBe("toc")
    expect(Object.keys(breadcrumbLabels).every((path) => !path.endsWith("/"))).toBe(true)
  })

  it("Given route label maps When building post breadcrumbs Then it uses the mapped post label", () => {
    const breadcrumbLabels = {
      "/categories/engineering": "Engineering",
      "/posts/example-post": "Example Post",
      "/tags/content": "Content",
    } satisfies Readonly<Record<string, string>>

    expect(buildBreadcrumbItems("/posts/example-post/", { breadcrumbLabels })).toEqual([
      { label: "홈", href: "/" },
      { label: "글", href: "/posts" },
      { label: "Example Post" },
    ])
  })

  it("Given route label maps When building category breadcrumbs Then it uses the mapped category label", () => {
    const breadcrumbLabels = {
      "/categories/engineering": "Engineering",
      "/posts/example-post": "Example Post",
      "/tags/content": "Content",
    } satisfies Readonly<Record<string, string>>

    expect(buildBreadcrumbItems("/categories/engineering/", { breadcrumbLabels })).toEqual([
      { label: "홈", href: "/" },
      { label: "카테고리", href: "/categories" },
      { label: "Engineering" },
    ])
  })

  it("Given route label maps When building tag breadcrumbs Then it uses the mapped tag label", () => {
    const breadcrumbLabels = {
      "/categories/engineering": "Engineering",
      "/posts/example-post": "Example Post",
      "/tags/content": "Content",
    } satisfies Readonly<Record<string, string>>

    expect(buildBreadcrumbItems("/tags/content/", { breadcrumbLabels })).toEqual([
      { label: "홈", href: "/" },
      { label: "태그", href: "/tags" },
      { label: "Content" },
    ])
  })

  it("Given route label maps When building paginated post breadcrumbs Then it keeps pagination at the posts section", () => {
    const breadcrumbLabels = {
      "/posts/page/2": "2페이지",
    } satisfies Readonly<Record<string, string>>

    expect(buildBreadcrumbItems("/posts/page/2/", { breadcrumbLabels })).toEqual([
      { label: "홈", href: "/" },
      { label: "글" },
    ])
  })
})
