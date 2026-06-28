export type NavigationItem = Readonly<{
  href: `/${string}`
  label: string
}>

export const siteNavigationItems = [
  { href: "/", label: "홈" },
  { href: "/posts/", label: "글" },
  { href: "/categories/", label: "카테고리" },
  { href: "/tags/", label: "태그" },
  { href: "/about/", label: "소개" },
] as const satisfies readonly NavigationItem[]
