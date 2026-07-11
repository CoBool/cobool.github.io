import type { Metadata } from "next"
import type { ReactNode } from "react"
import { GoogleAnalytics } from "@/components/google-analytics"
import { AppShell } from "@/components/layout"
import { getPublicIntegrations } from "@/config/integrations"
import { siteConfig } from "@/config/site"
import { ThemeScript } from "@/features/theme/theme-script"
import { createPageMetadata } from "@/lib/seo"
import "./globals.css"

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  const integrations = getPublicIntegrations()

  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <GoogleAnalytics config={integrations.ga4} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
