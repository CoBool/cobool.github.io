import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import manifest from "../src/app/manifest"

describe("PWA integration", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("manifest.ts", () => {
    it("Given default configuration When generating manifest Then includes required PWA fields", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      delete process.env["NEXT_PUBLIC_BASE_PATH"]
      const data = manifest()

      expect(data.name).toBe("True Log")
      expect(data.short_name).toBe("True Log")
      expect(data.id).toBe("/")
      expect(data.start_url).toBe("/")
      expect(data.scope).toBe("/")
      expect(data.display).toBe("standalone")
      expect(data.icons).toHaveLength(4)
      expect(data.shortcuts).toHaveLength(4)
    })

    it("Given NEXT_PUBLIC_BASE_PATH When generating manifest Then prefixes URLs with base path", () => {
      // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
      process.env["NEXT_PUBLIC_BASE_PATH"] = "/blog"
      const data = manifest()

      expect(data.id).toBe("/blog/")
      expect(data.start_url).toBe("/blog/")
      expect(data.scope).toBe("/blog/")
      expect(data.icons?.[0]?.src).toBe("/blog/icons/icon-192.png")
      expect(data.shortcuts?.[0]?.url).toBe("/blog/posts/")
    })
  })

  describe("offline.html fallback", () => {
    const offlinePath = join(process.cwd(), "public", "offline.html")

    it("Given public directory When checking offline fallback Then file exists and contains offline content", () => {
      expect(existsSync(offlinePath)).toBe(true)
      const content = readFileSync(offlinePath, "utf8")
      expect(content).toContain("오프라인 상태입니다")
      expect(content).toContain('<html lang="ko">')
    })
  })

  describe("sw.js service worker", () => {
    const swPath = join(process.cwd(), "public", "sw.js")

    it("Given public directory When checking service worker Then file exists and defines cache strategy", () => {
      expect(existsSync(swPath)).toBe(true)
      const content = readFileSync(swPath, "utf8")
      expect(content).toContain("true-log-cache-")
      expect(content).toContain("/offline.html")
      expect(content).toContain('addEventListener("install"')
      expect(content).toContain('addEventListener("fetch"')
    })
  })
})
