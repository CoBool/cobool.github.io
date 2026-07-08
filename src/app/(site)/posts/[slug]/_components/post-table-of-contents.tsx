"use client"

import type { MouseEvent } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"
import { useActiveHeading } from "./use-active-heading"

type PostTableOfContentsVariant = "rail" | "sheet"

type PostTableOfContentsProps = Readonly<{
  items: readonly TableOfContentsItem[]
  onNavigate?: (headingId: string) => void
  showTitle?: boolean
  variant?: PostTableOfContentsVariant
}>

export function PostTableOfContents({
  items,
  onNavigate,
  showTitle = true,
  variant = "rail",
}: PostTableOfContentsProps) {
  const activeHeadingId = useActiveHeading(items)
  const activeSectionId = findActiveSectionId(items, activeHeadingId)
  const sectionedItems = sectionTableOfContentsItems(items)

  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="목차"
      className={
        variant === "rail"
          ? "border-l border-border/80 pl-5 text-sm leading-[1.55]"
          : "text-sm leading-[1.55]"
      }
    >
      {showTitle ? (
        <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
          목차
        </p>
      ) : null}
      <ol className={showTitle ? "mt-4 space-y-2" : "space-y-2"}>
        {sectionedItems.map((item) => {
          const isActive = item.id === activeHeadingId
          const isVisible = item.level === 2 || item.sectionId === activeSectionId
          const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
            if (onNavigate === undefined) {
              return
            }

            event.preventDefault()
            onNavigate(item.id)
          }

          if (!isVisible) {
            return null
          }

          return (
            <li className={item.level === 3 ? "pl-4" : undefined} key={item.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                className={
                  isActive
                    ? "block rounded-sm py-0.5 font-semibold text-foreground underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    : "block rounded-sm py-0.5 text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                }
                href={`#${item.id}`}
                onClick={handleNavigate}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

type SectionedTableOfContentsItem = TableOfContentsItem &
  Readonly<{ sectionId: string | undefined }>

function findActiveSectionId(
  items: readonly TableOfContentsItem[],
  activeHeadingId: string | undefined,
): string | undefined {
  if (activeHeadingId === undefined) {
    return undefined
  }

  let currentSectionId: string | undefined

  for (const item of items) {
    if (item.level === 2) {
      currentSectionId = item.id
    }

    if (item.id === activeHeadingId) {
      return item.level === 2 ? item.id : currentSectionId
    }
  }

  return undefined
}

function sectionTableOfContentsItems(
  items: readonly TableOfContentsItem[],
): readonly SectionedTableOfContentsItem[] {
  let currentSectionId: string | undefined

  return items.map((item) => {
    if (item.level === 2) {
      currentSectionId = item.id
    }

    return {
      ...item,
      sectionId: currentSectionId,
    }
  })
}
