import type { NextConfig } from "next"

// biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
const rawBasePath = process.env["NEXT_PUBLIC_BASE_PATH"]?.trim()
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`).replace(/\/+$/, "")
    : undefined

const nextConfig: NextConfig = {
  // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
  ...(process.env["DEV_ORIGIN"] ? { allowedDevOrigins: [process.env["DEV_ORIGIN"]] } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
