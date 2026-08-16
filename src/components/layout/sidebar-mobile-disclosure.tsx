"use client"

import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useId, useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SidebarMobileDisclosureProps = Readonly<{
  children: ReactNode
}>

// 사이드바에서 상태가 필요한 건 이 모바일 접기 토글뿐이라, 서버에서 그린 콘텐츠를
// children 으로 받아 토글 껍데기만 클라이언트로 남긴다.
export function SidebarMobileDisclosure({ children }: SidebarMobileDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== null) {
      setIsOpen(false)
    }
  }, [pathname])

  return (
    <>
      <Button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="group mt-5 w-full cursor-pointer justify-between rounded-md border-transparent bg-transparent text-sidebar-foreground hover:bg-transparent hover:text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground xl:hidden"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        size="lg"
        type="button"
        variant="ghost"
      >
        탐색
        <Icons.chevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-aria-expanded:rotate-180"
        />
      </Button>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out xl:hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={contentId}
        inert={!isOpen}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </>
  )
}
