import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import CategoryPage, {
  dynamicParams as categoryDynamicParams,
  generateStaticParams as generateCategoryStaticParams,
} from "../src/app/(site)/categories/[category]/page"
import CategoriesPage from "../src/app/(site)/categories/page"
import PostsPage from "../src/app/(site)/posts/page"
import TagPage, {
  generateStaticParams as generateTagStaticParams,
  dynamicParams as tagDynamicParams,
} from "../src/app/(site)/tags/[tag]/page"
import TagsPage from "../src/app/(site)/tags/page"
import {
  getAllPosts,
  getCategoryIndex,
  getPaginatedPosts,
  getPostsByCategory,
  getPostsByTag,
  getTagIndex,
  POSTS_PER_PAGE,
} from "../src/lib/posts"

describe("blog list pagination and taxonomy", () => {
  it("Given seeded posts When paginating Then page one is canonical and missing pages are rejected", () => {
    const firstPage = getPaginatedPosts(1)
    const secondPage = getPaginatedPosts(2)
    const pageOneSlugs = firstPage?.posts.map((post) => post.slug)

    expect(POSTS_PER_PAGE).toBe(6)
    expect(firstPage?.page).toBe(1)
    expect(firstPage?.posts).toHaveLength(1)
    expect(pageOneSlugs).toEqual(["post-detail-reading-toolbar"])
    expect(secondPage).toBeUndefined()
    expect(getPaginatedPosts(0)).toBeUndefined()
    expect(getPaginatedPosts(999)).toBeUndefined()
  })

  it("Given taxonomy fixtures When indexing categories and tags Then counts derive from published posts", () => {
    const posts = getAllPosts()
    const categories = getCategoryIndex()
    const tags = getTagIndex()
    const expectedCategories = new Map<string, number>()
    const expectedTags = new Map<string, number>()

    for (const post of posts) {
      expectedCategories.set(post.category, (expectedCategories.get(post.category) ?? 0) + 1)

      for (const tag of post.tags) {
        expectedTags.set(tag, (expectedTags.get(tag) ?? 0) + 1)
      }
    }

    for (const category of categories) {
      expect(category.count).toBe(expectedCategories.get(category.name))
      expect(getPostsByCategory(category.name)).toHaveLength(category.count)
    }

    for (const tag of tags) {
      expect(tag.count).toBe(expectedTags.get(tag.name))
      expect(getPostsByTag(tag.name)).toHaveLength(tag.count)
    }

    expect(getPostsByCategory("missing")).toHaveLength(0)
    expect(getPostsByTag("missing")).toHaveLength(0)
  })

  it("Given static export When generating taxonomy params Then category and tag params are fixed", () => {
    expect(categoryDynamicParams).toBe(false)
    expect(tagDynamicParams).toBe(false)
    expect(generateCategoryStaticParams()).toContainEqual({ category: "design" })
    expect(generateTagStaticParams()).toContainEqual({ tag: "toc" })
  })

  it("Given list routes When rendering Then posts page shows Korean archive copy and pagination", () => {
    const postsMarkup = renderToStaticMarkup(createElement(PostsPage))

    expect(postsMarkup).toContain("전체 글")
    expect(postsMarkup).not.toContain("1 /")
    expect(postsMarkup).not.toContain('href="/posts/page/1/"')
  })

  it("Given taxonomy routes When rendering Then list and detail pages expose counts and matching posts", async () => {
    const categoriesMarkup = renderToStaticMarkup(createElement(CategoriesPage))
    const tagsMarkup = renderToStaticMarkup(createElement(TagsPage))
    const categoryPage = await CategoryPage({
      params: Promise.resolve({ category: "design" }),
    })
    const tagPage = await TagPage({ params: Promise.resolve({ tag: "toc" }) })
    const categoryMarkup = renderToStaticMarkup(categoryPage)
    const tagMarkup = renderToStaticMarkup(tagPage)

    expect(categoriesMarkup).toContain("카테고리")
    expect(categoriesMarkup).toContain("design")
    expect(categoriesMarkup).toContain("1개")
    expect(tagsMarkup).toContain("태그")
    expect(tagsMarkup).toContain("toc")
    expect(tagsMarkup).toContain("1개")
    expect(categoryMarkup).toContain("design")
    expect(categoryMarkup).toContain("1개 글")
    expect(tagMarkup).toContain("toc")
    expect(tagMarkup).toContain("1개 글")
  })
})
