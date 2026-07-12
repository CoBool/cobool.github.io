import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { copyKatexAssets } from "../scripts/copy-katex-assets.ts"

describe("KaTeX static assets", () => {
  it("Given a KaTeX distribution When finalizing an export Then copies its CSS and fonts", async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), "true-log-katex-"))
    const distributionDirectory = join(temporaryDirectory, "dist")
    const outputDirectory = join(temporaryDirectory, "out")

    try {
      mkdirSync(join(distributionDirectory, "fonts"), { recursive: true })
      writeFileSync(join(distributionDirectory, "katex.min.css"), "@font-face{}", "utf8")
      writeFileSync(join(distributionDirectory, "fonts", "KaTeX_Main.woff2"), "font", "utf8")

      copyKatexAssets(distributionDirectory, outputDirectory)

      expect(readFileSync(join(outputDirectory, "katex", "katex.min.css"), "utf8")).toBe(
        "@font-face{}",
      )
      expect(existsSync(join(outputDirectory, "katex", "fonts", "KaTeX_Main.woff2"))).toBe(true)
    } finally {
      rmSync(temporaryDirectory, { force: true, recursive: true })
    }
  })
})
