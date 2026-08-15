import Script from "next/script"
import type { GiscusConfig } from "@/config/integrations"

type GiscusCommentsProps = Readonly<{
  config: GiscusConfig
}>

export function GiscusComments({ config }: GiscusCommentsProps) {
  if (!config.enabled) {
    return null
  }

  return (
    <section className="border-t border-border pt-8" aria-label="댓글">
      {/* 일반 JSX <script src>는 React 19가 중복 제거를 위해 <head>(display:none)로 끌어올려
          giscus가 그 옆에 붙이는 댓글 DOM까지 숨겨버린다. next/script는 이 호이스팅을 피하고
          렌더된 위치에 그대로 삽입한다. */}
      <Script
        crossOrigin="anonymous"
        data-category={config.category}
        data-category-id={config.categoryId}
        data-emit-metadata="0"
        data-input-position="bottom"
        data-lang="ko"
        data-mapping={config.mapping}
        data-reactions-enabled="1"
        data-repo={config.repo}
        data-repo-id={config.repoId}
        data-strict="0"
        data-theme="preferred_color_scheme"
        src="https://giscus.app/client.js"
        strategy="lazyOnload"
      />
    </section>
  )
}
