import { siteConfig } from "@/config/site"
import { createPageMetadata } from "@/lib/seo"
import { ThemeModeControls } from "../theme-mode-controls"

export const metadata = createPageMetadata({
  title: "소개",
  description: "True Log가 기록하는 주제와 정적 블로그 운영 원칙을 소개합니다.",
  path: "/about/",
})

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <a
            className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            홈으로
          </a>
          <ThemeModeControls />
        </div>

        <section aria-labelledby="about-title">
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            About
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="about-title"
          >
            {siteConfig.name} 소개
          </h1>
          <div className="mt-6 grid gap-5 text-base leading-[1.75] text-muted-foreground sm:text-lg">
            <p>
              {siteConfig.description} Markdown 콘텐츠가 정적 페이지와 RSS, 사이트맵으로 이어지는
              과정을 실제 운영 기준으로 점검합니다.
            </p>
            <p>
              글은 작은 구현 결정, 정적 export 제약, 접근성과 테마 같은 기본 품질을 중심으로
              정리합니다. 과장된 기능보다 빌드와 배포 후에도 유지되는 문서성을 우선합니다.
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
