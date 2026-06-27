import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import nextConfig from "../next.config"
import NotFoundPage from "../src/app/not-found"
import HomePage from "../src/app/page"
import { dynamicParams } from "../src/app/posts/[slug]/page"

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

  it("renders the homepage shell and latest markdown posts", () => {
    const markup = renderToStaticMarkup(createElement(HomePage))

    expect(markup).toContain("정적 Markdown 기술 블로그")
    expect(markup).toContain("고정 글")
    expect(markup).toContain("최신 글")
    expect(markup).toContain("주요 카테고리")
    expect(markup).toContain("주요 태그")
    expect(markup).toContain("Launching True Log")
    expect(markup).toContain("Design System Notes")
    expect(markup).toContain("Static Export Checklist")
    expect(markup).toContain("Markdown Content Pipeline")
    expect(markup).toContain("Next App Router Foundation")
  })
})
