import { existsSync, readdirSync, statSync, utimesSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it, vi } from "vitest"
import {
  getAllPosts,
  getPostBySlug,
  getRecentPosts,
  PostContentError,
  PostNotFoundError,
  PostSlugError,
  readPostsFromDirectory,
} from "../src/lib/posts"
import {
  createPostDirectory,
  installPostFixtureCleanup,
  validFrontmatter,
  writePost,
} from "./post-fixtures"

installPostFixtureCleanup()

describe("markdown post pipeline", () => {
  it("Given default content When reading all posts Then exposes only published posts", () => {
    const posts = getAllPosts()
    const recentPosts = getRecentPosts(5)

    expect(posts.every((post) => post.draft === false)).toBe(true)
    expect(recentPosts.length).toBeLessThanOrEqual(5)
    expect(recentPosts.every((post) => posts.includes(post))).toBe(true)
  })

  it("Given repeated default post reads When reading all posts Then returns the cached collection", () => {
    const firstRead = getAllPosts()
    const secondRead = getAllPosts()

    expect(secondRead).toBe(firstRead)
  })

  it("Given development When the content directory is unchanged Then reuses the cached collection", () => {
    vi.stubEnv("NODE_ENV", "development")

    try {
      expect(getAllPosts()).toBe(getAllPosts())
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("Given development When a post file is touched Then re-reads the directory", () => {
    vi.stubEnv("NODE_ENV", "development")
    const directory = join(process.cwd(), "content", "posts")
    const fileName = readdirSync(directory).find((name) => name.endsWith(".md"))

    if (fileName === undefined) {
      expect.unreachable("Expected at least one content post")
    }

    const filePath = join(directory, fileName)
    const originalStats = statSync(filePath)

    try {
      const firstRead = getAllPosts()
      utimesSync(filePath, new Date(), new Date())

      expect(getAllPosts()).not.toBe(firstRead)
    } finally {
      utimesSync(filePath, originalStats.atime, originalStats.mtime)
      vi.unstubAllEnvs()
    }
  })

  it("Given latest default posts When reading them Then reuses posts from the cached collection", () => {
    const posts = getAllPosts()
    const recentPosts = getRecentPosts(5)

    expect(recentPosts[0]).toBe(posts.find((post) => post.slug === recentPosts[0]?.slug))
  })

  it("Given a missing posts directory When reading it Then rejects an empty publishable collection", async () => {
    const parentDirectory = await createPostDirectory()
    const missingDirectory = join(parentDirectory, "nested", "posts")

    expect(() => readPostsFromDirectory(missingDirectory)).toThrow(
      `No publishable Markdown posts found in "${missingDirectory}"`,
    )
    expect(existsSync(missingDirectory)).toBe(true)
  })

  it("Given default posts When returned values are inspected Then exposes immutable runtime snapshots", () => {
    const posts = getAllPosts()
    const firstPost = posts[0]

    expect(Object.isFrozen(posts)).toBe(true)

    if (firstPost === undefined) {
      return
    }

    expect(Object.isFrozen(firstPost)).toBe(true)
    expect(Object.isFrozen(firstPost.tags)).toBe(true)
    expect(Reflect.set(posts, "0", undefined)).toBe(false)
    expect(Reflect.set(firstPost, "title", "Mutated title")).toBe(false)
    expect(Reflect.set(firstPost.tags, "0", "mutated-tag")).toBe(false)
  })

  it("Given post metadata When reading a directory Then derives slug, excerpt, reading time, and taxonomy", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "metadata-contract",
      frontmatter: validFrontmatter({
        title: "Metadata Contract",
        description: "Description becomes the excerpt.",
        tags: ["zeta", "alpha", "alpha"],
        category: "notes",
      }),
      body: "One two three.",
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post).toMatchObject({
      slug: "metadata-contract",
      title: "Metadata Contract",
      excerpt: "Description becomes the excerpt.",
      readingMinutes: 1,
      tags: ["alpha", "zeta"],
      category: "notes",
    })
  })

  it("Given optional metadata is absent When reading a directory Then applies defaults and derives the excerpt from body", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "minimal-contract",
      frontmatter: `title: "Minimal Contract"
date: "2026-06-28"
tags: ["content"]
category: "notes"`,
      body: `첫 문장에서 설명을 가져옵니다. 두 번째 문장은 목록 설명에 포함되지 않습니다.

## 다음 섹션

본문은 그대로 유지됩니다.`,
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post).toMatchObject({
      slug: "minimal-contract",
      description: "첫 문장에서 설명을 가져옵니다.",
      excerpt: "첫 문장에서 설명을 가져옵니다.",
      tags: ["content"],
      toc: true,
      draft: false,
      pinned: false,
    })
  })

  it("Given a tag with a route-breaking character When reading posts Then rejects the post contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "unsafe-tag",
      frontmatter: validFrontmatter({ title: "Unsafe Tag", tags: ["CI/CD"] }),
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given a category with a route-breaking character When reading posts Then rejects the post contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "unsafe-category",
      frontmatter: validFrontmatter({ title: "Unsafe Category", category: "dev%notes" }),
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given tags are empty When reading posts Then rejects the post contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "missing-tags",
      frontmatter: `title: "Missing Tags"
date: "2026-06-28"
tags: []
category: "notes"`,
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given inline math in the body When deriving a description Then excludes the equation", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "inline-math-excerpt",
      frontmatter: `title: "Inline Math Excerpt"
date: "2026-06-28"
tags: ["content"]
category: "notes"`,
      body: "오일러 공식은 $e^{i\\pi} + 1 = 0$ 복소수의 관계를 보여줍니다.",
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post?.description).toBe("오일러 공식은 복소수의 관계를 보여줍니다.")
    expect(post?.excerpt).not.toContain("e^{i\\pi}")
  })

  it("Given a display equation before prose When deriving a description Then uses the first text sentence", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "display-math-excerpt",
      frontmatter: `title: "Display Math Excerpt"
date: "2026-06-28"
tags: ["content"]
category: "notes"`,
      body: `$$
e^{i\\pi} + 1 = 0
$$

복소수와 지수 함수의 관계를 보여줍니다. 다음 문장입니다.`,
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post?.description).toBe("복소수와 지수 함수의 관계를 보여줍니다.")
  })

  it("Given frontmatter disables TOC When reading a directory Then exposes the disabled TOC contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "toc-disabled",
      frontmatter: `${validFrontmatter({ title: "TOC Disabled" })}
toc: false`,
    })

    const posts = readPostsFromDirectory(directory)

    expect(posts).toHaveLength(1)
    expect(posts[0]?.toc).toBe(false)
  })

  it("Given currency dollars are escaped When deriving a description Then preserves dollar notation", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "currency-excerpt",
      frontmatter: `title: "Currency Excerpt"
date: "2026-06-28"
tags: ["content"]
category: "notes"`,
      body: "It costs \\$5 and \\$10 today.",
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post?.description).toBe("It costs $5 and $10 today.")
  })

  it("Given malformed TOC frontmatter When reading posts Then rejects the post contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "malformed-toc",
      frontmatter: `${validFrontmatter({ title: "Malformed TOC" })}
toc: "sometimes"`,
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given malformed YAML When reading posts Then reports the post slug and file path", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "broken-yaml",
      frontmatter: "title: [broken",
    })

    try {
      readPostsFromDirectory(directory)
      expect.unreachable("Expected malformed YAML to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(PostContentError)
      expect(error).toMatchObject({
        filePath: join(directory, "broken-yaml.md"),
        slug: "broken-yaml",
      })
      expect(error).toHaveProperty("cause")
    }
  })

  it("Given optional description is absent and body is empty When reading a directory Then falls back to the title excerpt", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "empty-body",
      frontmatter: `title: "Empty Body"
date: "2026-06-28"
tags: ["content"]
category: "notes"`,
      body: "",
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post).toMatchObject({
      description: "Empty Body",
      excerpt: "Empty Body",
    })
  })

  it("Given missing required category When reading posts Then throws a typed content error", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "missing-category",
      frontmatter: `title: "Missing Category"
date: "2026-06-28"`,
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given a non-canonical filename When reading posts Then rejects the slug before exposing routes", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "unsafe_slug",
      frontmatter: validFrontmatter({ title: "Unsafe Slug" }),
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(PostSlugError)
  })

  it("Given unknown frontmatter keys When reading posts Then rejects the post contract", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "unknown-key",
      frontmatter: `${validFrontmatter({ title: "Unknown Key" })}
layout: "post"`,
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
  })

  it("Given an unknown content slug When reading one post Then throws a typed not found error", () => {
    expect(() => getPostBySlug("missing-post")).toThrow(PostNotFoundError)
  })
})
