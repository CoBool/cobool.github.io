import { readFileSync } from "node:fs"
import vm from "node:vm"
import { describe, expect, it, vi } from "vitest"

const source = readFileSync("public/sw.js", "utf8").replaceAll("__BUILD_VERSION__", "build-b")

type WorkerEvent = {
  request?: Request
  waitUntil: (promise: Promise<unknown>) => void
  respondWith?: (promise: Promise<Response>) => void
}

function worker(scope = "https://example.com/") {
  const stores = new Map<string, Map<string, Response>>()
  const handlers = new Map<string, (event: WorkerEvent) => void>()
  const network = vi.fn(async (_request: Request, _init?: RequestInit) => new Response("network"))
  const key = (request: Request | string) =>
    typeof request === "string" ? new URL(request, scope).href : request.url
  class ScopedRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(typeof input === "string" ? new URL(input, scope) : input, init)
    }
  }
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    open: async (name: string) => {
      let store = stores.get(name)
      if (!store) {
        store = new Map()
        stores.set(name, store)
      }
      const entries = store
      return {
        add: async (request: Request) => entries.set(key(request), await network(request)),
        put: async (request: Request, response: Response) => entries.set(key(request), response),
        match: async (request: Request | string) => entries.get(key(request))?.clone(),
        keys: async () => [...entries.keys()].map((url) => new Request(url)),
        delete: async (request: Request) => entries.delete(key(request)),
      }
    },
  }
  vm.runInNewContext(source, {
    self: {
      registration: { scope },
      location: { origin: new URL(scope).origin },
      addEventListener: (name: string, handler: (event: WorkerEvent) => void) =>
        handlers.set(name, handler),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches,
    fetch: network,
    URL,
    Request: ScopedRequest,
    Response,
  })
  async function lifecycle(name: string) {
    const pending: Promise<unknown>[] = []
    handlers.get(name)?.({ waitUntil: (promise) => pending.push(promise) })
    await Promise.all(pending)
  }
  async function fetchPath(path: string, navigate = false) {
    const pending: Promise<unknown>[] = []
    const request = new Request(new URL(path, scope))
    if (navigate) Object.defineProperty(request, "mode", { value: "navigate" })
    let response: Promise<Response> | undefined
    handlers.get("fetch")?.({
      request,
      waitUntil: (p) => pending.push(p),
      respondWith: (p) => {
        response = p
      },
    })
    const result = await response
    await Promise.all(pending)
    return result
  }
  return { stores, network, caches, lifecycle, fetchPath }
}

describe("service worker cache lifecycle", () => {
  it("deletes only this app's previous caches, including its legacy root cache", async () => {
    const app = worker()
    for (const name of [
      "other-app",
      "true-log-cache-%2Fblog%2F-old",
      "true-log-cache-%2F-old",
      "true-log-cache-true-log-v1",
    ]) {
      await app.caches.open(name)
    }
    await app.lifecycle("install")
    await app.lifecycle("activate")
    expect(await app.caches.keys()).toEqual([
      "other-app",
      "true-log-cache-%2Fblog%2F-old",
      "true-log-cache-%2F-build-b",
    ])
  })

  it("revalidates fixed URLs while serving hashed assets from its own cache", async () => {
    const app = worker()
    await app.lifecycle("install")
    expect(await (await app.fetchPath("icons/icon-192.png"))?.text()).toBe("network")
    app.network.mockImplementation(async () => new Response("updated"))
    expect(await (await app.fetchPath("icons/icon-192.png"))?.text()).toBe("updated")
    expect(app.network).toHaveBeenLastCalledWith(expect.any(Request), { cache: "no-cache" })
    await app.fetchPath("_next/static/a.js")
    app.network.mockRejectedValue(new Error("offline"))
    expect(await (await app.fetchPath("_next/static/a.js"))?.text()).toBe("updated")
  })

  it("uses cached pages and an offline fallback, but preserves online 404 responses", async () => {
    const app = worker()
    await app.lifecycle("install")
    app.network.mockResolvedValue(new Response("article"))
    await app.fetchPath("posts/read/", true)
    app.network.mockRejectedValue(new Error("offline"))
    expect(await (await app.fetchPath("posts/read/", true))?.text()).toBe("article")
    expect(await (await app.fetchPath("posts/unread/", true))?.text()).toBe("network")
    expect((await app.fetchPath("pagefind/missing.js"))?.type).toBe("error")
    app.network.mockResolvedValue(new Response("removed", { status: 404 }))
    expect((await app.fetchPath("posts/read/", true))?.status).toBe(404)
  })

  it("never intercepts version checks, foreign origins, or unrelated requests", async () => {
    const app = worker()
    for (const path of [
      "build-version.json",
      "sw.js",
      "api/account",
      "https://other.example/a.js",
    ]) {
      expect(await app.fetchPath(path)).toBeUndefined()
    }
    expect(app.network).not.toHaveBeenCalled()
  })

  it("bounds cache growth while preserving the offline fallback", async () => {
    const app = worker()
    await app.lifecycle("install")
    await Promise.all(Array.from({ length: 140 }, (_, i) => app.fetchPath(`_next/static/${i}.js`)))
    const entries = app.stores.get("true-log-cache-%2F-build-b")
    expect(entries?.size).toBe(128)
    expect(entries?.has("https://example.com/offline.html")).toBe(true)
  })

  it("derives offline and asset paths from the registration scope", async () => {
    const app = worker("https://example.com/blog/")
    await app.lifecycle("install")
    expect(app.network.mock.calls[0]?.[0].url).toBe("https://example.com/blog/offline.html")
    expect(await app.fetchPath("/icons/a.png")).toBeUndefined()
    expect((await app.fetchPath("icons/a.png"))?.ok).toBe(true)
  })

  it("keeps online responses working if Cache Storage cannot open", async () => {
    const app = worker()
    vi.spyOn(app.caches, "open").mockRejectedValue(new Error("storage unavailable"))
    expect(await (await app.fetchPath("icons/a.png"))?.text()).toBe("network")
  })
})
