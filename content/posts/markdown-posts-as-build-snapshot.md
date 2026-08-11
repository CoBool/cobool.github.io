---
title: "Markdown Posts를 빌드 스냅샷으로 보기"
description: "반복 파일 읽기에서 시작해 getAllPosts 캐시 모델을 정한 기록."
date: "2026-08-10"
tags: ["markdown", "cache", "architecture", "nextjs"]
category: "engineering"
draft: false
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

이 문제를 막으려면 fingerprint를 둘 수 있다. 파일명과 수정 시간을 묶어 현재 posts 디렉터리의 상태를 만들고, 이전 값과 다르면 다시 읽는 방식이다. 처음에는 이 정도까지는 과하다고 보고 접어 뒀다. dev 서버를 재시작하면 되는 문제라고 생각했다.

그런데 실제로 글을 쓰면서 써 보니 그 제약이 생각보다 거슬렸다. `content/*.md`는 모듈 그래프 밖에 있는 파일이라 dev 서버의 HMR이 변경을 감지하지 못한다. frontmatter 하나 고칠 때마다 서버를 껐다 켜는 흐름은 draft를 계속 들여다보며 다듬는 작업과 잘 맞지 않았다. 그래서 결국 fingerprint 방식을 다시 꺼냈다.

다만 이 검사는 development에서만 켠다. `NODE_ENV === "development"`일 때만 디렉터리를 다시 훑어 파일명과 mtime으로 스냅샷 키를 만들고, 이전 키와 다르면 다시 읽는다. production과 test는 여전히 프로세스당 한 번만 읽는 단순한 캐시를 쓴다. 정적 export 빌드는 어차피 한 번 실행되고 끝나는 프로세스라, 그 안에서는 fingerprint를 확인할 이유가 없다.

대신 draft preview는 별도로 열어 두었다. `draft: true`인 글은 production과 test에서는 계속 숨기지만, development에서는 목록과 상세 페이지에서 볼 수 있게 했다. 비공개 글을 쓰면서 실제 화면을 확인하려고 매번 frontmatter를 바꾸는 쪽이 더 위험하다.

대신 `Object.freeze`는 남겼다. 이건 다른 문제를 막는다. 캐시된 배열이나 post 객체, tags 배열을 누군가 런타임에서 바꾸면 이후 호출에도 그 오염이 남는다. TypeScript의 `readonly`는 컴파일 타임 약속이고, 런타임을 막아 주지는 않는다. 그래서 캐시로 돌려줄 값은 얼려 둔다.

이번 선택은 이렇다.

```ts
if (process.env.NODE_ENV === "development") {
  const cacheKey = readDirectorySnapshotKey(POSTS_DIRECTORY)

  if (cachedPosts === undefined || cacheKey !== developmentCacheKey) {
    cachedPosts = readPostsFromDirectory()
    developmentCacheKey = cacheKey
  }

  return cachedPosts
}

cachedPosts ??= readPostsFromDirectory()
return cachedPosts
```

그리고 읽어 온 배열과 post snapshot은 freeze한다.

이 선택은 “캐시를 최대한 똑똑하게 만들자”가 아니다. 운영 모델에 맞는 만큼만 fingerprint를 켜자는 쪽에 가깝다. 정적 export 빌드에서는 포스트 목록이 빌드 스냅샷처럼 움직이니 프로세스당 한 번이면 충분하고, dev 서버에서는 파일이 실제로 바뀔 때만 다시 읽으면 된다. 두 환경을 같은 규칙으로 묶기보다, 환경마다 필요한 만큼만 캐시 무효화를 켜는 쪽을 택했다.

나중에 조건이 바뀌면 결정도 바뀐다. DB가 붙거나 preview mode가 생기거나 글 편집 화면에서 즉시 반영이 필요해지면 module cache보다 framework cache가 낫다. 그때는 `use cache`, ISR, route cache, `revalidateTag`, `revalidatePath` 같은 도구가 더 자연스럽다.

지금은 환경별로 필요한 만큼만 무효화를 켠다. production과 test의 Markdown posts는 프로세스 생명주기 동안 빌드 스냅샷처럼 다루고, development는 파일 상태가 바뀌면 스냅샷을 다시 뜬다.
