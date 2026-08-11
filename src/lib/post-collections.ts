import type { Post } from "@/lib/posts"

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
  perPage: number,
): PaginatedPosts | undefined {
  if (!Number.isInteger(page) || page < 1) {
    return undefined
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / perPage))

  if (page > totalPages) {
    return undefined
  }

  const start = (page - 1) * perPage

  return {
    page,
    totalPages,
    posts: posts.slice(start, start + perPage),
  }
}

export function getPageNumbers(posts: readonly Post[], perPage: number): readonly number[] {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage))

  return Array.from({ length: totalPages }, (_, index) => index + 1)
}

export type AdjacentPosts = Readonly<{
  previous: Post | undefined
  next: Post | undefined
}>

// 고정 글 우선 정렬을 그대로 쓰면 고정 글의 이웃이 시간순과 어긋나므로 날짜순으로 다시 정렬한다.
export function findAdjacentPosts(posts: readonly Post[], slug: string): AdjacentPosts {
  const postsByDate = [...posts].sort(
    (left, right) => right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug),
  )
  const index = postsByDate.findIndex((post) => post.slug === slug)

  if (index === -1) {
    return { previous: undefined, next: undefined }
  }

  return { previous: postsByDate[index - 1], next: postsByDate[index + 1] }
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
