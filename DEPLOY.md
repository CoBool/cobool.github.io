# Deployment Guide

배포 경로가 둘입니다.

| 경로 | 대상 | 설정 |
| --- | --- | --- |
| GitHub Pages | 공개 사이트 (`https://blog.boolean.kr`) | `.github/workflows/deploy-pages.yml` |
| nginx 컨테이너 | 홈랩 | `Dockerfile` · `deploy/nginx.conf` |

둘은 독립적입니다. 아래 캐시 정책과 보안 헤더는 **nginx 경로에만 적용됩니다** — GitHub Pages는 커스텀 응답 헤더를 지원하지 않으므로 CSP·`nosniff`·`Cache-Control`이 모두 GitHub의 기본값으로 대체됩니다.

## GitHub Pages

`main`에 푸시되면 워크플로가 lint·typecheck·test를 다시 돌린 뒤 정적 export를 만들어 배포합니다. `main`에 직접 밀어넣은 커밋도 배포 대상이라, 내보내기 전에 한 번 더 확인합니다.

절대 URL의 기준(`NEXT_PUBLIC_SITE_URL`)은 하드코딩하지 않고 `actions/configure-pages`가 알려주는 `base_url`을 씁니다. 저장소 이름이나 커스텀 도메인이 바뀌어도 워크플로를 고칠 필요가 없습니다.

`.nojekyll`은 필요 없습니다. Jekyll이 `_next/`를 무시하는 문제는 브랜치 배포 방식에서만 생기고, Actions 배포 경로는 Jekyll을 돌리지 않습니다.

**origin 루트 배포만 지원합니다.** `NEXT_PUBLIC_BASE_PATH`는 비우거나 `/`로 둡니다.
`/repo` 등 하위 경로와 경로를 포함한 `NEXT_PUBLIC_SITE_URL`은 빌드에서 거부합니다.
일부 경로 유틸리티의 접두사 지원은 사이트 전체의 서브경로 배포 지원을 뜻하지 않습니다.
현재 URL·폰트·공유·PWA를 함께 지원할 수 있는 루트 배포만 계약으로 보장합니다.

## nginx 컨테이너

```bash
docker build --secret id=env,src=.env.local -t true-log .
docker run -d -p 8080:8080 true-log
```

`NEXT_PUBLIC_*`는 빌드 시점에 번들에 박힙니다. 런타임 환경변수로는 바꿀 수 없으니 값을 바꾸려면 이미지를 다시 빌드해야 합니다.

## 환경변수

`next build`가 `.env` 파일을 직접 읽으므로 Dockerfile에 변수를 나열하지 않습니다. `--secret`으로 넘긴 파일은 `.env.production.local`로 마운트되는데, 이 이름이 Next의 `.env` 우선순위에서 가장 높아 다른 파일에 가려지지 않습니다.

secret 마운트는 빌드 중에만 존재하고 이미지 레이어에도 빌드 캐시에도 남지 않습니다. 프로덕션 빌드에는 `NEXT_PUBLIC_SITE_URL`이 필수이며 미설정 시 실패합니다. 개발 서버에서만 localhost 기본값을 사용합니다.

`NEXT_PUBLIC_BUILD_VERSION`은 사용자 설정값이 아닙니다. `pnpm build`가 실행될 때 `scripts/build.mjs`가 새 배포 식별자를 생성해 클라이언트 번들에 주입하고, 같은 값을 `out/build-version.json`과 `out/sw.js`에 반영합니다. 세 산출물이 같은 배포 버전을 공유해야 열린 탭의 업데이트 감지와 서비스 워커 캐시 교체가 안전하게 동작합니다.

## 캐시 정책

파일명이 만들어지는 방식에 따라 갈립니다.

| 대상 | 정책 | 근거 |
| --- | --- | --- |
| `/_next/static/` | `max-age=31536000, immutable` | 파일명에 내용 해시나 빌드 ID가 들어감 |
| `/pagefind/` | `no-cache` | `pagefind-entry.json`이 해시된 색인 파일을 가리키는데, 배포하면 옛 색인이 삭제됨 |
| `.html` `.txt` `.xml` `.webmanifest` | `no-cache` | 경로 기반 이름이라 배포해도 이름이 그대로고 내용만 바뀜 |
| `/build-version.json` | `no-store` | 열린 탭이 현재 배포 버전을 확인하는 경로 |
| 나머지 (`public/`의 이미지·폰트) | `max-age=86400` | 내용 해시가 없어 영구 캐시하면 교체 불가 |

`/_next/static/`의 값은 [Next 공식 문서](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr)가 명시한 값과 같습니다 — *"Next.js sets the `Cache-Control` header of `public, max-age=31536000, immutable` to truly immutable assets ... These immutable files contain a SHA-hash in the file name."*

RSC 페이로드(`.txt`)의 정책은 공식 문서에 없습니다. 정적 export에서만 파일로 떨어지기 때문입니다. `no-cache`로 정한 근거는 측정입니다 — **홈 화면 1회 로드에 `.txt` 113개 중 56개가 프리페치되고, 이후 링크 클릭은 추가 요청 0건**으로 처리됩니다. 즉 내비게이션 전체가 이 파일들에 얹혀 있어서, 캐시되면 새 배포 뒤에도 옛 페이로드로 이동합니다.

`no-cache`는 "캐시 금지"가 아니라 "저장하되 쓰기 전에 재검증"입니다(금지는 `no-store`). ETag가 붙으므로 실제 비용은 304 / 0바이트입니다.

## CSP에 `'unsafe-inline'`이 있는 이유

제거할 수 없습니다. 정적 export에는 nonce를 발급할 서버가 없고, Next는 RSC 페이로드를 페이지마다 다른 인라인 `<script>`로 심어(페이지당 15~16개) 해시도 고정할 수 없습니다. Next 공식 문서가 명시합니다 — *"Static pages are generated at build time, when no request or response headers exist—so no nonce can be injected."*

공식 문서의 `experimental.sri`도 대안이 되지 못합니다. 켜고 확인한 결과 **외부 `<script src>` 6개에만 `integrity`가 붙고 인라인 15개는 그대로**였습니다. 문서의 SRI 예시 CSP(`script-src 'self'`)를 적용하면:

| | 현재 CSP | SRI 예시 CSP |
| --- | --- | --- |
| CSP 위반 | 0건 | 15건 (`script-src-elem :: inline`) |
| 테마 스크립트 | 정상 | 차단 |
| 하이드레이션 | 정상 | 죽음 (클릭 무반응) |

`'unsafe-inline'`이 있어도 **외부 출처 스크립트 로딩은 계속 막힙니다.** 본문 HTML은 그 앞에서 `rehype-sanitize`를 거칩니다.

`'wasm-unsafe-eval'`은 검색(Pagefind)이 WebAssembly로 동작하기 때문에 필요합니다. 없으면 실측으로 차단됩니다:

```
Refused to compile or instantiate WebAssembly module because 'unsafe-eval'
is not an allowed source of script
```

`'unsafe-eval'`과 다릅니다 — WebAssembly 컴파일만 허용하고 `eval()`이나 `new Function()` 같은 JS 문자열 실행은 계속 막습니다.

## CSP가 실제로 막는 것

본문에 공격 페이로드 10종을 넣고 빌드해 DOM을 실측했습니다. **본문 XSS는 대부분 `rehype-sanitize` 선에서 끝납니다.**

| 페이로드 | 결과 |
| --- | --- |
| raw `<script>`, 외부 `<script src>` | sanitize가 제거 (DOM에 0개) |
| `<iframe>`, `<object>`, `<embed>`, `<base>`, `<form>` | sanitize가 제거 (DOM에 0개) |
| `javascript:` href, `on*` 이벤트 핸들러 | sanitize가 제거 (DOM에 0개) |
| **외부 이미지** `![](https://evil/pixel.png)` | **sanitize 통과 → CSP `img-src`가 차단** |

전역 변수 오염(`window.__pwned*`)은 한 건도 발생하지 않았습니다. 즉 **CSP를 빼도 본문 XSS는 막힙니다.** 그럼에도 유지하는 이유는 두 가지입니다.

**첫째, sanitize가 놓치는 것을 잡습니다.** 외부 이미지는 Markdown의 정상 문법이라 sanitize가 통과시키지만, 트래킹 픽셀로 쓰이면 방문자 IP가 외부로 나갑니다. CSP를 뺐을 때는 이 요청이 그대로 나갔고, 켰을 때는 `img-src → https://evil.example.com/pixel.png` 위반으로 차단됐습니다.

**둘째, `frame-ancestors`는 다른 어떤 계층도 제공하지 않습니다.** 공격자 페이지에서 우리 사이트를 iframe으로 불러 실측했습니다.

```
CSP 없음  → 자식 프레임 1개, title="True Log | True Log", 정상 로드
CSP 있음  → chrome-error://chromewebdata/, net::ERR_BLOCKED_BY_RESPONSE
```

나머지(`base-uri`, `object-src`, `form-action`, `script-src`)는 sanitize가 이미 같은 것을 막고 있어 오늘 당장 증명되는 효과는 없습니다. sanitize에 우회가 발견되거나 remark/rehype 의존성이 오염됐을 때를 위한 2차 방어선입니다. 한 줄이고 유지 비용이 없으며, 전체 기능(KaTeX·Mermaid·코드 하이라이팅·하이드레이션)에서 위반 0건을 확인했습니다.

## 보안 헤더를 2개만 쓰는 이유

흔히 쓰이는 5~6개 대신 CSP와 `nosniff` 둘만 둡니다. 나머지는 이 사이트에서 **동작을 바꾸지 않는 것**으로 확인해 뺐습니다.

사이트 실측 조건: 쿠키·세션·로그인 없음, `target="_blank"` 0개, `window.open` 호출 없음, `<object>`/`<embed>` 0개, 외부 출처는 `github.com` 링크 하나뿐, 본문은 작성자가 쓴 Markdown을 `rehype-sanitize`로 정제.

| 헤더 | 판정 | 근거 |
| --- | --- | --- |
| `Content-Security-Policy` | **유지** | `'unsafe-inline'`이 있어도 외부 스크립트 출처를 막음. `frame-ancestors`(클릭재킹), `base-uri`, `object-src`, `form-action`은 `default-src`로 대체되지 않는 독립 방어 |
| `X-Content-Type-Options` | **유지** | `.txt`를 113개 서빙함. 내용 기반 타입 추측을 끄는 것이 특히 유효 |
| `Referrer-Policy` | 제거 | 지정하려던 `strict-origin-when-cross-origin`이 **Chrome 85(2020-08)·Firefox 87(2021-03)부터 브라우저 기본값**. 트래픽 90% 이상에서 아무것도 바꾸지 않음 |
| `Permissions-Policy` | 제거 | `camera`·`microphone`·`geolocation`의 **기본 allowlist가 이미 `self`** (MDN). 교차 출처 iframe은 기본적으로 차단되어 있고, 우리 출처에서도 이 API를 호출하지 않음 |
| `Cross-Origin-Opener-Policy` | 제거 | `window.open`/`target="_blank"`로 열린 문서와의 관계를 다루는데 **둘 다 0개**. 게다가 외부 링크에는 `rehype-external-links`가 `rel="noopener noreferrer"`를 붙임 |
| `X-Frame-Options` | 미사용 | CSP `frame-ancestors 'none'`이 후속 표준으로 대체 |
| `Strict-Transport-Security` | 보류 | 주석 처리. TLS를 이 서버에서 끝낼 때만 켜야 함 — 평문 HTTP로 접근하는 홈랩에서 켜면 브라우저가 기억해 다시 접속하지 못함 |

[OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)는 13개를 권고하지만 세션·쿠키를 다루는 웹 **애플리케이션** 기준입니다. 그대로 적용하면 안 되는 항목이 있습니다 — 예를 들어 `Cache-Control: no-store, max-age=0`은 위 캐시 정책을 통째로 무력화하고, `Cross-Origin-Embedder-Policy: require-corp`는 giscus iframe을 깨뜨립니다.

CSP 안에서도 `default-src 'self'`에 이미 덮이는 `connect-src`·`manifest-src`·`font-src`는 뺐습니다. `img-src`는 `data:`를 더하므로, `object-src`는 `'none'`으로 더 좁히므로 남깁니다.

## 검색 색인

`pnpm build`의 `postbuild`에서 `pagefind --site out`이 돌아 `out/pagefind/`를 만듭니다. HTML이 있어야 색인할 수 있으므로 빌드 뒤에 실행됩니다.

색인 범위는 `data-pagefind-body`가 붙은 글 본문으로 한정했습니다. 붙이지 않으면 사이드바·내비게이션 텍스트까지 색인되어 모든 페이지가 아무 검색어에나 걸립니다(실제로 "글"이 14페이지에 매칭됐습니다). 목차·이전다음글은 `data-pagefind-ignore`로 뺐습니다.

Pagefind는 한국어 형태소 분석을 하지 않는다고 경고하지만, 접두 매칭이 조사를 흡수해서 실사용에는 무리가 없습니다 — "목차"가 "목차를", "공간"이 "공간이", "레이아웃"이 "레이아웃에서"에 모두 매칭되는 것을 확인했습니다.

검색 UI는 Pagefind 기본 UI 대신 JS API만 쓰고 결과는 자체 컴포넌트로 그립니다. 기본 UI 번들(`pagefind-ui.*`, `pagefind-modular-ui.*`)은 참조하지 않으므로 전송되지 않습니다.

## 서드파티를 켤 때

`.env`로 giscus나 GA4를 활성화하면 CSP에 출처를 추가해야 합니다. 기본 CSP는 둘 다 막습니다.

```nginx
# giscus
script-src ... https://giscus.app
frame-src  https://giscus.app

# GA4
script-src  ... https://www.googletagmanager.com
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com
```

## 알아둘 nginx 동작

**`add_header`는 상속이 아니라 대체입니다.** 공식 문서: *"These directives are inherited from the previous configuration level if and only if there are no `add_header` directives defined on the current level."* `location` 안에서 `add_header`를 하나라도 쓰면 `server`의 헤더가 전부 사라집니다. 그래서 캐시 값은 `map`으로 계산하고 `add_header`는 `server`에서 한 번만 호출합니다.

**`types` 블록도 같습니다.** `server`에 `types { }`를 넣으면 `include mime.types`로 만든 전체 맵을 대체해 모든 응답이 `application/octet-stream`이 됩니다. `manifest.webmanifest`만 `location`으로 범위를 좁혀 지정하는 이유입니다. (nginx의 `mime.types`에는 `webmanifest` 항목이 없어서, 지정하지 않으면 `octet-stream`으로 나가고 `nosniff`와 겹쳐 브라우저가 매니페스트를 거부할 수 있습니다.)

**`absolute_redirect off`** — 없으면 리다이렉트 `Location`에 내부 포트 8080이 그대로 들어가, 앞단 리버스 프록시 뒤에서 접속 불가능한 주소가 나갑니다.

**`listen [::]:8080`을 쓰지 않습니다** — IPv6가 꺼진 호스트·컨테이너에서 nginx 기동 자체가 실패합니다(`Address family not supported`). 바깥 IPv6는 도커의 포트 게시나 앞단 프록시가 처리합니다.

**라우팅은 공식 예시와 같습니다.** [static-exports 문서](https://nextjs.org/docs/app/guides/static-exports#deploying)의 `error_page 404 /404.html` + `location = /404.html { internal; }`을 그대로 씁니다. `try_files`에서 `$uri.html`과 `/blog/` rewrite를 뺀 것은 문서가 "`trailingSlash: true`면 생략 가능"이라 명시했기 때문입니다.

## 검증

nginx를 띄우고 실제 산출물로 확인한 항목입니다.

```
Content-Type   html·txt·xml·png·svg·js 정상, webmanifest → application/manifest+json
캐시 정책       html/txt/xml/webmanifest → no-cache, _next/static → immutable, 나머지 → 1일
재검증         조건부 요청 → 304 / 0B
라우팅         /posts → 301 /posts/ (상대 경로), /404.html 직접요청 → 404, /healthz → 200
브라우저        CSP 위반 0건, 테마 스크립트 정상, KaTeX·Mermaid 렌더, 하이드레이션 정상
```

## PWA 배포 버전과 캐시

`pnpm build`는 `scripts/build.mjs`를 통해 페이지 번들, `build-version.json`,
`sw.js`에 같은 배포 버전을 넣고, 이어서 Pagefind 색인을 생성합니다.
`next build`만 직접 실행하면 이 단계가 빠지므로 배포에는 반드시 `pnpm build`를 사용합니다.

서비스 워커는 해시가 붙은 `_next/static/`만 Cache First로 제공합니다.
고정 URL의 폰트·아이콘·KaTeX·검색 파일과 페이지는 네트워크를 재검증하고,
오프라인일 때 해당 앱의 캐시로 복구합니다. 캐시는 최대 128개 항목이며,
오프라인 안내 페이지를 보존합니다. 방문한 모든 페이지의 영구 보관을 보장하지 않습니다.
새 워커는 자신의 scope에 속하는 이전 버전 캐시만 정리합니다.
`build-version.json`과 `sw.js`는 서비스 워커 캐시 대상에서 제외해 항상 현재 배포를 확인합니다.

열린 탭은 자신의 빌드 버전과 `/build-version.json`을 비교합니다. load 이후,
온라인 복귀, 탭 재활성화 및 5분 주기로 확인하며 숨겨진 탭에서는 건너뜁니다.
조회 실패 시 다음 기회에 재시도합니다. 배포 버전 조회는 오프라인 캐시를 사용하지 않습니다.
개발 서버에서는 워커를 등록하지 않습니다. 이전에 등록한 개발용 워커가 있다면
브라우저 개발자 도구에서 한 번 해제해야 합니다.

이전 버전의 페이지를 이미 열어 둔 방문자는 새 알림 코드가 없으므로 최초 전환 때는
한 번 페이지를 다시 열어야 합니다. 이후 배포부터 열린 탭의 버전 비교가 동작합니다.

## 배포 검증과 복구

PR CI는 production export를 빌드한 후 Chromium에서 실제 Pagefind 검색과 글 이동,
방문한 페이지의 오프라인 복구, 미방문 URL의 오프라인 안내, 배포 버전 변경 알림,
HTTP 404를 검증합니다. `pnpm test:e2e`는 **이미 빌드한 out/**를 사용합니다.
단위 테스트는 `pnpm test`, 브라우저 테스트는 `pnpm test:e2e`로 분리합니다.

```bash
pnpm exec playwright install --with-deps chromium
NEXT_PUBLIC_SITE_URL=https://blog.boolean.kr pnpm build
pnpm test:e2e
```

`pnpm build`의 마지막 단계는 버전 JSON과 워커 일치, 루트 canonical·RSS·sitemap,
검색 색인·오프라인·404 산출물을 검사합니다. Pages 배포와 Docker 빌드도 같은 검사를
거칩니다. GitHub Pages의 응답 헤더는 nginx 설정으로 변경할 수 없습니다.

배포 후에는 홈·최신 글·검색·RSS를 확인하고, 필요하면 브라우저를 오프라인으로 바꿔
방문한 글을 다시 여는지 확인합니다. giscus·GA·카카오는 외부 서비스 설정과 네트워크에
의존하므로 해당 기능을 켠 실제 도메인에서 별도로 확인합니다.

장애 시 복구:

1. 직전 정상 배포의 커밋과 실패 변경을 GitHub Actions 실행 기록에서 확인합니다.
2. 문제 변경을 revert하는 PR을 만들고 동일 CI를 통과시켜 main에 반영합니다.
   기존 배포 실행을 재실행하는 방법은 남아 있는 산출물과 당시 워크플로 조건을 확인한
   경우에만 사용합니다. main의 기록을 강제로 되돌리지 않습니다.
3. 새 배포가 완료되면 홈·검색·버전 JSON을 확인합니다. 열린 탭에는 새로고침 안내가
   표시됩니다. 사용자 저장소 전체 삭제를 일반 복구 절차로 요구하지 않습니다.
4. nginx는 직전 정상 이미지의 digest/tag를 보관하고, 그 이미지로 컨테이너를 교체합니다.
   문서·환경변수 변경도 이미지 빌드 시점 기준으로 함께 추적합니다.

예약 배포가 며칠 동안 실행되지 않거나 실패한 경우 Actions의 예약 실행 상태와 로그를
확인합니다. 예약 글 공개는 성공한 재빌드 시점에 이루어지므로 정확한 분 단위 발행은
보장하지 않습니다.