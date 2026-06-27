import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// biome-ignore lint/style/noDefaultExport: Vitest config files are loaded through default export.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
