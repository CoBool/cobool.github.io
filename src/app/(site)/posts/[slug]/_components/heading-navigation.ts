"use client"

const HEADING_SCROLL_OFFSET_PX = 32

export function navigateToHeading(headingId: string, behavior: ScrollBehavior = "smooth") {
  const heading = document.getElementById(headingId)

  if (heading === null) {
    return
  }

  window.history.pushState(null, "", `#${headingId}`)
  window.scrollTo({
    behavior,
    top: heading.getBoundingClientRect().top + window.scrollY - HEADING_SCROLL_OFFSET_PX,
  })
}
