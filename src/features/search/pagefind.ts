import { prefixBasePath } from "@/lib/base-path"

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

const DEFAULT_BUNDLE_PATH = "/pagefind/pagefind.js"
const MAX_RESULTS = 20

let bundle: Promise<PagefindApi> | undefined

/**
 * GitHub Pages 서브디렉터리(e.g., /repo/) 배포 환경을 지원하기 위해
 * 환경변수 NEXT_PUBLIC_BASE_PATH 가 지정된 경우 접두사로 조합한다.
 */
export function getPagefindBundleUrl(): string {
  return prefixBasePath(DEFAULT_BUNDLE_PATH)
}

// 번들은 postbuild 단계에서 생기므로 개발 서버와 빌드 시점에는 존재하지 않는다.
// 정적 경로로 쓰면 번들러가 해석을 시도하다 실패하니 변수와 ignore 주석으로 남긴다.
async function loadPagefind(): Promise<PagefindApi> {
  const url = getPagefindBundleUrl()
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

  if (bundle === undefined) {
    bundle = loadPagefind().catch((error) => {
      // 1회 로드 실패(Reject) 시 모듈 레벨 캐시를 리셋하여 후속 검색 요청이 영구 실패하지 않고 재시도할 수 있게 한다.
      bundle = undefined
      throw error
    })
  }

  const api = await bundle
  const { results } = await api.search(trimmed)
  const fragments = await Promise.all(results.slice(0, MAX_RESULTS).map((result) => result.data()))

  return fragments.map((fragment) => ({
    url: fragment.url,
    title: fragment.meta?.title ?? fragment.url,
    excerpt: fragment.excerpt,
  }))
}

/** 테스트 격리 및 번들 캐시 리셋 전용 함수 */
export function _resetPagefindBundleCacheForTesting(): void {
  bundle = undefined
}
