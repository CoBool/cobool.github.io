import { PostCard } from "@/components/post-card"
import { getLatestPosts } from "../lib/posts"
import { PLACEHOLDER_TEXT } from "./home-placeholder"
import { ThemeModeControls } from "./theme-mode-controls"

export default function HomePage() {
  const latestPosts = getLatestPosts(5)

  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <section
        className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col justify-between gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
        aria-labelledby="home-title"
      >
        <div className="flex flex-col gap-12">
          <div>
            <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
              True Log
            </p>
            <h1
              className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
              id="home-title"
            >
              {PLACEHOLDER_TEXT}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
              Markdown 파일로 관리되는 글을 정적 페이지로 빌드하고, 최신 글 5개를 홈에서 바로
              확인합니다.
            </p>
          </div>

          <section className="border-t border-border pt-8" aria-labelledby="latest-posts-title">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
                Posts
              </p>
              <h2
                className="text-2xl font-bold leading-tight text-foreground"
                id="latest-posts-title"
              >
                최근 글
              </h2>
            </div>

            <ol className="mt-6 grid gap-4">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ol>
          </section>
        </div>
        <ThemeModeControls />
      </section>
    </main>
  )
}
