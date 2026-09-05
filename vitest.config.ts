import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// biome-ignore lint/style/noDefaultExport: Vitest config files are loaded through default export.
export default defineConfig({
  test: { include: ["tests/**/*.test.{ts,tsx}"] },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
