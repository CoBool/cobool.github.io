import { describe, expect, it } from "vitest"
import { parsePostFrontmatter } from "../src/lib/markdown/frontmatter"

const valid = { title: "Post", date: "2026-09-01", tags: ["next.js"], category: "engineering" }

describe("taxonomy route validation", () => {
  it.each([".", "..", " . ", " .. "])("rejects dot segment %s in either taxonomy", (value) => {
    for (const data of [
      { ...valid, tags: [value] },
      { ...valid, category: value },
    ]) {
      expect(() => parsePostFrontmatter({ data, slug: "post", filePath: "post.md" })).toThrow(
        "dot path segment",
      )
    }
  })
  it("allows dots inside normal names", () => {
    expect(parsePostFrontmatter({ data: valid, slug: "post", filePath: "post.md" }).tags).toEqual([
      "next.js",
    ])
  })
})
