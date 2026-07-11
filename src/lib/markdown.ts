import type { Element, Parents, Root } from "hast"
import { toString as hastToString } from "hast-util-to-string"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

const HEADING_NAMES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])
const TOC_HEADING_NAMES = new Set(["h2", "h3"])
const EMPTY_GITHUB_SLUG_PATTERN = /^-\d+$/

declare const sanitizedHtmlBrand: unique symbol

export type SanitizedHtml = string & {
  readonly [sanitizedHtmlBrand]: true
}

export type TableOfContentsItem = Readonly<{
  id: string
  level: 2 | 3
  text: string
}>

export type RenderedMarkdown = Readonly<{
  html: SanitizedHtml
  toc: readonly TableOfContentsItem[]
}>

declare module "vfile" {
  interface DataMap {
    tableOfContents: readonly TableOfContentsItem[]
  }
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeNormalizeHeadingIds)
  .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: "heading-" })
  .use(rehypeCollectTableOfContents)
  .use(rehypeAutolinkHeadings, { behavior: "wrap", test: isRootTocHeading })
  .use(rehypeExternalLinks, { rel: ["external"] })
  .use(rehypePrettyCode, {
    bypassInlineCode: true,
    keepBackground: false,
    theme: {
      dark: "github-dark-dimmed",
      light: "github-light",
    },
  })
  .use(rehypeStringify)

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const file = await markdownProcessor.process(markdown)

  return {
    html: String(file) as SanitizedHtml,
    toc: file.data.tableOfContents ?? [],
  }
}

function rehypeCollectTableOfContents() {
  return (tree: Root, file: VFile) => {
    const items: TableOfContentsItem[] = []

    for (const node of tree.children) {
      if (node.type !== "element") {
        continue
      }

      const item = toTableOfContentsItem(node)

      if (item !== undefined) {
        items.push(item)
      }
    }

    file.data.tableOfContents = items
  }
}

function rehypeNormalizeHeadingIds() {
  return (tree: Root) => {
    const usedIds = new Set<string>()
    const headingsWithoutTextSlugs: Element[] = []

    visit(tree, "element", (node) => {
      const id = node.properties.id

      if (!HEADING_NAMES.has(node.tagName) || typeof id !== "string") {
        return
      }

      if (id.length === 0 || EMPTY_GITHUB_SLUG_PATTERN.test(id)) {
        headingsWithoutTextSlugs.push(node)
        return
      }

      usedIds.add(id)
    })

    for (const heading of headingsWithoutTextSlugs) {
      heading.properties.id = createFallbackHeadingId(usedIds)
    }
  }
}

function createFallbackHeadingId(usedIds: Set<string>): string {
  const baseId = "section"
  let suffix = 0
  let id = baseId

  while (usedIds.has(id)) {
    suffix += 1
    id = `${baseId}-${suffix}`
  }

  usedIds.add(id)

  return id
}

function isRootTocHeading(element: Element, _index?: number, parent?: Parents): boolean {
  return parent?.type === "root" && TOC_HEADING_NAMES.has(element.tagName)
}

function toTableOfContentsItem(node: Element): TableOfContentsItem | undefined {
  if (!TOC_HEADING_NAMES.has(node.tagName) || typeof node.properties.id !== "string") {
    return undefined
  }

  const text = hastToString(node).replace(/\s+/g, " ").trim()

  if (text.length === 0) {
    return undefined
  }

  return {
    id: node.properties.id,
    level: node.tagName === "h2" ? 2 : 3,
    text,
  }
}
