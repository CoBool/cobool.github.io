import { notFound } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { getPostsByTag, getTagIndex } from "@/lib/posts"
import { ThemeModeControls } from "../../theme-mode-controls"

type TagPageProps = Readonly<{
  params: Promise<{
    tag: string
  }>
}>

export const dynamicParams = false

export function generateStaticParams() {
  return getTagIndex().map((tag) => ({ tag: tag.name }))
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const tagName = decodeURIComponent(tag)
  const posts = getPostsByTag(tagName)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <main className="min-h-[100dvh] bg-background px-6 py-8 text-foreground lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col gap-12 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <a
            className="text-xs font-semibold uppercase leading-[1.4] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/tags/"
          >
            태그로
          </a>
          <ThemeModeControls />
        </div>

        <section aria-labelledby="tag-title">
          <p className="font-mono text-xs font-semibold uppercase leading-[1.4] text-muted-foreground">
            Tag
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]"
            id="tag-title"
          >
            {tagName}
          </h1>
          <p className="mt-4 text-base leading-[1.65] text-muted-foreground sm:text-lg">
            {posts.length}개 글
          </p>

          <ol className="mt-8 grid gap-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>
      </section>
    </main>
  )
}
