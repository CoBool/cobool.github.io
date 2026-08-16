import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  _resetPagefindBundleCacheForTesting,
  getPagefindBundleUrl,
  searchPosts,
} from "../src/features/search/pagefind"

describe("pagefind module", () => {
  const originalEnv = process.env

  beforeEach(() => {
    _resetPagefindBundleCacheForTesting()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    _resetPagefindBundleCacheForTesting()
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe("getPagefindBundleUrl", () => {
    it("Given no NEXT_PUBLIC_BASE_PATH When resolving bundle URL Then it returns default root path", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      delete process.env["NEXT_PUBLIC_BASE_PATH"]
      expect(getPagefindBundleUrl()).toBe("/pagefind/pagefind.js")
    })

    it("Given NEXT_PUBLIC_BASE_PATH without trailing slash When resolving Then it prepends base path", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/blog"
      expect(getPagefindBundleUrl()).toBe("/blog/pagefind/pagefind.js")
    })

    it("Given NEXT_PUBLIC_BASE_PATH with trailing slash When resolving Then it normalizes trailing slash", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/blog/"
      expect(getPagefindBundleUrl()).toBe("/blog/pagefind/pagefind.js")
    })
  })

  describe("searchPosts cache & recovery", () => {
    it("Given empty query When searching Then it returns empty array without loading bundle", async () => {
      const result = await searchPosts("   ")
      expect(result).toEqual([])
    })
  })
})
