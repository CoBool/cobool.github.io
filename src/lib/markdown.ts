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
import {
  MERMAID_CLASS_NAME,
  rehypePrepareDiagrams,
  remarkDetectDiagrams,
} from "@/lib/markdown-diagrams"

const HEADING_NAMES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])
const TOC_HEADING_NAMES = new Set(["h2", "h3"])
const EMPTY_GITHUB_SLUG_PATTERN = /^-\d+$/
const MATH_LANGUAGE_CLASS = "language-math"
const MATH_CODE_FENCE_MARKER = "dataMathCodeFence"

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
  hasDiagram: boolean
  hasMath: boolean
  toc: readonly TableOfContentsItem[]
}>

type RenderMarkdownOptions = Readonly<{
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
    hasDiagram: boolean
    hasMath: boolean
    tableOfContents: readonly TableOfContentsItem[]
  }
}

const mathClassAttribute: [string, string, string] = ["className", "math-inline", "math-display"]
const mathCodeFenceMarkerAttribute: [string] = [MATH_CODE_FENCE_MARKER]
const { code: defaultCodeAttributes = [] } = defaultSchema.attributes ?? {}
const { pre: defaultPreAttributes = [] } = defaultSchema.attributes ?? {}
const mathSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...defaultCodeAttributes, mathClassAttribute, mathCodeFenceMarkerAttribute],
    pre: [...defaultPreAttributes, ["className", MERMAID_CLASS_NAME]],
  },
  clobberPrefix: "heading-",
} satisfies SanitizeSchema

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDetectMath)
  .use(remarkDetectDiagrams)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeNormalizeHeadingIds)
  .use(rehypeProtectMathCodeFences)
  .use(rehypePrepareDiagrams)
  .use(rehypeSanitize, mathSanitizeSchema)
  .use(rehypeCollectTableOfContents)
  .use(rehypeAutolinkHeadings, { behavior: "wrap", test: isRootTocHeading })
  .use(rehypeExternalLinks, { rel: ["external"] })
  .use(rehypeKatex, { output: "htmlAndMathml", trust: false })
  .use(rehypeRestoreMathCodeFences)
  .use(rehypePrettyCode, {
    bypassInlineCode: true,
    keepBackground: false,
    theme: {
      dark: "github-dark-dimmed",
      light: "github-light",
    },
  })
  .use(rehypeStringify)

export async function renderMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<RenderedMarkdown> {
  const file =
    options.sourcePath === undefined
      ? new VFile({ value: markdown })
      : new VFile({ path: options.sourcePath, value: markdown })

  const renderedFile = await markdownProcessor.process(file)
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
    hasDiagram: renderedFile.data.hasDiagram ?? false,
    hasMath: renderedFile.data.hasMath ?? false,
    toc: renderedFile.data.tableOfContents ?? [],
  }
}

function remarkDetectMath() {
  return (tree: MdastRoot, file: VFile) => {
    let detectedMath = false

    visit(tree, (node) => {
      if (node.type === "math" || node.type === "inlineMath") {
        detectedMath = true
      }
    })

    file.data.hasMath = detectedMath
  }
}

function rehypeProtectMathCodeFences() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      const classNames = node.properties.className

      if (
        node.tagName !== "code" ||
        !Array.isArray(classNames) ||
        !classNames.includes(MATH_LANGUAGE_CLASS) ||
        classNames.includes("math-inline") ||
        classNames.includes("math-display")
      ) {
        return
      }

      node.properties.className = classNames.filter(
        (className) => className !== MATH_LANGUAGE_CLASS,
      )
      node.properties[MATH_CODE_FENCE_MARKER] = ""
    })
  }
}

function rehypeRestoreMathCodeFences() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      const { className } = node.properties

      if (node.tagName !== "code" || !(MATH_CODE_FENCE_MARKER in node.properties)) {
        return
      }

      node.properties.className = [
        ...(Array.isArray(className) ? className : []),
        MATH_LANGUAGE_CLASS,
      ]
      delete node.properties[MATH_CODE_FENCE_MARKER]
    })
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
