import { describe, expect, it } from "vitest"
import { STATIC_EXPORT_PLACEHOLDER, withStaticExportPlaceholder } from "../src/lib/static-export"

describe("static export params", () => {
  it("Given real params When preparing a dynamic route Then keeps them unchanged", () => {
    const params = [{ slug: "published-post" }]

    expect(withStaticExportPlaceholder(params, { slug: STATIC_EXPORT_PLACEHOLDER })).toBe(params)
  })

  it("Given no params When preparing a dynamic route Then supplies one removable placeholder", () => {
    expect(withStaticExportPlaceholder([], { page: STATIC_EXPORT_PLACEHOLDER })).toEqual([
      { page: STATIC_EXPORT_PLACEHOLDER },
    ])
  })
})
