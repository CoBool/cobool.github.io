"use client"

import { useRef } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import type { TableOfContentsItem } from "@/lib/markdown"
import { PostTableOfContents } from "./post-table-of-contents"

type PostMobileTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

export function PostMobileToc({ items }: PostMobileTocProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  if (items.length === 0) {
    return null
  }

  const openTableOfContents = () => {
    dialogRef.current?.showModal()
  }

  const closeTableOfContents = () => {
    dialogRef.current?.close()
  }

  return (
    <div className="xl:hidden">
      <Button
        aria-haspopup="dialog"
        className="h-8 rounded-full px-3 font-mono text-xs text-muted-foreground"
        onClick={openTableOfContents}
        type="button"
        variant="outline"
      >
        목차
        <Icons.chevronRight aria-hidden="true" className="size-3.5" />
      </Button>
      <dialog
        aria-label="목차"
        className="m-auto w-[min(calc(100vw-2rem),24rem)] rounded-lg border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-background/70 backdrop:backdrop-blur-xs"
        ref={dialogRef}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            목차
          </p>
          <Button
            aria-label="목차 닫기"
            onClick={closeTableOfContents}
            size="sm"
            type="button"
            variant="ghost"
          >
            닫기
          </Button>
        </div>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-5 py-5">
          <PostTableOfContents items={items} onNavigate={closeTableOfContents} />
        </div>
      </dialog>
    </div>
  )
}
