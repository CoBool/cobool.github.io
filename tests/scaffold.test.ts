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

  it("renders the placeholder homepage contract before content features exist", () => {
    const markup = renderToStaticMarkup(createElement(HomePage))

    expect(markup).toContain("<h1>Static Markdown blog foundation</h1>")
    expect(markup).toContain("Next.js App Router is ready for the next implementation task.")
  })
})
