// @vitest-environment happy-dom
import axe from "axe-core"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import AboutPage from "../src/app/(site)/about/page"
import CategoryPage from "../src/app/(site)/categories/[category]/page"
import CategoriesPage from "../src/app/(site)/categories/page"
import HomePage from "../src/app/(site)/page"
import PostPage from "../src/app/(site)/posts/[slug]/page"
import PostsPage from "../src/app/(site)/posts/page"
import TagPage from "../src/app/(site)/tags/[tag]/page"
import TagsPage from "../src/app/(site)/tags/page"
import NotFoundPage from "../src/app/not-found"
import { getAllCategories, getAllTags, getPostSlugs } from "../src/lib/posts"

// 색상 대비는 스타일시트가 필요하고 happy-dom 에는 레이아웃이 없다. 토큰 값으로 별도 검증한다.
const AXE_OPTIONS: axe.RunOptions = { rules: { "color-contrast": { enabled: false } } }

const firstSlug = requireFirst(getPostSlugs(), "post slug")
const firstCategory = requireFirst(getAllCategories(), "category")
const firstTag = requireFirst(getAllTags(), "tag")

describe("page accessibility", () => {
  beforeEach(() => {
    document.documentElement.lang = "ko"
    document.head.innerHTML = "<title>True Log</title>"
    document.body.innerHTML = ""
  })

  it.each([
    ["home", () => Promise.resolve(HomePage())],
    ["post archive", () => Promise.resolve(PostsPage())],
    ["category index", () => Promise.resolve(CategoriesPage())],
    ["tag index", () => Promise.resolve(TagsPage())],
    ["about", () => Promise.resolve(AboutPage())],
    ["not found", () => Promise.resolve(NotFoundPage())],
    ["post detail", () => PostPage({ params: Promise.resolve({ slug: firstSlug }) })],
    [
      "category detail",
      () => CategoryPage({ params: Promise.resolve({ category: firstCategory }) }),
    ],
    ["tag detail", () => TagPage({ params: Promise.resolve({ tag: firstTag }) })],
  ])("Given the %s page When auditing Then axe reports no violations", async (_name, load) => {
    const violations = await auditPage(await load())

    expect(violations).toEqual([])
  })
})

describe("markdown content accessibility", () => {
  beforeEach(() => {
    document.documentElement.lang = "ko"
    document.head.innerHTML = "<title>True Log</title>"
    document.body.innerHTML = ""
  })

  it("Given a task list When auditing Then each checkbox reports its completion state", async () => {
    const { renderMarkdown } = await import("../src/lib/markdown")
    const { html } = await renderMarkdown("- [x] 끝난 항목\n- [ ] 남은 항목")

    document.body.innerHTML = `<main>${html}</main>`
    const results = await axe.run(document.body, AXE_OPTIONS)

    expect(results.violations.map((violation) => violation.id)).toEqual([])
    expect(html).toContain('aria-label="완료됨"')
    expect(html).toContain('aria-label="완료되지 않음"')
  })
})

/** 위반 규칙 이름과 걸린 노드 수만 남겨, 실패 메시지가 무엇이 깨졌는지 바로 알려주도록 한다. */
async function auditPage(page: unknown): Promise<readonly string[]> {
  document.body.innerHTML = `<main>${renderToStaticMarkup(page as ReactElement)}</main>`

  const results = await axe.run(document.body, AXE_OPTIONS)

  return results.violations.map((violation) => `${violation.id} (${violation.nodes.length} nodes)`)
}

function requireFirst(values: readonly string[], label: string): string {
  const [first] = values

  if (first === undefined) {
    throw new Error(`Expected the fixture content to provide at least one ${label}`)
  }

  return first
}
