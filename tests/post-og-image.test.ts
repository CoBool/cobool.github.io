import { statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { siteConfig } from "../src/config/site"
import { PostContentError, PostNotFoundError, readPostsFromDirectory } from "../src/lib/posts"
import { createPostMetadata } from "../src/lib/seo"
import {
  createPostDirectory,
  installPostFixtureCleanup,
  validFrontmatter,
  writePost,
} from "./post-fixtures"

installPostFixtureCleanup()

describe("post OG image policy", () => {
  it("Given a missing local OG image When reading a post Then falls back to the site default", async () => {
    const post = await readPostWithOgImage("/images/missing-og-image.png")

    expect(post.ogImage).toBe(siteConfig.defaultOgImage)
  })

  it("Given an existing local OG image When reading a post Then keeps the configured path", async () => {
    const post = await readPostWithOgImage("/avatar.png")

    expect(post.ogImage).toBe("/avatar.png")
  })

  it("Given an OG image path to a directory When reading a post Then falls back to the site default", async () => {
    const post = await readPostWithOgImage("/")

    expect(post.ogImage).toBe(siteConfig.defaultOgImage)
  })

  it("Given a remote OG image When reading a post Then rejects the frontmatter", async () => {
    await expectInvalidOgImage("https://images.example.com/preview.png")
  })

  it("Given an OG image path with traversal When reading a post Then rejects the frontmatter", async () => {
    await expectInvalidOgImage("/../outside.png")
  })

  it("Given an encoded OG image traversal When reading a post Then rejects the frontmatter", async () => {
    await expectInvalidOgImage("/images/%2e%2e/outside.png")
  })

  it("Given an SVG OG image When reading a post Then rejects the frontmatter", async () => {
    await expectInvalidOgImage("/images/thumbnail.svg")
  })

  it("Given the configured fallback When checking repository assets Then its public file exists", () => {
    expect(statSync(`public${siteConfig.defaultOgImage}`).isFile()).toBe(true)
  })

  it("Given a missing local OG image When creating metadata Then emits the absolute fallback URL", async () => {
    const post = await readPostWithOgImage("/images/missing-og-image.png")
    const metadata = createPostMetadata(post)

    expect(metadata.openGraph?.images).toEqual([`${siteConfig.url}${siteConfig.defaultOgImage}`])
    expect(metadata.twitter?.images).toEqual([`${siteConfig.url}${siteConfig.defaultOgImage}`])
  })
})

async function readPostWithOgImage(ogImage: string) {
  const directory = await createPostDirectory()
  writePost({
    directory,
    slug: "og-image-policy",
    frontmatter: `${validFrontmatter({ title: "OG Image Policy" })}
ogImage: ${JSON.stringify(ogImage)}`,
  })

  const post = readPostsFromDirectory(directory)[0]

  if (post === undefined) {
    throw new PostNotFoundError("og-image-policy")
  }

  return post
}

async function expectInvalidOgImage(ogImage: string): Promise<void> {
  const directory = await createPostDirectory()
  writePost({
    directory,
    slug: "invalid-og-image",
    frontmatter: `${validFrontmatter({ title: "Invalid OG Image" })}
ogImage: ${JSON.stringify(ogImage)}`,
  })

  try {
    readPostsFromDirectory(directory)
    expect.unreachable("Expected invalid OG image frontmatter to throw")
  } catch (error) {
    if (!(error instanceof PostContentError)) {
      throw error
    }

    expect(error).toMatchObject({
      slug: "invalid-og-image",
      filePath: join(directory, "invalid-og-image.md"),
    })
    expect(error).toHaveProperty("message", expect.stringContaining("ogImage"))
  }
}
