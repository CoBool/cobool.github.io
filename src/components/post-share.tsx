"use client"

import type { ReactNode } from "react"
import { toast } from "sonner"
import { Icons } from "@/components/icons"
import { KakaoShareButton } from "@/components/kakao-share-button"
import type { KakaoConfig } from "@/config/integrations"

type PostShareProps = Readonly<{
  title: string
  description: string
  imageUrl: string
  url: string
  kakao: KakaoConfig
}>

export function PostShare({ title, description, imageUrl, url, kakao }: PostShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    toast.success("링크가 복사됐습니다")
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
        href={`https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`}
        label="Threads로 공유"
      >
        <Icons.social.threads className="size-4" />
      </ShareLink>
      {kakao.enabled ? (
        <KakaoShareButton
          description={description}
          imageUrl={imageUrl}
          jsKey={kakao.jsKey}
          title={title}
          url={url}
        />
      ) : null}
      <button
        aria-label="글 링크 복사"
        className="inline-flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={handleCopy}
        type="button"
      >
        <Icons.link aria-hidden="true" className="size-4" />
      </button>
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
