import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppShell, MainFrame } from "../src/components/layout"
import { isActivePath } from "../src/components/layout/sidebar-navigation"

vi.mock("next/navigation", () => ({
  usePathname: () => "/posts/example-post",
}))

describe("app shell", () => {
  it("Given the posts route When rendering the shared shell Then it exposes active profile nav, theme controls, and the page main", () => {
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
    expect(markup).toContain('href="/posts"')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain("Theme mode")
    expect(markup).toContain('href="mailto:hello@example.com"')
    expect(markup).not.toContain(">hello@example.com<")
    expect(markup).toContain('href="/rss.xml"')
    expect(markup).toContain("전체 글")
    expect(markup.match(/True Log/g)).toHaveLength(1)
  })

  it("Given normalized paths When checking active state Then section routes match their detail pages", () => {
    expect(isActivePath("/posts", "/posts/")).toBe(true)
    expect(isActivePath("/posts/example-post", "/posts/")).toBe(true)
    expect(isActivePath("/categories/nextjs", "/categories/")).toBe(true)
    expect(isActivePath("/about", "/posts/")).toBe(false)
    expect(isActivePath("/posts", "/")).toBe(false)
  })
})
