import { MainBreadcrumbs } from "@/components/layout"
import { siteConfig } from "@/config/site"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "소개",
  description: "True Log가 기록하는 주제와 정적 블로그 운영 원칙을 소개합니다.",
  path: "/about/",
})

export default function AboutPage() {
  return (
    <>
      <MainBreadcrumbs pathname="/about/" />
      <section aria-labelledby="about-title">
        <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">About</p>
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
    </>
  )
}
