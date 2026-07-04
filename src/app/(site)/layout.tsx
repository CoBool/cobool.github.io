import type { ReactNode } from "react"
import { MainBreadcrumbs, MainFrame } from "@/components/layout"
import { createBreadcrumbLabelMap } from "@/lib/breadcrumbs"

type SiteLayoutProps = Readonly<{
  children: ReactNode
}>

export default function SiteLayout({ children }: SiteLayoutProps) {
  const breadcrumbLabels = createBreadcrumbLabelMap()

  return (
    <MainFrame>
      <MainBreadcrumbs breadcrumbLabels={breadcrumbLabels} />
      {children}
    </MainFrame>
  )
}
