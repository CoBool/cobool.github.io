import type { Root as HastRoot } from "hast"
import { SKIP, visit } from "unist-util-visit"

export const TABLE_WRAPPER_CLASS_NAME = "table-wrapper"

/**
 * 표에 display:block 을 직접 주면 테이블 시맨틱이 깨지므로,
 * 가로 스크롤은 래퍼 div 가 담당하도록 div.table-wrapper 로 감싼다.
 */
export function rehypeWrapTables() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || parent === undefined || index === undefined) {
        return
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: [TABLE_WRAPPER_CLASS_NAME] },
        children: [node],
      }

      return SKIP
    })
  }
}
