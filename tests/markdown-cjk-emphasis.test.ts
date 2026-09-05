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

it.each([
  ['"**인용**"이라고', '"<strong>인용</strong>"이라고'],
  ["'**용어**'이다", "'<strong>용어</strong>'이다"],
  ["**한도**(limit)다", "<strong>한도</strong>(limit)다"],
  ["**25**%다", "<strong>25</strong>%다"],
  ["**`task`에** 가깝다", "<strong><code>task</code>에</strong> 가깝다"],
  [
    "**\\$10**, **\\$1**, **\\$50**이다",
    "<strong>$10</strong>, <strong>$1</strong>, <strong>$50</strong>이다",
  ],
  ["**문장.**\n\n**평가 기준**이다", "<strong>평가 기준</strong>이다"],
])("renders safe punctuation boundaries: %s", async (source, expected) => {
  const { html } = await renderMarkdown(source)
  expect(html).toContain(expected)
  expect(html).not.toContain("**")
})
