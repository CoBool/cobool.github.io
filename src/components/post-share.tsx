import type { ReactNode } from "react"
import { CopyLinkButton } from "@/components/copy-link-button"
import { iconActionVariants } from "@/components/icon-action"
import { Icons } from "@/components/icons"
import { KakaoShareButton } from "@/components/kakao-share-button"
import type { KakaoConfig } from "@/config/integrations"

type PostShareProps = Readonly<{
  title: string
  description: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  url: string
  kakao: KakaoConfig
}>

// X·Threads 공유는 순수 링크라 서버에서 그린다. 상태가 필요한 복사 버튼과
// 카카오 SDK 버튼만 클라이언트 섬으로 남겨 하이드레이션 범위를 줄인다.
export function PostShare({
  title,
  description,
  imageUrl,
  imageWidth,
  imageHeight,
  url,
  kakao,
}: PostShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

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
          imageHeight={imageHeight}
          imageUrl={imageUrl}
          imageWidth={imageWidth}
          jsKey={kakao.jsKey}
          title={title}
          url={url}
        />
      ) : null}
      <CopyLinkButton url={url} />
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
      className={iconActionVariants()}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  )
}
