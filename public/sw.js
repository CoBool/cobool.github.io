const CACHE_VERSION = "__BUILD_VERSION__"
const SCOPE_PATH = new URL(self.registration.scope).pathname
const CACHE_PREFIX = `true-log-cache-${encodeURIComponent(SCOPE_PATH)}-`
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`
const OFFLINE_FALLBACK = `${SCOPE_PATH}offline.html`
const MAX_CACHE_ENTRIES = 128
let cacheWrites = Promise.resolve()

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(new Request(OFFLINE_FALLBACK, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) =>
                (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) ||
                (SCOPE_PATH === "/" && name === "true-log-cache-true-log-v1"),
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Keep writes alive and serialize eviction so concurrent requests cannot exceed the cap.
function remember(event, request, response) {
  if (!response.ok || response.type === "opaque") return
  const clone = response.clone()
  cacheWrites = cacheWrites
    .then(async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, clone)
      const entries = await cache.keys()
      const removable = entries.filter((entry) => new URL(entry.url).pathname !== OFFLINE_FALLBACK)
      for (const entry of removable.slice(0, Math.max(0, entries.length - MAX_CACHE_ENTRIES))) {
        await cache.delete(entry)
      }
    })
    // Storage quota failures must not turn successful network responses into failures.
    .catch(() => {})
  event.waitUntil(cacheWrites)
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(SCOPE_PATH)
  )
    return

  const path = url.pathname.slice(SCOPE_PATH.length)
  // Deployment checks must always observe the origin, never an offline copy.
  if (path === "build-version.json" || path === "sw.js") return

  const immutable = path.startsWith("_next/static/")
  const managed =
    immutable ||
    request.mode === "navigate" ||
    ["fonts/", "icons/", "katex/", "pagefind/"].some((prefix) => path.startsWith(prefix)) ||
    path.endsWith(".txt")
  if (!managed) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME).catch(() => undefined)
      if (immutable) {
        const cached = await cache?.match(request)
        if (cached) return cached
      }
      try {
        // Fixed URLs revalidate the HTTP cache as well as bypassing Cache Storage.
        const response = await fetch(request, immutable ? undefined : { cache: "no-cache" })
        remember(event, request, response)
        return response
      } catch {
        const cached = await cache?.match(request)
        if (cached) return cached
        if (request.mode === "navigate") {
          return (
            (await cache?.match(OFFLINE_FALLBACK)) ||
            new Response("오프라인 상태입니다.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          )
        }
        return Response.error()
      }
    })(),
  )
})
