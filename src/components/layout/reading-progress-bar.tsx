"use client"

import { useEffect, useState } from "react"

export function ReadingProgressBar() {
  // 0~1 비율. width 대신 scaleX 로 그려 매 프레임 layout/paint 없이 컴포지터만 태운다.
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrameId = 0

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight

      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }

    // 스크롤 이벤트는 프레임당 여러 번 올 수 있어 rAF 로 한 번으로 접는다.
    const scheduleUpdate = () => {
      if (animationFrameId !== 0) {
        return
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0
        updateProgress()
      })
    }

    updateProgress()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)

      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full origin-left bg-primary transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
