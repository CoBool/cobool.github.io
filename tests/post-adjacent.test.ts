import { describe, expect, it } from "vitest"
import { findAdjacentPosts } from "../src/lib/post-collections"
import { readPostsFromDirectory } from "../src/lib/posts"
import {
  createPostDirectory,
  installPostFixtureCleanup,
  validFrontmatter,
  writePost,
} from "./post-fixtures"

installPostFixtureCleanup()

async function createAdjacentFixtureDirectory(): Promise<string> {
  const directory = await createPostDirectory()

  writePost({
    directory,
    slug: "oldest-post",
    frontmatter: validFrontmatter({ title: "Oldest Post", date: "2026-01-01" }),
  })
  writePost({
    directory,
    slug: "pinned-post",
    frontmatter: validFrontmatter({ title: "Pinned Post", date: "2026-02-01", pinned: true }),
  })
  writePost({
    directory,
    slug: "newest-post",
    frontmatter: validFrontmatter({ title: "Newest Post", date: "2026-03-01" }),
  })

  return directory
}

describe("adjacent post navigation", () => {
  it("Given a pinned post When finding its neighbors Then follows date order instead of pinned-first order", async () => {
    const directory = await createAdjacentFixtureDirectory()
    const posts = readPostsFromDirectory(directory)

    // 컬렉션 자체는 고정 글 우선으로 정렬된다는 전제를 명시한다.
    expect(posts.map((post) => post.slug)).toEqual(["pinned-post", "newest-post", "oldest-post"])

    const adjacent = findAdjacentPosts(posts, "pinned-post")

    expect(adjacent.previous?.slug).toBe("newest-post")
    expect(adjacent.next?.slug).toBe("oldest-post")
  })

  it("Given the newest post When finding its neighbors Then exposes no newer post", async () => {
    const directory = await createAdjacentFixtureDirectory()
    const posts = readPostsFromDirectory(directory)
    const adjacent = findAdjacentPosts(posts, "newest-post")

    expect(adjacent.previous).toBeUndefined()
    expect(adjacent.next?.slug).toBe("pinned-post")
  })

  it("Given the oldest post When finding its neighbors Then exposes no older post", async () => {
    const directory = await createAdjacentFixtureDirectory()
    const posts = readPostsFromDirectory(directory)
    const adjacent = findAdjacentPosts(posts, "oldest-post")

    expect(adjacent.previous?.slug).toBe("pinned-post")
    expect(adjacent.next).toBeUndefined()
  })

  it("Given an unknown slug When finding its neighbors Then exposes no neighbors", async () => {
    const directory = await createAdjacentFixtureDirectory()
    const posts = readPostsFromDirectory(directory)
    const adjacent = findAdjacentPosts(posts, "missing-post")

    expect(adjacent.previous).toBeUndefined()
    expect(adjacent.next).toBeUndefined()
  })
})
