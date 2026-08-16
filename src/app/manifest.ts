import type { MetadataRoute } from "next"
import { siteConfig, themeColors } from "@/config/site"
import { prefixBasePath } from "@/lib/base-path"

export const dynamic = "force-static"

// biome-ignore lint/style/noDefaultExport: Next.js metadata files require default exports.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: prefixBasePath("/"),
    start_url: prefixBasePath("/"),
    scope: prefixBasePath("/"),
    display: "standalone",
    orientation: "portrait",
    lang: siteConfig.language,
    categories: ["blog", "technology", "development"],
    // 웹 매니페스트는 라이트/다크를 구분하지 못하므로, viewport 메타 태그와 같은 다크 값을 쓴다.
    background_color: themeColors.dark,
    theme_color: themeColors.dark,
    icons: [
      {
        src: prefixBasePath("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: prefixBasePath("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: prefixBasePath("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: prefixBasePath("/icons/icon-512.png"),
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
        url: prefixBasePath("/posts/"),
        icons: [{ src: prefixBasePath("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "카테고리",
        short_name: "카테고리",
        description: "주제별 분류 목록을 확인합니다.",
        url: prefixBasePath("/categories/"),
        icons: [{ src: prefixBasePath("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "태그 목록",
        short_name: "태그",
        description: "관심 태그별 글을 탐색합니다.",
        url: prefixBasePath("/tags/"),
        icons: [{ src: prefixBasePath("/icons/icon-192.png"), sizes: "192x192" }],
      },
      {
        name: "검색",
        short_name: "검색",
        description: "블로그 콘텐츠를 빠르게 검색합니다.",
        url: prefixBasePath("/search/"),
        icons: [{ src: prefixBasePath("/icons/icon-192.png"), sizes: "192x192" }],
      },
    ],
  }
}
