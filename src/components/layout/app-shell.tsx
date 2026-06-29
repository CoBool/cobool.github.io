import type { ReactNode } from "react"
import { ProfileSidebar } from "./profile-sidebar"

type AppShellProps = Readonly<{
  children: ReactNode
}>

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background px-3 py-3 text-foreground sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:items-start xl:gap-6">
        <div className="lg:sticky lg:top-5 lg:w-[240px] lg:shrink-0 lg:self-start 2xl:w-[280px]">
          <ProfileSidebar />
        </div>
        <main className="min-w-0 flex-1">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
