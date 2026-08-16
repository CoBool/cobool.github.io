"use client"

import { toast } from "sonner"

type KakaoShareButtonProps = Readonly<{
  jsKey: string
  title: string
  description: string
  imageUrl: string
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
    // 카카오 공식 공유 버튼 에셋(노란 배경 포함)을 그대로 쓴다 — 브랜드 가이드가
    // 단색으로 재채색하지 않고 원본 그대로 쓰도록 요구한다. 그래서 다른 공유
    // 버튼들과 달리 accent 배경·currentColor 처리를 하지 않는다.
    <button
      aria-label="카카오톡으로 공유"
      className="group relative inline-flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={handleClick}
      type="button"
    >
      {/* biome-ignore lint/performance/noImgElement: 정적 export이고 next/image 최적화가 꺼져 있어(images.unoptimized) 이점이 없다 */}
      <img
        alt=""
        className="size-[34px] transition-opacity duration-150 group-hover:opacity-0"
        height={35}
        src="/icons/kakaotalk-share.png"
        width={34}
      />
      {/* biome-ignore lint/performance/noImgElement: 위와 동일한 이유 */}
      <img
        alt=""
        className="absolute inset-0 m-auto size-[34px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        height={35}
        src="/icons/kakaotalk-share-hover.png"
        width={34}
      />
    </button>
  )
}
