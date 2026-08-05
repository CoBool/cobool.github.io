// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getHeadingScrollOffset,
  navigateToHeading,
} from "../src/features/post-toc/heading-navigation"

describe("heading navigation", () => {
  it("Given a desktop viewport When calculating heading scroll offset Then it keeps the rail offset", () => {
    expect(getHeadingScrollOffset({ isDesktopViewport: true })).toBe(32)
  })

  it("Given a mobile viewport with a fixed reading topbar When calculating heading scroll offset Then it clears the topbar", () => {
    expect(getHeadingScrollOffset({ isDesktopViewport: false })).toBe(56)
  })
})

describe("navigating to a heading", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined)
    vi.spyOn(window.history, "pushState").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("Given a known heading When navigating Then records the hash and scrolls above it", () => {
    stubViewport({ isDesktop: true })
    placeHeading("first-section", 500)

    navigateToHeading("first-section")

    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "#first-section")
    expect(window.scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 500 - 32 })
  })

  it("Given a narrow viewport When navigating Then leaves room for the reading topbar", () => {
    stubViewport({ isDesktop: false })
    placeHeading("first-section", 500)

    navigateToHeading("first-section")

    expect(window.scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 500 - 56 })
  })

  it("Given an explicit behavior When navigating Then forwards it to the scroll call", () => {
    stubViewport({ isDesktop: true })
    placeHeading("first-section", 500)

    navigateToHeading("first-section", "instant")

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "instant" }))
  })

  it("Given a heading that is not in the document When navigating Then does nothing", () => {
    stubViewport({ isDesktop: true })

    navigateToHeading("missing-section")

    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})

function stubViewport({ isDesktop }: { isDesktop: boolean }): void {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: isDesktop } as MediaQueryList)
}

function placeHeading(id: string, top: number): HTMLHeadingElement {
  const heading = document.createElement("h2")

  heading.id = id
  heading.getBoundingClientRect = () => ({ top }) as DOMRect
  document.body.append(heading)

  return heading
}
