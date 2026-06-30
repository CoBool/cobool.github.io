import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  MailIcon,
  MonitorIcon,
  MoonIcon,
  RssIcon,
  SunIcon,
  TagsIcon,
  UserIcon,
} from "lucide-react"
import type { SVGProps } from "react"

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.09c1.02.01 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

export const Icons = {
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
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
  },
  theme: {
    system: MonitorIcon,
    light: SunIcon,
    dark: MoonIcon,
  },
} as const
