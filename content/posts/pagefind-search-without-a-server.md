---
title: "서버 없이 검색 붙이기: Pagefind와 postbuild"
description: "output: export 블로그에 검색을 넣으며 인덱싱 시점과 자동 주입을 걷어낸 이유."
date: "2026-08-22"
tags: ["search", "static-export", "nextjs", "pagefind"]
category: "engineering"
draft: false
pinned: false
---

검색을 붙이려면 인덱스가 있어야 하고, 인덱스를 만들려면 글의 최종 텍스트가 있어야 한다. True Log는 `output: "export"`라 서버가 없다. 요청이 올 때마다 인덱스를 만들어 줄 곳이 없다는 뜻이다. 그래서 인덱스도 빌드 산출물이어야 했다.

## 왜 직접 만들지 않았나

가장 먼저 생각한 방식은 `getAllPosts()`가 이미 갖고 있는 frontmatter와 본문을 그대로 JSON으로 뽑아내는 거였다. 어차피 글 목록은 빌드 시점에 한 번 도는 데이터고, 검색에 필요한 필드도 title과 본문 텍스트 정도면 충분해 보였다.

그런데 이 방식은 두 가지를 스스로 다시 구현해야 한다는 뜻이었다. 하나는 한국어를 포함한 토크나이징이고, 다른 하나는 발췌(excerpt) 생성이다. 검색어가 문서 어디에 있는지 찾아서 그 앞뒤를 잘라내고, 일치한 구간을 표시하는 로직은 간단해 보여도 막상 만들면 엣지 케이스가 많다. 이걸 새로 짜는 대신 `pagefind`를 쓰기로 했다. Pagefind는 빌드된 정적 HTML을 그대로 읽어 인덱스를 만드는 도구라, `output: export`가 만들어내는 `out/` 디렉터리와 방향이 잘 맞았다.

```json
"scripts": {
  "postbuild": "pagefind --site out --silent"
}
```

`next build`가 `out/`을 다 채운 다음에 Pagefind가 그 결과물을 읽는다. 소스가 아니라 렌더링된 HTML을 읽기 때문에, Markdown 파이프라인이 무엇을 하든 신경 쓰지 않아도 된다. 코드 하이라이팅, KaTeX, 새로 추가될 어떤 rehype 플러그인이든 최종 HTML에 반영만 되면 검색 대상이 된다.

## 번들은 빌드 이후에만 존재한다

`postbuild`에서 만들어지는 `pagefind.js`는 dev 서버에도, `next build` 직후에도 없다. `out/pagefind/`는 그 다음 단계에서 생긴다. 그러니 이 모듈을 정적 import로 쓰면 번들러가 해석을 시도하다가 실패한다.

```ts
async function loadPagefind(): Promise<PagefindApi> {
  const url = getPagefindBundleUrl()
  const api = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ url
  )) as PagefindApi

  await api.init()
  return api
}
```

경로를 변수로 만들고 `webpackIgnore`, `turbopackIgnore` 주석을 남겨서, 번들러가 이 import를 그래프에 편입시키지 않고 런타임에 브라우저가 직접 fetch하도록 넘긴다. 대신 반환 타입은 직접 선언해야 한다. Pagefind는 타입 패키지를 따로 배포하지 않고, 브라우저에서 동적으로 로드되는 스크립트라 빌드 타임에 실제 모듈을 참조할 수도 없다. `PagefindApi`와 `PagefindFragment`는 실제 런타임 응답 모양을 보고 손으로 좁혀 쓴 최소한의 타입이다.

## 모듈 캐시, 그리고 실패했을 때

번들 로드는 한 번만 하면 된다. 검색창에 입력할 때마다 `pagefind.js`를 다시 받아올 이유는 없다.

```ts
if (bundle === undefined) {
  bundle = loadPagefind().catch((error) => {
    bundle = undefined
    throw error
  })
}

const api = await bundle
```

여기서 신경 쓴 부분은 실패했을 때다. 네트워크가 불안정해서 첫 로드가 실패하면, 그 reject된 Promise를 캐시로 계속 들고 있으면 안 된다. 그러면 이후의 모든 검색 요청이 같은 이유로 영구히 실패한다. `catch`에서 `bundle`을 다시 `undefined`로 되돌려서, 다음 검색 시도가 로드를 새로 시작할 수 있게 열어 뒀다.

## dangerouslySetInnerHTML을 안 쓰기 위해 판 것

Pagefind가 돌려주는 excerpt는 일치 구간을 `<mark>`로 감싼 문자열이다. 가장 빠른 방법은 이 문자열을 그대로 `dangerouslySetInnerHTML`에 넣는 거다. 그런데 이 블로그는 글 본문 HTML도 `rehype-sanitize`를 거친 `SanitizedHtml` 타입만 `dangerouslySetInnerHTML`에 넘기도록 타입으로 막아 뒀다. 검색 결과 하나 때문에 그 경계에 예외를 만들고 싶지 않았다.

그래서 `<mark>` 태그만 직접 파싱한다.

```ts
const segments = html.split(/(<mark>[\s\S]*?<\/mark>)/g).filter((s) => s.length > 0)
```

정규식으로 문자열을 `<mark>...</mark>` 조각과 그 외 텍스트로 나누고, 각각을 React 엘리먼트로 렌더한다. HTML을 그대로 주입하는 대신 태그 하나만 해석해서 신뢰할 수 있는 구조로 바꾼 것에 가깝다.

그런데 이 발췌 안에는 HTML 엔티티도 섞여 있다. `&amp;`, `&lt;` 같은 named entity뿐 아니라 `&#8217;` 같은 numeric entity도 나온다. React가 텍스트를 그대로 렌더하면 이 엔티티가 디코딩되지 않고 문자 그대로 보인다. named entity는 표에서 찾아 바꾸고, numeric entity는 코드포인트를 계산해서 `String.fromCodePoint`로 바꾼다. 서로게이트 절반이나 유효 범위를 벗어난 코드포인트는 `fromCodePoint`가 예외를 던지니, 그 경우엔 디코딩을 포기하고 원문 그대로 남긴다. 잘못 해석해서 다른 문자로 바꾸는 것보다, 안 바뀐 채로 두는 쪽이 덜 위험하다고 봤다.

## 결정한 것과 미룬 것

인덱스는 만들지 않고 가져다 썼다. 대신 그 인덱스를 앱에 연결하는 부분 — 언제 로드하고, 실패하면 어떻게 복구하고, 결과를 어떻게 안전하게 그리는지 — 은 이 블로그의 다른 결정들과 같은 기준을 따르게 했다. sanitize 경계를 지키고, 실패가 영구 장애로 남지 않게 하고, 확실하지 않은 변환은 하지 않는다.

토크나이징이나 한국어 형태소 분석까지 직접 하게 될 일이 생기면 그때는 다른 도구를 볼 것 같다. 지금은 빌드된 정적 페이지를 그대로 읽어 인덱스를 만드는 방식이 이 사이트의 배포 모델과 가장 잘 맞는다.
