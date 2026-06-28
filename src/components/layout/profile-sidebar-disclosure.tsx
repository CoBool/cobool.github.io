"use client"

import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type ProfileSidebarDisclosureProps = Readonly<{
  summary: ReactNode
  children: ReactNode
}>

export function ProfileSidebarDisclosure({ summary, children }: ProfileSidebarDisclosureProps) {
  return (
    <Collapsible asChild>
      <aside
        aria-label="사이트 프로필"
        className="rounded-lg border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm lg:sticky lg:top-8"
      >
        <div>
          {summary}
          <CollapsibleTrigger asChild>
            <Button
              className="group mt-5 w-full justify-between border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-primary data-[state=open]:text-primary-foreground lg:hidden"
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
          </CollapsibleTrigger>
          <CollapsibleContent
            className="data-[state=closed]:hidden lg:block lg:data-[state=closed]:block"
            forceMount
          >
            {children}
          </CollapsibleContent>
        </div>
      </aside>
    </Collapsible>
  )
}
