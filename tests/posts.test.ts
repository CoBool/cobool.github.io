import { mkdirSync, writeFileSync } from "node:fs"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  getAllPosts,
  getLatestPosts,
  getPostBySlug,
  getPostSlugs,
  readPostsFromDirectory,
} from "../src/lib/posts"

type MarkdownFixture = {
  readonly directory: string
  readonly slug: string
  readonly frontmatter: string
  readonly body?: string
}

describe("markdown post pipeline", () => {
  it("Given sample content When reading all posts Then ships twenty published Markdown posts", () => {
    const posts = getAllPosts()

    expect(posts).toHaveLength(20)
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
      readingTime: "1 min read",
      tags: ["alpha", "zeta"],
      category: "notes",
    })
  })

  it("Given invalid frontmatter When reading posts Then throws a typed content error", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "missing-pinned",
      frontmatter: `title: "Missing Pinned"
description: "Required pinned is absent."
date: "2026-06-28"
tags: ["content"]
category: "notes"
draft: false`,
    })

    expect(() => readPostsFromDirectory(directory)).toThrow(/Invalid post frontmatter/)
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
})

async function createPostDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "true-log-posts-"))
  mkdirSync(directory, { recursive: true })

  return directory
}

function writePost(fixture: MarkdownFixture): void {
  writeFileSync(
    join(fixture.directory, `${fixture.slug}.md`),
    `---
${fixture.frontmatter}
---

${fixture.body ?? "Sample markdown body."}
`,
  )
}

function validFrontmatter(
  overrides: Partial<Record<FrontmatterKey, string | boolean | readonly string[]>>,
): string {
  const frontmatter = {
    title: "Sample Post",
    description: "A valid sample post.",
    date: "2026-06-28",
    tags: ["content"],
    category: "notes",
    draft: false,
    pinned: false,
    ...overrides,
  }

  return [
    `title: ${JSON.stringify(frontmatter.title)}`,
    `description: ${JSON.stringify(frontmatter.description)}`,
    `date: ${JSON.stringify(frontmatter.date)}`,
    `tags: ${JSON.stringify(frontmatter.tags)}`,
    `category: ${JSON.stringify(frontmatter.category)}`,
    `draft: ${JSON.stringify(frontmatter.draft)}`,
    `pinned: ${JSON.stringify(frontmatter.pinned)}`,
  ].join("\n")
}

type FrontmatterKey = "title" | "description" | "date" | "tags" | "category" | "draft" | "pinned"
