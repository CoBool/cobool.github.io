"use client"

import { ChevronDownIcon } from "lucide-react"
import { type ReactNode, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

type ProfileSidebarDisclosureProps = Readonly<{
  summary: ReactNode
  children: ReactNode
}>

export function ProfileSidebarDisclosure({ summary, children }: ProfileSidebarDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  return (
    <Collapsible asChild onOpenChange={setIsOpen} open={isOpen}>
      <aside
        aria-label="사이트 프로필"
        className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm lg:sticky lg:top-8"
      >
        <div>
          {summary}
          <Button
            aria-controls={contentId}
            aria-expanded={isOpen}
            className="group mt-5 w-full justify-between border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-primary data-[state=open]:text-primary-foreground lg:hidden"
            data-state={isOpen ? "open" : "closed"}
            onClick={() => setIsOpen((current) => !current)}
            size="lg"
            type="button"
            variant="outline"
          >
            메뉴
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 transition-transform duration-150 group-data-[state=open]:rotate-180"
            />
          </Button>
          <CollapsibleContent
            className="data-[state=closed]:hidden lg:block lg:data-[state=closed]:block"
            forceMount
            id={contentId}
          >
            {children}
          </CollapsibleContent>
        </div>
      </aside>
    </Collapsible>
  )
}
