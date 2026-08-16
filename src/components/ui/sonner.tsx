"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// 이 프로젝트는 next-themes 없이 <html class="dark"> 토글로 테마를 직접 관리한다
// (features/theme). sonner 기본 템플릿이 쓰는 next-themes useTheme() 대신
// giscus-comments.tsx 와 같은 방식으로 그 클래스를 직접 관찰한다.
function useSiteTheme(): "light" | "dark" {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"))

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true })

    return () => observer.disconnect()
  }, [])

  return isDark ? "dark" : "light"
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSiteTheme()

  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      theme={theme}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
