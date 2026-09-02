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
  const isSiteRoot = input.title === siteConfig.name
  const previewTitle = isSiteRoot ? siteConfig.name : `${input.title} | ${siteConfig.name}`
  const url = absoluteUrl(input.path)
  const image = absoluteUrl(input.image ?? siteConfig.defaultOgImage)

  return {
    // 루트 레이아웃의 title.template("%s | True Log")은 문자열 title에 항상 적용된다.
    // 홈처럼 title 이 사이트명 그대로면 absolute 로 템플릿을 건너뛰어야
    // <title>True Log | True Log</title> 로 겹쳐 나가지 않는다.
    title: isSiteRoot ? { absolute: siteConfig.name } : input.title,
    description: input.description,
    alternates: {
      canonical: url,
      // 라우트마다 alternates 를 새로 정의하므로 <head> 의 RSS 자동 인식 태그도
      // 여기서 매번 함께 내보내야 한다. 상위 layout 에만 두면 하위 페이지가 덮어쓴다.
      types: {
        "application/rss+xml": siteConfig.rssPath,
      },
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

export function createWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: ["TrueLog", "boolean.kr"],
    url: siteConfig.url,
  }
}

export function createBlogPostingJsonLd(post: Post): Record<string, unknown> {
  const url = absoluteUrl(`/posts/${post.slug}/`)
  const image = absoluteUrl(post.ogImage ?? siteConfig.defaultOgImage)
  const author = {
    "@type": "Organization",
    name: siteConfig.author.name,
    url: siteConfig.url,
  }

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    // 수정 시각을 별도로 기록하지 않아 발행일로 대신한다.
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: siteConfig.language,
    image: [image],
    author,
    publisher: author,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }
}
