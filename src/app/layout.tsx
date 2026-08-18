import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { GoogleAnalytics } from "@/components/google-analytics"
import { AppShell } from "@/components/layout"
import { Toaster } from "@/components/ui/sonner"
import { getPublicIntegrations } from "@/config/integrations"
import { siteConfig, themeColors } from "@/config/site"
import { PwaRegister } from "@/features/pwa/pwa-register"
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
  verification: {
    other: {
      "naver-site-verification": "43f4855c07e8a3aa41b09963d118eafa849c2637",
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: "(prefers-color-scheme: dark)", color: themeColors.dark },
  ],
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
        <PwaRegister />
        <Toaster />
      </body>
    </html>
  )
}
