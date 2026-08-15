"use client"

import { type ReactNode, useState } from "react"
import { Icons } from "@/components/icons"

type PostShareProps = Readonly<{
  title: string
  url: string
}>

export function PostShare({ title, url }: PostShareProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-8">
      <span className="mr-1 text-xs font-semibold leading-[1.4] text-muted-foreground">공유</span>
      <ShareLink
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        label="X(트위터)로 공유"
      >
        <Icons.social.x className="size-4" />
      </ShareLink>
      <ShareLink
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        label="Facebook으로 공유"
      >
        <Icons.social.facebook className="size-4" />
      </ShareLink>
      <ShareLink
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        label="Telegram으로 공유"
      >
        <Icons.social.telegram className="size-4" />
      </ShareLink>
      <button
        aria-label="글 링크 복사"
        className="inline-flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={handleCopy}
        type="button"
      >
        <Icons.link aria-hidden="true" className="size-4" />
      </button>
      <span
        aria-live="polite"
        className="text-xs font-semibold leading-[1.4] text-muted-foreground"
      >
        {copied ? "링크가 복사됐습니다" : null}
      </span>
    </div>
  )
}

function ShareLink({
  href,
  label,
  children,
}: Readonly<{ href: string; label: string; children: ReactNode }>) {
  return (
    <a
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}
