import { absoluteUrl, siteConfig } from "@/config/site"
import type { Post } from "@/lib/posts"

const RSS_POST_LIMIT = 20

export function buildRssFeed(posts: readonly Post[]): string {
  const items = [...posts]
    .filter((post) => post.draft === false)
    .sort(
      (left, right) => right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug),
    )
    .slice(0, RSS_POST_LIMIT)
    .map(formatRssItem)
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${escapeXml(siteConfig.language)}</language>
    <atom:link href="${escapeXml(absoluteUrl(siteConfig.rssPath))}" rel="self" type="application/rss+xml" />
${items}
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
      <pubDate>${new Date(`${post.date}T00:00:00.000Z`).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
