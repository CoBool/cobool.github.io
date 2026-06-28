import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans_KR } from "next/font/google"
import type { ReactNode } from "react"
import { GoogleAnalytics } from "@/components/google-analytics"
import { getPublicIntegrations } from "@/config/integrations"
import { siteConfig } from "@/config/site"
import { ThemeScript } from "@/features/theme/theme-script"
import { createPageMetadata } from "@/lib/seo"
import "./globals.css"

const fontSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
    <html
      className={`${fontSans.variable} ${fontMono.variable}`}
      lang="ko"
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        <GoogleAnalytics config={integrations.ga4} />
        {children}
      </body>
    </html>
  )
}
