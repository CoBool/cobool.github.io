import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import nextConfig from "../next.config"
import HomePage from "../src/app/page"

describe("static Next.js scaffold", () => {
  it("keeps the production build static-exportable with unoptimized images", () => {
    expect(nextConfig.output).toBe("export")
    expect(nextConfig.images?.unoptimized).toBe(true)
  })

  it("renders the homepage shell and latest markdown posts", () => {
    const markup = renderToStaticMarkup(createElement(HomePage))

    expect(markup).toContain("Static Markdown blog foundation")
    expect(markup).toContain("Latest Posts")
    expect(markup).toContain("Launching True Log")
    expect(markup).toContain("Design System Notes")
    expect(markup).toContain("Static Export Checklist")
    expect(markup).toContain("Markdown Content Pipeline")
    expect(markup).toContain("Next App Router Foundation")
  })
})
