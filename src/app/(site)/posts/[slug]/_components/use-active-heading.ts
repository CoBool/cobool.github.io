"use client"

import { useEffect, useState } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"

const HEADING_OBSERVER_OPTIONS = {
  root: null,
  rootMargin: "-20% 0px -65% 0px",
  threshold: 0,
} as const

export function useActiveHeading(items: readonly TableOfContentsItem[]): string | undefined {
  const [activeHeadingId, setActiveHeadingId] = useState<string>()

  useEffect(() => {
    if (items.length === 0) {
      setActiveHeadingId(undefined)
      return
    }

    const headingIds = items.map((item) => item.id)
    const visibleHeadings = new Set<string>()
    const headings = headingIds
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null)

    if (headings.length === 0) {
      setActiveHeadingId(undefined)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visibleHeadings.add(entry.target.id)
        } else {
          visibleHeadings.delete(entry.target.id)
        }
      }

      const nextActiveHeading = headingIds.find((id) => visibleHeadings.has(id))
      setActiveHeadingId(nextActiveHeading)
    }, HEADING_OBSERVER_OPTIONS)

    for (const heading of headings) {
      observer.observe(heading)
    }

    return () => {
      observer.disconnect()
    }
  }, [items])

  return activeHeadingId
}
