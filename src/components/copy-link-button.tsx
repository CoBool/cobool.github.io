"use client"

import { toast } from "sonner"
import { iconActionVariants } from "@/components/icon-action"
import { Icons } from "@/components/icons"

type CopyLinkButtonProps = Readonly<{
  url: string
}>

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  async function handleCopy() {
    try {
      // http 등 non-secure context 에서는 clipboard 가 아예 없다. 그대로 호출하면
      // 동기 TypeError, 권한 거부면 unhandled rejection 이라 둘 다 여기서 잡는다.
      if (navigator.clipboard === undefined) {
        throw new Error("Clipboard API unavailable")
      }

      await navigator.clipboard.writeText(url)
      toast.success("링크가 복사됐습니다")
    } catch {
      toast.error("링크를 복사하지 못했습니다. 주소창에서 직접 복사해 주세요.")
    }
  }

  return (
    <button
      aria-label="글 링크 복사"
      className={iconActionVariants()}
      onClick={handleCopy}
      type="button"
    >
      <Icons.link aria-hidden="true" className="size-4" />
    </button>
  )
}
