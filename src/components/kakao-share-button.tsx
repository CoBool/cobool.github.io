"use client"

import { toast } from "sonner"
import { iconActionVariants } from "@/components/icon-action"
import { Icons } from "@/components/icons"
import { loadKakaoSdk } from "./kakao-sdk"

type KakaoShareButtonProps = Readonly<{
  jsKey: string
  title: string
  description: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  url: string
}>

export function KakaoShareButton({
  jsKey,
  title,
  description,
  imageUrl,
  imageWidth,
  imageHeight,
  url,
}: KakaoShareButtonProps) {
  async function handleClick() {
    try {
      const kakao = await loadKakaoSdk()

      if (!kakao.isInitialized()) {
        kakao.init(jsKey)
      }

      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl,
          // 카카오톡은 OG 태그를 읽지 않아서, 실제 크기를 안 주면 자기 나름의 비율로
          // crop 한다. 실제 이미지 픽셀 크기를 그대로 알려줘야 잘리지 않는다.
          imageWidth,
          imageHeight,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: "블로그에서 보기",
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      })
    } catch {
      toast.error("카카오톡 공유를 불러오지 못했습니다.")
    }
  }

  return (
    <button
      aria-label="카카오톡으로 공유"
      className={iconActionVariants()}
      onClick={handleClick}
      type="button"
    >
      <Icons.social.kakaotalk className="size-4" />
    </button>
  )
}
