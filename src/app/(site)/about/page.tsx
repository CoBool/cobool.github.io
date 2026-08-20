import { MainBreadcrumbs } from "@/components/layout"
import { PageTitle } from "@/components/typography"
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
        <PageTitle className="max-w-3xl" id="about-title">
          {siteConfig.name} 소개
        </PageTitle>
        <div className="mt-6 grid gap-5 text-base leading-[1.75] text-muted-foreground sm:text-lg">
          <p>
            3~4년간 프론트엔드 개발을 해왔습니다. 웹에이전시에서 그누보드를 커스터마이징해
            홈페이지를 만드는 일로 시작해, 이후 여러 이러닝 회사를 거치며 외부 LMS에 들어가는
            콘텐츠를 만들었습니다. 학습 슬라이드의 재생·배속·탐색 컨트롤바를 여러 프로젝트에서
            반복해 구현했고, 캔버스 드로잉 기능과 태블릿 학습기기에 들어가는 웹 콘텐츠도
            만들었습니다. 이 시기에 Vue 2 초기 버전으로 컴포넌트 기반 개발을 처음 접했습니다.
          </p>
          <p>
            돌아보면 새로운 기술에 뛰어들기보다 익숙한 도구로 요구사항을 맞추는 데 머물렀던 시간이
            길었습니다. React는 초기 버전부터 관심이 있었지만 어렵게 느껴져 미뤄뒀는데, 지금은 그
            공백을 채우려 React, Next.js를 다시 익히고 최근에는 Svelte에도 관심을 두고 있습니다.{" "}
            {siteConfig.name}는 그 과정에서 마주친 구현 결정과 시행착오를 기록하는 공간이고, 이
            사이트 자체도 Markdown 콘텐츠가 정적 페이지와 RSS, 사이트맵으로 이어지는 과정을 직접
            만들어보며 실제 운영 기준으로 점검한 결과물입니다.
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
