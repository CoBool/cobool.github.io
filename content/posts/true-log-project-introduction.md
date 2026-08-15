---
title: "True Log를 시작하며"
description: "Markdown을 정적 페이지로 굽는 한국어 기술 블로그, True Log가 어떻게 만들어졌는지."
date: "2026-08-11"
tags: ["true-log", "nextjs", "markdown", "architecture"]
category: "engineering"
draft: false
pinned: true
---

True Log는 Markdown을 정적 페이지로 만드는 한국어 기술 블로그다. Next.js App Router 위에서 돌아가지만, **글을 다루는 부분은 프레임워크를 모른다.** MDX는 없다. Markdown 파이프라인은 문자열을 받아 문자열을 돌려주는 순수 모듈로 분리돼 있고, `unified` 생태계만 쓴다. `next`, `react`, `node:*`, `@/*` 어떤 것도 그 안에서 import할 수 없다. 이건 컨벤션이 아니라 `tests/markdown-boundary.test.ts` 테스트로 강제된다 — 허용 목록 방식이라, 아무도 예상 못한 import도 그대로 실패한다. 타입 체크만으로는 이걸 잡지 못한다. 모듈 해석이 상위 `node_modules`까지 걸어 올라가기 때문이다.

글은 `content/posts/<slug>.md`에 놓인다. 파일명이 곧 URL이다. Frontmatter에 제목, 날짜, 태그, 카테고리를 쓰고, 필요하면 `draft`와 `pinned`를 더한다. `draft: true`인 글과 미래 날짜로 예약된 글은 dev 서버에서는 보이지만 production build에는 들어가지 않는다. 이 판단은 `getAllPosts()` 하나에 모여 있다 — 어떤 글이 공개되는지 결정하는 곳이 파일 하나뿐이라는 뜻이다.

사이트 전체가 `output: "export"`로 나온다. 서버가 없다는 뜻이고, 그 제약이 여러 결정을 대신 내려줬다. CSP nonce는 애초에 쓸 수 없고, RSS feed는 `force-static` 라우트로 만들고, 검색 인덱스는 빌드된 HTML을 읽어야 하니 `postbuild` 단계에서 생성한다.

다이어그램은 필요할 때만, 클라이언트에서 그린다. Mermaid를 서버에서 렌더링하려면 headless 브라우저가 있어야 한다. 대신 다이어그램이 있는 글에서만 모듈을 불러오고, 그 다이어그램이 `IntersectionObserver`로 화면에 들어올 때만 그린다.

글 본문 HTML은 `rehype-sanitize`를 반드시 거친다. `dangerouslySetInnerHTML`이 받는 값은 `SanitizedHtml`이라는 branded type으로 좁혀져 있어서, sanitize를 거치지 않은 문자열은 타입 체크에서부터 걸린다.

디렉터리는 이렇게 나뉜다.

```
content/posts/       글 (Markdown)
src/
  app/               라우트. (site) 그룹이 공통 레이아웃을 감싼다
  lib/markdown/      Markdown 파이프라인 — 호스트를 모른다
  lib/               앱 계층: 파일 IO, 캐싱, RSS, SEO
  features/          post-toc · post-diagram · search · theme
  components/        UI. ui/는 shadcn, typography.tsx가 타입 primitive를 갖는다
  config/            site · navigation · integrations
```

문서는 세 개로 나눠 뒀다. `DESIGN.md`는 색상·타이포그래피·간격·컴포넌트 규칙을, `CONTENT.md`는 frontmatter 스키마와 작성 규칙을, `DEPLOY.md`는 컨테이너 배포와 캐시 정책, 보안 헤더를 담는다. lint, typecheck, test, build 네 개의 게이트가 모든 PR에서 돈다.

이 블로그에 쓰는 글은 대부분 구현하면서 실제로 마주친 질문과 그 답을 담는다. 왜 이 캐시 전략을 골랐는지, 왜 이 경계를 이렇게 그었는지, 나중에 조건이 바뀌면 무엇을 다시 볼지. True Log 자체가 그 기록의 첫 번째 대상이다.
