"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

const VISIBILITY_THRESHOLD_PX = 480

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > VISIBILITY_THRESHOLD_PX)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <button
      aria-hidden={!isVisible}
      aria-label="맨 위로"
      className={cn(
        "fixed right-4 bottom-4 z-40 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-[opacity,transform] duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:right-6 sm:bottom-6",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      tabIndex={isVisible ? 0 : -1}
      type="button"
    >
      <Icons.chevronUp aria-hidden="true" className="size-5" />
    </button>
  )
}
