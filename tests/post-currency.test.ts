import { expect, it } from "vitest"
import { renderMarkdown } from "../src/lib/markdown"
import { getPostBySlug } from "../src/lib/posts"

it("currency remains strong prose", async () => {
  const { html } = await renderMarkdown(getPostBySlug("gpt-6-astra-vs-claude-fable-5-1").content)
  expect(html.match(/<strong>\$10<\/strong>/g)).toHaveLength(2)
  expect(html.match(/<strong>\$50<\/strong>/g)).toHaveLength(2)
  expect(html).toContain("<strong>$1</strong>")
})
