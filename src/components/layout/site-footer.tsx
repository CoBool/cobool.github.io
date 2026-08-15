import { siteConfig } from "@/config/site"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-auto mt-4 w-full max-w-[1440px] px-2 pb-2 text-center">
      <p className="text-sm leading-[1.55] text-muted-foreground">
        &copy; {year} {siteConfig.author.name}. 별도 표기가 없는 한 글은{" "}
        <a
          className="underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="https://creativecommons.org/licenses/by/4.0/"
          rel="license noopener noreferrer"
          target="_blank"
        >
          CC BY 4.0
        </a>
        를 따릅니다.
      </p>
    </footer>
  )
}
