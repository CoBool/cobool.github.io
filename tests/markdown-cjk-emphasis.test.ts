import { describe, expect, it } from "vitest"
import { renderMarkdown } from "../src/lib/markdown"

describe("markdown emphasis around Korean particles", () => {
  it("renders quoted bold text when the quotes stay outside the emphasis delimiters", async () => {
    const { html } = await renderMarkdown(
      'Astra를 한 문장으로 표현하면 "**완벽하지는 않지만 빨랐다**"에 가까웠다.',
    )

    expect(html).toContain('"<strong>완벽하지는 않지만 빨랐다</strong>"에 가까웠다.')
    expect(html).not.toContain("**완벽하지는 않지만 빨랐다**")
  })
})
