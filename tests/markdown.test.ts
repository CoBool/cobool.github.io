import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { MarkdownContent } from "../src/components/markdown-content"
import { renderMarkdownToHtml } from "../src/lib/markdown"

describe("markdown renderer", () => {
  it("Given basic markdown When rendering Then returns semantic HTML", async () => {
    const html = await renderMarkdownToHtml(`# 제목

본문에는 [링크](https://example.com)가 있습니다.

- 첫 번째
- 두 번째`)

    expect(html).toContain("<h1>제목</h1>")
    expect(html).toContain('<a href="https://example.com">링크</a>')
    expect(html).toContain("<li>첫 번째</li>")
  })

  it("Given raw HTML When rendering Then does not pass it through as executable markup", async () => {
    const html = await renderMarkdownToHtml(`<script>alert("x")</script>

<div onclick="alert('x')">unsafe</div>`)

    expect(html).not.toContain("<script>")
    expect(html).not.toContain("onclick")
  })

  it("Given unsafe link schemes When rendering Then strips unsafe URLs", async () => {
    const html = await renderMarkdownToHtml(`[bad](javascript:alert("x"))

![bad](data:text/html;base64,PHNjcmlwdD5hPC9zY3JpcHQ+)`)

    expect(html).not.toContain("javascript:")
    expect(html).not.toContain("data:text/html")
  })

  it("Given sanitized markdown HTML When rendering content Then uses Tailwind typography prose classes", async () => {
    const html = await renderMarkdownToHtml("본문")
    const markup = renderToStaticMarkup(createElement(MarkdownContent, { html }))

    expect(markup).toContain("prose")
    expect(markup).toContain("prose-neutral")
    expect(markup).not.toContain("[&amp;_")
  })

  it("Given GFM markdown When rendering Then returns tables task lists and code blocks", async () => {
    const html = await renderMarkdownToHtml(`| Name | Done |
| --- | --- |
| Table | Yes |

- [x] Checked item
- [ ] Pending item

\`\`\`ts
const message = "hello"
\`\`\``)

    expect(html).toContain("<table>")
    expect(html).toContain("<th>Name</th>")
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('<pre><code class="language-ts"')
    expect(html).toContain("const message")
  })
})
