import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { cleanStaticExportPlaceholders } from "../scripts/clean-static-export.ts"
import { STATIC_EXPORT_PLACEHOLDER } from "../src/lib/static-export"

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe("static export cleanup", () => {
  it("Given generated placeholders When cleaning the export Then removes every dynamic-route 404 artifact", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "blog-static-export-"))
    temporaryDirectories.push(outputDirectory)
    const generated404Routes = [
      join(outputDirectory, "posts", STATIC_EXPORT_PLACEHOLDER),
      join(outputDirectory, "posts", "page", STATIC_EXPORT_PLACEHOLDER),
      join(outputDirectory, "tags", STATIC_EXPORT_PLACEHOLDER),
      join(outputDirectory, "categories", STATIC_EXPORT_PLACEHOLDER),
      join(outputDirectory, "archives", "2026", STATIC_EXPORT_PLACEHOLDER),
    ]

    for (const route of generated404Routes) {
      writeRoute(route, '<html id="__next_error__">NEXT_HTTP_ERROR_FALLBACK;404</html>')
    }

    cleanStaticExportPlaceholders(outputDirectory)

    for (const route of generated404Routes) {
      expect(existsSync(route)).toBe(false)
    }
  })

  it("Given real content uses the placeholder name When cleaning the export Then preserves the route", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "blog-static-export-"))
    temporaryDirectories.push(outputDirectory)
    const realCategory = join(outputDirectory, "categories", STATIC_EXPORT_PLACEHOLDER)

    writeRoute(realCategory, "<html><h1>Real category</h1></html>")

    cleanStaticExportPlaceholders(outputDirectory)

    expect(existsSync(realCategory)).toBe(true)
  })
})

function writeRoute(directory: string, html: string): void {
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, "index.html"), html, "utf8")
}
