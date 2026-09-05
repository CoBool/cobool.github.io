import { expect, test } from "@playwright/test"

const cases = [
  {
    slug: "korea-ai-third-place-dokpamo-evaluation",
    phrases: [
      ["clear #3 nation in AI", 2],
      ["파운데이션 모델", 1],
      ["25", 1],
    ],
  },
  { slug: "claude-code-weekly-limits-september-2026", phrases: [["주간 한도", 1]] },
  {
    slug: "gpt-6-astra-vs-claude-fable-5-1",
    phrases: [
      ["완벽하지는 않지만 빨랐다", 1],
      ["31.4", 1],
      ["cost per completed task에", 1],
      ["$10", 2],
      ["$1", 1],
      ["$50", 2],
    ],
  },
] as const

for (const { slug, phrases } of cases) {
  test(`${slug} displays emphasis on the built page`, async ({ page }, testInfo) => {
    await page.goto(`/posts/${slug}/`)
    const article = page.locator("article[data-pagefind-body]")
    await expect(article).toBeVisible()
    for (const [phrase, count] of phrases) {
      const strong = article
        .locator("strong")
        .filter({ hasText: new RegExp(`^${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) })
      await expect(strong).toHaveCount(count)
      for (let index = 0; index < count; index++) {
        const item = strong.nth(index)
        await item.scrollIntoViewIfNeeded()
        await expect(item).toBeVisible()
        expect(
          await item.evaluate((element) =>
            Number.parseInt(getComputedStyle(element).fontWeight, 10),
          ),
        ).toBeGreaterThanOrEqual(600)
        const paragraph = item.locator("xpath=ancestor::p[1]")
        await expect(paragraph).not.toContainText("**")
        await expect(paragraph.locator(".katex")).toHaveCount(0)
        await testInfo.attach(`${phrase}-${index}`, {
          body: await paragraph.screenshot(),
          contentType: "image/png",
        })
      }
    }
  })
}
