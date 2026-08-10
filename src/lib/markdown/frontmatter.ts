import { z } from "zod"

const PostFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    date: z.iso.date(),
    tags: z.array(z.string().trim().min(1)).min(1),
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
      .refine((value) => !value.toLowerCase().endsWith(".svg"), {
        message:
          "Must not be an SVG file — most social platforms cannot render SVG og:image previews",
      })
      .optional(),
    pinned: z.boolean().default(false),
    toc: z.boolean().default(true),
  })
  .strict()

type PostFrontmatterSource = Readonly<{
  data: unknown
  slug: string
  filePath: string
}>
export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

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

  return result.data
}
