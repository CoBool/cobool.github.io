// @vitest-environment happy-dom
import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { notify } = vi.hoisted(() => ({ notify: vi.fn() }))
vi.mock("sonner", () => ({ toast: notify }))

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("NEXT_PUBLIC_BUILD_VERSION", "page-a")
  vi.stubGlobal("navigator", {
    serviceWorker: {
      register: vi.fn().mockResolvedValue({ update: vi.fn().mockResolvedValue(undefined) }),
    },
  })
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete")
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  notify.mockClear()
})

describe("deployment update notification", () => {
  it("detects a new content deployment without a worker updatefound event and deduplicates it", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ version: "page-b" }) })
    vi.stubGlobal("fetch", fetcher)
    const { PwaRegister } = await import("../src/features/pwa/pwa-register")
    const view = render(<PwaRegister />)
    await waitFor(() => expect(notify).toHaveBeenCalledTimes(1))
    window.dispatchEvent(new Event("online"))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(notify).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledWith(
      "/build-version.json",
      expect.objectContaining({ cache: "no-store" }),
    )
    view.unmount()
    window.dispatchEvent(new Event("online"))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it("retries a failed version request on reconnect and ignores unchanged versions", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ version: "page-a" }) })
      .mockResolvedValue({ ok: true, json: async () => ({ version: "page-b" }) })
    vi.stubGlobal("fetch", fetcher)
    const { PwaRegister } = await import("../src/features/pwa/pwa-register")
    render(<PwaRegister />)
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    window.dispatchEvent(new Event("online"))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(notify).not.toHaveBeenCalled()
    document.dispatchEvent(new Event("visibilitychange"))
    await waitFor(() => expect(notify).toHaveBeenCalledTimes(1))
  })

  it("does not register an offline worker during development", async () => {
    vi.stubEnv("NODE_ENV", "development")
    const { PwaRegister } = await import("../src/features/pwa/pwa-register")
    render(<PwaRegister />)
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled()
  })
})
