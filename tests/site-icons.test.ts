import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import manifest from "../src/app/manifest"
import { siteConfig } from "../src/config/site"

describe("site icons and manifest", () => {
  it("Given the favicon and touch icon When checking the app directory Then both exist", () => {
    expect(existsSync(join(process.cwd(), "src", "app", "icon.svg"))).toBe(true)
    expect(existsSync(join(process.cwd(), "src", "app", "apple-icon.png"))).toBe(true)
  })

  it("Given the manifest icon set When checking the public directory Then every referenced file exists", () => {
    const manifestData = manifest()

    expect(manifestData.icons?.length).toBeGreaterThan(0)

    for (const icon of manifestData.icons ?? []) {
      expect(existsSync(join(process.cwd(), "public", icon.src))).toBe(true)
    }
  })

  it("Given the manifest When generated Then exposes the site identity and standalone display", () => {
    const manifestData = manifest()

    expect(manifestData.name).toBe(siteConfig.name)
    expect(manifestData.short_name).toBe(siteConfig.name)
    expect(manifestData.display).toBe("standalone")
    expect(manifestData.start_url).toBe("/")
  })
})
