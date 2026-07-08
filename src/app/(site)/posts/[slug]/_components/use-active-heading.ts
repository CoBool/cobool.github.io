"use client"

import { useEffect, useState } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"

const ACTIVE_LINE_VIEWPORT_RATIO = 0.35

export function useActiveHeading(items: readonly TableOfContentsItem[]): string | undefined {
  const [activeHeadingId, setActiveHeadingId] = useState<string>()

  useEffect(() => {
    if (items.length === 0) {
      setActiveHeadingId(undefined)
      return
    }

    const headings = items
      .map((item) => item.id)
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null)

    if (headings.length === 0) {
      setActiveHeadingId(undefined)
      return
    }

    let animationFrameId = 0

    const updateActiveHeading = () => {
      const activeLine = window.innerHeight * ACTIVE_LINE_VIEWPORT_RATIO
      let nextActiveHeadingId: string | undefined

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= activeLine) {
          nextActiveHeadingId = heading.id
        }
      }

      setActiveHeadingId(nextActiveHeadingId)
    }

    const requestActiveHeadingUpdate = () => {
      if (animationFrameId !== 0) {
        return
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0
        updateActiveHeading()
      })
    }

    updateActiveHeading()
    window.addEventListener("scroll", requestActiveHeadingUpdate, { passive: true })
    window.addEventListener("resize", requestActiveHeadingUpdate)

    return () => {
      window.removeEventListener("scroll", requestActiveHeadingUpdate)
      window.removeEventListener("resize", requestActiveHeadingUpdate)

      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [items])

  return activeHeadingId
}
