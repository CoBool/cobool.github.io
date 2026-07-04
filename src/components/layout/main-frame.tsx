import type { ReactNode } from "react"

type MainFrameProps = Readonly<{
  children: ReactNode
}>

export function MainFrame({ children }: MainFrameProps) {
  return (
    <div className="flex min-h-[calc(100dvh-1.5rem)] min-w-0 flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:min-h-[calc(100dvh-2rem)] sm:p-8 lg:min-h-[calc(100dvh-2.5rem)]">
      {children}
    </div>
  )
}
