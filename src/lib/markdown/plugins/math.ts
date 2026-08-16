import type { Root as HastRoot } from "hast"
import type { Root as MdastRoot } from "mdast"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

export const MATH_LANGUAGE_CLASS = "language-math"
export const MATH_CODE_FENCE_MARKER = "dataMathCodeFence"

export function remarkDetectMath() {
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

export function rehypeProtectMathCodeFences() {
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

export function rehypeRestoreMathCodeFences() {
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
