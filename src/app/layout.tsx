import type { Metadata } from "next"
import { DM_Sans, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"
import { ThemeScript } from "./theme-script"
import "./globals.css"

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "True Log",
  description: "A static Markdown blog with a vCard-inspired reading shell.",
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`${fontSans.variable} ${fontMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  )
}
