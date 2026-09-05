import { parseThemeMode, THEME_STORAGE_KEY, type ThemeMode } from "./theme"

export type ResolvedTheme = "light" | "dark"

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)"

// 테마 판별·적용은 부트스트랩 스크립트(theme-script)와 규칙이 정확히 일치해야 한다.
// 드롭다운·giscus·다이어그램이 각자 재구현하면 한쪽만 고쳐질 때 조용히 어긋나므로,
// 브라우저에서 테마를 읽고 쓰는 경로는 전부 이 모듈을 거친다.

export function getStoredThemeMode(): ThemeMode {
  const currentMode = document.documentElement.getAttribute("data-theme-mode")
  if (currentMode !== null) return parseThemeMode(currentMode)
  try {
    return parseThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return parseThemeMode(document.documentElement.getAttribute("data-theme-mode"))
  }
}

export function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode !== "system") {
    return mode
  }

  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light"
}

/** 문서에 이미 적용된 테마를 읽는다. 부트스트랩 스크립트가 <html class> 를 가장 먼저 맞춘다. */
export function getResolvedTheme(): ResolvedTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-theme-mode", mode)
  document.documentElement.classList.toggle("dark", resolveThemeMode(mode) === "dark")
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // The current tab keeps its choice even when persistence is unavailable.
  }
}

/**
 * 문서 테마가 바뀔 때마다 콜백을 부른다. class 속성 변경마다 호출되므로
 * 값이 같을 수 있고, 그 필터링은 구독자 몫이다. 반환값은 구독 해제 함수.
 */
export function observeResolvedTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  const observer = new MutationObserver(() => {
    onChange(getResolvedTheme())
  })

  observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true })

  return () => observer.disconnect()
}
