import type { NextConfig } from "next"

import { validateDeployment } from "./src/config/deployment"

validateDeployment(process.env, process.env.NODE_ENV === "production")

const nextConfig: NextConfig = {
  // biome-ignore lint/complexity/useLiteralKeys: tsconfig noPropertyAccessFromIndexSignature requires bracket access
  ...(process.env["DEV_ORIGIN"] ? { allowedDevOrigins: [process.env["DEV_ORIGIN"]] } : {}),
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
