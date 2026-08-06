import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const SOURCE_ROOT = join(process.cwd(), "src", "lib", "markdown")
// Markdown 파이프라인이 써도 되는 것 전부. 호스트(Next·React·node:*·@/*)는 여기 없다.
const ALLOWED_IMPORTS = new Set([
  "hast",
  "hast-util-to-string",
  "mdast",
  "rehype-autolink-headings",
  "rehype-external-links",
  "rehype-katex",
  "rehype-pretty-code",
  "rehype-sanitize",
  "rehype-slug",
  "rehype-stringify",
  "remark-gfm",
  "remark-math",
  "remark-parse",
  "remark-rehype",
  "unified",
  "unist-util-visit",
  "vfile",
  "zod",
])
const IMPORT_PATTERNS = [
  /\bfrom\s+["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\s+["']([^"']+)["']/g,
]

describe("markdown pipeline boundary", () => {
  // 이 디렉터리는 호스트에 의존하지 않는 것이 존재 이유지만, next 를 import 해도
  // 타입 검사와 빌드가 모두 통과한다. 금지 목록이 아니라 허용 목록으로 직접 확인한다.
  it("Given the pipeline sources When collecting imports Then only allowed modules are used", () => {
    const violations = listSourceFiles(SOURCE_ROOT).flatMap((filePath) =>
      collectPackageNames(readFileSync(filePath, "utf8"))
        .filter((name) => !ALLOWED_IMPORTS.has(name))
        .map((name) => `${filePath.slice(SOURCE_ROOT.length + 1)} -> ${name}`),
    )

    expect(violations).toEqual([])
  })
})

function listSourceFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return listSourceFiles(entryPath)
    }

    return entry.name.endsWith(".ts") ? [entryPath] : []
  })
}

function collectPackageNames(source: string): readonly string[] {
  const specifiers = IMPORT_PATTERNS.flatMap((pattern) =>
    [...source.matchAll(pattern)].map(([, specifier]) => specifier ?? ""),
  )

  return [...new Set(specifiers)]
    .filter((specifier) => !specifier.startsWith("."))
    .map(toPackageName)
}

function toPackageName(specifier: string): string {
  const segments = specifier.split("/")

  return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : (segments[0] ?? specifier)
}
