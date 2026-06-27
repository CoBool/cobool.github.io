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
      <script
        src="https://giscus.app/client.js"
        data-repo={config.repo}
        data-repo-id={config.repoId}
        data-category={config.category}
        data-category-id={config.categoryId}
        data-mapping={config.mapping}
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossOrigin="anonymous"
        async
      />
    </section>
  )
}
