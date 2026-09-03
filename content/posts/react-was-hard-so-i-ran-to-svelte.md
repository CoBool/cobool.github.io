---
title: "React가 어려워 Svelte로 도망쳤는데, 낙원은 없었다"
description: "React가 어려워 Svelte로 갔지만, 프레임워크를 바꾼다고 고민 자체가 사라지는 것은 아니었다. Svelte 5와 SvelteKit을 직접 써보며 느낀 단순함, 선택 비용, 그리고 결국 Next.js로 돌아온 이유."
date: "2026-09-03"
tags: ["svelte", "sveltekit", "react", "nextjs", "frontend"]
category: "engineering"
draft: false
pinned: false
---

React가 어려웠다.

상태를 어떻게 관리해야 하는지, `useEffect`는 언제 써야 하는지, 전역 상태가 필요하면 Context를 쓸지 다른 라이브러리를 가져올지. 무언가 하나를 만들려고 하면 기능 자체보다 먼저 생각해야 할 것이 많다고 느꼈다.

그래서 Svelte로 도망갔다.

Svelte는 더 단순하다고 들었다. 컴파일러가 많은 일을 대신해주고, React보다 개발자가 신경 써야 할 것도 적을 거라고 생각했다.

새로운 프레임워크를 공부해보고 싶다는 생각도 있었다.

지금 다시 생각해보면 조금 뻔한 결론에 도착한다.

**도망친 곳에 낙원은 없었다.**

Svelte가 나빴다는 이야기는 아니다.

오히려 Svelte와 SvelteKit을 사용한 경험은 꽤 재미있었고, React보다 훨씬 편하다고 느낀 부분도 있었다.

다만 직접 프로젝트를 만들어보니 프레임워크를 바꾼다고 해서 내가 고민해야 할 문제까지 사라지는 것은 아니었다.

## 생각보다 React와 크게 다르지 않았다

Svelte를 처음 사용했을 때 의외였던 점은 코드의 양이었다.

React와 비교하면 훨씬 적은 코드로 개발할 수 있을 거라고 생각했는데, 실제로 사용해보니 체감할 정도로 압도적인 차이가 있다고 느끼지는 못했다.

물론 두 프레임워크의 동작 방식은 다르다.

Svelte는 컴파일러를 적극적으로 활용해 애플리케이션을 변환하고, React는 React만의 렌더링 모델을 가지고 있다. 내부 동작 방식까지 둘이 비슷하다는 이야기는 아니다.

하지만 애플리케이션을 만드는 개발자의 입장에서는 결국 비슷한 종류의 문제를 고민하게 됐다.

상태가 있고, 그 상태에서 계산되는 값이 있고, 상태 변화에 따라 실행해야 하는 작업이 있다.

특히 Svelte 5의 Runes를 사용하면서 이런 느낌이 강해졌다.

```svelte
<script>
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(count);
});
</script>
```

`$state`, `$derived`, `$effect`를 React Hooks와 같은 기술이라고 볼 수는 없다. Runes는 Svelte의 반응성 모델을 표현하기 위한 문법이고 React Hooks는 React의 컴포넌트와 렌더링 모델 안에서 사용되는 API다.

하지만 개발하는 입장에서는 익숙한 질문을 다시 만나게 됐다.

이 값은 상태인가.

다른 상태에서 계산할 수 있는 값인가.

상태 변화에 따라 실행해야 하는 부수 효과인가.

표현하는 방법은 달라졌지만 이런 판단 자체가 사라진 것은 아니었다.

그렇다고 개발 경험까지 같았다는 뜻은 아니다.

개인적으로 Runes를 사용하는 경험은 React Hooks보다 훨씬 편했다.

다만 내가 Svelte를 선택하면서 기대했던 것은 단순히 문법이 편해지는 것 이상이었던 것 같다.

**문법이 단순해지는 것과 프로그래밍 모델이 단순해지는 것은 다른 문제였다.**

Svelte 공식 문서도 Svelte 5의 반응성 모델을 `$state`, `$derived`, `$effect` 같은 Runes를 중심으로 설명한다.

- [Svelte Docs: What are runes?](https://svelte.dev/docs/svelte/what-are-runes)
- [Svelte Docs: $state](https://svelte.dev/docs/svelte/$state)
- [Svelte Docs: $derived](https://svelte.dev/docs/svelte/$derived)
- [Svelte Docs: $effect](https://svelte.dev/docs/svelte/$effect)

## Svelte는 React를 닮아가고, React는 Svelte를 닮아간다

두 프레임워크를 사용하면서 재미있다고 느낀 부분도 있었다.

서로 다른 철학에서 출발했는데 최근에는 묘하게 상대방이 있던 영역으로 접근하는 것처럼 보였다.

Svelte 5에서는 Runes가 도입되면서 상태와 반응성을 `$state`, `$derived`, `$effect`처럼 명시적으로 표현한다. 기존 Svelte의 반응성 모델과 비교하면 개발자가 상태의 성격을 코드에서 보다 직접적으로 드러내는 방향이다.

반대편에서는 React Compiler가 등장했다.

React에서는 성능 최적화를 위해 개발자가 직접 `useMemo`나 `useCallback`을 사용하던 경우가 많았다. React 공식 문서는 React Compiler가 빌드 시점에 자동으로 memoization을 적용해 이런 수동 최적화의 필요성을 줄인다고 설명하고, 새로운 코드에서는 필요한 경우를 제외하면 compiler에 memoization을 맡기는 방향을 권장한다.

- [React Docs: React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)
- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: useCallback](https://react.dev/reference/react/useCallback)

물론 이것만으로 React와 Svelte가 같은 프레임워크가 되어가고 있다고 말할 수는 없다.

두 프레임워크의 내부 구조와 철학에는 여전히 큰 차이가 있다.

그래도 개발자의 입장에서 바라보면 재미있는 변화다.

**Svelte는 상태와 반응성을 더 명시적으로 표현하는 방향으로 움직이고 있고, React는 개발자가 직접 처리하던 최적화의 일부를 컴파일러에게 넘기는 방향으로 움직이고 있다.**

서로 다른 곳에서 출발했는데 개발자가 작성하는 코드에서는 조금씩 상대방의 영역을 바라보는 것처럼 느껴졌다.

## 명확하게 나뉜 SvelteKit의 구조

SvelteKit을 처음 사용하면서 마음에 들었던 것 중 하나는 파일의 역할이 비교적 명확하게 나뉜다는 점이었다.

```text
+page.svelte
+page.ts
+page.server.ts
+layout.svelte
+server.ts
```

파일 이름만 봐도 어느 정도 역할을 예상할 수 있다.

페이지를 담당하는 파일과 데이터를 불러오는 파일, 서버에서만 실행되는 파일의 경계가 구조에서 드러난다.

처음에는 이런 방식이 상당히 마음에 들었다.

그런데 사용하다 보니 또 다른 고민이 생겼다.

**그래서 지금 작성하려는 코드는 어디에 있어야 하지?**

역할이 나뉘어 있다는 것과 그 역할을 이해하지 않아도 된다는 것은 전혀 다른 문제였다.

어느 상황에서 `+page.ts`를 사용하고 어느 상황에서 `+page.server.ts`를 사용해야 하는지 결국 개발자가 이해해야 했다.

편하다기보다는 **구분감이 좋다**는 표현이 내 경험에는 더 가까웠다.

SvelteKit의 구조가 불편했던 것은 아니다.

다만 명시적인 구조가 곧 낮은 학습 비용을 의미하는 것은 아니었다.

- [SvelteKit Docs: Routing](https://svelte.dev/docs/kit/advanced-routing)
- [SvelteKit Docs: Loading data](https://svelte.dev/docs/kit/load)

## Svelte에서 편했던 것은 선택하지 않아도 되는 순간이었다

Svelte를 사용하면서 React보다 편하다고 느낀 부분도 분명히 있었다.

대표적인 것이 상태 관리였다.

React에서는 애플리케이션의 상태를 여러 컴포넌트에서 공유해야 할 때 여러 선택지가 생긴다. React 자체의 Context를 사용할 수도 있고, 프로젝트가 커지면 별도의 상태 관리 도구를 선택할 수도 있다.

선택지가 많다는 것은 React 생태계의 강점이다.

하지만 개인 프로젝트에서는 그 선택 자체가 일이 되기도 한다.

Svelte에서는 반응성 시스템과 store가 기본적으로 제공됐고, Svelte 5에서는 Runes가 도입되면서 공유 상태를 구성하는 방법도 더 다양해졌다.

기존 `svelte/store`가 사라진 것은 아니다. Svelte 공식 문서도 stores를 여전히 제공한다. 다만 Runes를 사용하면 `.svelte.js`나 `.svelte.ts` 같은 모듈에서도 반응형 상태를 구성할 수 있어, 예전처럼 많은 상황에서 store를 먼저 선택할 필요는 줄었다.

- [Svelte Docs: Stores](https://svelte.dev/docs/svelte/stores)
- [Svelte Docs: .svelte.js and .svelte.ts files](https://svelte.dev/docs/svelte/svelte-js-files)

이런 부분에서는 Svelte가 상당히 편했다.

외부 라이브러리를 먼저 찾아보기보다 Svelte가 제공하는 방식으로 문제를 해결할 수 있었다.

**선택할 수 있다는 자유보다 선택하지 않아도 된다는 편안함이 더 크게 느껴지는 순간이 있었다.**

## 문제는 막혔을 때였다

Svelte 5를 사용하면서 가장 불편했던 부분은 프레임워크 자체가 아니었다.

**최신 정보를 찾는 일이 생각보다 어려웠다.**

Svelte 5에서는 Runes를 중심으로 반응성 모델에 큰 변화가 있었다.

기존 `svelte/store`도 여전히 사용할 수 있지만 Runes가 등장하면서 공유 상태를 구성하는 선택지가 달라졌고, SvelteKit에서도 기존 `$app/stores` 대신 `$app/state`가 도입되는 등 변화가 있었다.

- [SvelteKit Docs: $app/state](https://svelte.dev/docs/kit/$app-state)
- [SvelteKit Docs: $app/stores](https://svelte.dev/docs/kit/$app-stores)

문제는 검색해서 나오는 자료 상당수가 이전 버전을 기준으로 작성되어 있다는 점이었다.

내가 Svelte 5의 방법을 찾고 있어도 검색 결과에서는 Svelte 4를 기준으로 한 store 예제가 나왔다.

결국 답을 찾은 뒤에도 지금 사용하는 버전에 맞는 방법인지 다시 확인해야 했다.

AI를 사용하면서도 비슷한 경험을 했다.

Svelte 5에 대해 질문했는데 이전 Svelte 방식이 섞인 답변을 받는 경우가 있었다.

그래서 React나 Next.js를 사용할 때보다 AI가 만들어준 코드를 한 번 더 확인하게 됐다.

이것을 단순히 Svelte의 생태계가 작기 때문에 AI가 Svelte를 잘 다루지 못한다고 일반화할 수는 없다. AI 모델이 어떤 데이터를 얼마나 학습했는지 정확히 알 수도 없고, 사용하는 모델이나 시점에 따라서도 결과는 달라진다.

다만 내가 Svelte 5를 사용했던 시점의 개발 경험에서는 분명한 차이가 있었다.

**Svelte의 코드를 작성하는 것은 React보다 편했지만, Svelte에서 막혔을 때 문제를 해결하는 과정까지 항상 더 편한 것은 아니었다.**

프레임워크의 문법적인 단순함과 실제 개발 과정 전체의 단순함은 같은 것이 아니었다.

## 캐싱에서 다시 만난 선택의 문제

SvelteKit으로 프로젝트를 만들면서 캐싱을 설계할 때도 비슷한 생각을 했다.

처음에는 Next.js의 캐싱과 SvelteKit의 캐싱을 단순하게 비교했다.

하지만 두 프레임워크의 캐싱을 특정 저장 방식으로 나눠 비교하는 것은 정확하지 않다.

Next.js 역시 버전과 렌더링 방식에 따라 캐싱 모델이 달라지고, SvelteKit에서도 HTTP 캐시를 비롯한 여러 전략을 사용할 수 있다.

차이는 특정 캐시 기술보다는 프레임워크를 사용하면서 받은 인상에 가까웠다.

Next.js는 캐싱에 대해 프레임워크 차원의 모델과 API를 적극적으로 제공한다. 개발자는 그 모델을 이해해야 하지만 일단 이해하고 나면 Next.js가 제시하는 방식 안에서 캐싱 전략을 구성할 수 있다.

반면 SvelteKit을 사용하면서는 애플리케이션에 필요한 캐싱 전략을 내가 조금 더 직접 결정해야 한다고 느꼈다.

처음에는 후자가 자유롭다고 생각했다.

실제로 자유롭다.

문제는 자유가 결국 내가 결정해야 할 것이 하나 더 늘어난다는 의미이기도 했다는 것이다.

어디에서 캐시할지.

얼마나 유지할지.

언제 무효화할지.

어떤 저장 방식을 사용할지.

직접 설계할 수 있다는 것은 분명 장점이다.

하지만 내가 만들고 싶은 것이 캐싱 시스템 자체가 아니라면 이야기가 달라진다.

그때부터 한 가지 생각을 하게 됐다.

**프레임워크가 내 선택을 제한하는 것이 항상 단점일까?**

어떤 경우에는 합리적인 기본값과 명확한 방법을 프레임워크가 제시하는 것도 생산성의 일부일 수 있다.

Next.js의 현재 캐싱 모델 역시 단순하지는 않다. 여기서 말하고 싶은 것은 어느 쪽 캐시가 더 우월하다는 이야기가 아니라, 프레임워크가 문제에 대해 얼마나 강한 기본 모델을 제시하느냐의 차이다.

- [Next.js Docs: Caching](https://nextjs.org/docs/app/guides/caching)
- [Next.js Docs: Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [SvelteKit Docs: Headers](https://svelte.dev/docs/kit/load#Setting-headers)

## 그래서 결국 Next.js를 선택했다

SvelteKit을 사용하면서 결정적인 문제가 하나 있어서 포기한 것은 아니다.

성능이 부족했던 것도 아니고 개발 경험이 나빴던 것도 아니다.

오히려 재미있었다.

Runes도 편했고 SvelteKit의 구조도 흥미로웠다. 프레임워크 자체에서 제공하는 기능만으로 해결할 수 있는 문제가 많다는 것도 마음에 들었다.

그런데 프로젝트를 계속 만들면서 한 가지 질문에 답하기 어려웠다.

> **내가 굳이 SvelteKit을 선택해야 하는 이유가 무엇일까?**

새로운 방식을 배우는 즐거움은 있었다.

하지만 실제 프로젝트를 완성하고 유지하는 입장에서는 그것만으로 기술을 선택하기 어려웠다.

생태계가 얼마나 성숙했는지.

필요한 정보를 얼마나 쉽게 찾을 수 있는지.

AI를 포함한 개발 도구를 얼마나 안정적으로 활용할 수 있는지.

프레임워크가 프로젝트에서 반복적으로 발생하는 문제에 얼마나 많은 기본적인 선택을 제공하는지.

이런 것까지 함께 봐야 했다.

그 모든 것을 놓고 봤을 때 나에게는 Next.js가 더 현실적인 선택이었다.

## 다시 개인 프로젝트를 만든다면

지금 새로운 개인 프로젝트를 시작한다면 무엇을 선택할까.

아마 다시 Next.js를 선택할 것 같다.

그렇다고 SvelteKit을 사용한 것을 후회하지는 않는다.

오히려 React만 사용했다면 당연하다고 생각했을 것들을 다시 보게 됐다.

왜 상태를 이렇게 표현하는지.

왜 프레임워크가 어떤 기능을 기본으로 제공하는지.

왜 어떤 프레임워크는 개발자에게 선택권을 주고, 다른 프레임워크는 강한 기본값을 제공하는지.

같은 문제를 다른 방식으로 해결하는 프레임워크를 사용해보니 내가 익숙해서 사용하던 것과 실제로 좋은 선택이라고 판단해서 사용하는 것을 조금은 구분할 수 있게 됐다.

그래서 React 개발자에게 SvelteKit을 추천하겠느냐고 묻는다면 답은 **그렇다**다.

다만 이유는 SvelteKit이 React나 Next.js보다 좋기 때문이 아니다.

**다른 방식으로 같은 문제를 해결해보는 경험 자체가 가치 있기 때문이다.**

다음 프로젝트에서도 SvelteKit을 선택할 것이냐고 묻는다면 지금은 Next.js를 선택하겠다.

조금 모순적으로 들리지만 둘은 동시에 성립한다.

결국 React가 어려워서 Svelte로 도망쳤지만 낙원은 없었다.

대신 다른 동네를 한 바퀴 돌아보고 나니, 원래 살던 동네가 왜 그렇게 생겼는지는 전보다 조금 더 잘 알게 됐다.

## 출처

- [Svelte Docs: What are runes?](https://svelte.dev/docs/svelte/what-are-runes)
- [Svelte Docs: Stores](https://svelte.dev/docs/svelte/stores)
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [React Docs: React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)
- [Next.js Docs: Caching](https://nextjs.org/docs/app/guides/caching)

> 이 글은 필자의 실제 개발 경험을 바탕으로 작성했으며, 기술적 사실과 API 동작은 각 프로젝트의 공식 문서를 기준으로 교차 확인했다. 초안 정리와 문장 교정에는 AI 도구를 활용했다.
