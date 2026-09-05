// Test server only. Production uses GitHub Pages or deploy/nginx.conf.
import { readFile, stat } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, resolve, sep } from "node:path"

const root = resolve("out")
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
}
createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
    let file = resolve(root, `.${path}`)
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end()
      return
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html")
    const body = await readFile(file)
    response
      .writeHead(200, {
        "Content-Type": types[extname(file)] ?? "application/octet-stream",
        "Cache-Control": path.startsWith("/_next/static/")
          ? "public, max-age=31536000, immutable"
          : "no-store",
      })
      .end(body)
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
    response.end(await readFile(resolve(root, "404.html")).catch(() => "Not found"))
  }
}).listen(4173, "127.0.0.1")
