import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { MarkdownContent } from "../src/components/markdown-content"
import { extractTableOfContents, renderMarkdownToHtml } from "../src/lib/markdown"

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
    expect(markup).toContain("prose-h2:scroll-mt-14")
    expect(markup).toContain("prose-h3:scroll-mt-14")
    expect(markup).toContain("xl:prose-h2:scroll-mt-8")
    expect(markup).toContain("xl:prose-h3:scroll-mt-8")
    expect(markup).toContain("text-[var(--shiki-light)]")
    expect(markup).toContain("text-[var(--shiki-dark)]")
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
    expect(html).toContain("data-rehype-pretty-code-figure")
    expect(html).toContain('data-language="ts"')
    expect(html).toContain("const")
    expect(html).toContain("message")
  })

  it("Given a fenced code block with a language When rendering Then it includes highlighted code markup", async () => {
    const html = await renderMarkdownToHtml(`\`\`\`ts
const message = "hello"
console.log(message)
\`\`\``)

    expect(html).toContain("data-rehype-pretty-code-figure")
    expect(html).toContain('data-language="ts"')
    expect(html).toContain("data-theme=")
    expect(html).toContain("data-line")
    expect(html).toContain("console")
  })

  it("Given headings When extracting a TOC Then includes only h2 and h3 with stable ids", () => {
    const toc = extractTableOfContents(`# 글 제목

## Pipeline stages

### Schema validation

#### Too deep

## Pipeline stages

### 한글 섹션`)

    expect(toc).toEqual([
      { id: "pipeline-stages", level: 2, text: "Pipeline stages" },
      { id: "schema-validation", level: 3, text: "Schema validation" },
      { id: "pipeline-stages-2", level: 2, text: "Pipeline stages" },
      { id: "한글-섹션", level: 3, text: "한글 섹션" },
    ])
  })

  it("Given h2 and h3 headings When rendering markdown Then heading ids match TOC links", async () => {
    const html = await renderMarkdownToHtml(`## Pipeline stages

### Schema validation`)

    expect(html).toContain('<h2 id="pipeline-stages">')
    expect(html).toContain('<h3 id="schema-validation">')
    expect(html).toContain('href="#pipeline-stages"')
    expect(html).toContain('href="#schema-validation"')
  })

  it("Given markdown without h2 or h3 When extracting a TOC Then returns an empty list", () => {
    const toc = extractTableOfContents(`# 제목

본문만 있는 짧은 글입니다.`)

    expect(toc).toEqual([])
  })
})
