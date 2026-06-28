"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { TableOfContentsItem } from "@/lib/markdown"

type MobileTocProps = Readonly<{
  items: readonly TableOfContentsItem[]
}>

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

export function MobileToc({ items }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const closeDialogAndRestoreFocus = useCallback(() => {
    setIsOpen(false)
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }, [])
  const closeDialogForNavigation = useCallback((itemId: string) => {
    setIsOpen(false)
    window.requestAnimationFrame(() => {
      const target = document.getElementById(itemId)

      if (target === null) {
        return
      }

      target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    })
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialogAndRestoreFocus()
        return
      }

      if (event.key === "Tab" && dialogRef.current !== null) {
        trapFocusInDialog(event, dialogRef.current)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeDialogAndRestoreFocus, isOpen])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="lg:hidden">
      <button
        className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 text-sm font-semibold leading-[1.55] text-foreground shadow-xs transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        목차 열기
      </button>

      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50"
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <button
            aria-label="목차 닫기"
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/30"
            onClick={closeDialogAndRestoreFocus}
            tabIndex={-1}
            type="button"
          />
          <div className="absolute inset-x-4 bottom-4 max-h-[min(28rem,calc(100dvh-2rem))] overflow-auto rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold leading-[1.55]" id={titleId}>
                목차
              </h2>
              <button
                className="inline-flex min-h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-semibold leading-[1.55] transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onClick={closeDialogAndRestoreFocus}
                ref={closeButtonRef}
                type="button"
              >
                닫기
              </button>
            </div>
            <TocList items={items} onNavigate={closeDialogForNavigation} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function trapFocusInDialog(event: KeyboardEvent, dialog: HTMLDivElement) {
  const focusableElements = getFocusableDialogElements(dialog)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)

  if (firstElement === undefined || lastElement === undefined) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const activeElement = document.activeElement
  const focusIsOutsideDialog = !dialog.contains(activeElement)

  if (event.shiftKey) {
    if (activeElement === firstElement || focusIsOutsideDialog) {
      event.preventDefault()
      lastElement.focus()
    }

    return
  }

  if (activeElement === lastElement || focusIsOutsideDialog) {
    event.preventDefault()
    firstElement.focus()
  }
}

function getFocusableDialogElements(dialog: HTMLDivElement): readonly HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true",
  )
}

function TocList({
  items,
  onNavigate,
}: Readonly<{
  items: readonly TableOfContentsItem[]
  onNavigate: (itemId: string) => void
}>) {
  return (
    <ol className="mt-4 grid gap-2">
      {items.map((item) => (
        <li className={item.level === 3 ? "pl-4" : undefined} key={item.id}>
          <a
            className="block rounded-sm py-1 text-sm leading-[1.55] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`#${item.id}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )
}
