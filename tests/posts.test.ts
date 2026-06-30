import { describe, expect, it } from "vitest"
import {
  getAllPosts,
  getLatestPosts,
  getLatestPostsFromDirectory,
  getPostBySlug,
  getPostSlugs,
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
  it("Given sample content When reading all posts Then ships the seeded published Markdown posts", () => {
    const posts = getAllPosts()

    expect(posts.length).toBeGreaterThanOrEqual(20)
    expect(posts.every((post) => post.draft === false)).toBe(true)
    expect(getLatestPosts(5)).toHaveLength(5)
  })

  it("Given pinned and unpinned posts When reading a directory Then sorts pinned posts first and newest date inside each group", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "older-pinned",
      frontmatter: validFrontmatter({
        title: "Older Pinned",
        date: "2026-06-20",
        pinned: true,
      }),
    })
    writePost({
      directory,
      slug: "newer-unpinned",
      frontmatter: validFrontmatter({
        title: "Newer Unpinned",
        date: "2026-06-28",
        pinned: false,
      }),
    })
    writePost({
      directory,
      slug: "newer-pinned",
      frontmatter: validFrontmatter({
        title: "Newer Pinned",
        date: "2026-06-27",
        pinned: true,
      }),
    })

    const posts = readPostsFromDirectory(directory)

    expect(posts.map((post) => post.slug)).toEqual([
      "newer-pinned",
      "older-pinned",
      "newer-unpinned",
    ])
  })

  it("Given pinned older posts When reading latest posts Then returns newest posts by date only", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "older-pinned",
      frontmatter: validFrontmatter({
        title: "Older Pinned",
        date: "2026-06-20",
        pinned: true,
      }),
    })
    writePost({
      directory,
      slug: "newer-unpinned",
      frontmatter: validFrontmatter({
        title: "Newer Unpinned",
        date: "2026-06-28",
        pinned: false,
      }),
    })

    const latest = getLatestPostsFromDirectory(directory, 2)

    expect(latest.map((post) => post.slug)).toEqual(["newer-unpinned", "older-pinned"])
  })

  it("Given draft posts When reading a directory Then excludes them from public results", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "published",
      frontmatter: validFrontmatter({ title: "Published", draft: false }),
    })
    writePost({
      directory,
      slug: "draft",
      frontmatter: validFrontmatter({ title: "Draft", draft: true }),
    })

    expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual(["published"])
  })

  it("Given post metadata When reading a directory Then derives slug, excerpt, reading time, and taxonomy", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "metadata-contract",
      frontmatter: validFrontmatter({
        title: "Metadata Contract",
        description: "Description becomes the excerpt.",
        tags: ["zeta", "alpha"],
        category: "notes",
      }),
      body: "One two three.",
    })

    const post = readPostsFromDirectory(directory)[0]

    expect(post).toMatchObject({
      slug: "metadata-contract",
      title: "Metadata Contract",
      excerpt: "Description becomes the excerpt.",
      readingTime: "1분 읽기",
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
      tags: [],
      toc: true,
      draft: false,
      pinned: false,
    })
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

  it("Given optional description is absent and body is empty When reading a directory Then falls back to the title excerpt", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "empty-body",
      frontmatter: `title: "Empty Body"
date: "2026-06-28"
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

  it("Given a known content slug When reading one post Then returns its full markdown content", () => {
    const post = getPostBySlug("markdown-content-pipeline")

    expect(post.title).toBe("Markdown Content Pipeline")
    expect(post.content).toContain("frontmatter")
    expect(getPostSlugs()).toContain("markdown-content-pipeline")
  })

  it("Given an unknown content slug When reading one post Then throws a typed not found error", () => {
    expect(() => getPostBySlug("missing-post")).toThrow(PostNotFoundError)
  })
})
