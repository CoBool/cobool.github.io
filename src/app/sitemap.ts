import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/config/site"
import { getAllCategories, getAllPosts, getAllTags, getPostPageNumbers } from "@/lib/posts"

export const dynamic = "force-static"

// biome-ignore lint/style/noDefaultExport: Next.js metadata files require default exports.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/posts/", "/categories/", "/tags/", "/about/"].map(createSitemapEntry)
  const paginatedRoutes = getPostPageNumbers()
    .filter((page) => page > 1)
    .map((page) => createSitemapEntry(`/posts/page/${page}/`))
  const postRoutes = getAllPosts().map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}/`),
    lastModified: new Date(`${post.date}T00:00:00.000Z`),
  }))
  const categoryRoutes = getAllCategories().map((category) =>
    createSitemapEntry(`/categories/${encodeURIComponent(category)}/`),
  )
  const tagRoutes = getAllTags().map((tag) =>
    createSitemapEntry(`/tags/${encodeURIComponent(tag)}/`),
  )

  return [...staticRoutes, ...paginatedRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
}

function createSitemapEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
  }
}
