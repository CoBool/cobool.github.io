import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="페이지 탐색"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<typeof Link>

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size={size}
      className={cn(
        "rounded-[var(--radius-compact)]",
        isActive
          ? "bg-muted text-foreground hover:bg-muted"
          : "text-muted-foreground hover:border-border hover:bg-transparent hover:text-foreground",
        className,
      )}
    >
      <Link
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationDisabled({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      {...props}
      aria-disabled="true"
      data-slot="pagination-link"
      data-size="icon"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "rounded-[var(--radius-compact)] cursor-default text-muted-foreground/40 hover:bg-transparent active:translate-y-0",
        className,
      )}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="이전 페이지" className={className} size="icon" {...props}>
      <ChevronLeftIcon aria-hidden="true" />
      <span className="sr-only">이전</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="다음 페이지" className={className} size="icon" {...props}>
      <span className="sr-only">다음</span>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  )
}

function PaginationPreviousDisabled() {
  return (
    <PaginationDisabled aria-label="이전 페이지">
      <ChevronLeftIcon aria-hidden="true" />
      <span className="sr-only">이전</span>
    </PaginationDisabled>
  )
}

function PaginationNextDisabled() {
  return (
    <PaginationDisabled aria-label="다음 페이지">
      <span className="sr-only">다음</span>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationDisabled>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">페이지 생략</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationNextDisabled,
  PaginationPrevious,
  PaginationPreviousDisabled,
}
