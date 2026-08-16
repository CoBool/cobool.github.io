import type { Element, Root as HastRoot, Parents } from "hast"
import { visit } from "unist-util-visit"

export const HEADING_NAMES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])
export const TOC_HEADING_NAMES = new Set(["h2", "h3"])
const EMPTY_GITHUB_SLUG_PATTERN = /^-\d+$/

/**
 * 기호만 있는 제목(예: ## 🎉, ## !!!)이나 빈 제목이 rehype-slug 에서
 * 공백/숫자 전용 id(-1 등)로 축약되어 깨지는 현상을 방지하고 고유의 대체 id(section, section-1)를 부여한다.
 */
export function rehypeNormalizeHeadingIds() {
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

export function isRootTocHeading(element: Element, _index?: number, parent?: Parents): boolean {
  return parent?.type === "root" && TOC_HEADING_NAMES.has(element.tagName)
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
