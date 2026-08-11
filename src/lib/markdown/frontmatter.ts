import { z } from "zod"

// 태그·카테고리는 /tags/[tag]/ 경로 세그먼트가 된다. 슬래시류가 섞이면 정적 export 산출 경로와
// encodeURIComponent 로 만든 링크가 어긋나 404 가 나므로 빌드 시점에 거른다.
const ROUTE_UNSAFE_CHARACTER_PATTERN = /[/\\%#?]/

const TaxonomyValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !ROUTE_UNSAFE_CHARACTER_PATTERN.test(value), {
    message: "Must not contain route-breaking characters: / \\ % # ?",
  })

const PostFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    date: z.iso.date(),
    tags: z.array(TaxonomyValueSchema).min(1),
    category: TaxonomyValueSchema,
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
