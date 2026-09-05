import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { Window } from "happy-dom"
import { visit } from "unist-util-visit"
import { describe, expect, it } from "vitest"
import { renderMarkdown } from "../src/lib/markdown"
import { createMarkdownProcessor } from "../src/lib/markdown/render"
import { getPostBySlug } from "../src/lib/posts"

const directory = join(process.cwd(), "content/posts")

describe("all authored posts preserve emphasis", () => {
  for (const file of readdirSync(directory).filter((name) => name.endsWith(".md"))) {
    it(`${file} has no unparsed emphasis delimiters in prose`, async () => {
      const source = readFileSync(join(directory, file), "utf8")
      const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
      const tree = createMarkdownProcessor().parse(body)
      const failures: string[] = []
      visit(tree, "text", (node) => {
        if (/\*\*|__/.test(node.value)) {
          failures.push(`line ${node.position?.start.line}: ${node.value}`)
        }
      })
      expect(failures).toEqual([])
      const { html } = await renderMarkdown(body)
      const window = new Window()
      try {
        window.document.body.innerHTML = html
        for (const code of window.document.querySelectorAll("pre, code")) code.remove()
        expect(window.document.body.textContent).not.toMatch(/\*\*|__/)
      } finally {
        await window.happyDOM.close()
      }
    })
  }
})

describe("real post rendering regressions", () => {
  it.each([
    ["korea-ai-third-place-dokpamo-evaluation", "clear #3 nation in AI", 2],
    ["korea-ai-third-place-dokpamo-evaluation", "파운데이션 모델", 1],
    ["korea-ai-third-place-dokpamo-evaluation", "25", 1],
    ["claude-code-weekly-limits-september-2026", "주간 한도", 1],
    ["gpt-6-astra-vs-claude-fable-5-1", "31.4", 1],
    ["gpt-6-astra-vs-claude-fable-5-1", "완벽하지는 않지만 빨랐다", 1],
    ["gpt-6-astra-vs-claude-fable-5-1", "<code>cost per completed task</code>에", 1],
  ])("%s renders %s as strong", async (slug, text, count) => {
    const { html } = await renderMarkdown(getPostBySlug(slug).content)
    expect(html.split(`<strong>${text}</strong>`).length - 1).toBe(count)
  })
})
