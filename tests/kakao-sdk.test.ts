// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

beforeEach(() => {
  vi.resetModules()
  delete window.Kakao
  const append = document.head.appendChild.bind(document.head)
  vi.spyOn(document.head, "appendChild").mockImplementation(<T extends Node>(node: T): T => {
    if (node instanceof HTMLScriptElement) node.type = "application/json"
    return append(node)
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.querySelectorAll('script[src*="kakao_js_sdk"]').forEach((script) => {
    script.remove()
  })
  delete window.Kakao
})
function script(): HTMLScriptElement {
  const element = document.querySelector<HTMLScriptElement>('script[src*="kakao_js_sdk"]')
  if (!element) throw new Error("Expected SDK script")
  return element
}

describe("Kakao SDK loading", () => {
  it("shares in-flight requests and retries after a network failure", async () => {
    const { loadKakaoSdk } = await import("../src/components/kakao-sdk")
    const first = loadKakaoSdk()
    expect(loadKakaoSdk()).toBe(first)
    const rejected = expect(first).rejects.toThrow("Failed to load")
    script().dispatchEvent(new Event("error"))
    await rejected
    expect(document.querySelector('script[src*="kakao_js_sdk"]')).toBeNull()
    const next = loadKakaoSdk()
    window.Kakao = { isInitialized: () => false, init: vi.fn(), Share: { sendDefault: vi.fn() } }
    expect(script().integrity).toMatch(/^sha384-/)
    script().dispatchEvent(new Event("load"))
    await expect(next).resolves.toBe(window.Kakao)
    expect(loadKakaoSdk()).toBe(next)
  })

  it("cleans up a stalled request so later clicks can retry", async () => {
    vi.useFakeTimers()
    const { loadKakaoSdk } = await import("../src/components/kakao-sdk")
    const first = loadKakaoSdk()
    const rejected = expect(first).rejects.toThrow("Failed to load")
    await vi.advanceTimersByTimeAsync(15_000)
    await rejected
    expect(document.querySelector('script[src*="kakao_js_sdk"]')).toBeNull()
  })

  it("allows retry when a loaded script does not expose the SDK", async () => {
    const { loadKakaoSdk } = await import("../src/components/kakao-sdk")
    const rejected = expect(loadKakaoSdk()).rejects.toThrow("Failed to load")
    script().dispatchEvent(new Event("load"))
    await rejected
    const next = expect(loadKakaoSdk()).rejects.toThrow("Failed to load")
    script().dispatchEvent(new Event("error"))
    await next
  })
})
