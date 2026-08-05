import { getAllPosts } from "@/lib/posts"
import { buildRssFeed } from "@/lib/rss"

export const dynamic = "force-static"

export function GET(): Response {
  return new Response(buildRssFeed(getAllPosts()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
