// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useActiveHeading } from "../src/features/post-toc/use-active-heading"
import type { TableOfContentsItem } from "../src/lib/markdown"

declare global {
  interface Window {
    happyDOM: {
      setViewport: (options: { width?: number; height?: number }) => void
    }
  }
}

// 활성 판정선은 뷰포트 높이의 35% 지점이다. 800px 뷰포트에서는 280px.
const VIEWPORT_HEIGHT = 800
const ACTIVE_LINE = 280

describe("active heading tracking", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    window.happyDOM.setViewport({ height: VIEWPORT_HEIGHT })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("Given no table of contents entries When tracking Then reports no active heading", () => {
    const { result } = renderHook(() => useActiveHeading([]))

    expect(result.current).toBeUndefined()
  })

  it("Given entries whose headings are absent from the document When tracking Then reports no active heading", () => {
    const { result } = renderHook(() => useActiveHeading(tocItems("missing-one", "missing-two")))

    expect(result.current).toBeUndefined()
  })

  it("Given headings above the active line When tracking Then reports the last one that crossed it", () => {
    placeHeading("intro", 100)
    placeHeading("body", 200)
    placeHeading("outro", 600)

    const { result } = renderHook(() => useActiveHeading(tocItems("intro", "body", "outro")))

    expect(result.current).toBe("body")
  })

  it("Given multiple headings When bottom-up search finds active heading Then it breaks early without measuring earlier headings", () => {
    const first = placeHeading("first", -300)
    const second = placeHeading("second", 150)
    const third = placeHeading("third", 500)

    const firstMeasure = vi.spyOn(first, "getBoundingClientRect")
    const secondMeasure = vi.spyOn(second, "getBoundingClientRect")
    const thirdMeasure = vi.spyOn(third, "getBoundingClientRect")

    const { result } = renderHook(() => useActiveHeading(tocItems("first", "second", "third")))

    expect(result.current).toBe("second")
    expect(thirdMeasure).toHaveBeenCalled()
    expect(secondMeasure).toHaveBeenCalled()
    // second가 activeLine 이하이므로 루프가 조기 종료되어 first는 측정되지 않아야 한다.
    expect(firstMeasure).not.toHaveBeenCalled()
  })

  it("Given every heading below the active line When tracking Then reports no active heading", () => {
    placeHeading("intro", ACTIVE_LINE + 1)

    const { result } = renderHook(() => useActiveHeading(tocItems("intro")))

    expect(result.current).toBeUndefined()
  })

  it("Given a scroll that moves a heading past the line When tracking Then updates on the next frame", async () => {
    const intro = placeHeading("intro", 100)
    const outro = placeHeading("outro", 600)
    const { result } = renderHook(() => useActiveHeading(tocItems("intro", "outro")))

    expect(result.current).toBe("intro")

    setHeadingTop(intro, -400)
    setHeadingTop(outro, 100)
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
      await animationFrame()
    })

    expect(result.current).toBe("outro")
  })

  it("Given repeated scroll events before a frame runs When tracking Then measures only once", async () => {
    const heading = placeHeading("intro", 100)
    const measure = vi.spyOn(heading, "getBoundingClientRect")

    renderHook(() => useActiveHeading(tocItems("intro")))
    measure.mockClear()

    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      await animationFrame()
    })

    expect(measure).toHaveBeenCalledTimes(1)
  })

  it("Given the hook unmounts When a later scroll fires Then it no longer measures", async () => {
    const heading = placeHeading("intro", 100)
    const { unmount } = renderHook(() => useActiveHeading(tocItems("intro")))
    const measure = vi.spyOn(heading, "getBoundingClientRect")

    unmount()
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
      await animationFrame()
    })

    expect(measure).not.toHaveBeenCalled()
  })
})

function tocItems(...ids: readonly string[]): readonly TableOfContentsItem[] {
  return ids.map((id) => ({ id, level: 2, text: id }))
}

function placeHeading(id: string, top: number): HTMLHeadingElement {
  const heading = document.createElement("h2")

  heading.id = id
  document.body.append(heading)
  setHeadingTop(heading, top)

  return heading
}

function setHeadingTop(heading: HTMLElement, top: number): void {
  heading.getBoundingClientRect = () => ({ top }) as DOMRect
}

function animationFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}
