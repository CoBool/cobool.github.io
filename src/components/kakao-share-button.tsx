"use client"

import { toast } from "sonner"
import { Icons } from "@/components/icons"

type KakaoShareButtonProps = Readonly<{
  jsKey: string
  title: string
  description: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  url: string
}>

type KakaoSdk = Readonly<{
  isInitialized: () => boolean
  init: (key: string) => void
  Share: Readonly<{
    sendDefault: (options: Record<string, unknown>) => void
  }>
}>

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"

let kakaoSdkPromise: Promise<KakaoSdk> | undefined

function loadKakaoSdk(): Promise<KakaoSdk> {
  kakaoSdkPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")

    script.src = KAKAO_SDK_SRC
    script.async = true
    script.onload = () => {
      if (window.Kakao === undefined) {
        reject(new Error("Kakao SDK failed to attach to window"))
        return
      }

      resolve(window.Kakao)
    }
    script.onerror = () => reject(new Error("Failed to load Kakao SDK"))
    document.head.appendChild(script)
  })

  return kakaoSdkPromise
}

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
      className="inline-flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={handleClick}
      type="button"
    >
      <Icons.social.kakaotalk className="size-4" />
    </button>
  )
}
