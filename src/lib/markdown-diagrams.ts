import type { Element, Root as HastRoot } from "hast"
import { toString as hastToString } from "hast-util-to-string"
import type { Code, Root as MdastRoot } from "mdast"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

export const MERMAID_CLASS_NAME = "mermaid"
const MERMAID_LANGUAGE_CLASS = "language-mermaid"

export function remarkDetectDiagrams() {
  return (tree: MdastRoot, file: VFile) => {
    let hasDiagram = false

    visit(tree, "code", (node: Code) => {
      if (node.lang === MERMAID_CLASS_NAME) {
        hasDiagram = true
      }
    })

    file.data.hasDiagram = hasDiagram
  }
}

export function rehypePrepareDiagrams() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      const code = getMermaidCode(node)

      if (code === undefined) {
        return
      }

      node.properties.className = [MERMAID_CLASS_NAME]
      node.children = [{ type: "text", value: hastToString(code) }]
    })
  }
}

function getMermaidCode(node: Element): Element | undefined {
  if (node.tagName !== "pre" || node.children.length !== 1) {
    return undefined
  }

  const [code] = node.children

  if (code?.type !== "element" || code.tagName !== "code") {
    return undefined
  }

  const classNames = code.properties.className

  return Array.isArray(classNames) && classNames.includes(MERMAID_LANGUAGE_CLASS) ? code : undefined
}
