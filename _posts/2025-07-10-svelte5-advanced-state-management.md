---
title: "Svelte 5 고급 상태 관리 패턴: React가 어려웠다면 이렇게 하세요"
description: >-
  React의 복잡한 상태 관리에 좌절했던 당신을 위한 Svelte 5 실전 가이드. 
  Context, Stores, Runes를 조합하여 깔끔하고 이해하기 쉬운 상태 관리 패턴을 배워보세요.
date: 2025-07-10 15:00:00 +0900
categories: [웹 개발, Svelte]
tags: [svelte5, runes, 상태관리, 초보자, 실전, context, stores]
pin: false
math: false
mermaid: false
---

## 들어가며: React가 너무 어려웠다고요?

> "useState, useEffect, useContext... 이게 뭔지 모르겠어요. Redux는 더더욱..." 😵

혹시 React 공부하다가 상태 관리의 복잡함에 포기한 경험이 있으신가요? 저도 처음엔 그랬습니다. 하지만 Svelte 5를 만나고 나서 "아, 이렇게 간단할 수도 있구나!"라고 깨달았어요.

이 글은 **React의 복잡함 때문에 Svelte를 선택한 여러분**을 위한 실전 가이드입니다. 개인 프로젝트를 만들면서 마주치는 실제 상황들을 하나씩 해결해보겠습니다.

### ✨ 이 글에서 배울 것들
- 🏠 **로그인 상태를 모든 페이지에서 공유하기**
- 📚 **데이터를 여러 컴포넌트에서 사용하기**  
- 🔍 **페이지 이동해도 필터 상태 유지하기**
- 🌐 **API 데이터를 깔끔하게 관리하기**
- 🎯 **실전 프로젝트: 독서 기록 앱 만들기**

> 이 글은 [Svelte 5 Runes 기초 가이드](../svelte5-runes-guide)를 읽으신 분들을 대상으로 합니다. 아직 읽지 않으셨다면 먼저 읽어보세요!
{: .prompt-info }

---

## 🤔 왜 상태 관리가 어려울까요?

### React에서 겪었던 고통들

{% raw %}
```jsx
// React에서는 이런 식으로... 😵
const App = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // 컨텍스트 프로바이더로 감싸고...
  return (
    <UserContext.Provider value={{user, setUser}}>
      <BooksContext.Provider value={{books, setBooks}}>
        <FilterContext.Provider value={{filter, setFilter}}>
          <App />
        </FilterContext.Provider>
      </BooksContext.Provider>
    </UserContext.Provider>
  );
};
```
{% endraw %}

**복잡하죠?** 상태가 3개만 되어도 벌써 이렇게 복잡해집니다.

### Svelte 5는 이렇게 간단해요

```svelte
<!-- App.svelte -->
<script>
  import { user, books, filter } from './stores/appState.js';
  // 끝! 이게 전부입니다 ✨
</script>
```

이제 하나씩 어떻게 구현하는지 배워보겠습니다.

---

## 🏗️ 상태 관리 전략: 3단계 접근법

복잡해 보이는 상태 관리도 3단계로 나누면 쉬워집니다:

### 1단계: 컴포넌트 내부 상태 (`$state`)
```svelte
<script>
  let count = $state(0); // 한 컴포넌트에서만 사용
</script>
```

### 2단계: 부모-자식 간 상태 공유 (`$props`, Context)
```svelte
<script>
  let { userData } = $props(); // 가까운 컴포넌트끼리 공유
</script>
```

### 3단계: 전역 상태 (Stores + Runes)
```javascript
// 앱 전체에서 사용하는 상태
export const user = $state(null);
```

> **핵심 원칙**: 가장 간단한 방법부터 시작하세요! 무조건 전역 상태부터 만들 필요 없어요.
{: .prompt-tip }

---

## 🎯 실전 패턴 1: 로그인 상태 관리

가장 자주 마주치는 문제부터 해결해보겠습니다.

### 문제 상황
```
로그인 → 헤더에 사용자 이름 표시
      → 마이페이지에서 사용자 정보 표시  
      → 글 작성 시 작성자로 설정
```

### 해결책: 전역 사용자 상태

**1. 상태 파일 생성 (`src/stores/auth.svelte.js`)**

```javascript
// src/stores/auth.svelte.js
export const user = $state({
  data: null,
  isLoggedIn: false,
  loading: false
});

// 로그인 함수
export async function login(email, password) {
  user.loading = true;
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const userData = await response.json();
    user.data = userData;
    user.isLoggedIn = true;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('로그인 실패:', error);
  } finally {
    user.loading = false;
  }
}

// 로그아웃 함수
export function logout() {
  user.data = null;
  user.isLoggedIn = false;
  localStorage.removeItem('user');
}

// 앱 시작 시 로그인 상태 확인
export function initAuth() {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    user.data = JSON.parse(savedUser);
    user.isLoggedIn = true;
  }
}
```

**2. 헤더 컴포넌트에서 사용**

```svelte
<!-- src/components/Header.svelte -->
<script>
  import { user, logout } from '../stores/auth.svelte.js';
</script>

<header>
  <h1>독서 기록</h1>
  
  {#if user.isLoggedIn}
    <div class="user-info">
      <span>안녕하세요, {user.data.name}님!</span>
      <button onclick={logout}>로그아웃</button>
    </div>
  {:else}
    <a href="/login">로그인</a>
  {/if}
</header>
```

**3. 로그인 페이지에서 사용**

```svelte
<!-- src/routes/login/+page.svelte -->
<script>
  import { user, login } from '../../stores/auth.svelte.js';
  import { goto } from '$app/navigation';
  
  let email = $state('');
  let password = $state('');
  
  async function handleLogin(e) {
    e.preventDefault();
    await login(email, password);
    if (user.isLoggedIn) {
      goto('/'); // 메인 페이지로 이동
    }
  }
</script>

<form onsubmit={handleLogin}>
  <input bind:value={email} type="email" placeholder="이메일" />
  <input bind:value={password} type="password" placeholder="비밀번호" />
  <button type="submit" disabled={user.loading}>
    {user.loading ? '로그인 중...' : '로그인'}
  </button>
</form>
```

**4. 앱 시작 시 초기화**

```svelte
<!-- src/app.html에서 또는 +layout.svelte -->
<script>
  import { initAuth } from './stores/auth.svelte.js';
  
  // 앱 시작 시 자동으로 실행
  $effect(() => {
    initAuth(); // 페이지 로드 시 로그인 상태 확인
  });
</script>
```

### 🎉 결과

이제 어떤 컴포넌트에서든 `import { user } from '../stores/auth.svelte.js'`만 하면 로그인 상태를 사용할 수 있습니다!

---

## 📚 실전 패턴 2: 데이터 목록 관리

이번에는 책 목록 같은 데이터를 여러 곳에서 사용하는 방법을 배워보겠습니다.

### 문제 상황
```
책 목록 → 메인 페이지에서 표시
       → 검색 페이지에서 필터링
       → 상세 페이지에서 개별 접근
```

### 해결책: 데이터 스토어 + 파생 상태

**1. 책 목록 상태 (`src/stores/books.svelte.js`)**

```javascript
// src/stores/books.svelte.js
export const books = $state({
  items: [],
  loading: false,
  error: null
});

export const filter = $state({
  search: '',
  category: 'all',
  status: 'all' // 읽음, 읽는중, 읽고싶음
});

// 필터링된 책 목록 (파생 상태)
export const filteredBooks = $derived.by(() => {
  let result = books.items;
  
  // 검색어 필터링
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    result = result.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  }
  
  // 카테고리 필터링
  if (filter.category !== 'all') {
    result = result.filter(book => book.category === filter.category);
  }
  
  // 읽기 상태 필터링
  if (filter.status !== 'all') {
    result = result.filter(book => book.status === filter.status);
  }
  
  return result;
});

// 통계 (파생 상태)
export const bookStats = $derived({
  total: books.items.length,
  read: books.items.filter(book => book.status === 'read').length,
  reading: books.items.filter(book => book.status === 'reading').length,
  wishlist: books.items.filter(book => book.status === 'wishlist').length
});

// API 함수들
export async function loadBooks() {
  books.loading = true;
  books.error = null;
  
  try {
    const response = await fetch('/api/books');
    const data = await response.json();
    books.items = data;
  } catch (error) {
    books.error = '책 목록을 불러오는데 실패했습니다.';
    console.error(error);
  } finally {
    books.loading = false;
  }
}

export async function addBook(bookData) {
  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    
    const newBook = await response.json();
    books.items.push(newBook);
    return newBook;
  } catch (error) {
    console.error('책 추가 실패:', error);
    throw error;
  }
}

export async function updateBookStatus(bookId, status) {
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    // 로컬 상태 업데이트
    const book = books.items.find(b => b.id === bookId);
    if (book) {
      book.status = status;
    }
  } catch (error) {
    console.error('상태 업데이트 실패:', error);
    throw error;
  }
}
```

**2. 책 목록 컴포넌트**

```svelte
<!-- src/components/BookList.svelte -->
<script>
  import { filteredBooks, bookStats, updateBookStatus } from '../stores/books.svelte.js';
  
  async function handleStatusChange(bookId, newStatus) {
    try {
      await updateBookStatus(bookId, newStatus);
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  }
</script>

<div class="book-list">
  <div class="stats">
    <span>전체: {bookStats.total}권</span>
    <span>읽음: {bookStats.read}권</span>
    <span>읽는중: {bookStats.reading}권</span>
    <span>읽고싶음: {bookStats.wishlist}권</span>
  </div>
  
  <div class="books">
    {#each filteredBooks as book (book.id)}
      <div class="book-card">
        <h3>{book.title}</h3>
        <p>저자: {book.author}</p>
        <p>카테고리: {book.category}</p>
        
        <select 
          value={book.status} 
          onchange={(e) => handleStatusChange(book.id, e.target.value)}
        >
          <option value="wishlist">읽고싶음</option>
          <option value="reading">읽는중</option>
          <option value="read">읽음</option>
        </select>
      </div>
    {/each}
  </div>
</div>
```

**3. 검색 필터 컴포넌트**

```svelte
<!-- src/components/BookFilter.svelte -->
<script>
  import { filter } from '../stores/books.svelte.js';
</script>

<div class="filters">
  <input 
    bind:value={filter.search} 
    placeholder="책 제목이나 저자로 검색..."
    type="text"
  />
  
  <select bind:value={filter.category}>
    <option value="all">모든 카테고리</option>
    <option value="fiction">소설</option>
    <option value="non-fiction">비소설</option>
    <option value="tech">기술</option>
    <option value="essay">에세이</option>
  </select>
  
  <select bind:value={filter.status}>
    <option value="all">모든 상태</option>
    <option value="wishlist">읽고싶음</option>
    <option value="reading">읽는중</option>
    <option value="read">읽음</option>
  </select>
  
  <button onclick={() => {
    filter.search = '';
    filter.category = 'all';
    filter.status = 'all';
  }}>
    필터 초기화
  </button>
</div>
```

### 🎉 결과

- 어떤 페이지에서든 `filteredBooks`로 필터링된 책 목록 접근
- 검색이나 필터 변경 시 모든 컴포넌트가 자동으로 업데이트
- 통계도 실시간으로 계산되어 표시

---

## 🔄 실전 패턴 3: 페이지 간 상태 유지

페이지를 이동해도 검색어나 필터가 유지되도록 해보겠습니다.

### 문제 상황
```
검색 페이지에서 "소설" 검색 → 상세 페이지 이동 → 뒤로가기
→ 검색어가 사라짐 😱
```

### 해결책: URL과 상태 동기화

**1. URL 상태 관리 (`src/stores/navigation.svelte.js`)**

```javascript
// src/stores/navigation.svelte.js
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

export const searchParams = $state({
  search: '',
  category: 'all',
  status: 'all',
  page: 1
});

// URL에서 파라미터 읽기
export function loadParamsFromURL() {
  const currentPage = get(page);
  const params = currentPage.url.searchParams;
  
  searchParams.search = params.get('search') || '';
  searchParams.category = params.get('category') || 'all';
  searchParams.status = params.get('status') || 'all';
  searchParams.page = parseInt(params.get('page')) || 1;
}

// URL 업데이트 (브라우저 히스토리에 기록)
export function updateURL() {
  const params = new URLSearchParams();
  
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category !== 'all') params.set('category', searchParams.category);
  if (searchParams.status !== 'all') params.set('status', searchParams.status);
  if (searchParams.page > 1) params.set('page', searchParams.page.toString());
  
  const newUrl = params.toString() ? `?${params.toString()}` : '';
  goto(newUrl, { replaceState: true }); // 새 히스토리 항목 생성하지 않음
}

// 디바운스된 URL 업데이트 (너무 자주 업데이트되지 않도록)
let updateTimeout;
export function debouncedUpdateURL() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updateURL, 300);
}
```

**2. 검색 페이지에서 사용**

```svelte
<!-- src/routes/search/+page.svelte -->
  <script>
    import { filter } from '../../stores/books.svelte.js';
    import { searchParams, loadParamsFromURL, debouncedUpdateURL } from '../../stores/navigation.svelte.js';
    import BookFilter from '../../components/BookFilter.svelte';
    import BookList from '../../components/BookList.svelte';
  
  // 페이지 로드 시 URL에서 파라미터 복원 (한 번만 실행)
  $effect(() => {
    loadParamsFromURL();
    
    // URL 파라미터를 필터 상태에 적용
    filter.search = searchParams.search;
    filter.category = searchParams.category;
    filter.status = searchParams.status;
  });
  
  // 필터가 변경될 때마다 URL 업데이트
  $effect(() => {
    searchParams.search = filter.search;
    searchParams.category = filter.category;
    searchParams.status = filter.status;
    
    debouncedUpdateURL();
  });
</script>

<div class="search-page">
  <h1>책 검색</h1>
  <BookFilter />
  <BookList />
</div>
```

### 🎉 결과

이제 페이지를 이동하거나 새로고침해도 검색 상태가 유지됩니다!

---

## 🌐 실전 패턴 4: API 상태 관리

API 호출과 관련된 로딩, 에러, 성공 상태를 깔끔하게 관리해보겠습니다.

### 해결책: API 상태 패턴

**1. API 상태 관리 유틸리티**

```javascript
// src/stores/apiState.svelte.js

// API 상태를 위한 팩토리 함수
export function createApiState(initialData = null) {
  return $state({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null
  });
}

// API 호출 래퍼 함수
export async function apiCall(apiState, asyncFunction) {
  apiState.loading = true;
  apiState.error = null;
  
  try {
    const result = await asyncFunction();
    apiState.data = result;
    apiState.lastFetch = new Date();
    return result;
  } catch (error) {
    apiState.error = error.message || '오류가 발생했습니다.';
    throw error;
  } finally {
    apiState.loading = false;
  }
}
```

**2. 책 상세 정보 API**

```javascript
// src/stores/bookDetail.svelte.js
import { createApiState, apiCall } from './apiState.svelte.js';

export const bookDetail = createApiState();

export async function loadBookDetail(bookId) {
  return apiCall(bookDetail, async () => {
    const response = await fetch(`/api/books/${bookId}`);
    if (!response.ok) {
      throw new Error('책 정보를 찾을 수 없습니다.');
    }
    return response.json();
  });
}

export async function addReview(bookId, reviewData) {
  return apiCall(bookDetail, async () => {
    const response = await fetch(`/api/books/${bookId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      throw new Error('리뷰 저장에 실패했습니다.');
    }
    
    const result = await response.json();
    
    // 기존 책 데이터에 새 리뷰 추가
    if (bookDetail.data) {
      bookDetail.data.reviews = bookDetail.data.reviews || [];
      bookDetail.data.reviews.push(result);
    }
    
    return result;
  });
}
```

**3. 책 상세 페이지**

```svelte
<!-- src/routes/books/[id]/+page.svelte -->
  <script>
    import { page } from '$app/stores';
    import { bookDetail, loadBookDetail, addReview } from '../../../stores/bookDetail.svelte.js';
  
  let reviewText = $state('');
  let rating = $state(5);
  
  // 페이지 로드 시 책 상세 정보 불러오기
  $effect(() => {
    const bookId = $page.params.id;
    if (bookId) {
      loadBookDetail(bookId).catch(error => {
        // 에러는 bookDetail.error에 자동으로 저장됨
        console.error('책 정보 로드 실패:', error);
      });
    }
  });
  
  async function handleReviewSubmit(e) {
    e.preventDefault();
    try {
      await addReview($page.params.id, {
        text: reviewText,
        rating: rating
      });
      
      // 성공 시 폼 초기화
      reviewText = '';
      rating = 5;
      alert('리뷰가 저장되었습니다!');
    } catch (error) {
      alert('리뷰 저장에 실패했습니다.');
    }
  }
</script>

<div class="book-detail">
  {#if bookDetail.loading}
    <div class="loading">책 정보를 불러오는 중...</div>
  {:else if bookDetail.error}
    <div class="error">
      ❌ {bookDetail.error}
      <button onclick={() => loadBookDetail($page.params.id)}>
        다시 시도
      </button>
    </div>
  {:else if bookDetail.data}
    <div class="book-info">
      <h1>{bookDetail.data.title}</h1>
      <p>저자: {bookDetail.data.author}</p>
      <p>출간: {bookDetail.data.publishYear}</p>
      <p>{bookDetail.data.description}</p>
    </div>
    
    <div class="reviews">
      <h2>리뷰</h2>
      
      <!-- 기존 리뷰들 -->
      {#each bookDetail.data.reviews || [] as review}
        <div class="review">
          <div class="rating">⭐ {review.rating}/5</div>
          <p>{review.text}</p>
          <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
      {/each}
      
      <!-- 새 리뷰 작성 -->
      <form onsubmit={handleReviewSubmit}>
        <select bind:value={rating}>
          <option value={1}>⭐ 1점</option>
          <option value={2}>⭐ 2점</option>
          <option value={3}>⭐ 3점</option>
          <option value={4}>⭐ 4점</option>
          <option value={5}>⭐ 5점</option>
        </select>
        
        <textarea 
          bind:value={reviewText} 
          placeholder="이 책에 대한 생각을 남겨주세요..."
          required
        ></textarea>
        
        <button type="submit" disabled={bookDetail.loading}>
          {bookDetail.loading ? '저장 중...' : '리뷰 저장'}
        </button>
      </form>
    </div>
  {/if}
</div>
```

### 🎉 결과

- 로딩, 에러, 성공 상태가 자동으로 관리됨
- 재사용 가능한 API 패턴으로 다른 기능에도 적용 가능
- 사용자 경험이 크게 개선됨

---

## 🛠️ 종합 실전 프로젝트: 독서 기록 앱

지금까지 배운 모든 패턴을 조합해서 완전한 독서 기록 앱을 만들어보겠습니다.

### 앱 구조

```
src/
├── stores/
│   ├── auth.svelte.js          # 로그인 상태
│   ├── books.svelte.js         # 책 목록 + 필터
│   ├── bookDetail.svelte.js    # 책 상세 정보
│   ├── navigation.svelte.js    # URL 상태 관리
│   └── apiState.svelte.js      # API 상태 유틸리티
├── components/
│   ├── Header.svelte
│   ├── BookList.svelte
│   ├── BookFilter.svelte
│   └── BookCard.svelte
└── routes/
    ├── +layout.svelte   # 공통 레이아웃
    ├── +page.svelte     # 메인 페이지
    ├── login/
    ├── books/
    │   ├── [id]/
    │   └── add/
    └── search/
```

### 메인 앱 레이아웃

```svelte
<!-- src/routes/+layout.svelte -->
  <script>
    import { initAuth } from '../stores/auth.svelte.js';
    import { loadBooks } from '../stores/books.svelte.js';
    import Header from '../components/Header.svelte';
  
  // 앱 초기화
  $effect(() => {
    initAuth();
    loadBooks();
  });
</script>

<div class="app">
  <Header />
  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>
```

### 메인 페이지

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { user } from '../stores/auth.svelte.js';
  import { bookStats, books } from '../stores/books.svelte.js';
  import BookList from '../components/BookList.svelte';
</script>

<svelte:head>
  <title>독서 기록</title>
</svelte:head>

<div class="home">
  {#if user.isLoggedIn}
    <section class="welcome">
      <h1>안녕하세요, {user.data.name}님! 👋</h1>
      <p>오늘도 좋은 책과 함께하세요.</p>
    </section>
    
    <section class="dashboard">
      <h2>나의 독서 현황</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{bookStats.total}</h3>
          <p>전체 책</p>
        </div>
        <div class="stat-card">
          <h3>{bookStats.read}</h3>
          <p>읽은 책</p>
        </div>
        <div class="stat-card">
          <h3>{bookStats.reading}</h3>
          <p>읽는 중</p>
        </div>
        <div class="stat-card">
          <h3>{bookStats.wishlist}</h3>
          <p>읽고 싶은 책</p>
        </div>
      </div>
    </section>
    
    <section class="recent-books">
      <h2>최근 추가한 책</h2>
      {#if books.loading}
        <p>로딩 중...</p>
      {:else if books.items.length === 0}
        <p>아직 추가한 책이 없습니다. <a href="/books/add">첫 번째 책을 추가해보세요!</a></p>
      {:else}
        <BookList limit={6} />
      {/if}
    </section>
  {:else}
    <section class="landing">
      <h1>📚 독서 기록</h1>
      <p>읽은 책들을 기록하고 관리하세요.</p>
      <a href="/login" class="cta-button">시작하기</a>
    </section>
  {/if}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .stat-card {
    background: #f5f5f5;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .stat-card h3 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: #007acc;
  }
  
  .cta-button {
    display: inline-block;
    background: #007acc;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
  }
</style>
```

---

## 🎯 핵심 원칙과 베스트 프랙티스

### ✅ 해야 할 것들

1. **단순한 것부터 시작하기**
   ```svelte
   <!-- ✅ 좋음: 컴포넌트 내부 상태부터 -->
   <script>
     let count = $state(0);
   </script>
   ```

2. **상태를 의미별로 그룹화**
   ```javascript
   // ✅ 좋음: 관련된 상태들을 함께
   export const user = $state({
     data: null,
     isLoggedIn: false,
     loading: false
   });
   ```

3. **파생 상태 적극 활용**
   ```javascript
   // ✅ 좋음: 계산된 값은 $derived로
   export const filteredBooks = $derived.by(() => {
     return books.filter(book => book.category === filter.category);
   });
   ```

### ❌ 피해야 할 것들

1. **무분별한 전역 상태**
   ```javascript
   // ❌ 나쁨: 한 컴포넌트에서만 쓰는데 전역으로
   export const buttonColor = $state('blue');
   ```

2. **상태 중복**
   ```javascript
   // ❌ 나쁨: 같은 데이터를 여러 곳에 저장
   export const books = $state([]);
   export const bookCount = $state(0); // books.length로 계산 가능
   ```

3. **너무 깊은 중첩**
   ```javascript
   // ❌ 나쁨: 너무 복잡한 구조
   export const app = $state({
     user: {
       profile: {
         settings: {
           theme: {
             colors: { ... }
           }
         }
       }
     }
   });
   ```

4. **이벤트 모디파이어 사용 (더 이상 지원 안됨)**
   ```svelte
   <!-- ❌ 나쁨: Svelte 5에서 제거됨 -->
   <form onsubmit|preventDefault={handleSubmit}>
   
   <!-- ✅ 좋음: 함수에서 직접 처리 -->
   <form onsubmit={handleSubmit}>
   
   <script>
     function handleSubmit(e) {
       e.preventDefault();
       // 폼 처리 로직
     }
   </script>
   ```

---

## 🚀 다음 단계: 더 배우고 싶다면

### 1. 성능 최적화
- 큰 목록 렌더링 최적화
- 메모이제이션 전략
- 번들 크기 줄이기

### 2. 테스팅
- 상태 로직 단위 테스트
- 컴포넌트 통합 테스트
- E2E 테스트

### 3. 고급 패턴
- 상태 머신 패턴
- 옵저버 패턴
- 커스텀 훅 패턴

---

## 마무리: React가 어려웠던 당신에게

처음에 React의 `useState`, `useEffect`, `useContext`가 복잡해서 포기했던 기억이 나시나요? Svelte 5에서는 이런 고민들이 정말 간단해집니다:

### React vs Svelte 5 비교

| 기능 | React | Svelte 5 |
|------|-------|----------|
| 상태 선언 | `useState(0)` | `$state(0)` |
| 파생 상태 | `useMemo()` | `$derived()` |
| 부작용 | `useEffect()` | `$effect()` |
| 전역 상태 | Context + Provider | 단순 import |
| 이벤트 처리 | `onSubmit={(e) => {...}}` | `onsubmit={handleSubmit}` |
| 코드량 | 많음 | 적음 |

### 🎉 축하합니다!

이제 여러분은:
- ✅ 복잡한 상태를 체계적으로 관리할 수 있습니다
- ✅ 로그인, 데이터 목록, API 상태를 다룰 수 있습니다  
- ✅ 실무 수준의 애플리케이션을 만들 수 있습니다
- ✅ React보다 훨씬 간단한 코드로 같은 기능을 구현할 수 있습니다

### 💡 마지막 조언

> **완벽을 추구하지 마세요.** 일단 동작하는 코드를 만든 다음, 필요할 때 리팩토링하세요. Svelte 5는 여러분의 성장과 함께 발전할 수 있는 충분히 유연한 도구입니다.

개인 프로젝트에서 이 패턴들을 하나씩 적용해보세요. 분명 React 때보다 훨씬 즐겁게 개발할 수 있을 거예요! 🚀

### ⚠️ Svelte 5 주요 변경사항 요약

Svelte 4에서 넘어오시는 분들을 위해 이 글에서 다룬 주요 변경사항들을 정리했습니다:

- **상태 파일**: `.js` → `.svelte.js` (Runes 사용 시)
- **초기화**: `onMount()` → `$effect()` (대부분의 경우)
- **이벤트 모디파이어**: `onsubmit|preventDefault` → 함수에서 `e.preventDefault()` 직접 호출
- **반응성**: `$:` → `$derived()` 또는 `$effect()`

---

> 다음 글에서는 **Svelte 5 성능 최적화**에 대해 다뤄보겠습니다. 더 빠르고 효율적인 앱을 만들고 싶다면 기대해 주세요!
{: .prompt-tip } 