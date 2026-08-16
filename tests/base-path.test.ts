import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getBasePath, prefixBasePath } from "../src/lib/base-path"

describe("base-path utility", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("getBasePath", () => {
    it("Given undefined NEXT_PUBLIC_BASE_PATH When getting basePath Then returns empty string", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      delete process.env["NEXT_PUBLIC_BASE_PATH"]
      expect(getBasePath()).toBe("")
    })

    it("Given empty or whitespace NEXT_PUBLIC_BASE_PATH When getting basePath Then returns empty string", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "   "
      expect(getBasePath()).toBe("")
    })

    it("Given root slash '/' NEXT_PUBLIC_BASE_PATH When getting basePath Then returns empty string", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/"
      expect(getBasePath()).toBe("")
    })

    it("Given single segment with leading slash When getting basePath Then returns normalized basePath", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/repo"
      expect(getBasePath()).toBe("/repo")
    })

    it("Given single segment with trailing slash When getting basePath Then removes trailing slashes", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/repo/"
      expect(getBasePath()).toBe("/repo")

      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/repo///"
      expect(getBasePath()).toBe("/repo")
    })

    it("Given single segment without leading slash When getting basePath Then prepends leading slash", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "repo"
      expect(getBasePath()).toBe("/repo")

      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "repo/"
      expect(getBasePath()).toBe("/repo")
    })

    it("Given nested path When getting basePath Then preserves inner path and normalizes boundaries", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "nested/sub-repo/"
      expect(getBasePath()).toBe("/nested/sub-repo")
    })
  })

  describe("prefixBasePath", () => {
    it("Given no basePath When prefixing path Then returns original path unchanged", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      delete process.env["NEXT_PUBLIC_BASE_PATH"]
      expect(prefixBasePath("/")).toBe("/")
      expect(prefixBasePath("/pagefind/pagefind.js")).toBe("/pagefind/pagefind.js")
      expect(prefixBasePath("/katex/katex.min.css")).toBe("/katex/katex.min.css")
    })

    it("Given basePath When prefixing path Then combines basePath and target path", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/my-blog/"
      expect(prefixBasePath("/")).toBe("/my-blog/")
      expect(prefixBasePath("/pagefind/pagefind.js")).toBe("/my-blog/pagefind/pagefind.js")
      expect(prefixBasePath("/katex/katex.min.css")).toBe("/my-blog/katex/katex.min.css")
      expect(prefixBasePath("/icons/icon-192.png")).toBe("/my-blog/icons/icon-192.png")
    })
  })
})
