"use client"

import { useEffect, useState } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"

export const ACTIVE_LINE_VIEWPORT_RATIO = 0.35

/**
 * 목차(TOC)에서 현재 스크롤 위치에 해당하는 활성 헤딩 ID를 추적합니다.
 * 뷰포트 높이의 35% 지점(ACTIVE_LINE_VIEWPORT_RATIO)을 지나는 가장 최근 헤딩을 식별합니다.
 *
 * [성능 최적화]:
 * 1. requestAnimationFrame(rAF) 스로틀링을 적용하여 스크롤 중 프레임당 최대 1회만 계산.
 * 2. 역순(Bottom-up) 탐색 및 조기 종료(Early-break)를 통해 활성선 이전 헤딩들의 불필요한 getBoundingClientRect() 호출 방지.
 */
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

      // 아래쪽(최신) 헤딩부터 역순으로 검사하여 활성선(activeLine) 이하에 도달한 첫 번째 요소를 찾으면 즉시 루프 종료
      for (let i = headings.length - 1; i >= 0; i -= 1) {
        const heading = headings[i]

        if (heading !== undefined && heading.getBoundingClientRect().top <= activeLine) {
          nextActiveHeadingId = heading.id
          break
        }
      }

      setActiveHeadingId((current) =>
        current === nextActiveHeadingId ? current : nextActiveHeadingId,
      )
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
