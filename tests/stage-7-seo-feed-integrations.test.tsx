import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { metadata as searchMetadata } from "../src/app/(site)/search/page"
import { dynamic as feedDynamic, GET } from "../src/app/rss.xml/route"
import { GiscusComments } from "../src/components/giscus-comments"
import { GoogleAnalytics } from "../src/components/google-analytics"
import { getPublicIntegrations } from "../src/config/integrations"
import { siteConfig } from "../src/config/site"
import { getAllPosts, type Post } from "../src/lib/posts"
import { buildRssFeed } from "../src/lib/rss"
import { createPageMetadata } from "../src/lib/seo"

describe("stage 7 seo feed and integration gates", () => {
  it("Given public and draft posts When building RSS Then it emits RSS 2.0 with recent public posts only", () => {
    const rss = buildRssFeed([
      postFixture({ slug: "older-post", title: "Older & Useful", date: "2026-06-01" }),
      postFixture({ slug: "draft-post", title: "Draft Post", date: "2026-06-28", draft: true }),
      postFixture({ slug: "newer-post", title: "Newer Post", date: "2026-06-27" }),
    ])

    expect(rss).toContain('<rss version="2.0"')
    expect(rss).toContain("<channel>")
    expect(rss).toContain("<title>True Log</title>")
    expect(rss).toContain("<item>")
    expect(rss.indexOf("Newer Post")).toBeLessThan(rss.indexOf("Older &amp; Useful"))
    expect(rss).toContain(`${siteConfig.url}/posts/newer-post/`)
    expect(rss).not.toContain("Draft Post")
  })

  it("Given the feed route When requested Then it serves the shared RSS pipeline as a static asset", async () => {
    const response = GET()

    expect(feedDynamic).toBe("force-static")
    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8")
    await expect(response.text()).resolves.toBe(buildRssFeed(getAllPosts()))
  })

  it("Given page metadata When applying the layout title template Then the site suffix appears once", () => {
    const metadata = createPageMetadata({
      title: "전체 글",
      description: "True Log에 공개된 Markdown 글 목록입니다.",
      path: "/posts/",
    })

    expect(metadata.title).toBe("전체 글")
    expect(renderTitleWithTemplate(metadata)).toBe(`전체 글 | ${siteConfig.name}`)
  })

  // 검색 결과는 클라이언트에서만 그려져, 색인되면 본문 없는 페이지가 검색엔진에 등록된다.
  it("Given the search page When reading its metadata Then it is excluded from indexing", () => {
    expect(searchMetadata.robots).toEqual({ index: false, follow: true })
  })

  it("Given valid public integration env When parsing config Then giscus and GA are enabled", () => {
    const integrations = getPublicIntegrations({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123DEF4",
      NEXT_PUBLIC_GISCUS_CATEGORY: "Announcements",
      NEXT_PUBLIC_GISCUS_CATEGORY_ID: "DIC_kwDOL123456789",
      NEXT_PUBLIC_GISCUS_MAPPING: "pathname",
      NEXT_PUBLIC_GISCUS_REPO: "owner/repo",
      NEXT_PUBLIC_GISCUS_REPO_ID: "R_kgDOL12345",
    })

    expect(integrations.giscus.enabled).toBe(true)
    expect(integrations.ga4.enabled).toBe(true)
  })

  it("Given missing public integration env When rendering gates Then no broken scripts or iframes render", () => {
    const integrations = getPublicIntegrations({})
    const markup = renderToStaticMarkup(
      <>
        <GoogleAnalytics config={integrations.ga4} />
        <GiscusComments config={integrations.giscus} />
      </>,
    )

    expect(integrations.giscus.enabled).toBe(false)
    expect(integrations.ga4.enabled).toBe(false)
    expect(markup).not.toContain("<script")
    expect(markup).not.toContain("<iframe")
    expect(markup).not.toContain("giscus.app")
    expect(markup).not.toContain("googletagmanager.com")
  })

  it("Given malformed GA env When parsing config Then validation fails", () => {
    expect(() =>
      getPublicIntegrations({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "UA-legacy",
      }),
    ).toThrow(/Invalid public integration config/)
  })

  it("Given malformed complete giscus env When parsing config Then validation fails", () => {
    expect(() =>
      getPublicIntegrations({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123DEF4",
        NEXT_PUBLIC_GISCUS_CATEGORY: "Announcements",
        NEXT_PUBLIC_GISCUS_CATEGORY_ID: "bad id",
        NEXT_PUBLIC_GISCUS_MAPPING: "freeform",
        NEXT_PUBLIC_GISCUS_REPO: "missing-slash",
        NEXT_PUBLIC_GISCUS_REPO_ID: "bad id",
      }),
    ).toThrow(/Invalid public integration config/)
  })

  it("Given partial giscus env When parsing config Then validation fails", () => {
    expect(() =>
      getPublicIntegrations({
        NEXT_PUBLIC_GISCUS_CATEGORY: "Announcements",
        NEXT_PUBLIC_GISCUS_MAPPING: "pathname",
        NEXT_PUBLIC_GISCUS_REPO: "owner/repo",
      }),
    ).toThrow(/Invalid public integration config/)
  })
})

function renderTitleWithTemplate(metadata: Metadata): string {
  if (typeof metadata.title !== "string") {
    throw new Error("Expected page metadata title to be a string")
  }

  return `${metadata.title} | ${siteConfig.name}`
}

function postFixture(overrides: Partial<Post>): Post {
  return {
    category: "engineering",
    content: "Body",
    date: "2026-06-28",
    description: "Description",
    draft: false,
    excerpt: "Description",
    pinned: false,
    readingMinutes: 1,
    slug: "sample-post",
    tags: ["content"],
    title: "Sample Post",
    ...overrides,
  }
}
