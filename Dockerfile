# syntax=docker/dockerfile:1

# ── 빌드 ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# NEXT_PUBLIC_* 는 빌드 시점에 번들에 박힌다. 런타임 환경변수로는 바꿀 수 없으므로
# 값을 바꾸려면 이미지를 다시 빌드해야 한다.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GISCUS_REPO
ARG NEXT_PUBLIC_GISCUS_REPO_ID
ARG NEXT_PUBLIC_GISCUS_CATEGORY
ARG NEXT_PUBLIC_GISCUS_CATEGORY_ID
ARG NEXT_PUBLIC_GISCUS_MAPPING
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GISCUS_REPO=$NEXT_PUBLIC_GISCUS_REPO \
    NEXT_PUBLIC_GISCUS_REPO_ID=$NEXT_PUBLIC_GISCUS_REPO_ID \
    NEXT_PUBLIC_GISCUS_CATEGORY=$NEXT_PUBLIC_GISCUS_CATEGORY \
    NEXT_PUBLIC_GISCUS_CATEGORY_ID=$NEXT_PUBLIC_GISCUS_CATEGORY_ID \
    NEXT_PUBLIC_GISCUS_MAPPING=$NEXT_PUBLIC_GISCUS_MAPPING \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

WORKDIR /app

RUN corepack enable

# package.json 의 packageManager 필드에서 pnpm 버전을 읽는다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── 서빙 ───────────────────────────────────────────────────────
FROM nginx:1.31-alpine AS runner

# 이미지 기본 서버 블록(80 포트)을 덮어쓴다.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
