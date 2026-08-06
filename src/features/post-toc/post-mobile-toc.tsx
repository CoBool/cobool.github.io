"use client"

import { type RefObject, useEffect, useRef, useState } from "react"
import { Icons } from "@/components/icons"
import { typography } from "@/components/typography"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { TableOfContentsItem } from "@/lib/markdown"
import { cn } from "@/lib/utils"
import { navigateToHeading } from "./heading-navigation"
import { PostTableOfContents } from "./post-table-of-contents"

type PostMobileTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
  title: string
}>

const SHEET_CLOSE_SCROLL_DELAY_MS = 250

export function PostMobileToc({ items, title }: PostMobileTocProps) {
  const [open, setOpen] = useState(false)
  const topbarSentinelRef = useRef<HTMLDivElement>(null)
  const showReadingBar = useReadingBarVisibility(topbarSentinelRef)

  if (items.length === 0) {
    return null
  }

  const navigateAfterSheetCloses = (headingId: string) => {
    setOpen(false)

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        navigateToHeading(headingId)
      })
    }, SHEET_CLOSE_SCROLL_DELAY_MS)
  }

  return (
    <div className="xl:hidden" data-pagefind-ignore>
      <Sheet onOpenChange={setOpen} open={open}>
        <div aria-hidden="true" className="pointer-events-none h-px w-px" ref={topbarSentinelRef} />
        <SheetTrigger asChild>
          <Button
            className="h-8 rounded-full px-3 text-xs text-muted-foreground"
            type="button"
            variant="outline"
          >
            목차
            <Icons.chevronRight aria-hidden="true" className="size-3.5" />
          </Button>
        </SheetTrigger>
        <div
          className={cn(
            "fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 px-3 text-foreground shadow-xs transition-opacity duration-200 ease-out supports-backdrop-filter:backdrop-blur sm:px-4 xl:hidden",
            showReadingBar ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="mx-auto flex h-11 w-full max-w-[1440px] items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-[1.4]">{title}</p>
            <SheetTrigger asChild>
              <Button
                aria-label="목차 열기"
                className="text-muted-foreground"
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Icons.list aria-hidden="true" className="size-4" />
              </Button>
            </SheetTrigger>
          </div>
        </div>
        <SheetContent className="max-h-[72dvh] rounded-t-lg border-border px-0 pb-6" side="bottom">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className={typography("eyebrow")}>목차</SheetTitle>
            <SheetDescription className="sr-only">글의 섹션으로 이동합니다.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5">
            <PostTableOfContents
              items={items}
              onNavigate={navigateAfterSheetCloses}
              showTitle={false}
              variant="sheet"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function useReadingBarVisibility(sentinelRef: RefObject<HTMLDivElement | null>) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let animationFrameId: number | undefined

    const updateVisibility = () => {
      const sentinel = sentinelRef.current

      if (sentinel === null) {
        return
      }

      setIsVisible(sentinel.getBoundingClientRect().top <= 0)
    }

    const scheduleUpdate = () => {
      if (animationFrameId !== undefined) {
        return
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = undefined
        updateVisibility()
      })
    }

    updateVisibility()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId)
      }

      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [sentinelRef])

  return isVisible
}
