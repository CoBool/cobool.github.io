import type { ReactNode } from "react"
import { ProfileSidebar } from "./profile-sidebar"

type AppShellProps = Readonly<{
  children: ReactNode
  rightRail?: ReactNode
}>

export function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start xl:gap-8">
        <ProfileSidebar />
        <main className="min-w-0">
          {rightRail === undefined ? (
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          ) : (
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
              {children}
              {rightRail}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
