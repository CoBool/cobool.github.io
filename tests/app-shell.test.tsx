import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppShell, MainBreadcrumbs, MainFrame } from "../src/components/layout"
import { buildBreadcrumbItems } from "../src/components/layout/main-breadcrumbs"
import { isActivePath } from "../src/components/layout/sidebar-navigation"
import { siteConfig } from "../src/config/site"

const mockNavigation = vi.hoisted(() => ({
  pathname: "/posts/example-post",
  push: () => undefined,
}))

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ push: mockNavigation.push }),
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
          createElement(MainBreadcrumbs, { pathname: "/posts/" }),
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
    expect(markup).toContain(`href="mailto:${siteConfig.author.email}"`)
    expect(markup).not.toContain(`>${siteConfig.author.email}<`)
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
  })

  it("Given a category currentLabel When building category breadcrumbs Then it uses the label", () => {
    expect(buildBreadcrumbItems("/categories/engineering/", "Engineering")).toEqual([
      { label: "홈", href: "/" },
      { label: "카테고리", href: "/categories" },
      { label: "Engineering" },
    ])
  })

  it("Given a tag currentLabel When building tag breadcrumbs Then it uses the label", () => {
    expect(buildBreadcrumbItems("/tags/content/", "Content")).toEqual([
      { label: "홈", href: "/" },
      { label: "태그", href: "/tags" },
      { label: "Content" },
    ])
  })

  it("Given a currentLabel on a paginated posts route When building breadcrumbs Then it keeps pagination at the posts section", () => {
    expect(buildBreadcrumbItems("/posts/page/2/", "2페이지")).toEqual([
      { label: "홈", href: "/" },
      { label: "글" },
    ])
  })

  it("Given explicit breadcrumb composition When rendering a dynamic route Then it passes the current label to breadcrumbs", () => {
    const markup = renderToStaticMarkup(
      createElement(MainBreadcrumbs, {
        pathname: "/posts/example-post/",
        currentLabel: "Example Post",
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
    const markup = renderToStaticMarkup(
      createElement(MainBreadcrumbs, {
        pathname: "/posts/markdown-content-pipeline/",
        currentLabel: "Markdown Content Pipeline",
      }),
    )

    expect(markup).toContain(">Markdown Content Pipeline<")
    expect(markup).not.toContain(">markdown-content-pipeline<")
  })
})
