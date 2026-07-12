import type { Element, Root as HastRoot, Parents } from "hast"
import { toString as hastToString } from "hast-util-to-string"
import type { Root as MdastRoot } from "mdast"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"

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
  hasMath: boolean
  toc: readonly TableOfContentsItem[]
}>

type RenderMarkdownOptions = Readonly<{
  math?: boolean
  sourcePath?: string
}>

type MarkdownMathIssue = Readonly<{
  sourcePath: string
  details: string
  position: Readonly<{ line: number; column: number }> | undefined
}>

export class MarkdownMathError extends Error {
  constructor(
    readonly issue: MarkdownMathIssue,
    options?: ErrorOptions,
  ) {
    const location =
      issue.position === undefined
        ? issue.sourcePath
        : `${issue.sourcePath}:${issue.position.line}:${issue.position.column}`

    super(`Invalid math in "${location}": ${issue.details}`, options)
    this.name = "MarkdownMathError"
  }
}

declare module "vfile" {
  interface DataMap {
    hasMath: boolean
    mathOverride?: boolean
    tableOfContents: readonly TableOfContentsItem[]
  }
}

const mathClassAttribute: [string, string, string] = ["className", "math-inline", "math-display"]
const { code: defaultCodeAttributes = [] } = defaultSchema.attributes ?? {}
const mathSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...defaultCodeAttributes, mathClassAttribute],
  },
  clobberPrefix: "heading-",
} satisfies SanitizeSchema

const markdownProcessor = createMarkdownProcessor(false)
const mathMarkdownProcessor = createMarkdownProcessor(true)

export async function renderMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<RenderedMarkdown> {
  const processor = options.math === false ? markdownProcessor : mathMarkdownProcessor
  const file =
    options.sourcePath === undefined
      ? new VFile({ value: markdown })
      : new VFile({ path: options.sourcePath, value: markdown })

  if (options.math !== undefined) {
    file.data.mathOverride = options.math
  }

  const renderedFile = await processor.process(file)
  const mathError = renderedFile.messages.find((message) => message.source === "rehype-katex")

  if (mathError !== undefined) {
    const cause = mathError.cause instanceof Error ? mathError.cause : mathError
    const position =
      mathError.line === undefined || mathError.column === undefined
        ? undefined
        : { line: mathError.line, column: mathError.column }

    throw new MarkdownMathError(
      {
        sourcePath: options.sourcePath ?? "Markdown input",
        details: cause.message,
        position,
      },
      { cause },
    )
  }

  return {
    html: String(renderedFile) as SanitizedHtml,
    hasMath: renderedFile.data.hasMath ?? false,
    toc: renderedFile.data.tableOfContents ?? [],
  }
}

function createMarkdownProcessor(mathEnabled: boolean) {
  const processor = unified().use(remarkParse).use(remarkGfm)

  if (mathEnabled) {
    processor.use(remarkMath).use(remarkResolveMathPolicy)
  }

  processor
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeNormalizeHeadingIds)
    .use(rehypeSanitize, mathSanitizeSchema)
    .use(rehypeCollectTableOfContents)
    .use(rehypeAutolinkHeadings, { behavior: "wrap", test: isRootTocHeading })
    .use(rehypeExternalLinks, { rel: ["external"] })

  if (mathEnabled) {
    processor.use(rehypeKatex, { output: "htmlAndMathml", trust: false })
  }

  return processor
    .use(rehypePrettyCode, {
      bypassInlineCode: true,
      keepBackground: false,
      theme: {
        dark: "github-dark-dimmed",
        light: "github-light",
      },
    })
    .use(rehypeStringify)
}

function remarkResolveMathPolicy() {
  return (tree: MdastRoot, file: VFile) => {
    let detectedMath = false

    visit(tree, (node) => {
      if (node.type === "math" || node.type === "inlineMath") {
        detectedMath = true
      }
    })

    file.data.hasMath = file.data.mathOverride ?? detectedMath
  }
}

function rehypeCollectTableOfContents() {
  return (tree: HastRoot, file: VFile) => {
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
  return (tree: HastRoot) => {
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
