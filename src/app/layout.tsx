import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans_KR } from "next/font/google"
import type { ReactNode } from "react"
import { ThemeScript } from "./theme-script"
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
  title: "True Log",
  description: "Markdown 글을 정적 페이지로 빌드하는 한국어 중심 기술 블로그입니다.",
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`${fontSans.variable} ${fontMono.variable}`}
      lang="ko"
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  )
}
