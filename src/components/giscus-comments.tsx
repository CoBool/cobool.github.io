"use client"

import { useEffect, useRef } from "react"
import type { GiscusConfig } from "@/config/integrations"

type GiscusCommentsProps = Readonly<{
  config: GiscusConfig
}>

const GISCUS_ORIGIN = "https://giscus.app"

// 사이트 테마는 next-themes가 아니라 <html class="dark"> 토글로 직접 관리된다(features/theme).
// giscus의 data-theme="preferred_color_scheme"는 OS 설정만 보고, 이 클래스를 모른다.
function resolveGiscusTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function GiscusComments({ config }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (container === null || !config.enabled) {
      return
    }

    const script = document.createElement("script")

    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("data-repo", config.repo)
    script.setAttribute("data-repo-id", config.repoId)
    script.setAttribute("data-category", config.category)
    script.setAttribute("data-category-id", config.categoryId)
    script.setAttribute("data-mapping", config.mapping)
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "bottom")
    script.setAttribute("data-theme", resolveGiscusTheme())
    script.setAttribute("data-lang", "ko")
    container.appendChild(script)

    // 테마가 바뀌어도 iframe은 다시 만들지 않고, giscus 자체 프로토콜로 실시간 전환한다.
    // https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#isetconfigmessage
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector<HTMLIFrameElement>("iframe.giscus-frame")

      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: resolveGiscusTheme() } } },
        GISCUS_ORIGIN,
      )
    })

    observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true })

    return () => {
      observer.disconnect()
      container.replaceChildren()
    }
  }, [config])

  if (!config.enabled) {
    return null
  }

  // next/script와 일반 <script> JSX 태그는 모두 렌더된 위치를 무시하고
  // 각각 body 끝, 호이스팅된 head로 스크립트를 옮긴다. giscus는 자기 스크립트
  // 옆에 위젯 DOM을 꽂으므로, 위치가 옮겨지면 위젯도 우리 레이아웃 밖으로 나간다.
  // ref가 가리키는 이 컨테이너에 직접 스크립트를 넣어 위치를 고정한다.
  return <section aria-label="댓글" className="border-t border-border pt-8" ref={containerRef} />
}
