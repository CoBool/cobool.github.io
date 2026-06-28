import type { ReactNode } from "react"
import { ProfileSidebar } from "./profile-sidebar"

type AppShellProps = Readonly<{
  children: ReactNode
  rightRail?: ReactNode
}>

export function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
        <div className="lg:w-[240px] lg:shrink-0 2xl:w-[280px]">
          <ProfileSidebar />
        </div>
        <main className="min-w-0 flex-1">
          {rightRail === undefined ? (
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          ) : (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">{children}</div>
              <div className="lg:w-[240px] lg:shrink-0 2xl:w-[256px]">{rightRail}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
