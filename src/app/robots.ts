import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/config/site"

export const dynamic = "force-static"

// biome-ignore lint/style/noDefaultExport: Next.js metadata files require default exports.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
