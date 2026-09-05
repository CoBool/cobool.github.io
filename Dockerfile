# syntax=docker/dockerfile:1

# ── 빌드 ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

# package.json 의 packageManager 필드에서 pnpm 버전을 읽는다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# next build 가 .env 파일을 알아서 읽으므로 변수를 하나씩 나열하지 않는다.
# .env.production.local 은 우선순위가 가장 높아 다른 .env 파일에 가려지지 않는다.
# secret 마운트라 빌드 중에만 존재하고 이미지 레이어에도 빌드 캐시에도 남지 않는다.
# NEXT_PUBLIC_SITE_URL 을 포함한 env secret이 필요하다. 누락하면 빌드가 실패한다.
#
#   docker build --secret id=env,src=.env.local -t true-log .
RUN --mount=type=secret,id=env,target=/app/.env.production.local \
    pnpm build

# ── 서빙 ───────────────────────────────────────────────────────
FROM nginx:1.31-alpine AS runner

# 이미지 기본 서버 블록(80 포트)을 덮어쓴다.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
