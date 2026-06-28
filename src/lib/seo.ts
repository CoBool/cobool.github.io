import type { Metadata } from "next"
import { absoluteUrl, siteConfig } from "@/config/site"
import type { Post } from "./posts"

type PageMetadataInput = Readonly<{
  title: string
  description: string
  path: string
  image?: string
}>

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const previewTitle =
    input.title === siteConfig.name ? siteConfig.name : `${input.title} | ${siteConfig.name}`
  const url = absoluteUrl(input.path)
  const image = absoluteUrl(input.image ?? siteConfig.defaultOgImage)

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: previewTitle,
      description: input.description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: previewTitle,
      description: input.description,
      images: [image],
    },
  }
}

export function createPostMetadata(post: Post): Metadata {
  const input = {
    title: post.title,
    description: post.description,
    path: `/posts/${post.slug}/`,
  }
  const metadata = createPageMetadata(
    post.ogImage === undefined ? input : { ...input, image: post.ogImage },
  )

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      publishedTime: post.date,
      type: "article",
    },
  }
}
