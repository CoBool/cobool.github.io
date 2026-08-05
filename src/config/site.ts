const SITE_URL_ENV = "NEXT_PUBLIC_SITE_URL"
const FALLBACK_SITE_URL = "http://localhost:3000"

// biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"]?.trim() || FALLBACK_SITE_URL

// 도메인이 정해지기 전까지 미설정은 정상 상태다. 조용히 배포되는 것만 막는다.
// siteConfig 는 클라이언트 컴포넌트도 import 하므로 브라우저에서는 조용해야 한다.
if (
  siteUrl === FALLBACK_SITE_URL &&
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    `[site] ${SITE_URL_ENV} is not set; absolute URLs fall back to ${FALLBACK_SITE_URL}.`,
  )
}

export const siteConfig = {
  name: "True Log",
  description: "Markdown 글을 정적 페이지로 빌드하는 한국어 중심 기술 블로그입니다.",
  url: siteUrl,
  language: "ko",
  locale: "ko_KR",
  timeZone: "Asia/Seoul",
  postsPerPage: 6,
  defaultOgImage: "/og-default.png",
  rssPath: "/rss.xml",
  toc: {
    enabled: true,
    minHeadings: 3,
  },
  author: {
    name: "True Log",
    email: "hello@example.com",
    github: "https://github.com/example",
    avatar: "/avatar.png",
  },
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString()
}

// 브라우저 크롬(탭 배경, PWA 스플래시)에 쓰는 색. 웹 매니페스트와 viewport 메타 태그는 CSS 변수를
// 읽을 수 없어 값을 여기 hex 로 복제해 둔다. globals.css 의 --background 라이트/다크 값과 일치해야 한다.
export const themeColors = {
  light: "#ffffff",
  dark: "#171717",
} as const
