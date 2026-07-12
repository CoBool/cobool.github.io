import type { Nodes } from "mdast"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import { unified } from "unified"

const EXCERPT_MAX_LENGTH = 150
const MEANINGFUL_TEXT_PATTERN = /[\p{L}\p{N}\p{S}]/u
const BLOCK_NODE_NAMES = new Set([
  "root",
  "blockquote",
  "footnoteDefinition",
  "list",
  "listItem",
  "table",
  "tableRow",
])
const excerptParser = unified().use(remarkParse).use(remarkGfm)
const mathExcerptParser = unified().use(remarkParse).use(remarkGfm).use(remarkMath)

export function extractPostExcerpt(
  content: string,
  fallback: string,
  math: boolean | undefined,
): string {
  const parser = math === false ? excerptParser : mathExcerptParser
  const tree = parser.parse(content)
  const plainText = extractNodeText(tree).replace(/\s+/g, " ").trim()
  const firstSentence = plainText
    .match(/[^.!?。！？]*[.!?。！？]+|[^.!?。！？]+$/gu)
    ?.map((sentence) => sentence.trim())
    .find(isMeaningfulText)
  const candidate = firstSentence ?? (isMeaningfulText(plainText) ? plainText : fallback)

  if (candidate.length <= EXCERPT_MAX_LENGTH) {
    return candidate
  }

  return `${candidate.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}...`
}

function extractNodeText(node: Nodes): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value
  }

  if (node.type === "math" || node.type === "inlineMath") {
    return " "
  }

  if (!("children" in node)) {
    return " "
  }

  const separator = BLOCK_NODE_NAMES.has(node.type) ? " " : ""

  return node.children.map(extractNodeText).join(separator)
}

function isMeaningfulText(value: string): boolean {
  return MEANINGFUL_TEXT_PATTERN.test(value)
}
