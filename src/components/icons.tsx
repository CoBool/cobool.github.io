import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  MonitorIcon,
  MoonIcon,
  RssIcon,
  SunIcon,
  TagsIcon,
  UserIcon,
} from "lucide-react"
import type { SVGProps } from "react"

// lucide-react 는 브랜드 로고를 담지 않는다(라이선스 정책). 공유 버튼에 쓰는
// X·Facebook·Telegram 은 각 서비스가 공개한 로고 마크를 직접 그려 넣는다.
function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.09c1.02.01 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.5h7.59l5.24 6.93ZM17.6 20.3h2.04L6.49 3.6H4.3Z" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  )
}

function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm5.57 8.16-1.86 8.79c-.14.63-.51.78-1.03.49l-2.85-2.1-1.37 1.32c-.15.15-.28.28-.57.28l.2-2.9 5.29-4.78c.23-.2-.05-.32-.36-.11l-6.54 4.12-2.82-.88c-.61-.19-.62-.61.13-.91l11.02-4.25c.51-.18.96.12.76.93Z" />
    </svg>
  )
}

export const Icons = {
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  chevronUp: ChevronUpIcon,
  link: LinkIcon,
  list: ListIcon,
  navigation: {
    home: HomeIcon,
    posts: FileTextIcon,
    categories: FolderIcon,
    tags: TagsIcon,
    about: UserIcon,
  },
  social: {
    github: GithubIcon,
    mail: MailIcon,
    rss: RssIcon,
    x: XIcon,
    facebook: FacebookIcon,
    telegram: TelegramIcon,
  },
  theme: {
    system: MonitorIcon,
    light: SunIcon,
    dark: MoonIcon,
  },
} as const
