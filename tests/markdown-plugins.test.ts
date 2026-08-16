import { describe, expect, it } from "vitest"
import {
  isRootTocHeading,
  rehypeNormalizeHeadingIds,
  rehypeWrapTables,
  TABLE_WRAPPER_CLASS_NAME,
} from "../src/lib/markdown/plugins"

describe("markdown custom plugins unit tests", () => {
  describe("tables plugin", () => {
    it("exports TABLE_WRAPPER_CLASS_NAME constant", () => {
      expect(TABLE_WRAPPER_CLASS_NAME).toBe("table-wrapper")
      expect(typeof rehypeWrapTables).toBe("function")
    })
  })

  describe("headings plugin", () => {
    it("isRootTocHeading identifies h2 and h3 under root parent", () => {
      const rootParent = { type: "root", children: [] } as const
      const nonRootParent = { type: "element", tagName: "blockquote", children: [] } as const

      expect(
        isRootTocHeading(
          { type: "element", tagName: "h2", properties: {}, children: [] },
          0,
          rootParent as never,
        ),
      ).toBe(true)

      expect(
        isRootTocHeading(
          { type: "element", tagName: "h3", properties: {}, children: [] },
          0,
          rootParent as never,
        ),
      ).toBe(true)

      expect(
        isRootTocHeading(
          { type: "element", tagName: "h4", properties: {}, children: [] },
          0,
          rootParent as never,
        ),
      ).toBe(false)

      expect(
        isRootTocHeading(
          { type: "element", tagName: "h2", properties: {}, children: [] },
          0,
          nonRootParent as never,
        ),
      ).toBe(false)
    })

    it("rehypeNormalizeHeadingIds provides fallback ids for empty or symbol-only headings", () => {
      const tree = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "h2",
            properties: { id: "-1" },
            children: [],
          },
        ],
      } as const

      const transform = rehypeNormalizeHeadingIds()
      transform(tree as never)

      expect(tree.children[0]?.properties.id).toBe("section")
    })
  })
})
