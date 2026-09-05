# True Log

[English](README.md) · **한국어**

Markdown 글을 정적 페이지로 빌드하는 한국어 기술 블로그입니다. Next.js App Router 로 만들지만 **글을 다루는 부분은 프레임워크를 모릅니다** — MDX 를 쓰지 않고, 파이프라인은 문자열을 받아 문자열을 돌려주는 순수 모듈로 격리해 두었습니다.

## 시작하기

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Node 22 이상, pnpm 은 `package.json` 의 `packageManager` 필드에서 버전을 읽습니다(corepack).

글은 `content/posts/<slug>.md` 에 씁니다. 파일명이 곧 URL 이고, 개발 서버에서는 `draft: true` 와 미래 날짜 글도 함께 보입니다. 프런트매터 규칙은 [CONTENT.md](CONTENT.md) 를 보세요.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 배포 버전 생성 → 정적 export → PWA 산출물 버전 주입 → `postbuild` 에서 Pagefind 색인 생성·검증 |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | production 산출물을 대상으로 하는 Playwright 브라우저 스모크 테스트 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome 검사 |
| `pnpm format` | Biome 자동 수정 |

CI에서는 모든 PR에 대해 lint, typecheck, 단위 테스트, production build, Playwright 브라우저 스모크 테스트를 실행합니다. 브라우저 테스트 실패 시 trace를 workflow artifact로 보관합니다.

## 구조

```
content/posts/       글 (Markdown)
src/
  app/               라우트. (site) 그룹이 공통 레이아웃을 감쌉니다
  lib/markdown/      Markdown 파이프라인 — 호스트 비의존
  lib/               글 IO·컬렉션·배포 경로·RSS·SEO 등 애플리케이션 로직
  features/          post-toc · post-diagram · pwa · search · theme
  components/        UI. ui/ 는 shadcn, typography.tsx 는 타이포 프리미티브
  config/            site · navigation · integrations · deployment 검증
deploy/nginx.conf    배포용 nginx 설정
```

## 설계

**Markdown 파이프라인이 호스트를 모릅니다.** `src/lib/markdown/` 은 unified 생태계만 사용하고 `next`·`react`·`node:*`·`@/*` 를 import 하지 않습니다. 이건 관례가 아니라 [테스트로 강제](tests/markdown-boundary.test.ts)됩니다 — 허용 목록 방식이라 예상하지 못한 import 도 걸립니다. 타입 검사만으로는 잡히지 않기 때문입니다(상위 `node_modules` 로 해석이 올라갑니다).

MDX 를 쓰지 않는 이유도 같습니다. 글이 JSX 를 품는 순간 React 없이는 렌더할 수 없어집니다.

**전체 정적 export 입니다.** `output: "export"` 라 애플리케이션 서버가 없습니다. 이 제약이 몇 가지를 결정합니다 — CSP nonce 를 쓸 수 없고([DEPLOY.md](DEPLOY.md) 참고), RSS 는 `force-static` 라우트로 만들며, 검색 색인은 빌드된 HTML 을 읽어야 해서 export 이후에 생성합니다.

**빌드는 페이지 번들·업데이트 엔드포인트·서비스 워커가 공유하는 하나의 배포 버전을 만듭니다.** `scripts/build.mjs` 가 버전을 생성해 클라이언트 번들에 `NEXT_PUBLIC_BUILD_VERSION` 으로 주입하고, `out/build-version.json` 을 만든 뒤 서비스 워커의 버전 마커를 치환합니다. 이 값은 사용자 설정이 아니라 내부 빌드 메타데이터입니다.

**PWA 는 production 사이트의 일부입니다.** 웹 앱 매니페스트를 제공하고 production 에서만 서비스 워커를 등록합니다. 서비스 워커는 내비게이션, immutable Next 에셋, 폰트, KaTeX, Pagefind, RSC 페이로드를 대상으로 오프라인 복구와 제한된 캐시를 제공합니다. 열린 탭은 자기 번들에 박힌 배포 버전과 `build-version.json` 을 주기적으로 비교하고, 새 배포를 감지하면 오래된 자산과 새 자산을 섞어 쓰는 대신 새로고침 안내를 표시합니다.

**다이어그램은 클라이언트에서, 필요할 때만 그립니다.** Mermaid 를 서버에서 렌더하려면 헤드리스 브라우저가 필요합니다. 대신 다이어그램이 있는 글에서만, 그것도 화면에 들어올 때 `IntersectionObserver` 로 모듈을 불러옵니다.

**본문 HTML 은 `rehype-sanitize` 를 거칩니다.** `dangerouslySetInnerHTML` 에 넘길 수 있는 값은 `SanitizedHtml` 브랜드 타입으로 좁혀, 정제를 건너뛴 문자열이 들어가면 타입 검사에서 막힙니다.

## 설정

설정값은 빌드 시점에 번들에 박힙니다. `.env.example` 을 `.env.local` 로 복사해 쓰세요.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | production 에서 필수. canonical·Open Graph·sitemap·RSS 의 절대 URL 기준 |
| `NEXT_PUBLIC_BASE_PATH` | 루트 배포 계약. 비우거나 `/`만 허용하며 하위 경로 배포는 거부 |
| `NEXT_PUBLIC_GISCUS_*` | 선택 댓글. 다섯 값을 전부 채우거나 전부 비워야 함 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 선택 Google Analytics 4 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 선택 Kakao 공유 버튼(카카오톡). Kakao Developers 앱의 JavaScript 키 |

`NEXT_PUBLIC_BUILD_VERSION` 은 설정값으로 취급하지 않습니다. `pnpm build` 가 PWA 업데이트 조정을 위해 내부적으로 생성합니다.

## 문서

| 문서 | 내용 |
| --- | --- |
| [DESIGN.md](DESIGN.md) | 색상·타이포·간격·컴포넌트 규칙 |
| [CONTENT.md](CONTENT.md) | 프런트매터 스키마와 글 작성 규칙 |
| [DEPLOY.md](DEPLOY.md) | GitHub Pages·컨테이너 배포, PWA/캐시 정책, 보안 헤더, 복구 절차 |
| [SECURITY.md](SECURITY.md) | 의존성 검토 상태와 배포 구조 기준 보안 평가 |

## 서드파티 자산

Pretendard 와 Geist Mono 는 `public/fonts/` 에 직접 두고 서빙합니다. Google Fonts 나 CDN 을 거치지 않습니다. KaTeX 스타일시트와 폰트도 `public/katex/` 에 있으며, 각 라이선스 파일을 함께 보관합니다.
