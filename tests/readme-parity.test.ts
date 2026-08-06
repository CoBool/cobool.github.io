import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// 두 언어판은 같은 내용을 담아야 하는데, 한쪽만 고치는 실수는 조용히 지나간다.
// 번역문을 비교할 수는 없으니 구조(문단 구성·표 크기·링크)가 어긋나는지 본다.
const README = { en: "README.md", ko: "README.ko.md" } as const
const SWITCHER_LINKS = new Set<string>([README.en, README.ko])

describe("readme parity", () => {
  const en = profile(README.en)
  const ko = profile(README.ko)

  it("Given both language editions When comparing structure Then sections and tables line up", () => {
    expect(ko.headings).toEqual(en.headings)
    expect(ko.tableRowCounts).toEqual(en.tableRowCounts)
    expect(ko.codeBlocks).toEqual(en.codeBlocks)
  })

  it("Given both language editions When comparing links Then they point at the same places", () => {
    expect(ko.links).toEqual(en.links)
  })

  it.each([
    README.en,
    README.ko,
  ])("Given %s When following its links Then each target exists", (file) => {
    const missing = profile(file).links.filter((link) => !existsSync(link))

    expect(missing).toEqual([])
  })

  it.each([
    [README.en, README.ko],
    [README.ko, README.en],
  ])("Given %s When looking for the switcher Then it links to %s", (file, other) => {
    expect(readFileSync(file, "utf8")).toContain(`](${other})`)
  })
})

type ReadmeProfile = Readonly<{
  headings: number
  links: readonly string[]
  tableRowCounts: readonly number[]
  codeBlocks: number
}>

function profile(file: string): ReadmeProfile {
  const source = readFileSync(file, "utf8")
  const links = [...source.matchAll(/\]\(([^)#]+)\)/g)]
    .map(([, link]) => link ?? "")
    // 언어 전환 링크는 서로를 가리키므로 비교에서 제외한다.
    .filter((link) => !SWITCHER_LINKS.has(link))

  return {
    headings: (source.match(/^## /gm) ?? []).length,
    links: [...new Set(links)].sort(),
    tableRowCounts: [...source.matchAll(/(?:^\|.*\n)+/gm)].map(
      ([table]) => table.trim().split("\n").length,
    ),
    codeBlocks: (source.match(/^```/gm) ?? []).length / 2,
  }
}
