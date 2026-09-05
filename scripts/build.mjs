import { spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const version = randomUUID()
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  env: { ...process.env, NEXT_PUBLIC_BUILD_VERSION: version },
  stdio: "inherit",
})
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

// The page, update endpoint and worker must belong to the same deployment.
writeFileSync("out/build-version.json", JSON.stringify({ version }))
const worker = readFileSync("public/sw.js", "utf8")
if (!worker.includes("__BUILD_VERSION__")) throw new Error("Missing service worker version marker")
writeFileSync("out/sw.js", worker.replaceAll("__BUILD_VERSION__", version))
