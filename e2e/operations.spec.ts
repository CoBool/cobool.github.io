import { readFile, writeFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

test("production search loads the real Pagefind index and opens a post", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/search/?q=Markdown")
  await expect(page.getByText(/검색 결과 \d+건/)).toBeVisible()
  await page.locator('main li a[href^="/posts/"]').first().click()
  await expect(page.locator("article[data-pagefind-body]")).toBeVisible()
  expect(errors).toEqual([])
})

test("offline navigation restores a visited page and falls back for an unread URL", async ({
  page,
  context,
}) => {
  await page.goto("/")
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await page.goto("/about/")
  const title = await page.title()
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const names = (await caches.keys()).filter((name) => name.startsWith("true-log-cache-"))
        for (const name of names) {
          if (await (await caches.open(name)).match(location.href)) return true
        }
        return false
      }),
    )
    .toBe(true)
  await context.setOffline(true)
  await page.reload()
  await expect(page).toHaveTitle(title)
  await page.goto("/unread-offline-probe/")
  await expect(page.getByRole("heading", { name: "오프라인 상태입니다" })).toBeVisible()
})

test("an open tab detects a changed deployment version without a worker event", async ({
  page,
}) => {
  const file = "out/build-version.json"
  const original = await readFile(file, "utf8")
  await page.goto("/")
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  try {
    await writeFile(file, JSON.stringify({ version: "deployment-update-test" }))
    await expect(async () => {
      await page.evaluate(() => window.dispatchEvent(new Event("online")))
      await expect(page.getByText("새로운 글 또는 업데이트가 있습니다.")).toBeVisible({
        timeout: 1000,
      })
    }).toPass({ timeout: 10_000 })
  } finally {
    await writeFile(file, original)
  }
})

test("unknown routes return HTTP 404", async ({ request }) => {
  const response = await request.get("/does-not-exist/")
  expect(response.status()).toBe(404)
})
