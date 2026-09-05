type KakaoSdk = Readonly<{
  isInitialized: () => boolean
  init: (key: string) => void
  Share: Readonly<{ sendDefault: (options: Record<string, unknown>) => void }>
}>

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
const KAKAO_SDK_INTEGRITY =
  "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
const SDK_TIMEOUT_MS = 15_000
let kakaoSdkPromise: Promise<KakaoSdk> | undefined

export function loadKakaoSdk(): Promise<KakaoSdk> {
  kakaoSdkPromise ??= new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement("script")
    const fail = () => {
      window.clearTimeout(timeout)
      script.onload = null
      script.onerror = null
      script.remove()
      reject(new Error("Failed to load Kakao SDK"))
    }
    const timeout = window.setTimeout(fail, SDK_TIMEOUT_MS)
    script.src = KAKAO_SDK_SRC
    script.integrity = KAKAO_SDK_INTEGRITY
    script.crossOrigin = "anonymous"
    script.async = true
    script.onload = () => {
      if (window.Kakao === undefined) {
        fail()
        return
      }
      window.clearTimeout(timeout)
      resolve(window.Kakao)
    }
    script.onerror = fail
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    kakaoSdkPromise = undefined
    throw error
  })
  return kakaoSdkPromise
}
