"use client"

export function navigateToHeading(headingId: string, behavior: ScrollBehavior = "smooth") {
  const heading = document.getElementById(headingId)

  if (heading === null) {
    return
  }

  window.history.pushState(null, "", `#${headingId}`)
  heading.scrollIntoView({ behavior, block: "start" })
}
