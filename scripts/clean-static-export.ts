import { readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { STATIC_EXPORT_PLACEHOLDER } from "../src/lib/static-export.ts"

const placeholderRoutes = [
  ["posts", STATIC_EXPORT_PLACEHOLDER],
  ["posts", "page", STATIC_EXPORT_PLACEHOLDER],
  ["tags", STATIC_EXPORT_PLACEHOLDER],
  ["categories", STATIC_EXPORT_PLACEHOLDER],
]

export function cleanStaticExportPlaceholders(outputDirectory: string): void {
  for (const route of placeholderRoutes) {
    const routeDirectory = join(outputDirectory, ...route)

    if (isNextNotFoundArtifact(join(routeDirectory, "index.html"))) {
      rmSync(routeDirectory, { force: true, recursive: true })
    }
  }
}

function isNextNotFoundArtifact(indexPath: string): boolean {
  try {
    const html = readFileSync(indexPath, "utf8")

    return html.includes('id="__next_error__"') && html.includes("NEXT_HTTP_ERROR_FALLBACK;404")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false
    }

    throw error
  }
}

const executedFile = process.argv[1]

if (executedFile !== undefined && import.meta.url === pathToFileURL(executedFile).href) {
  cleanStaticExportPlaceholders(join(process.cwd(), "out"))
}
