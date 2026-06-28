import type { ReactNode } from "react"

type MainFrameProps = Readonly<{
  children: ReactNode
  labelledBy?: string
  as?: "article" | "section"
  className?: string
}>

export function MainFrame({
  children,
  labelledBy,
  as = "section",
  className = "",
}: MainFrameProps) {
  const frameClassName = [
    "flex min-h-[calc(100dvh-3rem)] min-w-0 flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  if (as === "article") {
    return (
      <article aria-labelledby={labelledBy} className={frameClassName}>
        {children}
      </article>
    )
  }

  return (
    <section aria-labelledby={labelledBy} className={frameClassName}>
      {children}
    </section>
  )
}
