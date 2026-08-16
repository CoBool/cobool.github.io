"use client"

import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

export function SidebarSearchForm() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()

    if (trimmed.length > 0) {
      router.push(`/search/?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <search className="mt-5">
      <form action="/search/" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="sidebar-search">
          사이트 검색
        </label>
        <div className="flex h-10 w-full items-center gap-2.5 rounded-md border border-input bg-background px-3 text-sm font-semibold leading-[1.55] text-muted-foreground shadow-xs transition-colors duration-150 focus-within:border-ring focus-within:text-foreground focus-within:ring-2 focus-within:ring-ring/20">
          <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
          <input
            aria-label="사이트 검색"
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            id="sidebar-search"
            name="q"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search"
            type="search"
            value={query}
          />
        </div>
      </form>
    </search>
  )
}
