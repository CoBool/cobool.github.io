import type { ReactNode } from "react"
import { MainFrame } from "@/components/layout"

type SiteLayoutProps = Readonly<{
  children: ReactNode
}>

export default function SiteLayout({ children }: SiteLayoutProps) {
  return <MainFrame>{children}</MainFrame>
}
