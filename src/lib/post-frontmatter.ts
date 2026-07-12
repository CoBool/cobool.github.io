import { existsSync, statSync } from "node:fs"
import { join } from "node:path"
import { z } from "zod"
import { siteConfig } from "../config/site.ts"

const PostFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    date: z.string().date(),
    tags: z.array(z.string().trim().min(1)).default([]),
    category: z.string().trim().min(1),
    draft: z.boolean().default(false),
    ogImage: z
      .string()
      .trim()
      .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
        message: "Must be a root-relative path to a file in public",
      })
      .refine(
        (value) =>
          !value.includes("\\") &&
          !value.includes("?") &&
          !value.includes("#") &&
          value.split("/").every((segment) => !/^(?:\.|%2e){1,2}$/i.test(segment)),
        { message: "Must not contain traversal, query, or fragment syntax" },
      )
      .optional(),
    pinned: z.boolean().default(false),
    toc: z.boolean().default(true),
    math: z.boolean().optional(),
  })
  .strict()

type PostFrontmatterSource = Readonly<{
  data: unknown
  slug: string
  filePath: string
}>
type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

export class PostContentError extends Error {
  constructor(
    readonly slug: string,
    readonly filePath: string,
    cause: Error,
  ) {
    const details = cause instanceof z.ZodError ? z.prettifyError(cause) : cause.message
    super(`Invalid post frontmatter for "${slug}" at "${filePath}": ${details}`, { cause })
    this.name = "PostContentError"
  }
}

export function parsePostFrontmatter(source: PostFrontmatterSource): PostFrontmatter {
  const result = PostFrontmatterSchema.safeParse(source.data)

  if (!result.success) {
    throw new PostContentError(source.slug, source.filePath, result.error)
  }

  const { ogImage, ...frontmatter } = result.data

  if (ogImage === undefined) {
    return frontmatter
  }

  const filePath = join(process.cwd(), "public", ogImage.slice(1))
  const resolvedOgImage =
    existsSync(filePath) && statSync(filePath).isFile() ? ogImage : siteConfig.defaultOgImage

  return { ...frontmatter, ogImage: resolvedOgImage }
}
