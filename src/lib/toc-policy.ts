import type { TableOfContentsItem } from "./markdown"

export type TableOfContentsPolicy = Readonly<{
  siteEnabled: boolean
  postToc: boolean | undefined
  minHeadings: number
  toc: readonly TableOfContentsItem[]
}>

export function shouldRenderTableOfContents(policy: TableOfContentsPolicy): boolean {
  return policy.siteEnabled && policy.postToc !== false && policy.toc.length >= policy.minHeadings
}
