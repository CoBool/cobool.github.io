import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppShell, MainFrame } from "../src/components/layout"
import { buildBreadcrumbItems } from "../src/components/layout/main-breadcrumbs"
import { isActivePath } from "../src/components/layout/sidebar-navigation"

vi.mock("next/navigation", () => ({
  usePathname: () => "/posts/example-post",
}))

describe("app shell", () => {
  it("Given the posts route When rendering the shared shell Then it exposes compact profile search, active nav, theme controls, and the page main", () => {
    const markup = renderToStaticMarkup(
      createElement(
        AppShell,
        null,
        createElement(
          MainFrame,
          { labelledBy: "page-title" },
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
  })
})
