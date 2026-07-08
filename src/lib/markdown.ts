import rehypePrettyCode from "rehype-pretty-code"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

type MarkdownNode = {
  readonly type: string
  readonly depth?: number
  readonly value?: unknown
  readonly children?: readonly MarkdownNode[]
}

type MarkdownRoot = {
  readonly children: readonly MarkdownNode[]
}

type HtmlNode = HtmlElement | HtmlText | HtmlOtherNode

type HtmlElement = {
  readonly type: "element"
  readonly tagName: string
  properties?: Record<string, unknown>
  children: HtmlNode[]
}

type HtmlText = {
  readonly type: "text"
  readonly value: string
}

type HtmlOtherNode = {
  readonly type: Exclude<string, "element" | "text">
}

type HtmlRoot = {
  readonly children: HtmlNode[]
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHeadingAnchors)
  .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: "" })
  .use(rehypePrettyCode, {
    bypassInlineCode: true,
    keepBackground: false,
    theme: {
      dark: "github-dark-dimmed",
      light: "github-light",
    },
  })
  .use(rehypeStringify)

const markdownParser = unified().use(remarkParse)
const TOC_HEADING_DEPTHS = new Set([2, 3])

declare const sanitizedHtmlBrand: unique symbol

export type SanitizedHtml = string & {
  readonly [sanitizedHtmlBrand]: true
}

export type TableOfContentsItem = Readonly<{
  id: string
  level: 2 | 3
  text: string
}>

export async function renderMarkdownToHtml(markdown: string): Promise<SanitizedHtml> {
  const file = await markdownProcessor.process(markdown)

  return String(file) as SanitizedHtml
}

export function extractTableOfContents(markdown: string): readonly TableOfContentsItem[] {
  const tree: unknown = markdownParser.parse(markdown)
  const usedIds = new Map<string, number>()
  const items: TableOfContentsItem[] = []

  if (!isMarkdownRoot(tree)) {
    return items
  }

  for (const node of tree.children) {
    if (isTocHeading(node)) {
      const text = getMarkdownText(node.children ?? [])

      if (text.length > 0) {
        items.push({
          id: createUniqueHeadingId(text, usedIds),
          level: node.depth,
          text,
        })
      }
    }
  }

  return items
}

function rehypeHeadingAnchors() {
  return (tree: unknown) => {
    const usedIds = new Map<string, number>()

    if (!isHtmlRoot(tree)) {
      return
    }

    for (const node of tree.children) {
      if (isHtmlHeading(node)) {
        const text = getHtmlText(node.children)

        if (text.length > 0) {
          const id = createUniqueHeadingId(text, usedIds)
          node.properties = {
            ...node.properties,
            id,
          }
          node.children = [
            {
              type: "element",
              tagName: "a",
              properties: {
                href: `#${id}`,
              },
              children: node.children,
            },
          ]
        }
      }
    }
  }
}

function isMarkdownRoot(value: unknown): value is MarkdownRoot {
  return (
    typeof value === "object" &&
    value !== null &&
    "children" in value &&
    Array.isArray(value.children)
  )
}

function isTocHeading(node: MarkdownNode): node is MarkdownNode & {
  readonly depth: 2 | 3
  readonly children: readonly MarkdownNode[]
} {
  return (
    node.type === "heading" &&
    typeof node.depth === "number" &&
    TOC_HEADING_DEPTHS.has(node.depth) &&
    node.children !== undefined
  )
}

function isHtmlHeading(node: HtmlNode): node is HtmlElement {
  return isHtmlElement(node) && (node.tagName === "h2" || node.tagName === "h3")
}

function isHtmlElement(node: HtmlNode): node is HtmlElement {
  return node.type === "element"
}

function isHtmlRoot(value: unknown): value is HtmlRoot {
  return (
    typeof value === "object" &&
    value !== null &&
    "children" in value &&
    Array.isArray(value.children)
  )
}

function getMarkdownText(children: readonly MarkdownNode[]): string {
  return children.map(getMarkdownNodeText).join("").replace(/\s+/g, " ").trim()
}

function getMarkdownNodeText(node: MarkdownNode): string {
  if (typeof node.value === "string") {
    return node.value
  }

  if (node.children !== undefined) {
    return getMarkdownText(node.children)
  }

  return ""
}

function getHtmlText(children: readonly HtmlNode[]): string {
  return children.map(getHtmlNodeText).join("").replace(/\s+/g, " ").trim()
}

function getHtmlNodeText(node: HtmlNode): string {
  if (isHtmlText(node)) {
    return node.value
  }

  if (isHtmlElement(node)) {
    return getHtmlText(node.children)
  }

  return ""
}

function isHtmlText(node: HtmlNode): node is HtmlText {
  return node.type === "text"
}

function createUniqueHeadingId(text: string, usedIds: Map<string, number>): string {
  const baseId = slugifyHeading(text)
  const nextCount = usedIds.get(baseId) ?? 0
  usedIds.set(baseId, nextCount + 1)

  if (nextCount === 0) {
    return baseId
  }

  return `${baseId}-${nextCount + 1}`
}

function slugifyHeading(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return slug.length > 0 ? slug : "section"
}
