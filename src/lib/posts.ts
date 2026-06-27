import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"

const POSTS_DIRECTORY = join(process.cwd(), "content", "posts")
const MARKDOWN_EXTENSION = ".md"
const WORDS_PER_MINUTE = 200

const PostFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    date: z.string().date(),
    tags: z.array(z.string().trim().min(1)).min(1),
    category: z.string().trim().min(1),
    draft: z.boolean(),
    pinned: z.boolean(),
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
  return getAllPosts().slice(0, limit)
}

export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find((candidate) => candidate.slug === slug)

  if (post === undefined) {
    throw new Error(`Post not found: ${slug}`)
  }

  return post
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
  const source = readFileSync(join(directory, fileName), "utf8")
  const parsed = matter(source)
  const frontmatter = PostFrontmatterSchema.safeParse(parsed.data)

  if (!frontmatter.success) {
    throw new PostContentError(slug, frontmatter.error)
  }

  return {
    ...frontmatter.data,
    slug,
    tags: [...frontmatter.data.tags].sort(),
    readingTime: formatReadingTime(parsed.content),
    excerpt: frontmatter.data.description,
    content: parsed.content.trim(),
  }
}

function comparePosts(left: Post, right: Post): number {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.date.localeCompare(left.date)
}

function formatReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes} min read`
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort()
}
