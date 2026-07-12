import { describe, expect, it } from "vitest"
import { getHeadingScrollOffset } from "../src/features/post-toc/heading-navigation"

describe("heading navigation", () => {
  it("Given a desktop viewport When calculating heading scroll offset Then it keeps the rail offset", () => {
    expect(getHeadingScrollOffset({ isDesktopViewport: true })).toBe(32)
  })

  it("Given a mobile viewport with a fixed reading topbar When calculating heading scroll offset Then it clears the topbar", () => {
    expect(getHeadingScrollOffset({ isDesktopViewport: false })).toBe(56)
  })
})
