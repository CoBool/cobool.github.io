import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type OklchTokens = ReadonlyMap<string, number>

const AA_NORMAL_TEXT_CONTRAST = 4.5

const css = readFileSync("src/app/globals.css", "utf8")
const lightTokens = extractAchromaticTokens(css, ":root")
const darkTokens = extractAchromaticTokens(css, "\\.dark")

describe.each([
  ["light", lightTokens],
  ["dark", darkTokens],
])("%s color tokens", (_theme, tokens) => {
  it("keeps muted-foreground text readable on both muted and background surfaces", () => {
    const mutedForeground = requireToken(tokens, "muted-foreground")
    const muted = requireToken(tokens, "muted")
    const background = requireToken(tokens, "background")

    expect(contrastRatio(mutedForeground, muted)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_CONTRAST)
    expect(contrastRatio(mutedForeground, background)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT_CONTRAST,
    )
  })

  it("keeps border distinct from muted and accent so an outline stays visible", () => {
    const border = requireToken(tokens, "border")
    const muted = requireToken(tokens, "muted")
    const accent = requireToken(tokens, "accent")

    expect(border).not.toBe(muted)
    expect(border).not.toBe(accent)
  })
})

/** Achromatic OKLCH (`oklch(L 0 0)`) maps to linear sRGB as `L ** 3` on every channel. */
function contrastRatio(lightnessA: number, lightnessB: number): number {
  const relativeLuminance = (lightness: number) => lightness ** 3
  const luminances = [relativeLuminance(lightnessA), relativeLuminance(lightnessB)].sort(
    (a, b) => b - a,
  )
  const [higher, lower] = luminances as [number, number]

  return (higher + 0.05) / (lower + 0.05)
}

function extractAchromaticTokens(source: string, blockSelector: string): OklchTokens {
  const block = source.match(new RegExp(`${blockSelector}\\s*\\{([^}]*)\\}`))?.[1] ?? ""
  const tokens = new Map<string, number>()

  for (const match of block.matchAll(/--([\w-]+):\s*oklch\(([\d.]+)\s+0\s+0\)/g)) {
    const [, name, lightness] = match

    if (name !== undefined && lightness !== undefined) {
      tokens.set(name, Number(lightness))
    }
  }

  return tokens
}

function requireToken(tokens: OklchTokens, name: string): number {
  const value = tokens.get(name)

  if (value === undefined) {
    throw new Error(`Expected --${name} to be defined as an achromatic oklch() token`)
  }

  return value
}
