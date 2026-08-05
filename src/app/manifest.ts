import type { MetadataRoute } from "next"
import { siteConfig, themeColors } from "@/config/site"

export const dynamic = "force-static"

// biome-ignore lint/style/noDefaultExport: Next.js metadata files require default exports.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    // 웹 매니페스트는 라이트/다크를 구분하지 못하므로, viewport 메타 태그와 같은 다크 값을 쓴다.
    background_color: themeColors.dark,
    theme_color: themeColors.dark,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
