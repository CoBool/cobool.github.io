import { describe, expect, it, vi } from "vitest"
import { getLatestPostsFromDirectory, readPostsFromDirectory } from "../src/lib/posts"
import {
  createPostDirectory,
  installPostFixtureCleanup,
  validFrontmatter,
  writePost,
} from "./post-fixtures"

installPostFixtureCleanup()

describe("post publication policy", () => {
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

  it("Given posts with equal pinned state and date When reading a directory Then sorts by slug", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "zeta-post",
      frontmatter: validFrontmatter({ title: "Zeta", date: "2026-06-28" }),
    })
    writePost({
      directory,
      slug: "alpha-post",
      frontmatter: validFrontmatter({ title: "Alpha", date: "2026-06-28" }),
    })

    const posts = readPostsFromDirectory(directory)

    expect(posts.map((post) => post.slug)).toEqual(["alpha-post", "zeta-post"])
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

  it("Given latest posts with equal dates When reading them Then sorts by slug", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "zeta-post",
      frontmatter: validFrontmatter({ title: "Zeta", date: "2026-06-28" }),
    })
    writePost({
      directory,
      slug: "alpha-post",
      frontmatter: validFrontmatter({ title: "Alpha", date: "2026-06-28" }),
    })

    const latest = getLatestPostsFromDirectory(directory, 2)

    expect(latest.map((post) => post.slug)).toEqual(["alpha-post", "zeta-post"])
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

  it("Given draft posts in development When reading a directory Then includes draft previews", async () => {
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
    vi.stubEnv("NODE_ENV", "development")

    try {
      expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual([
        "draft",
        "published",
      ])
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("Given a future-dated post outside development When reading a directory Then excludes it", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "published-today",
      frontmatter: validFrontmatter({ title: "Published Today", date: "2026-07-11" }),
    })
    writePost({
      directory,
      slug: "scheduled-future",
      frontmatter: validFrontmatter({ title: "Scheduled Future", date: "2026-07-12" }),
    })
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-11T12:00:00+09:00"))

    try {
      expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual([
        "published-today",
      ])
    } finally {
      vi.useRealTimers()
    }
  })

  it("Given a non-ISO localized date string When reading posts Then compares publication dates using ISO parts", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "published-today",
      frontmatter: validFrontmatter({ title: "Published Today", date: "2026-07-11" }),
    })
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-11T12:00:00+09:00"))
    const formatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "Asia/Seoul",
      year: "numeric",
    })

    class NonIsoDateTimeFormat {
      format(): string {
        return "07/11/2026"
      }

      formatToParts(date?: number | Date): Intl.DateTimeFormatPart[] {
        return formatter.formatToParts(date)
      }
    }

    vi.stubGlobal("Intl", { DateTimeFormat: NonIsoDateTimeFormat })

    try {
      expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual([
        "published-today",
      ])
    } finally {
      vi.unstubAllGlobals()
      vi.useRealTimers()
    }
  })

  it("Given the first minutes of a Seoul calendar day When reading posts Then publishes posts dated that day", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "published-in-seoul",
      frontmatter: validFrontmatter({ title: "Published in Seoul", date: "2026-07-12" }),
    })
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-12T00:30:00+09:00"))

    try {
      expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual([
        "published-in-seoul",
      ])
    } finally {
      vi.useRealTimers()
    }
  })

  it("Given a future-dated post in development When reading a directory Then includes its preview", async () => {
    const directory = await createPostDirectory()
    writePost({
      directory,
      slug: "scheduled-future",
      frontmatter: validFrontmatter({ title: "Scheduled Future", date: "2026-07-12" }),
    })
    vi.stubEnv("NODE_ENV", "development")
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-11T12:00:00+09:00"))

    try {
      expect(readPostsFromDirectory(directory).map((post) => post.slug)).toEqual([
        "scheduled-future",
      ])
    } finally {
      vi.useRealTimers()
      vi.unstubAllEnvs()
    }
  })
})
