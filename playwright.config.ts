import { resolve } from "node:path"
import { defineConfig, devices } from "@playwright/test"

const port = 49371
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: true,
  fullyParallel: false,
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
  reporter: "list",
  retries: 0,
  testDir: "./tests/e2e",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/e2e/static-export-server.mjs",
    env: {
      BLOG_CONTENT_DIRECTORY: resolve("tests", "fixtures", "posts"),
      PORT: String(port),
    },
    reuseExistingServer: false,
    timeout: 180_000,
    url: baseURL,
  },
  workers: 1,
})
