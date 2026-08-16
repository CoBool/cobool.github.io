const CACHE_VERSION = "true-log-v1"
const CACHE_NAME = `true-log-cache-${CACHE_VERSION}`
const OFFLINE_FALLBACK = "/offline.html"

// 설치(install): 오프라인 폴백 페이지를 사전 캐싱(pre-cache)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_FALLBACK]))
      .then(() => self.skipWaiting()),
  )
})

// 활성화(activate): 구버전 캐시 정리 및 클라이언트 즉시 제어
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// 요청 가로채기(fetch)
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 1. GET 요청 및 동일 출처(same-origin)만 처리 (서드파티는 NetworkOnly)
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return
  }

  // 2. 불변 정적 에셋: CacheFirst
  // /_next/static/, /fonts/, /icons/, /katex/
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/katex/")

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
      }),
    )
    return
  }

  // 3. HTML 페이지 탐색 (Navigation): NetworkFirst + Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          const offlinePage = await caches.match(OFFLINE_FALLBACK)
          return (
            offlinePage ||
            new Response("오프라인 상태입니다.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          )
        }),
    )
    return
  }

  // 4. RSC 페이로드 (*.txt) 및 기타 정적 페이지 데이터: NetworkFirst
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return networkResponse
      })
      .catch(() => caches.match(request)),
  )
})
