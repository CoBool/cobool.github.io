import type { Post } from "./posts"

export const POSTS_PER_PAGE = 6

export type PaginatedPosts = Readonly<{
  page: number
  totalPages: number
  posts: readonly Post[]
}>

export type TaxonomyItem = Readonly<{
  name: string
  count: number
}>

export function paginatePosts(
  posts: readonly Post[],
  page: number,
  perPage: number = POSTS_PER_PAGE,
): PaginatedPosts | undefined {
  if (!Number.isInteger(page) || page < 1) {
    return undefined
  }

  const totalPages = Math.ceil(posts.length / perPage)

  if (totalPages === 0 || page > totalPages) {
    return undefined
  }

  const start = (page - 1) * perPage

  return {
    page,
    totalPages,
    posts: posts.slice(start, start + perPage),
  }
}

export function getPageNumbers(posts: readonly Post[]): readonly number[] {
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  return Array.from({ length: totalPages }, (_, index) => index + 1)
}

export function getTaxonomyIndex(values: readonly string[]): readonly TaxonomyItem[] {
  const counts = new Map<string, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
}
