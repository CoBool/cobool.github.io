import type { MetadataRoute } from "next"
import { siteConfig, themeColors } from "@/config/site"

export const dynamic = "force-static"

function getBasePath(): string {
  // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
  const rawBasePath = process.env["NEXT_PUBLIC_BASE_PATH"]?.trim()

  return rawBasePath && rawBasePath !== "/"
    ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`).replace(/\/+$/, "")
    : ""
}

// biome-ignore lint/style/noDefaultExport: Next.js metadata files require default exports.
export default function manifest(): MetadataRoute.Manifest {
  const basePath = getBasePath()
  const prefix = (path: string) => `${basePath}${path}`

  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: prefix("/"),
    start_url: prefix("/"),
    scope: prefix("/"),
    display: "standalone",
    orientation: "portrait",
    lang: siteConfig.language,
    categories: ["blog", "technology", "development"],
    // 웹 매니페스트는 라이트/다크를 구분하지 못하므로, viewport 메타 태그와 같은 다크 값을 쓴다.
    background_color: themeColors.dark,
    theme_color: themeColors.dark,
    icons: [
      {
        src: prefix("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: prefix("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: prefix("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: prefix("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "전체 글 목록",
        short_name: "글 목록",
        description: "최신 기술 블로그 포스트 목록을 확인합니다.",
        url: prefix("/posts/"),
        icons: [{ src: prefix("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "카테고리",
        short_name: "카테고리",
        description: "주제별 분류 목록을 확인합니다.",
        url: prefix("/categories/"),
        icons: [{ src: prefix("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "태그 목록",
        short_name: "태그",
        description: "관심 태그별 글을 탐색합니다.",
        url: prefix("/tags/"),
        icons: [{ src: prefix("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "검색",
        short_name: "검색",
        description: "블로그 콘텐츠를 빠르게 검색합니다.",
        url: prefix("/search/"),
        icons: [{ src: prefix("/icons/icon-192.png"), sizes: "192x192" }],
      },
    ],
  }
}
