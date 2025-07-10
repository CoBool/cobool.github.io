---
title: "Svelte 5 Runes: 새로운 반응성 패러다임"
description: >-
  Svelte 5의 혁신적인 Runes 시스템을 심층 분석하고, 기존 Svelte 4와의 차이점, 
  주요 Runes 사용법, 마이그레이션 전략까지 종합적으로 다룹니다.
date: 2025-07-09 17:30:00 +0900
categories: [웹 개발, Svelte]
tags: [svelte, svelte5, runes, reactivity, frontend, javascript]
pin: false
math: false
mermaid: false
---

## 들어가며

Svelte 5가 가져온 가장 큰 변화는 바로 **Runes**입니다. 기존의 `let` 기반 반응성에서 벗어나 명시적이고 예측 가능한 반응성 시스템을 도입했습니다. 이번 포스트에서는 Svelte 5 Runes의 핵심 개념부터 실무 적용까지 종합적으로 살펴보겠습니다.

## Runes란 무엇인가?

Runes는 Svelte 5의 새로운 **반응성 원시 타입(reactivity primitives)**입니다. `$state`, `$derived`, `$effect` 등의 특별한 함수를 통해 반응성을 명시적으로 관리할 수 있습니다.

> Runes는 기존 Svelte의 "마법적인" 반응성을 더 명확하고 예측 가능하게 만듭니다.
{: .prompt-info }

## 주요 Runes 살펴보기

### 1. `$state` - 반응형 상태 관리

기존 Svelte 4의 `let` 변수를 대체하는 명시적 상태 선언입니다.

```javascript
// Svelte 4
let count = 0;

// Svelte 5
let count = $state(0);
```

#### 객체와 배열도 반응형으로

```svelte
<script>
	let user = $state({
		name: 'John',
		age: 30
	});
	
	let items = $state([1, 2, 3]);
</script>

<button onclick={() => user.age++}>
	나이 증가: {user.age}
</button>

<button onclick={() => items.push(items.length + 1)}>
	아이템 추가: {items.length}개
</button>
```

### 2. `$derived` - 파생 상태

기존의 `$:` 반응형 구문을 대체하는 더 명확한 파생 상태입니다.

```svelte
<script>
	let count = $state(0);
	
	// Svelte 4
	$: doubled = count * 2;
	
	// Svelte 5 - 간단한 표현식
	const doubled = $derived(count * 2);
	const isEven = $derived(count % 2 === 0);
	
	// 복잡한 로직은 $derived.by 사용
	const status = $derived.by(() => {
		if (count === 0) return '시작하지 않음';
		if (count < 5) return '낮음';
		if (count < 10) return '보통';
		return '높음';
	});
</script>

<p>{count}의 두 배: {doubled}</p>
<p>짝수인가요? {isEven ? '예' : '아니오'}</p>
<p>상태: {status}</p>
```

> **중요**: `$derived`는 단순 표현식에, `$derived.by`는 복잡한 로직에 사용합니다. 둘 다 순수 함수여야 하며 부작용이 없어야 합니다.
{: .prompt-warning }

### 3. `$effect` - 부작용 처리

기존의 `$:` 부작용 처리를 전담하는 새로운 시스템입니다.

```svelte
<script>
	let count = $state(0);
	
	// 카운트가 변경될 때마다 실행
	$effect(() => {
		console.log(`카운트가 ${count}으로 변경되었습니다`);
		
		if (count > 10) {
			alert('카운트가 너무 높습니다!');
		}
	});
	
	// 정리(cleanup) 함수 반환 가능
	$effect(() => {
		const timer = setInterval(() => {
			console.log('1초마다 실행');
		}, 1000);
		
		return () => clearInterval(timer);
	});
</script>
```

#### `$effect.pre` - DOM 업데이트 전 실행

```svelte
<script>
	let messages = $state([]);
	let viewport;
	
	$effect.pre(() => {
		// DOM 업데이트 전에 스크롤 위치 확인
		const autoscroll = viewport && 
			viewport.offsetHeight + viewport.scrollTop > 
			viewport.scrollHeight - 50;
		
		if (autoscroll) {
			tick().then(() => {
				viewport.scrollTo(0, viewport.scrollHeight);
			});
		}
	});
</script>
```

### 4. `$props` - 컴포넌트 속성

기존의 `export let` 문법을 대체하는 더 직관적인 props 처리입니다.

```svelte
<script>
	// Svelte 4
	export let title;
	export let subtitle = '기본값';
	export let items = [];
	
	// Svelte 5
	let { title, subtitle = '기본값', items = [] } = $props();
	
	// 나머지 props 처리
	let { class: className, ...rest } = $props();
</script>

<div class={className} {...rest}>
	<h1>{title}</h1>
	<h2>{subtitle}</h2>
</div>
```

#### TypeScript 타입 지원

```svelte
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
		items: string[];
	}
	
	let { title, count = 0, items }: Props = $props();
</script>
```

### 5. `$bindable` - 양방향 바인딩

부모-자식 간 양방향 데이터 바인딩을 위한 새로운 시스템입니다.

```svelte
<!-- FancyInput.svelte -->
<script>
	let { value = $bindable(), ...props } = $props();
</script>

<input bind:value={value} {...props} />
```

```svelte
<!-- App.svelte -->
<script>
	import FancyInput from './FancyInput.svelte';
	
	let message = $state('hello');
</script>

<FancyInput bind:value={message} />
<p>현재 값: {message}</p>
```

## 이벤트 처리의 변화

Svelte 5는 이벤트 처리도 더 직관적으로 변경되었습니다.

```svelte
<script>
	let count = $state(0);
	
	function handleClick() {
		count++;
	}
</script>

<!-- Svelte 4 -->
<button on:click={handleClick}>클릭</button>

<!-- Svelte 5 -->
<button onclick={handleClick}>클릭</button>
<button {onclick}>클릭 (단축 문법)</button>
```

## 마이그레이션 가이드

### 자동 마이그레이션 도구

Svelte 5는 자동 마이그레이션 스크립트를 제공합니다:

```bash
npx sv migrate svelte-5
```

### 주요 변경사항 요약

| Svelte 4 | Svelte 5 | 설명 |
|----------|----------|------|
| `let count = 0` | `let count = $state(0)` | 반응형 상태 |
| `$: doubled = count * 2` | `const doubled = $derived(count * 2)` | 파생 상태 |
| `$: console.log(count)` | `$effect(() => console.log(count))` | 부작용 |
| `export let prop` | `let { prop } = $props()` | 컴포넌트 속성 |
| `on:click` | `onclick` | 이벤트 처리 |

### 점진적 마이그레이션

> 기존 Svelte 4 코드는 Svelte 5에서도 정상 작동합니다. 점진적으로 마이그레이션할 수 있습니다.
{: .prompt-tip }

## 실전 예제: Todo 앱

Svelte 5 Runes를 활용한 간단한 Todo 앱 예제입니다:

```svelte
<script>
	let newTodo = $state('');
	let todos = $state([]);
	let filter = $state('all'); // 'all', 'active', 'completed'
	
	// 필터링된 todos (복잡한 로직이므로 $derived.by 사용)
	const filteredTodos = $derived.by(() => {
		switch (filter) {
			case 'active':
				return todos.filter(todo => !todo.completed);
			case 'completed':
				return todos.filter(todo => todo.completed);
			default:
				return todos;
		}
	});
	
	// 통계
	const activeCount = $derived(todos.filter(todo => !todo.completed).length);
	const completedCount = $derived(todos.length - activeCount);
	
	// 로컬 스토리지 동기화
	$effect(() => {
		localStorage.setItem('todos', JSON.stringify(todos));
	});
	
	function addTodo() {
		if (newTodo.trim()) {
			todos.push({
				id: Date.now(),
				text: newTodo.trim(),
				completed: false
			});
			newTodo = '';
		}
	}
	
	function toggleTodo(id) {
		const todo = todos.find(t => t.id === id);
		if (todo) {
			todo.completed = !todo.completed;
		}
	}
	
	function removeTodo(id) {
		todos = todos.filter(t => t.id !== id);
	}
</script>

<div class="todo-app">
	<h1>Todo App (Svelte 5)</h1>
	
	<form onsubmit={(e) => { e.preventDefault(); addTodo(); }}>
		<input 
			bind:value={newTodo} 
			placeholder="할 일을 입력하세요..." 
		/>
		<button type="submit">추가</button>
	</form>
	
	<div class="filters">
		<button 
			class:active={filter === 'all'} 
			onclick={() => filter = 'all'}
		>
			전체 ({todos.length})
		</button>
		<button 
			class:active={filter === 'active'} 
			onclick={() => filter = 'active'}
		>
			진행중 ({activeCount})
		</button>
		<button 
			class:active={filter === 'completed'} 
			onclick={() => filter = 'completed'}
		>
			완료 ({completedCount})
		</button>
	</div>
	
	<ul class="todo-list">
		{#each filteredTodos as todo (todo.id)}
			<li class:completed={todo.completed}>
				<input 
					type="checkbox" 
					checked={todo.completed}
					onchange={() => toggleTodo(todo.id)}
				/>
				<span>{todo.text}</span>
				<button onclick={() => removeTodo(todo.id)}>
					삭제
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.todo-app {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.filters button.active {
		background: #007acc;
		color: white;
	}
	
	.todo-list li.completed {
		opacity: 0.6;
		text-decoration: line-through;
	}
</style>
```

## 성능 및 개발자 경험 개선

### 1. 더 나은 TypeScript 지원

```typescript
// .svelte.ts 파일에서 반응성 활용
export const appState = $state({
	user: null as User | null,
	theme: 'dark' as 'light' | 'dark',
	notifications: [] as Notification[]
});

export const isLoggedIn = $derived(appState.user !== null);
```

### 2. 향상된 디버깅

```svelte
<script>
	let count = $state(0);
	let message = $state('hello');
	
	// 디버깅을 위한 $inspect
	$inspect(count, message);
	
	// 커스텀 디버깅
	$inspect(count).with((type, value) => {
		if (type === 'update') {
			console.log(`Count updated to: ${value}`);
		}
	});
</script>
```

### 3. 더 작은 번들 크기

> Svelte 5는 Runes를 통해 더 효율적인 코드를 생성하여 번들 크기를 줄였습니다.
{: .prompt-info }

## 주의사항과 베스트 프랙티스

### ❌ 피해야 할 패턴

```svelte
<script>
	let count = $state(0);
	
	// ❌ $derived에서 부작용 금지
	const bad = $derived(() => {
		console.log(count); // 부작용!
		return count * 2;
	});
	
	// ✅ $effect 사용
	$effect(() => {
		console.log(`Count: ${count}`);
	});
	
	const good = $derived(count * 2);
</script>
```

### ✅ 권장 패턴

1. **상태는 최소한으로**: 필요한 경우에만 `$state` 사용
2. **파생 상태 활용**: 계산 가능한 값은 `$derived` 사용
3. **부작용 분리**: `$effect`에서만 부작용 처리
4. **타입 안전성**: TypeScript와 함께 사용하여 타입 안전성 확보

## 결론

Svelte 5 Runes는 다음과 같은 이점을 제공합니다:

- ✨ **명시적 반응성**: 코드의 의도가 더 명확해졌습니다
- 🔧 **향상된 도구 지원**: TypeScript, 디버깅, 린팅이 개선되었습니다  
- 🚀 **더 나은 성능**: 더 효율적인 업데이트와 작은 번들 크기
- 🔄 **점진적 마이그레이션**: 기존 코드와 호환되어 안전하게 전환 가능

Svelte 5는 기존의 간결함을 유지하면서도 더 강력하고 예측 가능한 개발 경험을 제공합니다. 여러분의 다음 프로젝트에서 Svelte 5 Runes를 활용해 보세요!

---

> 이 포스트는 Svelte 5 공식 문서와 마이그레이션 가이드를 바탕으로 작성되었습니다. 
> 더 자세한 내용은 [Svelte 공식 문서](https://svelte.dev/)를 참고하세요.
{: .prompt-tip } 