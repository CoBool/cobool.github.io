import { describe, expect, it } from "vitest"
import { validateDeployment } from "../src/config/deployment"

describe("root deployment contract", () => {
  it("allows a development fallback but requires a production origin", () => {
    expect(() => validateDeployment({}, false)).not.toThrow()
    expect(() => validateDeployment({}, true)).toThrow("NEXT_PUBLIC_SITE_URL is required")
  })
  it.each([
    "https://blog.boolean.kr",
    "https://blog.boolean.kr/",
    "http://localhost:4173",
  ])("accepts %s", (url) => {
    expect(() => validateDeployment({ NEXT_PUBLIC_SITE_URL: url }, true)).not.toThrow()
  })
  it.each([
    "https://example.com/blog/",
    "https://example.com/?q=1",
    "https://example.com/#x",
    "https://user:password@example.com",
    "javascript:alert(1)",
    "invalid",
  ])("rejects invalid origin %s", (url) => {
    expect(() => validateDeployment({ NEXT_PUBLIC_SITE_URL: url }, true)).toThrow()
  })
  it("rejects a partially supported subdirectory before building", () => {
    expect(() =>
      validateDeployment(
        { NEXT_PUBLIC_BASE_PATH: "/blog", NEXT_PUBLIC_SITE_URL: "https://example.com" },
        true,
      ),
    ).toThrow("Only root deployment")
  })
})
