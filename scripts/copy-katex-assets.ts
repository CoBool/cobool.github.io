import { copyFileSync, cpSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

export function copyKatexAssets(distributionDirectory: string, outputDirectory: string): void {
  const targetDirectory = join(outputDirectory, "katex")

  mkdirSync(targetDirectory, { recursive: true })
  copyFileSync(join(distributionDirectory, "katex.min.css"), join(targetDirectory, "katex.min.css"))
  cpSync(join(distributionDirectory, "fonts"), join(targetDirectory, "fonts"), {
    recursive: true,
  })
}

const executedFile = process.argv[1]

if (executedFile !== undefined && import.meta.url === pathToFileURL(executedFile).href) {
  const stylesheetPath = fileURLToPath(import.meta.resolve("katex/dist/katex.min.css"))

  copyKatexAssets(dirname(stylesheetPath), join(process.cwd(), "out"))
}
