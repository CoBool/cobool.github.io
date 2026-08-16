import type { Root as HastRoot } from "hast"
import { visit } from "unist-util-visit"

/**
 * remark-gfm 은 할 일 목록을 이름 없는 disabled 체크박스로 내보내어
 * 보조기기가 완료 여부를 읽지 못하므로, aria-label="완료됨" / "완료되지 않음"을 보강한다.
 */
export function rehypeNameTaskListCheckboxes() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "input" || node.properties.type !== "checkbox") {
        return
      }

      node.properties.ariaLabel = node.properties.checked === true ? "완료됨" : "완료되지 않음"
    })
  }
}
