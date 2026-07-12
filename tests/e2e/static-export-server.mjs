import { spawnSync } from "node:child_process"
import { readFile, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, resolve, sep } from "node:path"

const build = spawnSync("pnpm", ["build"], {
  env: process.env,
  stdio: "inherit",
})

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

const outputDirectory = resolve("out")
const port = Number(process.env.PORT ?? "49371")
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
])

const server = createServer((request, response) => {
  let pathname

  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
  } catch (error) {
    if (error instanceof URIError) {
      response.writeHead(400).end("Bad Request")
      return
    }

    throw error
  }

  const requestedPath = resolve(outputDirectory, `.${pathname}`)

  if (requestedPath !== outputDirectory && !requestedPath.startsWith(`${outputDirectory}${sep}`)) {
    response.writeHead(403).end("Forbidden")
    return
  }

  const filePath = resolveFilePath(requestedPath)

  readFile(filePath, (error, data) => {
    if (error !== null) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end()
      return
    }

    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filePath)) ?? "application/octet-stream",
    })

    if (request.method === "HEAD") {
      response.end()
      return
    }

    response.end(data)
  })
})

server.listen(port, "127.0.0.1")

function resolveFilePath(requestedPath) {
  try {
    return statSync(requestedPath).isDirectory() ? join(requestedPath, "index.html") : requestedPath
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return requestedPath
    }

    throw error
  }
}
