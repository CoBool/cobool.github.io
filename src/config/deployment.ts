/** Supported deployment contract: one static site at the origin root. */
export function validateDeployment(
  env: Readonly<Record<string, string | undefined>>,
  production: boolean,
): void {
  // biome-ignore lint/complexity/useLiteralKeys: index signature access is required by tsconfig.
  const basePath = env["NEXT_PUBLIC_BASE_PATH"]?.trim()
  if (basePath && basePath !== "/") {
    throw new Error("Only root deployment is supported; leave NEXT_PUBLIC_BASE_PATH empty.")
  }
  // biome-ignore lint/complexity/useLiteralKeys: index signature access is required by tsconfig.
  const value = env["NEXT_PUBLIC_SITE_URL"]?.trim()
  if (!value) {
    if (production) throw new Error("NEXT_PUBLIC_SITE_URL is required for a production build.")
    return
  }
  const url = new URL(value)
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.",
    )
  }
}
