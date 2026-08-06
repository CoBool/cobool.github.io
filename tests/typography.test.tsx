import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  Eyebrow,
  Lead,
  PageTitle,
  SectionTitle,
  type TypographyLevel,
  typography,
} from "../src/components/typography"

// DESIGN.md §3 의 Utilities 열이 스케일의 기준이다. 프리미티브가 거기서 벗어나면
// 문서와 구현이 조용히 갈라지므로 표를 직접 읽어 대조한다.
const documentedUtilities = readDocumentedUtilities()

const LEVEL_SOURCES: Readonly<Record<TypographyLevel, readonly string[]>> = {
  pageTitle: ["H1", "Display"],
  sectionTitle: ["H2"],
  lead: ["Body", "Body/lg"],
  eyebrow: ["Caption"],
}

describe("typography primitives", () => {
  it.each(
    Object.entries(LEVEL_SOURCES),
  )("Given the %s level When reading its classes Then every utility DESIGN.md documents is present", (level, sources) => {
    const classes = new Set(typography(level as TypographyLevel).split(" "))

    for (const source of sources) {
      const utilities = documentedUtilities.get(source)
      expect(utilities, `DESIGN.md 에 "${source}" 행이 없습니다`).toBeDefined()

      for (const utility of utilities ?? []) {
        expect(classes.has(utility), `${level} 에 "${utility}" 없음`).toBe(true)
      }
    }
  })

  it("Given each primitive When rendered Then it uses the intended element and keeps caller classes", () => {
    const markup = renderToStaticMarkup(
      <>
        <PageTitle id="t">제목</PageTitle>
        <SectionTitle>구역</SectionTitle>
        <Lead className="max-w-2xl">도입부</Lead>
        <Eyebrow>Label</Eyebrow>
      </>,
    )

    expect(markup).toContain("<h1")
    expect(markup).toContain("<h2")
    expect(markup).toContain('id="t"')
    expect(markup).toContain("max-w-2xl")
    expect(markup).toContain("text-4xl")
    expect(markup).toContain("uppercase")
  })
})

function readDocumentedUtilities(): ReadonlyMap<string, readonly string[]> {
  const designSystem = readFileSync("DESIGN.md", "utf8")
  const scale = designSystem.slice(designSystem.indexOf("### Scale"))
  const rows = scale.slice(0, scale.indexOf("###", 1)).split("\n")
  const utilities = new Map<string, readonly string[]>()

  for (const row of rows) {
    const cells = row.split("|").map((cell) => cell.trim())
    const [, level, , , , utility] = cells

    if (cells.length < 7 || level === undefined || utility === undefined) {
      continue
    }

    const stripped = utility.replaceAll("`", "").trim()

    if (stripped.length > 0 && !stripped.includes("---") && level !== "Level") {
      utilities.set(level, stripped.split(/\s+/))
    }
  }

  return utilities
}
