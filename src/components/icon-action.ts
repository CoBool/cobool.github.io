import { cva, type VariantProps } from "class-variance-authority"

// size-9 원형 아이콘 액션(공유·복사·사이드바 링크)의 공통 스타일.
// 문자열이 6곳에 복제되어 있던 것을 한 곳으로 모은다. 색·포커스 링만 tone 으로 갈린다.
export const iconActionVariants = cva(
  "inline-flex size-9 items-center justify-center rounded-lg bg-transparent transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      tone: {
        default: "text-muted-foreground focus-visible:outline-ring",
        sidebar: "text-sidebar-foreground focus-visible:outline-sidebar-ring",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
)

export type IconActionVariantProps = VariantProps<typeof iconActionVariants>
