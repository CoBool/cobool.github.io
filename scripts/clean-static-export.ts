import { readdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { STATIC_EXPORT_PLACEHOLDER } from "../src/lib/static-export.ts"

export function cleanStaticExportPlaceholders(outputDirectory: string): void {
  for (const entry of readdirSync(outputDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const routeDirectory = join(outputDirectory, entry.name)

    if (
      entry.name === STATIC_EXPORT_PLACEHOLDER &&
      isNextNotFoundArtifact(join(routeDirectory, "index.html"))
    ) {
      rmSync(routeDirectory, { force: true, recursive: true })
      continue
    }

    cleanStaticExportPlaceholders(routeDirectory)
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
