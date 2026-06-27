import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import CategoryPage, {
  dynamicParams as categoryDynamicParams,
  generateStaticParams as generateCategoryStaticParams,
} from "../src/app/categories/[category]/page"
import CategoriesPage from "../src/app/categories/page"
import PostsPage from "../src/app/posts/page"
import PostsPageNumber, {
  generateStaticParams as generatePostPageStaticParams,
  dynamicParams as postsPageDynamicParams,
} from "../src/app/posts/page/[page]/page"
import TagPage, {
  generateStaticParams as generateTagStaticParams,
  dynamicParams as tagDynamicParams,
} from "../src/app/tags/[tag]/page"
import TagsPage from "../src/app/tags/page"
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
  it("Given seeded posts When paginating Then page one is canonical and page two has distinct posts", () => {
    const firstPage = getPaginatedPosts(1)
    const secondPage = getPaginatedPosts(2)
    const pageOneSlugs = firstPage?.posts.map((post) => post.slug)
    const pageTwoSlugs = secondPage?.posts.map((post) => post.slug)

    expect(POSTS_PER_PAGE).toBe(6)
    expect(firstPage?.page).toBe(1)
    expect(secondPage?.page).toBe(2)
    expect(firstPage?.posts).toHaveLength(POSTS_PER_PAGE)
    expect(secondPage?.posts.length).toBeGreaterThan(0)
    expect(pageTwoSlugs?.some((slug) => pageOneSlugs?.includes(slug))).toBe(false)
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

  it("Given static export When generating list params Then page one is not duplicated", () => {
    const postPageParams = generatePostPageStaticParams()

    expect(postsPageDynamicParams).toBe(false)
    expect(postPageParams).toContainEqual({ page: "2" })
    expect(postPageParams).not.toContainEqual({ page: "1" })
    expect(postPageParams).not.toContainEqual({ page: "999" })
  })

  it("Given direct page invocation When page param is non-canonical Then it renders 404", async () => {
    await expect(PostsPageNumber({ params: Promise.resolve({ page: "2.0" }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    )
  })

  it("Given static export When generating taxonomy params Then category and tag params are fixed", () => {
    expect(categoryDynamicParams).toBe(false)
    expect(tagDynamicParams).toBe(false)
    expect(generateCategoryStaticParams()).toContainEqual({ category: "engineering" })
    expect(generateTagStaticParams()).toContainEqual({ tag: "content" })
  })

  it("Given list routes When rendering Then posts pages show Korean archive copy and pagination", async () => {
    const postsMarkup = renderToStaticMarkup(createElement(PostsPage))
    const pageTwo = await PostsPageNumber({ params: Promise.resolve({ page: "2" }) })
    const pageTwoMarkup = renderToStaticMarkup(pageTwo)

    expect(postsMarkup).toContain("전체 글")
    expect(postsMarkup).toContain("1 /")
    expect(postsMarkup).not.toContain('href="/posts/page/1/"')
    expect(pageTwoMarkup).toContain("전체 글")
    expect(pageTwoMarkup).toContain("2 /")
    expect(pageTwoMarkup).toContain('href="/posts"')
  })

  it("Given taxonomy routes When rendering Then list and detail pages expose counts and matching posts", async () => {
    const categoriesMarkup = renderToStaticMarkup(createElement(CategoriesPage))
    const tagsMarkup = renderToStaticMarkup(createElement(TagsPage))
    const categoryPage = await CategoryPage({
      params: Promise.resolve({ category: "engineering" }),
    })
    const tagPage = await TagPage({ params: Promise.resolve({ tag: "content" }) })
    const categoryMarkup = renderToStaticMarkup(categoryPage)
    const tagMarkup = renderToStaticMarkup(tagPage)

    expect(categoriesMarkup).toContain("카테고리")
    expect(categoriesMarkup).toContain("engineering")
    expect(categoriesMarkup).toContain("6개")
    expect(tagsMarkup).toContain("태그")
    expect(tagsMarkup).toContain("content")
    expect(tagsMarkup).toContain("9개")
    expect(categoryMarkup).toContain("engineering")
    expect(categoryMarkup).toContain("6개 글")
    expect(tagMarkup).toContain("content")
    expect(tagMarkup).toContain("9개 글")
  })
})
