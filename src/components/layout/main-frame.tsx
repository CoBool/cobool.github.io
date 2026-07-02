import type { ReactNode } from "react"
import { createBreadcrumbLabelMap } from "@/lib/breadcrumbs"
import type { BreadcrumbLabels } from "./main-breadcrumbs"
import { MainBreadcrumbs } from "./main-breadcrumbs"

type MainFrameProps = Readonly<{
  children: ReactNode
  labelledBy?: string
  as?: "article" | "section"
  className?: string
  breadcrumbLabel?: string
  breadcrumbLabels?: BreadcrumbLabels | undefined
}>

export function MainFrame({
  children,
  labelledBy,
  as = "section",
  className = "",
  breadcrumbLabel,
  breadcrumbLabels,
}: MainFrameProps) {
  const resolvedBreadcrumbLabels = breadcrumbLabels ?? createBreadcrumbLabelMap()
  const frameClassName = [
    "flex min-h-[calc(100dvh-1.5rem)] min-w-0 flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:min-h-[calc(100dvh-2rem)] sm:p-8 lg:min-h-[calc(100dvh-2.5rem)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  if (as === "article") {
    return (
      <article aria-labelledby={labelledBy} className={frameClassName}>
        <MainBreadcrumbs
          breadcrumbLabels={resolvedBreadcrumbLabels}
          currentLabel={breadcrumbLabel}
        />
        {children}
      </article>
    )
  }

  return (
    <section aria-labelledby={labelledBy} className={frameClassName}>
      <MainBreadcrumbs breadcrumbLabels={resolvedBreadcrumbLabels} currentLabel={breadcrumbLabel} />
      {children}
    </section>
  )
}
