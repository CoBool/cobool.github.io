import { MainFrame } from "@/components/layout"

// biome-ignore lint/style/noDefaultExport: Next.js App Router requires a default export for not-found pages.
export default function NotFoundPage() {
  return (
    <MainFrame>
      <section aria-labelledby="not-found-title" className="max-w-2xl">
        <p className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">404</p>
        <h1
          className="mt-4 text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
          id="not-found-title"
        >
          글을 찾을 수 없습니다
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-muted-foreground sm:text-lg">
          요청한 글이 아직 발행되지 않았거나 주소가 변경되었습니다. 최신 글 목록에서 다시
          확인해주세요.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium leading-[1.55] text-primary-foreground shadow-xs transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/posts/"
          >
            글 목록 보기
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium leading-[1.55] text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/"
          >
            홈으로 돌아가기
          </a>
        </div>
      </section>
    </MainFrame>
  )
}
