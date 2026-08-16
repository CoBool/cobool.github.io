import { absoluteUrl, siteConfig } from "@/config/site"
import type { Post } from "@/lib/posts"

const RSS_POST_LIMIT = 20

export function buildRssFeed(posts: readonly Post[]): string {
  const publishedPosts = [...posts]
    .filter((post) => post.draft === false)
    .sort(
      (left, right) => right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug),
    )
  const items = publishedPosts.slice(0, RSS_POST_LIMIT).map(formatRssItem).join("\n")
  const newestPost = publishedPosts[0]
  // 빌드 시각 대신 최신 글 날짜를 써서 콘텐츠가 같으면 피드도 그대로다.
  const lastBuildDate =
    newestPost === undefined
      ? ""
      : `    <lastBuildDate>${toRssDate(newestPost.date)}</lastBuildDate>\n`

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${escapeXml(siteConfig.language)}</language>
    <atom:link href="${escapeXml(absoluteUrl(siteConfig.rssPath))}" rel="self" type="application/rss+xml" />
${lastBuildDate}${items}
  </channel>
</rss>
`
}

function formatRssItem(post: Post): string {
  const url = absoluteUrl(`/posts/${post.slug}/`)

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRssDate(post.date)}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`
}

// 발행 게이트(lib/posts)가 Asia/Seoul 달력 기준이므로 pubDate 도 같은 기준의 자정으로
// 직렬화한다. UTC 자정을 쓰면 실제 발행 시점보다 9시간 이른 인스턴트가 나간다.
// siteConfig.timeZone 을 바꾸면 이 오프셋도 함께 맞춰야 한다.
const SITE_UTC_OFFSET = "+09:00"

function toRssDate(date: string): string {
  return new Date(`${date}T00:00:00${SITE_UTC_OFFSET}`).toUTCString()
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
