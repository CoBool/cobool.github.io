import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { VFile } from "vfile"
import { matter } from "vfile-matter"
import { z } from "zod"

const POSTS_DIRECTORY = join(process.cwd(), "content", "posts")
const MARKDOWN_EXTENSION = ".md"
const WORDS_PER_MINUTE = 200
const EXCERPT_MAX_LENGTH = 150
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const PostFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    date: z.string().date(),
    tags: z.array(z.string().trim().min(1)).default([]),
    category: z.string().trim().min(1),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
  })
  .strict()

export class PostContentError extends Error {
  constructor(
    readonly slug: string,
    cause: z.ZodError,
  ) {
    super(`Invalid post frontmatter for "${slug}": ${z.prettifyError(cause)}`)
    this.name = "PostContentError"
    this.cause = cause
  }
}

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

export type Post = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly tags: readonly string[]
  readonly category: string
  readonly draft: boolean
  readonly pinned: boolean
  readonly readingTime: string
  readonly excerpt: string
  readonly content: string
}

export function readPostsFromDirectory(directory: string = POSTS_DIRECTORY): readonly Post[] {
  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith(MARKDOWN_EXTENSION))
    .map((fileName) => readPostFile(directory, fileName))
    .filter((post) => post.draft === false)
    .sort(comparePosts)
}

export function getAllPosts(): readonly Post[] {
  return readPostsFromDirectory()
}

export function getLatestPosts(limit = 5): readonly Post[] {
  return getLatestPostsFromDirectory(POSTS_DIRECTORY, limit)
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

export function getPostSlugs(): readonly string[] {
  return getAllPosts().map((post) => post.slug)
}

export function getAllTags(): readonly string[] {
  return uniqueSorted(getAllPosts().flatMap((post) => post.tags))
}

export function getAllCategories(): readonly string[] {
  return uniqueSorted(getAllPosts().map((post) => post.category))
}

function readPostFile(directory: string, fileName: string): Post {
  const slug = basename(fileName, MARKDOWN_EXTENSION)

  if (!POST_SLUG_PATTERN.test(slug)) {
    throw new PostSlugError(slug)
  }

  const source = readFileSync(join(directory, fileName), "utf8")
  const file = new VFile({ path: join(directory, fileName), value: source })
  matter(file, { strip: true })

  const content = String(file).trim()
  const frontmatter = PostFrontmatterSchema.safeParse(file.data.matter)

  if (!frontmatter.success) {
    throw new PostContentError(slug, frontmatter.error)
  }

  const description =
    frontmatter.data.description ?? extractExcerpt(content, frontmatter.data.title)

  return {
    ...frontmatter.data,
    description,
    slug,
    tags: [...frontmatter.data.tags].sort(),
    readingTime: formatReadingTime(content),
    excerpt: description,
    content,
  }
}

function comparePosts(left: Post, right: Post): number {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.date.localeCompare(left.date)
}

function comparePostsByDate(left: Post, right: Post): number {
  return right.date.localeCompare(left.date)
}

function formatReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes}분 읽기`
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort()
}

function extractExcerpt(content: string, fallback: string): string {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const firstSentence = plainText.match(/^[^.!?。！？\n]+[.!?。！？]?/)?.[0]?.trim()
  const candidate =
    firstSentence && firstSentence.length > 0 ? firstSentence : plainText || fallback

  if (candidate.length <= EXCERPT_MAX_LENGTH) {
    return candidate
  }

  return `${candidate.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}...`
}
