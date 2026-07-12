import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { MarkdownContent } from "../src/components/markdown-content"
import { renderMarkdown } from "../src/lib/markdown"

describe("markdown renderer", () => {
  it("Given basic markdown When rendering Then returns semantic HTML", async () => {
    const { html } = await renderMarkdown(`# 제목

본문에는 [링크](https://example.com)가 있습니다.

- 첫 번째
- 두 번째`)

    expect(html).toContain('<h1 id="heading-제목">제목</h1>')
    expect(html).toContain('<a href="https://example.com" rel="external">링크</a>')
    expect(html).toContain("<li>첫 번째</li>")
  })

  it("Given raw HTML When rendering Then does not pass it through as executable markup", async () => {
    const { html } = await renderMarkdown(`<script>alert("x")</script>

<div onclick="alert('x')">unsafe</div>`)

    expect(html).not.toContain("<script>")
    expect(html).not.toContain("onclick")
  })

  it("Given unsafe link schemes When rendering Then strips unsafe URLs", async () => {
    const { html } = await renderMarkdown(`[bad](javascript:alert("x"))

![bad](data:text/html;base64,PHNjcmlwdD5hPC9zY3JpcHQ+)`)

    expect(html).not.toContain("javascript:")
    expect(html).not.toContain("data:text/html")
  })

  it("Given sanitized markdown HTML When rendering content Then uses Tailwind typography prose classes", async () => {
    const { html } = await renderMarkdown("본문")
    const markup = renderToStaticMarkup(createElement(MarkdownContent, { hasMath: false, html }))

    expect(markup).toContain("prose")
    expect(markup).toContain("prose-neutral")
    expect(markup).toContain("prose-h2:scroll-mt-14")
    expect(markup).toContain("prose-h3:scroll-mt-14")
    expect(markup).toContain("xl:prose-h2:scroll-mt-8")
    expect(markup).toContain("xl:prose-h3:scroll-mt-8")
    expect(markup).toContain("text-[var(--shiki-light)]")
    expect(markup).toContain("text-[var(--shiki-dark)]")
    expect(markup).toContain("[&amp;_.katex-display]:max-w-full")
    expect(markup).toContain("[&amp;_.katex-display]:overflow-x-auto")
  })

  it("Given GFM markdown When rendering Then returns tables task lists and code blocks", async () => {
    const { html } = await renderMarkdown(`| Name | Done |
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
    const { html } = await renderMarkdown(`\`\`\`ts
const message = "hello"
console.log(message)
\`\`\``)

    expect(html).toContain("data-rehype-pretty-code-figure")
    expect(html).toContain('data-language="ts"')
    expect(html).toContain("data-theme=")
    expect(html).toContain("data-line")
    expect(html).toContain("console")
  })

  it("Given headings When extracting a TOC Then includes only h2 and h3 with stable ids", async () => {
    const { toc } = await renderMarkdown(`# 글 제목

## Pipeline stages

### Schema validation

#### Too deep

## Pipeline stages

### 한글 섹션`)

    expect(toc).toEqual([
      { id: "heading-pipeline-stages", level: 2, text: "Pipeline stages" },
      { id: "heading-schema-validation", level: 3, text: "Schema validation" },
      { id: "heading-pipeline-stages-1", level: 2, text: "Pipeline stages" },
      { id: "heading-한글-섹션", level: 3, text: "한글 섹션" },
    ])
  })

  it("Given h2 and h3 headings When rendering markdown Then heading ids match TOC links", async () => {
    const { html } = await renderMarkdown(`## Pipeline stages

### Schema validation

## Pipeline stages`)

    expect(html).toContain('<h2 id="heading-pipeline-stages">')
    expect(html).toContain('<h3 id="heading-schema-validation">')
    expect(html).toContain('<h2 id="heading-pipeline-stages-1">')
    expect(html).toContain('href="#heading-pipeline-stages"')
    expect(html).toContain('href="#heading-schema-validation"')
    expect(html).toContain('href="#heading-pipeline-stages-1"')
  })

  it("Given internal and external links When rendering Then marks only external links", async () => {
    const { html } = await renderMarkdown(`[내부](/posts/)

[외부](https://example.com)`)

    expect(html).toContain('<a href="/posts/">내부</a>')
    expect(html).toContain('<a href="https://example.com" rel="external">외부</a>')
    expect(html).not.toContain('target="_blank"')
  })

  it("Given clobbering and symbol-only headings When rendering Then creates safe non-empty ids", async () => {
    const { html, toc } = await renderMarkdown(`## location

## 🎉

## !!!`)

    expect(toc).toEqual([
      { id: "heading-location", level: 2, text: "location" },
      { id: "heading-section", level: 2, text: "🎉" },
      { id: "heading-section-1", level: 2, text: "!!!" },
    ])
    expect(html).toContain('id="heading-location"')
    expect(html).not.toContain('id=""')
    expect(html).not.toContain('href="#"')
  })

  it("Given a quoted heading When rendering Then excludes it from document navigation", async () => {
    const { html, toc } = await renderMarkdown(`> ## Quoted heading

## Root heading`)

    expect(toc).toEqual([{ id: "heading-root-heading", level: 2, text: "Root heading" }])
    expect(html).not.toContain('href="#heading-quoted-heading"')
    expect(html).toContain('href="#heading-root-heading"')
  })

  it("Given markdown without h2 or h3 When extracting a TOC Then returns an empty list", async () => {
    const { toc } = await renderMarkdown(`# 제목

본문만 있는 짧은 글입니다.`)

    expect(toc).toEqual([])
  })

  it("Given math without an override When rendering Then detects and renders static KaTeX", async () => {
    const { hasMath, html } = await renderMarkdown("Euler wrote $e^{i\\pi} + 1 = 0$.")

    expect(hasMath).toBe(true)
    expect(html).toContain('class="katex"')
    expect(html).toContain("<math")
    expect(html).toContain('class="katex-html"')
  })

  it("Given math syntax appears only in code When rendering Then does not enable KaTeX", async () => {
    const { hasMath, html } = await renderMarkdown("`$notMath$`")

    expect(hasMath).toBe(false)
    expect(html).not.toContain('class="katex"')
  })

  it("Given a fenced math code block When rendering Then preserves it as code", async () => {
    const { hasMath, html } = await renderMarkdown(`\`\`\`math
x^2
\`\`\``)

    expect(hasMath).toBe(false)
    expect(html).toContain('<pre><code class="language-math">')
    expect(html).toContain("x^2")
    expect(html).not.toContain('class="katex"')
  })

  it("Given a similarly named code language When rendering Then preserves its original language", async () => {
    const { hasMath, html } = await renderMarkdown(`\`\`\`math-fence
example
\`\`\``)

    expect(hasMath).toBe(false)
    expect(html).toContain('data-language="math-fence"')
    expect(html).not.toContain('class="language-math"')
  })

  it("Given escaped currency notation When rendering Then does not enable KaTeX", async () => {
    const { hasMath, html } = await renderMarkdown("가격은 \\$5이고 할인가는 \\$3입니다.")

    expect(hasMath).toBe(false)
    expect(html).toContain("가격은 $5이고 할인가는 $3입니다.")
    expect(html).not.toContain('class="katex"')
  })

  it("Given rendered Markdown When selecting math assets Then includes KaTeX CSS only when enabled", async () => {
    const enabled = await renderMarkdown("$x$")
    const disabled = await renderMarkdown("일반 본문")

    const enabledMarkup = renderToStaticMarkup(
      createElement(MarkdownContent, { hasMath: enabled.hasMath, html: enabled.html }),
    )
    const disabledMarkup = renderToStaticMarkup(
      createElement(MarkdownContent, { hasMath: disabled.hasMath, html: disabled.html }),
    )

    expect(enabledMarkup).toContain('href="/katex/katex.min.css"')
    expect(disabledMarkup).not.toContain('href="/katex/katex.min.css"')
  })

  it("Given invalid TeX When rendering a source post Then reports the source path", async () => {
    const rendering = renderMarkdown("$\\notARealCommand{x}$", {
      sourcePath: "content/posts/invalid-math.md",
    })

    await expect(rendering).rejects.toThrow(
      /content\/posts\/invalid-math\.md:1:1.*Undefined control sequence: \\notARealCommand/,
    )
  })
})
