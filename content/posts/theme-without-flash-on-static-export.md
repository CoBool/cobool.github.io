---
title: "정적 export 위에서 테마 깜빡임 없애기"
description: "서버가 없는 output: export 블로그에서 라이트/다크 전환 시 FOUC를 막은 방법과, 부트스트랩 스크립트와 런타임 컨트롤러가 규칙을 공유하게 만든 이유."
date: "2026-08-24"
tags: ["nextjs", "architecture", "static-export"]
category: "engineering"
draft: false
pinned: false
---

True Log는 `output: "export"`라 서버가 없다. 요청이 올 때마다 쿠키나 헤더를 보고 테마를 결정해 HTML에 박아 넣어줄 곳이 없다는 뜻이다. 브라우저가 받는 HTML은 언제나 같은 정적 파일이고, 실제 테마는 사용자의 `localStorage`와 OS 설정에만 있다.

그러면 순서 문제가 생긴다. React가 하이드레이션을 마치기 전까지 `<html>`에는 아무 테마 클래스도 없다. 그 사이에 브라우저는 일단 뭔가를 그려야 하고, 라이트 스타일로 먼저 그렸다가 다크로 바뀌는 순간 화면이 번쩍인다. 이게 흔히 말하는 FOUC(flash of unstyled content)다.

## 왜 `next/script`가 아니라 그냥 `<script>`인가

`src/features/theme/theme-script.tsx`는 `next/script` 대신 순수 `<script>` 태그를 쓴다.

```tsx
export function ThemeScript() {
  return <script>{themeScript}</script>
}
```

`next/script`의 기본/`afterInteractive` 전략은 하이드레이션과 얽혀 있어서 그 시점까지 실행이 미뤄질 여지가 있다. 이 스크립트는 그러면 안 된다. `<body>`의 다른 어떤 자식보다도 먼저, 브라우저가 HTML을 파싱하는 도중에 동기적으로 실행돼야 `<html class="dark">`가 첫 페인트 전에 붙는다. 그래서 `layout.tsx`에서도 `AppShell`보다 앞에 둔다.

```tsx
<body>
  <ThemeScript />
  <GoogleAnalytics config={integrations.ga4} />
  <AppShell>{children}</AppShell>
  ...
</body>
```

## 부트스트랩과 런타임, 같은 판정 로직을 두 번 짜지 않기

테마를 읽고 적용하는 코드는 사실 두 군데가 필요하다. 페인트 전에 한 번 도는 부트스트랩 스크립트(`theme-script.tsx`)와, 드롭다운에서 사용자가 테마를 바꿀 때 도는 런타임 코드(`theme-controller.ts`)다. 이 둘이 "system이면 `matchMedia`로 판정한다", "유효하지 않은 값이면 system으로 취급한다" 같은 규칙을 각자 구현하면, 한쪽만 고쳤을 때 조용히 어긋난다. 드롭다운에서는 다크인데 새로고침하면 라이트로 돌아오는 식의 버그가 바로 이런 어긋남에서 나온다.

그래서 규칙 자체는 `theme.ts` 하나에만 있다.

```ts
export const THEME_MODES = ["system", "light", "dark"] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export function parseThemeMode(value: string | null): ThemeMode {
  switch (value) {
    case "dark": return "dark"
    case "light": return "light"
    case "system": return "system"
    default: return "system"
  }
}
```

`theme-controller.ts`는 이 모듈을 그대로 import해서 쓴다. 문제는 부트스트랩 스크립트는 브라우저에 문자열로 주입되는 인라인 스크립트라 TypeScript 모듈을 import할 수 없다는 점이다. 대신 `theme-script.tsx`는 빌드 시점에 `THEME_MODES`와 `THEME_STORAGE_KEY`를 문자열 템플릿에 직렬화한다.

```ts
const themeScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const validModes = new Set(${JSON.stringify(THEME_MODES)});
  ...
})();
`
```

`THEME_MODES`에 값을 추가하거나 순서를 바꾸면 부트스트랩 스크립트도 자동으로 따라간다. 두 곳에서 같은 배열을 손으로 맞추다 하나를 빼먹는 실수를 원천적으로 막는 방식이다.

## `suppressHydrationWarning`이 필요한 이유

부트스트랩 스크립트가 `<html>`에 `dark` 클래스를 붙이는 시점은 React가 서버에서 렌더링한 HTML과 다르다. 서버는 테마를 모르니 클래스 없는 `<html>`을 내보내고, 브라우저는 그 위에 스크립트로 클래스를 얹는다. React가 하이드레이션 중에 이 차이를 보면 콘솔에 경고를 낸다 — 실제로는 버그가 아니라 정적 export가 테마를 다루는 방식 자체가 서버 렌더 결과와 다를 수밖에 없어서 생기는 차이다. `<html lang="ko" suppressHydrationWarning>`으로 이 한 속성에 한해서만 경고를 끈다.

## OS 설정이 실행 중에 바뀌는 경우

`system` 모드를 선택한 사용자가 OS 다크 모드를 켜고 끄면, 페이지를 새로고침하지 않아도 바로 반영돼야 한다. 부트스트랩 스크립트는 초기 페인트 이후에도 살아남아서 `matchMedia` 리스너를 하나 등록해 둔다.

```js
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getStoredMode() === "system") applyMode("system")
})
```

저장된 모드가 `system`일 때만 반응하고, 사용자가 명시적으로 `light`나 `dark`를 고른 상태라면 OS 설정이 바뀌어도 그대로 둔다.

## 컴포넌트는 클래스를 직접 안 본다

드롭다운이나 giscus, Mermaid 다이어그램처럼 현재 테마를 알아야 하는 컴포넌트가 `document.documentElement.classList`를 직접 검사하게 두면, 검사 시점과 실제 변경 시점이 어긋날 수 있다. 대신 `theme-controller.ts`는 `MutationObserver`로 구독 모델을 제공한다.

```ts
export function observeResolvedTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  const observer = new MutationObserver(() => {
    onChange(getResolvedTheme())
  })
  observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true })
  return () => observer.disconnect()
}
```

`class` 속성이 바뀔 때마다 호출되므로 값이 실제로 달라지지 않았는데도 콜백이 불릴 수 있고, 그 필터링은 일부러 호출하는 쪽 책임으로 남겨뒀다. 관찰 대상을 하나로 좁혀서 어떤 컴포넌트가 언제 테마를 바꿨는지와 무관하게, "지금 문서에 적용된 테마가 무엇인가"만 신경 쓰면 되게 했다.

## 테스트로 규칙을 고정하기

`theme-script.test.tsx`, `theme-foundation.test.ts`, `theme-controller.test.ts` 세 파일이 이 계약을 나눠서 지킨다. 부트스트랩 스크립트가 실제로 첫 페인트 전에 클래스를 붙이는지, `theme.ts`의 판정 규칙이 두 소비자(스크립트/컨트롤러) 모두에서 같은 값을 내는지, `system` 모드에서 OS 변경 이벤트가 제대로 반영되는지를 각각 검증한다. 규칙이 한 모듈에 모여 있어서, 테스트도 그 모듈 하나를 겨냥해 짜면 두 소비자를 동시에 커버한다.
