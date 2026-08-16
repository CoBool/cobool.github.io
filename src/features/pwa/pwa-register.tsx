"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // LCP 및 초기 렌더링 성능 저하를 방지하기 위해 load 이벤트 이후 지연 등록
    const handleLoad = async () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      const basePath = process.env["NEXT_PUBLIC_BASE_PATH"]?.trim() ?? ""
      const normalizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
      const swUrl = `${normalizedBasePath}/sw.js`
      const scope = `${normalizedBasePath}/`

      try {
        const registration = await navigator.serviceWorker.register(swUrl, { scope })

        // 새 버전의 Service Worker 가 대기(waiting) 중일 때 업데이트 알림 제공
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker === null) {
            return
          }

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              toast("새로운 글 또는 업데이트가 있습니다.", {
                action: {
                  label: "새로고침",
                  onClick: () => window.location.reload(),
                },
                duration: 8000,
              })
            }
          })
        })
      } catch {
        // Service Worker 등록 실패는 조용히 넘어가 정상 웹 렌더링에 영향을 주지 않는다.
      }
    }

    if (document.readyState === "complete") {
      handleLoad()
    } else {
      window.addEventListener("load", handleLoad, { once: true })
    }
  }, [])

  return null
}
