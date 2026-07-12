import { get } from "node:http"
import { expect, test } from "@playwright/test"

test("Given a math post When loaded Then serves local KaTeX assets without overflow", async ({
  page,
}) => {
  const failedResponses: string[] = []
  const katexResponses: string[] = []

  page.on("response", (response) => {
    if (!response.ok()) {
      failedResponses.push(`${response.status()} ${response.url()}`)
    }

    if (response.url().includes("/katex/")) {
      katexResponses.push(response.url())
    }
  })

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/posts/math/", { waitUntil: "networkidle" })

  await expect(page.locator(".katex")).toHaveCount(2)
  await expect(page.locator(".katex math")).toHaveCount(2)
  expect(katexResponses.some((url) => url.endsWith("/katex/katex.min.css"))).toBe(true)
  expect(katexResponses.some((url) => url.endsWith(".woff2"))).toBe(true)
  expect(failedResponses).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
})

test("Given an ordinary post When loaded Then does not enable optional Markdown runtimes", async ({
  page,
}) => {
  const requestedUrls: string[] = []

  await page.coverage.startJSCoverage()
  page.on("request", (request) => requestedUrls.push(request.url()))
  await page.goto("/posts/ordinary/", { waitUntil: "networkidle" })
  const scriptCoverage = await page.coverage.stopJSCoverage()

  await expect(page.locator('link[href="/katex/katex.min.css"]')).toHaveCount(0)
  await expect(page.locator('[data-diagram-renderer="true"]')).toHaveCount(0)
  expect(requestedUrls.some((url) => url.includes("/katex/"))).toBe(false)
  expect(scriptCoverage.some(({ source }) => source?.includes("mermaidAPI") === true)).toBe(false)
})

test("Given Mermaid posts When rendering and navigating Then preserves diagrams errors and theme", async ({
  page,
}) => {
  const consoleErrors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })

  await page.goto("/posts/mermaid-one/", { waitUntil: "networkidle" })

  const firstDiagram = page.locator('pre.mermaid[data-diagram-state="rendered"] svg')
  await expect(firstDiagram).toHaveCount(1)
  const firstSvgId = await firstDiagram.getAttribute("id")

  await page.getByRole("button", { name: "Theme mode" }).click()
  await page.getByRole("menuitemradio", { name: "다크" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect.poll(() => firstDiagram.getAttribute("id")).not.toBe(firstSvgId)

  await page.locator('a[href="/posts/mermaid-two/"]').click()
  await expect(page).toHaveURL(/\/posts\/mermaid-two\/$/)
  await expect(page.locator('pre.mermaid[data-diagram-state="rendered"] svg')).toHaveCount(1)

  const failedDiagram = page.locator('pre.mermaid[data-diagram-state="error"]')
  await expect(failedDiagram).toHaveCount(1)
  await expect(failedDiagram).toContainText("A[Broken -->")
  expect(consoleErrors).toEqual([])
})

test("Given a Mermaid post on mobile When rendered Then contains no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/posts/mermaid-two/", { waitUntil: "networkidle" })
  await expect(page.locator('pre.mermaid[data-diagram-state="rendered"] svg')).toHaveCount(1)

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
})

test("Given a malformed URL When requested Then the static server stays available", async ({
  baseURL,
  page,
}) => {
  expect(await getResponseStatus(`${baseURL}/%`)).toBe(400)

  await page.goto("/posts/ordinary/")
  await expect(page.getByRole("heading", { name: "Ordinary fixture" })).toBeVisible()
})

function getResponseStatus(url: string): Promise<number | undefined> {
  return new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      response.resume()
      resolve(response.statusCode)
    })

    request.on("error", reject)
  })
}
