import type { TableOfContentsItem } from "@/lib/markdown"

export type SectionedTableOfContentsItem = TableOfContentsItem &
  Readonly<{ sectionId: string | undefined }>

export function getActiveSectionId(
  items: readonly TableOfContentsItem[],
  activeHeadingId: string | undefined,
): string | undefined {
  if (activeHeadingId === undefined) {
    return undefined
  }

  let currentSectionId: string | undefined

  for (const item of items) {
    if (item.level === 2) {
      currentSectionId = item.id
    }

    if (item.id === activeHeadingId) {
      return item.level === 2 ? item.id : currentSectionId
    }
  }

  return undefined
}

export function createSectionedTableOfContentsItems(
  items: readonly TableOfContentsItem[],
): readonly SectionedTableOfContentsItem[] {
  let currentSectionId: string | undefined

  return items.map((item) => {
    if (item.level === 2) {
      currentSectionId = item.id
    }

    return {
      ...item,
      sectionId: currentSectionId,
    }
  })
}

export function shouldShowTableOfContentsItem(
  item: SectionedTableOfContentsItem,
  activeSectionId: string | undefined,
): boolean {
  return item.level === 2 || item.sectionId === activeSectionId
}
