export const siteConfig = {
  name: "True Log",
  description: "Markdown 글을 정적 페이지로 빌드하는 한국어 중심 기술 블로그입니다.",
  url: "https://example.com",
  language: "ko",
  locale: "ko_KR",
  defaultOgImage: "/og-default.svg",
  rssPath: "/rss.xml",
  toc: {
    enabled: true,
    minHeadings: 3,
  },
  author: {
    name: "True Log",
    email: "hello@example.com",
    github: "https://github.com/example",
    avatar: "/avatar.jpg",
  },
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString()
}
