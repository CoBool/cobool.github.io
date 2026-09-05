import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = (path) => readFile(`out/${path}`, "utf8")
const { version } = JSON.parse(await read("build-version.json"))
assert.equal(typeof version, "string")
assert.ok(version.length > 0)
const worker = await read("sw.js")
assert.ok(worker.includes(JSON.stringify(version)), "Worker and page deployment must match")
assert.ok(!worker.includes("__BUILD_VERSION__"), "Worker template was not finalized")
const manifest = JSON.parse(await read("manifest.webmanifest"))
assert.equal(manifest.scope, "/")
assert.equal(manifest.start_url, "/")
const home = await read("index.html")
const canonical = /<link rel="canonical" href="([^"]+)"/.exec(home)?.[1]
assert.ok(canonical, "Missing canonical URL")
const origin = new URL(canonical).origin
assert.equal(canonical, `${origin}/`)
assert.ok((await read("sitemap.xml")).includes(`${origin}/posts/`))
assert.ok((await read("rss.xml")).includes(`${origin}/rss.xml`))
await Promise.all(
  ["pagefind/pagefind.js", "pagefind/pagefind-entry.json", "offline.html", "404.html"].map(read),
)
console.log(
  "Static export verified: deployment version, root URLs, search, offline and 404 artifacts.",
)
