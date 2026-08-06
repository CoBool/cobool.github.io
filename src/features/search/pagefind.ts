export type SearchResult = Readonly<{
  url: string
  title: string
  excerpt: string
}>

type PagefindFragment = Readonly<{
  url: string
  excerpt: string
  meta?: Readonly<{ title?: string }>
}>

type PagefindApi = Readonly<{
  init: () => Promise<void>
  search: (
    query: string,
  ) => Promise<Readonly<{ results: readonly { data: () => Promise<PagefindFragment> }[] }>>
}>

const BUNDLE_URL = "/pagefind/pagefind.js"
const MAX_RESULTS = 20

let bundle: Promise<PagefindApi> | undefined

// 번들은 postbuild 단계에서 생기므로 개발 서버와 빌드 시점에는 존재하지 않는다.
// 정적 경로로 쓰면 번들러가 해석을 시도하다 실패하니 변수와 ignore 주석으로 남긴다.
async function loadPagefind(): Promise<PagefindApi> {
  const url = BUNDLE_URL
  const api = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ url
  )) as PagefindApi

  await api.init()

  return api
}

export async function searchPosts(query: string): Promise<readonly SearchResult[]> {
  const trimmed = query.trim()

  if (trimmed.length === 0) {
    return []
  }

  bundle ??= loadPagefind()
  const { results } = await (await bundle).search(trimmed)
  const fragments = await Promise.all(results.slice(0, MAX_RESULTS).map((result) => result.data()))

  return fragments.map((fragment) => ({
    url: fragment.url,
    title: fragment.meta?.title ?? fragment.url,
    excerpt: fragment.excerpt,
  }))
}
