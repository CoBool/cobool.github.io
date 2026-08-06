import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

// DESIGN.md §3 의 스케일을 코드로 옮긴 것이다. 값을 바꾸려면 두 곳을 함께 고쳐야 한다.
const typographyVariants = cva("", {
  variants: {
    level: {
      // Display + H1. 페이지 제목은 sm 부터 Display 로 커진다.
      pageTitle: "text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl sm:leading-[1.1]",
      // H2
      sectionTitle: "text-2xl font-bold leading-tight text-foreground",
      // Body + Body/lg. 도입부 문단은 sm 부터 Body/lg 로 커진다.
      lead: "text-base leading-[1.65] text-muted-foreground sm:text-lg",
      // Caption
      eyebrow: "text-xs font-semibold uppercase leading-[1.4] text-muted-foreground",
    },
  },
})

export type TypographyLevel = NonNullable<VariantProps<typeof typographyVariants>["level"]>

export function typography(level: TypographyLevel): string {
  return typographyVariants({ level })
}

export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return <h1 className={cn(typography("pageTitle"), className)} {...props} />
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn(typography("sectionTitle"), className)} {...props} />
}

export function Lead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn(typography("lead"), className)} {...props} />
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn(typography("eyebrow"), className)} {...props} />
}
