import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach } from "vitest"

type MarkdownFixture = {
  readonly directory: string
  readonly slug: string
  readonly frontmatter: string
  readonly body?: string
}

type FrontmatterKey = "title" | "description" | "date" | "tags" | "category" | "draft" | "pinned"

const createdPostDirectories: string[] = []

export function installPostFixtureCleanup(): void {
  afterEach(() => {
    for (const directory of createdPostDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })
}

export async function createPostDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "true-log-posts-"))
  mkdirSync(directory, { recursive: true })
  createdPostDirectories.push(directory)

  return directory
}

export function writePost(fixture: MarkdownFixture): void {
  writeFileSync(
    join(fixture.directory, `${fixture.slug}.md`),
    `---
${fixture.frontmatter}
---

${fixture.body ?? "Sample markdown body."}
`,
  )
}

export function validFrontmatter(
  overrides: Partial<Record<FrontmatterKey, string | boolean | readonly string[]>>,
): string {
  const frontmatter = {
    title: "Sample Post",
    description: "A valid sample post.",
    date: "2026-06-28",
    tags: ["content"],
    category: "notes",
    draft: false,
    pinned: false,
    ...overrides,
  }

  return [
    `title: ${JSON.stringify(frontmatter.title)}`,
    `description: ${JSON.stringify(frontmatter.description)}`,
    `date: ${JSON.stringify(frontmatter.date)}`,
    `tags: ${JSON.stringify(frontmatter.tags)}`,
    `category: ${JSON.stringify(frontmatter.category)}`,
    `draft: ${JSON.stringify(frontmatter.draft)}`,
    `pinned: ${JSON.stringify(frontmatter.pinned)}`,
  ].join("\n")
}
