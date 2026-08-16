import type { Element, Root as HastRoot } from "hast"
import { toString as hastToString } from "hast-util-to-string"
import type { VFile } from "vfile"
import { TOC_HEADING_NAMES } from "./headings"

export type TableOfContentsItem = Readonly<{
  id: string
  level: 2 | 3
  text: string
}>

export function rehypeCollectTableOfContents() {
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
