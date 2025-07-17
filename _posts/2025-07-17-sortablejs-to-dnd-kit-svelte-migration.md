---
title: "DOM 조작 vs 상태 기반: Svelte 5 드래그 앤 드롭 라이브러리 마이그레이션 실전 기록"
description: >-
  SortableJS에서 dnd-kit-svelte로 마이그레이션하며 겪은 시행착오와 해결 과정을 상세히 기록했습니다. 
  DOM 조작 방식과 상태 기반 접근법의 근본적 차이점과 올바른 라이브러리 선택의 중요성을 다룹니다.
date: 2025-07-17 10:00:00 +0900
categories: [웹 개발, Svelte]
tags: [svelte, svelte5, drag-and-drop, sortablejs, dnd-kit, migration, frontend]
pin: false
math: false
mermaid: false
author: Boolean
---

## 들어가며

혹시 드래그 앤 드롭 기능을 구현하다가 "왜 가끔 되고 가끔 안 되지?"라는 경험이 있으신가요? 저도 그랬습니다. SortableJS와 Svelte 5를 함께 사용하면서 예측 불가능한 동작에 며칠을 고생했거든요.

이 글은 **SortableJS의 한계를 깨닫고 dnd-kit-svelte로 마이그레이션한 실전 기록**입니다. 단순한 라이브러리 교체가 아니라, DOM 조작 방식과 상태 기반 접근법의 근본적 차이를 이해하는 여정이었습니다.

### ✨ 이 글에서 배울 것들
- 🚨 **SortableJS와 Svelte가 잘 안 맞는 이유**
- 🔍 **DOM 조작 vs 상태 기반 접근법의 차이점**  
- 🛠 **dnd-kit-svelte 마이그레이션 실전 과정**
- 💡 **프레임워크 철학에 맞는 라이브러리 선택의 중요성**

---

## 🚨 문제의 시작: "왜 SortableJS와 Svelte는 잘 안 맞을까?"

### 예측 불가능한 동작들

Todo 앱에 드래그 앤 드롭 기능을 추가하면서 이상한 현상들을 발견했습니다:

```javascript
// 이런 상황들이 반복되었어요
✅ 전체 목록에서는 잘 동작
❌ 필터링된 상태에서는 순서가 뒤바뀜
✅ 새로고침하면 또 잘 동작
❌ 몇 번 드래그하면 다시 이상해짐
```

**"제대로 될 때가 있고 안 될 때가 있는"** 이 예측 불가능한 동작이 가장 큰 문제였습니다.

### 복잡해지는 인덱스 매핑 로직

문제를 해결하려고 이런 복잡한 코드를 작성했습니다:

```javascript
function reorderTodos(evt) {
    const { oldIndex, newIndex } = evt;
    
    // 현재 필터 상태에 따라 다른 배열 참조
    const currentFiltered = filter === "all" 
        ? todos 
        : filter === "active" 
            ? todos.filter(todo => !todo.completed)
            : todos.filter(todo => todo.completed);
    
    // 복잡한 인덱스 매핑...
    const realOldIndex = todos.findIndex(todo => 
        todo.id === currentFiltered[oldIndex].id
    );
    const realNewIndex = todos.findIndex(todo => 
        todo.id === currentFiltered[newIndex].id
    );
    
    // 배열 재정렬
    const [removed] = todos.splice(realOldIndex, 1);
    todos.splice(realNewIndex, 0, removed);
    
    // 상태 업데이트 강제 실행
    todos = [...todos];
}
```

> **이 코드를 보면서 "뭔가 잘못되었다"는 직감이 들었습니다.** 
> 단순한 드래그 앤 드롭이 이렇게 복잡할 리가 없거든요.

---

## 🔍 문제의 근본 원인 파악

### SortableJS의 동작 방식

문제의 핵심은 **SortableJS의 DOM 우선 접근법**에 있었습니다:

```
SortableJS 동작 순서:
1. DOM 요소를 먼저 이동 🏃‍♂️
2. 이벤트 콜백으로 상태 동기화 요청 📞
3. 상태 변경으로 인한 리렌더링 🔄
4. DOM과 상태 간 불일치 발생 ⚠️
```

### Svelte의 반응성 시스템과의 충돌

Svelte는 **상태 우선 접근법**을 사용합니다:

```
Svelte 반응성 시스템:
1. 상태 변경 감지 📊
2. 컴파일 타임에 최적화된 업데이트 코드 생성 🔍
3. 필요한 DOM 업데이트만 실행 ✨
4. 일관된 상태 유지 ✅
```

**두 접근법이 서로 충돌**하면서 예측 불가능한 동작이 발생했던 것입니다.

### 다양한 해결 시도들

이런 방법들을 시도해봤지만 모두 실패했습니다:

❌ **복잡한 인덱스 매핑 로직**
```javascript
// 필터 상태별로 다른 인덱스 계산
// → 코드 복잡도 증가, 버그 양산
```

❌ **DOM 순서 기반 상태 동기화**
```javascript
// DOM 요소 순서를 읽어서 상태 재구성
// → 성능 저하, 여전한 불일치
```

❌ **필터링 상태에서 드래그 비활성화**
```javascript
// 필터링 중에는 드래그 금지
// → 사용자 경험 저하
```

---

## 🛠 더 나은 해결책을 찾아서

### 업계 표준 조사

다른 프레임워크에서는 어떻게 해결하고 있을까요?

**React 생태계:**
- `react-beautiful-dnd`: 상태 우선 접근
- `@dnd-kit/core`: 현대적 상태 기반 설계
- 공통점: **DOM 조작보다 상태 관리에 집중**

**Vue 생태계:**
- `vue-draggable-next`: 상태 기반 접근
- `@vueuse/integrations`: 컴포지션 API 활용

> **핵심 깨달음**: 대부분의 현대적 드래그 앤 드롭 라이브러리는 **"상태 우선"** 접근 방식을 채택하고 있었습니다.

### 라이브러리 포팅의 이해

React의 `@dnd-kit`이 Svelte로 포팅된 `dnd-kit-svelte`를 발견했습니다:

**포팅의 장점:**
- ✅ 검증된 아키텍처 기반
- ✅ 프레임워크별 반응성 시스템에 최적화
- ✅ 상태 기반 접근법으로 일관성 보장

### 후보군 비교

| 라이브러리 | Svelte 5 지원 | 접근 방식 | 특징 |
|------------|---------------|-----------|------|
| **dnd-kit-svelte** | ✅ | 상태 기반 | 검증된 아키텍처, sortable 지원 |
| @thisux/sveltednd | ✅ | 상태 기반 | 간단한 구현, sortable 미지원 |
| svelte-dnd-action | ❌ | 상태 기반 | 레거시, 업데이트 중단 |

**선택 기준:**
1. ✅ **Svelte 5 runes 완전 지원**
2. ✅ **상태 기반 접근 방식**
3. ✅ **검증된 아키텍처 기반**
4. ✅ **sortable 기능 지원** (thisux/sveltednd는 sortable 미지원)

---

## ⚡ 마이그레이션 실전 과정

### 설치와 초기 설정

```bash
npm uninstall sortablejs
npm install dnd-kit-svelte
```

### 기술적 도전과제들

**1. dnd-kit-svelte API 학습**
```javascript
// React 스타일
const {attributes, listeners, setNodeRef} = useSortable({
    id: item.id,
    data: item
});

// Svelte 스타일  
const {attributes, listeners, setNodeRef} = useSortable({
    id: item.id,
    data: () => item  // 함수로 전달!
});
```

### 발생한 오류들과 해결

**1. 504 Outdated Optimize Dep**
```bash
# 문제: Vite 캐시 문제
# 해결: 개발 서버 재시작
npm run dev -- --force
```

**2. resizeObserverConfig 누락**
```javascript
// 문제: API 변경사항 미반영
// 해결: 최신 문서 참조하여 설정 추가
const dndContext = createDndContext({
    resizeObserverConfig: { box: 'border-box' }
});
```

**3. bind:this 오류**
```svelte
<!-- 문제: 초기 문서에서 제안된 방법이 작동하지 않음 -->
<div bind:this={node.current}>

<!-- 해결: 최신 릴리즈 0.0.10에서 정상 작동 확인 -->
<div bind:this={setNodeRef}>
```

### 핵심 차이점 이해

**React vs Svelte API 차이:**

```javascript
// React
const {attributes} = useSortable({data: item});
return <div {...attributes}>

// Svelte  
const {attributes} = useSortable({data: () => item});
// 템플릿에서
{...attributes.current}  // .current 접근자 필요
```

### 최종 구현 코드

```svelte
<script>
import { createDndContext, useSortable, DragOverlay } from 'dnd-kit-svelte';
import { arrayMove } from '@dnd-kit/sortable';

let todos = $state([
    { id: 1, text: "Learn Svelte 5", completed: false },
    { id: 2, text: "Build awesome app", completed: false }
]);

const dndContext = createDndContext();

function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
        const oldIndex = todos.findIndex(todo => todo.id === active.id);
        const newIndex = todos.findIndex(todo => todo.id === over.id);
        todos = arrayMove(todos, oldIndex, newIndex);
    }
}
</script>

<DndContext onDragEnd={handleDragEnd}>
    <SortableContext items={todos.map(t => t.id)}>
        {#each filteredTodos as todo (todo.id)}
            <TodoItem {todo} />
        {/each}
    </SortableContext>
</DndContext>
```

---

## 🎉 여정의 끝에서 얻은 것들

### 기술적 성과

**Before (SortableJS) vs After (dnd-kit-svelte)**

| 항목 | SortableJS | dnd-kit-svelte |
|------|------------|----------------|
| **상태 동기화** | ❌ 불일치 발생 | ✅ 완벽한 동기화 |
| **필터링 지원** | ❌ 복잡한 매핑 | ✅ 자연스러운 동작 |
| **예측 가능성** | ❌ 간헐적 오류 | ✅ 일관된 동작 |
| **코드 복잡도** | ❌ 높음 | ✅ 낮음 |
| **Svelte 5 지원** | ❌ 부분적 | ✅ 네이티브 |

### 핵심 교훈들

**1. "프레임워크 철학에 맞는 라이브러리 선택의 중요성"**

> 아무리 유명한 라이브러리라도 프레임워크의 철학과 맞지 않으면 
> 더 많은 문제를 만들어낼 수 있습니다.

**2. "DOM 조작 vs 상태 기반 접근법의 근본적 차이"**

```
DOM 조작 방식: DOM 먼저 → 상태 나중
상태 기반 방식: 상태 먼저 → DOM 나중
```

**3. "패키지 설치 후 개발 서버 재시작의 중요성"**

> 특히 Vite 환경에서는 새 패키지 설치 후 
> `--force` 옵션으로 재시작하는 것이 많은 문제를 해결해줍니다.

### 개발자들에게 주는 메시지

> **"때로는 문제를 해결하려 노력하는 것보다  
> 올바른 도구를 선택하는 것이 더 중요하다"**

복잡한 인덱스 매핑 로직을 작성하며 며칠을 고생했지만, 결국 라이브러리를 바꾸는 것이 가장 깔끔한 해결책이었습니다.

---

## 마무리

개발은 때로 예상치 못한 여정이 됩니다. SortableJS와의 씨름에서 시작된 이 여정은 결국 더 나은 아키텍처와 안정적인 솔루션으로 이어졌습니다.

**기술 선택의 중요성**, **프레임워크 철학의 이해**, 그리고 **포기하지 않는 문제 해결 정신**이 어떻게 더 나은 결과를 만들어내는지 보여주는 사례라고 생각합니다.

### 🚀 다음 단계

- **성능 최적화**: 대용량 리스트에서의 드래그 성능 개선
- **접근성 개선**: 키보드 네비게이션 지원 추가  
- **애니메이션 강화**: 더 부드러운 드래그 효과 구현

여러분도 비슷한 문제를 겪고 계신다면, 문제를 해결하려 노력하기 전에 **올바른 도구를 선택하고 있는지** 먼저 점검해보세요!

---

> 이 포스트가 도움이 되셨다면, 여러분의 드래그 앤 드롭 구현 경험도 댓글로 공유해주세요. 
> 함께 배우고 성장하는 개발자 커뮤니티를 만들어가요! 🚀
{: .prompt-tip }