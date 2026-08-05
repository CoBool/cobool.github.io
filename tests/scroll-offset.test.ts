import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { getHeadingScrollOffset } from "../src/features/post-toc/heading-navigation"

// 주석에 규칙의 근거를 적어 두므로, 선언만 남기고 검사한다.
const globalsCss = readFileSync("src/app/globals.css", "utf8").replaceAll(/\/\*[\s\S]*?\*\//g, "")
const markdownContent = readFileSync("src/components/markdown-content.tsx", "utf8")

/** Tailwind 의 scroll-mt-* 는 0.25rem 단위다. scroll-mt-14 는 3.5rem, 곧 56px. */
const REM_STEP_PX = 4

describe("heading anchor offsets", () => {
  it("Given the scrollport When scrolling to an anchor Then no padding is added on top of scroll-margin", () => {
    expect(globalsCss).not.toMatch(/scroll-padding[\w-]*\s*:/)
  })

  it("Given prose headings When landing Then the css offset matches what the click handler applies", () => {
    expect(proseScrollMarginPx("prose-h2")).toBe(
      getHeadingScrollOffset({ isDesktopViewport: false }),
    )
    expect(proseScrollMarginPx("xl:prose-h2")).toBe(
      getHeadingScrollOffset({ isDesktopViewport: true }),
    )
  })

  it("Given both heading levels When landing Then they share one offset", () => {
    expect(proseScrollMarginPx("prose-h3")).toBe(proseScrollMarginPx("prose-h2"))
    expect(proseScrollMarginPx("xl:prose-h3")).toBe(proseScrollMarginPx("xl:prose-h2"))
  })
})

function proseScrollMarginPx(variant: string): number {
  const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const step = markdownContent.match(new RegExp(`${escaped}:scroll-mt-(\\d+)`))?.[1]

  if (step === undefined) {
    throw new Error(`Expected markdown-content.tsx to set ${variant}:scroll-mt-*`)
  }

  return Number(step) * REM_STEP_PX
}
