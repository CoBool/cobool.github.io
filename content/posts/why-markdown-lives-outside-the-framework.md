---
title: "Markdown을 프레임워크 밖으로 밀어낸 이유"
description: "Next.js를 쓰면서도 Markdown 처리 계층을 프레임워크와 분리한 이유와, 나중에 Astro 같은 다른 선택지로 옮길 수 있게 만든 경계에 대해."
date: "2026-08-29"
tags: ["true-log", "markdown", "architecture", "nextjs"]
category: "engineering"
draft: false
pinned: false
---

True Log는 지금 Next.js 위에서 돌아간다. 하지만 글을 읽고, frontmatter를 파싱하고, Markdown을 HTML로 바꾸는 코드는 Next.js를 모른다.

처음부터 이 경계를 의도적으로 만들었다.

블로그를 만들면서 가장 오래 고민한 건 어떤 Markdown 라이브러리를 쓸지가 아니었다. **콘텐츠를 현재 프레임워크에 얼마나 묶어 둘 것인가**가 더 중요한 문제였다.

지금은 Next.js가 맞는 선택이라고 생각한다. 하지만 블로그라는 제품만 놓고 보면 앞으로도 항상 Next.js가 최선이라고 장담할 이유는 없다. 나중에 Astro처럼 콘텐츠 중심 사이트에 더 잘 맞는 프레임워크로 옮기고 싶어질 수도 있다.

그때 글까지 다시 뜯어고치고 싶지는 않았다.

## Markdown은 콘텐츠 계층이다

현재 Markdown 처리 흐름은 대략 다음과 같다.

```text
Markdown
  ↓
frontmatter parsing
  ↓
remark
  ↓
rehype
  ↓
sanitize
  ↓
HTML
```

이 파이프라인의 입력은 Markdown 문자열이고 출력은 렌더링 가능한 결과다.

여기에는 App Router도 없고 React 컴포넌트도 없다. `next`, `react`, `node:*`, 프로젝트 alias 같은 호스트 의존성도 넣지 않는다.

즉 이 코드는 "Next.js에서 Markdown을 렌더링하는 코드"가 아니라 **Markdown을 처리하는 코드**다.

표현은 비슷하지만 경계는 꽤 다르다.

Next.js는 이 결과를 가져다가 페이지를 만들 뿐이다.

```text
content/posts/*.md
        ↓
Markdown pipeline
        ↓
normalized content
        ↓
Next.js
        ↓
static HTML
```

프레임워크는 콘텐츠를 소비하는 쪽에 있다.

## 왜 MDX를 쓰지 않았나

MDX는 편하다. Markdown 안에서 React 컴포넌트를 바로 사용할 수 있다.

하지만 그 편리함은 콘텐츠와 렌더러 사이의 결합이기도 하다.

예를 들어 글 안에 이런 코드가 쌓이기 시작하면,

```mdx
<Callout type="warning">
  이 API는 deprecated 됐다.
</Callout>
```

이 글은 더 이상 평범한 Markdown 문서가 아니다. 해당 컴포넌트와 MDX 런타임을 이해하는 환경이 필요하다.

블로그를 계속 Next.js로 운영한다면 별 문제가 아닐 수 있다. 반대로 프레임워크를 바꾸는 순간 콘텐츠 자체가 마이그레이션 대상이 된다.

나는 그 비용을 피하고 싶었다.

그래서 True Log에서는 글을 가능한 한 Markdown으로 남기고, 기능은 Markdown AST를 변환하는 쪽에서 해결한다.

콘텐츠가 애플리케이션 구현 세부사항을 알게 하지 않는 쪽을 택한 것이다.

## Astro로 옮긴다면 무엇이 바뀌나

이 구조가 실제로 의미가 있는지는 프레임워크를 바꾼다고 가정하면 더 분명해진다.

만약 어느 날 Next.js 대신 Astro를 선택한다면 바뀌어야 하는 건 주로 바깥쪽이다.

```text
현재
Markdown pipeline → Next.js → static HTML

이후
Markdown pipeline → Astro → static HTML
```

라우팅, 페이지 컴포넌트, 메타데이터 생성 방식, 빌드 설정은 다시 작성해야 할 것이다.

하지만 다음 부분은 그대로 가져갈 수 있다.

- frontmatter 해석
- remark 플러그인
- rehype 플러그인
- heading 추출과 TOC 데이터 생성
- HTML sanitize 정책
- Markdown 관련 테스트

그리고 더 중요한 것이 있다.

**기존 글을 수정할 필요가 없다.**

프레임워크 교체 비용을 없앨 수는 없지만, 최소한 콘텐츠와 콘텐츠 처리 규칙까지 같이 끌려가지 않게 만들 수 있다.

## 경계는 문서가 아니라 테스트로 강제한다

"Markdown 계층에서는 Next.js를 import하지 않는다"라고 README에 써 놓는 것만으로는 별 의미가 없다.

몇 달 뒤 급하게 기능 하나 추가하다 보면 이런 import는 너무 쉽게 들어온다.

```ts
import { something } from "next/...";
```

그래서 True Log에서는 Markdown 모듈이 어떤 의존성을 사용할 수 있는지 테스트로 제한한다.

허용된 의존성 외의 import가 들어오면 테스트가 실패한다.

이건 코드 스타일을 위한 규칙이라기보다 아키텍처 경계를 유지하기 위한 장치다.

TypeScript도 이 문제를 대신 해결해 주지 않는다. 타입이 맞는 것과 의존 방향이 맞는 것은 다른 문제다.

## 프레임워크 독립성이 목표는 아니다

여기서 한 가지는 구분할 필요가 있다.

나는 모든 코드를 프레임워크 독립적으로 만들고 싶은 것이 아니다.

페이지와 라우팅은 Next.js에 적극적으로 의존한다. `generateStaticParams`, metadata, static export 같은 기능도 그대로 사용한다.

프레임워크를 선택했으면 프레임워크가 잘하는 일은 그냥 맡기는 편이 낫다. 추상화를 위해 추상화를 만들기 시작하면 결국 아무 프레임워크도 제대로 사용하지 못하는 기묘한 자체 프레임워크가 태어난다. 소프트웨어 업계가 이미 충분히 많이 만들어 낸 종류의 생명체다.

분리한 것은 **수명이 다를 가능성이 높은 것들**이다.

애플리케이션 프레임워크는 바뀔 수 있다.

하지만 내가 쓴 글과 Markdown을 해석하는 규칙은 그보다 오래 남을 가능성이 높다.

그래서 둘을 같은 경계 안에 두지 않았다.

## 지금의 선택을 미래의 의무로 만들지 않기

아키텍처에서 미래를 완벽하게 예측할 수는 없다.

Astro로 실제 이전하지 않을 수도 있다. 몇 년 뒤에는 전혀 다른 선택지가 나올 수도 있다.

그래도 현재 선택이 미래의 선택지를 불필요하게 없애지 않도록 만들 수는 있다.

True Log에서 Markdown을 프레임워크 밖으로 밀어낸 이유도 그것이다.

Next.js를 덜 사용하기 위해서가 아니다.

**Next.js를 선택한 것과 콘텐츠의 소유권을 Next.js에 넘기는 것은 다른 문제라고 생각했기 때문이다.**

지금은 Next.js가 사이트를 만든다.

Markdown은 그냥 Markdown으로 남는다.
