"use client"

import { useEffect, useRef } from "react"
import type { GiscusConfig } from "@/config/integrations"

type GiscusCommentsProps = Readonly<{
  config: GiscusConfig
}>

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
    script.setAttribute("data-theme", "preferred_color_scheme")
    script.setAttribute("data-lang", "ko")
    container.appendChild(script)

    return () => {
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
