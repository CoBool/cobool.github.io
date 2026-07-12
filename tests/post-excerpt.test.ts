import { describe, expect, it } from "vitest"
import { extractPostExcerpt } from "../src/lib/post-excerpt"

describe("post excerpt", () => {
  it("Given math followed only by punctuation When extracting text Then falls back to the title", () => {
    expect(extractPostExcerpt("$x$.", "Fallback Title", undefined)).toBe("Fallback Title")
  })

  it("Given math between words When extracting text Then preserves the word boundary", () => {
    expect(extractPostExcerpt("Value$x$is useful.", "Fallback", undefined)).toBe("Value is useful.")
  })

  it("Given a Markdown hard break When extracting text Then preserves the line boundary", () => {
    expect(extractPostExcerpt("First  \nSecond line.", "Fallback", undefined)).toBe(
      "First Second line.",
    )
  })

  it("Given math is disabled When extracting currency text Then preserves dollar notation", () => {
    expect(extractPostExcerpt("It costs $5 and $10 today.", "Fallback", false)).toBe(
      "It costs $5 and $10 today.",
    )
  })
})
