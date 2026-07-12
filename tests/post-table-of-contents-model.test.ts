import { describe, expect, it } from "vitest"
import {
  createSectionedTableOfContentsItems,
  getActiveSectionId,
  type SectionedTableOfContentsItem,
  shouldShowTableOfContentsItem,
} from "../src/features/post-toc/post-table-of-contents-model"
import type { TableOfContentsItem } from "../src/lib/markdown"

const tocItems = [
  { id: "layout", level: 2, text: "Layout" },
  { id: "desktop", level: 3, text: "Desktop" },
  { id: "mobile", level: 3, text: "Mobile" },
  { id: "modal", level: 2, text: "Modal" },
  { id: "sheet", level: 3, text: "Sheet" },
] satisfies readonly TableOfContentsItem[]

describe("post table of contents model", () => {
  it("Given nested TOC items When sectioning them Then each h3 inherits its h2 section", () => {
    expect(createSectionedTableOfContentsItems(tocItems)).toEqual([
      { id: "layout", level: 2, text: "Layout", sectionId: "layout" },
      { id: "desktop", level: 3, text: "Desktop", sectionId: "layout" },
      { id: "mobile", level: 3, text: "Mobile", sectionId: "layout" },
      { id: "modal", level: 2, text: "Modal", sectionId: "modal" },
      { id: "sheet", level: 3, text: "Sheet", sectionId: "modal" },
    ])
  })

  it("Given an active h3 When finding the active section Then it returns the parent h2", () => {
    expect(getActiveSectionId(tocItems, "mobile")).toBe("layout")
  })

  it("Given a collapsed inactive section When checking visibility Then h2 stays visible and inactive h3 hides", () => {
    const layoutSection = {
      id: "layout",
      level: 2,
      sectionId: "layout",
      text: "Layout",
    } satisfies SectionedTableOfContentsItem
    const inactiveChild = {
      id: "desktop",
      level: 3,
      sectionId: "layout",
      text: "Desktop",
    } satisfies SectionedTableOfContentsItem
    const activeChild = {
      id: "sheet",
      level: 3,
      sectionId: "modal",
      text: "Sheet",
    } satisfies SectionedTableOfContentsItem

    expect(shouldShowTableOfContentsItem(layoutSection, "modal")).toBe(true)
    expect(shouldShowTableOfContentsItem(inactiveChild, "modal")).toBe(false)
    expect(shouldShowTableOfContentsItem(activeChild, "modal")).toBe(true)
  })
})
