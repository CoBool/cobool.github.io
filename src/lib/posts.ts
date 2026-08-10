import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs"
import { basename, join } from "node:path"
import { VFile } from "vfile"
import { matter } from "vfile-matter"
import { siteConfig } from "@/config/site"
import { extractPostExcerpt, PostContentError, parsePostFrontmatter } from "@/lib/markdown"
import type { AdjacentPosts, PaginatedPosts, TaxonomyItem } from "@/lib/post-collections"
import {
  findAdjacentPosts,
  getPageNumbers,
  getTaxonomyIndex as indexTaxonomyValues,
  paginatePosts,
} from "@/lib/post-collections"

export { PostContentError } from "@/lib/markdown"

const POSTS_DIRECTORY = join(process.cwd(), "content", "posts")
const MARKDOWN_EXTENSION = ".md"
const WORDS_PER_MINUTE = 200
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
let cachedPosts: readonly Post[] | undefined
let developmentCacheKey: string | undefined

export class PostNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`Post not found: ${slug}`)
    this.name = "PostNotFoundError"
  }
}

export class PostSlugError extends Error {
  constructor(readonly slug: string) {
    super(`Invalid post slug: ${slug}`)
    this.name = "PostSlugError"
  }
}

export class EmptyPostCollectionError extends Error {
  constructor(readonly directory: string) {
    super(`No publishable Markdown posts found in "${directory}"`)
    this.name = "EmptyPostCollectionError"
  }
}

export type Post = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly tags: readonly string[]
  readonly category: string
  readonly draft: boolean
  readonly ogImage?: string
  readonly pinned: boolean
  readonly toc: boolean
  readonly readingMinutes: number
  readonly excerpt: string
  readonly content: string
}

export function readPostsFromDirectory(directory: string = POSTS_DIRECTORY): readonly Post[] {
  mkdirSync(directory, { recursive: true })
  const currentDate = getCurrentDate()
  const posts = readdirSync(directory)
    .filter((fileName) => fileName.endsWith(MARKDOWN_EXTENSION))
    .map((fileName) => readPostFile(directory, fileName))
    .filter(
      (post) => shouldIncludeUnpublished() || (post.draft === false && post.date <= currentDate),
    )
    .sort(comparePosts)

  if (posts.length === 0) {
    throw new EmptyPostCollectionError(directory)
  }

  return Object.freeze(posts)
}

export function getAllPosts(): readonly Post[] {
  // content/*.md 는 모듈 그래프 밖이라 dev 에서 HMR 이 감지하지 못한다.
  // 매번 전체를 다시 파싱하는 대신 파일명+mtime 스냅샷이 달라졌을 때만 다시 읽는다.
  if (process.env.NODE_ENV === "development") {
    const cacheKey = readDirectorySnapshotKey(POSTS_DIRECTORY)

    if (cachedPosts === undefined || cacheKey !== developmentCacheKey) {
      cachedPosts = readPostsFromDirectory()
      developmentCacheKey = cacheKey
    }

    return cachedPosts
  }

  cachedPosts ??= readPostsFromDirectory()

  return cachedPosts
}

function readDirectorySnapshotKey(directory: string): string {
  mkdirSync(directory, { recursive: true })

  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith(MARKDOWN_EXTENSION))
    .map((fileName) => `${fileName}:${statSync(join(directory, fileName)).mtimeMs}`)
    .join("|")
}

export function getLatestPosts(limit = 5): readonly Post[] {
  return [...getAllPosts()].sort(comparePostsByDate).slice(0, limit)
}

export function getLatestPostsFromDirectory(
  directory: string = POSTS_DIRECTORY,
  limit = 5,
): readonly Post[] {
  return [...readPostsFromDirectory(directory)].sort(comparePostsByDate).slice(0, limit)
}

export function getPostBySlug(slug: string): Post {
  const post = findPostBySlug(slug)

  if (post === undefined) {
    throw new PostNotFoundError(slug)
  }

  return post
}

export function findPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((candidate) => candidate.slug === slug)
}

export function getAdjacentPosts(slug: string): AdjacentPosts {
  return findAdjacentPosts(getAllPosts(), slug)
}

export function getPostSlugs(): readonly string[] {
  return getAllPosts().map((post) => post.slug)
}

export function getPinnedPosts(limit = 3): readonly Post[] {
  return getAllPosts()
    .filter((post) => post.pinned)
    .slice(0, limit)
}

export function getPaginatedPosts(page: number): PaginatedPosts | undefined {
  return paginatePosts(getAllPosts(), page, siteConfig.postsPerPage)
}

export function getPostPageNumbers(): readonly number[] {
  return getPageNumbers(getAllPosts(), siteConfig.postsPerPage)
}

export function getAllTags(): readonly string[] {
  return uniqueSorted(getAllPosts().flatMap((post) => post.tags))
}

export function getAllCategories(): readonly string[] {
  return uniqueSorted(getAllPosts().map((post) => post.category))
}

export function getCategoryIndex(): readonly TaxonomyItem[] {
  return indexTaxonomyValues(getAllPosts().map((post) => post.category))
}

export function getTagIndex(): readonly TaxonomyItem[] {
  return indexTaxonomyValues(getAllPosts().flatMap((post) => post.tags))
}

export function getPostsByCategory(category: string): readonly Post[] {
  return getAllPosts().filter((post) => post.category === category)
}

export function getPostsByTag(tag: string): readonly Post[] {
  return getAllPosts().filter((post) => post.tags.includes(tag))
}

function readPostFile(directory: string, fileName: string): Post {
  const slug = basename(fileName, MARKDOWN_EXTENSION)

  if (!POST_SLUG_PATTERN.test(slug)) {
    throw new PostSlugError(slug)
  }

  const filePath = join(directory, fileName)
  const source = readFileSync(filePath, "utf8")
  const file = new VFile({ path: filePath, value: source })

  try {
    matter(file, { strip: true })
  } catch (cause) {
    if (cause instanceof Error) {
      throw new PostContentError(slug, filePath, cause)
    }

    throw cause
  }

  const content = String(file).trim()
  const { ogImage, ...frontmatterData } = parsePostFrontmatter({
    data: file.data.matter,
    slug,
    filePath,
  })
  const description =
    frontmatterData.description ?? extractPostExcerpt(content, frontmatterData.title)

  const post = {
    ...frontmatterData,
    description,
    slug,
    tags: [...new Set(frontmatterData.tags)].sort(),
    readingMinutes: countReadingMinutes(content),
    excerpt: description,
    content,
  } satisfies Omit<Post, "ogImage">

  const resolvedOgImage = resolveOgImage(ogImage)

  return freezePost(resolvedOgImage === undefined ? post : { ...post, ogImage: resolvedOgImage })
}

// 스키마는 경로 형태만 본다. public/ 에 파일이 실제로 있는지는 그 디렉터리를 아는 이쪽에서 확인한다.
function resolveOgImage(ogImage: string | undefined): string | undefined {
  if (ogImage === undefined) {
    return undefined
  }

  const filePath = join(process.cwd(), "public", ogImage.slice(1))

  return existsSync(filePath) && statSync(filePath).isFile() ? ogImage : siteConfig.defaultOgImage
}

function freezePost(post: Post): Post {
  return Object.freeze({
    ...post,
    tags: Object.freeze([...post.tags]),
  })
}

function shouldIncludeUnpublished(): boolean {
  return process.env.NODE_ENV === "development"
}

function getCurrentDate(): string {
  const parts = new Intl.DateTimeFormat("en", {
    calendar: "gregory",
    day: "2-digit",
    month: "2-digit",
    numberingSystem: "latn",
    timeZone: siteConfig.timeZone,
    year: "numeric",
  }).formatToParts(new Date())
  const year = parts.find((part) => part.type === "year")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""

  return `${year}-${month}-${day}`
}

function comparePosts(left: Post, right: Post): number {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug)
}

function comparePostsByDate(left: Post, right: Post): number {
  return right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug)
}

function countReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort()
}
