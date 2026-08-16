import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSanitize from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { VFile } from "vfile"
import { rehypePrepareDiagrams, remarkDetectDiagrams } from "./diagrams"
import {
  isRootTocHeading,
  markdownSanitizeSchema,
  rehypeCollectTableOfContents,
  rehypeNameTaskListCheckboxes,
  rehypeNormalizeHeadingIds,
  rehypeProtectMathCodeFences,
  rehypeRestoreMathCodeFences,
  rehypeWrapTables,
  remarkDetectMath,
  type TableOfContentsItem,
} from "./plugins"

export type { TableOfContentsItem } from "./plugins"
export { TABLE_WRAPPER_CLASS_NAME } from "./plugins"

declare const sanitizedHtmlBrand: unique symbol

export type SanitizedHtml = string & {
  readonly [sanitizedHtmlBrand]: true
}

export function toSanitizedHtml(html: string): SanitizedHtml {
  return html as SanitizedHtml
}

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

export function createMarkdownProcessor() {
  return (
    unified()
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
      // 신뢰 경계: 아래 플러그인의 출력은 다시 검사되지 않는다.
      .use(rehypeSanitize, markdownSanitizeSchema)
      .use(rehypeCollectTableOfContents)
      .use(rehypeNameTaskListCheckboxes)
      .use(rehypeWrapTables)
      .use(rehypeAutolinkHeadings, { behavior: "wrap", test: isRootTocHeading })
      .use(rehypeExternalLinks, { rel: ["noopener", "noreferrer", "external"] })
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
  )
}

const markdownProcessor = createMarkdownProcessor()

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
    html: toSanitizedHtml(String(renderedFile)),
    hasDiagram: renderedFile.data.hasDiagram ?? false,
    hasMath: renderedFile.data.hasMath ?? false,
    toc: renderedFile.data.tableOfContents ?? [],
  }
}
