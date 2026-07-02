import { getAllCategories, getAllPosts, getAllTags } from "./posts"

export function createBreadcrumbLabelMap(): Readonly<Record<string, string>> {
  const labels: Record<string, string> = {}

  for (const post of getAllPosts()) {
    labels[`/posts/${post.slug}`] = post.title
  }

  for (const category of getAllCategories()) {
    labels[`/categories/${encodeURIComponent(category)}`] = category
  }

  for (const tag of getAllTags()) {
    labels[`/tags/${encodeURIComponent(tag)}`] = tag
  }

  return labels
}
