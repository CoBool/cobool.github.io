// NEXT_PUBLIC_BASE_PATH 환경변수를 읽어 정규화된 basePath 를 반환한다.
// 이 로직이 manifest.ts, markdown-content.tsx, pagefind.ts, pwa-register.tsx 에
// 각각 복제되어 있던 것을 단일 모듈로 통합한다.
//
// 이 유틸리티는 경로 합성만 담당한다. 배포 지원 범위는 config/deployment.ts 가
// 검증하며, 현재 전체 사이트는 origin 루트 배포만 지원한다.

/**
 * `NEXT_PUBLIC_BASE_PATH` 를 읽어 선행 슬래시를 보장하고 후행 슬래시를 제거한 경로를 반환한다.
 * 미설정이거나 `"/"` 이면 빈 문자열을 반환한다.
 */
export function getBasePath(): string {
  // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
  const raw = process.env["NEXT_PUBLIC_BASE_PATH"]?.trim()

  if (!raw || raw === "/") {
    return ""
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`

  return withLeadingSlash.replace(/\/+$/, "")
}

/**
 * 정규화된 basePath 를 주어진 절대 경로 앞에 붙인다.
 * `path` 는 `"/"` 로 시작해야 한다.
 *
 * @example
 * // NEXT_PUBLIC_BASE_PATH="/repo"
 * prefixBasePath("/pagefind/pagefind.js") // → "/repo/pagefind/pagefind.js"
 *
 * @example
 * // NEXT_PUBLIC_BASE_PATH 미설정
 * prefixBasePath("/sw.js") // → "/sw.js"
 */
export function prefixBasePath(path: string): string {
  return `${getBasePath()}${path}`
}
