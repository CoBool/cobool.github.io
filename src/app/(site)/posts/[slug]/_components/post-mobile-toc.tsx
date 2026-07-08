"use client"

import { useState } from "react"
import { Icons } from "@/components/icons"
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
import { PostTableOfContents } from "./post-table-of-contents"

type PostMobileTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

export function PostMobileToc({ items }: PostMobileTocProps) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="xl:hidden">
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button
            className="h-8 rounded-full px-3 font-mono text-xs text-muted-foreground"
            type="button"
            variant="outline"
          >
            목차
            <Icons.chevronRight aria-hidden="true" className="size-3.5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="max-h-[72dvh] rounded-t-lg border-border px-0 pb-6" side="bottom">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
              목차
            </SheetTitle>
            <SheetDescription className="sr-only">글의 섹션으로 이동합니다.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5">
            <PostTableOfContents
              items={items}
              onNavigate={() => setOpen(false)}
              showTitle={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
