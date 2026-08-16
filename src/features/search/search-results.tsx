"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { type SearchResult, searchPosts } from "./pagefind"

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; results: readonly SearchResult[] }
  | { status: "failed" }

export function SearchResults() {
  const query = useSearchParams()?.get("q")?.trim() ?? ""
  const [state, setState] = useState<SearchState>({ status: "idle" })

  useEffect(() => {
    if (query.length === 0) {
      setState({ status: "idle" })
      return
    }

    let active = true
    setState({ status: "loading" })

    searchPosts(query)
      .then((results) => {
        if (active) {
          setState({ status: "ready", results })
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "failed" })
        }
      })

    return () => {
      active = false
    }
  }, [query])

  if (state.status === "idle") {
    return <Message>검색어를 입력하세요.</Message>
  }

  if (state.status === "loading") {
    return <Message>검색 중입니다…</Message>
  }

  if (state.status === "failed") {
    return <Message>검색 색인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Message>
  }

  if (state.results.length === 0) {
    return <Message>&ldquo;{query}&rdquo; 에 대한 결과가 없습니다.</Message>
  }

  return (
    <>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        &ldquo;{query}&rdquo; 검색 결과 {state.results.length}건
      </p>
      <ul className="mt-6 flex flex-col gap-6">
        {state.results.map((result) => (
          <li key={result.url}>
            <Link
              className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={result.url}
            >
              {result.title}
            </Link>
            <p className="mt-1.5 text-sm leading-[1.7] text-muted-foreground">
              <Excerpt html={result.excerpt} />
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

// Pagefind 는 일치 구간만 <mark> 로 감싼 발췌를 돌려준다. HTML 로 주입하지 않고
// 그 태그만 해석해 직접 렌더한다 — dangerouslySetInnerHTML 을 쓰지 않기 위해서다.
function Excerpt({ html }: Readonly<{ html: string }>) {
  const segments = html.split(/(<mark>[\s\S]*?<\/mark>)/g).filter((segment) => segment.length > 0)

  return (
    <>
      {segments.map((segment, index) => {
        const match = /^<mark>([\s\S]*)<\/mark>$/.exec(segment)
        const key = `${index}-${segment}`

        return match === null ? (
          <span key={key}>{decodeEntities(segment)}</span>
        ) : (
          <mark className="bg-transparent font-semibold text-foreground" key={key}>
            {decodeEntities(match[1] ?? "")}
          </mark>
        )
      })}
    </>
  )
}

const NAMED_HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
}

// Pagefind 발췌에는 named 외에 &#8217; 같은 numeric entity 도 섞여 나온다.
// 해석하지 못한 표기는 그대로 두는 편이 잘못 바꾸는 것보다 낫다.
function decodeEntities(value: string): string {
  return value.replace(
    /&(?:amp|lt|gt|quot|apos|nbsp|#x[0-9a-f]+|#\d+);/gi,
    (entity) => NAMED_HTML_ENTITIES[entity.toLowerCase()] ?? decodeNumericEntity(entity),
  )
}

function decodeNumericEntity(entity: string): string {
  const digits = entity.slice(2, -1)
  const codePoint =
    digits[0]?.toLowerCase() === "x" ? Number.parseInt(digits.slice(1), 16) : Number(digits)

  // 서로게이트 반쪽·범위 밖 코드포인트는 fromCodePoint 가 던지므로 원문을 유지한다.
  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return entity
  }

  return String.fromCodePoint(codePoint)
}

function Message({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {children}
    </p>
  )
}
