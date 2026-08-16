import type { ReactNode } from "react"
import { BackToTopButton } from "./back-to-top-button"
import { ProfileSidebar } from "./profile-sidebar"
import { SiteFooter } from "./site-footer"

type AppShellProps = Readonly<{
  children: ReactNode
}>

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background px-3 py-3 text-foreground sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 xl:flex-row xl:items-start xl:gap-6">
        <div className="xl:sticky xl:top-5 xl:w-[240px] xl:shrink-0 xl:self-start">
          <ProfileSidebar />
        </div>
        <main className="min-w-0 flex-1">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <SiteFooter />
      <BackToTopButton />
    </div>
  )
}
