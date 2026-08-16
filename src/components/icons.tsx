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
// X·카카오톡·Threads 는 각 서비스가 공개한 로고 마크를 직접 그려 넣는다.
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

function KakaoTalkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2C6.48 2 2 5.71 2 10.28c0 2.92 1.87 5.48 4.7 6.96-.2.75-.73 2.74-.84 3.16-.13.53.19.52.4.38.17-.11 2.72-1.85 3.82-2.6.62.09 1.26.14 1.92.14 5.52 0 10-3.71 10-8.28C22 5.71 17.52 2 12 2Z" />
    </svg>
  )
}

function ThreadsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12.19 24h-.007c-3.58-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.418 3.63 8.9 3.605 12.007c.025 3.107.703 5.588 2.041 7.176 1.43 1.783 3.63 2.697 6.54 2.717 2.616-.019 4.35-.64 5.79-2.076 1.646-1.642 1.614-3.673 1.089-4.917-.309-.737-.869-1.35-1.626-1.81-.19 1.351-.61 2.428-1.253 3.213-.858 1.05-2.108 1.63-3.712 1.65-1.203-.017-2.278-.487-3.026-1.323-.858-.958-1.256-2.269-1.12-3.699.238-2.502 2.198-4.203 4.878-4.238.905-.012 1.72.13 2.42.42-.099-1.157-.483-1.997-1.14-2.5-.633-.484-1.516-.71-2.554-.653-1.97.109-3.226 1.208-3.7 2.386l-1.955-.798c.664-1.727 2.554-3.475 5.586-3.638 1.652-.09 3.089.315 4.157 1.169 1.16.928 1.822 2.32 1.967 4.138.107.037.213.076.317.117 1.502.615 2.6 1.559 3.176 2.734.804 1.641.87 4.317-1.394 6.577-1.827 1.826-4.05 2.65-7.202 2.673Zm.878-10.885c-.174-.01-.35-.014-.53-.014-1.686 0-2.71.783-2.816 2.026-.081.951.281 1.703.902 2.334.393.4.945.616 1.596.628 1.001-.014 1.79-.383 2.284-.955.55-.634.848-1.591.887-2.848a4.68 4.68 0 0 0-2.323-1.17Z" />
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
    kakaotalk: KakaoTalkIcon,
    threads: ThreadsIcon,
  },
  theme: {
    system: MonitorIcon,
    light: SunIcon,
    dark: MoonIcon,
  },
} as const
