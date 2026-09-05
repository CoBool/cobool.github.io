"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { prefixBasePath } from "@/lib/base-path"

const UPDATE_INTERVAL_MS = 5 * 60 * 1000
// This value is embedded in the page bundle, so an already-open tab keeps its original version.
// biome-ignore lint/complexity/useLiteralKeys: explicit NEXT_PUBLIC access is required for Next.js inlining.
const PAGE_VERSION = process.env["NEXT_PUBLIC_BUILD_VERSION"]

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return

    let active = true
    let checking = false
    let notifiedVersion: string | undefined
    let registration: ServiceWorkerRegistration | undefined
    const abortController = new AbortController()

    const checkForUpdate = async () => {
      if (!active || checking || !PAGE_VERSION || document.visibilityState === "hidden") return
      checking = true
      try {
        const response = await fetch(prefixBasePath("/build-version.json"), {
          cache: "no-store",
          signal: abortController.signal,
        })
        if (!response.ok) return
        const data: unknown = await response.json()
        if (typeof data !== "object" || data === null || !("version" in data)) return
        const version = data.version
        if (typeof version !== "string" || !version || version === PAGE_VERSION) return
        if (!active || version === notifiedVersion) return
        notifiedVersion = version
        void registration?.update().catch(() => {})
        toast("새로운 글 또는 업데이트가 있습니다.", {
          action: { label: "새로고침", onClick: () => window.location.reload() },
          duration: 8000,
        })
      } catch {
        // Offline and transient failures are retried when the tab becomes visible or online.
      } finally {
        checking = false
      }
    }

    const handleLoad = async () => {
      try {
        registration = await navigator.serviceWorker.register(prefixBasePath("/sw.js"), {
          scope: prefixBasePath("/"),
          updateViaCache: "none",
        })
      } catch {
        // Update checks and normal browsing can continue without offline support.
      }
      if (active) void checkForUpdate()
    }

    if (document.readyState === "complete") void handleLoad()
    else window.addEventListener("load", handleLoad, { once: true })
    const interval = window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS)
    document.addEventListener("visibilitychange", checkForUpdate)
    window.addEventListener("online", checkForUpdate)

    return () => {
      active = false
      abortController.abort()
      window.clearInterval(interval)
      window.removeEventListener("load", handleLoad)
      document.removeEventListener("visibilitychange", checkForUpdate)
      window.removeEventListener("online", checkForUpdate)
    }
  }, [])

  return null
}
