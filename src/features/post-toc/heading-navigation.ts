"use client"

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 1280px)"
const DESKTOP_HEADING_SCROLL_OFFSET_PX = 32
const MOBILE_READING_BAR_HEIGHT_PX = 44
const HEADING_SCROLL_CLEARANCE_PX = 12
const MOBILE_HEADING_SCROLL_OFFSET_PX = MOBILE_READING_BAR_HEIGHT_PX + HEADING_SCROLL_CLEARANCE_PX

type HeadingScrollOffsetOptions = Readonly<{
  isDesktopViewport: boolean
}>

export function navigateToHeading(headingId: string, behavior: ScrollBehavior = "smooth") {
  const heading = document.getElementById(headingId)

  if (heading === null) {
    return
  }

  window.history.pushState(null, "", `#${headingId}`)
  window.scrollTo({
    behavior,
    top: heading.getBoundingClientRect().top + window.scrollY - getCurrentHeadingScrollOffset(),
  })
}

export function getHeadingScrollOffset({ isDesktopViewport }: HeadingScrollOffsetOptions): number {
  return isDesktopViewport ? DESKTOP_HEADING_SCROLL_OFFSET_PX : MOBILE_HEADING_SCROLL_OFFSET_PX
}

function getCurrentHeadingScrollOffset(): number {
  return getHeadingScrollOffset({
    isDesktopViewport: window.matchMedia(DESKTOP_BREAKPOINT_QUERY).matches,
  })
}
