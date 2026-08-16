// @vitest-environment happy-dom
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const searchPosts = vi.fn()
const searchParams = new URLSearchParams()

vi.mock("../src/features/search/pagefind", () => ({ searchPosts }))
vi.mock("next/navigation", () => ({ useSearchParams: () => searchParams }))
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const { SearchResults } = await import("../src/features/search/search-results")

afterEach(() => {
  cleanup()
  searchPosts.mockReset()
  searchParams.delete("q")
})

describe("search results", () => {
  it("Given no query When rendering Then it prompts for input without searching", () => {
    render(<SearchResults />)

    expect(screen.getByText("검색어를 입력하세요.")).toBeTruthy()
    expect(searchPosts).not.toHaveBeenCalled()
  })

  it("Given a query When results come back Then each result links to its post", async () => {
    searchParams.set("q", "목차")
    searchPosts.mockResolvedValue([
      { url: "/posts/reading-toolbar/", title: "읽기 도구", excerpt: "본문 발췌" },
    ])

    render(<SearchResults />)

    await waitFor(() => expect(screen.getByText("읽기 도구")).toBeTruthy())
    expect(screen.getByRole("link", { name: "읽기 도구" }).getAttribute("href")).toBe(
      "/posts/reading-toolbar/",
    )
    expect(searchPosts).toHaveBeenCalledWith("목차")
  })

  it("Given a query with no matches When rendering Then it says so instead of showing an empty list", async () => {
    searchParams.set("q", "없는말")
    searchPosts.mockResolvedValue([])

    render(<SearchResults />)

    await waitFor(() => expect(screen.getByText(/결과가 없습니다/)).toBeTruthy())
    expect(screen.queryByRole("listitem")).toBeNull()
  })

  it("Given the index fails to load When rendering Then it reports the failure instead of hanging", async () => {
    searchParams.set("q", "목차")
    searchPosts.mockRejectedValue(new Error("network"))

    render(<SearchResults />)

    await waitFor(() => expect(screen.getByText(/불러오지 못했습니다/)).toBeTruthy())
  })

  // 발췌는 HTML 로 주입하지 않고 <mark> 만 해석한다. Pagefind 가 이스케이프를 빠뜨려도
  // 다른 태그는 요소가 되지 않아야 하므로, 이스케이프되지 않은 마크업으로 확인한다.
  it("Given an excerpt with raw markup When rendering Then only mark becomes an element", async () => {
    searchParams.set("q", "스크립트")
    searchPosts.mockResolvedValue([
      {
        url: "/posts/a/",
        title: "글",
        excerpt: '앞 <mark>스크립트</mark> <img src="x" onerror="alert(1)"><b>굵게</b> 뒤',
      },
    ])

    const { container } = render(<SearchResults />)

    await waitFor(() => expect(container.querySelector("mark")).toBeTruthy())
    expect(container.querySelectorAll("mark")).toHaveLength(1)
    expect(container.querySelector("mark")?.textContent).toBe("스크립트")
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector("b")).toBeNull()
    expect(container.textContent).toContain('<img src="x" onerror="alert(1)">')
  })

  it("Given an excerpt with named and numeric entities When rendering Then they decode to text", async () => {
    searchParams.set("q", "entity")
    searchPosts.mockResolvedValue([
      {
        url: "/posts/entities/",
        title: "엔티티",
        excerpt: "A &amp; B&#8217;s <mark>C&#x27;s</mark> &lt;tag&gt; &#xD800; &#999999999;",
      },
    ])

    const { container } = render(<SearchResults />)

    await waitFor(() => expect(container.querySelector("mark")).toBeTruthy())
    expect(container.querySelector("mark")?.textContent).toBe("C's")
    expect(container.textContent).toContain("A & B’s")
    expect(container.textContent).toContain("<tag>")
    // 서로게이트 반쪽·범위 밖 코드포인트는 원문 그대로 남는다.
    expect(container.textContent).toContain("&#xD800;")
    expect(container.textContent).toContain("&#999999999;")
  })
})
