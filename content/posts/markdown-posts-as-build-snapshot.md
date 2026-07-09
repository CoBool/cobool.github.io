---
title: "Markdown Posts를 빌드 스냅샷으로 보기"
description: "반복 파일 읽기에서 시작해 getAllPosts 캐시 모델을 정한 기록."
date: "2026-07-09"
tags: ["markdown", "cache", "architecture", "nextjs"]
category: "engineering"
draft: true
pinned: false
---

처음에는 캐시가 없었다.

`getAllPosts()`는 호출될 때마다 posts 디렉터리를 읽고, Markdown 파일을 열고, frontmatter를 파싱했다. 글이 20개 남짓인 지금은 큰 문제가 아니다. 빌드가 느리다고 느낄 정도도 아니고, 구조를 복잡하게 만들 이유도 없어 보였다.

그래도 그대로 두기에는 애매했다. 글 목록은 한 군데에서만 쓰이지 않는다. 홈, 전체 글 목록, 상세 페이지의 정적 경로 생성, sitemap, RSS feed, 태그와 카테고리 화면까지 같은 데이터가 반복해서 필요하다. 페이지가 늘고 글이 늘면 같은 프로세스 안에서 같은 Markdown 파일을 여러 번 읽게 된다.

이건 당장 고쳐야 하는 병목이라기보다, 오래 두면 습관이 되는 비효율에 가까웠다. Markdown 기반 정적 블로그라면 포스트 목록은 대부분 한 번 읽은 뒤 같은 스냅샷으로 다뤄도 된다. 그래서 `getAllPosts()`에 작은 module cache를 붙이기로 했다.

처음 구현은 이 정도면 충분했다.

```ts
cachedPosts ??= readPostsFromDirectory()
return cachedPosts
```

이 방식은 기본 포스트 목록을 한 번만 읽고, 이후에는 같은 배열을 돌려준다. 별도 캐시 계층도 없고, Next.js cache API도 쓰지 않는다. 지금 True Log의 운영 방식과 잘 맞는다. Markdown 글은 빌드할 때 읽히고, export 결과가 배포된다. 글이 바뀌면 다시 빌드하면 된다.

그런데 캐시를 넣는 순간 다른 질문이 따라왔다. 개발 서버가 켜진 상태에서 글을 수정하면 어떻게 될까. `draft: false`였던 글을 `draft: true`로 바꾸면 이미 읽어 둔 캐시 안에 남아 있을 수 있다. 새 글을 추가하거나 파일을 지워도 같은 문제가 생긴다.

이 문제를 막으려면 fingerprint를 둘 수 있다. 파일명, 수정 시간, 크기를 묶어 현재 posts 디렉터리의 상태를 만들고, 이전 값과 다르면 다시 읽는 방식이다. 실제로 이 방향도 잠깐 구현했다. 더 안전하고, 오래 떠 있는 서버나 preview 환경에서는 설득력이 있다.

하지만 지금 단계에서는 접었다. True Log는 아직 DB도, CMS도, editor workflow도 없다. 콘텐츠는 런타임 데이터라기보다 빌드 입력에 가깝다. 개발 중 변경 사항을 바로 보고 싶다면 dev 서버를 재시작하면 된다. 이 정도 제약은 받아들일 수 있다.

대신 draft preview는 별도로 열어 두었다. `draft: true`인 글은 production과 test에서는 계속 숨기지만, development에서는 목록과 상세 페이지에서 볼 수 있게 했다. 비공개 글을 쓰면서 실제 화면을 확인하려고 매번 frontmatter를 바꾸는 쪽이 더 위험하다.

대신 `Object.freeze`는 남겼다. 이건 다른 문제를 막는다. 캐시된 배열이나 post 객체, tags 배열을 누군가 런타임에서 바꾸면 이후 호출에도 그 오염이 남는다. TypeScript의 `readonly`는 컴파일 타임 약속이고, 런타임을 막아 주지는 않는다. 그래서 캐시로 돌려줄 값은 얼려 둔다.

이번 선택은 이렇다.

```ts
cachedPosts ??= readPostsFromDirectory()
return cachedPosts
```

그리고 읽어 온 배열과 post snapshot은 freeze한다.

이 선택은 “캐시를 최대한 똑똑하게 만들자”가 아니다. 지금 운영 모델에 맞는 만큼만 캐시하자는 쪽에 가깝다. 정적 export 블로그에서는 포스트 목록이 빌드 스냅샷처럼 움직인다. draft는 개발 중 확인할 수 있게 열어 두고, 캐시된 파일 변경을 다시 읽어야 할 때는 서버를 재시작한다. 그 단순한 규칙이 fingerprint보다 읽기 쉽다.

나중에 조건이 바뀌면 결정도 바뀐다. DB가 붙거나 preview mode가 생기거나 글 편집 화면에서 즉시 반영이 필요해지면 module cache보다 framework cache가 낫다. 그때는 `use cache`, ISR, route cache, `revalidateTag`, `revalidatePath` 같은 도구가 더 자연스럽다.

지금은 똑똑한 invalidation보다 명확한 운영 모델을 택한다. Markdown posts는 프로세스 생명주기 동안 빌드 스냅샷처럼 다룬다.
